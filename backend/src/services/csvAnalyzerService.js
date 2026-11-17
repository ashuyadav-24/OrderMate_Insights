const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const CSV_FILE_PATH = path.join(__dirname, '../../../data/data.csv');

/**
 * Parses and analyzes the genuine fieldwork data.csv
 */
const analyzeFieldworkCsv = () => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CSV_FILE_PATH)) {
      return reject(new Error(`Fieldwork data.csv not found at ${CSV_FILE_PATH}`));
    }

    const records = [];

    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on('data', (row) => {
        records.push({
          orderId: row.order_id,
          studentName: row.student_name,
          degreeYear: row.degree_year,
          hostel: row.hostel,
          block: row.block,
          room: row.room,
          platform: row.platform,
          timestamp: row.timestamp,
          itemsNeeded: row.items_needed,
          baseCartValue: parseFloat(row.base_cart_value) || 0,
          strategy: row.strategy,
          extraItemsAdded: row.extra_items_added,
          extraSpendOnUnneededItems: parseFloat(row.extra_spend_on_unneeded_items) || 0,
          deliveryFee: parseFloat(row.delivery_fee) || 0,
          smallCartFee: parseFloat(row.small_cart_fee) || 0,
          handlingFee: parseFloat(row.handling_fee) || 0,
          surgeFee: parseFloat(row.surge_fee) || 0,
          totalChargesPaid: parseFloat(row.total_charges_paid) || 0,
          totalPaid: parseFloat(row.total_paid) || 0,
          avoidableLoss: parseFloat(row.avoidable_loss) || 0
        });
      })
      .on('end', () => {
        try {
          const totalRecords = records.length;

          // 1. Strategies Breakdown
          const paidChargesGroup = records.filter((r) => r.strategy === 'PAID_CHARGES');
          const addedUnneededGroup = records.filter((r) => r.strategy === 'ADDED_UNNECESSARY_ITEMS');

          const totalPaidCharges = paidChargesGroup.reduce((acc, r) => acc + r.totalChargesPaid, 0);
          const totalExtraSpendUnneeded = addedUnneededGroup.reduce((acc, r) => acc + r.extraSpendOnUnneededItems, 0);
          const totalAvoidableLoss = records.reduce((acc, r) => acc + r.avoidableLoss, 0);

          const avgBaseCartValue = totalRecords > 0
            ? Math.round((records.reduce((acc, r) => acc + r.baseCartValue, 0) / totalRecords) * 100) / 100
            : 0;

          const avgFeeWhenPayingCharges = paidChargesGroup.length > 0
            ? Math.round((totalPaidCharges / paidChargesGroup.length) * 100) / 100
            : 0;

          const avgUnneededSpend = addedUnneededGroup.length > 0
            ? Math.round((totalExtraSpendUnneeded / addedUnneededGroup.length) * 100) / 100
            : 0;

          // 2. Platform Breakdown
          const platformStats = {};
          records.forEach((r) => {
            if (!platformStats[r.platform]) {
              platformStats[r.platform] = {
                ordersCount: 0,
                totalAvoidableLoss: 0,
                totalChargesPaid: 0,
                totalUnneededSpend: 0,
                baseCartSum: 0
              };
            }
            platformStats[r.platform].ordersCount += 1;
            platformStats[r.platform].totalAvoidableLoss += r.avoidableLoss;
            platformStats[r.platform].totalChargesPaid += r.totalChargesPaid;
            platformStats[r.platform].totalUnneededSpend += r.extraSpendOnUnneededItems;
            platformStats[r.platform].baseCartSum += r.baseCartValue;
          });

          const platformsSummary = Object.keys(platformStats).map((plat) => {
            const count = platformStats[plat].ordersCount;
            return {
              platform: plat,
              ordersCount: count,
              totalAvoidableLoss: platformStats[plat].totalAvoidableLoss,
              avgBaseCart: Math.round((platformStats[plat].baseCartSum / count) * 100) / 100,
              avgAvoidableLoss: Math.round((platformStats[plat].totalAvoidableLoss / count) * 100) / 100
            };
          });

          // 3. Hostel Breakdown
          const hostelStats = {};
          records.forEach((r) => {
            if (!hostelStats[r.hostel]) {
              hostelStats[r.hostel] = { count: 0, totalLoss: 0 };
            }
            hostelStats[r.hostel].count += 1;
            hostelStats[r.hostel].totalLoss += r.avoidableLoss;
          });

          const hostelsSummary = Object.keys(hostelStats).map((h) => ({
            hostel: h,
            ordersCount: hostelStats[h].count,
            totalAvoidableLoss: hostelStats[h].totalLoss,
            avgLossPerOrder: Math.round((hostelStats[h].totalLoss / hostelStats[h].count) * 100) / 100
          }));

          // 4. Potential OrderMate Grouping Impact Simulation
          // If every 2 adjacent hostel orders in the same time window combined carts:
          // Combined delivery charges ~ ₹10 total (₹5 per person), 0 small cart fees, 0 unneeded spend.
          const simulatedGroupChargesPaid = totalRecords * 5; // ₹5 fair share per student
          const projectedNetSavingsThroughOrderMate = totalAvoidableLoss - simulatedGroupChargesPaid;

          resolve({
            metadata: {
              source: 'Assignment Fieldwork (data/data.csv)',
              verifiedEntries: totalRecords,
              timeWindow: '16 Nov 23:10 to 17 Nov 00:50 (Late-night quick-commerce peak)',
              hostelsSurveyed: Object.keys(hostelStats)
            },
            summary: {
              totalStudentsSurveyed: totalRecords,
              avgBaseCartValue,
              totalAvoidableLoss,
              avgAvoidableLossPerStudent: Math.round((totalAvoidableLoss / totalRecords) * 100) / 100,
              strategies: {
                paidChargesCount: paidChargesGroup.length,
                paidChargesPercentage: Math.round((paidChargesGroup.length / totalRecords) * 100),
                totalFeesPaid: totalPaidCharges,
                avgFeePaid: avgFeeWhenPayingCharges,
                addedUnneededItemsCount: addedUnneededGroup.length,
                addedUnneededPercentage: Math.round((addedUnneededGroup.length / totalRecords) * 100),
                totalUnneededSpend: totalExtraSpendUnneeded,
                avgUnneededSpend
              },
              projectedImpact: {
                simulatedGroupChargesPaid,
                projectedNetSavingsThroughOrderMate,
                projectedSavingsPercentage: Math.round((projectedNetSavingsThroughOrderMate / totalAvoidableLoss) * 100)
              }
            },
            platformsSummary,
            hostelsSummary,
            rawRecords: records,
            limitations: [
              'Geographic scope is limited to 3 boys hostels (Hostel J, K, L) during late night hours (23:10 - 00:50).',
              'Assumes students are comfortable coordinating deliveries at the hostel gate.',
              'Items added to avoid fees are based on self-reported intent by students immediately post-purchase.',
              'Does not account for rare platform promotions or occasional dynamic surge fluctuations.'
            ]
          });
        } catch (err) {
          reject(err);
        }
      })
      .on('error', (err) => reject(err));
  });
};

module.exports = {
  analyzeFieldworkCsv,
  CSV_FILE_PATH
};
