const { getPersonalizedRecommendations } = require('../services/recommendationEngine');

// @desc    Get personalized order recommendations for current user
// @route   GET /api/recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const data = await getPersonalizedRecommendations(req.user);
    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
