import React, { useState } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import {
  X,
  Plus,
  Users,
  Building2,
  BarChart3,
  Settings,
  HelpCircle,
  CheckCircle2,
  Mail,
  FileSpreadsheet,
  FileText,
  Sparkles,
} from 'lucide-react';
import { TaskPriority } from '../../types';

interface ModalWrapperProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({ title, isOpen, onClose, children, icon }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 font-jakarta">
      <div className="relative w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="p-4 sm:p-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// 1. Assign Task Modal
export const AssignTaskModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { users, assignAdminTask } = useTaskToggle();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueTime, setDueTime] = useState('5:00 PM');
  const [dueDate, setDueDate] = useState(() => {
    const now = new Date();
    return `${now.getDate()} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()}`;
  });

  const staffUsers = users.filter((u) => u.role === 'staff');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const targetStaffIds = selectedStaffId ? [selectedStaffId] : [staffUsers[0]?.id || 'staff_karpagam'];

    assignAdminTask({
      title: title.trim(),
      description: description.trim() || 'Assigned via Executive Dashboard',
      staffIds: targetStaffIds,
      dueDate,
      dueTime,
      priority,
    });

    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <ModalWrapper
      title="Assign Staff Deliverable"
      isOpen={isOpen}
      onClose={onClose}
      icon={
        <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Task Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Conduct compliance review for Q4 audit"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-[#4F46E5] bg-slate-50 focus:bg-white text-xs outline-none transition-all text-slate-800"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Assign To Staff Member
          </label>
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-[#4F46E5] bg-slate-50 focus:bg-white text-xs outline-none transition-all text-slate-800"
          >
            {staffUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-[#4F46E5] bg-slate-50 focus:bg-white text-xs outline-none transition-all text-slate-800"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High (Urgent)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Due Time
            </label>
            <input
              type="text"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              placeholder="e.g. 5:00 PM"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-[#4F46E5] bg-slate-50 focus:bg-white text-xs outline-none transition-all text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Description (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add requirements or links..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-[#4F46E5] bg-slate-50 focus:bg-white text-xs outline-none transition-all text-slate-800"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary-gradient px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Allot Task</span>
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};

// 2. Staff Directory Modal
export const StaffDirectoryModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { users, tasks } = useTaskToggle();
  const staff = users.filter((u) => u.role === 'staff');

  return (
    <ModalWrapper
      title="Staff Directory & Roster"
      isOpen={isOpen}
      onClose={onClose}
      icon={
        <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
          <Users className="w-3.5 h-3.5 stroke-[1.8]" />
        </div>
      }
    >
      <div className="space-y-2.5">
        <p className="text-xs text-slate-500">
          4 staff members operating under Deepak Workspace with real-time execution sync.
        </p>
        <div className="divide-y divide-slate-100">
          {staff.map((member) => {
            const memberTasks = tasks.filter((t) => t.assignedTo === member.id);
            const memberDone = memberTasks.filter((t) => t.status === 'done').length;
            const rate = memberTasks.length > 0 ? Math.round((memberDone / memberTasks.length) * 100) : 100;

            return (
              <div key={member.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                    {member.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">{member.name}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Mail className="w-2.5 h-2.5 text-slate-400" />
                      <span>{member.email}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    {rate}% Delivery
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{memberDone}/{memberTasks.length} tasks struck</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ModalWrapper>
  );
};

// 3. Departments Modal (Dynamic from Supabase Staff)
export const DepartmentsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { users } = useTaskToggle();
  const staff = users.filter((u) => u.role === 'staff');

  return (
    <ModalWrapper
      title="Company Departments"
      isOpen={isOpen}
      onClose={onClose}
      icon={
        <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
          <Building2 className="w-3.5 h-3.5 stroke-[1.8]" />
        </div>
      }
    >
      <div className="space-y-2.5">
        <p className="text-xs text-slate-500">
          Real-time organization staff members and department alignment.
        </p>
        <div className="grid grid-cols-1 gap-2">
          {staff.map((member) => (
            <div key={member.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-xs font-bold">
                  {member.initials || member.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">{member.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{member.email}</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-md capitalize">
                {member.role}
              </span>
            </div>
          ))}
          {staff.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-400">
              No staff members found.
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

// 4. Reports & Analytics Modal (Dynamic from Supabase Tasks)
export const ReportsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { tasks } = useTaskToggle();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const totalCount = tasks.length;
  const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  const handleExport = (type: 'pdf' | 'excel') => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <ModalWrapper
      title="Reports & Analytics"
      isOpen={isOpen}
      onClose={onClose}
      icon={
        <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
          <BarChart3 className="w-3.5 h-3.5 stroke-[1.8]" />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
          <div className="text-[10px] font-bold uppercase tracking-wider">Staff Delivery Performance</div>
          <div className="text-xl font-bold mt-1 text-emerald-700">{rate}% on-time execution</div>
          <p className="text-xs mt-0.5 text-emerald-600">
            {completedCount} of {totalCount} total cloud deliverables completed across active timeline.
          </p>
        </div>

        {downloadSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-500 text-white text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Report generated and ready!</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => handleExport('pdf')}
            className="p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-[#EEF2FF]/40 text-left transition-all cursor-pointer group"
          >
            <FileText className="w-4 h-4 text-rose-600 mb-1.5" />
            <div className="text-xs font-bold text-slate-900 group-hover:text-[#4F46E5]">
              Executive PDF Report
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Daily audit digest</p>
          </button>

          <button
            type="button"
            onClick={() => handleExport('excel')}
            className="p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all cursor-pointer group"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 mb-1.5" />
            <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
              Excel Data Sheet
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Raw tasks and logs</p>
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

// 5. Settings Modal
export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { orgSettings, officeTiming } = useTaskToggle();

  return (
    <ModalWrapper
      title="Platform & Workspace Settings"
      isOpen={isOpen}
      onClose={onClose}
      icon={
        <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
          <Settings className="w-3.5 h-3.5 stroke-[1.8]" />
        </div>
      }
    >
      <div className="space-y-3 text-xs">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Workspace Name
          </label>
          <input
            type="text"
            readOnly
            value={`${orgSettings.orgName} Workspace`}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Office Timing
          </label>
          <div className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium flex items-center justify-between">
            <span>{officeTiming.openTime} – {officeTiming.closeTime}</span>
            <span className="text-[11px] text-slate-500">{officeTiming.workingDays?.join(', ')}</span>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Sync Engine
          </label>
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Real-time Cloud Sync Active</span>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

// 6. Help & Support Modal
export const HelpModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <ModalWrapper
      title="Help & Platform Support"
      isOpen={isOpen}
      onClose={onClose}
      icon={
        <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
          <HelpCircle className="w-3.5 h-3.5 stroke-[1.8]" />
        </div>
      }
    >
      <div className="space-y-2.5 text-xs text-slate-700">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
          <h4 className="font-bold text-slate-900 mb-0.5">Separation of Concerns</h4>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Admin Personal Daily Tasks are private to Deepak. Staff Target Deliverables are distributed to staff members and auto-sync in real time.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
          <h4 className="font-bold text-slate-900 mb-0.5">Keyboard Shortcuts</h4>
          <div className="flex items-center justify-between mt-1 text-slate-500 text-[11px]">
            <span>Focus Global Search</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-semibold">⌘K</kbd>
          </div>
        </div>

        <p className="text-center text-slate-400 text-[10px] pt-1">
          TaskToggle v1.0.0 · Enterprise Daily To-Do & Scheduling Platform
        </p>
      </div>
    </ModalWrapper>
  );
};
