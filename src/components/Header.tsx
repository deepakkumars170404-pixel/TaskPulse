import React, { useState, useRef, useEffect } from 'react';
import { useTaskToggle } from '../context/TaskToggleContext';
import {
  Search,
  Bell,
  Plus,
  Menu,
  CheckCircle2,
  X,
  CheckSquare,
  MonitorUp,
  ChevronDown,
  Clock,
  PlusCircle,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
  onOpenAssignModal?: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenAssignModal,
  searchQuery = '',
  setSearchQuery,
}) => {
  const { tasks, currentUser, orgSettings, setCurrentPage } = useTaskToggle();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFloatMenu, setShowFloatMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const floatMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (floatMenuRef.current && !floatMenuRef.current.contains(e.target as Node)) {
        setShowFloatMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ⌘K keyboard shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real task updates for notification log
  const recentActivities = tasks
    .filter((t) => t.status === 'done' || t.status === 'accepted' || t.pendingReason)
    .slice(0, 5);

  return (
    <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-30 flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile hamburger & breadcrumb/branding indicator */}
      <div className="flex items-center gap-2.5">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Open mobile menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-Time Cloud Sync</span>
          <span className="text-slate-300">•</span>
          <span className="text-[#4F46E5] font-semibold">{orgSettings.orgName || 'Workspace'}</span>
        </div>
      </div>

      {/* Right side: Search input with ⌘K chip, Floating Logo button, bell icon with red dot, primary button */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 justify-end max-w-2xl">
        {/* Search Input with ⌘K chip */}
        <div className="relative flex-1 max-w-sm hidden sm:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            placeholder="Search tasks, staff, or records..."
            className="w-full pl-8.5 pr-12 py-1.5 bg-slate-50 border border-slate-200/80 focus:border-[#4F46E5] focus:bg-white rounded-lg text-xs text-slate-800 placeholder-slate-400 transition-all outline-none"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-500 shadow-2xs pointer-events-none">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>

        {/* Floating Logo Menu with 2 Options */}
        <div className="relative" ref={floatMenuRef}>
          <button
            type="button"
            onClick={() => setShowFloatMenu(!showFloatMenu)}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-[#4F46E5] hover:bg-[#EEF2FF] border border-slate-200/80 hover:border-indigo-200 transition-all cursor-pointer shadow-2xs"
            title="Floating Logo Options"
          >
            <div className="w-4 h-4 rounded-md bg-[#4F46E5] text-white flex items-center justify-center">
              <CheckSquare className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
            <span>Floating Logo</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showFloatMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Floating Options Dropdown */}
          {showFloatMenu && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 text-xs font-jakarta animate-in fade-in duration-100">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Floating Mode Options
              </div>

              {/* Option 1: Float Over Other Browser Tabs (Chrome PiP) */}
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-pip-logo'));
                  setShowFloatMenu(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-emerald-50/60 transition-colors cursor-pointer group flex items-start gap-2"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <MonitorUp className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 group-hover:text-emerald-700 flex items-center gap-1.5">
                    <span>Float Across Other Tabs</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                      Cross-Tab
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    Stays visible when you switch to YouTube, Google, Word, etc.
                  </div>
                </div>
              </button>

              {/* Option 2: In-Page Floating Logo (Inside TaskToggle tab only) */}
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('toggle-inpage-logo'));
                  setShowFloatMenu(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group flex items-start gap-2 border-t border-slate-100 mt-1"
              >
                <div className="w-6 h-6 rounded-full bg-[#4F46E5] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <CheckSquare className="w-3.5 h-3.5 stroke-[2.4]" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 group-hover:text-[#4F46E5]">
                    In-Page Floating Logo
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    Pure logo icon inside TaskToggle dashboard (Stays in this tab).
                  </div>
                </div>
              </button>

              {/* Desktop App Tip */}
              <div className="mt-2 pt-2 border-t border-slate-100 px-1 text-[10px] text-slate-400">
                <span className="font-bold text-slate-600">Tip:</span> For 100% frameless desktop bubble with ZERO browser bar, run <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono text-[9px]">Start-TaskToggle-Floating.bat</code>.
              </div>
            </div>
          )}
        </div>

        {/* Bell Icon with Red Dot */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 hover:border-indigo-300 hover:bg-[#EEF2FF]/40 text-slate-500 hover:text-[#4F46E5] flex items-center justify-center transition-all cursor-pointer relative shadow-2xs"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-3.5 h-3.5 stroke-[1.8]" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#EF4444] ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3.5 animate-in fade-in duration-100">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">
                    Notifications & Sync Log
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                    Live
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto text-xs">
                {recentActivities.map((t) => (
                  <div key={t.id} className="py-2 flex items-start gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      t.status === 'done' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {t.status === 'done' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800">
                        {t.assignedToName || 'Staff'} {t.status === 'done' ? 'completed' : 'is working on'} {t.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {t.dueDate} {t.completedAt ? `· Done at ${t.completedAt}` : `· Due ${t.dueTime || ''}`}
                      </p>
                    </div>
                  </div>
                ))}

                {recentActivities.length === 0 && (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No recent updates recorded yet. Everything is synchronized.
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);
                    if (currentUser.role === 'admin') {
                      setCurrentPage('monitor');
                    } else {
                      setCurrentPage('mytodo');
                    }
                  }}
                  className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] cursor-pointer"
                >
                  {currentUser.role === 'admin' ? 'View full execution monitor →' : 'View my to-do tasks →'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Button: Role-based ("+ Assign New Task" for Admin, "+ Create Task" for Staff) */}
        {currentUser.role === 'admin' ? (
          <button
            type="button"
            onClick={() => {
              if (onOpenAssignModal) {
                onOpenAssignModal();
              } else {
                setCurrentPage('assign');
              }
            }}
            className="btn-primary-gradient px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all text-white"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Assign New Task</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentPage('create')}
            className="btn-primary-gradient px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all text-white"
          >
            <PlusCircle className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>+ Create Task</span>
          </button>
        )}
      </div>
    </header>
  );
};
