import mongoose from 'mongoose';

const userAuthSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, {
  timestamps: true
});

const UserAuth = mongoose.model('UserAuth', userAuthSchema);
export default UserAuth;
