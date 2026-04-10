import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  BookOpen, BarChart2, LayoutDashboard, Users,
  CheckSquare, Inbox, LogOut, GraduationCap, UserCog, Brain, ChevronLeft, ChevronRight, Code2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useEffect, useMemo, useState } from 'react';

const NAV = {
  student: [
    { to: '/student/courses', label: 'My Courses', icon: BookOpen },
    { to: '/student/learning', label: 'Learning', icon: Brain },
    { to: '/student/dsa', label: 'DSA', icon: Code2 },
    { to: '/student/progress', label: 'My Progress', icon: BarChart2 },
    { to: '/student/profile', label: 'Edit Profile', icon: UserCog },
  ],
  teacher: [
    { to: '/teacher/courses', label: 'My Courses', icon: BookOpen },
    { to: '/teacher/progress', label: 'Course Progress', icon: CheckSquare },
    { to: '/teacher/review', label: 'AI Review', icon: Inbox },
    { to: '/teacher/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/teacher/profile', label: 'Edit Profile', icon: UserCog },
  ],
  admin: [
    { to: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/courses', label: 'Manage Courses', icon: BookOpen },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
  ],
};

const ROLE_COLORS = {
  admin: 'bg-indigo-500/20 text-indigo-300',
  teacher: 'bg-emerald-500/20 text-emerald-300',
  student: 'bg-blue-500/20 text-blue-300',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = NAV[user?.role] || [];
  const storageKey = useMemo(() => `lms_sidebar_collapsed_${user?.role || 'guest'}`, [user?.role]);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const width = collapsed ? '4rem' : '15rem';
    document.documentElement.style.setProperty('--sidebar-width', width);
    try {
      localStorage.setItem(storageKey, collapsed ? '1' : '0');
    } catch {
      // ignore
    }
  }, [collapsed, storageKey]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-[#0F172A] flex flex-col z-40 select-none transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className={cn('border-b border-slate-800', collapsed ? 'px-3 py-4' : 'px-5 py-6')}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white font-bold text-base leading-tight truncate">EduAI LMS</p>
              <p className="text-slate-500 text-xs truncate">B.Tech CSE Platform</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                  isActive
                    ? 'bg-[#1E293B] text-white border-l-[3px] border-indigo-500 pl-[9px]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                )
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-800">
        <div className={cn('flex items-center gap-3 mb-3', collapsed ? 'px-1' : 'px-2')}>
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-slate-200 text-sm font-medium truncate">{user?.name}</p>
              <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', ROLE_COLORS[user?.role])}>
                {user?.role}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
              'ml-auto w-9 h-9 rounded-lg border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors flex items-center justify-center',
              collapsed ? '' : ''
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '>>' : '<<'}
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 text-sm"
        >
          <LogOut size={16} />
          {!collapsed && 'Sign out'}
        </button>
      </div>
    </aside>
  );
}

