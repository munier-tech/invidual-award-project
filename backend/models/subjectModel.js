import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, default: '' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teachers', default: null },
}, { timestamps: true });

export default mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
