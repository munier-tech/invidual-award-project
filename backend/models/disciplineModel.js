import mongoose from 'mongoose';

const disciplineSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: Date, default: Date.now },
  issue: { type: String, default: '' },
  reason: { type: String, default: '' },
  type: { type: String, default: '' },
  note: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Discipline || mongoose.model('Discipline', disciplineSchema);
