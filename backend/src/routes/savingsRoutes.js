const express = require('express');
const router = express.Router();
const { getMySavings } = require('../controllers/savingsController');
const { protect } = require('../middleware/auth');

router.get('/my-summary', protect, getMySavings);

module.exports = router;
