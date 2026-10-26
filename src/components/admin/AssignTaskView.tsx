import React, { useState } from 'react';
import { useTaskPulse } from '../../context/TaskPulseContext';
import { TaskPriority } from '../../types';
import { Check, ShieldAlert, Sparkles } from 'lucide-react';

export const AssignTaskView: React.FC = () => {
  const { users, assignAdminTask, tasks, setCurrentPage } = useTaskPulse();

  const staffList = users.filter((u) => u.role === 'staff');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('24 Oct 2026');
  const [dueTime, setDueTime] = useState('2:30 PM');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [successToast, setSuccessToast] = useState(false);

  // Toggle staff selection
  const toggleStaff = (id: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(id) ? prev.filter((staffId) => staffId !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedStaffIds.length === 0) {
      alert('Please enter a task title and select at least one staff member.');
      return;
    }

    assignAdminTask({
      title,
      description,
      staffIds: selectedStaffIds,
      dueDate,
      dueTime,
      priority,
    });

    setTitle('');
    setDescription('');
    setSelectedStaffIds([]);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  // Recently assigned admin tasks
  const recentlyAssigned = tasks
    .filter((t) => t.type === 'admin')
    .slice(0, 4);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-['Outfit'] text-slate-900">Assign Task</h1>
        <p className="text-sm text-slate-500">Give work to one or more staff members</p>
      </div>

      {successToast && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-semibold">
            Task assigned successfully! It has been dispatched to selected staff members.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Assignment Form (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-7 border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Task title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Update inventory sheet"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add all stock received this week and mark low-stock items."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Staff multi-select pills */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Assign to (select one or more staff)
              </label>
              <div className="flex flex-wrap gap-2">
                {staffList.map((staff) => {
                  const isSelected = selectedStaffIds.includes(staff.id);
                  return (
                    <button
                      type="button"
                      key={staff.id}
                      onClick={() => toggleStaff(staff.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{staff.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due date & Due time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Due date
                </label>
                <input
                  type="text"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Due time
                </label>
                <input
                  type="text"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Priority pills */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Priority
              </label>
              <div className="flex items-center gap-3">
                {(['Low', 'Medium', 'High'] as TaskPriority[]).map((p) => {
                  const isSelected = priority === p;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        isSelected
                          ? p === 'High'
                            ? 'bg-rose-500 text-white shadow-xs'
                            : p === 'Medium'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit & Cancel buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-200 transition-all cursor-pointer"
              >
                Assign task
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage('dashboard')}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Info & Recently Assigned (1 col) */}
        <div className="space-y-6">
          {/* Compulsory work card */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-1">
                  Compulsory work
                </h3>
                <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                  Tasks assigned by admin must be completed by staff. Staff cannot decline them or delete them.
                </p>
              </div>
            </div>
          </div>

          {/* Recently assigned list */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Recently assigned
            </h3>
            <div className="space-y-3.5">
              {recentlyAssigned.map((task) => (
                <div key={task.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className="text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors">
                    {task.title}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{task.assignedToName}</span>
                    <span className="font-semibold text-slate-400">{task.dueTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

