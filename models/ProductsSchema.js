// models/ProductsSchema.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  weight: { type: String, required: true },
  pieces: { type: String, required: true },
  boxWeight: { type: String, required: true },
  boxPrice: { type: Number, required: true },
  rating: { type: Number, required: true },
  quantity: { type: String, required: true },
  image: { type: String, required: true },
});

const ProductModel = mongoose.model('Product', ProductSchema);

export default ProductModel;
