import React, { useState } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { TaskPriority } from '../../types';
import { Check, ShieldAlert, Calendar, Clock, Send, Users, CheckCircle2 } from 'lucide-react';
import { QuickDatePicker, QuickTimePicker } from '../common/DateTimePicker';

export const AssignTaskView: React.FC = () => {
  const { users, assignAdminTask, tasks, setCurrentPage, orgSettings } = useTaskToggle();

  const staffList = users.filter((u) => u.role === 'staff');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('27 Oct 2026');
  const [dueTime, setDueTime] = useState('2:30 PM');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [successToast, setSuccessToast] = useState(false);

  // Toggle staff selection
  const toggleStaff = (id: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(id) ? prev.filter((staffId) => staffId !== id) : [...prev, id]
    );
  };

  const handleSelectAllStaff = () => {
    if (selectedStaffIds.length === staffList.length) {
      setSelectedStaffIds([]);
    } else {
      setSelectedStaffIds(staffList.map((s) => s.id));
    }
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
    .slice(0, 6);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Clean Corporate Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 tracking-tight">
              Assign Work to Team
            </h1>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-600 text-white shadow-2xs">
              {orgSettings.orgName} Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Schedule deadlines, set priorities, and dispatch tasks to staff queues
          </p>
        </div>
      </div>

      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-3 animate-in fade-in shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">
            Task successfully dispatched! Notification chime and desktop alert sent to assigned staff.
          </span>
        </div>
      )}

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 w-full">
        {/* Main Assignment Form (2 cols on xl) */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Task Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Update inventory sheet and audit stock"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 shadow-2xs"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Task Description & Instructions
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add all stock received this week and mark low-stock items for procurement."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 resize-none shadow-2xs"
              />
            </div>

            {/* Staff multi-select pills */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Assign To (Select one or more staff)
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllStaff}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  {selectedStaffIds.length === staffList.length ? 'Deselect All' : 'Select All Staff'}
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {staffList.map((staff) => {
                  const isSelected = selectedStaffIds.includes(staff.id);
                  return (
                    <button
                      type="button"
                      key={staff.id}
                      onClick={() => toggleStaff(staff.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {staff.initials}
                      </div>
                      <span>{staff.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Deadline (Interactive Mini Calendar & Fast Clock Picker) */}
            <div className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Target Completion Deadline</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mini Calendar Picker */}
                <div>
                  <QuickDatePicker
                    value={dueDate}
                    onChange={setDueDate}
                    label="Completion Date (Mini Calendar)"
                  />
                </div>

                {/* Fast Clock Picker */}
                <div>
                  <QuickTimePicker
                    value={dueTime}
                    onChange={setDueTime}
                    label="Completion Time (Clock Face & Fast Presets)"
                  />
                </div>
              </div>
            </div>

            {/* Priority pills */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Task Priority Level
              </label>
              <div className="flex flex-wrap items-center gap-2.5">
                {(['Low', 'Medium', 'High'] as TaskPriority[]).map((p) => {
                  const isSelected = priority === p;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? p === 'High'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : p === 'Medium'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          p === 'High'
                            ? 'bg-rose-400'
                            : p === 'Medium'
                            ? 'bg-indigo-300'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span>{p} Priority</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch Task to Staff</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage('dashboard')}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Info & Recent Assignments */}
        <div className="space-y-5 sm:space-y-6">
          {/* Quick Info Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
                  Enforcement Rules
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Tasks assigned by admin bypass request confirmation and land directly into staff's active daily queue.
                </p>
              </div>
            </div>
          </div>

          {/* Recently Assigned List */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center justify-between">
              <span>Recently Assigned</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </h3>
            {recentlyAssigned.length === 0 ? (
              <p className="text-xs text-slate-400 italic font-medium">No admin tasks assigned yet.</p>
            ) : (
              <div className="space-y-3.5">
                {recentlyAssigned.map((task) => (
                  <div key={task.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">{task.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          task.status === 'done'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {task.status === 'done' ? 'Done' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                      <span className="font-medium text-slate-600">Assigned: {task.assignedToName}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{task.dueDate} · {task.dueTime}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
