import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  level: { type: String, required: true, trim: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' }],
}, { timestamps: true });

export default mongoose.models.Class || mongoose.model('Class', classSchema);
