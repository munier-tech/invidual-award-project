import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiUsers, FiBook, FiSearch, FiDownload, FiPrinter,
  FiRefreshCw, FiChevronDown, FiUserCheck, FiUserX, FiUserMinus,
  FiGrid, FiList, FiAlertCircle, FiX, FiClock
} from 'react-icons/fi';
import { useDailyQuranStore } from '../../store/dailyQuranStore';
import useClassesStore from '../../store/classesStore';
import { toast } from 'react-hot-toast';

/* ------------------------------------------------------------------ */
/* Static data                                                         */
/* ------------------------------------------------------------------ */

const translations = {
  heading: 'Eeg Casharrada Quraanka Maalinle',
  subtitle: 'Maamul oo la soco horumarka ardayda ee casharrada Quraanka maalinle',
  selectClass: 'Dooro Fasalka',
  selectDate: 'Dooro Taariikhda',
  searchLabel: 'Raadi arday',
  searchRecords: 'Magac ama ID...',
  noRecords: 'Ma jiro diiwaan la heli karo',
  noMatches: 'Ma jiro arday ku habboon raadintaada',
  clearFilters: 'Tirtir shaandhada',
  loading: 'Soo dejinaya...',
  loadError: 'Khalad ayaa dhacay markii la soo dejinayay diiwaanka',
  retry: 'Isku day mar kale',
  refresh: 'Cusboonaysii',
  print: 'Daabac',
  exportShort: 'Soo deji',
  totalSessions: 'Wadarta Casharrada',
  totalStudents: 'Wadarta Ardayda',
  date: 'Taariikhda',
  class: 'Fasalka',
  student: 'Ardayga',
  lesson: 'Casharka',
  status: 'Heerka',
  notes: 'Qoraal',
  createdBy: 'Laga abuuray',
  actions: 'Tallaabooyin',
  viewDetails: 'Eeg Faahfaahin',
  all: 'Dhammaan',
  filterByStatus: 'Shaandhee heerka',
  noClassSelected: 'Fadlan dooro fasal si aad u aragto diiwaanka',
  noDateSelected: 'Fadlan dooro taariikh si aad u aragto diiwaanka',
  attendanceRate: 'Ka qaybgalka',
  comprehensionRate: 'Fahamka',
  lessonDetails: 'Faahfaahin Casharka',
  extraDetails: 'Qoraal dheeraad ah',
  surah: 'Suurada',
  verses: 'Aayadaha',
  none: 'Ma jiro',
  createdAt: 'La abuuray',
  updatedAt: 'La cusboonaysiiyay',
  noData: 'Ma jiro xog la soo dejin karo',
  exported: 'Xogta si guul leh ayaa loo soo dejiyay',
  unknownStudent: 'Arday aan la aqoon'
};

const statusConfig = {
  gartay: {
    label: 'Gartay',
    icon: FiUserCheck,
    badge: 'bg-green-50 text-green-700 border-green-200',
    soft: 'bg-green-50 text-green-700',
    tile: 'bg-green-50 border-green-200 text-green-700',
    accent: 'border-l-green-500',
    bar: 'bg-green-500'
  },
  'garan waayay': {
    label: 'Garan Waayay',
    icon: FiUserX,
    badge: 'bg-red-50 text-red-700 border-red-200',
    soft: 'bg-red-50 text-red-700',
    tile: 'bg-red-50 border-red-200 text-red-700',
    accent: 'border-l-red-500',
    bar: 'bg-red-500'
  },
  majoogo: {
    label: 'Majoogo',
    icon: FiUserMinus,
    badge: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    soft: 'bg-yellow-50 text-yellow-800',
    tile: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    accent: 'border-l-yellow-500',
    bar: 'bg-yellow-500'
  }
};

const fallbackStatus = {
  label: '-',
  icon: FiUserMinus,
  badge: 'bg-gray-50 text-gray-700 border-gray-200',
  soft: 'bg-gray-100 text-gray-600',
  tile: 'bg-gray-50 border-gray-200 text-gray-700',
  accent: 'border-l-gray-300',
  bar: 'bg-gray-400'
};

