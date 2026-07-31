import mongoose from 'mongoose';

const familyFeeSchema = new mongoose.Schema({
  familyName: { type: String, default: '' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  amount: { type: Number, default: 0 },
  paid: { type: Number, default: 0 },
  dueDate: { type: Date, default: null },
  status: { type: String, enum: ['pending', 'paid', 'partial'], default: 'pending' },
}, { timestamps: true });

export default mongoose.models.FamilyFee || mongoose.model('FamilyFee', familyFeeSchema);
