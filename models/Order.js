import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
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

const OrderModel = mongoose.model('Order', orderSchema);
export default OrderModel;
