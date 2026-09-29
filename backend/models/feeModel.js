import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  amount: { type: Number, default: 0 },
  paid: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'paid', 'partial'], default: 'pending' },
  dueDate: { type: Date, default: null },
  paidDate: { type: Date, default: null },
  note: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

export default mongoose.models.Fee || mongoose.model('Fee', feeSchema);
