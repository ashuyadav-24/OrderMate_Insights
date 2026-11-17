const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Order = require('../models/Order');
const User = require('../models/User');

const setupSockets = (io) => {
  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'ordermate_secure_development_secret_key_123'
      );

      const user = await User.findById(decoded.id).select('name hostel email');
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Socket authentication failed: ' + err.message));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.user.name} (${socket.user.hostel}) - Socket ID: ${socket.id}`);

    // Join an authorized order chatroom
    socket.on('join_order_room', async ({ orderId }) => {
      try {
        const order = await Order.findById(orderId);
        if (!order) {
          return socket.emit('error', { message: 'Order not found' });
        }

        const isCreator = order.creator.toString() === socket.user._id.toString();
        const isAccepted = order.acceptedParticipants.some(
          (p) => (p.user?._id || p.user).toString() === socket.user._id.toString()
        );

        if (!isCreator && !isAccepted) {
          return socket.emit('error', { message: 'Unauthorized access to this order room' });
        }

        const roomName = `order_${orderId}`;
        socket.join(roomName);
        console.log(`[Socket] ${socket.user.name} joined room: ${roomName}`);

        // Notify room of presence
        socket.to(roomName).emit('user_online', {
          userId: socket.user._id,
          name: socket.user.name,
          hostel: socket.user.hostel
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Leave order chatroom
    socket.on('leave_order_room', ({ orderId }) => {
      const roomName = `order_${orderId}`;
      socket.leave(roomName);
      socket.to(roomName).emit('user_offline', { userId: socket.user._id });
    });

    // Real-time message sent from client
    socket.on('send_message', async ({ orderId, content }) => {
      try {
        if (!content || !content.trim()) return;

        const order = await Order.findById(orderId);
        if (!order) return;

        const isCreator = order.creator.toString() === socket.user._id.toString();
        const isAccepted = order.acceptedParticipants.some(
          (p) => (p.user?._id || p.user).toString() === socket.user._id.toString()
        );

        if (!isCreator && !isAccepted) {
          return socket.emit('error', { message: 'Unauthorized to post messages' });
        }

        const msg = await Message.create({
          order: order._id,
          sender: socket.user._id,
          senderName: socket.user.name,
          senderHostel: socket.user.hostel,
          content: content.trim(),
          isSystem: false
        });

        const populated = await Message.findById(msg._id).populate('sender', 'name hostel avatar');

        const roomName = `order_${orderId}`;
        io.to(roomName).emit('new_message', populated);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Typing indicators
    socket.on('typing', ({ orderId }) => {
      socket.to(`order_${orderId}`).emit('user_typing', {
        userId: socket.user._id,
        name: socket.user.name
      });
    });

    socket.on('stop_typing', ({ orderId }) => {
      socket.to(`order_${orderId}`).emit('user_stop_typing', {
        userId: socket.user._id
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.user?.name || socket.id}`);
    });
  });
};

module.exports = setupSockets;
