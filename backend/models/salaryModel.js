import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teachers', required: true },
  amount: { type: Number, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  bonus: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paid: { type: Boolean, default: false },
  paidDate: { type: Date, default: null },
  note: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

export default mongoose.models.Salary || mongoose.model('Salary', salarySchema);
