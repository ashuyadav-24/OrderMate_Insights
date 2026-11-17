const JoinRequest = require('../models/JoinRequest');
const Order = require('../models/Order');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Message = require('../models/Message');

// @desc    Submit a join request
// @route   POST /api/requests/:orderId
exports.createRequest = async (req, res) => {
  try {
    const { items, estimatedAmount, note } = req.body;
    const { orderId } = req.params;

    if (!items || !estimatedAmount) {
      return res.status(400).json({
        success: false,
        message: 'Please mention products and your estimated spending amount'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'ACTIVE' || new Date() > order.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'This order is no longer accepting join requests'
      });
    }

    // Disallow self-joining
    if (order.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot join your own order invitation'
      });
    }

    // Check for existing pending or accepted request
    const existingReq = await JoinRequest.findOne({
      order: orderId,
      user: req.user._id,
      status: { $in: ['PENDING', 'ACCEPTED'] }
    });

    if (existingReq) {
      return res.status(400).json({
        success: false,
        message: `You already have a ${existingReq.status.toLowerCase()} request for this order`
      });
    }

    const joinRequest = await JoinRequest.create({
      order: orderId,
      user: req.user._id,
      items,
      estimatedAmount: Number(estimatedAmount),
      note: note || '',
      status: 'PENDING'
    });

    // Notify order creator
    await Notification.create({
      recipient: order.creator,
      title: 'New Join Request Received',
      message: `${req.user.name} from Hostel ${req.user.hostel} requested to join your ${order.platform} order (₹${estimatedAmount})`,
      type: 'JOIN_REQUEST',
      order: order._id
    });

    const populated = await JoinRequest.findById(joinRequest._id).populate('user', 'name hostel room avatar');

    return res.status(201).json({
      success: true,
      message: 'Join request sent to the order creator!',
      data: populated
    });
  } catch (error) {
    console.error('Error submitting request:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept or reject join request
// @route   PATCH /api/requests/:requestId/respond
exports.respondToRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'ACCEPT' or 'REJECT'
    const { requestId } = req.params;

    if (!['ACCEPT', 'REJECT'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be ACCEPT or REJECT' });
    }

    const request = await JoinRequest.findById(requestId).populate('user');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const order = await Order.findById(request.order);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Associated order not found' });
    }

    if (order.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only order creator can respond to requests' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status.toLowerCase()}`
      });
    }

    if (action === 'ACCEPT') {
      request.status = 'ACCEPTED';
      request.decisionAt = new Date();
      await request.save();

      // Add to accepted participants in Order
      order.acceptedParticipants.push({
        user: request.user._id,
        items: request.items,
        expectedAmount: request.estimatedAmount
      });

      order.currentContributedAmount += request.estimatedAmount;
      await order.save();

      // Increment joiner user stats
      await User.findByIdAndUpdate(request.user._id, {
        $inc: { 'stats.ordersJoined': 1 }
      });

      // System announcement in order chatroom
      await Message.create({
        order: order._id,
        sender: null,
        isSystem: true,
        systemType: 'USER_JOINED',
        content: `🎉 ${request.user.name} from Hostel ${request.user.hostel} joined the order with ₹${request.estimatedAmount} estimated cart!`
      });

      // Notify joiner
      await Notification.create({
        recipient: request.user._id,
        title: 'Request Accepted!',
        message: `Great news! Your request to join ${order.platform} order (${order.orderCode}) was accepted. You can now chat and coordinate.`,
        type: 'REQUEST_ACCEPTED',
        order: order._id
      });

      return res.json({
        success: true,
        message: 'Join request accepted and added to order!',
        data: request
      });
    } else {
      request.status = 'REJECTED';
      request.decisionAt = new Date();
      await request.save();

      // Notify joiner
      await Notification.create({
        recipient: request.user._id,
        title: 'Join Request Update',
        message: `Your request to join ${order.platform} order (${order.orderCode}) was declined by the creator.`,
        type: 'REQUEST_REJECTED',
        order: order._id
      });

      return res.json({
        success: true,
        message: 'Join request rejected.',
        data: request
      });
    }
  } catch (error) {
    console.error('Error responding to request:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Withdraw pending request
// @route   PATCH /api/requests/:requestId/withdraw
exports.withdrawRequest = async (req, res) => {
  try {
    const request = await JoinRequest.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to withdraw this request' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw request with status ${request.status}`
      });
    }

    request.status = 'WITHDRAWN';
    await request.save();

    return res.json({
      success: true,
      message: 'Request withdrawn successfully',
      data: request
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
