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
    <div className="flex flex-col justify-between h-full p-4">
      <div className="space-y-4">
        {/* User Card on Mobile Drawer */}
        <div className="md:hidden pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold ${
                currentUser.avatarBg || 'bg-indigo-600'
              }`}
            >
              {currentUser.initials}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400 capitalize font-medium flex items-center gap-1 mt-0.5">
                {currentUser.role === 'admin' ? (
                  <ShieldCheck className="w-3 h-3 text-indigo-600" />
                ) : (
                  <UserCheck className="w-3 h-3 text-slate-400" />
                )}
                <span>{currentUser.role} · {orgSettings.orgName}</span>
              </div>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Panel label */}
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3">
          {currentUser.role === 'admin' ? 'Admin Navigation' : 'Staff Navigation'}
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          {currentUser.role === 'admin' ? (
            <>
              <button
                type="button"
                onClick={() => handleNavClick('dashboard')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  currentPage === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('assign')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  currentPage === 'assign'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                <span>Assign Task</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('monitor')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  currentPage === 'monitor'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <ListTodo className="w-4 h-4 shrink-0" />
                <span>Task Monitor</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('timing')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  currentPage === 'timing'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  currentPage === 'mytodo'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>My To-Do</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('create')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  currentPage === 'create'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span>Create To-Do</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('requests')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  currentPage === 'requests'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Inbox className="w-4 h-4 shrink-0" />
                  <span>Requests</span>
                </div>
                {pendingRequestsCount > 0 && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      currentPage === 'requests'
                        ? 'bg-white text-indigo-700'
                        : 'bg-indigo-100 text-indigo-700'
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
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-0.5">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Office Hours</span>
          </div>
          <div>{officeTiming.openTime} - {officeTiming.closeTime}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{officeTiming.workingDays.join(', ')}</div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            logout();
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50/70 transition-colors cursor-pointer"
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
      <aside className="hidden md:flex w-60 bg-white border-r border-slate-200 min-h-[calc(100vh-61px)] shrink-0 flex-col justify-between">
        {navContent}
      </aside>

      {/* 2. Mobile Slide-Over Drawer with Backdrop Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
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
