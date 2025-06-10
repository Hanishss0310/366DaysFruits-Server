const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  items: [
    {
      name: String,
      quantity: Number,
      pricePerKg: Number,
      totalCost: Number,
    }
  ],
  totalAmount: Number,
  orderedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Order', orderSchema);
