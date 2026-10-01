import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCalendar, FiCheck, FiX, FiClock, FiUsers, FiBook, FiEye, FiPrinter,
  FiSave, FiChevronDown, FiChevronLeft, FiChevronRight, FiRotateCw,
  FiDownload, FiLoader, FiSearch, FiInfo, FiAlertCircle, FiPhone
} from 'react-icons/fi';
import useClassesStore from '../../store/classesStore';
import useStudentsStore from '../../store/studentsStore';
import { useDailyQuranStore } from '../../store/dailyQuranStore';
import { toast } from 'react-hot-toast';

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */

const translations = {
  heading: 'Abuur Cashar Quraan Maalinle',
  subheading: 'Deji casharrada quraanka maalinle ee ardayda fasalka',
  selectClass: 'Dooro Fasalka',
  searchClass: 'Raadi fasalka...',
  selectDate: 'Dooro Taariikhda',
  studentName: 'Magaca Ardayga',
  studentId: 'Lambarka Ardayga',
  phone: 'Taleefoonka',
  status: 'Heerka Casharka',
  gartay: 'Gartay',
  garanWaayay: 'Garan Waayay',
  majoogo: 'Majoogo',
  submitAll: 'Diiwaan Geli Dhammaan',
  submitSingle: 'Diiwaan Geli',
  loading: 'Soo dejinaya...',
  saving: 'Keydinaya...',
  noClasses: 'Ma jiro fasallo la heli karo',
  noClassesHint: 'Fadlan hubi in aad leedahay fasallo ama internet-kaaga iska hubi.',
  noStudents: 'Fasalkan ma laha arday',
  noStudentsHint: 'Fasalkan ma laha arday diiwaan gashan.',
  error: 'Qalad ayaa dhacay',
  creating: 'Diiwaangeli...',
  totalStudents: 'Wadarta Ardayda',
  passed: 'Gartay',
  failed: 'Garan Waayay',
  absent: 'Majoogo',
  alreadySaved: 'Hore u diiwaan gashan',
  refresh: 'Cusboonaysii',
  selectAll: 'Dooro Dhammaan',
  viewSessions: 'Eeg Casharrada',
  printReport: 'Daabac Warbixinta',
  reportTitle: 'Warbixinta Casharrada Quraanka Maalinle',
  class: 'Fasalka',
  date: 'Taariikhda',
  generatedOn: 'Lagu sameeyay',
  downloadPDF: 'Soo dejiso PDF',
  print: 'Daabac',
  close: 'Xidh',
  success: 'Guul',
  lesson: 'Casharka',
  lessonTitle: 'Faahfaahin Casharka Quraanka',
  lessonHint: 'Waxaa loo isticmaali doonaa ardayda aan lahayn qoraal u gaar ah.',
  surah: 'Suura',
  from: 'Laga bilaabo',
  to: 'Ilaa',
  notes: 'Qoraal dheeraad ah',
  unsaved: 'isbeddel aan la keydin',
  savedBadge: 'La keydiyay',
  unsavedBadge: 'Aan la keydin',
  noSessionsForDate: 'Ma jiro casharro diiwaan gashan taariikhdan',
  loadingDateData: 'Soo dejineynaa xogta taariikhdan...',
  loadFailed: 'Khalad ayaa dhacay markii la soo dejinayay casharrada',
  retry: 'Isku day mar kale',
  discardConfirm: 'Isbeddelada aan la keydin waa la tirtiri doonaa. Sii wad?',
  popupBlocked: 'Fadlan oggolow daaqadaha furmaya (pop-ups) si aad u daabacdo',
  noData: 'Ma jiro xog la daabici karo'
};

const STATUS_KEYS = ['gartay', 'garan waayay', 'majoogo'];

