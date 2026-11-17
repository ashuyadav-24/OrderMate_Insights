const express = require('express');
const router = express.Router();
const {
  createOrder,
  getActiveOrders,
  getOrderById,
  updateOrderStatus,
  completeOrder,
  getMyOrders
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/active', protect, getActiveOrders);
router.get('/user/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id/status', protect, updateOrderStatus);
router.post('/:id/complete', protect, completeOrder);

module.exports = router;
