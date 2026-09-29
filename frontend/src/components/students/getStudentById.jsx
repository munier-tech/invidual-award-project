import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  FiSearch,
  FiUser,
  FiDollarSign,
  FiEdit2,
  FiCheck,
  FiX, 
  FiActivity,
  FiBook,
  FiAlertTriangle,
  FiTrendingUp,
  FiMapPin,
  FiPhone,
  FiCalendar,
  FiAward,
  FiChevronRight
} from 'react-icons/fi';
import useStudentsStore from '../../store/studentsStore';
import useClassesStore from '../../store/classesStore';
import { useSubjectStore } from '../../store/subjectsStore';

// Somali translations
const translations = {
  search: {
    placeholder: "Raadi arday magaciisa...",
    noResults: "Lama helin arday",
    age: "Da'da",
    class: "Fasalka",
    typeToSearch: "Nooceyso si aad u raadsato"
  },
  student: {
    header: "Macluumaadka Ardayga",
    id: "Aqoonsi",
    class: "Fasalka",
    none: "Ma lahan",
    edit: "Wax ka beddel",
    cancel: "Jooji",
    save: "Kaydi",
    gender: "Jinsiga",
    male: "Lab",
    female: "Dheddig",
    age: "Da'da",
    motherContact: "Hooyo",
    fatherContact: "Aabo"
  },
  tabs: {
    basic: "Macluumaadka",
    health: "Caafimaadka",
    exams: "Imtixaannada",
    discipline: "Anshaxa",
    progress: "Horumarka"
  },
  health: {
    condition: "Xaalad",
    date: "Taariikh",
    note: "Qoraal",
    treated: "La daweeyay",
    pending: "Sugaya",
    noRecords: "Lama hayo diiwaan caafimaad"
  },
  exams: {
    subject: "Mawduuca",
    score: "Dhibcaha",
    grade: "Darajo",
    examType: "Nooca",
    date: "Taariikh",
    noRecords: "Lama hayo diiwaan imtixaan",
    average: "Celceliska",
    bestScore: "Qiimaha ugu sarreeya",
    totalExams: "Wadarta Imtixaannada"
  },
  discipline: {
    type: "Nooca",
    description: "Sharaxaad",
    date: "Taariikh",
    resolved: "La xalliyay",
    pending: "Sugaya",
    noRecords: "Lama hayo diiwaan dabeecad"
  },
  progress: {
    overall: "Horumarka Guud",
    subjectPerformance: "Qiimaynta Mawduucyada",
    gradeDistribution: "Qaybinta Darajooyinka",
    recommendations: "Talooyin",
    excellent: "Horumarkaagu waa heer sare! Sii wad.",
    good: "Waxqabad wanaagsan, sii wad dadaalka.",
    average: "Dadaal dheeri ah ayaa loo baahan yahay.",
    needsImprovement: "Waxaa loo baahan yahay horumar.",
    studyMore: "Waa inaad wax badan barataa."
  },
  fee: {
    title: "Lacagta",
    total: "Wadarta",
    paid: "La bixiyay",
    balance: "Haraaga",
    status: "Xaaladda",
    noFee: "Lacag la'aan",
    paidFull: "La bixiyay",
    overpaid: "Dheeraad",
    pending: "Kadhiman",
    recordPayment: "Diiwaan geli",
    currentBalance: "Haraaga hadda",
    amount: "Qadarka ($)",
    confirm: "Xaqiiji",
    assignClass: "U qoondee fasalka",
    paymentHistory: "Taariikhda bixinta"
  },
  buttons: {
    recordPayment: "Bixinta",
    assignClass: "Fasalka",
    saveChanges: "Kaydi",
    cancel: "Jooji",
    viewDetails: "Faahfaahin"
  }
};

