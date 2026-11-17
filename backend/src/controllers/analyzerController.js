const Order = require('../models/Order');
const JoinRequest = require('../models/JoinRequest');
const SavingsRecord = require('../models/SavingsRecord');
const User = require('../models/User');

// @desc    Get comprehensive OrderMate Analyzer Impact Metrics (Source A: Live Application Orders)
// @route   GET /api/analyzer/metrics
exports.getAnalyzerMetrics = async (req, res) => {
  try {
    const { platform, hostel, startDate, endDate } = req.query;

    const orderFilter = {};
    const savingsFilter = { status: 'CONFIRMED' };

    if (platform && platform !== 'All') {
      orderFilter.platform = platform;
      savingsFilter.platform = platform;
    }
    if (hostel && hostel !== 'All') {
      orderFilter.hostel = hostel;
      savingsFilter.hostel = hostel;
    }
    if (startDate || endDate) {
      orderFilter.createdAt = {};
      savingsFilter.createdAt = {};
      if (startDate) {
        orderFilter.createdAt.$gte = new Date(startDate);
        savingsFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        orderFilter.createdAt.$lte = new Date(endDate);
        savingsFilter.createdAt.$lte = new Date(endDate);
      }
    }

    // 1. Order Status Counts
    const orderCounts = await Order.aggregate([
      { $match: orderFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    let totalCreated = 0;
    let completedOrders = 0;
    let activeOrders = 0;
    let expiredOrders = 0;
    let cancelledOrders = 0;
    let placedOrders = 0;

    orderCounts.forEach((item) => {
      totalCreated += item.count;
      if (item._id === 'COMPLETED') completedOrders = item.count;
      else if (item._id === 'ACTIVE') activeOrders = item.count;
      else if (item._id === 'EXPIRED') expiredOrders = item.count;
      else if (item._id === 'CANCELLED') cancelledOrders = item.count;
      else if (item._id === 'PLACED') placedOrders = item.count;
    });

    // 2. Savings and Participants Aggregation
    const savingsAgg = await SavingsRecord.aggregate([
      { $match: savingsFilter },
      {
        $group: {
          _id: null,
          totalConfirmedSavings: { $sum: '$confirmedSavings' },
          totalChargesAvoided: { $sum: '$individualChargesAvoided' },
          totalCombinedChargesPaid: { $sum: '$individualShareOfCombinedCharges' },
          totalUnnecessarySpendAvoided: { $sum: '$unnecessarySpendAvoided' },
          totalRecords: { $sum: 1 },
          positiveSavingsRecords: {
            $sum: { $cond: [{ $gt: ['$confirmedSavings', 0] }, 1, 0] }
          },
          allUsers: { $addToSet: '$user' },
          positiveUsers: {
            $addToSet: {
              $cond: [{ $gt: ['$confirmedSavings', 0] }, '$user', '$$REMOVE']
            }
          }
        }
      }
    ]);

    const sData = savingsAgg[0] || {
      totalConfirmedSavings: 0,
      totalChargesAvoided: 0,
      totalCombinedChargesPaid: 0,
      totalUnnecessarySpendAvoided: 0,
      totalRecords: 0,
      positiveSavingsRecords: 0,
      allUsers: [],
      positiveUsers: []
    };

    const totalUniqueStudentsServed = sData.allUsers.length;
    const uniqueStudentsHelpedWithSavings = sData.positiveUsers.length;
    const totalConfirmedSavings = sData.totalConfirmedSavings;

    const avgSavingsPerStudent = uniqueStudentsHelpedWithSavings > 0
      ? Math.round((totalConfirmedSavings / uniqueStudentsHelpedWithSavings) * 100) / 100
      : 0;

    const avgSavingsPerCompletedOrder = completedOrders > 0
      ? Math.round((totalConfirmedSavings / completedOrders) * 100) / 100
      : 0;

    // 3. Repeat Users Count (Students with >= 2 completed savings records)
    const repeatUsersAgg = await SavingsRecord.aggregate([
      { $match: savingsFilter },
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $match: { count: { $gte: 2 } } },
      { $count: 'repeatCount' }
    ]);
    const repeatUsers = repeatUsersAgg[0] ? repeatUsersAgg[0].repeatCount : 0;

    // 4. Join Request Acceptance Rate
    const joinReqAgg = await JoinRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    let acceptedReqs = 0;
    let rejectedReqs = 0;
    let pendingReqs = 0;
    let withdrawnReqs = 0;

    joinReqAgg.forEach((r) => {
      if (r._id === 'ACCEPTED') acceptedReqs = r.count;
      else if (r._id === 'REJECTED') rejectedReqs = r.count;
      else if (r._id === 'PENDING') pendingReqs = r.count;
      else if (r._id === 'WITHDRAWN') withdrawnReqs = r.count;
    });

    const decidedReqs = acceptedReqs + rejectedReqs;
    const joinAcceptanceRate = decidedReqs > 0
      ? Math.round((acceptedReqs / decidedReqs) * 1000) / 10
      : 0;

    // 5. Order Completion Rate (Completed / Eligible Decided Orders)
    const eligibleOrders = totalCreated - activeOrders;
    const completionRate = eligibleOrders > 0
      ? Math.round((completedOrders / eligibleOrders) * 1000) / 10
      : 0;

    // 6. Positive Savings Rate
    const positiveSavingsRate = sData.totalRecords > 0
      ? Math.round((sData.positiveSavingsRecords / sData.totalRecords) * 1000) / 10
      : 0;

    // 7. Platform-wise Breakdown
    const platforms = ['Blinkit', 'Zepto', 'Swiggy Instamart', 'Flipkart Minutes', 'Other'];
    const platformBreakdown = await Promise.all(
      platforms.map(async (plat) => {
        const platOrders = await Order.countDocuments({ ...orderFilter, platform: plat });
        const platCompleted = await Order.countDocuments({
          ...orderFilter,
          platform: plat,
          status: 'COMPLETED'
        });

        const platSavingsAgg = await SavingsRecord.aggregate([
          { $match: { ...savingsFilter, platform: plat } },
          {
            $group: {
              _id: null,
              confirmedSavings: { $sum: '$confirmedSavings' },
              users: { $addToSet: '$user' },
              count: { $sum: 1 }
            }
          }
        ]);

        const pSaved = platSavingsAgg[0] ? platSavingsAgg[0].confirmedSavings : 0;
        const pUsers = platSavingsAgg[0] ? platSavingsAgg[0].users.length : 0;
        const pCount = platSavingsAgg[0] ? platSavingsAgg[0].count : 0;

        return {
          platform: plat,
          ordersCreated: platOrders,
          completedOrders: platCompleted,
          uniqueStudents: pUsers,
          confirmedSavings: pSaved,
          avgSavingsPerParticipant: pCount > 0 ? Math.round((pSaved / pCount) * 100) / 100 : 0,
          completionRate: platOrders > 0 ? Math.round((platCompleted / platOrders) * 100) : 0
        };
      })
    );

    // 8. Hostel-wise Breakdown (Aggregated only, privacy preserved)
    const hostelBreakdown = await SavingsRecord.aggregate([
      { $match: savingsFilter },
      {
        $group: {
          _id: '$hostel',
          studentsServed: { $addToSet: '$user' },
          confirmedSavings: { $sum: '$confirmedSavings' },
          totalParticipations: { $sum: 1 }
        }
      },
      {
        $project: {
          hostel: '$_id',
          studentsServedCount: { $size: '$studentsServed' },
          confirmedSavings: 1,
          totalParticipations: 1
        }
      },
      { $sort: { confirmedSavings: -1 } }
    ]);

    // 9. Time-Based Analysis (Hours of Day)
    const timeBasedAgg = await Order.aggregate([
      { $match: orderFilter },
      {
        $project: {
          hour: { $hour: '$createdAt' },
          status: 1
        }
      },
      {
        $group: {
          _id: '$hour',
          ordersCount: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format 24 hour buckets
    const hourlyActivity = Array.from({ length: 24 }, (_, i) => {
      const match = timeBasedAgg.find((t) => t._id === i);
      return {
        hour: `${i.toString().padStart(2, '0')}:00`,
        ordersCreated: match ? match.ordersCount : 0,
        completedOrders: match ? match.completedCount : 0
      };
    });

    // 10. Effectiveness Evaluation & Formula
    let impactSummary = '';
    let isReliable = completedOrders >= 3;

    if (!isReliable) {
      impactSummary =
        'Not enough completed orders yet to measure impact reliably. Once students complete 3 or more group orders, statistical impact metrics will unlock.';
    } else {
      impactSummary = `OrderMate has supported ${totalUniqueStudentsServed} unique students across ${completedOrders} completed orders. Participants have collectively confirmed ₹${totalConfirmedSavings} in net savings. ${uniqueStudentsHelpedWithSavings} students achieved positive verified savings.`;
    }

    // Transparent Effectiveness Score (0 to 100)
    // Formula components:
    // - Completion Rate (weight 30%)
    // - Positive Savings Rate (weight 35%)
    // - Join Acceptance Rate (weight 20%)
    // - Repeat User Factor (weight 15%)
    const repeatRatio = totalUniqueStudentsServed > 0
      ? Math.min(1, repeatUsers / totalUniqueStudentsServed)
      : 0;

    const effectivenessScore = completedOrders > 0
      ? Math.round(
          (completionRate / 100) * 30 +
          (positiveSavingsRate / 100) * 35 +
          (joinAcceptanceRate / 100) * 20 +
          repeatRatio * 15
        )
      : 0;

    return res.json({
      success: true,
      data: {
        overview: {
          totalCreated,
          completedOrders,
          activeOrders,
          expiredOrders,
          cancelledOrders,
          placedOrders,
          totalUniqueStudentsServed,
          uniqueStudentsHelpedWithSavings,
          totalConfirmedSavings,
          avgSavingsPerStudent,
          avgSavingsPerCompletedOrder,
          repeatUsers,
          completionRate,
          joinAcceptanceRate,
          positiveSavingsRate,
          pendingRequestsCount: pendingReqs,
          acceptedRequestsCount: acceptedReqs,
          rejectedRequestsCount: rejectedReqs
        },
        savingsBreakdown: {
          totalConfirmedSavings,
          totalChargesAvoided: sData.totalChargesAvoided,
          totalCombinedChargesPaid: sData.totalCombinedChargesPaid,
          totalUnnecessarySpendAvoided: sData.totalUnnecessarySpendAvoided
        },
        platformBreakdown,
        hostelBreakdown,
        hourlyActivity,
        effectiveness: {
          isReliable,
          impactSummary,
          effectivenessScore,
          formulaExplanation:
            'Score = (Completion Rate × 30%) + (Positive Savings Rate × 35%) + (Join Acceptance Rate × 20%) + (Repeat Student Ratio × 15%)'
        }
      }
    });
  } catch (error) {
    console.error('Error calculating analyzer metrics:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export Analyzer summary as CSV
// @route   GET /api/analyzer/export-csv
exports.exportAnalyzerCsv = async (req, res) => {
  try {
    const records = await SavingsRecord.find({ status: 'CONFIRMED' })
      .populate('user', 'name hostel')
      .populate('order', 'orderCode platform status createdAt')
      .sort('-createdAt');

    let csvContent = 'Record_ID,Order_Code,Platform,Hostel,Role,Actual_Spend,Charges_Avoided,Combined_Share,Confirmed_Savings,Unnecessary_Spend_Avoided,Date\n';

    records.forEach((r) => {
      csvContent += `${r._id},${r.order?.orderCode || 'N/A'},${r.platform},${r.hostel},${r.role},${r.actualSpend},${r.individualChargesAvoided},${r.individualShareOfCombinedCharges},${r.confirmedSavings},${r.unnecessarySpendAvoided},${r.createdAt.toISOString()}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('ordermate_impact_report.csv');
    return res.send(csvContent);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
