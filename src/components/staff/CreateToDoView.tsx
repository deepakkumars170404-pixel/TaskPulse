import React, { useState, useMemo } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { getTaskDeclineReason, TaskPriority } from '../../types';
import {
  HelpCircle,
  User,
  Users,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Trash2,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { QuickDatePicker, QuickTimePicker } from '../common/DateTimePicker';

export const CreateToDoView: React.FC = () => {
  const { currentUser, users, createStaffTask, deleteTask, tasks, setCurrentPage, orgSettings } = useTaskToggle();

  // Dynamic today's date formatted (e.g. "28 Oct 2026")
  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getDate()} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()}`;
  }, []);

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [targetUserId, setTargetUserId] = useState<string>(currentUser.id); // Default to 'Myself'
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState(todayStr);
  const [dueTime, setDueTime] = useState('5:00 PM');
  const [successToast, setSuccessToast] = useState(false);
  const [delegatedFilter, setDelegatedFilter] = useState<'all' | 'declined' | 'pending'>('all');

  // Filter other staff members
  const otherStaff = useMemo(() => {
    return users.filter((u) => u.role === 'staff' && u.id !== currentUser.id);
  }, [users, currentUser.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a task title.');
      return;
    }

    createStaffTask({
      title,
      details,
      createForUserId: targetUserId,
      dueDate,
      dueTime,
    });

    setTitle('');
    setDetails('');
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  // Sent by me tasks
  const allSentByMeTasks = useMemo(() => {
    return tasks.filter((t) => t.createdBy === currentUser.id && t.type === 'staff');
  }, [tasks, currentUser.id]);

  const declinedCount = allSentByMeTasks.filter((t) => t.status === 'rejected').length;

  const filteredSentTasks = useMemo(() => {
    return allSentByMeTasks
      .filter((t) => {
        if (delegatedFilter === 'declined') return t.status === 'rejected';
        if (delegatedFilter === 'pending') return t.status === 'pending';
        return true;
      })
      .slice(0, 8);
  }, [allSentByMeTasks, delegatedFilter]);

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5 max-w-7xl mx-auto select-none animate-in fade-in duration-200">
      {/* =========================================================================
          1. HEADER & CONTROLS
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center shadow-xs">
              <PlusCircle className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-slate-900 tracking-tight">
              Create & Delegate Task
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
              {orgSettings.orgName || 'Workspace'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Schedule a to-do item for yourself or assign a new task to team colleagues with deadlines
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-2.5 animate-in fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">
            {targetUserId === currentUser.id
              ? 'Task added straight to your personal to-do list!'
              : 'Task sent to colleague! It now appears on their Requests tab awaiting confirmation.'}
          </span>
        </div>
      )}

      {/* =========================================================================
          2. MAIN CONTENT GRID (2/3 FORM + 1/3 SIDEBAR TRACKER)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 w-full">
        {/* Main Form (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Task Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Task Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Prepare client review deck and share notes"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#4F46E5] text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50/50 focus:bg-white transition-all placeholder:text-slate-400 shadow-2xs"
              />
            </div>

            {/* Task Details & Context */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Task Details & Scope
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Add necessary instructions, files, links, or expectations for this deliverable..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#4F46E5] text-xs font-medium text-slate-800 bg-slate-50/50 focus:bg-white transition-all placeholder:text-slate-400 resize-none shadow-2xs"
              />
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Priority Level
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: 'High', label: 'High Priority', color: 'bg-rose-50 text-rose-700 border-rose-200' },
                  { id: 'Medium', label: 'Medium Priority', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                  { id: 'Low', label: 'Low Priority', color: 'bg-slate-50 text-slate-700 border-slate-200' },
                ].map((p) => {
                  const isSelected = priority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id as TaskPriority)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? `${p.color} ring-2 ring-[#4F46E5] font-bold shadow-2xs`
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assignee Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Assignee (Who should perform this task?)
              </label>
              <div className="flex flex-wrap gap-2">
                {/* Myself button */}
                <button
                  type="button"
                  onClick={() => setTargetUserId(currentUser.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
                    targetUserId === currentUser.id
                      ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-2xs font-bold'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Myself ({currentUser.name})</span>
                </button>

                {/* Other staff pills */}
                {otherStaff.map((staff) => {
                  const isSelected = targetUserId === staff.id;
                  return (
                    <button
                      type="button"
                      key={staff.id}
                      onClick={() => setTargetUserId(staff.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
                        isSelected
                          ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-2xs font-bold'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold uppercase ${
                          isSelected ? 'bg-white text-[#4F46E5]' : 'bg-[#4F46E5] text-white'
                        }`}
                      >
                        {staff.initials || staff.name[0]}
                      </div>
                      <span className="capitalize">{staff.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Deadline Pickers */}
            <div className="space-y-3 bg-slate-50/70 p-3.5 sm:p-4 rounded-xl border border-slate-200/80">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>Target Deadline</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <QuickDatePicker
                  value={dueDate}
                  onChange={setDueDate}
                  label="Target Date"
                />

                <QuickTimePicker
                  value={dueTime}
                  onChange={setDueTime}
                  label="Target Time"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="submit"
                className="btn-primary-gradient px-5 py-2 rounded-lg text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Create & Schedule Task</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage('mytodo')}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Info & Delegated Tracker (1 col) */}
        <div className="space-y-4">
          {/* Rules Card */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Delegation Policy
              </h3>
            </div>
            <div className="space-y-2 text-xs text-slate-600 leading-normal">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <strong className="text-slate-800 block">Personal To-Do:</strong>
                Added straight to your active daily queue for single-click execution.
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <strong className="text-slate-800 block">Colleague Delegations:</strong>
                Appears in their Requests queue. Once accepted, it syncs into their daily schedule.
              </div>
            </div>
          </div>

          {/* Delegated by you tracker */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Delegated by You
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {allSentByMeTasks.length} total
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setDelegatedFilter('all')}
                className={`flex-1 py-1 rounded-md transition-all cursor-pointer text-center ${
                  delegatedFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({allSentByMeTasks.length})
              </button>

              <button
                type="button"
                onClick={() => setDelegatedFilter('declined')}
                className={`flex-1 py-1 rounded-md transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                  delegatedFilter === 'declined'
                    ? 'bg-rose-600 text-white shadow-2xs font-bold'
                    : declinedCount > 0
                    ? 'text-rose-700 bg-rose-50 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Declined</span>
                {declinedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-white text-rose-700">
                    {declinedCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setDelegatedFilter('pending')}
                className={`flex-1 py-1 rounded-md transition-all cursor-pointer text-center ${
                  delegatedFilter === 'pending'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending ({allSentByMeTasks.filter((t) => t.status === 'pending').length})
              </button>
            </div>

            {filteredSentTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No tasks found under this filter.</p>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto no-scrollbar">
                {filteredSentTasks.map((task) => {
                  const isDone = task.status === 'done';
                  const isAccepted = task.status === 'accepted';
                  const isRejected = task.status === 'rejected';
                  const rejectMsg = getTaskDeclineReason(task);

                  return (
                    <div
                      key={task.id}
                      className={`border rounded-xl p-3 transition-all ${
                        isRejected ? 'bg-rose-50/40 border-rose-200' : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-xs font-bold truncate ${
                            isDone ? 'line-through text-slate-400' : isRejected ? 'text-rose-950 font-bold' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                            isDone
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isAccepted
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : isRejected
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isDone ? 'Done' : isAccepted ? 'Accepted' : isRejected ? 'Declined' : 'Pending'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 flex-wrap gap-1">
                        <span className="font-semibold text-slate-700 capitalize">To: {task.assignedToName}</span>
                        <span className="text-[10px] text-slate-400">
                          {task.dueDate} · {task.dueTime}
                        </span>
                      </div>

                      {/* Rejection Message & Actions */}
                      {isRejected && (
                        <div className="mt-2 p-2 rounded-lg bg-white border border-rose-200 space-y-1.5 text-xs">
                          <div className="text-[10px] font-bold text-rose-900">
                            Reason: <span className="italic font-normal">"{rejectMsg || 'No message provided'}"</span>
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-rose-100">
                            <button
                              type="button"
                              onClick={() => {
                                setTitle(task.title);
                                setDetails(task.description || '');
                                setDueDate(task.dueDate || todayStr);
                                setDueTime(task.dueTime || '5:00 PM');
                              }}
                              className="text-[11px] font-bold text-[#4F46E5] hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reassign</span>
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              onClick={() => deleteTask(task.id)}
                              className="text-[11px] font-medium text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
