import React, { useState } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import {
  Check,
  Calendar,
  Clock,
  AlertCircle,
  MessageSquare,
  Send,
  X,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

export const MyToDoView: React.FC = () => {
  const {
    currentUser,
    tasks,
    toggleTaskStatus,
    showCompleted,
    setShowCompleted,
    officeTiming,
    eventTiming,
    reportPendingReason,
  } = useTaskToggle();

  const [activeTab, setActiveTab] = useState<'today' | 'admin' | 'staff' | 'self'>('today');
  // Track which task has active reason reporting box open
  const [editingReasonTaskId, setEditingReasonTaskId] = useState<string | null>(null);
  const [reasonInput, setReasonInput] = useState<string>('');
  const [reasonToast, setReasonToast] = useState<string | null>(null);

  // Filter tasks for current user
  const myTasks = tasks.filter((t) => {
    if (t.assignedTo !== currentUser.id) return false;
    if (t.type === 'staff' && t.status === 'pending') return false; // Pending requests belong in Requests tab

    if (activeTab === 'admin') return t.type === 'admin';
    if (activeTab === 'staff') return t.type === 'staff';
    if (activeTab === 'self') return t.type === 'self';
    return true; // 'today'
  });

  // Filter completed based on showCompleted toggle
  const visibleTasks = showCompleted ? myTasks : myTasks.filter((t) => t.status !== 'done');

  // Progress metrics
  const totalTasks = myTasks.length;
  const completedTasks = myTasks.filter((t) => t.status === 'done').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Check event allotment
  const isAllottedToEvent = eventTiming?.isActive && eventTiming.allottedStaffIds.includes(currentUser.id);

  const handleOpenReasonBox = (taskId: string, currentReason?: string) => {
    setEditingReasonTaskId(taskId);
    setReasonInput(currentReason || '');
  };

  const handleSaveReason = (taskId: string) => {
    reportPendingReason(taskId, reasonInput);
    setEditingReasonTaskId(null);
    setReasonToast('Reason reported directly to Admin');
    setTimeout(() => setReasonToast(null), 3000);
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {reasonToast && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{reasonToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-slate-900 tracking-tight">
              My Daily To-Do
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
              Staff Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>Sat, 24 Oct 2026 · Check off tasks as you finish them</span>
          </p>
        </div>

        {/* Tab filters (Horizontally scrollable on mobile) */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1.5 rounded-2xl overflow-x-auto no-scrollbar shadow-inner">
          {(
            [
              { id: 'today', label: 'All My Tasks' },
              { id: 'admin', label: 'From Admin' },
              { id: 'staff', label: 'From Colleagues' },
              { id: 'self', label: 'My Personal' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 w-full">
        {/* Main List (2 cols) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-7 border border-slate-200/90 shadow-sm">
            {/* List Header with Show Completed toggle */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 font-['Outfit']">
                  Active Task Queue
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  Tasks ordered by due date & priority
                </p>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
                <span className="text-xs font-semibold text-slate-600">Show completed</span>
                <button
                  type="button"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                    showCompleted ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                  aria-label="Toggle show completed tasks"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      showCompleted ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Task list */}
            {visibleTasks.length === 0 ? (
              <div className="text-center py-14 text-slate-400 text-xs sm:text-sm italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                No tasks to display for this category.
              </div>
            ) : (
              <div className="space-y-3.5">
                {visibleTasks.map((task) => {
                  const isDone = task.status === 'done';
                  const isEditingReason = editingReasonTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      className={`rounded-2xl border transition-all duration-200 ${
                        isDone
                          ? 'bg-slate-50/70 border-slate-200 opacity-80'
                          : 'bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-md'
                      }`}
                    >
                      {/* Task Row */}
                      <div className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex items-start gap-3.5 min-w-0 flex-1">
                            {/* Checkbox toggle with enlarged touch area */}
                            <button
                              type="button"
                              onClick={() => toggleTaskStatus(task.id)}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 mt-0.5 cursor-pointer ${
                                isDone
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'border-2 border-slate-300 hover:border-indigo-600 hover:bg-indigo-50/50'
                              }`}
                              aria-label={isDone ? 'Mark task as pending' : 'Mark task as done'}
                            >
                              {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                            </button>

                            {/* Title, Category & Prominent Target Deadline (Date & Time) */}
                            <div className="min-w-0 flex-1">
                              <h3
                                onClick={() => toggleTaskStatus(task.id)}
                                className={`text-sm sm:text-base font-bold cursor-pointer transition-all ${
                                  isDone ? 'line-through text-slate-400 font-medium' : 'text-slate-900'
                                }`}
                              >
                                {task.title}
                              </h3>

                              {task.description && (
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                  {task.description}
                                </p>
                              )}

                              {/* Prominent Target Deadline (Date & Time) Badge */}
                              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                                <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-950 shadow-2xs">
                                  <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                  <span>Due: {task.dueDate}</span>
                                  <span className="text-indigo-300">•</span>
                                  <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                  <span>{task.dueTime}</span>
                                </div>

                                {/* Priority Pill */}
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                    task.priority === 'High'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : task.priority === 'Medium'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      task.priority === 'High' ? 'bg-rose-500' : 'bg-amber-500'
                                    }`}
                                  />
                                  <span>{task.priority} Priority</span>
                                </span>

                                {isDone && task.completedAt && (
                                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Finished at {task.completedAt}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Role Badges & Report Issue Action */}
                          <div className="flex items-center gap-2 shrink-0 pl-9 sm:pl-0">
                            {task.type === 'admin' && (
                              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3 text-rose-600" />
                                <span>Compulsory</span>
                              </span>
                            )}
                            {task.type === 'staff' && (
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                Accepted
                              </span>
                            )}
                            {task.type === 'self' && (
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                Personal
                              </span>
                            )}

                            {/* "Report Issue / Reason" Button for Pending Tasks */}
                            {!isDone && (
                              <button
                                type="button"
                                onClick={() => handleOpenReasonBox(task.id, task.pendingReason)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                                  task.pendingReason
                                    ? 'bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                }`}
                                title="Click to write or update reason why this task is still pending for Admin"
                              >
                                <MessageSquare className="w-3 h-3 text-amber-700" />
                                <span>{task.pendingReason ? 'Reason Sent' : 'Say why pending'}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Display Existing Pending Reason Note if present */}
                        {!isDone && task.pendingReason && !isEditingReason && (
                          <div className="mt-3 p-3 rounded-xl bg-amber-50/90 border border-amber-200/80 text-xs text-amber-950 flex items-start justify-between gap-2 shadow-2xs">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">Pending Reason sent to Admin: </span>
                                <span className="font-medium italic">"{task.pendingReason}"</span>
                                {task.pendingReasonUpdatedAt && (
                                  <span className="text-[10px] text-amber-700 ml-2 font-semibold">
                                    (Reported at {task.pendingReasonUpdatedAt})
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleOpenReasonBox(task.id, task.pendingReason)}
                              className="text-[11px] font-bold text-amber-900 underline hover:text-amber-950 shrink-0 cursor-pointer"
                            >
                              Edit
                            </button>
                          </div>
                        )}

                        {/* Interactive Blank Box to Report Issue / Reason */}
                        {isEditingReason && (
                          <div className="mt-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3 animate-in fade-in shadow-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Why is this task delayed or pending? (Visible to Admin)</span>
                              </span>
                              <button
                                onClick={() => setEditingReasonTaskId(null)}
                                className="text-slate-400 hover:text-slate-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <textarea
                              value={reasonInput}
                              onChange={(e) => setReasonInput(e.target.value)}
                              placeholder="Write the exact issue or reason why it's pending (e.g. Waiting on vendor quotes, client approval delayed)..."
                              rows={2}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none shadow-2xs"
                            />

                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingReasonTaskId(null)}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveReason(task.id)}
                                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                <span>Send to Admin</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Progress & Timing (1 col) */}
        <div className="space-y-5 sm:space-y-6">
          {/* Today's progress */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Today's Progress
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {completedTasks}/{totalTasks} done
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-['Outfit'] text-slate-900 tracking-tight">
              {progressPercent}%
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 mt-3 overflow-hidden shadow-inner p-0.5">
              <div
                className="bg-gradient-to-r from-indigo-600 to-violet-600 h-2 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2.5 font-medium flex items-center justify-between">
              <span>Completed: <strong>{completedTasks}</strong></span>
              <span>Remaining: <strong>{totalTasks - completedTasks}</strong></span>
            </p>
          </div>

          {/* Today's timing card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Today's Office Hours
            </h3>
            <div className="flex items-center gap-2 text-base font-extrabold text-slate-900 font-['Outfit']">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>{officeTiming.openTime} – {officeTiming.closeTime}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">General working schedule</p>

            {/* Event Timing Banner if allotted */}
            {isAllottedToEvent && eventTiming && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200/80 text-amber-950 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{eventTiming.date}: {eventTiming.newTiming}</span>
                </div>
                <div className="text-[11px] text-amber-800 mt-1 font-medium">
                  Event: <strong>{eventTiming.eventName}</strong> (You are allotted)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
