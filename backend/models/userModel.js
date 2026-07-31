import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
  profilePicture: { type: String, default: 'lama keenin sawir' },
  accessToken: { type: String, default: null },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
