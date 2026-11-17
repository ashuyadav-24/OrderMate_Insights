const express = require('express');
const router = express.Router();
const { getAnalyzerMetrics, exportAnalyzerCsv } = require('../controllers/analyzerController');
const { protect } = require('../middleware/auth');

router.get('/metrics', protect, getAnalyzerMetrics);
router.get('/export-csv', protect, exportAnalyzerCsv);

module.exports = router;
