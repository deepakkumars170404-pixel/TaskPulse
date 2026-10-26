import React, { useState } from 'react';
import { useTaskPulse } from '../../context/TaskPulseContext';
import { Check, Calendar, AlertCircle, MessageSquare, Send, X, ShieldAlert } from 'lucide-react';

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
  } = useTaskPulse();

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
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Toast Notification */}
      {reasonToast && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <span className="text-xs font-bold">{reasonToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-slate-900">My To-Do</h1>
          <p className="text-sm text-slate-500">Sat, 24 Oct 2026 · Tick tasks off as you finish them</p>
        </div>

        {/* Tab filters */}
        <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
          {(
            [
              { id: 'today', label: 'Today' },
              { id: 'admin', label: 'From admin' },
              { id: 'staff', label: 'From staff' },
              { id: 'self', label: 'My own' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-xs">
            {/* List Header with Show Completed toggle */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">My to-do list</h2>

              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-500">Show completed</span>
                <button
                  type="button"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                    showCompleted ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
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
              <div className="text-center py-12 text-slate-400 text-sm italic">
                No tasks to display for this view.
              </div>
            ) : (
              <div className="space-y-3">
                {visibleTasks.map((task) => {
                  const isDone = task.status === 'done';
                  const isEditingReason = editingReasonTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      className={`rounded-xl border transition-all ${
                        isDone
                          ? 'bg-slate-50/70 border-slate-200 opacity-75'
                          : 'bg-white border-slate-200/90 hover:border-indigo-200 hover:shadow-xs'
                      }`}
                    >
                      {/* Task Row */}
                      <div className="flex items-center justify-between p-3.5">
                        <div
                          onClick={() => toggleTaskStatus(task.id)}
                          className="flex items-center gap-3.5 min-w-0 cursor-pointer select-none flex-1"
                        >
                          {/* Checkbox toggle */}
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                              isDone
                                ? 'bg-emerald-600 text-white'
                                : 'border-2 border-slate-300 hover:border-indigo-500'
                            }`}
                          >
                            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          {/* Title and subtitle */}
                          <div className="min-w-0">
                            <h3
                              className={`text-sm font-semibold truncate transition-all ${
                                isDone ? 'line-through text-slate-400' : 'text-slate-800'
                              }`}
                            >
                              {task.title}
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {task.type === 'admin'
                                ? `From Admin · ${task.dueTime}`
                                : task.type === 'staff'
                                ? `From ${task.createdByName} · accepted · ${task.dueTime}`
                                : `My own · ${task.dueTime}`}
                            </p>
                          </div>
                        </div>

                        {/* Badges & Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {task.type === 'admin' && (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" />
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
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                                task.pendingReason
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                              }`}
                              title="Click to write or update reason why this task is still pending for Admin"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>{task.pendingReason ? 'Reason Sent' : 'Say why pending'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Display Existing Pending Reason Note if present */}
                      {!isDone && task.pendingReason && !isEditingReason && (
                        <div className="mx-3.5 mb-3 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">Pending Reason sent to Admin: </span>
                              <span className="font-medium italic">"{task.pendingReason}"</span>
                              {task.pendingReasonUpdatedAt && (
                                <span className="text-[10px] text-amber-700 ml-2">
                                  ({task.pendingReasonUpdatedAt})
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleOpenReasonBox(task.id, task.pendingReason)}
                            className="text-[11px] font-bold text-amber-800 underline hover:text-amber-950 shrink-0 cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      )}

                      {/* Interactive Blank Box to Report Issue / Reason */}
                      {isEditingReason && (
                        <div className="mx-3.5 mb-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Why is this task pending? (Visible to Admin)</span>
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
                            placeholder="Write the exact issue or reason why it's pending (e.g. Waiting on vendor quotes, client approval delayed, server credentials needed)..."
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
                          />

                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingReasonTaskId(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-200/60"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveReason(task.id)}
                              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                              <span>Send to Admin</span>
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

        {/* Right column: Progress & Timing (1 col) */}
        <div className="space-y-6">
          {/* Today's progress */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Today's progress
            </h3>
            <div className="text-3xl font-extrabold font-['Outfit'] text-slate-900 tracking-tight">
              {completedTasks}/{totalTasks}
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Today's timing card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Today's timing
            </h3>
            <div className="text-sm font-bold text-slate-900">
              {officeTiming.openTime} – {officeTiming.closeTime}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">General office hours</p>

            {/* Event Timing Banner if allotted */}
            {isAllottedToEvent && eventTiming && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{eventTiming.date}: {eventTiming.newTiming}</span>
                </div>
                <div className="text-[11px] text-amber-700 mt-0.5 font-medium">
                  ({eventTiming.eventName})
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
