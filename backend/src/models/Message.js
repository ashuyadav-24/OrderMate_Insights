const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function () {
        return !this.isSystem;
      }
    },
    senderName: {
      type: String,
      default: ''
    },
    senderHostel: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    isSystem: {
      type: Boolean,
      default: false
    },
    systemType: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
