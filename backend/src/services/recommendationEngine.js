const Order = require('../models/Order');
const SavingsRecord = require('../models/SavingsRecord');
const { HOSTEL_CONFIG, getDistanceMeters } = require('../config/hostels');

/**
 * Calculates personalized order recommendations for a given user
 */
const getPersonalizedRecommendations = async (user) => {
  const userId = user._id;
  const userHostel = user.hostel;
  const userCoords = HOSTEL_CONFIG.COORDINATES[userHostel] || null;

  // 1. Analyze user's past history from completed / placed orders & savings
  const pastRecords = await SavingsRecord.find({ user: userId });
  const pastOrdersCreated = await Order.find({ creator: userId, status: { $in: ['PLACED', 'COMPLETED'] } });

  // Extract platform frequencies
  const platformCounts = {};
  pastRecords.forEach((r) => {
    platformCounts[r.platform] = (platformCounts[r.platform] || 0) + 1;
  });
  pastOrdersCreated.forEach((o) => {
    platformCounts[o.platform] = (platformCounts[o.platform] || 0) + 1;
  });

  // Calculate top favorite platform
  let favoritePlatform = null;
  let maxPlatCount = 0;
  Object.keys(platformCounts).forEach((plat) => {
    if (platformCounts[plat] > maxPlatCount) {
      maxPlatCount = platformCounts[plat];
      favoritePlatform = plat;
    }
  });

  // Calculate average spending range
  const totalSpends = pastRecords.map((r) => r.actualSpend).filter((s) => s > 0);
  const avgSpend = totalSpends.length > 0
    ? totalSpends.reduce((a, b) => a + b, 0) / totalSpends.length
    : 100;

  const isColdStart = pastRecords.length === 0 && pastOrdersCreated.length === 0;

  // 2. Fetch all currently ACTIVE orders (excluding own orders)
  const activeOrders = await Order.find({
    status: 'ACTIVE',
    expiresAt: { $gt: new Date() },
    creator: { $ne: userId }
  })
    .populate('creator', 'name hostel room avatar')
    .populate('acceptedParticipants.user', 'name hostel')
    .lean();

  // 3. Score each active order
  const scoredOrders = activeOrders.map((order) => {
    let score = 0;
    const reasons = [];

    // Factor A: Hostel Proximity (Max 35 pts)
    const isSameHostel = order.hostel === userHostel;
    let distanceMeters = null;
    const orderCoords = order.coordinates || HOSTEL_CONFIG.COORDINATES[order.hostel];

    if (userCoords && orderCoords) {
      distanceMeters = getDistanceMeters(userCoords, orderCoords);
    }

    if (isSameHostel) {
      score += 35;
      reasons.push(`Same hostel (Hostel ${userHostel})`);
    } else if (distanceMeters !== null && distanceMeters <= 300) {
      score += 25;
      reasons.push(`Nearby hostel (${distanceMeters}m away)`);
    } else {
      score += 10;
    }

    // Factor B: Platform Match (Max 35 pts)
    if (!isColdStart && favoritePlatform && order.platform === favoritePlatform) {
      score += 35;
      reasons.push(`Matches your most frequent platform (${order.platform})`);
    } else if (isColdStart) {
      score += 20; // Default baseline for popular platforms
      reasons.push(`Popular campus choice (${order.platform})`);
    } else if (platformCounts[order.platform]) {
      score += 20;
      reasons.push(`Previously ordered on ${order.platform}`);
    } else {
      score += 10;
    }

    // Factor C: Target Cart Compatibility (Max 15 pts)
    // If remaining needed amount is within ~1.5x of user's typical spend
    const targetDiff = Math.abs(order.targetAmountNeeded - avgSpend);
    if (targetDiff <= 50) {
      score += 15;
      reasons.push(`Target cart (₹${order.targetAmountNeeded}) matches your usual order size`);
    } else {
      score += 8;
    }

    // Factor D: Timing & Urgency (Max 15 pts)
    const remainingMinutes = Math.floor((new Date(order.expiresAt) - new Date()) / 60000);
    if (remainingMinutes > 10 && remainingMinutes <= 45) {
      score += 15;
      reasons.push(`Active window: ${remainingMinutes} mins left to coordinate`);
    } else {
      score += 10;
    }

    // Cap score at 100
    const finalScore = Math.min(100, score);

    return {
      ...order,
      recommendationScore: finalScore,
      isSameHostel,
      distanceMeters,
      reasons,
      primaryReason: reasons[0] || 'Compatible campus order'
    };
  });

  // Sort descending by recommendationScore
  scoredOrders.sort((a, b) => b.recommendationScore - a.recommendationScore);

  return {
    isColdStart,
    userProfile: {
      hostel: userHostel,
      favoritePlatform: favoritePlatform || 'None yet (new user)',
      typicalSpend: Math.round(avgSpend)
    },
    recommendations: scoredOrders
  };
};

module.exports = {
  getPersonalizedRecommendations
};
