const express = require('express');
const router = express.Router();
const { getOrderChat, postMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/:orderId', protect, getOrderChat);
router.post('/:orderId', protect, postMessage);

module.exports = router;