const STATUS_KEYS = ['gartay', 'garan waayay', 'majoogo'];

/* ------------------------------------------------------------------ */
/* Pure helpers                                                        */
/* ------------------------------------------------------------------ */

const getStatusConfig = (status) =>
  statusConfig[status] || { ...fallbackStatus, label: status || '-' };

// Local date (not UTC) so the default "today" is right after midnight too
const todayLocal = () => {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0];
};

const isEmpty = (v) => v === undefined || v === null || v === '';

const getRecordValue = (record, key, fallback = '') => {
  if (!isEmpty(record?.[key])) return record[key];
  if (!isEmpty(record?.session?.[key])) return record.session[key];
  return fallback;
};

const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString('so-SO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString || '-';
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleString('so-SO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString || '-';
  }
};

const versesText = (record) => {
  const from = getRecordValue(record, 'fromVerse', '');
  const to = getRecordValue(record, 'toVerse', '');
  if (isEmpty(from) && isEmpty(to)) return '-';
  return `${isEmpty(from) ? '-' : from} – ${isEmpty(to) ? '-' : to}`;
};

const convertToCSV = (data) => {
  const headers = Object.keys(data[0] || {});
  return [
    headers.join(','),
    ...data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(','))
  ].join('\n');
};

/* ------------------------------------------------------------------ */
/* Small presentational components (defined OUTSIDE the page so they   */
/* are not re-created on every render)                                 */
/* ------------------------------------------------------------------ */

const StatusBadge = ({ status }) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${config.badge}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {config.label}
    </span>
  );
};

const StatusAvatar = ({ status }) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.soft}`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </div>
  );
};

const CountTile = ({ status, value }) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  return (
    <div className={`rounded-xl border p-3 ${config.tile}`}>
      <div className="flex items-center gap-1.5 text-xs font-medium">
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{config.label}</span>
      </div>
      <p className="mt-1 text-2xl font-bold leading-none">{value}</p>
    </div>
  );
};

const RateTile = ({ label, value, barClass, textClass }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-3">
    <div className="flex items-baseline justify-between gap-2">
      <span className="truncate text-xs font-medium text-gray-600">{label}</span>
      <span className={`text-lg font-bold ${textClass}`}>{value}%</span>
    </div>
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
      <div
        className={`h-full rounded-full ${barClass}`}
        style={{ width: `${Math.min(100, Math.max(0, Number(value)))}%` }}
      />
    </div>
  </div>
);

const DetailList = ({ title, icon: Icon, iconClass, rows }) => (
  <div>
    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
      <Icon className={`h-4 w-4 ${iconClass}`} aria-hidden="true" />
      {title}
    </h4>
    <dl className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
      {rows.map(([label, value]) => (
        <React.Fragment key={label}>
          <dt className="text-gray-500">{label}</dt>
          <dd className="break-words font-medium text-gray-900">{value}</dd>
        </React.Fragment>
      ))}
    </dl>
  </div>
);

const RecordDetails = ({ record }) => (
  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
    <DetailList
      title={translations.lessonDetails}
      icon={FiBook}
      iconClass="text-green-600"
      rows={[
        [translations.date, formatDate(record.date)],
        [translations.class, record.class?.name || 'N/A'],
        [translations.surah, getRecordValue(record, 'surah', 'N/A')],
        [translations.verses, versesText(record)]
      ]}
    />
    <DetailList
      title={translations.extraDetails}
      icon={FiClock}
      iconClass="text-blue-600"
      rows={[
        [translations.notes, record.notes || translations.none],
        [translations.createdBy, record.createdBy?.username || '-'],
        [translations.createdAt, formatDateTime(record.createdAt)],
        [translations.updatedAt, formatDateTime(record.updatedAt)]
      ]}
    />
  </div>
);

const Expandable = ({ open, children }) => (
  <AnimatePresence initial={false}>
    {open && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

const RecordCard = ({ record, expanded, onToggle }) => {
  const config = getStatusConfig(record.status);
  const surah = getRecordValue(record, 'surah', '');

  return (
    <div
      className={`overflow-hidden rounded-xl border border-l-4 border-gray-200 bg-white shadow-sm print:shadow-none ${config.accent}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-start gap-3 p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 sm:p-4"
      >
        <StatusAvatar status={record.status} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">
                {record.student?.fullname || translations.unknownStudent}
              </p>
              <p className="truncate text-xs text-gray-500">
                ID: {record.student?.studentId || 'N/A'}
              </p>
            </div>
            <StatusBadge status={record.status} />
          </div>

          <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-700">
            <FiBook className="h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
            <span className="truncate">
              {surah || '-'}
              {versesText(record) !== '-' && (
                <span className="text-gray-500"> · {versesText(record)}</span>
              )}
            </span>
          </p>

          <div className="mt-1.5 flex items-center justify-between text-xs text-gray-500">
            <span className="truncate">{record.createdBy?.username || '-'}</span>
            <span className="flex items-center gap-1 font-medium text-blue-600">
              {translations.viewDetails}
              <FiChevronDown
                className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
      </button>

      <Expandable open={expanded}>
        <div className="border-t border-gray-100 bg-gray-50 p-3 sm:p-4">
          <RecordDetails record={record} />
        </div>
      </Expandable>
    </div>
  );
};