const STATUS = {
  gartay: {
    label: translations.gartay,
    icon: FiCheck,
    text: 'text-green-700',
    accent: 'border-l-green-500',
    active: 'bg-green-600 border-green-600 text-white',
    idle: 'bg-white border-gray-300 text-gray-700 hover:bg-green-50 active:bg-green-100',
    rpt: 'g'
  },
  'garan waayay': {
    label: translations.garanWaayay,
    icon: FiX,
    text: 'text-red-700',
    accent: 'border-l-red-500',
    active: 'bg-red-600 border-red-600 text-white',
    idle: 'bg-white border-gray-300 text-gray-700 hover:bg-red-50 active:bg-red-100',
    rpt: 'r'
  },
  majoogo: {
    label: translations.majoogo,
    icon: FiClock,
    text: 'text-yellow-700',
    accent: 'border-l-yellow-500',
    active: 'bg-yellow-500 border-yellow-500 text-white',
    idle: 'bg-white border-gray-300 text-gray-700 hover:bg-yellow-50 active:bg-yellow-100',
    rpt: 'y'
  }
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const toLocalISO = (d) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const todayLocal = () => toLocalISO(new Date());

const shiftDate = (iso, days) => {
  const [y, m, d] = iso.split('-').map(Number);
  return toLocalISO(new Date(y, m - 1, d + days));
};

// Returns YYYY-MM-DD for any date value coming from the form or the API
const normalizeDate = (value) => {
  if (!value) return '';
  if (
    typeof value === 'string' &&
    (/^\d{4}-\d{2}-\d{2}$/.test(value) || /^\d{4}-\d{2}-\d{2}T00:00:00(\.000)?Z$/.test(value))
  ) {
    return value.slice(0, 10);
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? '' : toLocalISO(d);
};

const formatDateForDisplay = (value) => {
  const n = normalizeDate(value);
  if (!n) return value || '-';
  const [y, m, d] = n.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('so-SO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const REPORT_CSS = `
*{-webkit-print-color-adjust:exact;print-color-adjust:exact}
.rpt{font-family:Arial,sans-serif;color:#111827;font-size:12px;line-height:1.4}
.rpt h1{font-size:22px;color:#1a56db;margin:0 0 4px}
.rpt .sub{color:#4b5563;font-size:14px;margin:0}
.rpt .head{text-align:center;border-bottom:2px solid #111827;padding-bottom:14px;margin-bottom:18px}
.rpt .meta{display:flex;justify-content:space-between;gap:16px;background:#f9fafb;border-radius:8px;padding:12px;margin-bottom:18px}
.rpt .meta div div{margin:3px 0}
.rpt .meta b{color:#374151;margin-right:6px}
.rpt .stats{display:flex;gap:10px;margin-bottom:18px}
.rpt .stat{flex:1;text-align:center;border-radius:8px;padding:10px;border:1px solid}
.rpt .stat strong{display:block;font-size:22px}
.rpt .g{background:#d1fae5;border-color:#10b981}
.rpt .r{background:#fee2e2;border-color:#ef4444}
.rpt .y{background:#fef3c7;border-color:#f59e0b}
.rpt .b{background:#dbeafe;border-color:#3b82f6}
.rpt table{width:100%;border-collapse:collapse}
.rpt th{background:#f3f4f6;text-align:left}
.rpt th,.rpt td{border:1px solid #d1d5db;padding:7px 8px;vertical-align:top}
.rpt tr:nth-child(even) td{background:#f9fafb}
.rpt .tag{font-weight:bold;padding:2px 7px;border-radius:4px;white-space:nowrap}
.rpt .tag.g{color:#065f46}.rpt .tag.r{color:#991b1b}.rpt .tag.y{color:#92400e}
.rpt .foot{margin-top:24px;padding-top:12px;border-top:1px solid #d1d5db;text-align:center;color:#6b7280;font-size:11px}
`;

const inputCls =
  'w-full min-h-[44px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm';

const cellInputCls =
  'w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

/* ------------------------------------------------------------------ */
/* Small components (outside the page so they are not re-created)      */
/* ------------------------------------------------------------------ */

const Field = ({ label, className = '', children }) => (
  <label className={`block ${className}`}>
    <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
    {children}
  </label>
);

const Stat = ({ label, value, tone, className = '' }) => (
  <div className={`rounded-lg border p-3 ${tone} ${className}`}>
    <div className="text-xs font-medium">{label}</div>
    <div className="text-xl font-bold">{value}</div>
  </div>
);

const StatusSegmented = ({ value, onChange, compact = false }) => (
  <div role="radiogroup" aria-label={translations.status} className="grid grid-cols-3 gap-1.5">
    {STATUS_KEYS.map((key) => {
      const cfg = STATUS[key];
      const Icon = cfg.icon;
      const active = value === key;
      return (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(key)}
          className={`flex items-center justify-center rounded-lg border font-medium transition-colors ${
            compact
              ? 'min-h-[36px] gap-1 px-2 text-xs'
              : 'min-h-[48px] flex-col gap-0.5 px-1 text-xs min-[400px]:flex-row min-[400px]:gap-1.5 sm:text-sm'
          } ${active ? cfg.active : cfg.idle}`}
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{cfg.label}</span>
        </button>
      );
    })}
  </div>
);

const SaveBadge = ({ record }) =>
  record.dirty ? (
    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
      {translations.unsavedBadge}
    </span>
  ) : record.sessionId ? (
    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
      {translations.savedBadge}
    </span>
  ) : null;

const StudentCard = ({ record, index, lesson, onStatus, onField, onSave, saving }) => {
  const [open, setOpen] = useState(() =>
    Boolean(record.surah || record.fromVerse || record.toVerse || record.notes)
  );
  const cfg = STATUS[record.status] || STATUS.majoogo;

  return (
    <div className={`rounded-xl border border-l-4 border-gray-200 bg-white p-3 shadow-sm ${cfg.accent}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900">
            <span className="mr-1.5 text-gray-400">{index + 1}.</span>
            {record.name}
          </p>
          <p className="text-xs text-gray-500">ID: {record.studentId || '-'}</p>
          {record.phone && (
            <a
              href={`tel:${record.phone}`}
              className="mt-0.5 inline-flex items-center gap-1 text-xs text-blue-600"
            >
              <FiPhone className="h-3 w-3" aria-hidden="true" />
              {record.phone}
            </a>
          )}
        </div>
        <SaveBadge record={record} />
      </div>

      <div className="mt-3">
        <StatusSegmented value={record.status} onChange={onStatus} />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 active:bg-gray-100"
        >
          {translations.lesson}
          <FiChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50"
        >
          {saving ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiSave className="h-4 w-4" />}
          {saving ? translations.saving : translations.submitSingle}
        </button>
      </div>

      {open && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Field label={translations.surah} className="col-span-2">
            <input
              type="text"
              value={record.surah}
              onChange={(e) => onField('surah', e.target.value)}
              placeholder={lesson.surah || translations.surah}
              className={inputCls}
            />
          </Field>
          <Field label={translations.from}>
            <input
              type="text"
              inputMode="numeric"
              value={record.fromVerse}
              onChange={(e) => onField('fromVerse', e.target.value)}
              placeholder={lesson.fromVerse || '1'}
              className={inputCls}
            />
          </Field>
          <Field label={translations.to}>
            <input
              type="text"
              inputMode="numeric"
              value={record.toVerse}
              onChange={(e) => onField('toVerse', e.target.value)}
              placeholder={lesson.toVerse || '7'}
              className={inputCls}
            />
          </Field>
          <Field label={translations.notes} className="col-span-2">
            <input
              type="text"
              value={record.notes}
              onChange={(e) => onField('notes', e.target.value)}
              placeholder={lesson.notes || translations.notes}
              className={inputCls}
            />
          </Field>
        </div>
      )}
    </div>
  );
};

const StudentRow = ({ record, index, lesson, onStatus, onField, onSave, saving }) => (
  <tr className={record.sessionId && !record.dirty ? 'bg-blue-50/50' : 'bg-white'}>
    <td className="py-3 pl-4 pr-2 text-sm font-medium text-gray-500">{index + 1}</td>
    <td className="px-3 py-3">
      <div className="text-sm font-medium text-gray-900">{record.name}</div>
      <div className="text-xs text-gray-500">
        {record.studentId}
        {record.phone ? ` · ${record.phone}` : ''}
      </div>
      <div className="mt-1">
        <SaveBadge record={record} />
      </div>
    </td>
    <td className="px-3 py-3">
      <input
        type="text"
        value={record.surah}
        onChange={(e) => onField('surah', e.target.value)}
        placeholder={lesson.surah || translations.surah}
        className={`${cellInputCls} min-w-[120px]`}
      />
    </td>
    <td className="px-3 py-3">
      <div className="flex items-center gap-1">
        <input
          type="text"
          inputMode="numeric"
          value={record.fromVerse}
          onChange={(e) => onField('fromVerse', e.target.value)}
          placeholder={lesson.fromVerse || '1'}
          className={`${cellInputCls} w-16`}
        />
        <span className="text-gray-400">–</span>
        <input
          type="text"
          inputMode="numeric"
          value={record.toVerse}
          onChange={(e) => onField('toVerse', e.target.value)}
          placeholder={lesson.toVerse || '7'}
          className={`${cellInputCls} w-16`}
        />
      </div>
    </td>
    <td className="px-3 py-3">
      <input
        type="text"
        value={record.notes}
        onChange={(e) => onField('notes', e.target.value)}
        placeholder={lesson.notes || translations.notes}
        className={`${cellInputCls} min-w-[140px]`}
      />
    </td>
    <td className="px-3 py-3" style={{ minWidth: 300 }}>
      <StatusSegmented value={record.status} onChange={onStatus} compact />
    </td>
    <td className="py-3 pl-3 pr-4">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        aria-label={translations.submitSingle}
        className="flex min-h-[36px] items-center gap-1.5 rounded-md bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? <FiLoader className="h-3.5 w-3.5 animate-spin" /> : <FiSave className="h-3.5 w-3.5" />}
        {translations.submitSingle}
      </button>
    </td>
  </tr>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const CreateDailyQuranSession = () => {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayLocal);
  const [lesson, setLesson] = useState({ surah: '', fromVerse: '', toVerse: '', notes: '' });
  const [quranRecords, setQuranRecords] = useState([]);
  const [loadedClassId, setLoadedClassId] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [dateStatus, setDateStatus] = useState('idle'); // idle | loading | ok | error
  const [savingId, setSavingId] = useState(null);
  const [savingAll, setSavingAll] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const sessionsReq = useRef(0);
  const studentsReq = useRef(0);

  const { classes, fetchClasses } = useClassesStore();
  const { students, fetchStudentsByClass } = useStudentsStore();
  const {
    createDailyQuran,
    createBulkDailyQuran,
    updateDailyQuran,
    getClassSessionsByDate,
    classSessionsByDate,
    resetForNewDate
  } = useDailyQuranStore();

  /* ---------- classes ---------- */

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingClasses(true);
      try {
        await fetchClasses();
      } catch (err) {
        console.error('Error loading classes:', err);
        toast.error('Khalad ayaa dhacay markii la soo dejinayay fasallada');
      } finally {
        if (active) setLoadingClasses(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [fetchClasses]);

  useEffect(() => {
    if (!isClassDropdownOpen) return undefined;
    const onPointer = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsClassDropdownOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setIsClassDropdownOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    // Only auto-focus on desktop, so the phone keyboard does not cover the list
    if (window.matchMedia?.('(pointer: fine)').matches) searchRef.current?.focus();
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [isClassDropdownOpen]);

  useEffect(() => {
    if (!showPrintModal) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showPrintModal]);

  const filteredClasses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return classes.filter(
      (cls) => !q || cls.name?.toLowerCase().includes(q) || cls.level?.toLowerCase().includes(q)
    );
  }, [classes, searchQuery]);

  const selectedClass = classes.find((c) => c._id === selectedClassId);

  /* ---------- students + sessions loading ---------- */

  const loadStudents = useCallback(async () => {
    if (!selectedClassId) return;
    const id = ++studentsReq.current;
    setLoadingStudents(true);
    setLoadedClassId('');
    try {
      await fetchStudentsByClass(selectedClassId);
      if (id === studentsReq.current) setLoadedClassId(selectedClassId);
    } catch (err) {
      console.error('Error loading students:', err);
      toast.error('Khalad ayaa dhacay markii laga soo saaray ardayda');
    } finally {
      if (id === studentsReq.current) setLoadingStudents(false);
    }
  }, [selectedClassId, fetchStudentsByClass]);

  const fetchSessions = useCallback(
    async (silent = false) => {
      if (!selectedClassId || !selectedDate) return;
      const id = ++sessionsReq.current;
      if (!silent) {
        setDateStatus('loading');
        resetForNewDate();
      }
      try {
        const result = await getClassSessionsByDate(selectedClassId, selectedDate);
        if (id !== sessionsReq.current) return; // a newer request replaced this one
        if (result?.success) {
          setDateStatus('ok');
        } else {
          setDateStatus('error');
          toast.error(result?.error || translations.error);
        }
      } catch (err) {
        if (id !== sessionsReq.current) return;
        console.error('Error loading date sessions:', err);
        setDateStatus('error');
        toast.error(translations.loadFailed);
      }
    },
    [selectedClassId, selectedDate, getClassSessionsByDate, resetForNewDate]
  );

  useEffect(() => {
    if (!selectedClassId) {
      setLoadedClassId('');
      return;
    }
    loadStudents();
  }, [selectedClassId, loadStudents]);

  useEffect(() => {
    if (!selectedClassId) {
      setDateStatus('idle');
      return;
    }
    fetchSessions(false);
  }, [selectedClassId, fetchSessions]);

  /* ---------- build editable records ----------
     NOTE: the shared lesson fields are intentionally NOT a dependency here,
     so typing in them no longer wipes the statuses you already marked.       */

  useEffect(() => {
    if (!selectedClassId || loadedClassId !== selectedClassId || dateStatus !== 'ok') {
      setQuranRecords([]);
      return;
    }

    const day = normalizeDate(selectedDate);
    const byStudent = new Map();
    (classSessionsByDate || []).forEach((s) => {
      if (normalizeDate(s.date) === day) byStudent.set(s.student?._id || s.student, s);
    });

    setQuranRecords((prev) =>
      (students || []).map((student) => {
        const old = prev.find((r) => r.student === student._id);
        if (old?.dirty) return old; // keep unsaved edits when data reloads
        const s = byStudent.get(student._id);
        return {
          student: student._id,
          name: student.fullname,
          studentId: student.studentId,
          phone: student.motherNumber || student.fatherNumber || '',
          status: s?.status || 'majoogo',
          sessionId: s?._id || null,
          surah: s?.surah || '',
          fromVerse: s?.fromVerse || '',
          toVerse: s?.toVerse || '',
          notes: s?.notes || '',
          dirty: false
        };
      })
    );
  }, [selectedClassId, loadedClassId, dateStatus, students, classSessionsByDate, selectedDate]);

  /* ---------- derived ---------- */

  const statistics = useMemo(() => {
    const total = quranRecords.length;
    const count = (s) => quranRecords.filter((r) => r.status === s).length;
    const gartay = count('gartay');
    return {
      total,
      gartay,
      garanWaayay: count('garan waayay'),
      majoogo: count('majoogo'),
      existing: quranRecords.filter((r) => r.sessionId).length,
      unsaved: quranRecords.filter((r) => r.dirty).length,
      successRate: total > 0 ? ((gartay / total) * 100).toFixed(1) : '0.0'
    };
  }, [quranRecords]);

  const ready = Boolean(selectedClassId) && dateStatus === 'ok' && quranRecords.length > 0;
  const busy = Boolean(selectedClassId) && (loadingStudents || dateStatus === 'loading');
  const noStudents =
    Boolean(selectedClassId) &&
    !loadingStudents &&
    loadedClassId === selectedClassId &&
    dateStatus === 'ok' &&
    (students || []).length === 0;

  const lessonOf = (r) => ({
    surah: r.surah || lesson.surah,
    fromVerse: r.fromVerse || lesson.fromVerse,
    toVerse: r.toVerse || lesson.toVerse,
    notes: r.notes || lesson.notes
  });

  const lessonText = (r) => {
    const l = lessonOf(r);
    const verses = l.fromVerse || l.toVerse ? `${l.fromVerse || '-'} – ${l.toVerse || '-'}` : '';
    return [l.surah, verses].filter(Boolean).join(' · ') || '-';
  };

  /* ---------- handlers ---------- */

  const confirmDiscard = () => statistics.unsaved === 0 || window.confirm(translations.discardConfirm);

  const selectClass = (id) => {
    setIsClassDropdownOpen(false);
    setSearchQuery('');
    if (id === selectedClassId) return;
    if (!confirmDiscard()) return;
    setSelectedClassId(id);
  };

  const changeDate = (value) => {
    if (!value || value === selectedDate) return;
    if (!confirmDiscard()) return;
    setSelectedDate(value);
  };

  const handleRefresh = async () => {
    if (!selectedClassId) return;
    if (!confirmDiscard()) return;
    await Promise.all([loadStudents(), fetchSessions(false)]);
    toast.success('Xogta waa la cusboonaysiiyay');
  };

  const setStatus = (studentId, status) =>
    setQuranRecords((prev) =>
      prev.map((r) => (r.student === studentId && r.status !== status ? { ...r, status, dirty: true } : r))
    );

  const setField = (studentId, field, value) =>
    setQuranRecords((prev) =>
      prev.map((r) => (r.student === studentId ? { ...r, [field]: value, dirty: true } : r))
    );

  const setAll = (status) => {
    setQuranRecords((prev) => prev.map((r) => (r.status === status ? r : { ...r, status, dirty: true })));
    toast.success(`Dhammaan ardayda: ${STATUS[status].label}`);
  };

  const handleSaveSingle = async (studentId) => {
    const record = quranRecords.find((r) => r.student === studentId);
    if (!selectedClassId || !record) return;

    setSavingId(studentId);
    try {
      const payload = { status: record.status, date: selectedDate, ...lessonOf(record) };
      const result = record.sessionId
        ? await updateDailyQuran(record.sessionId, payload)
        : await createDailyQuran({ student: studentId, class: selectedClassId, ...payload });

      if (result?.success) {
        toast.success(record.sessionId ? 'Casharka maalinle waa la cusboonaysiiyay' : 'Casharka maalinle waa lagu daray');
        setQuranRecords((prev) => prev.map((r) => (r.student === studentId ? { ...r, dirty: false } : r)));
        await fetchSessions(true); // silent: other unsaved rows keep their edits
      } else {
        toast.error(result?.error || translations.error);
      }
    } catch (err) {
      toast.error(err?.message || translations.error);
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveAll = async () => {
    if (!selectedClassId || quranRecords.length === 0) {
      toast.error('Fadlan buuxi dhammaan goobaha loo baahan yahay');
      return;
    }

    setSavingAll(true);
    try {
      const result = await createBulkDailyQuran({
        classId: selectedClassId,
        date: selectedDate,
        students: quranRecords.map((r) => ({ studentId: r.student, status: r.status, ...lessonOf(r) }))
      });

      if (result?.success) {
        toast.success(result.message || `${quranRecords.length} arday ayaa loo diiwaangeliyay`);
        setQuranRecords((prev) => prev.map((r) => ({ ...r, dirty: false })));
        await fetchSessions(true);
      } else {
        toast.error(result?.error || translations.error);
      }
    } catch (err) {
      console.error('Bulk save error:', err);
      toast.error(err?.message || translations.error);
    } finally {
      setSavingAll(false);
    }
  };

  /* ---------- report (one template used by preview, print and PDF) ---------- */

  const buildReportBody = () => {
    const rows = quranRecords
      .map(
        (r, i) => `<tr>
          <td>${i + 1}</td>
          <td>${esc(r.name)}</td>
          <td>${esc(r.studentId)}</td>
          <td>${esc(r.phone || '-')}</td>
          <td>${esc(lessonText(r))}</td>
          <td><span class="tag ${STATUS[r.status]?.rpt || 'y'}">${esc(STATUS[r.status]?.label)}</span></td>
        </tr>`
      )
      .join('');

    return `<div class="rpt">
      <div class="head">
        <h1>${esc(translations.reportTitle)}</h1>
        <p class="sub">${esc(selectedClass?.name || 'Fasalka')} | ${esc(formatDateForDisplay(selectedDate))}</p>
      </div>
      <div class="meta">
        <div>
          <div><b>${translations.class}:</b>${esc(selectedClass?.name || '-')}</div>
          <div><b>${translations.date}:</b>${esc(formatDateForDisplay(selectedDate))}</div>
        </div>
        <div>
          <div><b>${translations.generatedOn}:</b>${new Date().toLocaleDateString('so-SO')}</div>
          <div><b>${translations.totalStudents}:</b>${statistics.total}</div>
        </div>
      </div>
      <div class="stats">
        <div class="stat g"><strong>${statistics.gartay}</strong>${translations.passed}</div>
        <div class="stat r"><strong>${statistics.garanWaayay}</strong>${translations.failed}</div>
        <div class="stat y"><strong>${statistics.majoogo}</strong>${translations.absent}</div>
        <div class="stat b"><strong>${statistics.successRate}%</strong>${translations.success}</div>
      </div>
      <table>
        <thead><tr>
          <th>#</th><th>${translations.studentName}</th><th>${translations.studentId}</th>
          <th>${translations.phone}</th><th>${translations.lesson}</th><th>${translations.status}</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="foot">Warbixinta ayaa lagu sameeyay ${new Date().toLocaleString('so-SO')}</div>
    </div>`;
  };

  const handlePrint = () => {
    if (quranRecords.length === 0) {
      toast.error(translations.noData);
      return;
    }
    const w = window.open('', '_blank');
    if (!w) {
      toast.error(translations.popupBlocked);
      return;
    }
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${esc(translations.reportTitle)}</title>
      <style>@page{margin:15mm}body{margin:0;padding:16px}${REPORT_CSS}</style></head>
      <body>${buildReportBody()}
      <script>window.onafterprint=function(){window.close()};window.onload=function(){window.print()};<\/script>
      </body></html>`);
    w.document.close();
  };

  const generatePDF = async () => {
    if (quranRecords.length === 0) {
      toast.error(translations.noData);
      return;
    }

    setPdfBusy(true);
    const holder = document.createElement('div');
    holder.style.cssText = 'position:absolute;left:-9999px;top:0;width:794px;padding:24px;background:#fff';
    holder.innerHTML = `<style>${REPORT_CSS}</style>${buildReportBody()}`;
    document.body.appendChild(holder);

    try {
      // Loaded only when needed, so the page itself opens faster on phones
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);

      const canvas = await html2canvas(holder, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const img = canvas.toDataURL('image/jpeg', 0.92);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const usable = 277; // 297mm page minus 10mm margin top and bottom
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const drawPage = (position) => {
        pdf.addImage(img, 'JPEG', 10, position, imgWidth, imgHeight);
        pdf.setFillColor(255, 255, 255); // hide image overflow in the margins
        pdf.rect(0, 0, 210, 10, 'F');
        pdf.rect(0, 287, 210, 10, 'F');
      };

      let heightLeft = imgHeight;
      drawPage(10);
      heightLeft -= usable;
      while (heightLeft > 0) {
        pdf.addPage();
        drawPage(10 - (imgHeight - heightLeft));
        heightLeft -= usable;
      }

      pdf.save(`Cashar_Maalinle_${selectedClass?.name || 'Fasalka'}_${selectedDate}.pdf`);
      setShowPrintModal(false);
      toast.success('Warbixinta PDF ayaa la soo dejiyay');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Khalad ayaa dhacay markii la sameeyay PDF');
    } finally {
      holder.remove();
      setPdfBusy(false);
    }
  };

  /* ---------- render ---------- */

  const quickDates = [
    [0, 'Maanta'],
    [-1, 'Shalay'],
    [-2, '-2 maalin']
  ];

  return (
    <div className="mx-auto max-w-7xl p-3 sm:p-4 md:p-6">
      {/* No overflow-hidden here: it would break the sticky save bar */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-md">
        {/* Header */}
        <div className="rounded-t-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="flex items-center text-xl font-bold sm:text-2xl">
                <FiBook className="mr-2 shrink-0" aria-hidden="true" />
                <span>{translations.heading}</span>
              </h1>
              <p className="mt-1 text-sm text-blue-100 sm:text-base">{translations.subheading}</p>
            </div>
            <Link
              to="/daily-quran/records"
              className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-blue-800 px-4 text-sm text-white transition-colors hover:bg-blue-900 sm:w-auto sm:text-base"
            >
              <FiEye className="mr-2 shrink-0" aria-hidden="true" />
              {translations.viewSessions}
            </Link>
          </div>
        </div>

        <div className="space-y-5 p-3 sm:p-4 md:p-6">
          {/* Class + date */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {/* Class */}
            <div>
              <span className="mb-1.5 flex items-center text-sm font-medium text-gray-700">
                <FiUsers className="mr-2 shrink-0" aria-hidden="true" />
                {translations.selectClass}
                <span className="ml-1 text-red-500">*</span>
              </span>

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isClassDropdownOpen}
                  disabled={loadingClasses}
                  onClick={() => setIsClassDropdownOpen((o) => !o)}
                  className={`flex min-h-[48px] w-full items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-left text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${
                    loadingClasses ? 'cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex min-w-0 items-center">
                    {loadingClasses ? (
                      <>
                        <FiLoader className="mr-2 shrink-0 animate-spin" />
                        <span className="truncate">{translations.loading}</span>
                      </>
                    ) : selectedClass ? (
                      <>
                        <span className="truncate">{selectedClass.name}</span>
                        {selectedClass.level && (
                          <span className="ml-2 shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                            {selectedClass.level}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="truncate text-gray-500">{translations.selectClass}</span>
                    )}
                  </span>
                  <FiChevronDown
                    className={`ml-2 shrink-0 transition-transform ${isClassDropdownOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>

                {isClassDropdownOpen && !loadingClasses && (
                  <div className="absolute left-0 right-0 z-40 mt-1 overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5">
                    <div className="border-b border-gray-200 p-2">
                      <div className="relative">
                        <FiSearch
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          aria-hidden="true"
                        />
                        <input
                          ref={searchRef}
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={translations.searchClass}
                          className={`${inputCls} pl-10`}
                        />
                      </div>
                    </div>

                    <div role="listbox" className="max-h-60 overflow-y-auto overscroll-contain">
                      {filteredClasses.length === 0 ? (
                        <div className="px-4 py-4 text-center text-sm text-gray-500">
                          {searchQuery ? 'Lama helin fasalo' : translations.noClasses}
                        </div>
                      ) : (
                        filteredClasses.map((cls) => (
                          <button
                            key={cls._id}
                            type="button"
                            role="option"
                            aria-selected={selectedClassId === cls._id}
                            onClick={() => selectClass(cls._id)}
                            className={`flex min-h-[48px] w-full flex-col justify-center px-4 py-2 text-left hover:bg-blue-50 active:bg-blue-100 ${
                              selectedClassId === cls._id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                            }`}
                          >
                            <span className="truncate font-medium">{cls.name}</span>
                            {cls.level && <span className="text-xs text-gray-500">Darajo: {cls.level}</span>}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="session-date" className="mb-1.5 flex items-center text-sm font-medium text-gray-700">
                <FiCalendar className="mr-2 shrink-0" aria-hidden="true" />
                {translations.selectDate}
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="flex items-stretch gap-2">
                <button
                  type="button"
                  aria-label="Maalinta hore"
                  onClick={() => changeDate(shiftDate(selectedDate, -1))}
                  className="flex min-h-[48px] w-12 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100"
                >
                  <FiChevronLeft aria-hidden="true" />
                </button>
                <input
                  id="session-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => changeDate(e.target.value)}
                  className={`${inputCls} min-w-0 flex-1`}
                />
                <button
                  type="button"
                  aria-label="Maalinta xigta"
                  onClick={() => changeDate(shiftDate(selectedDate, 1))}
                  className="flex min-h-[48px] w-12 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100"
                >
                  <FiChevronRight aria-hidden="true" />
                </button>
              </div>

              <div className="mt-2 flex gap-2">
                {quickDates.map(([offset, label]) => {
                  const value = shiftDate(todayLocal(), offset);
                  const active = selectedDate === value;
                  return (
                    <button
                      key={offset}
                      type="button"
                      onClick={() => changeDate(value)}
                      aria-pressed={active}
                      className={`min-h-[40px] flex-1 whitespace-nowrap rounded-lg px-2 text-sm ${
                        active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* No classes */}
          {!loadingClasses && classes.length === 0 && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="flex items-center text-yellow-800">
                <FiUsers className="mr-2 shrink-0" aria-hidden="true" />
                {translations.noClasses}
              </p>
              <p className="mt-1 text-sm text-yellow-700">{translations.noClassesHint}</p>
            </div>
          )}

          {/* Shared lesson details */}
          {selectedClassId && (
            <section className="rounded-lg border border-green-200 bg-green-50 p-3 sm:p-4">
              <h3 className="text-sm font-semibold text-green-800">{translations.lessonTitle}</h3>
              <p className="mb-3 mt-0.5 text-xs text-green-700">{translations.lessonHint}</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Field label={translations.surah} className="col-span-2 md:col-span-1">
                  <input
                    type="text"
                    value={lesson.surah}
                    onChange={(e) => setLesson((l) => ({ ...l, surah: e.target.value }))}
                    placeholder="Tusaale: Al-Fatiha"
                    className={`${inputCls} border-green-300 focus:ring-green-500`}
                  />
                </Field>
                <Field label={translations.from}>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={lesson.fromVerse}
                    onChange={(e) => setLesson((l) => ({ ...l, fromVerse: e.target.value }))}
                    placeholder="1"
                    className={`${inputCls} border-green-300 focus:ring-green-500`}
                  />
                </Field>
                <Field label={translations.to}>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={lesson.toVerse}
                    onChange={(e) => setLesson((l) => ({ ...l, toVerse: e.target.value }))}
                    placeholder="7"
                    className={`${inputCls} border-green-300 focus:ring-green-500`}
                  />
                </Field>
                <Field label={translations.notes} className="col-span-2 md:col-span-1">
                  <input
                    type="text"
                    value={lesson.notes}
                    onChange={(e) => setLesson((l) => ({ ...l, notes: e.target.value }))}
                    placeholder={`${translations.notes}...`}
                    className={`${inputCls} border-green-300 focus:ring-green-500`}
                  />
                </Field>
              </div>
            </section>
          )}

          {/* Loading */}
          {busy && (
            <div className="py-12 text-center" role="status">
              <FiLoader className="mx-auto h-10 w-10 animate-spin text-blue-600" aria-hidden="true" />
              <p className="mt-4 text-gray-600">
                {dateStatus === 'loading' ? translations.loadingDateData : 'Soo dejineyn ardayda fasalka...'}
              </p>
            </div>
          )}

          {/* Error */}
          {selectedClassId && dateStatus === 'error' && !busy && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
              <p className="flex items-center justify-center gap-2 text-sm text-red-700">
                <FiAlertCircle className="shrink-0" aria-hidden="true" />
                {translations.loadFailed}
              </p>
              <button
                type="button"
                onClick={() => fetchSessions(false)}
                className="mt-3 min-h-[44px] rounded-lg bg-red-600 px-5 text-sm font-medium text-white hover:bg-red-700"
              >
                {translations.retry}
              </button>
            </div>
          )}

          {/* No students */}
          {noStudents && (
            <div className="py-12 text-center">
              <FiUsers className="mx-auto mb-4 h-12 w-12 text-gray-400" aria-hidden="true" />
              <h3 className="mb-1 text-lg font-medium text-gray-900">{translations.noStudents}</h3>
              <p className="text-gray-600">{translations.noStudentsHint}</p>
            </div>
          )}

          {/* Main content */}
          {ready && !busy && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <Stat
                  label={translations.totalStudents}
                  value={statistics.total}
                  tone="border-blue-200 bg-blue-50 text-blue-700"
                  className="col-span-2 sm:col-span-1"
                />
                <Stat label={translations.passed} value={statistics.gartay} tone="border-green-200 bg-green-50 text-green-700" />
                <Stat label={translations.failed} value={statistics.garanWaayay} tone="border-red-200 bg-red-50 text-red-700" />
                <Stat label={translations.absent} value={statistics.majoogo} tone="border-yellow-200 bg-yellow-50 text-yellow-800" />
                <Stat
                  label={translations.alreadySaved}
                  value={statistics.existing}
                  tone="border-purple-200 bg-purple-50 text-purple-700"
                  className="col-span-2 sm:col-span-1"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(true)}
                  className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-blue-600 px-4 text-white hover:bg-blue-700 active:bg-blue-800 sm:w-auto"
                >
                  <FiPrinter className="mr-2 shrink-0" aria-hidden="true" />
                  {translations.printReport}
                </button>
              </div>

              {/* Bulk actions */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
                <span className="mb-2 block text-sm font-medium text-gray-700">{translations.selectAll}:</span>
                <div className="grid grid-cols-3 gap-2">
                  {STATUS_KEYS.map((key) => {
                    const cfg = STATUS[key];
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setAll(key)}
                        className={`flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-lg border px-1 text-xs font-medium sm:flex-row sm:gap-1.5 sm:text-sm ${cfg.idle}`}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Students */}
              <div>
                <h3 className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-medium text-gray-800 sm:text-lg">
                  <FiUsers className="shrink-0" aria-hidden="true" />
                  <span>Ardayda Fasalka ({quranRecords.length})</span>
                  <span className="text-sm font-normal text-gray-500">{formatDateForDisplay(selectedDate)}</span>
                </h3>

                <p
                  className={`mb-3 flex items-start gap-2 rounded-lg border p-3 text-sm ${
                    statistics.existing > 0
                      ? 'border-green-200 bg-green-50 text-green-800'
                      : 'border-blue-200 bg-blue-50 text-blue-800'
                  }`}
                >
                  <FiInfo className="mt-0.5 shrink-0" aria-hidden="true" />
                  {statistics.existing > 0
                    ? `${statistics.existing} arday ayaa hore u cashar helay taariikhdan. Haddii aad keydiso, waa la cusboonaysiin doonaa.`
                    : translations.noSessionsForDate}
                </p>

                {/* Phones + tablets: cards */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden">
                  {quranRecords.map((record, index) => (
                    <StudentCard
                      key={record.student}
                      record={record}
                      index={index}
                      lesson={lesson}
                      saving={savingId === record.student}
                      onStatus={(s) => setStatus(record.student, s)}
                      onField={(f, v) => setField(record.student, f, v)}
                      onSave={() => handleSaveSingle(record.student)}
                    />
                  ))}
                </div>

                {/* Desktop: table */}
                <div className="hidden overflow-x-auto rounded-lg shadow ring-1 ring-black/5 lg:block">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        {['#', translations.studentName, translations.surah, `${translations.from} – ${translations.to}`, translations.notes, translations.status, ''].map(
                          (h, i) => (
                            <th
                              key={`${h}-${i}`}
                              scope="col"
                              className="px-3 py-3 text-left text-sm font-semibold text-gray-900 first:pl-4"
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {quranRecords.map((record, index) => (
                        <StudentRow
                          key={record.student}
                          record={record}
                          index={index}
                          lesson={lesson}
                          saving={savingId === record.student}
                          onStatus={(s) => setStatus(record.student, s)}
                          onField={(f, v) => setField(record.student, f, v)}
                          onSave={() => handleSaveSingle(record.student)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sticky action bar */}
        {ready && !busy && (
          <div className="sticky bottom-0 z-30 flex items-center gap-2 rounded-b-xl border-t border-gray-200 bg-white/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur sm:px-6">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loadingStudents || dateStatus === 'loading'}
              aria-label={translations.refresh}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 text-gray-700 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50"
            >
              <FiRotateCw aria-hidden="true" />
              <span className="hidden sm:inline">{translations.refresh}</span>
            </button>

            <div className="hidden min-w-0 flex-1 text-sm text-amber-700 sm:block">
              {statistics.unsaved > 0 && `${statistics.unsaved} ${translations.unsaved}`}
            </div>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={savingAll}
              className="flex min-h-[48px] flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 font-medium text-white shadow-md hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 sm:flex-none sm:px-6"
            >
              {savingAll ? (
                <>
                  <FiLoader className="mr-2 shrink-0 animate-spin" />
                  {translations.creating}
                </>
              ) : (
                <>
                  <FiSave className="mr-2 shrink-0" />
                  <span className="truncate">{translations.submitAll}</span>
                  {statistics.unsaved > 0 && (
                    <span className="ml-2 rounded-full bg-white/25 px-2 text-xs">{statistics.unsaved}</span>
                  )}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Print modal: bottom sheet on phones, centered dialog on larger screens */}
      {showPrintModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={translations.printReport}
        >
          <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-w-4xl sm:rounded-2xl">
            <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
              <h2 className="text-lg font-bold">{translations.printReport}</h2>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                aria-label={translations.close}
                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-3 sm:p-6">
              <div className="overflow-x-auto">
                <div
                  className="min-w-[640px]"
                  dangerouslySetInnerHTML={{ __html: `<style>${REPORT_CSS}</style>${buildReportBody()}` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 border-t border-gray-200 bg-gray-50 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:flex sm:justify-end sm:gap-3 sm:px-6">
              <button
                type="button"
                onClick={generatePDF}
                disabled={pdfBusy}
                className="flex min-h-[48px] items-center justify-center rounded-lg bg-green-600 px-4 text-white hover:bg-green-700 active:bg-green-800 disabled:opacity-50"
              >
                {pdfBusy ? <FiLoader className="mr-2 animate-spin" /> : <FiDownload className="mr-2 shrink-0" />}
                {translations.downloadPDF}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex min-h-[48px] items-center justify-center rounded-lg bg-blue-100 px-4 text-blue-700 hover:bg-blue-200 active:bg-blue-300"
              >
                <FiPrinter className="mr-2 shrink-0" />
                {translations.print}
              </button>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="min-h-[48px] rounded-lg bg-gray-200 px-4 text-gray-700 hover:bg-gray-300 active:bg-gray-400"
              >
                {translations.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateDailyQuranSession;