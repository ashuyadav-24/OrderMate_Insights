const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema(
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
    items: {
      type: String,
      required: [true, 'Please mention products you want to purchase'],
      trim: true
    },
    estimatedAmount: {
      type: Number,
      required: [true, 'Please enter estimated spending amount'],
      min: 1
    },
    note: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
      default: 'PENDING',
      index: true
    },
    decisionAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Prevent duplicate pending requests for the same order by the same user
joinRequestSchema.index({ order: 1, user: 1 }, { unique: false });

module.exports = mongoose.model('JoinRequest', joinRequestSchema);
