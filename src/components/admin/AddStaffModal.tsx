import React, { useState, useEffect } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { UserPlus, X, User, Mail, Building2, Shield, Key, BadgeCheck, Edit3 } from 'lucide-react';
import { User as UserType, Role, BranchName } from '../../types';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffToEdit?: UserType | null;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({ isOpen, onClose, staffToEdit }) => {
  const { addStaffUser, updateStaffUser, orgSettings } = useTaskToggle();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('Staff Associate');
  const [branch, setBranch] = useState<BranchName>('sivakasi 1.0');
  const [role, setRole] = useState<Role>('staff');
  const [password, setPassword] = useState('Staff@123');

  useEffect(() => {
    if (staffToEdit) {
      setName(staffToEdit.name);
      setEmail(staffToEdit.email);
      setEmployeeId(staffToEdit.employeeId || '');
      setDesignation(staffToEdit.designation || (staffToEdit.role === 'branch_manager' ? 'Branch Manager' : 'Staff Associate'));
      setBranch(staffToEdit.branch || 'sivakasi 1.0');
      setRole(staffToEdit.role);
      setPassword(staffToEdit.password || 'Staff@123');
    } else {
      setName('');
      setEmail('');
      setEmployeeId('');
      setDesignation('Staff Associate');
      setBranch('sivakasi 1.0');
      setRole('staff');
      setPassword('Staff@123');
    }
  }, [staffToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (staffToEdit) {
      updateStaffUser(staffToEdit.id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        employeeId: employeeId.trim() || undefined,
        designation: designation.trim() || undefined,
        branch,
        role,
        password: password.trim() || undefined,
      });
    } else {
      addStaffUser(name, email, {
        employeeId: employeeId.trim() || undefined,
        designation: designation.trim() || undefined,
        branch,
        role,
        password: password.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-950/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-xs">
              {staffToEdit ? <Edit3 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 font-['Outfit']">
                {staffToEdit ? `Edit Staff: ${staffToEdit.name}` : 'Add Organization Member'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Super Admin Exclusive Action · {orgSettings.orgName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Work Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Employee ID
              </label>
              <div className="relative">
                <BadgeCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. WG-EMP-025"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Position / Designation
              </label>
              <input
                type="text"
                placeholder="e.g. Staff Associate or Branch Manager"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Assigned Branch *</span>
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value as BranchName)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium bg-white"
              >
                <option value="sivakasi 1.0">sivakasi 1.0</option>
                <option value="sivakasi 3.0">sivakasi 3.0</option>
                <option value="srivi 2.0">srivi 2.0</option>
                <option value="All Branches">All Branches (Headquarters)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span>Access Role *</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium bg-white"
              >
                <option value="staff">Staff (Operational Workspace)</option>
                <option value="branch_manager">Branch Manager (Branch Dashboard)</option>
                <option value="admin">Admin (All Branches Operations)</option>
                <option value="super_admin">Super Admin (Full Roster Control)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-slate-500" />
              <span>Login Password</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Staff@123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
            >
              {staffToEdit ? <Edit3 className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
              <span>{staffToEdit ? 'Save Changes' : 'Add Member'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
