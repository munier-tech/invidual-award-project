import mongoose from 'mongoose';

const studentsSchema = new mongoose.Schema({
  fullname: { type: String, required: true, trim: true },
  age: { type: Number, default: null },
  gender: { type: String, enum: ['male', 'female'], default: 'male' },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  motherNumber: { type: String, required: true },
  fatherNumber: { type: String, required: true },
  fee: {
    total: { type: Number, default: 0 },
    paid: { type: Number, default: 0 },
  },
  examRecords: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }],
  disciplineReports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Discipline' }],
  healthRecords: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Health' }],
}, { timestamps: true });

export default mongoose.models.Student || mongoose.model('Student', studentsSchema);
