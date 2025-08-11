const mongoose = require('mongoose');

const deliveryChargeSchema = new mongoose.Schema({
  minWeight: {
    type: Number,
    required: true,
    min: 0
  },
  maxWeight: {
    type: Number,
    default: null // null means no upper limit
  },
  charge: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false }); // Disable _id field for embedded documents

const deliveryChargesSchema = new mongoose.Schema({
  charges: [deliveryChargeSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('DeliveryCharges', deliveryChargesSchema); 