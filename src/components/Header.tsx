import React, { useState, useRef, useEffect } from 'react';
import { useTaskToggle } from '../context/TaskToggleContext';
import {
  CheckSquare,
  Clock,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  Menu,
  MonitorUp,
  LogOut,
  Palette,
  Check,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { currentUser, users, switchUser, logout, officeTiming, orgSettings, themePreset, setThemePreset, bgCanvas, setBgCanvas, fontFamily, setFontFamily } = useTaskToggle();
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
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
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 hover:text-primary-500 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Brand Logo - Crisp Solid Royal Indigo */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white shadow-xs shrink-0">
          <CheckSquare className="w-5 h-5 stroke-[2.5]" />
        </div>

        {/* Brand name & Org tag */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-['Outfit'] font-black text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
              Task<span className="text-primary-500">Toggle</span>
            </span>

            {/* Organization Badge (Deepak) */}
            <span className="hidden xs:inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-800 border border-primary-200/90">
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
              return;
            }

            // Immediately and synchronously trigger Document PiP to guarantee active user gesture
            window.dispatchEvent(new CustomEvent('open-pip-window'));
          }}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
          title="Float TaskToggle mini popup over all other apps and games"
        >
          <MonitorUp className="w-3.5 h-3.5 text-white/90" />
          <span>Float Over Apps</span>
        </button>

        {/* Office Hours Chip */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-800 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-[11px] sm:text-xs font-bold text-slate-900">
            <span className="hidden md:inline font-normal text-slate-500">Office: </span>
            {officeTiming.openTime} – {officeTiming.closeTime}
          </span>
        </div>

        {/* Executive Theme, Canvas & Font Customizer */}
        <div className="relative" ref={themeRef}>
          <button
            type="button"
            onClick={() => setShowThemeDropdown(!showThemeDropdown)}
            className={`flex items-center gap-1.5 border px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
              showThemeDropdown
                ? 'bg-primary-50 border-primary-300 text-primary-800'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
            title="Customize Theme Palette, Canvas & Typography"
            aria-expanded={showThemeDropdown}
          >
            <Palette className="w-3.5 h-3.5 text-primary-500 shrink-0" />
            <span className="hidden sm:inline">Theme</span>
          </button>

          {showThemeDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-800 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">Executive Appearance</p>
                  <p className="text-[10px] text-slate-500 font-medium">Palette, Canvas & Typography</p>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                  Instant
                </span>
              </div>

              {/* 1. Theme Palette */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Executive Palette
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'navy', label: 'Royal Navy', sub: 'Stripe / Corporate', color: 'bg-blue-600' },
                    { id: 'slate', label: 'Titanium', sub: 'Linear / Minimalist', color: 'bg-slate-900' },
                    { id: 'emerald', label: 'Emerald', sub: 'Enterprise SaaS', color: 'bg-emerald-600' },
                    { id: 'orange', label: 'Terracotta', sub: 'Anthropic / Warm', color: 'bg-orange-500' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setThemePreset(t.id as any)}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                        themePreset === t.id
                          ? 'border-primary-500 bg-primary-50 text-slate-900 font-bold shadow-2xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs ${t.color}`} />
                        <div>
                          <div className="text-[11px] leading-tight font-bold">{t.label}</div>
                          <div className="text-[9px] text-slate-500">{t.sub}</div>
                        </div>
                      </div>
                      {themePreset === t.id && <Check className="w-3.5 h-3.5 text-primary-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Background Canvas */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Background Canvas
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'slate', label: 'Cool Slate', code: '#F8FAFC' },
                    { id: 'white', label: 'Pure White', code: '#FFFFFF' },
                    { id: 'stone', label: 'Warm Stone', code: '#FAFAF9' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBgCanvas(b.id as any)}
                      className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                        bgCanvas === b.id
                          ? 'border-primary-500 bg-primary-50 text-slate-900 font-bold shadow-2xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600 text-xs'
                      }`}
                    >
                      <div className="text-[10px] font-bold">{b.label}</div>
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">{b.code}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Typography Stack */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Typography Stack
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'inter', label: 'Inter', desc: 'Stripe SaaS' },
                    { id: 'jakarta', label: 'Plus Jakarta', desc: 'Modern' },
                    { id: 'system', label: 'Native OS', desc: 'Apple/Win' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFontFamily(f.id as any)}
                      className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                        fontFamily === f.id
                          ? 'border-primary-500 bg-primary-50 text-slate-900 font-bold shadow-2xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="text-[10px] font-bold">{f.label}</div>
                      <div className="text-[9px] text-slate-400">{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Testing Character Switcher (Active for easy presentation between Admin and Staff) */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 p-1 sm:pr-3 rounded-full transition-all cursor-pointer shadow-2xs"
            title="Click to switch persona (Admin vs Staff)"
            aria-expanded={showSwitchDropdown}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                currentUser.avatarBg || 'bg-primary-500'
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
                      ? 'bg-primary-500 text-white'
                      : 'bg-primary-50 text-primary-600'
                  }`}
                >
                  {currentUser.role.toUpperCase()}
                </span>
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* User Switcher Dropdown (Allows 1-click switching to any staff or admin for presentation) */}
          {showSwitchDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Team Members & Switcher
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    1-Click switch persona dashboard
                  </p>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary-50 text-primary-600">
                  {users.length} Active
                </span>
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
                          ? 'bg-primary-50/80 text-primary-950 font-bold border border-primary-200/60'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 ${
                            u.avatarBg || 'bg-primary-500'
                          }`}
                        >
                          {u.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                            {u.name}
                            {u.role === 'admin' ? (
                              <ShieldCheck className="w-3 h-3 text-primary-500 shrink-0" />
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
                        <span className="text-[10px] font-black text-primary-500 px-1.5 py-0.5 rounded bg-white shadow-2xs shrink-0">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowSwitchDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition-all cursor-pointer border border-slate-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
