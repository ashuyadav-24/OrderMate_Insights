const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
      select: false
    },
    hostelCategory: {
      type: String,
      required: [true, 'Please select hostel category'],
      enum: ['Boys Hostel', 'Girls Hostel']
    },
    hostel: {
      type: String,
      required: [true, 'Please select hostel name'],
      trim: true
    },
    block: {
      type: String,
      trim: true,
      default: ''
    },
    room: {
      type: String,
      trim: true,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    stats: {
      ordersCreated: { type: Number, default: 0 },
      ordersJoined: { type: Number, default: 0 },
      completedOrders: { type: Number, default: 0 },
      totalConfirmedSavings: { type: Number, default: 0 },
      totalEstimatedSavings: { type: Number, default: 0 },
      platformSavings: {
        'Blinkit': { type: Number, default: 0 },
        'Zepto': { type: Number, default: 0 },
        'Swiggy Instamart': { type: Number, default: 0 },
        'Flipkart Minutes': { type: Number, default: 0 },
        'Other': { type: Number, default: 0 }
      }
    }
  },
  { timestamps: true }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
