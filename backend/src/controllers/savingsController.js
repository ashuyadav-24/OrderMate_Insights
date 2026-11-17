const SavingsRecord = require('../models/SavingsRecord');
const User = require('../models/User');

// @desc    Get user's personal savings dashboard stats
// @route   GET /api/savings/my-summary
exports.getMySavings = async (req, res) => {
  try {
    const records = await SavingsRecord.find({
      user: req.user._id,
      status: 'CONFIRMED'
    })
      .populate('order', 'orderCode platform status createdAt')
      .sort('-createdAt');

    const totalConfirmedSavings = records.reduce((acc, r) => acc + (r.confirmedSavings || 0), 0);
    const totalChargesAvoided = records.reduce((acc, r) => acc + (r.individualChargesAvoided || 0), 0);
    const totalCombinedChargesPaid = records.reduce((acc, r) => acc + (r.individualShareOfCombinedCharges || 0), 0);
    const totalUnnecessarySpendAvoided = records.reduce((acc, r) => acc + (r.unnecessarySpendAvoided || 0), 0);

    const platformSavings = {
      'Blinkit': 0,
      'Zepto': 0,
      'Swiggy Instamart': 0,
      'Flipkart Minutes': 0,
      'Other': 0
    };

    records.forEach((r) => {
      const plat = platformSavings[r.platform] !== undefined ? r.platform : 'Other';
      platformSavings[plat] += r.confirmedSavings || 0;
    });

    const completedOrdersCount = records.length;
    const avgSavingsPerOrder = completedOrdersCount > 0
      ? Math.round((totalConfirmedSavings / completedOrdersCount) * 100) / 100
      : 0;

    return res.json({
      success: true,
      data: {
        totalConfirmedSavings,
        totalChargesAvoided,
        totalCombinedChargesPaid,
        totalUnnecessarySpendAvoided,
        completedOrdersCount,
        avgSavingsPerOrder,
        platformSavings,
        history: records
      }
    });
  } catch (error) {
    console.error('Error fetching savings:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
