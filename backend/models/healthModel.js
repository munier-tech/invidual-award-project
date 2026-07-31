import mongoose from 'mongoose';

const healthSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: Date, default: Date.now },
  healthStatus: { type: String, default: 'normal' },
  notes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Health || mongoose.model('Health', healthSchema);