const EmptyState = ({ icon: Icon, text, action }) => (
  <div className="px-4 py-12 text-center sm:py-16">
    <Icon className="mx-auto h-12 w-12 text-gray-300 sm:h-14 sm:w-14" aria-hidden="true" />
    <p className="mx-auto mt-4 max-w-sm text-base text-gray-600">{text}</p>
    {action}
  </div>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const ViewDailyQuranRecords = () => {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayLocal);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedRecords, setExpandedRecords] = useState({});
  const [viewMode, setViewMode] = useState('table'); // only affects screens >= md

  const { classSessionsByDate, getClassSessionsByDate, loading, error } = useDailyQuranStore();
  const { classes, fetchClasses } = useClassesStore();

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const loadRecords = useCallback(async () => {
    if (!selectedClassId || !selectedDate) return;
    try {
      await getClassSessionsByDate(selectedClassId, selectedDate);
    } catch (err) {
      console.error('Error loading records:', err);
      toast.error(translations.loadError);
    }
  }, [selectedClassId, selectedDate, getClassSessionsByDate]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Collapse open rows whenever the data set changes
  useEffect(() => {
    setExpandedRecords({});
  }, [selectedClassId, selectedDate]);

  const records = useMemo(() => classSessionsByDate || [], [classSessionsByDate]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records.filter((record) => {
      const matchesSearch =
        !q ||
        record.student?.fullname?.toLowerCase().includes(q) ||
        record.student?.studentId?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [records, searchQuery, statusFilter]);

  // Stats describe the whole class/day, not just what the filters are showing
  const stats = useMemo(() => {
    const total = records.length;
    const gartay = records.filter((r) => r.status === 'gartay').length;
    const garanWaayay = records.filter((r) => r.status === 'garan waayay').length;
    const majoogo = records.filter((r) => r.status === 'majoogo').length;
    return {
      total,
      gartay,
      garanWaayay,
      majoogo,
      students: new Set(records.map((r) => r.student?._id)).size,
      comprehensionRate: total > 0 ? ((gartay / total) * 100).toFixed(1) : '0.0',
      attendanceRate: total > 0 ? (((gartay + garanWaayay) / total) * 100).toFixed(1) : '0.0'
    };
  }, [records]);

  const countByStatus = {
    all: stats.total,
    gartay: stats.gartay,
    'garan waayay': stats.garanWaayay,
    majoogo: stats.majoogo
  };

  const selectedClass = classes.find((cls) => cls._id === selectedClassId);
  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all';

  const toggleRecordExpansion = (id) =>
    setExpandedRecords((prev) => ({ ...prev, [id]: !prev[id] }));

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const handlePrint = () => window.print();

  const handleExport = () => {
    if (filteredRecords.length === 0) {
      toast.error(translations.noData);
      return;
    }

    const data = filteredRecords.map((record) => ({
      'Student Name': record.student?.fullname,
      'Student ID': record.student?.studentId,
      Status: getStatusConfig(record.status).label,
      Date: formatDate(record.date),
      Class: record.class?.name,
      Surah: getRecordValue(record, 'surah', ''),
      'From-To': versesText(record),
      Notes: getRecordValue(record, 'notes', ''),
      'Created By': record.createdBy?.username
    }));

    // BOM so Excel opens the UTF-8 file correctly
    const blob = new Blob(['\uFEFF' + convertToCSV(data)], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quran_records_${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(translations.exported);
  };

  const inputClass =
    'w-full min-h-[44px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 ' +
    'focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm';

  const renderResults = () => {
    if (loading) {
      return (
        <div className="px-4 py-12 text-center">
          <FiRefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
          <p className="mt-4 text-gray-600" role="status">{translations.loading}</p>
        </div>
      );
    }

    if (!selectedClassId) {
      return <EmptyState icon={FiUsers} text={translations.noClassSelected} />;
    }

    if (!selectedDate) {
      return <EmptyState icon={FiCalendar} text={translations.noDateSelected} />;
    }

    if (error && records.length === 0) {
      return (
        <EmptyState
          icon={FiAlertCircle}
          text={typeof error === 'string' ? error : translations.loadError}
          action={
            <button
              type="button"
              onClick={loadRecords}
              className="mt-4 min-h-[44px] rounded-lg bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700"
            >
              {translations.retry}
            </button>
          }
        />
      );
    }

    if (records.length === 0) {
      return <EmptyState icon={FiBook} text={translations.noRecords} />;
    }

    if (filteredRecords.length === 0) {
      return (
        <EmptyState
          icon={FiSearch}
          text={translations.noMatches}
          action={
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 min-h-[44px] rounded-lg border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {translations.clearFilters}
            </button>
          }
        />
      );
    }

    const cards = (
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-3'
            : 'space-y-3 p-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0 sm:p-4 md:hidden'
        }
      >
        {filteredRecords.map((record) => (
          <RecordCard
            key={record._id}
            record={record}
            expanded={!!expandedRecords[record._id]}
            onToggle={() => toggleRecordExpansion(record._id)}
          />
        ))}
      </div>
    );

    if (viewMode === 'grid') return cards;

    return (
      <>
        {/* Phones & small tablets: cards */}
        {cards}

        {/* md and up: table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[translations.student, translations.status, translations.lesson, translations.createdBy, translations.actions].map(
                  (h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 lg:px-6"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredRecords.map((record) => {
                const expanded = !!expandedRecords[record._id];
                return (
                  <React.Fragment key={record._id}>
                    <tr
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                      onClick={() => toggleRecordExpansion(record._id)}
                    >
                      <td className="px-4 py-3 lg:px-6">
                        <div className="flex items-center gap-3">
                          <StatusAvatar status={record.status} />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-gray-900">
                              {record.student?.fullname || translations.unknownStudent}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {record.student?.studentId || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 lg:px-6">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 lg:px-6">
                        <div className="font-medium">{getRecordValue(record, 'surah', '-')}</div>
                        <div className="text-xs text-gray-500">{versesText(record)}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 lg:px-6">
                        {record.createdBy?.username || 'System'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm lg:px-6">
                        <button
                          type="button"
                          aria-expanded={expanded}
                          className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                          <FiChevronDown
                            className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                          />
                          {translations.viewDetails}
                        </button>
                      </td>
                    </tr>
                    {expanded && (
                      <tr>
                        <td colSpan={5} className="bg-gray-50 px-4 py-4 lg:px-6">
                          <RecordDetails record={record} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8">
        {/* Header */}
        <header className="mb-4 flex items-start justify-between gap-3 sm:mb-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white sm:h-12 sm:w-12">
              <FiBook className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-3xl">
                {translations.heading}
              </h1>
              <p className="mt-1 text-sm text-gray-600">{translations.subtitle}</p>
            </div>
          </div>

          <div
            className="hidden shrink-0 items-center gap-1 rounded-lg bg-white p-1 shadow-sm md:flex print:hidden"
            role="group"
            aria-label="View mode"
          >
            {[
              ['table', FiList, 'Table'],
              ['grid', FiGrid, 'Grid']
            ].map(([mode, Icon, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                aria-label={label}
                aria-pressed={viewMode === mode}
                className={`rounded-md p-2 transition-colors ${
                  viewMode === mode ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </header>

        {/* Filters */}
        <section className="mb-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-md sm:mb-6 sm:p-5 print:hidden">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="class-select" className="mb-1.5 block text-sm font-semibold text-gray-700">
                {translations.selectClass}
              </label>
              <select
                id="class-select"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className={inputClass}
              >
                <option value="">{translations.selectClass}</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} - {cls.subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date-select" className="mb-1.5 block text-sm font-semibold text-gray-700">
                {translations.selectDate}
              </label>
              <input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="search-input" className="mb-1.5 block text-sm font-semibold text-gray-700">
                {translations.searchLabel}
              </label>
              <div className="relative">
                <FiSearch
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="search-input"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={translations.searchRecords}
                  className={`${inputClass} pl-10 ${searchQuery ? 'pr-10' : ''}`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label={translations.clearFilters}
                    className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:text-gray-600"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <button
              type="button"
              onClick={loadRecords}
              disabled={loading || !selectedClassId || !selectedDate}
              className="flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-lg bg-blue-600 px-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-row sm:gap-2 sm:px-5 sm:text-sm"
            >
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              {translations.refresh}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-2 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:flex-row sm:gap-2 sm:px-5 sm:text-sm"
            >
              <FiPrinter className="h-4 w-4" aria-hidden="true" />
              {translations.print}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-2 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:flex-row sm:gap-2 sm:px-5 sm:text-sm"
            >
              <FiDownload className="h-4 w-4" aria-hidden="true" />
              {translations.exportShort}
            </button>
          </div>
        </section>

        {/* Summary */}
        {selectedClass && records.length > 0 && !loading && (
          <section className="mb-4 space-y-3 sm:mb-6" aria-label="Summary">
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white shadow-lg sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold sm:text-xl">
                    {selectedClass.name} - {selectedClass.subject}
                  </h2>
                  <p className="mt-1 flex items-center gap-2 text-sm text-blue-100">
                    <FiCalendar aria-hidden="true" />
                    {formatDate(selectedDate)}
                  </p>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-2xl font-bold leading-none">{stats.total}</p>
                    <p className="mt-1 text-xs text-blue-100">{translations.totalSessions}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold leading-none">{stats.students}</p>
                    <p className="mt-1 text-xs text-blue-100">{translations.totalStudents}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <CountTile status="gartay" value={stats.gartay} />
              <CountTile status="garan waayay" value={stats.garanWaayay} />
              <CountTile status="majoogo" value={stats.majoogo} />
            </div>

            <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:gap-3">
              <RateTile
                label={translations.comprehensionRate}
                value={stats.comprehensionRate}
                barClass="bg-purple-500"
                textClass="text-purple-700"
              />
              <RateTile
                label={translations.attendanceRate}
                value={stats.attendanceRate}
                barClass="bg-blue-500"
                textClass="text-blue-700"
              />
            </div>
          </section>
        )}

        {/* Results */}
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md">
          {selectedClassId && records.length > 0 && !loading && (
            <div className="border-b border-gray-100 p-3 sm:px-5 print:hidden">
              <div
                className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                role="group"
                aria-label={translations.filterByStatus}
              >
                {['all', ...STATUS_KEYS].map((key) => {
                  const active = statusFilter === key;
                  const label = key === 'all' ? translations.all : getStatusConfig(key).label;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setStatusFilter(key)}
                      aria-pressed={active}
                      className={`flex min-h-[40px] shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors ${
                        active
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {countByStatus[key]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {hasActiveFilters && (
                <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {filteredRecords.length} / {records.length}
                  </span>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    {translations.clearFilters}
                  </button>
                </div>
              )}
            </div>
          )}

          {renderResults()}
        </section>
      </div>
    </div>
  );
};

export default ViewDailyQuranRecords;
