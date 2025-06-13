import mongoose from 'mongoose';

const registerSchema = new mongoose.Schema({
  username: String,
  phone: { type: String, unique: true },
  password: String,
});

const Register = mongoose.model('Register', registerSchema);
export default Register;
