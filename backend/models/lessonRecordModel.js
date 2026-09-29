import mongoose from 'mongoose';

const studentPerformanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
  dailyLessonHint: { type: String, default: '' },
  currentSurah: { type: String, default: '' },
  taxdiid: { type: String, default: '' },
  studentStatus: { type: String, default: '' },
  notes: { type: String, default: '' },
  versesTaken: { type: Number, default: 0 },
  versesLost: { type: Number, default: 0 },
  statusScore: { type: Number, default: 0 },
}, { _id: false });

const quranSchema = new mongoose.Schema({
  dailyLessonHint: { type: String, default: '' },
  currentSurah: { type: String, default: '' },
  taxdiid: { type: String, default: '' },
  studentStatus: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { _id: false });

const subciSchema = new mongoose.Schema({
  startingSurah: { type: String, default: '' },
  taxdiid: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { _id: false });

const lessonRecordSchema = new mongoose.Schema({
  type: { type: String, required: true },
  date: { type: Date, default: Date.now },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  halaqa: { type: mongoose.Schema.Types.ObjectId, ref: 'Halaqa', default: null },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teachers', default: null },
  quran: { type: quranSchema, default: undefined },
  subci: { type: subciSchema, default: undefined },
  topics: [{ type: String }],
  notes: { type: String, default: '' },
  studentPerformances: [studentPerformanceSchema],
}, { timestamps: true });

export default mongoose.models.LessonRecord || mongoose.model('LessonRecord', lessonRecordSchema);
