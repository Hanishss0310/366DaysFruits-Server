
// models/BannerSchema.js
import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const BannerModel = mongoose.model('Banner', bannerSchema);
export default BannerModel;
