import mongoose from 'mongoose';

const dailyQuranSchema = new mongoose.Schema({
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  status: {
    type: String,
    enum: ['gartay', 'garan waayay', 'majoogo', 'present', 'absent', 'late'],
    default: 'majoogo'
  },
  date: { type: Date, default: Date.now },
  surah: { type: String, default: '' },
  fromVerse: { type: String, default: '' },
  toVerse: { type: String, default: '' },
  notes: { type: String, default: '' },
  students: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    status: { type: String, enum: ['gartay', 'garan waayay', 'majoogo', 'present', 'absent', 'late'], default: 'majoogo' },
    pages: { type: Number, default: 0 },
    surah: { type: String, default: '' },
    fromVerse: { type: String, default: '' },
    toVerse: { type: String, default: '' },
    notes: { type: String, default: '' },
  }],
}, { timestamps: true });

export default mongoose.models.DailyQuran || mongoose.model('DailyQuran', dailyQuranSchema);
