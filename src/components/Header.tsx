import React, { useState, useRef, useEffect } from 'react';
import { useTaskToggle } from '../context/TaskToggleContext';
import {
  CheckSquare,
  Clock,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  FlaskConical,
  Menu,
  MonitorUp,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { currentUser, users, switchUser, officeTiming, orgSettings } = useTaskToggle();
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSwitchDropdown(false);
      }
    };
    if (showSwitchDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSwitchDropdown]);

  return (
    <header className="bg-white border-b border-slate-200 px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-all">
      {/* Left: Mobile Menu Trigger + Brand logo & name */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Hamburger Menu button for mobile */}
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Brand Logo - Crisp Solid Royal Indigo */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
          <CheckSquare className="w-5 h-5 stroke-[2.5]" />
        </div>

        {/* Brand name & Org tag */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-['Outfit'] font-black text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
              Task<span className="text-indigo-600">Toggle</span>
            </span>

            {/* Organization Badge (Deepak) */}
            <span className="hidden xs:inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white shadow-2xs">
              {orgSettings.orgName}
            </span>
          </div>
          <p className="hidden sm:block text-[11px] text-slate-400 font-medium">
            Daily Task Scheduling Platform
          </p>
        </div>
      </div>

      {/* Right controls: Float Over Apps, Office Hours & User Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Float Over All Apps Button (Works over all desktop apps & games) */}
        <button
          type="button"
          onClick={() => {
            if (window.electronAPI?.isElectron) {
              if (window.electronAPI.showFloating) {
                window.electronAPI.showFloating();
              } else {
                window.electronAPI.resizeFloating('expanded');
              }
            } else {
              window.dispatchEvent(new CustomEvent('open-pip-window'));
            }
          }}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
          title="Float TaskToggle mini popup over all other apps and games"
        >
          <MonitorUp className="w-3.5 h-3.5 text-indigo-400" />
          <span>Float Over Apps</span>
        </button>

        {/* Office Hours Chip */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 border border-slate-200 text-slate-800 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-[11px] sm:text-xs">
            <span className="hidden lg:inline text-slate-500">Office: </span>
            <strong className="font-bold text-slate-900">{officeTiming.openTime} – {officeTiming.closeTime}</strong>
          </span>
        </div>

        {/* Testing Character Switcher */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 p-1 sm:pr-3 rounded-full transition-all cursor-pointer shadow-2xs"
            title="Click to switch characters (Admin vs Staff)"
            aria-expanded={showSwitchDropdown}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                currentUser.avatarBg || 'bg-indigo-600'
              }`}
            >
              {currentUser.initials}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-bold text-slate-900 leading-tight flex items-center gap-1">
                {currentUser.name}
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    currentUser.role === 'admin'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-50 text-indigo-700'
                  }`}
                >
                  {currentUser.role.toUpperCase()}
                </span>
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* User Switcher Dropdown */}
          {showSwitchDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FlaskConical className="w-3 h-3 text-indigo-600" />
                  Testing Persona Switcher
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Simulate different roles & observe task syncing in real-time.
                </p>
              </div>

              <div className="py-1 space-y-1 max-h-64 overflow-y-auto">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        switchUser(u.id);
                        setShowSwitchDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-50/80 text-indigo-950 font-bold border border-indigo-200/60'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 ${
                            u.avatarBg || 'bg-indigo-600'
                          }`}
                        >
                          {u.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                            {u.name}
                            {u.role === 'admin' ? (
                              <ShieldCheck className="w-3 h-3 text-indigo-600 shrink-0" />
                            ) : (
                              <UserCheck className="w-3 h-3 text-slate-400 shrink-0" />
                            )}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {u.role} · {u.email}
                          </p>
                        </div>
                      </div>

                      {isCurrent && (
                        <span className="text-[10px] font-black text-indigo-600 px-1.5 py-0.5 rounded bg-white shadow-2xs shrink-0">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
