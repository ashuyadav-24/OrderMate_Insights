const Order = require('../models/Order');
const User = require('../models/User');
const JoinRequest = require('../models/JoinRequest');
const SavingsRecord = require('../models/SavingsRecord');
const { HOSTEL_CONFIG, getDistanceMeters } = require('../config/hostels');

// Automatically expire overdue active orders
const autoExpireOrders = async () => {
  const now = new Date();
  await Order.updateMany(
    { status: 'ACTIVE', expiresAt: { $lte: now } },
    { $set: { status: 'EXPIRED' } }
  );
};

// @desc    Create a new group order invitation
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const {
      platform,
      targetAmountNeeded,
      plannedOrderTime,
      visibilityDurationMinutes,
      coordinates,
      notes
    } = req.body;

    if (!platform || !targetAmountNeeded || !plannedOrderTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide platform, target amount needed, and planned order time'
      });
    }

    const duration = parseInt(visibilityDurationMinutes, 10) || 50;
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    const userHostel = req.user.hostel;
    const defaultCoords = HOSTEL_CONFIG.COORDINATES[userHostel] || null;

    const order = await Order.create({
      creator: req.user._id,
      platform,
      targetAmountNeeded: Number(targetAmountNeeded),
      plannedOrderTime,
      visibilityDurationMinutes: duration,
      expiresAt,
      hostelCategory: req.user.hostelCategory,
      hostel: userHostel,
      block: req.user.block || '',
      room: req.user.room || '',
      coordinates: coordinates || defaultCoords,
      notes: notes || '',
      status: 'ACTIVE'
    });

    // Increment user's created orders count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.ordersCreated': 1 }
    });

    const populatedOrder = await Order.findById(order._id).populate('creator', 'name hostel room avatar');

    return res.status(201).json({
      success: true,
      message: 'Order invitation published successfully!',
      data: populatedOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get active orders with hostel-first and location priority
// @route   GET /api/orders/active
exports.getActiveOrders = async (req, res) => {
  try {
    // Run backend expiration check
    await autoExpireOrders();

    const { platform, hostel, sameHostelOnly, search } = req.query;
    const currentUserHostel = req.user.hostel;
    const userCoords = HOSTEL_CONFIG.COORDINATES[currentUserHostel] || null;

    const query = {
      status: 'ACTIVE',
      expiresAt: { $gt: new Date() }
    };

    if (platform) {
      query.platform = platform;
    }

    if (hostel) {
      query.hostel = hostel;
    }

    if (sameHostelOnly === 'true') {
      query.hostel = currentUserHostel;
    }

    let orders = await Order.find(query)
      .populate('creator', 'name email hostel block room avatar')
      .populate('acceptedParticipants.user', 'name hostel avatar')
      .lean();

    // Text search filter if provided
    if (search) {
      const term = search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.orderCode.toLowerCase().includes(term) ||
          o.platform.toLowerCase().includes(term) ||
          o.hostel.toLowerCase().includes(term) ||
          o.creator.name.toLowerCase().includes(term)
      );
    }

    // Calculate distance and priority sort
    orders = orders.map((order) => {
      let distanceMeters = null;
      const orderCoords = order.coordinates || HOSTEL_CONFIG.COORDINATES[order.hostel];
      if (userCoords && orderCoords) {
        distanceMeters = getDistanceMeters(userCoords, orderCoords);
      }

      const isSameHostel = order.hostel === currentUserHostel;
      const remainingSeconds = Math.max(0, Math.floor((new Date(order.expiresAt) - new Date()) / 1000));

      return {
        ...order,
        isSameHostel,
        distanceMeters,
        remainingSeconds
      };
    });

    // Priority Sorting:
    // 1. Same hostel first (isSameHostel: true)
    // 2. Closer distance meters
    // 3. Closer planned order expiry
    orders.sort((a, b) => {
      if (a.isSameHostel && !b.isSameHostel) return -1;
      if (!a.isSameHostel && b.isSameHostel) return 1;

      // Both same or both different: compare distance if available
      if (a.distanceMeters !== null && b.distanceMeters !== null) {
        if (a.distanceMeters !== b.distanceMeters) {
          return a.distanceMeters - b.distanceMeters;
        }
      }

      // Fallback: earliest expiration
      return new Date(a.expiresAt) - new Date(b.expiresAt);
    });

    return res.json({
      success: true,
      count: orders.length,
      userHostel: currentUserHostel,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching active orders:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    await autoExpireOrders();

    const order = await Order.findById(req.params.id)
      .populate('creator', 'name email hostel block room avatar')
      .populate('acceptedParticipants.user', 'name hostel block room avatar');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isCreator = order.creator._id.toString() === req.user._id.toString();
    const isAcceptedParticipant = order.acceptedParticipants.some(
      (p) => p.user && p.user._id.toString() === req.user._id.toString()
    );

    let joinRequests = [];
    if (isCreator) {
      joinRequests = await JoinRequest.find({ order: order._id })
        .populate('user', 'name hostel block room avatar')
        .sort('-createdAt');
    }

    return res.json({
      success: true,
      data: order,
      isCreator,
      isAcceptedParticipant,
      joinRequests
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (placed, cancelled, early close)
// @route   PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only creator can update status' });
    }

    if (!['ACTIVE', 'PLACED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    order.status = status;
    await order.save();

    return res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete order and confirm actual verified savings
// @route   POST /api/orders/:id/complete
exports.completeOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('acceptedParticipants.user');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only creator can finalize completion' });
    }

    if (order.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Order is already marked COMPLETED' });
    }

    const {
      actualChargesPaid = 0,
      participantDetails = [], // Array of { userId, actualSpend, chargesAvoided, unnecessarySpendAvoided }
      creatorSpend = 0,
      creatorChargesAvoided = 0,
      creatorUnnecessarySpendAvoided = 0
    } = req.body;

    // Total participants count = creator + accepted participants
    const totalMembers = 1 + order.acceptedParticipants.length;
    const fairShareCharges = Math.round((Number(actualChargesPaid) / totalMembers) * 100) / 100;

    // 1. Process Creator Savings
    const creatorConfSavings = Math.max(0, Number(creatorChargesAvoided) - fairShareCharges);
    order.creatorCompletionData = {
      actualSpend: Number(creatorSpend),
      totalChargesAvoided: Number(creatorChargesAvoided),
      actualChargesPaid: fairShareCharges,
      confirmedSavings: creatorConfSavings,
      unnecessarySpendAvoided: Number(creatorUnnecessarySpendAvoided)
    };

    // Save Creator Savings Record
    await SavingsRecord.create({
      order: order._id,
      user: req.user._id,
      role: 'CREATOR',
      platform: order.platform,
      hostel: order.hostel,
      actualSpend: Number(creatorSpend),
      individualChargesAvoided: Number(creatorChargesAvoided),
      individualShareOfCombinedCharges: fairShareCharges,
      confirmedSavings: creatorConfSavings,
      unnecessarySpendAvoided: Number(creatorUnnecessarySpendAvoided),
      status: 'CONFIRMED'
    });

    // Update Creator User Stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        'stats.completedOrders': 1,
        'stats.totalConfirmedSavings': creatorConfSavings,
        [`stats.platformSavings.${order.platform}`]: creatorConfSavings
      }
    });

    // 2. Process Accepted Participants Savings
    for (const participant of order.acceptedParticipants) {
      const matchInput = participantDetails.find(
        (p) => p.userId.toString() === participant.user._id.toString()
      );

      const actualSpend = matchInput ? Number(matchInput.actualSpend) : participant.expectedAmount;
      const chargesAvoided = matchInput ? Number(matchInput.chargesAvoided) : 45; // standard base avoided
      const unnecessaryAvoided = matchInput ? Number(matchInput.unnecessarySpendAvoided || 0) : 0;
      const confirmedSavings = Math.max(0, chargesAvoided - fairShareCharges);

      participant.actualSpend = actualSpend;
      participant.chargesAvoided = chargesAvoided;
      participant.individualShareOfCharges = fairShareCharges;
      participant.confirmedSavings = confirmedSavings;
      participant.unnecessarySpendAvoided = unnecessaryAvoided;

      await SavingsRecord.create({
        order: order._id,
        user: participant.user._id,
        role: 'JOINER',
        platform: order.platform,
        hostel: participant.user.hostel,
        actualSpend,
        individualChargesAvoided: chargesAvoided,
        individualShareOfCombinedCharges: fairShareCharges,
        confirmedSavings,
        unnecessarySpendAvoided: unnecessaryAvoided,
        status: 'CONFIRMED'
      });

      await User.findByIdAndUpdate(participant.user._id, {
        $inc: {
          'stats.completedOrders': 1,
          'stats.totalConfirmedSavings': confirmedSavings,
          [`stats.platformSavings.${order.platform}`]: confirmedSavings
        }
      });
    }

    order.status = 'COMPLETED';
    await order.save();

    return res.json({
      success: true,
      message: 'Order completed and confirmed savings recorded!',
      data: order
    });
  } catch (error) {
    console.error('Error completing order:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's created and joined orders
// @route   GET /api/orders/user/my-orders
exports.getMyOrders = async (req, res) => {
  try {
    await autoExpireOrders();

    const createdOrders = await Order.find({ creator: req.user._id })
      .populate('creator', 'name hostel room avatar')
      .populate('acceptedParticipants.user', 'name hostel avatar')
      .sort('-createdAt');

    const joinedOrders = await Order.find({
      'acceptedParticipants.user': req.user._id
    })
      .populate('creator', 'name hostel room avatar')
      .populate('acceptedParticipants.user', 'name hostel avatar')
      .sort('-createdAt');

    return res.json({
      success: true,
      data: {
        createdOrders,
        joinedOrders
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