const GetStudentById = () => {
  const {
    students,
    selectedStudent,
    fetchStudents,
    fetchStudentById,
    clearSelectedStudent,
    trackFeePayment,
    assignStudentToClass,
    updateStudent,
    searchStudents,
  } = useStudentsStore();

  const { classes, fetchClasses } = useClassesStore();
  const { subjects, getAllSubjects } = useSubjectStore();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [totalFee, setTotalFee] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullname: '',
    age: '',
    gender: '',
    class: '',
    motherNumber: '',
    fatherNumber: ''
  });
  const [isSelecting, setIsSelecting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Helper function to calculate grade with colors
  const getGradeDetails = (marks, total) => {
    if (!total || total === 0) return { grade: 'N/A', color: 'text-gray-600', bgColor: 'bg-gray-100', percentage: 0 };
    
    const percentage = (marks / total) * 100;
    let grade, color, bgColor;
    
    if (percentage >= 90) {
      grade = 'A+';
      color = 'text-green-700';
      bgColor = 'bg-green-100';
    } else if (percentage >= 80) {
      grade = 'A';
      color = 'text-blue-700';
      bgColor = 'bg-blue-100';
    } else if (percentage >= 70) {
      grade = 'B+';
      color = 'text-indigo-700';
      bgColor = 'bg-indigo-100';
    } else if (percentage >= 60) {
      grade = 'B';
      color = 'text-yellow-700';
      bgColor = 'bg-yellow-100';
    } else if (percentage >= 50) {
      grade = 'C';
      color = 'text-orange-700';
      bgColor = 'bg-orange-100';
    } else if (percentage >= 40) {
      grade = 'D';
      color = 'text-purple-700';
      bgColor = 'bg-purple-100';
    } else {
      grade = 'F';
      color = 'text-red-700';
      bgColor = 'bg-red-100';
    }
    
    return { grade, color, bgColor, percentage };
  };

  // Get progress color based on percentage
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Calculate average performance
  const calculateAveragePerformance = () => {
    if (!selectedStudent?.examRecords?.length) return 0;
    
    let totalPercentage = 0;
    let validExams = 0;
    
    selectedStudent.examRecords.forEach(exam => {
      const obtainedMarks = exam.obtainedMarks || exam.marks || 0;
      const totalMarks = exam.totalMarks || exam.total || 0;
      if (totalMarks > 0) {
        totalPercentage += (obtainedMarks / totalMarks) * 100;
        validExams++;
      }
    });
    
    return validExams > 0 ? totalPercentage / validExams : 0;
  };

  // Group exams by subject
  const groupExamsBySubject = () => {
    if (!selectedStudent?.examRecords?.length) return [];
    
    const subjectMap = new Map();
    
    selectedStudent.examRecords.forEach(exam => {
      const subjectName = getSubjectName(exam);
      const obtainedMarks = exam.obtainedMarks || exam.marks || 0;
      const totalMarks = exam.totalMarks || exam.total || 0;
      
      if (!subjectMap.has(subjectName)) {
        subjectMap.set(subjectName, { totalMarks: 0, obtainedMarks: 0, count: 0 });
      }
      
      const subject = subjectMap.get(subjectName);
      subject.totalMarks += totalMarks;
      subject.obtainedMarks += obtainedMarks;
      subject.count++;
    });
    
    return Array.from(subjectMap.entries()).map(([name, data]) => ({
      name,
      percentage: data.totalMarks > 0 ? (data.obtainedMarks / data.totalMarks) * 100 : 0,
      totalExams: data.count
    }));
  };

  // Data loading
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([fetchStudents(), fetchClasses(), getAllSubjects()]);
      } catch (error) {
        toast.error('Qalad ayaa ka dhacay markii la soo dejinnay xogta');
      }
    };
    loadInitialData();
    return () => clearSelectedStudent();
  }, [fetchStudents, fetchClasses, getAllSubjects, clearSelectedStudent]);

  // Search functionality
  useEffect(() => {
    setFilteredStudents(
      searchQuery.trim() === '' ? [] : searchStudents(searchQuery)
    );
  }, [searchQuery, students, searchStudents]);

  const handleSearchKeyDown = async (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    const query = searchQuery.trim();
    if (!query) return;

    if (filteredStudents.length > 0) {
      await handleSelectStudent(filteredStudents[0]._id);
      return;
    }

    const looksLikeObjectId = /^[a-fA-F0-9]{24}$/.test(query);
    if (looksLikeObjectId) {
      await handleSelectStudent(query);
      return;
    }

    const match = students.find(s =>
      s.studentId?.toLowerCase() === query.toLowerCase() ||
      String(s._id).slice(-6).toLowerCase() === query.toLowerCase()
    );
    if (match?._id) {
      await handleSelectStudent(match._id);
      return;
    }

    toast.error('Arday lama helin');
  };

  const handleSelectStudent = async (id) => {
    setIsSelecting(true);
    try {
      const response = await fetchStudentById(id);
      if (response?.success && response.student) {
        setEditForm({
          fullname: response.student.fullname || '',
          age: response.student.age || '',
          gender: response.student.gender || '',
          class: response.student.class?._id || '',
          motherNumber: response.student.motherNumber || '',
          fatherNumber: response.student.fatherNumber || ''
        });
      }
    } catch (error) {
      toast.error('Qalad ayaa ka dhacay markii la soo dejinnay macluumaadka ardayga');
    } finally {
      setIsSelecting(false);
    }
  };

  const handleFeePayment = async () => {
    if (!totalFee || !paidAmount || isNaN(totalFee) || isNaN(paidAmount)) {
      toast.error('Fadlan geli qadarka saxda ah');
      return;
    }

    try {
      const { success } = await trackFeePayment(selectedStudent._id, {
        total: parseFloat(totalFee),
        paid: parseFloat(paidAmount),
      });

      if (success) {
        toast.success('Lacagta si guul leh ayaa loo diiwaan geliyay');
        setIsFeeModalOpen(false);
        setTotalFee('');
        setPaidAmount('');
        await fetchStudentById(selectedStudent._id);
      }
    } catch {
      toast.error('Qalad ayaa ka dhacay markii la diiwaan gelinayay lacagta');
    }
  };

  const handleAssignClass = async () => {
    if (!selectedClassId) {
      toast.error('Fadlan dooro fasalka');
      return;
    }

    try {
      const { success } = await assignStudentToClass(selectedStudent._id, selectedClassId);
      if (success) {
        toast.success('Fasalka si guul leh ayaa loo qoondeeyay');
        setIsAssignModalOpen(false);
        await fetchStudentById(selectedStudent._id);
      }
    } catch {
      toast.error('Qalad ayaa ka dhacay markii la qoondeynayay fasalka');
    }
  };

  const handleUpdateStudent = async () => {
    try {
      const { success } = await updateStudent(selectedStudent._id, editForm);
      if (success) {
        toast.success('Ardayga si guul leh ayaa loo cusboonaysiiyay');
        setIsEditing(false);
        await fetchStudentById(selectedStudent._id);
      }
    } catch {
      toast.error('Qalad ayaa ka dhacay markii la cusboonaysiinayay ardayga');
    }
  };

  const getFeeStatus = () => {
    const total = selectedStudent?.fee?.total || 0;
    const paid = selectedStudent?.fee?.paid || 0;
    const balance = total - paid;

    if (total === 0) return { status: translations.fee.noFee, color: 'bg-gray-100 text-gray-800' };
    if (balance < 0) return { status: translations.fee.overpaid, color: 'bg-purple-100 text-purple-800' };
    if (balance === 0) return { status: translations.fee.paidFull, color: 'bg-green-100 text-green-800' };
    return { status: translations.fee.pending, color: 'bg-red-100 text-red-800' };
  };

  const getSubjectName = (exam) => {
    if (exam.subjectId?.name) {
      return exam.subjectId.name;
    }
    
    if (exam.subjectId && typeof exam.subjectId === 'string') {
      const subject = subjects.find(s => s._id === exam.subjectId);
      return subject?.name || `Mawduuca: ${exam.subjectId.slice(-6)}`;
    }
    
    if (exam.subjectId?._id) {
      const subject = subjects.find(s => s._id === exam.subjectId._id);
      return subject?.name || exam.subjectId.name || `Mawduuca: ${exam.subjectId._id.slice(-6)}`;
    }
    
    return "Qiimayn Guud";
  };

  const renderEmptyState = (message, icon) => (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      {icon}
      <p className="mt-3 text-center">{message}</p>
    </div>
  );

  // Progress Tab Component
  const ProgressTab = () => {
    const averagePerformance = calculateAveragePerformance();
    const subjectPerformance = groupExamsBySubject();
    
    let performanceMessage = '';
    let performanceColor = '';
    
    if (averagePerformance >= 80) {
      performanceMessage = translations.progress.excellent;
      performanceColor = 'text-green-600';
    } else if (averagePerformance >= 60) {
      performanceMessage = translations.progress.good;
      performanceColor = 'text-blue-600';
    } else if (averagePerformance >= 40) {
      performanceMessage = translations.progress.average;
      performanceColor = 'text-yellow-600';
    } else {
      performanceMessage = translations.progress.needsImprovement;
      performanceColor = 'text-red-600';
    }
    
    return (
      <div className="space-y-6">
        {/* Overall Progress */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-blue-600" />
            {translations.progress.overall}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Celceliska Guud</span>
              <span className={`text-2xl font-bold ${performanceColor}`}>
                {averagePerformance.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`rounded-full h-3 transition-all duration-500 ${getProgressColor(averagePerformance)}`}
                style={{ width: `${averagePerformance}%` }}
              />
            </div>
            <p className={`text-sm mt-2 ${performanceColor}`}>
              {performanceMessage}
            </p>
          </div>
        </div>
        
        {/* Subject Performance */}
        {subjectPerformance.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiBook className="text-indigo-600" />
              {translations.progress.subjectPerformance}
            </h3>
            <div className="space-y-4">
              {subjectPerformance.map((subject, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">{subject.name}</span>
                    <span className="text-sm text-gray-500">
                      {subject.totalExams} imtixaan
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`rounded-full h-2 transition-all duration-500 ${getProgressColor(subject.percentage)}`}
                        style={{ width: `${subject.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium min-w-[50px]">
                      {subject.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Grade Distribution */}
        {selectedStudent?.examRecords?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiAward className="text-yellow-600" />
              {translations.progress.gradeDistribution}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map(grade => {
                const count = selectedStudent.examRecords.filter(exam => {
                  const obtainedMarks = exam.obtainedMarks || exam.marks || 0;
                  const totalMarks = exam.totalMarks || exam.total || 0;
                  const { grade: examGrade } = getGradeDetails(obtainedMarks, totalMarks);
                  return examGrade === grade;
                }).length;
                
                if (count === 0) return null;
                
                return (
                  <div key={grade} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-700">{grade}</div>
                    <div className="text-sm text-gray-500">{count} imtixaan</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Basic Info Tab
  const BasicInfoTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
            {translations.student.header}
          </label>
          {isEditing ? (
            <input
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={editForm.fullname}
              onChange={(e) => setEditForm({ ...editForm, fullname: e.target.value })}
            />
          ) : (
            <div>
              <p className="text-lg font-semibold text-gray-800">{selectedStudent.fullname}</p>
              {selectedStudent.studentId && (
                <p className="text-xs text-gray-500 mt-1">ID: {selectedStudent.studentId}</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
            <FiCalendar className="inline mr-1" size={12} />
            {translations.student.age}
          </label>
          {isEditing ? (
            <input
              type="number"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={editForm.age}
              onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
            />
          ) : (
            <p className="text-lg font-semibold text-gray-800">{selectedStudent.age} sanno</p>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
            {translations.student.gender}
          </label>
          {isEditing ? (
            <select
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={editForm.gender}
              onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
            >
              <option value="male">{translations.student.male}</option>
              <option value="female">{translations.student.female}</option>
            </select>
          ) : (
            <p className="text-lg font-semibold text-gray-800 capitalize">
              {selectedStudent.gender === 'male' ? translations.student.male : translations.student.female}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
            <FiMapPin className="inline mr-1" size={12} />
            {translations.student.class}
          </label>
          {isEditing ? (
            <select
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={editForm.class}
              onChange={(e) => setEditForm({ ...editForm, class: e.target.value })}
            >
              <option value="">{translations.student.none}</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-lg font-semibold text-gray-800">
              {selectedStudent.class?.name || translations.student.none}
            </p>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
            <FiPhone className="inline mr-1" size={12} />
            {translations.student.motherContact}
          </label>
          {isEditing ? (
            <input
              type="tel"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={editForm.motherNumber}
              onChange={(e) => setEditForm({ ...editForm, motherNumber: e.target.value })}
            />
          ) : (
            <p className="text-lg font-semibold text-gray-800">
              {selectedStudent.motherNumber || '-'}
            </p>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
            <FiPhone className="inline mr-1" size={12} />
            {translations.student.fatherContact}
          </label>
          {isEditing ? (
            <input
              type="tel"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={editForm.fatherNumber}
              onChange={(e) => setEditForm({ ...editForm, fatherNumber: e.target.value })}
            />
          ) : (
            <p className="text-lg font-semibold text-gray-800">
              {selectedStudent.fatherNumber || '-'}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Health Records Tab
  const HealthRecordsTab = () => (
    <div className="space-y-3">
      {selectedStudent.healthRecords?.length > 0 ? (
        selectedStudent.healthRecords.map((record, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800">{record.condition}</h3>
              <span className="text-xs text-gray-500">
                {new Date(record.date).toLocaleDateString('so-SO')}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{record.note}</p>
            <div>
              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                record.treated ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {record.treated ? translations.health.treated : translations.health.pending}
              </span>
            </div>
          </div>
        ))
      ) : (
        renderEmptyState(
          translations.health.noRecords,
          <FiActivity className="w-12 h-12" />
        )
      )}
    </div>
  );

  // Exam Records Tab
  const ExamRecordsTab = () => {
    const examTypeTranslations = {
      final: "Final",
      midterm: "Midterm",
      "mid-term": "Mid-term",
      quiz: "Quiz",
      assignment: "Assignment",
      test: "Test"
    };

    return (
      <div className="space-y-3">
        {selectedStudent.examRecords?.length > 0 ? (
          selectedStudent.examRecords.map((exam, index) => {
            const obtainedMarks = exam.obtainedMarks || exam.marks || 0;
            const totalMarks = exam.totalMarks || exam.total || 0;
            const { grade, color, bgColor, percentage } = getGradeDetails(obtainedMarks, totalMarks);
            
            return (
              <div key={index} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{getSubjectName(exam)}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {examTypeTranslations[exam.examType] || exam.examType || 'Imtixaan'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {exam.date ? new Date(exam.date).toLocaleDateString('so-SO') : 'Lama qorin'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      {obtainedMarks}/{totalMarks}
                    </span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-sm font-medium text-gray-600">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${bgColor} ${color}`}>
                    {grade}
                  </span>
                </div>
                
                {totalMarks > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`rounded-full h-1.5 transition-all duration-500 ${getProgressColor(percentage)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          renderEmptyState(
            translations.exams.noRecords,
            <FiBook className="w-12 h-12" />
          )
        )}
      </div>
    );
  };

  // Discipline Tab
  const DisciplineTab = () => (
    <div className="space-y-3">
      {selectedStudent.disciplineReports?.length > 0 ? (
        selectedStudent.disciplineReports.map((report, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800">{report.type}</h3>
              <span className="text-xs text-gray-500">
                {new Date(report.date).toLocaleDateString('so-SO')}
              </span>
            </div>
            <p className="text-sm text-gray-600">{report.reason}</p>
          </div>
        ))
      ) : (
        renderEmptyState(
          translations.discipline.noRecords,
          <FiAlertTriangle className="w-12 h-12" />
        )
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Search Section */}
        <div className="mb-6 md:mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400 text-lg" />
              </div>
              <input
                type="text"
                placeholder={translations.search.placeholder}
                className="w-full pl-12 pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
            </div>

            {filteredStudents.length > 0 && (
              <div className="mt-3 bg-white rounded-xl shadow-lg border border-gray-100 max-h-80 overflow-y-auto">
                {filteredStudents.map((student) => (
                  <div
                    key={student._id}
                    onClick={() => handleSelectStudent(student._id)}
                    className="px-4 py-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 transition-colors"
                  >
                    <div className="font-medium text-gray-800">{student.fullname}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {student.class?.name || translations.student.none} • {translations.search.age}: {student.age}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isSelecting && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-500">Soo dejinta macluumaadka...</p>
          </div>
        )}

        {/* Student Dashboard */}
        {!isSelecting && selectedStudent && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {selectedStudent.fullname}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-blue-100 text-sm">
                    <span>ID: {selectedStudent._id.slice(-8)}</span>
                    <span>•</span>
                    <span>Fasalka: {selectedStudent.class?.name || translations.student.none}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 ${
                    isEditing 
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
                      : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <FiX /> {translations.student.cancel}
                    </>
                  ) : (
                    <>
                      <FiEdit2 /> {translations.student.edit}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Navigation Tabs - Mobile Optimized */}
            <div className="border-b border-gray-200 overflow-x-auto">
              <nav className="flex min-w-max md:min-w-0">
                {Object.entries(translations.tabs).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`py-3 md:py-4 px-4 md:px-6 text-center border-b-2 font-medium text-sm md:text-base whitespace-nowrap transition-all duration-200 ${
                      activeTab === key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="p-4 md:p-6">
              {activeTab === 'basic' && <BasicInfoTab />}
              {activeTab === 'health' && <HealthRecordsTab />}
              {activeTab === 'exams' && <ExamRecordsTab />}
              {activeTab === 'discipline' && <DisciplineTab />}
              {activeTab === 'progress' && <ProgressTab />}
              
              {/* Action Buttons */}
              {activeTab === 'basic' && (
                <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setIsFeeModalOpen(true)}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <FiDollarSign /> {translations.buttons.recordPayment}
                  </button>
                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <FiUser /> {translations.buttons.assignClass}
                  </button>
                  {isEditing && (
                    <button
                      onClick={handleUpdateStudent}
                      className="sm:ml-auto px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <FiCheck /> {translations.student.save}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Fee Summary */}
            {activeTab === 'basic' && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-t">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiDollarSign className="text-green-600" />
                  {translations.fee.title}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase mb-1">{translations.fee.total}</p>
                    <p className="text-xl font-bold text-gray-800">${selectedStudent.fee?.total || 0}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase mb-1">{translations.fee.paid}</p>
                    <p className="text-xl font-bold text-green-600">${selectedStudent.fee?.paid || 0}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase mb-1">{translations.fee.balance}</p>
                    <p className="text-xl font-bold text-orange-600">
                      ${(selectedStudent.fee?.total || 0) - (selectedStudent.fee?.paid || 0)}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase mb-1">{translations.fee.status}</p>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getFeeStatus().color}`}>
                      {getFeeStatus().status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {isFeeModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">{translations.fee.recordPayment}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ardayga
                </label>
                <p className="font-semibold text-gray-800">{selectedStudent?.fullname}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.fee.currentBalance}
                </label>
                <p className="text-2xl font-bold text-orange-600">
                  ${(selectedStudent?.fee?.total || 0) - (selectedStudent?.fee?.paid || 0)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.fee.total}
                </label>
                <input
                  type="number"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={translations.fee.amount}
                  value={totalFee}
                  onChange={(e) => setTotalFee(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.fee.paid}
                </label>
                <input
                  type="number"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={translations.fee.amount}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsFeeModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors"
              >
                {translations.buttons.cancel}
              </button>
              <button
                onClick={handleFeePayment}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
              >
                {translations.fee.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Class Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">{translations.fee.assignClass}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ardayga
                </label>
                <p className="font-semibold text-gray-800">{selectedStudent?.fullname}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fasalka hadda
                </label>
                <p className="font-semibold text-gray-800">
                  {selectedStudent?.class?.name || translations.student.none}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dooro fasalka cusub
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- {translations.student.class} --</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors"
              >
                {translations.buttons.cancel}
              </button>
              <button
                onClick={handleAssignClass}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                {translations.fee.assignClass}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default GetStudentById;