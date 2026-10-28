import React, { useState } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { TaskPriority } from '../../types';
import { Check, ShieldAlert, Calendar, Clock, Send, Users, CheckCircle2, UserPlus } from 'lucide-react';
import { QuickDatePicker, QuickTimePicker } from '../common/DateTimePicker';
import { AddStaffModal } from './AddStaffModal';

export const AssignTaskView: React.FC = () => {
  const { users, currentUser, assignAdminTask, assignAdminPersonalTask, tasks, setCurrentPage, orgSettings } = useTaskToggle();

  const staffList = users.filter((u) => u.role === 'staff');

  const [assignmentTarget, setAssignmentTarget] = useState<'staff' | 'myself'>('staff');
  const [recentTab, setRecentTab] = useState<'staff' | 'admin'>('staff');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('27 Oct 2026');
  const [dueTime, setDueTime] = useState('2:30 PM');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [successToast, setSuccessToast] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

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
    if (!title.trim()) {
      alert('Please enter a task title.');
      return;
    }

    if (assignmentTarget === 'staff') {
      if (selectedStaffIds.length === 0) {
        alert('Please select at least one staff member.');
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
    } else {
      assignAdminPersonalTask({
        title,
        description,
        dueDate,
        dueTime,
        priority,
      });
    }

    setTitle('');
    setDescription('');
    setSelectedStaffIds([]);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  // Recently assigned staff tasks vs admin personal tasks
  const recentStaffTasks = tasks
    .filter((t) => t.assignedTo !== currentUser.id)
    .slice(0, 8);

  const recentAdminTasks = tasks
    .filter((t) => t.assignedTo === currentUser.id)
    .slice(0, 8);

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      {/* Clean Corporate Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 tracking-tight">
              Assign Work to Team
            </h1>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-600 text-white shadow-2xs">
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
            {/* Assignment Target Switcher (Staff Target Tasks vs Admin Personal Daily Task) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Assignment Target
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAssignmentTarget('staff')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    assignmentTarget === 'staff'
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        assignmentTarget === 'staff' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">👥 Staff Members</div>
                      <div className="text-[11px] text-slate-500 font-medium">Allot to team; auto-struck on staff login</div>
                    </div>
                  </div>
                  {assignmentTarget === 'staff' && <Check className="w-4 h-4 text-blue-600 stroke-[3]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setAssignmentTarget('myself')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    assignmentTarget === 'myself'
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        assignmentTarget === 'myself' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">👑 Myself (Admin Daily Task)</div>
                      <div className="text-[11px] text-slate-500 font-medium">Personal daily agenda & separate score</div>
                    </div>
                  </div>
                  {assignmentTarget === 'myself' && <Check className="w-4 h-4 text-blue-600 stroke-[3]" />}
                </button>
              </div>
            </div>

            {/* Task title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Task Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={assignmentTarget === 'staff' ? "e.g. Update inventory sheet and audit stock" : "e.g. Review and sign Q4 budget allocations"}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 shadow-2xs"
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
                placeholder={assignmentTarget === 'staff' ? "Add all stock received this week and mark low-stock items for procurement." : "Notes and specific action items for your personal agenda."}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 resize-none shadow-2xs"
              />
            </div>

            {/* Target Specific Assignment Details */}
            {assignmentTarget === 'staff' ? (
              /* Staff multi-select pills */
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Assign To (Select one or more staff)
                  </label>
                  {staffList.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllStaff}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      {selectedStaffIds.length === staffList.length ? 'Deselect All' : 'Select All Staff'}
                    </button>
                  )}
                </div>

                {staffList.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-800">No staff members in your team yet</p>
                      <p className="text-[11px] text-slate-500">Add your organization's staff members to begin assigning tasks</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddStaffModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Add Staff</span>
                    </button>
                  </div>
                ) : (
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
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-700'
                            }`}
                          >
                            {staff.initials}
                          </div>
                          <span>{staff.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setShowAddStaffModal(true)}
                      className="px-3.5 py-2 rounded-xl border border-dashed border-blue-300 text-blue-700 hover:bg-blue-50 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      title="Add new staff member"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Add Staff</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Admin Self Assignment Notice */
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center gap-3.5 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                  AD
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-950">
                    👑 Assigning to Admin's Personal Daily Agenda
                  </div>
                  <div className="text-[11px] text-blue-900 font-medium mt-0.5">
                    This task is private to you and tracked under your <strong>Admin Personal Score</strong>, completely independent of the staff team target rate.
                  </div>
                </div>
              </div>
            )}

            {/* Target Deadline (Interactive Mini Calendar & Fast Clock Picker) */}
            <div className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
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
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          p === 'High'
                            ? 'bg-rose-400'
                            : p === 'Medium'
                            ? 'bg-blue-300'
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
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                {assignmentTarget === 'staff' ? (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Dispatch Task to Staff</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Add to Admin Daily Agenda</span>
                  </>
                )}
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
              <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
                  {assignmentTarget === 'staff' ? 'Staff Work Delegation' : 'Admin Personal Task'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {assignmentTarget === 'staff'
                    ? 'Staff tasks land in staff queues. When staff strike tasks, they automatically reflect on the Executive Dashboard without requiring manual Admin striking.'
                    : 'Personal tasks are logged in your Admin Daily Checklist with a dedicated Admin Personal Score separate from team delivery rates.'}
                </p>
              </div>
            </div>
          </div>

          {/* Recently Assigned List - Fully Separated Staff vs Admin */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Recently Assigned
              </h3>
              <Users className="w-4 h-4 text-blue-600" />
            </div>

            {/* Sub-tabs to switch between Staff Target Tasks and Admin Personal Tasks */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setRecentTab('staff')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer truncate ${
                  recentTab === 'staff'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👥 Staff ({recentStaffTasks.length})
              </button>
              <button
                type="button"
                onClick={() => setRecentTab('admin')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer truncate ${
                  recentTab === 'admin'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👑 Myself ({recentAdminTasks.length})
              </button>
            </div>

            {recentTab === 'staff' ? (
              recentStaffTasks.length === 0 ? (
                <p className="text-xs text-slate-400 italic font-medium">No staff tasks assigned yet.</p>
              ) : (
                <div className="space-y-3.5">
                  {recentStaffTasks.map((task) => (
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
              )
            ) : (
              recentAdminTasks.length === 0 ? (
                <p className="text-xs text-slate-400 italic font-medium">No personal admin tasks logged yet.</p>
              ) : (
                <div className="space-y-3.5">
                  {recentAdminTasks.map((task) => (
                    <div key={task.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">{task.title}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                            task.status === 'done'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {task.status === 'done' ? 'Done' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                        <span className="font-medium text-slate-600">👑 Admin Personal</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{task.dueDate} · {task.dueTime}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Add Staff Member Modal */}
      <AddStaffModal
        isOpen={showAddStaffModal}
        onClose={() => setShowAddStaffModal(false)}
      />
    </div>
  );
};
