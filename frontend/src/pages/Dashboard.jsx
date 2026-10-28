import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, GraduationCap, BookOpen, TrendingUp, RefreshCw, Activity, Clock,
  UserPlus, BookMarked, CalendarCheck, X, Camera, ArrowUpRight,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useStudentsStore from '../store/studentsStore';
import useTeachersStore from '../store/teachersStore';
import useClassesStore from '../store/classesStore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

/* NOTE: Fredoka is applied by DashboardLayout (font-fredoka on its root),
   so everything rendered here — including the modals — inherits it. */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/* Colour system: one entry per tone, reused by every component */
const TONES = {
  blue: { grad: 'from-sky-400 to-blue-600', glow: 'shadow-blue-500/40', soft: 'bg-blue-50 text-blue-700', ring: 'ring-blue-100', dot: 'bg-blue-500' },
  green: { grad: 'from-emerald-400 to-teal-600', glow: 'shadow-emerald-500/40', soft: 'bg-emerald-50 text-emerald-700', ring: 'ring-emerald-100', dot: 'bg-emerald-500' },
  purple: { grad: 'from-fuchsia-400 to-violet-600', glow: 'shadow-violet-500/40', soft: 'bg-violet-50 text-violet-700', ring: 'ring-violet-100', dot: 'bg-violet-500' },
  orange: { grad: 'from-amber-400 to-orange-500', glow: 'shadow-orange-500/40', soft: 'bg-orange-50 text-orange-700', ring: 'ring-orange-100', dot: 'bg-orange-500' },
};

const STAR_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M24 4l4.6 11.4L40 12l-3.4 11.4L48 24l-11.4 4.6L40 40l-11.4-3.4L24 48l-4.6-11.4L8 40l3.4-11.4L0 24l11.4-4.6L8 8l11.4 3.4z' fill='none' stroke='white' stroke-opacity='.08' stroke-width='1'/%3E%3C/svg%3E")`;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const getRecordDate = (record) => {
  const value = record?.updatedAt || record?.createdAt;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatRelativeTime = (date) => {
  if (!date) return 'Hadda';
  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 1) return 'Hadda';
  if (diffMinutes < 60) return `${diffMinutes}m kahor`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h kahor`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d kahor`;
  return date.toLocaleDateString('so-SO', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getClassName = (studentClass) => {
  if (!studentClass) return 'Fasal lama xirin';
  if (typeof studentClass === 'string') return 'Fasal la xirey';
  return [studentClass.name, studentClass.level].filter(Boolean).join(' - ') || 'Fasal la xirey';
};

const buildRecentActivities = ({ students, teachers, classes }) => {
  const studentActivities = students.map((student) => {
    const date = getRecordDate(student);
    return {
      id: `student-${student._id || student.studentId || student.fullname}`,
      icon: Users,
      title: 'Arday Cusub oo Diiwaan Gashay',
      description: `${student.fullname || 'Arday cusub'} - ${getClassName(student.class)}`,
      time: formatRelativeTime(date),
      date,
      color: 'blue',
    };
  });

  const teacherActivities = teachers.map((teacher) => {
    const date = getRecordDate(teacher);
    const wasUpdated = teacher.updatedAt && teacher.createdAt && teacher.updatedAt !== teacher.createdAt;
    return {
      id: `teacher-${teacher._id || teacher.email || teacher.name}`,
      icon: GraduationCap,
      title: wasUpdated ? 'Baraha Profile-ka la Cusboonaysiiyay' : 'Bare Cusub oo la Diiwaan Galiyay',
      description: `${teacher.name || 'Bare'}${teacher.subject ? ` - ${teacher.subject}` : ''}`,
      time: formatRelativeTime(date),
      date,
      color: 'green',
    };
  });

  const classActivities = classes.map((cls) => {
    const date = getRecordDate(cls);
    const teacherName = cls.teacher?.name || cls.teacher?.fullname;
    return {
      id: `class-${cls._id || cls.name}`,
      icon: BookOpen,
      title: 'Fasalka Cusub la Abuuro',
      description: `${cls.name || 'Fasal'}${cls.level ? ` - ${cls.level}` : ''}${teacherName ? ` (${teacherName})` : ''}`,
      time: formatRelativeTime(date),
      date,
      color: 'purple',
    };
  });

  return [...studentActivities, ...teacherActivities, ...classActivities]
    .filter((a) => a.date)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 4);
};

