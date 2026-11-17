const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { HOSTEL_CONFIG, isValidHostel } = require('../config/hostels');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'ordermate_secure_development_secret_key_123',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new student
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, hostelCategory, hostel, block, room } = req.body;

    if (!name || !email || !password || !hostelCategory || !hostel) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, hostelCategory, hostel'
      });
    }

    // Validate hostel selection from centralized registry
    if (!isValidHostel(hostelCategory, hostel)) {
      return res.status(400).json({
        success: false,
        message: `Invalid hostel '${hostel}' for category '${hostelCategory}'.`
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A student account with this email already exists'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      hostelCategory,
      hostel,
      block: block || '',
      room: room || '',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        hostelCategory: user.hostelCategory,
        hostel: user.hostel,
        block: user.block,
        room: user.room,
        avatar: user.avatar,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        hostelCategory: user.hostelCategory,
        hostel: user.hostel,
        block: user.block,
        room: user.room,
        avatar: user.avatar,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.json({
      success: true,
      user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get hostel options registry
// @route   GET /api/auth/hostels
exports.getHostels = (req, res) => {
  return res.json({
    success: true,
    data: HOSTEL_CONFIG
  });
};
