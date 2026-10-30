import React, { useState } from 'react';
import { useTaskToggle } from '../context/TaskToggleContext';
import { Role } from '../types';
import {
  CheckSquare,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Crown,
  Building2,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, orgSettings, users } = useTaskToggle();
  const [identifier, setIdentifier] = useState('dr.thavabalan@gmail.com');
  const [password, setPassword] = useState('WG@Tha7!Nx58');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Demo Presets for Localhost Multi-Tier Verification
  const quickAccounts = [
    {
      label: 'Dr. Thavabalan',
      role: 'Super Admin',
      branch: 'All Branches',
      email: 'dr.thavabalan@gmail.com',
      empId: 'WG-EMP-001',
      pass: 'WG@Tha7!Nx58',
      type: 'super_admin' as Role,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      label: 'Deepak',
      role: 'Super Admin',
      branch: 'All Branches',
      email: 'admin@company.com',
      empId: 'WG-SA-001',
      pass: 'Admin@123',
      type: 'super_admin' as Role,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    },
    {
      label: 'Dr. Lakshmipriya',
      role: 'Admin',
      branch: 'All Branches',
      email: 'lakshmipriya@psr.edu.in',
      empId: 'WG-EMP-002',
      pass: 'WG@Lak5$Rt39',
      type: 'admin' as Role,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      label: 'Rajkumar A (Sivakasi 3.0)',
      role: 'Branch Mgr',
      branch: 'sivakasi 3.0',
      email: 'kumarrk23dev@gmail.com',
      empId: 'WG-EMP-005',
      pass: 'Raj@2310',
      type: 'branch_manager' as Role,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      label: 'Vignesh A (Srivi 2.0)',
      role: 'Branch Mgr',
      branch: 'srivi 2.0',
      email: 'mfvat.vicky@gmail.com',
      empId: 'WG-EMP-003',
      pass: 'WG@Mfv7#Rt42',
      type: 'branch_manager' as Role,
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    },
    {
      label: 'Rajavalli K (Sivakasi 3.0)',
      role: 'Staff',
      branch: 'sivakasi 3.0',
      email: 'mkrv0617@gmail.com',
      empId: 'WG-EMP-006',
      pass: 'MkRv@0617',
      type: 'staff' as Role,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      label: 'Vijaykumar M',
      role: 'Staff',
      branch: 'sivakasi 3.0',
      email: 'vijay909232@gmail.com',
      empId: 'WG-EMP-023',
      pass: 'Vijay@2004',
      type: 'staff' as Role,
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    },
  ];

  const handleSelectPreset = (acc: typeof quickAccounts[0]) => {
    setIdentifier(acc.email);
    setPassword(acc.pass);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const success = login(identifier, password);
    if (success === false) {
      setErrorMessage('Invalid work email/employee ID or password. Please verify and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-3.5 sm:p-6">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Hero Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Decorative Background Rings */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          {/* Logo & Org Badge */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xs border border-white/20">
                <CheckSquare className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-['Outfit'] font-black text-xl tracking-tight block leading-tight">
                  TaskToggle
                </span>
                <span className="text-[10px] font-semibold text-primary-200 tracking-wider uppercase block">
                  Multi-Branch Portal
                </span>
              </div>
            </div>

            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/15 text-white border border-white/25 flex items-center gap-1.5 shadow-2xs">
              <Building2 className="w-3 h-3" />
              <span>WeGrow</span>
            </span>
          </div>

          {/* Center Info Panel */}
          <div className="my-6 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-primary-100 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Enterprise Hierarchy Active</span>
            </div>

            <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-3">
              Unified Organization Workspace.
            </h1>
            <p className="text-primary-100 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
              Seamless daily coordination across branches with role-based access for Super Admin, Admin, Branch Managers, and Staff.
            </p>

            <div className="space-y-2.5 text-xs text-primary-100 font-medium">
              <div className="flex items-center gap-2.5">
                <Crown className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Super Admin: Dr. Thavabalan & Deepak</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-300 shrink-0" />
                <span>Admin: Lakshmipriya</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Branches: Sivakasi 1.0 · Sivakasi 3.0 · Srivi 2.0</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-[11px] text-primary-200 relative z-10 flex items-center gap-2 font-medium pt-4 border-t border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Real-time Supabase Cloud Synchronization Online</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
          <div className="mb-4">
            <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sign in to TaskToggle
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Enter your work email or employee ID and password to access your dashboard
            </p>
          </div>

          {/* 1-Click Fast Persona Switcher (For testing all organization roles locally) */}
          <div className="mb-5 bg-slate-50 border border-slate-200 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary-500" />
                <span>Quick Role Demo (1-Click Test Login)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Click any persona</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {quickAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(acc)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all cursor-pointer hover:scale-102 active:scale-98 flex items-center gap-1.5 ${
                    identifier.toLowerCase() === acc.email.toLowerCase() ||
                    (acc.empId && identifier.toLowerCase() === acc.empId.toLowerCase())
                      ? 'bg-primary-500 text-white border-primary-600 shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  {acc.type === 'super_admin' ? (
                    <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                  ) : acc.type === 'admin' ? (
                    <ShieldCheck className="w-3 h-3 text-blue-500 shrink-0" />
                  ) : acc.type === 'branch_manager' ? (
                    <Building2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  ) : (
                    <UserCheck className="w-3 h-3 text-slate-400 shrink-0" />
                  )}
                  <span>{acc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Work Email or Employee ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="name@company.com or WG26001"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer active:scale-95"
            >
              <span>Sign In to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-400 mt-6 font-medium">
            Authorized personnel only · {orgSettings.orgName} Organization System
          </p>
        </div>
      </div>
    </div>
  );
};
