import mongoose from 'mongoose';

const teacherAttendanceSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teachers', required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['present', 'absent', 'late'], default: 'present' },
  note: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.TeacherAttendance || mongoose.model('TeacherAttendance', teacherAttendanceSchema);