/* ------------------------------------------------------------------ */
/* Cards                                                               */
/* ------------------------------------------------------------------ */
const StatCard = ({ title, value, icon: Icon, color, trend, loading }) => {
  const t = TONES[color];
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-100"
    >
      {/* Watermark icon + corner glow */}
      <Icon className="pointer-events-none absolute -bottom-4 -right-3 h-28 w-28 text-slate-100 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110" />
      <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${t.grad} opacity-10 blur-2xl`} />

      <div className="relative">
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${t.grad} ${t.glow}`}>
          <Icon className="h-6 w-6" />
        </span>
        <p className="mt-5 text-sm font-medium text-slate-500">{title}</p>
        <div className="mt-1 text-4xl font-bold text-slate-900">
          {loading ? <div className="h-10 w-20 animate-pulse rounded-xl bg-slate-200" /> : value}
        </div>
        {trend && (
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <TrendingUp className="h-3.5 w-3.5" />
            {trend}
          </span>
        )}
      </div>
    </motion.div>
  );
};

const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => {
  const t = TONES[color];
  return (
    <motion.button
      variants={itemVariants}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-100 transition hover:bg-white hover:shadow-xl hover:shadow-slate-900/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
    >
      <div className="flex items-center gap-4">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${t.grad} ${t.glow}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-900">{title}</h3>
          <p className="truncate text-sm text-slate-500">{description}</p>
        </div>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-600" />
      </div>
    </motion.button>
  );
};

