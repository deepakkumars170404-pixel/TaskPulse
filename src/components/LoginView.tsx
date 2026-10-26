import React, { useState } from 'react';
import { useTaskToggle } from '../context/TaskToggleContext';
import { Role } from '../types';
import { CheckSquare, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useTaskToggle();
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
    <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Hero Panel (Indigo gradient) */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 text-white p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900/40 rounded-full blur-2xl pointer-events-none" />

          {/* Logo */}
          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <CheckSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-['Outfit'] font-bold text-lg sm:text-xl tracking-tight">TaskToggle</span>
          </div>

          {/* Center Pitch */}
          <div className="my-6 sm:my-10 relative z-10">
            <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-bold tracking-tight leading-tight mb-2 sm:mb-3">
              Plan the day.<br />Track the work.
            </h1>
            <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 font-medium">
              A modern web app for office admin and staff to assign, accept, and complete daily tasks on PC and mobile.
            </p>

            <ul className="space-y-2 sm:space-y-2.5 text-xs text-indigo-100/90 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0" />
                <span>Admin assigns tasks to any staff</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0" />
                <span>Staff accept staff-to-staff requests</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0" />
                <span>Office timing managed in one place</span>
              </li>
            </ul>
          </div>

          {/* Footer note */}
          <div className="text-[11px] text-indigo-200/80 relative z-10 hidden sm:block">
            Enterprise Task & Timing Distribution Engine
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-6 sm:p-10 flex flex-col justify-center">
          <div className="mb-5 sm:mb-6">
            <h2 className="font-['Outfit'] text-xl sm:text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-xs text-slate-500 mt-1">Sign in to access your daily tasks</p>
          </div>

          {/* Role switcher toggle */}
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl mb-5 sm:mb-6">
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'admin'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('staff')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'staff'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Staff</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <span>Sign in as {role === 'admin' ? 'Admin' : 'Staff'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-400 mt-5 sm:mt-6">
            Only admin and staff accounts can sign in
          </p>
        </div>
      </div>
    </div>
  );
};
