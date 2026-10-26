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
  ListTodo,
  Layers,
  UserCheck,
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
    orgSettings,
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

  // Category counts
  const adminTasksCount = myTasks.filter((t) => t.type === 'admin').length;
  const staffTasksCount = myTasks.filter((t) => t.type === 'staff').length;
  const selfTasksCount = myTasks.filter((t) => t.type === 'self').length;

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
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 text-emerald-950 flex items-center gap-3 animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{reasonToast}</span>
        </div>
      )}

      {/* Header with Rich Multi-Color Gradients */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-indigo-100/70">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 tracking-tight">
              My Daily To-Do
            </h1>
            <span className="text-[11px] font-black px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-xs shadow-indigo-300/40">
              {orgSettings.orgName} Staff
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-semibold flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>Sat, 24 Oct 2026 · Check off tasks as you finish them</span>
          </p>
        </div>

        {/* Tab filters (Horizontally scrollable on mobile) */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl overflow-x-auto no-scrollbar shadow-inner border border-slate-200/80">
          {(
            [
              { id: 'today', label: 'All My Tasks', count: totalTasks },
              { id: 'admin', label: 'From Admin', count: adminTasksCount },
              { id: 'staff', label: 'From Colleagues', count: staffTasksCount },
              { id: 'self', label: 'My Personal', count: selfTasksCount },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white shadow-md shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 w-full">
        {/* Main List (2 cols on xl) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-7 border border-indigo-100/90 shadow-md shadow-indigo-100/30">
            {/* List Header with Show Completed toggle */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 font-['Outfit']">
                  Active Task Queue
                </h2>
                <p className="text-[11px] text-slate-400 font-semibold">
                  Prioritized by completion date & mandatory status
                </p>
              </div>

              <div className="flex items-center gap-2.5 bg-gradient-to-r from-slate-50 to-indigo-50/40 px-3.5 py-1.5 rounded-xl border border-indigo-100">
                <span className="text-xs font-bold text-slate-700">Show completed</span>
                <button
                  type="button"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                    showCompleted ? 'bg-gradient-to-r from-indigo-600 to-cyan-600' : 'bg-slate-300'
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
              <div className="text-center py-16 text-slate-400 text-xs sm:text-sm font-semibold italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                No tasks to display for this category.
              </div>
            ) : (
              <div className="space-y-3.5">
                {visibleTasks.map((task) => {
                  const isDone = task.status === 'done';
                  const isEditingReason = editingReasonTaskId === task.id;

                  // Colorful left border accent based on task category & completion
                  const borderLeftStyle = isDone
                    ? 'border-l-4 border-l-emerald-500'
                    : task.pendingReason
                    ? 'border-l-4 border-l-amber-500'
                    : task.type === 'admin'
                    ? 'border-l-4 border-l-indigo-600'
                    : task.type === 'staff'
                    ? 'border-l-4 border-l-cyan-500'
                    : 'border-l-4 border-l-purple-500';

                  return (
                    <div
                      key={task.id}
                      className={`rounded-2xl border transition-all duration-200 ${borderLeftStyle} ${
                        isDone
                          ? 'bg-slate-50/70 border-slate-200 opacity-80'
                          : 'bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-md'
                      }`}
                    >
                      {/* Task Row */}
                      <div className="p-4 sm:p-4.5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex items-start gap-3.5 min-w-0 flex-1">
                            {/* Checkbox toggle with enlarged touch area */}
                            <button
                              type="button"
                              onClick={() => toggleTaskStatus(task.id)}
                              className={`w-6.5 h-6.5 rounded-xl flex items-center justify-center transition-all shrink-0 mt-0.5 cursor-pointer ${
                                isDone
                                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-xs'
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
                                className={`text-sm sm:text-base font-extrabold cursor-pointer transition-all ${
                                  isDone ? 'line-through text-slate-400 font-medium' : 'text-slate-900'
                                }`}
                              >
                                {task.title}
                              </h3>

                              {task.description && (
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                                  {task.description}
                                </p>
                              )}

                              {/* Prominent Target Deadline (Date & Time) Badge */}
                              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                                <div className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-50/90 to-cyan-50/80 border border-indigo-200/90 text-indigo-950 shadow-2xs">
                                  <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                  <span>Due: {task.dueDate}</span>
                                  <span className="text-indigo-300">•</span>
                                  <Clock className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                                  <span>{task.dueTime}</span>
                                </div>

                                {/* Priority Pill */}
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full ${
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
                                  <span className="text-[11px] font-black text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Finished at {task.completedAt}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Role Badges & Report Issue Action */}
                          <div className="flex items-center gap-2 shrink-0 pl-10 sm:pl-0">
                            {task.type === 'admin' && (
                              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 shadow-2xs">
                                <ShieldAlert className="w-3 h-3 text-rose-600" />
                                <span>Compulsory</span>
                              </span>
                            )}
                            {task.type === 'staff' && (
                              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-2xs">
                                Colleague Task
                              </span>
                            )}
                            {task.type === 'self' && (
                              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
                                Personal
                              </span>
                            )}

                            {/* "Report Issue / Reason" Button for Pending Tasks */}
                            {!isDone && (
                              <button
                                type="button"
                                onClick={() => handleOpenReasonBox(task.id, task.pendingReason)}
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                                  task.pendingReason
                                    ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-950 border border-amber-300 hover:from-amber-200 hover:to-orange-200'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                }`}
                                title="Click to write or update reason why this task is still pending for Admin"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                                <span>{task.pendingReason ? 'Reason Sent' : 'Say why pending'}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Display Existing Pending Reason Note if present */}
                        {!isDone && task.pendingReason && !isEditingReason && (
                          <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 text-xs text-amber-950 flex items-start justify-between gap-2 shadow-2xs">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-black text-amber-900">Pending Reason sent to Admin: </span>
                                <span className="font-medium italic">"{task.pendingReason}"</span>
                                {task.pendingReasonUpdatedAt && (
                                  <span className="text-[10px] text-amber-700 ml-2 font-bold">
                                    (Reported at {task.pendingReasonUpdatedAt})
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleOpenReasonBox(task.id, task.pendingReason)}
                              className="text-[11px] font-black text-amber-900 underline hover:text-amber-950 shrink-0 cursor-pointer"
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
                                className="text-slate-400 hover:text-slate-600 cursor-pointer"
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
                                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
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

        {/* Right column: Progress & Timing (1 col on xl) */}
        <div className="space-y-5 sm:space-y-6">
          {/* Today's progress - Rich Multi-Color Gradient Bar */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-indigo-100/90 shadow-md shadow-indigo-100/30 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                <span>Today's Progress</span>
              </h3>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {completedTasks}/{totalTasks} done
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black font-['Outfit'] text-slate-900 tracking-tight">
              {progressPercent}%
            </div>
            {/* Multi-color gradient progress bar (Indigo -> Cyan -> Emerald) */}
            <div className="w-full bg-slate-100 rounded-full h-3 mt-3 overflow-hidden shadow-inner p-0.5">
              <div
                className="bg-gradient-to-r from-indigo-600 via-cyan-500 to-emerald-500 h-2 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2.5 font-bold flex items-center justify-between">
              <span>Completed: <strong className="text-emerald-700">{completedTasks}</strong></span>
              <span>Remaining: <strong className="text-indigo-900">{totalTasks - completedTasks}</strong></span>
            </p>

            {/* Quick Category Summary Breakdown */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
              <div className="bg-rose-50/70 p-2 rounded-xl border border-rose-100">
                <div className="text-[10px] font-black text-rose-800">Admin</div>
                <div className="text-sm font-black text-rose-950 mt-0.5">{adminTasksCount}</div>
              </div>
              <div className="bg-cyan-50/70 p-2 rounded-xl border border-cyan-100">
                <div className="text-[10px] font-black text-cyan-800">Colleague</div>
                <div className="text-sm font-black text-cyan-950 mt-0.5">{staffTasksCount}</div>
              </div>
              <div className="bg-purple-50/70 p-2 rounded-xl border border-purple-100">
                <div className="text-[10px] font-black text-purple-800">Personal</div>
                <div className="text-sm font-black text-purple-950 mt-0.5">{selfTasksCount}</div>
              </div>
            </div>
          </div>

          {/* Today's timing card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-indigo-100/90 shadow-md shadow-indigo-100/30">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-600" />
              <span>Today's Office Hours</span>
            </h3>
            <div className="flex items-center gap-2 text-base font-black text-slate-900 font-['Outfit']">
              <span>{officeTiming.openTime} – {officeTiming.closeTime}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-semibold">General working schedule ({officeTiming.workingDays.join(', ')})</p>

            {/* Event Timing Banner if allotted */}
            {isAllottedToEvent && eventTiming && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/80 border border-amber-300 text-amber-950 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{eventTiming.date}: {eventTiming.newTiming}</span>
                </div>
                <div className="text-[11px] text-amber-800 mt-1 font-semibold">
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
