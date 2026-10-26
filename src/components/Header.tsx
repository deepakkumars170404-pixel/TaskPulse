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
  Database,
  Sparkles,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { currentUser, users, switchUser, officeTiming, orgSettings, isBackendConnected } = useTaskToggle();
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
    <header className="bg-white/90 backdrop-blur-md border-b border-indigo-100/70 px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between sticky top-0 z-30 shadow-[0_4px_20px_-4px_rgba(79,70,229,0.06)] transition-all">
      {/* Left: Mobile Menu Trigger + Brand logo & name */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Hamburger Menu button for mobile */}
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/80 border border-slate-200/90 transition-colors cursor-pointer shadow-2xs"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Brand Logo with 3-color vibrant gradient (Indigo -> Violet -> Cyan) */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-400/40 shrink-0 ring-2 ring-white">
          <CheckSquare className="w-5 h-5 stroke-[2.5]" />
        </div>

        {/* Brand name & Org tag */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-['Outfit'] font-black text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
              Task<span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">Toggle</span>
            </span>

            {/* Organization Badge (Deepak) - Vibrant Gradient Pill */}
            <span className="hidden xs:inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white shadow-xs shadow-indigo-300/40">
              <Sparkles className="w-3 h-3 text-cyan-200" />
              <span>{orgSettings.orgName}</span>
            </span>
          </div>
          <p className="hidden sm:block text-[11px] text-slate-400 font-semibold tracking-wide">
            Enterprise Task Scheduling & Daily Timing Platform
          </p>
        </div>
      </div>

      {/* Right controls: Backend Status, Office hours chip & Testing Character Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend Cloud Sync Chip - Vibrant Emerald / Teal */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
            isBackendConnected
              ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border-emerald-200/90 shadow-2xs'
              : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}
          title={
            isBackendConnected
              ? 'Connected to live Supabase cloud database with Real-time synchronization'
              : 'Backend serverless endpoints active'
          }
        >
          <Database className={`w-3.5 h-3.5 ${isBackendConnected ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span>{isBackendConnected ? 'Supabase Live' : 'Backend Ready'}</span>
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendConnected ? 'bg-emerald-500 animate-pulse ring-2 ring-emerald-200' : 'bg-slate-300'
            }`}
          />
        </div>

        {/* Office Hours Chip - Cyan / Indigo Tint */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-indigo-50/80 via-sky-50/70 to-cyan-50/80 border border-indigo-200/80 text-indigo-950 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs transition-all">
          <Clock className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
          <span className="text-[11px] sm:text-xs">
            <span className="hidden lg:inline text-indigo-700 font-semibold">Office: </span>
            <strong className="font-extrabold text-indigo-950">{officeTiming.openTime} – {officeTiming.closeTime}</strong>
          </span>
        </div>

        {/* --- TESTING CHARACTER SWITCHER --- */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
            className="flex items-center gap-2 bg-white hover:bg-indigo-50/40 border border-slate-200/90 hover:border-indigo-400 text-slate-800 p-1 sm:pr-3 rounded-full transition-all cursor-pointer shadow-xs"
            title="Click to switch characters for testing (Admin vs Staff)"
            aria-expanded={showSwitchDropdown}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs ring-2 ring-white ${
                currentUser.avatarBg || 'bg-indigo-600'
              }`}
            >
              {currentUser.initials}
            </div>

            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-slate-900 leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase bg-amber-100 text-amber-900 border border-amber-300/80 flex items-center gap-0.5">
                  <FlaskConical className="w-2.5 h-2.5 text-amber-600" />
                  <span>Test</span>
                </span>
              </div>
              <span className="text-[10px] uppercase font-black tracking-wider text-indigo-600 block leading-none">
                {currentUser.role}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pr-0.5 sm:pr-0" />
          </button>

          {/* Character Switcher Dropdown */}
          {showSwitchDropdown && (
            <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-indigo-100 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 pb-2 mb-1 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
                  <span>Switch Character (Testing Mode)</span>
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
                          ? 'bg-gradient-to-r from-indigo-50 to-cyan-50/50 text-indigo-950 font-black'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs text-white font-black shrink-0 ${
                          u.avatarBg || 'bg-slate-500'
                        }`}
                      >
                        {u.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-bold text-slate-900">{u.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{u.role}</div>
                      </div>
                      {u.role === 'admin' ? (
                        <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                      ) : (
                        <UserCheck className="w-4 h-4 text-cyan-600 shrink-0" />
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
