import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, Home, Users, GraduationCap, BookOpen, DollarSign, LogOut,
  ChevronDown, ChevronRight, Bell, UserCog, User2, ClipboardList, PlusCircle,
  FileSearch, Clock, ClipboardCheck, Layers, BookKey, BookCheck, HeartPulse,
  Gavel, CalendarCheck, Wallet, List, Sparkles, Camera, Loader2,
} from 'lucide-react';
import { Transition } from '@headlessui/react';
import useAuthStore from '../store/authStore';

const isSuperAdminRole = (role) => role === 'super_admin' || role === 'superAdmin';
const isAdminAccessRole = (role) => isSuperAdminRole(role) || role === 'admin';

const formatRole = (role) =>
  role ? role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '';

const TONES = [
  'from-violet-400 to-indigo-500 shadow-violet-500/40',
  'from-sky-400 to-cyan-500 shadow-sky-500/40',
  'from-emerald-400 to-teal-500 shadow-emerald-500/40',
  'from-amber-400 to-orange-500 shadow-amber-500/40',
  'from-rose-400 to-pink-500 shadow-rose-500/40',
  'from-fuchsia-400 to-purple-500 shadow-fuchsia-500/40',
];

const menuItems = [
  { text: 'Dashboard', icon: Home, path: '/dashboard', adminOnly: true },
  {
    text: 'Arday', icon: Users, path: '/students',
    subItems: [
      { text: 'dhamaan Ardayda', path: '/getAllStudents', icon: Users, adminOnly: true },
      { text: 'Ku biiri Arday Cusub', path: '/createStudent', icon: PlusCircle, adminOnly: true },
      { text: 'Ku biiri Arday badan oo Cusub', path: '/createMultipleStudents', icon: PlusCircle, adminOnly: true },
      { text: 'Xogta Arday Gaara', path: '/getOneStudent', icon: FileSearch },
    ],
  },
  {
    text: 'Macalimiinta', icon: GraduationCap, path: '/getAllTeachers', adminOnly: true,
    subItems: [
      { text: 'Dhamaan Macalimiinta', path: '/getAllTeachers', icon: Users },
      { text: 'Ku Biiri Macalin Cusub', path: '/addTeachers', icon: PlusCircle },
      { text: 'Xaadiriska Macilimiinta', path: '/createTeacherAttendance', icon: CalendarCheck },
      { text: 'Taarikhda Xaadiriska', path: '/GetTeacherAttendanceByDate', icon: Clock },
      { text: 'Mushaharka Macalimiinta', path: '/teacherSalaries', icon: DollarSign },
    ],
  },
  {
    text: 'Fasalada', icon: BookOpen, path: '/classes', adminOnly: true,
    subItems: [
      { text: 'Dhamaan Fasalada', path: '/getAll', icon: Layers },
      { text: 'Fasal cusub abuur', path: '/addClass', icon: PlusCircle },
    ],
  },
  {
    text: 'Cashar maalinle', icon: BookOpen, path: '/casharmalinle',
    subItems: [
      { text: 'Abuur cashar maalinle', path: '/CreateDailyQuranSession', icon: Layers },
      { text: 'Diiwaanka casharrada', path: '/daily-quran/records', icon: List },
    ],
  },
  {
    text: 'Imtixaanaadka', icon: ClipboardList, path: '/allExams',
    subItems: [
      { text: 'Dhamaan Imtixinaadka Class yada', path: '/allExams', icon: BookCheck },
      { text: 'Gali imtixaan Arday Khaasa', path: '/addExams', icon: PlusCircle },
      { text: 'Gali Imtixan Fasal', path: '/addClassExams', icon: PlusCircle },
    ],
  },
  {
    text: 'Maadooyinka', icon: BookKey, path: '/AllSubjects', adminOnly: true,
    subItems: [
      { text: 'Dhamaan Maadooyinka', path: '/AllSubjects', icon: BookOpen },
      { text: 'Abuur Maado Cusub', path: '/AddSubjects', icon: PlusCircle },
    ],
  },
  {
    text: "Qur'aan & Subcis", icon: BookOpen, path: '/quran-subci',
    subItems: [
      { text: "Qur'aan Diiwaan", path: '/quran', icon: BookOpen },
      { text: 'Subcis Diiwaan', path: '/subci', icon: BookOpen },
      { text: 'Maamul Xalqooyin (Subcis)', path: '/subci/manage', icon: Layers },
    ],
  },
  {
    text: 'Arimaha Ardayga', icon: User2, path: '/studentHealth',
    subItems: [
      { text: 'Xogta Caafimadka', path: '/studentHealth', icon: HeartPulse },
      { text: 'Xogta Imtixinaadka', path: '/studentExams', icon: BookCheck },
      { text: 'Xogta Anshaxa', path: '/studentdiscipline', icon: Gavel },
    ],
  },
  {
    text: 'Arimaha Fee ga', icon: User2, path: '/studentFees', adminOnly: true,
    subItems: [
      { text: 'Fee ga Ardayga', path: '/studentFees', icon: DollarSign },
      { text: 'Fee ga Qoyska', path: '/familyFees', icon: Wallet },
    ],
  },
  {
    text: 'Xaadiris', icon: CalendarCheck, path: '/attendance',
    subItems: [
      { text: 'Raadi Xaadiriska', path: '/AttendanceByDate', icon: FileSearch },
      { text: 'Abuur Xaadirska Fasalka', path: '/createAttendance', icon: ClipboardCheck },
    ],
  },
  { text: 'Dhaqaalaha', icon: DollarSign, path: '/finance', superAdminOnly: true },
  {
    text: 'Maamulka isticmaalayaasha', icon: UserCog, path: '/users', adminOnly: true,
    subItems: [
      { text: 'DHamaan isticmaalayaasha', path: '/getAllUsers', icon: Users },
      { text: 'Abuur isticmaale', path: '/signup', icon: PlusCircle },
    ],
  },
];

