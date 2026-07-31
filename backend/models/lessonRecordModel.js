import mongoose from 'mongoose';

const lessonRecordSchema = new mongoose.Schema({
  type: { type: String, required: true },
  date: { type: Date, default: Date.now },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  halaqa: { type: mongoose.Schema.Types.ObjectId, ref: 'Halaqa', default: null },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teachers', default: null },
  topics: [{ type: String }],
  notes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.LessonRecord || mongoose.model('LessonRecord', lessonRecordSchema);
