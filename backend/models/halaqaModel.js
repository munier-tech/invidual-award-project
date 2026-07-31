import mongoose from 'mongoose';

const halaqaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teachers', default: null },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
}, { timestamps: true });

export default mongoose.models.Halaqa || mongoose.model('Halaqa', halaqaSchema);
