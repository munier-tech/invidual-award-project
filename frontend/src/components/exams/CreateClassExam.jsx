import { useState, useEffect } from 'react';
import { FiBook, FiCalendar, FiUsers, FiAward, FiSave, FiUser, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
import { useExamStore } from '../../store/examStore';
import useClassesStore from '../../store/classesStore';
import useStudentsStore from '../../store/studentsStore';
import { useSubjectStore } from '../../store/subjectsStore';

const CreateClassExam = () => {
  const { createClassExam, isLoading } = useExamStore();
  const { classes, fetchClasses } = useClassesStore();
  const { students, fetchStudentsByClass } = useStudentsStore();
  const { subjects, getAllSubjects } = useSubjectStore();

  const [formData, setFormData] = useState({
    examType: null,
    date: '',
    classId: null,
    subjectId: null,
    totalMarks: '',
  });

  const [studentMarks, setStudentMarks] = useState({});

  useEffect(() => {
    fetchClasses();
    getAllSubjects();
  }, []);

  useEffect(() => {
    if (formData.classId?.value) {
      fetchStudentsByClass(formData.classId.value).then((res) => {
        if (res?.success) {
          const initialMarks = {};
          res.students.forEach(student => {
            initialMarks[student._id] = 0;
          });
          setStudentMarks(initialMarks);
        }
      });
    }
  }, [formData.classId]);

  const examTypeOptions = [
    { value: 'mid-term', label: '📝 Imtixaan Dhexe' },
    { value: 'final', label: '🎯 Imtixaan Final' },
    { value: 'quiz', label: '⚡ Imtixaan Kooban' },
    { value: 'assignment', label: '📚 Imtixaan Wayn' },
  ];

  const classOptions = classes.map(cls => ({
    value: cls._id,
    label: cls.name,
  }));

  const subjectOptions = subjects.map(sub => ({
    value: sub._id,
    label: sub.name,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelect = (name, selectedOption) => {
    setFormData(prev => ({
      ...prev,
      [name]: selectedOption,
    }));
  };

  const handleMarkChange = (studentId, value) => {
    if (value === '' || (!isNaN(value) && value >= 0)) {
      setStudentMarks(prev => ({
        ...prev,
        [studentId]: value === '' ? '' : Math.min(Number(value), Number(formData.totalMarks || Infinity))
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { examType, date, classId, subjectId, totalMarks } = formData;

    if (!examType?.value || !date || !classId?.value || !subjectId?.value || !totalMarks) {
      toast.error('Fadlan buuxi meelaha loo baahan yahay');
      return;
    }

    if (Object.values(studentMarks).some(mark => mark === '' || isNaN(mark))) {
      toast.error('Fadlan geli qiime sax ah ardayda oo dhan');
      return;
    }

    const marksList = Object.entries(studentMarks).map(([studentId, obtainedMarks]) => ({
      studentId,
      obtainedMarks: Number(obtainedMarks)
    }));

    try {
      const result = await createClassExam({
        examType: examType.value,
        date,
        classId: classId.value,
        subjectId: subjectId.value,
        totalMarks: Number(totalMarks),
        marksList,
      });

      if (result?.success) {
        toast.success("Imtixanka Fasalka si Fican Ayaa Loo Abuuray");
        setFormData({
          examType: null,
          date: '',
          classId: null,
          subjectId: null,
          totalMarks: '',
        });
        setStudentMarks({});
      }
    } catch (error) {
      console.error('Error creating exam:', error);
    }
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '12px',
      borderColor: state.isFocused ? '#3B82F6' : '#E5E7EB',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.1)' : 'none',
      '&:hover': {
        borderColor: '#3B82F6'
      }
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected ? '#3B82F6' : isFocused ? '#EFF6FF' : 'white',
      color: isSelected ? 'white' : '#374151',
      cursor: 'pointer',
    })
  };

  // Helper function to get progress color
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold flex items-center gap-3 mb-2">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <FiBook className="text-2xl md:text-3xl" />
                  </div>
                  Abuur Imtixan Fasalka
                </h1>
                <p className="text-blue-100 text-sm md:text-base mt-2">
                  Deji xogta imtixanka mar keliya oo geli dhammaan dhibcaha ardayda fasalka
                </p>
              </div>
              <div className="hidden md:block mt-4 md:mt-0">
                <div className="bg-white/10 rounded-full px-4 py-2 text-sm backdrop-blur-sm">
                  <FiAward className="inline mr-1" /> Diiwaan gelinta Imtixanka
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-4 md:p-6 lg:p-8 space-y-6">
              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {/* Exam Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiBook className="text-blue-500" size={16} />
                    Nooca Imtixanka
                    <span className="text-red-500 text-xs">*</span>
                  </label>
                  <Select
                    options={examTypeOptions}
                    value={formData.examType}
                    onChange={(option) => handleSelect('examType', option)}
                    placeholder="Dooro nooca imtixanka..."
                    isClearable
                    styles={customSelectStyles}
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiCalendar className="text-blue-500" size={16} />
                    Taariikhda Imtixanka
                    <span className="text-red-500 text-xs">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                    required
                  />
                </div>

                {/* Class */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiUsers className="text-blue-500" size={16} />
                    Fasalka
                    <span className="text-red-500 text-xs">*</span>
                  </label>
                  <Select
                    options={classOptions}
                    value={formData.classId}
                    onChange={(option) => handleSelect('classId', option)}
                    placeholder="Dooro fasalka..."
                    isClearable
                    styles={customSelectStyles}
                  />
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiBook className="text-blue-500" size={16} />
                    Mawduuca
                    <span className="text-red-500 text-xs">*</span>
                  </label>
                  <Select
                    options={subjectOptions}
                    value={formData.subjectId}
                    onChange={(option) => handleSelect('subjectId', option)}
                    placeholder="Dooro mawduuca..."
                    isClearable
                    styles={customSelectStyles}
                  />
                </div>

                {/* Total Marks */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiAward className="text-yellow-500" size={16} />
                    Dhibcaha Guud
                    <span className="text-red-500 text-xs">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalMarks"
                    min="1"
                    placeholder="Tusaale: 100"
                    value={formData.totalMarks}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                    required
                  />
                </div>
              </div>

              {/* Students Marks Section */}
              {students?.length > 0 && (
                <div className="mt-8">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3">
                      <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FiUsers className="text-blue-600" size={20} />
                        Dhibcaha Ardayda
                        <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full ml-2">
                          {students.length} Arday
                        </span>
                      </h3>
                      {formData.totalMarks && (
                        <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg shadow-sm">
                          Guud: {formData.totalMarks} dhibcood
                        </div>
                      )}
                    </div>

                    {/* Mobile Card View */}
                    <div className="block md:hidden space-y-3">
                      {students.map((student) => {
                        const obtainedMark = studentMarks[student._id] || 0;
                        const percentage = formData.totalMarks ? (obtainedMark / formData.totalMarks) * 100 : 0;
                        
                        return (
                          <div key={student._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                                    <FiUser className="text-blue-600 text-sm" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-800">{student.fullname}</p>
                                    <p className="text-xs text-gray-500">Roll: {student.rollNumber || '-'}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="w-32">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Dhibcaha</label>
                                <input
                                  type="number"
                                  value={studentMarks[student._id] ?? ''}
                                  onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                                  min="0"
                                  max={formData.totalMarks || ''}
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            {formData.totalMarks && obtainedMark > 0 && (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                  <span>Horumarka</span>
                                  <span>{Math.round(percentage)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className={`rounded-full h-2 transition-all duration-300 ${getProgressColor(percentage)}`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              #
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Magaca Ardayga
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Lambarka Roll
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Dhibcaha Laga Helay
                            </th>
                            {formData.totalMarks && (
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Horumarka
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {students.map((student, idx) => {
                            const obtainedMark = studentMarks[student._id] || 0;
                            const percentage = formData.totalMarks ? (obtainedMark / formData.totalMarks) * 100 : 0;
                            
                            return (
                              <tr key={student._id} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {idx + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                  {student.fullname}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {student.rollNumber || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      value={studentMarks[student._id] ?? ''}
                                      onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                      className="w-28 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                      min="0"
                                      max={formData.totalMarks || ''}
                                      placeholder="0"
                                    />
                                    {formData.totalMarks && (
                                      <span className="text-xs text-gray-500">
                                        / {formData.totalMarks}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                {formData.totalMarks && (
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                      <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div 
                                          className={`rounded-full h-2 transition-all duration-300 ${getProgressColor(percentage)}`}
                                          style={{ width: `${percentage}%` }}
                                        />
                                      </div>
                                      <span className="text-xs font-medium text-gray-600 min-w-[45px]">
                                        {Math.round(percentage)}%
                                      </span>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {students?.length === 0 && formData.classId?.value && (
                <div className="text-center py-12">
                  <div className="bg-gray-50 rounded-2xl p-8">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiUsers className="text-gray-400 text-3xl" />
                    </div>
                    <p className="text-gray-500 text-lg">Ma jiraan arday ku jira fasalkan</p>
                    <p className="text-gray-400 text-sm mt-2">Fadlan hubi fasalka ama ku dar arday</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isLoading || !students?.length}
                  className={`group relative inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 text-sm md:text-base font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isLoading || !students?.length 
                      ? 'bg-gray-400 cursor-not-allowed opacity-70' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Abuurka...
                    </>
                  ) : (
                    <>
                      <FiSave className="text-lg" />
                      Gudbi Imtixanka
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateClassExam;
