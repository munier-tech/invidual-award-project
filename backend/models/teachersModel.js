import mongoose from 'mongoose';

const teachersSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  subject: { type: String, required: true },
  profilePicture: { type: String, default: 'no profile picture' },
  certificate: { type: String, default: 'no certificate' },
  assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
}, { timestamps: true });

export default mongoose.models.Teachers || mongoose.model('Teachers', teachersSchema);