function useClickOutside(ref, handler) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handlerRef.current();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref]);
}

/* Loads Outfit + theme CSS. Form controls inherit the font. */
function useTheme() {
  useEffect(() => {
    if (!document.getElementById('outfit-font')) {
      const old = document.getElementById('fredoka-font');
      if (old) old.remove();

      const link = document.createElement('link');
      link.id = 'outfit-font';
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap';
      document.head.appendChild(link);
    }

    if (!document.getElementById('furqaan-theme-outfit')) {
      const oldStyle = document.getElementById('furqaan-theme');
      if (oldStyle) oldStyle.remove();

      const style = document.createElement('style');
      style.id = 'furqaan-theme-outfit';
      style.textContent = `
        .font-fredoka,
        .font-fredoka * {
          font-family: 'Outfit', ui-sans-serif, system-ui, -apple-system,
                       'Segoe UI', Roboto, sans-serif;
        }

        /* keep inputs / selects / buttons in the same font */
        .font-fredoka input,
        .font-fredoka textarea,
        .font-fredoka select,
        .font-fredoka button {
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
          letter-spacing: inherit;
        }
        .font-fredoka input::placeholder,
        .font-fredoka textarea::placeholder { font-family: inherit; }

        html, body { overflow-x: hidden; }

        @keyframes f-float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-10px) rotate(6deg); } }
        @keyframes f-drift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(24px,-16px) scale(1.15); } }
        @keyframes f-shine { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        @keyframes f-pop { 0% { transform: scale(.94); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .f-float { animation: f-float 5s ease-in-out infinite; }
        .f-drift { animation: f-drift 9s ease-in-out infinite; }
        .f-shine { background-size: 200% 100%; animation: f-shine 6s linear infinite; }
        .f-pop { animation: f-pop .5s cubic-bezier(.2,.9,.3,1.2) both; }
        @media (prefers-reduced-motion: reduce) {
          .f-float, .f-drift, .f-shine, .f-pop { animation: none !important; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
}

const STAR_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M24 4l4.6 11.4L40 12l-3.4 11.4L48 24l-11.4 4.6L40 40l-11.4-3.4L24 48l-4.6-11.4L8 40l3.4-11.4L0 24l11.4-4.6L8 8l11.4 3.4z' fill='none' stroke='white' stroke-opacity='.07' stroke-width='1'/%3E%3C/svg%3E")`;

const greetingFor = (hour) =>
  hour < 12 ? 'Subax wanaagsan' : hour < 18 ? 'Galab wanaagsan' : 'Fiid wanaagsan';

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-600 p-1 pr-4 shadow-lg shadow-violet-500/30">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white ring-1 ring-white/30 backdrop-blur">
        <Clock className="h-4 w-4" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold tabular-nums text-white">{time}</p>
        <p className="hidden text-[11px] text-violet-100 md:block">{date}</p>
      </div>
    </div>
  );
}

function TeacherNotice({ onClose, role, username }) {
  const message =
    role === 'teacher'
      ? 'Macalin, ardaydu way ku sugayan — fadlan shaqada bilow'
      : role === 'admin'
        ? 'Maamule, so dhawow — ardaydu way ku sugayan'
        : isSuperAdminRole(role)
          ? 'Maamule, so dhawow'
          : '';
  if (!message) return null;

  return (
    <div className="f-pop relative mb-8 overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-950 via-violet-800 to-fuchsia-700 p-6 shadow-2xl shadow-violet-900/30 ring-1 ring-white/10 sm:p-8">
      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: STAR_PATTERN }} />
      <div className="f-drift pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-fuchsia-400/30 blur-3xl" />
      <div className="f-drift pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-sky-400/25 blur-3xl" style={{ animationDelay: '-4s' }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notice"
        className="absolute right-4 top-4 rounded-xl bg-white/10 p-2 text-white/70 ring-1 ring-white/10 transition hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
        <div className="f-float relative shrink-0">
          <div className="absolute inset-0 rounded-3xl bg-amber-300/40 blur-xl" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-300 to-orange-400 text-white shadow-xl shadow-amber-500/40 ring-2 ring-white/40 sm:h-20 sm:w-20">
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
        </div>

        <div className="min-w-0 pr-10">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-amber-200 ring-1 ring-white/15">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" />
            {greetingFor(new Date().getHours())}{username ? `, ${username}` : ''}
          </p>
          <h2 className="f-shine bg-gradient-to-r from-amber-200 via-white to-fuchsia-200 bg-clip-text text-2xl font-bold leading-snug text-transparent sm:text-3xl lg:text-4xl">
            {message}
          </h2>
          <div className="mt-4 flex items-center gap-2">
            <span className="h-1.5 w-16 rounded-full bg-gradient-to-r from-amber-300 to-fuchsia-400" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ items, user, pathname, activeParent, setActiveParent, navigate, onItemClick, onClose }) {
  const profileImage =
    user?.profilePicture && user.profilePicture !== 'lama keenin sawir'
      ? user.profilePicture
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=random`;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: STAR_PATTERN }} />
      <div className="f-drift pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-violet-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-fuchsia-600/20 blur-3xl" />

      <div className="relative flex h-20 shrink-0 items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-amber-300 via-orange-400 to-rose-400 p-[2px] shadow-lg shadow-orange-500/30">
            <img src="/hello.jpg" alt="Logo" className="h-11 w-11 rounded-[14px] bg-slate-900 object-cover" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-medium text-violet-300">مؤسسة</span>
            <span className="bg-gradient-to-r from-amber-200 to-white bg-clip-text text-xl font-bold text-transparent">الفُرْقَانِ</span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-xl bg-white/5 p-2 text-slate-300 transition hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="relative mx-5 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <nav className="custom-scrollbar relative flex-1 space-y-1.5 overflow-y-auto px-3 py-5">
        {items.map((item, index) => {
          const Icon = item.icon;
          const hasSub = item.subItems?.length > 0;
          const isActive = pathname.startsWith(item.path) || item.subItems?.some((sub) => pathname === sub.path);
          const isOpen = activeParent === item.text;
          const tone = TONES[index % TONES.length];

          return (
            <div key={item.text}>
              <button
                onClick={() => {
                  if (hasSub) {
                    setActiveParent(isOpen ? null : item.text);
                  } else {
                    navigate(item.path);
                    onItemClick?.();
                  }
                }}
                className={`group relative flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left text-[15px] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                  isActive
                    ? 'bg-white/10 font-medium text-white ring-1 ring-white/15 backdrop-blur'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {isActive && (
                  <span className="absolute -left-3 top-1/2 h-7 w-1.5 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-amber-300 to-orange-400 shadow-[0_0_12px_rgba(251,191,36,.8)]" />
                )}
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white transition-all duration-300 ${tone} ${
                    isActive ? 'scale-105 shadow-lg' : 'opacity-80 group-hover:scale-105 group-hover:opacity-100 group-hover:shadow-lg'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="flex-1 truncate">{item.text}</span>
                {hasSub && (
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${
                      isActive ? 'text-amber-300' : 'text-slate-500'
                    }`}
                  />
                )}
              </button>

              {hasSub && isOpen && (
                <div className="f-pop ml-[26px] mt-1.5 space-y-0.5 border-l-2 border-dashed border-white/10 pl-4">
                  {item.subItems.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = pathname === sub.path;
                    return (
                      <button
                        key={sub.text}
                        onClick={() => {
                          navigate(sub.path);
                          onItemClick?.();
                        }}
                        className={`relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                          isSubActive
                            ? 'bg-gradient-to-r from-violet-500/30 to-fuchsia-500/10 font-medium text-white'
                            : 'text-slate-400 hover:translate-x-0.5 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span
                          className={`absolute -left-[22px] h-2 w-2 rounded-full ring-4 ring-slate-900 ${
                            isSubActive ? 'bg-amber-300' : 'bg-slate-600'
                          }`}
                        />
                        <SubIcon className={`h-4 w-4 shrink-0 ${isSubActive ? 'text-amber-300' : ''}`} />
                        <span className="truncate">{sub.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="relative shrink-0 p-3">
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-3 ring-1 ring-white/10 backdrop-blur">
          <div className="relative">
            <img src={profileImage} alt={user?.username || 'User profile'} className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-amber-300/70" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.username || ''}</p>
            <p className="truncate text-xs text-violet-300">{formatRole(user?.role)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeParent, setActiveParent] = useState(null);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [showTeacherNotice, setShowTeacherNotice] = useState(true);
  const [profileForm, setProfileForm] = useState({ username: '', email: '', profilePicture: '' });

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated, updateUser, isLoggingOut } = useAuthStore();

  const childrenContainerRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  useTheme();
  useClickOutside(notificationsRef, () => setNotificationsOpen(false));
  useClickOutside(profileRef, () => setProfileDropdownOpen(false));

  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        email: user.email || '',
        profilePicture: user.profilePicture || '',
      });
    }

    setSidebarOpen(false);
    setNotificationsOpen(false);
    setProfileDropdownOpen(false);

    if (childrenContainerRef.current) {
      childrenContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const currentParent = menuItems.find(
      (item) =>
        location.pathname.startsWith(item.path) ||
        item.subItems?.some((subItem) => location.pathname === subItem.path)
    );
    setActiveParent(currentParent && currentParent.subItems ? currentParent.text : null);
  }, [location.pathname]);

  if (!isAuthenticated || !user) return null;

  const handleLogout = async () => {
    // Close the menu so the loading overlay is the only thing on screen
    setProfileDropdownOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfileForm((prev) => ({ ...prev, profilePicture: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    if (!user?._id) return;

    const username = profileForm.username.trim();
    const email = profileForm.email.trim();
    if (!username || !email) return;

    const hasNewProfileImage =
      typeof profileForm.profilePicture === 'string' && profileForm.profilePicture.startsWith('data:image/');

    const result = await updateUser(user._id, {
      username,
      email,
      profilePicture: hasNewProfileImage ? profileForm.profilePicture : undefined,
      role: user.role,
    });

    if (result?.success) {
      setIsProfileEditOpen(false);
      setProfileDropdownOpen(false);
    }
  };

  const profileImage =
    user?.profilePicture && user.profilePicture !== 'lama dhigin sawir'
      ? user.profilePicture
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=random`;

  const filteredMenuItems = menuItems
    .map((item) => ({
      ...item,
      subItems: item.subItems?.filter((subItem) => {
        if (subItem.superAdminOnly && !isSuperAdminRole(user?.role)) return false;
        if (subItem.adminOnly && !isAdminAccessRole(user?.role)) return false;
        return true;
      }),
    }))
    .filter((item) => {
      if (item.superAdminOnly && !isSuperAdminRole(user?.role)) return false;
      if (item.adminOnly && !isAdminAccessRole(user?.role)) return false;
      if (item.subItems && item.subItems.length === 0) return false;
      return true;
    });

  const currentItem = menuItems.find(
    (item) =>
      location.pathname.startsWith(item.path) ||
      item.subItems?.some((sub) => location.pathname === sub.path)
  );
  const currentSub = currentItem?.subItems?.find((sub) => location.pathname === sub.path);
  const HeaderIcon = currentItem?.icon || Home;

  const sidebarProps = {
    items: filteredMenuItems,
    user,
    pathname: location.pathname,
    activeParent,
    setActiveParent,
    navigate,
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100';

  return (
    <div
      className="font-fredoka relative flex h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-violet-50/60 to-sky-50 antialiased"
      aria-busy={isLoggingOut}
    >
      {/* Sign-out overlay: visible while the logout request runs */}
      {isLoggingOut && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-slate-950/70 backdrop-blur-sm"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-xl shadow-violet-900/40">
            <Loader2 className="h-7 w-7 animate-spin text-white" aria-hidden="true" />
          </span>
          <p className="text-sm font-medium text-white">Ka baxaya nidaamka...</p>
          <p className="text-xs text-violet-200">Signing you out, please wait</p>
        </div>
      )}
      <div className="pointer-events-none absolute -right-24 top-24 h-96 w-96 rounded-full bg-fuchsia-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />

      {/* Mobile sidebar (fixed overlay) */}
      <Transition
        show={sidebarOpen}
        enter="transition-transform ease-out duration-300"
        enterFrom="-translate-x-full"
        enterTo="translate-x-0"
        leave="transition-transform ease-in duration-300"
        leaveFrom="translate-x-0"
        leaveTo="-translate-x-full"
      >
        {(ref) => (
          <div ref={ref} className="fixed inset-y-0 left-0 z-50 w-72 shadow-2xl lg:hidden">
            <SidebarContent
              {...sidebarProps}
              onItemClick={() => setSidebarOpen(false)}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        )}
      </Transition>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Desktop sidebar (fixed) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 shadow-2xl shadow-indigo-950/30 lg:block">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Main column — offset by sidebar width on desktop, no reflow */}
      <div className="relative flex min-h-screen min-w-0 flex-1 flex-col overflow-hidden transition-[margin] duration-300 ease-in-out lg:ml-72">
        {/* Edit profile modal */}
        <Transition
          show={isProfileEditOpen}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {(ref) => (
            <div ref={ref} className="font-fredoka fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md">
              <div className="f-pop w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-white/20">
                <div className="relative bg-gradient-to-br from-indigo-900 via-violet-700 to-fuchsia-600 px-6 pb-14 pt-5">
                  <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: STAR_PATTERN }} />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white">Edit profile</h3>
                      <p className="text-sm text-violet-200">Update your profile details</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsProfileEditOpen(false)}
                      aria-label="Close"
                      className="rounded-xl bg-white/15 p-2 text-white transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleProfileSave} className="-mt-10 space-y-4 px-6 pb-6">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <img
                        src={
                          profileForm.profilePicture && profileForm.profilePicture !== 'lama keenin sawir'
                            ? profileForm.profilePicture
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(profileForm.username || user?.username || 'User')}&background=random`
                        }
                        alt="Profile preview"
                        className="h-24 w-24 rounded-full object-cover shadow-xl ring-4 ring-white"
                      />
                      <label className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-white shadow-lg ring-2 ring-white transition hover:scale-110">
                        <Camera className="h-4 w-4" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Username</label>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, username: e.target.value }))}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                      className={inputClass}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsProfileEditOpen(false)}
                      className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/30 transition hover:scale-[1.03] hover:shadow-xl"
                    >
                      Save changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </Transition>

        {/* Header */}
        <header className="relative z-20 flex h-20 shrink-0 items-center justify-between border-b border-white/60 bg-white/70 px-4 shadow-sm shadow-violet-900/5 backdrop-blur-xl sm:px-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400" />

          <div className="flex min-w-0 items-center gap-3">
            <button
              className="rounded-xl bg-slate-100 p-2.5 text-slate-600 transition hover:bg-violet-100 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30 sm:flex">
              <HeaderIcon className="h-5 w-5" />
            </span>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold text-slate-900">{currentItem?.text || 'Dashboard'}</h1>
              {currentSub && (
                <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                  <span>{currentItem.text}</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 font-medium text-violet-700">{currentSub.text}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LiveClock />

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdownOpen(false);
                }}
                className="relative rounded-2xl bg-slate-100 p-3 text-slate-600 transition hover:bg-violet-100 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 animate-pulse rounded-full bg-rose-500 ring-2 ring-white" />
              </button>

              <Transition
                show={notificationsOpen}
                enter="transition ease-out duration-150"
                enterFrom="transform opacity-0 scale-95 -translate-y-1"
                enterTo="transform opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-100"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                {(ref) => (
                  <div
                    ref={ref}
                    className="absolute right-0 z-50 mt-3 w-80 origin-top-right overflow-hidden rounded-3xl bg-white shadow-2xl shadow-violet-900/20 ring-1 ring-slate-900/5"
                  >
                    <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-4">
                      <span className="font-semibold text-white">Notifications</span>
                      <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">2 new</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      <div className="flex cursor-pointer gap-3 px-5 py-3.5 transition hover:bg-violet-50/60">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 text-white shadow-md shadow-amber-500/30">
                          <ClipboardList className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900">New exam scheduled</p>
                          <p className="mt-0.5 text-xs text-slate-500">Math final exam on Friday</p>
                          <p className="mt-1 text-[11px] text-slate-400">2 hours ago</p>
                        </div>
                      </div>

                      <div className="flex cursor-pointer gap-3 px-5 py-3.5 transition hover:bg-violet-50/60">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/30">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900">New student registered</p>
                          <p className="mt-0.5 text-xs text-slate-500">Ahmed Mohamed joined Class 10</p>
                          <p className="mt-1 text-[11px] text-slate-400">5 hours ago</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 px-5 py-3 text-center">
                      <a href="#" className="text-sm font-medium text-violet-600 transition hover:text-fuchsia-600">
                        View all
                      </a>
                    </div>
                  </div>
                )}
              </Transition>
            </div>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                className="flex items-center gap-2.5 rounded-2xl py-1 pl-1 pr-2.5 transition hover:bg-violet-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsOpen(false);
                }}
              >
                <span className="rounded-full bg-gradient-to-br from-amber-300 via-fuchsia-400 to-violet-500 p-[2px]">
                  <img src={profileImage} alt={user?.username || 'User profile'} className="h-10 w-10 rounded-full object-cover ring-2 ring-white" />
                </span>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold leading-tight text-slate-800">{user?.username || ''}</p>
                  <p className="text-[11px] leading-tight text-slate-500">{formatRole(user?.role)}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <Transition
                show={profileDropdownOpen}
                enter="transition ease-out duration-150"
                enterFrom="transform opacity-0 scale-95 -translate-y-1"
                enterTo="transform opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-100"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                {(ref) => (
                  <div
                    ref={ref}
                    className="absolute right-0 z-50 mt-3 w-72 origin-top-right overflow-hidden rounded-3xl bg-white shadow-2xl shadow-violet-900/20 ring-1 ring-slate-900/5"
                  >
                    <div className="relative flex items-center gap-3 bg-gradient-to-br from-indigo-900 via-violet-700 to-fuchsia-600 px-5 py-5">
                      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: STAR_PATTERN }} />
                      <img src={profileImage} alt={user?.username || 'User profile'} className="relative h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-amber-300" />
                      <div className="relative min-w-0">
                        <p className="truncate font-semibold text-white">{user?.username || ''}</p>
                        <p className="truncate text-xs text-violet-200">{user?.email || ''}</p>
                        <span className="mt-1.5 inline-block rounded-full bg-amber-300 px-2.5 py-0.5 text-[11px] font-semibold text-amber-950">
                          {formatRole(user?.role)}
                        </span>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => {
                          setProfileForm({
                            username: user?.username || '',
                            email: user?.email || '',
                            profilePicture: user?.profilePicture || '',
                          });
                          setIsProfileEditOpen(true);
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                          <UserCog className="h-4 w-4" />
                        </span>
                        Edit profile
                      </button>
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                          {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                        </span>
                        {isLoggingOut ? 'Signing out...' : 'Sign out'}
                      </button>
                    </div>
                  </div>
                )}
              </Transition>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="relative flex-1 overflow-hidden">
          <main ref={childrenContainerRef} className="custom-scrollbar flex h-full flex-col overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl flex-1">
              {showTeacherNotice && user && ['teacher', 'admin', 'super_admin', 'superAdmin'].includes(user.role) && (
                <TeacherNotice role={user.role} username={user.username} onClose={() => setShowTeacherNotice(false)} />
              )}
              {children}
            </div>

            <footer className="mx-auto mt-12 w-full max-w-7xl pt-6 text-center">
              <div className="mx-auto mb-4 h-px w-full bg-gradient-to-r from-transparent via-violet-300 to-transparent" />
              <p className="font-medium text-slate-700">AL-FURQAAN Management System © {new Date().getFullYear()}</p>
              <p className="mt-1 text-xs text-slate-500">Version 1.0.0 · Designed with passion for education</p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;