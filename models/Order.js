// models/Order.js
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true }
    }
  ]
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);
