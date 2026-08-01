import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teachers', default: null },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
  examType: { type: String, enum: ['mid-term', 'final', 'quiz', 'assignment'], required: true },
  date: { type: Date, default: Date.now },
  totalMarks: { type: Number, min: 1, default: null },
  obtainedMarks: { type: Number, min: 0, default: null },
  academicYear: { type: String, default: null, match: /^\d{4}\/\d{4}$/ },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
}, { timestamps: true });

export default mongoose.models.Exam || mongoose.model('Exam', examSchema);
