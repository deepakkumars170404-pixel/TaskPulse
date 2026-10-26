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
    <header className="bg-white border-b border-slate-200 px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Menu Trigger + Brand logo & name */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hamburger Menu button for mobile */}
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Logo icon */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 shrink-0">
          <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </div>

        {/* Brand name & Org tag */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-['Outfit'] font-bold text-base sm:text-lg tracking-tight text-slate-900 leading-none">
              TaskToggle
            </span>
            <span className="hidden xs:inline-block text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 truncate max-w-[100px] sm:max-w-none">
              {orgSettings.orgName}
            </span>
          </div>
          <p className="hidden sm:block text-[11px] text-slate-400 font-medium">Daily To-Do & Task Toggle</p>
        </div>
      </div>

      {/* Right controls: Office hours chip & Temporary Testing Character Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Office Hours Chip */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-indigo-50/80 border border-indigo-100/80 text-indigo-900 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs">
          <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="text-[11px] sm:text-xs">
            <span className="hidden md:inline">Office hours </span>
            <strong className="font-bold text-indigo-700">{officeTiming.openTime} – {officeTiming.closeTime}</strong>
          </span>
        </div>

        {/* --- TESTING CHARACTER SWITCHER --- */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
            className="flex items-center gap-1.5 sm:gap-2 bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-200/90 text-indigo-900 p-1 sm:pr-3 rounded-full transition-all cursor-pointer shadow-2xs"
            title="Click to switch characters for testing (Admin vs Staff)"
            aria-expanded={showSwitchDropdown}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                currentUser.avatarBg || 'bg-indigo-600'
              }`}
            >
              {currentUser.initials}
            </div>

            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold uppercase bg-amber-200/80 text-amber-950 flex items-center gap-0.5">
                  <FlaskConical className="w-2.5 h-2.5" />
                  <span>Test</span>
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 block leading-none">
                {currentUser.role}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-indigo-500 pr-0.5 sm:pr-0" />
          </button>

          {/* Character Switcher Dropdown */}
          {showSwitchDropdown && (
            <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-slate-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 pb-2 mb-1 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
                  <span>Switch Character (Testing)</span>
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto py-1">
                {users.map((u) => {
                  const isActive = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        switchUser(u.id);
                        setShowSwitchDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-900 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs text-white font-bold shrink-0 ${
                          u.avatarBg || 'bg-slate-500'
                        }`}
                      >
                        {u.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-semibold text-slate-900">{u.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{u.role}</div>
                      </div>
                      {u.role === 'admin' ? (
                        <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                      ) : (
                        <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="px-3 pt-2 mt-1 border-t border-slate-100 text-[10px] text-slate-400 italic text-center">
                Switch role instantly to test Admin vs Staff flows
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
