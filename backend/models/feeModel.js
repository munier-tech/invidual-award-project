import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  amount: { type: Number, default: 0 },
  paid: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'paid', 'partial'], default: 'pending' },
  dueDate: { type: Date, default: null },
  paymentDate: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.models.Fee || mongoose.model('Fee', feeSchema);
