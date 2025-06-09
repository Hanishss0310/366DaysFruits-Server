// models/Schema.js
import mongoose from 'mongoose';

const RegisterSchema = new mongoose.Schema({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  shopName: { type: String, required: true },
});

const RegisterModel = mongoose.model('Register', RegisterSchema);

export default RegisterModel;
