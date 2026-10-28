import React, { useState } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { getTaskDeclineReason } from '../../types';
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
} from 'lucide-react';
import { QuickDatePicker, QuickTimePicker } from '../common/DateTimePicker';

export const CreateToDoView: React.FC = () => {
  const { currentUser, users, createStaffTask, deleteTask, tasks, setCurrentPage, orgSettings } = useTaskToggle();

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [targetUserId, setTargetUserId] = useState<string>(currentUser.id); // Default to 'Myself'
  const [dueDate, setDueDate] = useState('27 Oct 2026');
  const [dueTime, setDueTime] = useState('5:00 PM');
  const [successToast, setSuccessToast] = useState(false);
  const [delegatedFilter, setDelegatedFilter] = useState<'all' | 'declined' | 'pending'>('all');

  // Filter other staff members
  const otherStaff = users.filter((u) => u.role === 'staff' && u.id !== currentUser.id);

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
  const allSentByMeTasks = tasks.filter(
    (t) => t.createdBy === currentUser.id && t.type === 'staff'
  );

  const declinedCount = allSentByMeTasks.filter((t) => t.status === 'rejected').length;

  const filteredSentTasks = allSentByMeTasks.filter((t) => {
    if (delegatedFilter === 'declined') return t.status === 'rejected';
    if (delegatedFilter === 'pending') return t.status === 'pending';
    return true;
  }).slice(0, 8);

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      {/* Clean Corporate Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 tracking-tight">
              Create New Task
            </h1>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-600 text-white shadow-2xs">
              {orgSettings.orgName} Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Add a to-do item for yourself or delegate a task to a colleague
          </p>
        </div>
      </div>

      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-3 animate-in fade-in shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">
            {targetUserId === currentUser.id
              ? 'Task added straight to your personal to-do list!'
              : 'Task sent to colleague! It now appears on their Requests tab awaiting confirmation.'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 w-full">
        {/* Main Form (2 cols on xl) */}
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
                placeholder="e.g. Share call notes template with team"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-400 shadow-2xs"
              />
            </div>

            {/* Details */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Task Details & Context
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Send the template used for client calls to the team with updated questions."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 resize-none shadow-2xs"
              />
            </div>

            {/* Assignee Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                Assignee (Who should perform this task?)
              </label>
              <div className="flex flex-wrap gap-2.5">
                {/* Myself pill */}
                <button
                  type="button"
                  onClick={() => setTargetUserId(currentUser.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    targetUserId === currentUser.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Myself (Personal To-Do)</span>
                </button>

                {/* Other staff pills */}
                {otherStaff.map((staff) => {
                  const isSelected = targetUserId === staff.id;
                  return (
                    <button
                      type="button"
                      key={staff.id}
                      onClick={() => setTargetUserId(staff.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{staff.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Deadline (Interactive Mini Calendar & Fast Clock Picker) */}
            <div className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Target Deadline (Mini Calendar & Fast Clock)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Interactive Mini Calendar Picker */}
                <div>
                  <QuickDatePicker
                    value={dueDate}
                    onChange={setDueDate}
                    label="Fix Date (Mini Calendar)"
                  />
                </div>

                {/* Interactive Fast Clock Picker */}
                <div>
                  <QuickTimePicker
                    value={dueTime}
                    onChange={setDueTime}
                    label="Fix Time (Clock Face & Fast Presets)"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Create & Schedule Task</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage('mytodo')}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Info & Sent by Me */}
        <div className="space-y-5 sm:space-y-6">
          {/* Rules Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                  Delegation Rules
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium mb-2">
                  <strong>For yourself:</strong> Added directly into your active daily to-do queue.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  <strong>For colleague:</strong> Appears in their incoming requests queue. It becomes active when they tap <em>Accept Task</em>.
                </p>
              </div>
            </div>
          </div>

          {/* Delegated by you list with Full Rejection & Message Visibility */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Delegated by You
              </h3>
              <Users className="w-4 h-4 text-blue-600" />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-4 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setDelegatedFilter('all')}
                className={`flex-1 py-1 px-2 rounded-lg transition-all cursor-pointer truncate text-center ${
                  delegatedFilter === 'all'
                    ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({allSentByMeTasks.length})
              </button>

              <button
                type="button"
                onClick={() => setDelegatedFilter('declined')}
                className={`flex-1 py-1 px-2 rounded-lg transition-all cursor-pointer truncate text-center flex items-center justify-center gap-1 ${
                  delegatedFilter === 'declined'
                    ? 'bg-rose-600 text-white shadow-2xs font-extrabold'
                    : declinedCount > 0
                    ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Declined</span>
                {declinedCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                    delegatedFilter === 'declined' ? 'bg-white text-rose-700' : 'bg-rose-600 text-white'
                  }`}>
                    {declinedCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setDelegatedFilter('pending')}
                className={`flex-1 py-1 px-2 rounded-lg transition-all cursor-pointer truncate text-center ${
                  delegatedFilter === 'pending'
                    ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending ({allSentByMeTasks.filter((t) => t.status === 'pending').length})
              </button>
            </div>

            {filteredSentTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic font-medium">No tasks found under this filter.</p>
            ) : (
              <div className="space-y-3.5">
                {filteredSentTasks.map((task) => {
                  const isDone = task.status === 'done';
                  const isAccepted = task.status === 'accepted';
                  const isRejected = task.status === 'rejected';
                  const rejectMsg = getTaskDeclineReason(task);

                  return (
                    <div
                      key={task.id}
                      className={`border rounded-xl p-3 transition-all ${
                        isRejected
                          ? 'bg-rose-50/50 border-rose-200'
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-xs font-bold truncate ${
                            isDone
                              ? 'line-through text-slate-400'
                              : isRejected
                              ? 'text-rose-950 font-black'
                              : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </span>

                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 ${
                            isDone
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isAccepted
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : isRejected
                              ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isDone ? (
                            'Done'
                          ) : isAccepted ? (
                            'Accepted'
                          ) : isRejected ? (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
                              <span>Declined</span>
                            </>
                          ) : (
                            'Pending Response'
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 flex-wrap gap-1">
                        <span className="font-semibold text-slate-700">To: {task.assignedToName}</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{task.dueDate} · {task.dueTime}</span>
                        </span>
                      </div>

                      {/* Display Colleague Issue / Delay Reason */}
                      {task.pendingReason && !isRejected && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Issue Reported by {task.assignedToName}:</span>
                          </div>
                          <div className="p-2 rounded-lg bg-white border border-amber-200 text-xs text-amber-950 font-bold leading-relaxed italic shadow-2xs">
                            "{task.pendingReason.replace(/^\[DECLINED\]:\s*/, '')}"
                          </div>
                          {task.pendingReasonUpdatedAt && (
                            <div className="text-[10px] text-amber-700 font-semibold">
                              Reported at {task.pendingReasonUpdatedAt}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Display Colleague Rejection Message & Action Buttons */}
                      {isRejected && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-white border border-rose-200 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>Why {task.assignedToName} Declined:</span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-100 text-xs text-rose-950 font-bold leading-relaxed italic shadow-2xs">
                            "{rejectMsg || 'No message provided'}"
                          </div>

                          {task.rejectedAt && (
                            <div className="text-[10px] text-rose-700 font-semibold">
                              Declined at {task.rejectedAt}
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-1 border-t border-rose-100 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                setTitle(task.title);
                                setDetails(task.description || '');
                                setDueDate(task.dueDate || '27 Oct 2026');
                                setDueTime(task.dueTime || '5:00 PM');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 active:scale-95"
                              title="Pre-fill form to delegate this task to another colleague"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reassign to Another Colleague</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteTask(task.id)}
                              className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 text-[11px] font-semibold cursor-pointer transition-all flex items-center gap-1"
                              title="Remove this declined task"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Dismiss</span>
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
