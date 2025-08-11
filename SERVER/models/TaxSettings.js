const mongoose = require('mongoose');

const taxSettingsSchema = new mongoose.Schema({
  gst: {
    type: Number,
    default: 18,
    min: 0,
    max: 100
  },
  cgst: {
    type: Number,
    default: 9,
    min: 0,
    max: 100
  },
  sgst: {
    type: Number,
    default: 9,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TaxSettings', taxSettingsSchema); 