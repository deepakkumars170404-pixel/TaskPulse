import React from 'react';
import { useTaskToggle } from '../context/TaskToggleContext';
import {
  LayoutDashboard,
  UserPlus,
  ListTodo,
  Clock,
  CheckCircle2,
  PlusCircle,
  Inbox,
  LogOut,
  X,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { currentUser, currentPage, setCurrentPage, logout, tasks, officeTiming, orgSettings } = useTaskToggle();

  // Calculate pending requests count for current staff member
  const pendingRequestsCount = tasks.filter(
    (t) => t.assignedTo === currentUser.id && t.type === 'staff' && t.status === 'pending'
  ).length;

  const handleNavClick = (page: any) => {
    setCurrentPage(page);
    if (onCloseMobile) onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full p-4 sm:p-5">
      <div className="space-y-5">
        {/* User Card on Top of Sidebar with Tri-Color Accent */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 via-indigo-50/50 to-cyan-50/40 border border-indigo-100/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-md ring-2 ring-white shrink-0 ${
                currentUser.avatarBg || 'bg-gradient-to-tr from-indigo-600 to-cyan-500'
              }`}
            >
              {currentUser.initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 leading-tight truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 capitalize font-bold flex items-center gap-1 mt-0.5">
                {currentUser.role === 'admin' ? (
                  <ShieldCheck className="w-3 h-3 text-indigo-600" />
                ) : (
                  <UserCheck className="w-3 h-3 text-cyan-600" />
                )}
                <span className="truncate">{currentUser.role} · {orgSettings.orgName}</span>
              </div>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Panel label */}
        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 flex items-center justify-between">
          <span>{currentUser.role === 'admin' ? 'Executive Panel' : 'Staff Workspace'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          {currentUser.role === 'admin' ? (
            <>
              <button
                type="button"
                onClick={() => handleNavClick('dashboard')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                  currentPage === 'dashboard'
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white shadow-md shadow-indigo-300/50 font-black'
                    : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 font-bold'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Executive Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('assign')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                  currentPage === 'assign'
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white shadow-md shadow-indigo-300/50 font-black'
                    : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 font-bold'
                }`}
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                <span>Assign Task</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('monitor')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                  currentPage === 'monitor'
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white shadow-md shadow-indigo-300/50 font-black'
                    : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 font-bold'
                }`}
              >
                <ListTodo className="w-4 h-4 shrink-0" />
                <span>Task Monitor</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('timing')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                  currentPage === 'timing'
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white shadow-md shadow-indigo-300/50 font-black'
                    : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 font-bold'
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                <span>Timing Settings</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleNavClick('mytodo')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                  currentPage === 'mytodo'
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white shadow-md shadow-indigo-300/50 font-black'
                    : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 font-bold'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>My Daily To-Do</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('create')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                  currentPage === 'create'
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white shadow-md shadow-indigo-300/50 font-black'
                    : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 font-bold'
                }`}
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span>Create To-Do</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('requests')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                  currentPage === 'requests'
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white shadow-md shadow-indigo-300/50 font-black'
                    : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 font-bold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Inbox className="w-4 h-4 shrink-0" />
                  <span>Task Requests</span>
                </div>
                {pendingRequestsCount > 0 && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      currentPage === 'requests'
                        ? 'bg-white text-indigo-700'
                        : 'bg-rose-500 text-white shadow-xs'
                    }`}
                  >
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Bottom Section: Office hours info + Logout */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="bg-gradient-to-br from-slate-50 to-indigo-50/50 rounded-2xl p-3.5 border border-indigo-100/80 text-[11px] text-slate-500 shadow-2xs">
          <div className="flex items-center gap-1.5 font-black text-slate-800 mb-0.5">
            <Clock className="w-3.5 h-3.5 text-cyan-600" />
            <span>Working Schedule</span>
          </div>
          <div className="font-bold text-slate-700">{officeTiming.openTime} – {officeTiming.closeTime}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-semibold">{officeTiming.workingDays.join(', ')}</div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            logout();
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-white/95 backdrop-blur-md border-r border-indigo-100/80 min-h-[calc(100vh-65px)] shrink-0 flex-col justify-between shadow-[2px_0_15px_-3px_rgba(79,70,229,0.03)]">
        {navContent}
      </aside>

      {/* 2. Mobile Slide-Over Drawer with Backdrop Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
