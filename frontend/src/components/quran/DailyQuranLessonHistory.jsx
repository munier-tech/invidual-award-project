import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiUsers, FiSearch, FiArrowLeft, FiLoader, FiEye } from 'react-icons/fi';
import useClassesStore from '../../store/classesStore';
import { useDailyQuranStore } from '../../store/dailyQuranStore';
import { toast } from 'react-hot-toast';

const translations = {
  heading: 'Eeg Taariikhda Casharrada Quraanka',
  selectClass: 'Dooro Fasalka',
  selectDate: 'Dooro Taariikhda',
  studentName: 'Magaca Ardayga',
  studentId: 'Lambarka Ardayga',
  status: 'Heerka Casharka',
  suura: 'Suura',
  fromTo: 'From-To',
  notes: 'Qoraal',
  noRecords: 'Ma jiraan casharro la diiwaangeliyay taariikhdan.',
  loading: 'Soo dejineyn...',
  back: 'Ku Noqo Abuur Cashar',
  searchClass: 'Raadi fasalka...',
  load: 'Soo deji',
  recordsFound: 'Casharro la helay'
};

const DailyQuranLessonHistory = () => {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const { classes, fetchClasses } = useClassesStore();
  const { classSessionsByDate, getClassSessionsByDate, clearDateSessions, loading } = useDailyQuranStore();

  useEffect(() => {
    const loadClasses = async () => {
      setLoadingClasses(true);
      try {
        await fetchClasses();
      } catch (error) {
        toast.error('Khalad ayaa dhacay markii la soo dejinayay fasallada');
      } finally {
        setLoadingClasses(false);
      }
    };

    loadClasses();
    return () => clearDateSessions();
  }, [fetchClasses, clearDateSessions]);

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cls.level && cls.level.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDateForDisplay = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('so-SO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const loadHistory = async (classId, date) => {
    if (!classId || !date) return;
    setIsLoadingHistory(true);
    try {
      const result = await getClassSessionsByDate(classId, date);
      if (!result.success) {
        toast.error(result.error || 'Khalad ayaa dhacay');
      }
    } catch (error) {
      toast.error('Khalad ayaa dhacay markii la soo dejinayay taariikhda');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleClassSelect = async (classId) => {
    setSelectedClassId(classId);
    await loadHistory(classId, selectedDate);
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    if (selectedClassId) {
      await loadHistory(selectedClassId, date);
    }
  };

  const selectedClass = classes.find((cls) => cls._id === selectedClassId);
  const sessions = classSessionsByDate || [];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <FiEye className="mr-2" />
                {translations.heading}
              </h1>
              <p className="mt-1 text-blue-100">Eeg casharrada quraanka ee fasalka iyo taariikhda aad dooratay.</p>
            </div>
            <Link
              to="/CreateDailyQuranSession"
              className="px-4 py-3 bg-white text-blue-700 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors min-h-[44px]"
            >
              <FiArrowLeft className="mr-2" /> {translations.back}
            </Link>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <FiUsers className="mr-2" /> {translations.selectClass}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={translations.searchClass}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {loadingClasses ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <FiLoader className="animate-spin" /> {translations.loading}
                  </div>
                ) : filteredClasses.length === 0 ? (
                  <div className="text-gray-500 p-3 bg-gray-50 rounded-lg">Lama helin fasalo.</div>
                ) : (
                  filteredClasses.map((cls) => (
                    <button
                      key={cls._id}
                      type="button"
                      onClick={() => handleClassSelect(cls._id)}
                      className={`w-full text-left px-4 py-3 rounded-lg border ${selectedClassId === cls._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'} hover:bg-blue-50`}
                    >
                      <div className="font-medium">{cls.name}</div>
                      {cls.level && <div className="text-xs text-gray-500">Darajo: {cls.level}</div>}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <FiCalendar className="mr-2" /> {translations.selectDate}
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedClass?.name || 'Fasalka aan la dooran'}</h2>
                <p className="text-sm text-gray-500">{formatDateForDisplay(selectedDate)}</p>
              </div>
              <button
                onClick={() => loadHistory(selectedClassId, selectedDate)}
                disabled={!selectedClassId || loading || isLoadingHistory}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[44px]"
              >
                {isLoadingHistory ? (
                  <span className="flex items-center gap-2"><FiLoader className="animate-spin" /> {translations.loading}</span>
                ) : (
                  <span className="flex items-center gap-2"><FiEye /> {translations.load}</span>
                )}
              </button>
            </div>

            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
              {loading || isLoadingHistory ? (
                <div className="p-8 text-center text-gray-500">{translations.loading}</div>
              ) : sessions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">{translations.noRecords}</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">#</th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">{translations.studentName}</th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">{translations.studentId}</th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">{translations.suura}</th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">{translations.fromTo}</th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">{translations.notes}</th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">{translations.status}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sessions.map((record, index) => {
                      const student = record.student || {};
                      return (
                        <tr key={`${student._id || student.studentId || index}-${index}`}>
                          <td className="px-3 py-3 text-sm text-gray-700">{index + 1}</td>
                          <td className="px-3 py-3 text-sm text-gray-900">{student.fullname || student.name || '-'}</td>
                          <td className="px-3 py-3 text-sm text-gray-700">{student.studentId || '-'}</td>
                          <td className="px-3 py-3 text-sm text-gray-700">{record.surah || '-'}</td>
                          <td className="px-3 py-3 text-sm text-gray-700">{record.fromVerse || record.toVerse ? `${record.fromVerse || '-'} - ${record.toVerse || '-'}` : '-'}</td>
                          <td className="px-3 py-3 text-sm text-gray-700">{record.notes || '-'}</td>
                          <td className="px-3 py-3 text-sm text-gray-700">{record.status === 'gartay' ? 'Gartay' : record.status === 'garan waayay' ? 'Garan Waayay' : 'Majoogo'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyQuranLessonHistory;
