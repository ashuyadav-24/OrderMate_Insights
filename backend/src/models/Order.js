const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      unique: true,
      index: true
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    platform: {
      type: String,
      required: [true, 'Please select platform'],
      enum: ['Blinkit', 'Zepto', 'Swiggy Instamart', 'Flipkart Minutes', 'Other']
    },
    targetAmountNeeded: {
      type: Number,
      required: [true, 'Please enter amount needed to reach delivery threshold'],
      min: 1
    },
    currentContributedAmount: {
      type: Number,
      default: 0
    },
    hostelCategory: {
      type: String,
      required: true,
      enum: ['Boys Hostel', 'Girls Hostel']
    },
    hostel: {
      type: String,
      required: true,
      index: true
    },
    block: {
      type: String,
      default: ''
    },
    room: {
      type: String,
      default: ''
    },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },
    plannedOrderTime: {
      type: String,
      required: [true, 'Please select planned ordering time']
    },
    visibilityDurationMinutes: {
      type: Number,
      required: [true, 'Please select visibility duration'],
      default: 50
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PLACED', 'COMPLETED', 'EXPIRED', 'CANCELLED'],
      default: 'ACTIVE',
      index: true
    },
    acceptedParticipants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        items: { type: String, default: '' },
        expectedAmount: { type: Number, default: 0 },
        actualSpend: { type: Number, default: null },
        chargesAvoided: { type: Number, default: null },
        individualShareOfCharges: { type: Number, default: 0 },
        confirmedSavings: { type: Number, default: null },
        unnecessarySpendAvoided: { type: Number, default: 0 },
        joinedAt: { type: Date, default: Date.now }
      }
    ],
    creatorCompletionData: {
      actualSpend: { type: Number, default: null },
      totalChargesAvoided: { type: Number, default: null },
      actualChargesPaid: { type: Number, default: null },
      confirmedSavings: { type: Number, default: null },
      unnecessarySpendAvoided: { type: Number, default: 0 }
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Pre-save hook to generate unique human-readable orderCode
orderSchema.pre('validate', function (next) {
  if (!this.orderCode) {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderCode = `OM-${randomHex}`;
  }
  next();
});

// Helper method to check and update expiration dynamically
orderSchema.methods.checkExpiration = function () {
  if (this.status === 'ACTIVE' && new Date() > this.expiresAt) {
    this.status = 'EXPIRED';
  }
  return this.status;
};

module.exports = mongoose.model('Order', orderSchema);
