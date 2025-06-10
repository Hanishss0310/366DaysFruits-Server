import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
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
    default: Date.now
  }
});

const OrderModel = mongoose.model('Order', OrderSchema);
export default OrderModel;
