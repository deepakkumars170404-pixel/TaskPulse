import React, { useState } from 'react';
import { useTaskToggle } from '../context/TaskToggleContext';
import { Role } from '../types';
import { CheckSquare, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, orgSettings } = useTaskToggle();
  const [role, setRole] = useState<Role>('admin');
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('••••••••');

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    if (newRole === 'admin') {
      setEmail('admin@company.com');
    } else {
      setEmail('priya@company.com');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-3.5 sm:p-6">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Hero Panel */}
        <div className="bg-indigo-600 text-white p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Logo & Org Badge */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <CheckSquare className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-['Outfit'] font-black text-xl tracking-tight">TaskToggle</span>
            </div>

            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 flex items-center gap-1.5 shadow-2xs">
              <span>{orgSettings.orgName}</span>
            </span>
          </div>

          {/* Center Pitch */}
          <div className="my-8 sm:my-10 relative z-10">
            <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-3">
              Plan the day.<br />Track the work.
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
              The high-performance workspace for office admin and staff to assign, accept, and deliver tasks on PC and mobile.
            </p>

            <ul className="space-y-3 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                <span>Admin dispatches compulsory tasks to staff</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                <span>Staff accept colleague requests with agreed deadlines</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                <span>Real-time instant task synchronization</span>
              </li>
            </ul>
          </div>

          {/* Footer note */}
          <div className="text-[11px] text-slate-400 relative z-10 hidden sm:flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Organization System Online · {orgSettings.orgName}</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-6 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="font-['Outfit'] text-xl sm:text-2xl font-black text-slate-900">Sign in to TaskToggle</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Access your daily schedule and assigned tasks</p>
          </div>

          {/* Role switcher toggle */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'admin'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('staff')}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'staff'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Staff</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer active:scale-95"
            >
              <span>Sign in as {role === 'admin' ? `Admin (${orgSettings.orgName})` : 'Staff Member'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-400 mt-6 font-medium">
            Only authorized {orgSettings.orgName} organization personnel can access this portal
          </p>
        </div>
      </div>
    </div>
  );
};
