const Message = require('../models/Message');
const Order = require('../models/Order');

// Helper to check user membership in order
const verifyOrderAccess = (order, userId) => {
  const isCreator = order.creator.toString() === userId.toString();
  const isAccepted = order.acceptedParticipants.some(
    (p) => p.user && (p.user._id || p.user).toString() === userId.toString()
  );
  return isCreator || isAccepted;
};

// @desc    Get order chatroom metadata & message history
// @route   GET /api/chats/:orderId
exports.getOrderChat = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('creator', 'name hostel room avatar')
      .populate('acceptedParticipants.user', 'name hostel room avatar');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!verifyOrderAccess(order, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You must be an accepted participant or the creator to view this chatroom'
      });
    }

    const messages = await Message.find({ order: order._id })
      .populate('sender', 'name hostel avatar')
      .sort('createdAt');

    return res.json({
      success: true,
      data: {
        order: {
          _id: order._id,
          orderCode: order.orderCode,
          platform: order.platform,
          status: order.status,
          targetAmountNeeded: order.targetAmountNeeded,
          currentContributedAmount: order.currentContributedAmount,
          plannedOrderTime: order.plannedOrderTime,
          expiresAt: order.expiresAt,
          creator: order.creator,
          acceptedParticipants: order.acceptedParticipants
        },
        messages
      }
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Post a message to an order chatroom
// @route   POST /api/chats/:orderId
exports.postMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!verifyOrderAccess(order, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot send messages in this order chatroom'
      });
    }

    const message = await Message.create({
      order: order._id,
      sender: req.user._id,
      senderName: req.user.name,
      senderHostel: req.user.hostel,
      content: content.trim(),
      isSystem: false
    });

    const populated = await Message.findById(message._id).populate('sender', 'name hostel avatar');

    return res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
