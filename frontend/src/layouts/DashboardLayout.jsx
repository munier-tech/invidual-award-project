import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  LogOut,
  ChevronDown,
  ChevronRight,
  Bell,
  UserCog,
  User2,
  ClipboardList,
  PlusCircle,
  FileSearch,
  Clock,
  ClipboardCheck,
  Layers,
  BookKey,
  BookCheck,
  HeartPulse,
  Gavel,
  CalendarCheck,
  Wallet,
  List,
  Sparkles,
} from 'lucide-react';
import { Transition } from '@headlessui/react';
import useAuthStore from '../store/authStore';

const isSuperAdminRole = (role) => role === 'super_admin' || role === 'superAdmin';
const isAdminAccessRole = (role) => isSuperAdminRole(role) || role === 'admin';

const formatRole = (role) =>
  role ? role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '';

const menuItems = [
  {
    text: 'Dashboard',
    icon: Home,
    path: '/dashboard',
    adminOnly: true,
  },
  {
    text: 'Arday',
    icon: Users,
    path: '/students',
    subItems: [
      { text: 'dhamaan Ardayda', path: '/getAllStudents', icon: Users, adminOnly: true },
      { text: 'Ku biiri Arday Cusub', path: '/createStudent', icon: PlusCircle, adminOnly: true },
      { text: 'Ku biiri Arday badan oo Cusub', path: '/createMultipleStudents', icon: PlusCircle, adminOnly: true },
      { text: 'Xogta Arday Gaara', path: '/getOneStudent', icon: FileSearch },
    ],
  },
  {
    text: 'Macalimiinta',
    icon: GraduationCap,
    path: '/getAllTeachers',
    adminOnly: true,
    subItems: [
      { text: 'Dhamaan Macalimiinta', path: '/getAllTeachers', icon: Users },
      { text: 'Ku Biiri Macalin Cusub', path: '/addTeachers', icon: PlusCircle },
      { text: 'Xaadiriska Macilimiinta', path: '/createTeacherAttendance', icon: CalendarCheck },
      { text: 'Taarikhda Xaadiriska', path: '/GetTeacherAttendanceByDate', icon: Clock },
      { text: 'Mushaharka Macalimiinta', path: '/teacherSalaries', icon: DollarSign },
    ],
  },
  {
    text: 'Fasalada',
    icon: BookOpen,
    path: '/classes',
    adminOnly: true,
    subItems: [
      { text: 'Dhamaan Fasalada', path: '/getAll', icon: Layers },
      { text: 'Fasal cusub abuur', path: '/addClass', icon: PlusCircle },
    ],
  },
  {
    text: 'Cashar maalinle',
    icon: BookOpen,
    path: '/casharmalinle',
    subItems: [
      { text: 'Abuur cashar maalinle', path: '/CreateDailyQuranSession', icon: Layers },
      { text: 'Diiwaanka casharrada', path: '/daily-quran/records', icon: List },
    ],
  },
  {
    text: 'Imtixaanaadka',
    icon: ClipboardList,
    path: '/allExams',
    subItems: [
      { text: 'Dhamaan Imtixinaadka Class yada', path: '/allExams', icon: BookCheck },
      { text: 'Gali imtixaan Arday Khaasa', path: '/addExams', icon: PlusCircle },
      { text: 'Gali Imtixan Fasal', path: '/addClassExams', icon: PlusCircle },
    ],
  },
  {
    text: 'Maadooyinka',
    icon: BookKey,
    path: '/AllSubjects',
    adminOnly: true,
    subItems: [
      { text: 'Dhamaan Maadooyinka', path: '/AllSubjects', icon: BookOpen },
      { text: 'Abuur Maado Cusub', path: '/AddSubjects', icon: PlusCircle },
    ],
  },
  {
    text: "Qur'aan & Subcis",
    icon: BookOpen,
    path: '/quran-subci',
    subItems: [
      { text: "Qur'aan Diiwaan", path: '/quran', icon: BookOpen },
      { text: 'Subcis Diiwaan', path: '/subci', icon: BookOpen },
      { text: 'Maamul Xalqooyin (Subcis)', path: '/subci/manage', icon: Layers },
    ],
  },
  {
    text: 'Arimaha Ardayga',
    icon: User2,
    path: '/studentHealth',
    subItems: [
      { text: 'Xogta Caafimadka', path: '/studentHealth', icon: HeartPulse },
      { text: 'Xogta Imtixinaadka', path: '/studentExams', icon: BookCheck },
      { text: 'Xogta Anshaxa', path: '/studentdiscipline', icon: Gavel },
    ],
  },
  {
    text: 'Arimaha Fee ga',
    icon: User2,
    path: '/studentFees',
    adminOnly: true,
    subItems: [
      { text: 'Fee ga Ardayga', path: '/studentFees', icon: DollarSign },
      { text: 'Fee ga Qoyska', path: '/familyFees', icon: Wallet },
    ],
  },
  {
    text: 'Xaadiris',
    icon: CalendarCheck,
    path: '/attendance',
    subItems: [
      { text: 'Raadi Xaadiriska', path: '/AttendanceByDate', icon: FileSearch },
      { text: 'Abuur Xaadirska Fasalka', path: '/createAttendance', icon: ClipboardCheck },
    ],
  },
  {
    text: 'Dhaqaalaha',
    icon: DollarSign,
    path: '/finance',
    superAdminOnly: true,
  },
  {
    text: 'Maamulka isticmaalayaasha',
    icon: UserCog,
    path: '/users',
    adminOnly: true,
    subItems: [
      { text: 'DHamaan isticmaalayaasha', path: '/getAllUsers', icon: Users },
      { text: 'Abuur isticmaale', path: '/signup', icon: PlusCircle },
    ],
  },
];

