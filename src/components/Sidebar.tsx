import React, { useState, useRef, useEffect } from 'react';
import { useTaskToggle } from '../context/TaskToggleContext';
import {
  LayoutDashboard,
  UserPlus,
  ListTodo,
  Clock,
  Users,
  LogOut,
  ChevronLeft,
  ChevronDown,
  ShieldCheck,
  CheckSquare,
  Check,
  PlusCircle,
  Inbox,
  CalendarDays,
  UserCheck,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenDirectory?: () => void;
  onOpenDepartments?: () => void;
  onOpenReports?: () => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
  onOpenAssignModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
  onOpenDirectory,
  onOpenAssignModal,
}) => {
  const { currentUser, users, switchUser, currentPage, setCurrentPage, logout, officeTiming, tasks } = useTaskToggle();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate pending requests count for current staff member
  const pendingRequestsCount = tasks.filter(
    (t) => t.assignedTo === currentUser.id && t.type === 'staff' && t.status === 'pending'
  ).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  const handleNavClick = (page: string) => {
    setCurrentPage(page);
    if (onCloseMobile) onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full bg-[#FAFAFD] text-slate-700 select-none text-[13px]">
      <div className="p-3.5 sm:p-4 space-y-4 overflow-y-auto no-scrollbar">
        {/* Top: Brand Logo + Collapse Button */}
        <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Logo: indigo rounded-square icon with a check-box symbol */}
            <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white shadow-xs shrink-0">
              <CheckSquare className="w-4 h-4 stroke-[2.4]" />
            </div>
            <div className="min-w-0">
              <div className="text-[15px] font-bold tracking-tight text-slate-900 leading-none flex items-center">
                <span>Task</span>
                <span className="text-[#4F46E5]">Toggle</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                Daily Task Scheduling Platform
              </p>
            </div>
          </div>

          {/* Collapse "<" Button */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex w-6 h-6 rounded-md items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-all cursor-pointer shrink-0"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          )}

          {/* Mobile close button */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 cursor-pointer shrink-0"
              aria-label="Close menu"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* User Card with Identity Switcher */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="w-full p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition-all flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                {currentUser.initials || 'DA'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 truncate leading-tight group-hover:text-[#4F46E5] transition-colors">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                  {currentUser.role === 'admin' ? (
                    <ShieldCheck className="w-3 h-3 text-[#4F46E5] shrink-0" />
                  ) : (
                    <UserCheck className="w-3 h-3 text-teal-600 shrink-0" />
                  )}
                  <span className="truncate capitalize">{currentUser.role} • Deepak</span>
                </div>
              </div>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#4F46E5] transition-transform duration-200 shrink-0 ${
                showUserDropdown ? 'rotate-180 text-[#4F46E5]' : ''
              }`}
            />
          </button>

          {/* User Switcher Dropdown */}
          {showUserDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1.5 animate-in fade-in duration-100">
              <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Switch Identity
              </div>
              <div className="space-y-0.5 max-h-48 overflow-y-auto no-scrollbar">
                {users.map((u) => {
                  const isSelected = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        switchUser(u.id);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                          {u.initials || u.name.charAt(0)}
                        </span>
                        <div className="min-w-0 text-left">
                          <div className="truncate text-xs font-medium leading-tight">{u.name}</div>
                          <div className="text-[9px] text-slate-400 capitalize">{u.role}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3 h-3 text-[#4F46E5] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* NAVIGATION MENU */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-slate-400 tracking-[0.06em] uppercase px-2 py-1 flex items-center justify-between">
            <span>{currentUser.role === 'admin' ? 'MAIN MENU' : 'STAFF MENU'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
          </div>

          <nav className="space-y-0.5">
            {currentUser.role === 'admin' ? (
              /* ADMIN NAVIGATION TABS */
              <>
                <button
                  type="button"
                  onClick={() => handleNavClick('dashboard')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    currentPage === 'dashboard'
                      ? 'btn-primary-gradient text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0 stroke-[1.8]" />
                  <span>Executive Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenAssignModal) {
                      onOpenAssignModal();
                    } else {
                      handleNavClick('assign');
                    }
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    currentPage === 'assign'
                      ? 'btn-primary-gradient text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <UserPlus className="w-4 h-4 shrink-0 stroke-[1.8]" />
                  <span>Assign Task</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('monitor')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    currentPage === 'monitor'
                      ? 'btn-primary-gradient text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <ListTodo className="w-4 h-4 shrink-0 stroke-[1.8]" />
                  <span>Task Monitor</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('timing')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    currentPage === 'timing'
                      ? 'btn-primary-gradient text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <Clock className="w-4 h-4 shrink-0 stroke-[1.8]" />
                  <span>Timing Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('calendar')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    currentPage === 'calendar'
                      ? 'btn-primary-gradient text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <CalendarDays className="w-4 h-4 shrink-0 stroke-[1.8]" />
                  <span>Company Calendar</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenDirectory || (() => handleNavClick('monitor'))}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4 shrink-0 stroke-[1.8]" />
                  <span>Staff Directory</span>
                </button>
              </>
            ) : (
              /* STAFF NAVIGATION TABS */
              <>
                <button
                  type="button"
                  onClick={() => handleNavClick('mytodo')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    currentPage === 'mytodo'
                      ? 'btn-primary-gradient text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <ListTodo className="w-4 h-4 shrink-0 stroke-[1.8]" />
                  <span>My To-Do Tasks</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('create')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    currentPage === 'create'
                      ? 'btn-primary-gradient text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 shrink-0 stroke-[1.8]" />
                  <span>Create Task</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('requests')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    currentPage === 'requests'
                      ? 'btn-primary-gradient text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Inbox className="w-4 h-4 shrink-0 stroke-[1.8]" />
                    <span>Task Requests</span>
                  </div>
                  {pendingRequestsCount > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        currentPage === 'requests'
                          ? 'bg-white text-[#4F46E5]'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {pendingRequestsCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('calendar')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    currentPage === 'calendar'
                      ? 'btn-primary-gradient text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <CalendarDays className="w-4 h-4 shrink-0 stroke-[1.8]" />
                  <span>Company Calendar</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Working Schedule Card */}
        <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-xs mt-3">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-md bg-[#FFFBEB] flex items-center justify-center text-[#D97706]">
              <Clock className="w-3 h-3 stroke-[2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-900">Working Schedule</span>
          </div>
          <div className="text-xs font-bold text-slate-800 pl-6.5">
            {officeTiming.openTime || '09:30 AM'} – {officeTiming.closeTime || '06:30 PM'}
          </div>
          <div className="text-[10px] text-slate-400 pl-6.5 mt-0.5 font-medium">
            {officeTiming.workingDays?.join(', ') || 'Mon, Tue, Wed, Thu, Fri'}
          </div>
        </div>
      </div>

      {/* Bottom: Log out */}
      <div className="p-3 border-t border-slate-200/80 bg-[#FAFAFD]">
        <button
          type="button"
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            logout();
          }}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0 stroke-[1.8]" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar: ~245px width, sticky */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 bg-[#FAFAFD] border-r border-slate-200/80 h-screen sticky top-0 transition-all duration-200 z-20 ${
          isCollapsed ? 'w-16' : 'w-[245px]'
        }`}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-[260px] max-w-[85vw] bg-[#FAFAFD] h-full shadow-2xl flex flex-col z-10 border-r border-slate-200 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
