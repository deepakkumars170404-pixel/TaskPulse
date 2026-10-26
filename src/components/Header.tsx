import React, { useState } from 'react';
import { useTaskPulse } from '../context/TaskPulseContext';
import { CheckSquare, Clock, ChevronDown, UserCheck, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, users, switchUser, officeTiming, orgSettings } = useTaskPulse();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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
              TaskPulse
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
              {orgSettings.orgName}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Daily To-Do & Task Toggle</p>
        </div>
      </div>

      {/* Right controls: Office hours chip & User quick switcher */}
      <div className="flex items-center gap-3">
        {/* Office Hours Chip (Matches Page designs) */}
        <div className="flex items-center gap-2 bg-indigo-50/80 border border-indigo-100/80 text-indigo-900 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>
            Office hours <strong className="font-bold text-indigo-700">{officeTiming.openTime} – {officeTiming.closeTime}</strong>
          </span>
        </div>

        {/* User Avatar Chip with Quick Demo Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 transition-colors p-1 pr-3 rounded-full border border-slate-200"
            title="Click to switch role or staff member for testing"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                currentUser.avatarBg || 'bg-indigo-600'
              }`}
            >
              {currentUser.initials}
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-semibold text-slate-800 block leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 block leading-none">
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* Quick Demo Role Switcher Dropdown */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Switch Active User / Role
              </div>
              <div className="max-h-72 overflow-y-auto py-1">
                {users.map((u) => {
                  const isActive = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors ${
                        isActive ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold ${
                          u.avatarBg || 'bg-slate-500'
                        }`}
                      >
                        {u.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{u.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{u.role}</div>
                      </div>
                      {u.role === 'admin' ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
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