/* Closes a dropdown when the user clicks outside of it */
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

/* ------------------------------------------------------------------ */
/* Live clock (header)                                                 */
/* ------------------------------------------------------------------ */
function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const date = now.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 px-3 py-1.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/30">
        <Clock className="h-4 w-4" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold tabular-nums text-slate-800">{time}</p>
        <p className="hidden text-[11px] text-slate-500 md:block">{date}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Teacher notice banner (top of page content)                         */
/* ------------------------------------------------------------------ */
function TeacherNotice({ onClose, role }) {
  const message =
    role === 'teacher'
      ? 'Macalin, ardaydu way ku sugayan — fadlan shaqada bilow'
      : role === 'admin'
        ? 'Maamule, so dhawow — ardaydu way ku sugayan'
        : role === 'super_admin' || role === 'superAdmin'
          ? 'Maamule, so dhawow'
          : '';

  if (!message) return null;

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-indigo-700 to-purple-800 p-5 shadow-xl shadow-violet-900/20 sm:p-6">
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-fuchsia-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 left-1/3 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_55%)]" />

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notice"
        className="absolute right-3 top-3 rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative flex items-center gap-4 sm:gap-5">
        <div className="relative shrink-0">
          <span className="absolute inset-0 animate-ping rounded-2xl bg-white/20" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-amber-200 ring-1 ring-white/30 backdrop-blur sm:h-14 sm:w-14">
            <Sparkles className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
        </div>

        <div className="min-w-0 pr-6">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-200/90">
            Ogeysiis
          </p>
          <h2 className="bg-gradient-to-r from-amber-200 via-white to-violet-200 bg-clip-text text-xl font-extrabold leading-snug tracking-tight text-transparent drop-shadow-sm sm:text-2xl lg:text-3xl">
            {message}
          </h2>
          <div className="mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-amber-300 to-fuchsia-400" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sidebar                                                             */
