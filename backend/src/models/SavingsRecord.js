const mongoose = require('mongoose');

const savingsRecordSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: ['CREATOR', 'JOINER'],
      required: true
    },
    platform: {
      type: String,
      required: true,
      index: true
    },
    hostel: {
      type: String,
      required: true,
      index: true
    },
    estimatedSavings: {
      type: Number,
      default: 0
    },
    actualSpend: {
      type: Number,
      default: 0
    },
    individualChargesAvoided: {
      type: Number,
      default: 0
    },
    individualShareOfCombinedCharges: {
      type: Number,
      default: 0
    },
    confirmedSavings: {
      type: Number,
      default: 0
    },
    unnecessarySpendAvoided: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['ESTIMATED', 'CONFIRMED'],
      default: 'ESTIMATED',
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavingsRecord', savingsRecordSchema);
