const express = require('express');
const router = express.Router();
const {
  createRequest,
  respondToRequest,
  withdrawRequest
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');

router.post('/:orderId', protect, createRequest);
router.patch('/:requestId/respond', protect, respondToRequest);
router.patch('/:requestId/withdraw', protect, withdrawRequest);

module.exports = router;