/* ------------------------------------------------------------------ */
function SidebarContent({
  items,
  user,
  pathname,
  activeParent,
  setActiveParent,
  navigate,
  onItemClick,
  onClose,
}) {
  const profileImage = user?.profilePicture && user.profilePicture !== 'lama keenin sawir'
    ? user.profilePicture
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=random`;

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 p-1.5 shadow-lg shadow-violet-950/50 ring-1 ring-white/20">
            <img
              src="/hello.jpg"
              alt="Logo"
              className="h-8 w-8 rounded-lg object-cover"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-white">مؤسسة</span>
            <span className="text-base font-extrabold text-violet-300">الفُرْقَانِ</span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Menu
        </p>

        {items.map((item) => {
          const Icon = item.icon;
          const hasSub = item.subItems?.length > 0;
          const isActive =
            pathname.startsWith(item.path) ||
            item.subItems?.some((sub) => pathname === sub.path);
          const isOpen = activeParent === item.text;

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
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white shadow-lg shadow-violet-950/40'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                    isActive
                      ? 'bg-white/20'
                      : 'bg-white/5 group-hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1 truncate">{item.text}</span>
                {hasSub && (
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    } ${isActive ? 'text-white/80' : 'text-slate-500'}`}
                  />
                )}
              </button>

              {hasSub && isOpen && (
                <div className="ml-7 mt-1 space-y-0.5 border-l border-white/10 pl-3">
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
                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-all duration-200 ${
                          isSubActive
                            ? 'bg-violet-500/20 font-medium text-violet-200'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <SubIcon
                          className={`h-3.5 w-3.5 shrink-0 ${
                            isSubActive ? 'text-violet-300' : ''
                          }`}
                        />
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

      {/* User card */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
          <img
            src={profileImage}
            alt={user?.username || 'User profile'}
            className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white/10"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-100">
              {user?.username || ''}
            </p>
            <p className="truncate text-xs text-slate-400">{formatRole(user?.role)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */
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
  const { user, logout, isAuthenticated, updateUser } = useAuthStore();

  const childrenContainerRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

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

    if (currentParent && currentParent.subItems) {
      setActiveParent(currentParent.text);
    } else {
      setActiveParent(null);
    }
  }, [location.pathname]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setProfileDropdownOpen(false);
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfileForm((prev) => ({ ...prev, profilePicture: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();

    if (!user?._id) return;

    const username = profileForm.username.trim();
    const email = profileForm.email.trim();

    if (!username || !email) {
      return;
    }

    const hasNewProfileImage =
      typeof profileForm.profilePicture === 'string' &&
      profileForm.profilePicture.startsWith('data:image/');

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

  const profileImage = user?.profilePicture && user.profilePicture !== 'lama dhigin sawir'
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

  const sidebarProps = {
    items: filteredMenuItems,
    user,
    pathname: location.pathname,
    activeParent,
    setActiveParent,
    navigate,
  };

  return (
    <div className="flex h-screen bg-slate-50 antialiased">
      {/* Mobile sidebar */}
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
          <div
            ref={ref}
            className="fixed inset-y-0 left-0 z-50 w-72 shadow-2xl lg:hidden"
          >
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
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:shrink-0">
        <div className="flex w-72 flex-col border-r border-slate-800">
          <SidebarContent {...sidebarProps} />
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
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
            <div
              ref={ref}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            >
              <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Edit profile</h3>
                    <p className="text-sm text-slate-500">Update your profile details</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProfileEditOpen(false)}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <img
                        src={
                          profileForm.profilePicture &&
                          profileForm.profilePicture !== 'lama keenin sawir'
                            ? profileForm.profilePicture
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                profileForm.username || user?.username || 'User'
                              )}&background=random`
                        }
                        alt="Profile preview"
                        className="h-20 w-20 rounded-full object-cover ring-4 ring-violet-100"
                      />
                    </div>

                    <label className="cursor-pointer rounded-lg border border-dashed border-violet-300 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-100">
                      Change photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileImageChange}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(event) =>
                        setProfileForm((prev) => ({ ...prev, username: event.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(event) =>
                        setProfileForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsProfileEditOpen(false)}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-violet-500/20 transition hover:from-violet-700 hover:to-indigo-700"
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
        <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-slate-900">
                {currentItem?.text || 'Dashboard'}
              </h1>
              {currentSub && (
                <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                  <span>{currentItem.text}</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="font-medium text-violet-600">{currentSub.text}</span>
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
                className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full bg-rose-500 ring-2 ring-white" />
              </button>

              <Transition
                show={notificationsOpen}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                {(ref) => (
                  <div
                    ref={ref}
                    className="absolute right-0 z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/10"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <span className="text-sm font-semibold text-slate-900">
                        Notifications
                      </span>
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                        2 new
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      <div className="flex cursor-pointer gap-3 px-4 py-3 transition hover:bg-slate-50">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                          <ClipboardList className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900">New exam scheduled</p>
                          <p className="mt-0.5 text-xs text-slate-500">Math final exam on Friday</p>
                          <p className="mt-1 text-[11px] text-slate-400">2 hours ago</p>
                        </div>
                      </div>

                      <div className="flex cursor-pointer gap-3 px-4 py-3 transition hover:bg-slate-50">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900">New student registered</p>
                          <p className="mt-0.5 text-xs text-slate-500">Ahmed Mohamed joined Class 10</p>
                          <p className="mt-1 text-[11px] text-slate-400">5 hours ago</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-center">
                      <a
                        href="#"
                        className="text-xs font-semibold text-violet-600 transition hover:text-violet-800"
                      >
                        View all
                      </a>
                    </div>
                  </div>
                )}
              </Transition>
            </div>

            <div className="hidden h-6 w-px bg-slate-200 sm:block" />

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition hover:bg-slate-100 focus:outline-none"
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsOpen(false);
                }}
              >
                <img
                  src={profileImage}
                  alt={user?.username || 'User profile'}
                  className="h-9 w-9 rounded-full object-cover shadow-md shadow-violet-500/30 ring-2 ring-violet-100"
                />
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold leading-tight text-slate-800">
                    {user?.username || ''}
                  </p>
                  <p className="text-[11px] leading-tight text-slate-500">
                    {formatRole(user?.role)}
                  </p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    profileDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <Transition
                show={profileDropdownOpen}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                {(ref) => (
                  <div
                    ref={ref}
                    className="absolute right-0 z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/10"
                  >
                    <div className="flex items-center gap-3 bg-gradient-to-br from-violet-50 to-indigo-50 px-4 py-4">
                      <img
                        src={profileImage}
                        alt={user?.username || 'User profile'}
                        className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-violet-100"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {user?.username || ''}
                        </p>
                        <p className="truncate text-xs text-slate-500">{user?.email || ''}</p>
                        <span className="mt-1.5 inline-block rounded-full bg-violet-700 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                          {formatRole(user?.role)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 p-1.5">
                      <button
                        onClick={() => {
                          setProfileForm({
                            username: user?.username || '',
                            email: user?.email || '',
                            profilePicture: user?.profilePicture || '',
                          });
                          setIsProfileEditOpen(true);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-600"
                      >
                        <UserCog className="h-4 w-4" />
                        Edit profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </Transition>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <main
            ref={childrenContainerRef}
            className="custom-scrollbar flex h-full flex-col overflow-y-auto p-4 sm:p-6"
          >
            <div className="mx-auto w-full max-w-7xl flex-1">
              {showTeacherNotice && user && ['teacher', 'admin', 'super_admin', 'superAdmin'].includes(user.role) && (
                <TeacherNotice role={user.role} onClose={() => setShowTeacherNotice(false)} />
              )}
              {children}
            </div>

            <footer className="mx-auto mt-10 w-full max-w-7xl border-t border-slate-200 pt-5 text-center text-sm text-slate-500">
              <p className="font-medium text-slate-600">
                AL-FURQAAN Management System © {new Date().getFullYear()}
              </p>
              <p className="mt-1 text-xs">Version 1.0.0 · Designed with passion for education</p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;