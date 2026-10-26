import React, { useState } from 'react';
import { useTaskToggle } from '../context/TaskToggleContext';
import { CheckSquare, Clock, ChevronDown, UserCheck, ShieldCheck, FlaskConical } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, users, switchUser, officeTiming, orgSettings } = useTaskToggle();
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Brand logo & name */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
          <CheckSquare className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-['Outfit'] font-bold text-lg tracking-tight text-slate-900">
              TaskToggle
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
              {orgSettings.orgName}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Daily To-Do & Task Toggle</p>
        </div>
      </div>

      {/* Right controls: Office hours chip & Temporary Testing Character Switcher */}
      <div className="flex items-center gap-3">
        {/* Office Hours Chip */}
        <div className="flex items-center gap-2 bg-indigo-50/80 border border-indigo-100/80 text-indigo-900 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>
            Office hours <strong className="font-bold text-indigo-700">{officeTiming.openTime} – {officeTiming.closeTime}</strong>
          </span>
        </div>

        {/* --- TEMPORARY TESTING CHARACTER SWITCHER (Will be removed after testing) --- */}
        <div className="relative">
          <button
            onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
            className="flex items-center gap-2 bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-200/90 text-indigo-900 p-1 pr-3 rounded-full transition-all cursor-pointer shadow-2xs"
            title="Click to switch characters for testing (Admin vs Staff)"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
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
            <ChevronDown className="w-3.5 h-3.5 text-indigo-500 ml-0.5" />
          </button>

          {/* Character Switcher Dropdown */}
          {showSwitchDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 pb-2 mb-1 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
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
                Temporary helper for testing · Will be removed before launch
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
