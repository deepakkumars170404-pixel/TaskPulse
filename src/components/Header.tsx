import React from 'react';
import { useTaskPulse } from '../context/TaskPulseContext';
import { CheckSquare, Clock } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, officeTiming, orgSettings } = useTaskPulse();

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

      {/* Right controls: Office hours chip & Logged-in User Profile (No Switcher) */}
      <div className="flex items-center gap-3">
        {/* Office Hours Chip */}
        <div className="flex items-center gap-2 bg-indigo-50/80 border border-indigo-100/80 text-indigo-900 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>
            Office hours <strong className="font-bold text-indigo-700">{officeTiming.openTime} – {officeTiming.closeTime}</strong>
          </span>
        </div>

        {/* User Profile Badge (Strictly Single User - Switch Option Removed) */}
        <div className="flex items-center gap-2.5 bg-slate-100/80 p-1.5 pr-3.5 rounded-full border border-slate-200/90">
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
        </div>
      </div>
    </header>
  );
};
