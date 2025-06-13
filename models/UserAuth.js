// models/Register.js
import mongoose from 'mongoose';

const registerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

const Register = mongoose.model('Register', registerSchema);

export default Register;