const RecentActivityItem = ({ icon: Icon, title, description, time, color, isLast }) => {
  const t = TONES[color];
  return (
    <motion.div variants={itemVariants} className="relative flex gap-4 pb-5">
      {!isLast && <span className="absolute left-5 top-11 h-[calc(100%-2.25rem)] w-px border-l-2 border-dashed border-slate-200" />}
      <span className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md ${t.grad} ${t.glow}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 transition hover:bg-white hover:shadow-md">
        <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
        <p className="truncate text-xs text-slate-500">{description}</p>
        <p className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${t.soft}`}>
          <Clock className="h-3 w-3" />
          {time}
        </p>
      </div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* Modal building blocks (shared by the three forms)                   */
/* ------------------------------------------------------------------ */
const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100';

const Field = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
    {children}
  </div>
);

const ModalShell = ({ title, subtitle, icon: Icon, tone = 'purple', onClose, children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-2xl ring-1 ring-white/20"
    >
      <div className={`sticky top-0 z-10 flex items-center justify-between gap-3 bg-gradient-to-br px-6 py-5 ${TONES[tone].grad}`}>
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: STAR_PATTERN }} />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-white ring-1 ring-white/30">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-xs text-white/80">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="relative rounded-xl bg-white/15 p-2 text-white transition hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
    </motion.div>
  </motion.div>
);

const FormActions = ({ onClose, isLoading, label, loadingLabel }) => (
  <div className="flex justify-end gap-3 pt-3">
    <button
      type="button"
      onClick={onClose}
      className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
    >
      Jooji
    </button>
    <button
      type="submit"
      disabled={isLoading}
      className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/30 transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
    >
      {isLoading ? loadingLabel : label}
    </button>
  </div>
);

const ImagePicker = ({ id, label, previewImage, onChange }) => (
  <Field label={label}>
    <div className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/50 p-3">
      <div className="relative shrink-0">
        {previewImage ? (
          <img src={previewImage} alt="Preview" className="h-16 w-16 rounded-full object-cover ring-4 ring-white" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-400">
            <UserPlus className="h-6 w-6" />
          </div>
        )}
        <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-white ring-2 ring-white">
          <Camera className="h-3.5 w-3.5" />
        </span>
        <input type="file" id={id} accept="image/*" onChange={onChange} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
      </div>
      <label htmlFor={id} className="cursor-pointer text-sm font-medium text-violet-700 hover:text-violet-900">
        {previewImage ? 'Beddel sawirka' : 'U soo rogo sawirka'}
      </label>
    </div>
  </Field>
);

/* ------------------------------------------------------------------ */
/* Modals (logic unchanged)                                            */
/* ------------------------------------------------------------------ */
const AddTeacherModal = ({ isOpen, onClose, onCreate }) => {
  const empty = { name: '', number: '', email: '', subject: '', profilePicture: null, certificate: null, previewImage: null };
  const [formData, setFormData] = useState(empty);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData((prev) => ({ ...prev, profilePicture: file, previewImage: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.number || !formData.email || !formData.subject) {
      toast.error('Fadlan buuxi dhammaan meelaha loo baahan yahay');
      return;
    }
    setIsLoading(true);
    try {
      const teacherData = new FormData();
      teacherData.append('name', formData.name);
      teacherData.append('number', formData.number);
      teacherData.append('email', formData.email);
      teacherData.append('subject', formData.subject);
      if (formData.profilePicture) teacherData.append('profilePicture', formData.profilePicture);
      if (formData.certificate) teacherData.append('certificate', formData.certificate);

      const result = await onCreate(teacherData);
      if (result.success) {
        toast.success('Macallinka si guul leh ayaa loo diiwaan geliyay');
        onClose();
        setFormData(empty);
      }
    } catch (error) {
      toast.error('Khalad ayaa dhacay markii la abuurinayay macallinka');
      console.error('Error creating teacher:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalShell title="Ku Dar Macallin Cusub" subtitle="Diiwaan geli bare cusub" icon={GraduationCap} tone="green" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <Field label="Magaca Macallinka">
          <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputCls} required />
        </Field>
        <Field label="Lambarka Macallinka">
          <input type="text" name="number" value={formData.number} onChange={handleChange} className={inputCls} required />
        </Field>
        <Field label="Email">
          <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputCls} required />
        </Field>
        <Field label="Maadada">
          <input type="text" name="subject" value={formData.subject} onChange={handleChange} className={inputCls} required />
        </Field>
        <ImagePicker id="profilePicture" label="Sawirka Macallinka" previewImage={formData.previewImage} onChange={handleProfilePictureChange} />
        <Field label="Shaahadada (PDF/Word)">
          <input
            type="file"
            id="certificate"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFormData((prev) => ({ ...prev, certificate: e.target.files[0] }))}
            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-violet-700 hover:file:bg-violet-100"
          />
        </Field>
        <FormActions onClose={onClose} isLoading={isLoading} label="Ku dar Macallinka" loadingLabel="Ku daraya..." />
      </form>
    </ModalShell>
  );
};

const AddStudentModal = ({ isOpen, onClose, onCreate, classes }) => {
  const empty = { fullname: '', age: '', gender: 'male', classId: '', motherNumber: '', fatherNumber: '', profilePicture: null, previewImage: null };
  const [formData, setFormData] = useState(empty);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData((prev) => ({ ...prev, profilePicture: file, previewImage: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullname || !formData.age || !formData.gender) {
      toast.error('Fadlan buuxi dhammaan meelaha loo baahan yahay');
      return;
    }
    setIsLoading(true);
    try {
      const studentData = new FormData();
      studentData.append('fullname', formData.fullname);
      studentData.append('age', formData.age);
      studentData.append('gender', formData.gender);
      studentData.append('classId', formData.classId || '');
      studentData.append('motherNumber', formData.motherNumber || '');
      studentData.append('fatherNumber', formData.fatherNumber || '');
      if (formData.profilePicture) studentData.append('profilePicture', formData.profilePicture);

      const result = await onCreate(studentData);
      if (result.success) {
        toast.success('Ardayga si guul leh ayaa loo diiwaan geliyay');
        onClose();
        setFormData(empty);
      }
    } catch (error) {
      toast.error('Khalad ayaa dhacay markii la abuurinayay ardayga');
      console.error('Error creating student:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalShell title="Ku Dar Arday Cusub" subtitle="Diiwaan geli arday cusub" icon={Users} tone="blue" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <Field label="Magaca Oo Dhan*">
          <input type="text" name="fullname" value={formData.fullname} onChange={handleChange} className={inputCls} required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Da'da">
            <input type="number" name="age" value={formData.age} onChange={handleChange} className={inputCls} required min="5" max="25" />
          </Field>
          <Field label="Jinsiga">
            <select name="gender" value={formData.gender} onChange={handleChange} className={inputCls} required>
              <option value="male">Lab</option>
              <option value="female">Dheddig</option>
            </select>
          </Field>
        </div>
        <Field label="Fasalka">
          <select name="classId" value={formData.classId} onChange={handleChange} className={inputCls}>
            <option value="">Xulo Fasalka...</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name} - {cls.level}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Lambarka Hooyada">
            <input type="text" name="motherNumber" value={formData.motherNumber} onChange={handleChange} className={inputCls} />
          </Field>
          <Field label="Lambarka Aabaha">
            <input type="text" name="fatherNumber" value={formData.fatherNumber} onChange={handleChange} className={inputCls} />
          </Field>
        </div>
        <ImagePicker id="profilePictureStudent" label="Sawirka Ardayga" previewImage={formData.previewImage} onChange={handleProfilePictureChange} />
        <FormActions onClose={onClose} isLoading={isLoading} label="Ku dar Ardayga" loadingLabel="Ku daraya..." />
      </form>
    </ModalShell>
  );
};

const AddClassModal = ({ isOpen, onClose, onCreate, teachers }) => {
  const empty = { name: '', level: '', teacher: '', isActive: true };
  const [formData, setFormData] = useState(empty);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.level) {
      toast.error('Fadlan buuxi dhammaan meelaha loo baahan yahay');
      return;
    }
    setIsLoading(true);
    try {
      const result = await onCreate({
        name: formData.name,
        level: formData.level,
        teacher: formData.teacher || undefined,
      });
      if (result.success) {
        toast.success('Fasalka si guul leh ayaa loo abuuray');
        onClose();
        setFormData(empty);
      }
    } catch (error) {
      toast.error('Khalad ayaa dhacay markii la abuurinayay fasalka');
      console.error('Error creating class:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalShell title="Abuur Fasalka Cusub" subtitle="Deji fasalka cusub" icon={BookMarked} tone="purple" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <Field label="Magaca Fasalka*">
          <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputCls} required />
        </Field>
        <Field label="Heerka">
          <input type="text" name="level" value={formData.level} onChange={handleChange} className={inputCls} required />
        </Field>
        <Field label="Macallinka (Ikhtiyaar)">
          <select name="teacher" value={formData.teacher} onChange={handleChange} className={inputCls}>
            <option value="">Xulo Macallin...</option>
            {teachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.name} - {teacher.subject}
              </option>
            ))}
          </select>
        </Field>
        <label htmlFor="isActive" className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-100">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
          />
          Fasalku waa firfircoon
        </label>
        <FormActions onClose={onClose} isLoading={isLoading} label="Abuur Fasalka" loadingLabel="Abuuritaanka..." />
      </form>
    </ModalShell>
  );
};

/* ------------------------------------------------------------------ */
/* Main Dashboard                                                      */
/* ------------------------------------------------------------------ */
function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { students, fetchStudents, loading: studentsLoading, createStudent } = useStudentsStore();
  const { teachers, fetchTeachers, loading: teachersLoading, createTeacher } = useTeachersStore();
  const { classes, fetchClasses, loading: classesLoading, createClass } = useClassesStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);

  const recentActivities = useMemo(
    () => buildRecentActivities({ students, teachers, classes }),
    [students, teachers, classes]
  );
  const isActivityLoading = studentsLoading || teachersLoading || classesLoading || isRefreshing;

  const fetchAllData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchStudents(), fetchTeachers(), fetchClasses()]);
    } catch (error) {
      console.error('Khalad ka dhacay markii la soo dejinaayo xogta dashboard-ka:', error);
      toast.error('Khalad ayaa ka dhacay markii la soo dejinaayo xogta');
    } finally {
      setIsRefreshing(false);
    }
  };

  const makeCreateHandler = (create, refetch, label) => async (payload) => {
    try {
      const result = await create(payload);
      if (result.success) await refetch();
      return result;
    } catch (error) {
      console.error(`Error creating ${label}:`, error);
      return { success: false, message: error.message };
    }
  };

  const handleCreateTeacher = makeCreateHandler(createTeacher, fetchTeachers, 'teacher');
  const handleCreateStudent = makeCreateHandler(createStudent, fetchStudents, 'student');
  const handleCreateClass = makeCreateHandler(createClass, fetchClasses, 'class');

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen space-y-6 bg-transparent md:p-2">
      <AddTeacherModal isOpen={isAddTeacherModalOpen} onClose={() => setIsAddTeacherModalOpen(false)} onCreate={handleCreateTeacher} />
      <AddStudentModal isOpen={isAddStudentModalOpen} onClose={() => setIsAddStudentModalOpen(false)} onCreate={handleCreateStudent} classes={classes} />
      <AddClassModal isOpen={isAddClassModalOpen} onClose={() => setIsAddClassModalOpen(false)} onCreate={handleCreateClass} teachers={teachers} />

      {/* Hero header */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-950 via-violet-800 to-fuchsia-700 p-6 shadow-2xl shadow-violet-900/25 ring-1 ring-white/10 md:p-8">
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: STAR_PATTERN }} />
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-fuchsia-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-amber-200 ring-1 ring-white/15">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
              Nidaamka Online ah
            </p>
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              Ku soo dhawoow, <span className="bg-gradient-to-r from-amber-200 to-white bg-clip-text text-transparent">{user?.username}</span>!
            </h1>
            <p className="mt-2 max-w-xl text-sm text-violet-100 md:text-base">
              Halkan waxa ku yaal waxyaabaha ka dhacaya Maamulka AL-Furqaan maanta.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={fetchAllData}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 self-start rounded-2xl bg-white px-5 py-3 text-violet-700 shadow-xl shadow-violet-950/30 transition hover:bg-amber-50 disabled:opacity-70 md:self-center"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-semibold">Cusboonaysii Xogta</span>
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Wadarta Ardayda" value={students.length} icon={Users} color="blue" trend="+12% bishii la soo dhaafay" loading={studentsLoading} />
        <StatCard title="Wadarta Barayaasha" value={teachers.length} icon={GraduationCap} color="green" trend="+5% bishii la soo dhaafay" loading={teachersLoading} />
        <StatCard title="Wadarta Fasallada" value={classes.length} icon={BookOpen} color="purple" trend="+8% bishii la soo dhaafay" loading={classesLoading} />
      </motion.div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Quick actions */}
        <div className="lg:col-span-2">
          <div className="h-full rounded-3xl bg-white p-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-8 w-1.5 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500" />
              <h2 className="text-xl font-semibold text-slate-900">Ficilal Degdeg ah</h2>
            </div>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <QuickActionCard title="Ku Dar Arday Cusub" description="Diiwaan geli arday cusub" icon={UserPlus} color="blue" onClick={() => setIsAddStudentModalOpen(true)} />
              <QuickActionCard title="Ku Dar Barre Cusub" description="Diiwaan geli bare cusub" icon={UserPlus} color="green" onClick={() => setIsAddTeacherModalOpen(true)} />
              <QuickActionCard title="Abuur Fasalka" description="Deji fasalka cusub" icon={BookMarked} color="purple" onClick={() => setIsAddClassModalOpen(true)} />
              <QuickActionCard title="Diiwangeli Isticmaale" description="Diwangalin" icon={CalendarCheck} color="orange" onClick={() => navigate('/createStudent')} />
            </motion.div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-100">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-8 w-1.5 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
              <h2 className="text-xl font-semibold text-slate-900">Waxqabadka Ugu Danbeeyay</h2>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Activity className="h-5 w-5" />
            </span>
          </div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {isActivityLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-4 pb-5">
                  <div className="h-10 w-10 shrink-0 animate-pulse rounded-2xl bg-slate-200" />
                  <div className="flex-1 space-y-2 rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <RecentActivityItem
                  key={activity.id}
                  icon={activity.icon}
                  title={activity.title}
                  description={activity.description}
                  time={activity.time}
                  color={activity.color}
                  isLast={index === recentActivities.length - 1}
                />
              ))
            ) : (
              <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500 ring-1 ring-slate-100">
                Waxqabad dhab ah wali lama helin.
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
