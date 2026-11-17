const { analyzeFieldworkCsv } = require('../services/csvAnalyzerService');

// @desc    Get real-world assignment fieldwork dataset analysis (Source B: data.csv)
// @route   GET /api/csv/fieldwork-analysis
exports.getFieldworkAnalysis = async (req, res) => {
  try {
    const analysis = await analyzeFieldworkCsv();
    return res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error analyzing fieldwork CSV:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process fieldwork CSV'
    });
  }
};
