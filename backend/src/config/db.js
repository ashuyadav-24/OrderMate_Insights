const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ordermate';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[OrderMate DB] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`[OrderMate DB] Connection Error: ${err.message}`);
    // Don't exit process in development if Mongo is temporarily offline
    return null;
  }
};

module.exports = connectDB;
