const express = require('express');
const router = express.Router();
const { getFieldworkAnalysis } = require('../controllers/csvController');

// Fieldwork analysis dataset endpoint (publicly available for research & analytics)
router.get('/fieldwork-analysis', getFieldworkAnalysis);

module.exports = router;
