const express = require('express');
const router = express.Router();
const { getFieldworkAnalysis } = require('../controllers/csvController');
const { protect } = require('../middleware/auth');

router.get('/fieldwork-analysis', protect, getFieldworkAnalysis);

module.exports = router;
