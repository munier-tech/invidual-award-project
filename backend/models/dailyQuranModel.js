import mongoose from 'mongoose';

const dailyQuranSchema = new mongoose.Schema({
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  date: { type: Date, default: Date.now },
  students: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['present', 'absent', 'late'], default: 'present' },
    pages: { type: Number, default: 0 },
  }],
}, { timestamps: true });

export default mongoose.models.DailyQuran || mongoose.model('DailyQuran', dailyQuranSchema);
