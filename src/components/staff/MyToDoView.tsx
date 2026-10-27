import React, { useState } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import {
  Check,
  Clock,
  Calendar,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  MessageSquare,
  ShieldAlert,
  Send,
  X,
  CheckCircle2,
  MousePointerClick,
  Users,
  User,
} from 'lucide-react';

export const MyToDoView: React.FC = () => {
  const {
    tasks,
    currentUser,
    users,
    toggleTaskStatus,
    completeAllTasks,
    snoozeTask,
    reportPendingReason,
    eventTiming,
    orgSettings,
  } = useTaskToggle();

  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  const [editingReasonTaskId, setEditingReasonTaskId] = useState<string | null>(null);
  const [reasonInput, setReasonInput] = useState<string>('');
  const [reasonToast, setReasonToast] = useState<string | null>(null);

  // Directly display all tasks assigned to the current staff member (no filter tabs needed)
  const myTasks = tasks.filter((t) => t.assignedTo === currentUser.id);

  // Filter completed based on showCompleted toggle
  const visibleTasks = showCompleted ? myTasks : myTasks.filter((t) => t.status !== 'done');
  const pendingCountInView = visibleTasks.filter((t) => t.status !== 'done').length;

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
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 text-white flex items-center gap-3 animate-in fade-in shadow-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{reasonToast}</span>
        </div>
      )}

      {/* Header - Clean, Crisp Professional Architecture */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-slate-900 tracking-tight">
              My Daily To-Do
            </h1>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-900 text-white shadow-2xs">
              {orgSettings.orgName} Staff
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {totalTasks} Total Tasks
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>All tasks assigned to you · Click anywhere on any card to instantly strike & complete</span>
          </p>
        </div>

        {/* 1-Click Strike All Finished Header Action */}
        {pendingCountInView > 0 && (
          <button
            type="button"
            onClick={completeAllTasks}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer active:scale-95 transition-all self-start sm:self-auto"
            title="Mark all pending tasks completed in 1 click"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Strike All Finished ({pendingCountInView})</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 w-full">
        {/* Main List (2 cols on xl) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs">
            {/* List Header with Click-to-Strike notice & Show Completed toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 font-['Outfit']">
                    All My Tasks
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <MousePointerClick className="w-3 h-3 text-emerald-600" />
                    <span>Click card to strike</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Tap anywhere on a task card to strike it through as completed
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-700">Show completed</span>
                  <button
                    type="button"
                    onClick={() => setShowCompleted(!showCompleted)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      showCompleted ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        showCompleted ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Task Cards List */}
            {visibleTasks.length === 0 ? (
              <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">All tasks completed!</h3>
                <p className="text-xs text-slate-400">Great job, your task queue is completely clear.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleTasks.map((task) => {
                  const isDone = task.status === 'done';
                  const isCompulsory = task.type === 'admin';
                  const isEditingReason = editingReasonTaskId === task.id;
                  const senderUser = users.find((u) => u.id === task.createdBy);

                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`relative rounded-xl border transition-all duration-150 cursor-pointer select-none group ${
                        isDone
                          ? 'bg-slate-50/60 border-slate-200 opacity-75'
                          : isCompulsory
                          ? 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-indigo-400 shadow-xs'
                          : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      {/* Left status indicator accent line */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                          isDone
                            ? 'bg-emerald-500'
                            : isCompulsory
                            ? 'bg-indigo-600'
                            : 'bg-slate-300 group-hover:bg-indigo-500'
                        }`}
                      />

                      <div className="p-4 sm:p-4.5 pl-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex items-start gap-3.5 min-w-0 flex-1">
                            {/* Checkbox toggle */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskStatus(task.id);
                              }}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 mt-0.5 cursor-pointer ${
                                isDone
                                  ? 'bg-emerald-600 text-white'
                                  : 'border-2 border-slate-300 hover:border-indigo-600 hover:bg-indigo-50/40 bg-white'
                              }`}
                              aria-label={isDone ? 'Mark task as pending' : 'Mark task as done'}
                            >
                              {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>

                            {/* Title & Details */}
                            <div className="min-w-0 flex-1">
                              <h3
                                className={`text-sm sm:text-base font-bold transition-all ${
                                  isDone
                                    ? 'line-through text-slate-400 font-medium decoration-emerald-500 decoration-2'
                                    : 'text-slate-900 group-hover:text-indigo-950'
                                }`}
                              >
                                {task.title}
                              </h3>

                              {task.description && (
                                <p
                                  className={`text-xs mt-1 leading-relaxed font-normal transition-all ${
                                    isDone ? 'line-through text-slate-400/80' : 'text-slate-500'
                                  }`}
                                >
                                  {task.description}
                                </p>
                              )}

                              {/* Prominent Metadata Badges: Target Deadline & Sender Provenance */}
                              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                                {/* Clear Due Date & Time */}
                                <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800">
                                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                  <span>{task.dueDate}</span>
                                  <span className="text-slate-300">•</span>
                                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                  <span>{task.dueTime}</span>
                                </div>

                                {/* Who it is FROM (Admin / Staff Name / Self) */}
                                {task.type === 'admin' && (
                                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">
                                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>From Admin (Deepak)</span>
                                  </span>
                                )}

                                {task.type === 'staff' && (
                                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                                    <Users className="w-3.5 h-3.5 text-slate-600" />
                                    <span>From Colleague: {senderUser?.name || task.createdByName || 'Staff'}</span>
                                  </span>
                                )}

                                {task.type === 'self' && (
                                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200">
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Self Created</span>
                                  </span>
                                )}

                                {/* Priority Pill */}
                                {task.priority === 'High' && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                    <span>High Priority</span>
                                  </span>
                                )}

                                {isDone && task.completedAt && (
                                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Done at {task.completedAt}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Snooze & Issue Reporting Actions */}
                          <div className="flex items-center gap-2 shrink-0 pl-10 sm:pl-0 flex-wrap">
                            {!isDone && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  snoozeTask(task.id, 30);
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                                title="Snooze deadline by +30 minutes"
                              >
                                +30m Snooze
                              </button>
                            )}

                            {!isDone && isCompulsory && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenReasonBox(task.id, task.pendingReason);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                  task.pendingReason
                                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                                <span>{task.pendingReason ? 'Reason Sent' : 'Report Issue'}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Reported Pending Reason Display */}
                        {task.pendingReason && !isEditingReason && (
                          <div className="mt-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">Pending Reason to Admin: </span>
                                <span>{task.pendingReason}</span>
                                {task.pendingReasonUpdatedAt && (
                                  <span className="text-[10px] text-amber-700 ml-2 font-medium">
                                    ({task.pendingReasonUpdatedAt})
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenReasonBox(task.id, task.pendingReason);
                              }}
                              className="text-[11px] font-bold text-amber-900 underline hover:text-amber-950 shrink-0 cursor-pointer"
                            >
                              Edit
                            </button>
                          </div>
                        )}

                        {/* Interactive Blank Box to Report Issue / Reason */}
                        {isEditingReason && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="mt-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in cursor-default"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                                <span>Reason why this task is delayed (Visible to Admin):</span>
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingReasonTaskId(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <textarea
                              value={reasonInput}
                              onChange={(e) => setReasonInput(e.target.value)}
                              placeholder="Write the exact issue or reason why it's pending (e.g. Waiting on client confirmation)..."
                              rows={2}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                            />

                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingReasonTaskId(null);
                                }}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveReason(task.id);
                                }}
                                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
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

        {/* Right column: Progress & Office Schedule */}
        <div className="space-y-5 sm:space-y-6">
          {/* Today's progress - Crisp Clean Monochrome Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
                <span>Today's Progress</span>
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {completedTasks}/{totalTasks} done
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-['Outfit'] text-slate-900 tracking-tight">
              {progressPercent}%
            </div>

            {/* Clean Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-4">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  progressPercent === 100 ? 'bg-emerald-600' : 'bg-indigo-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-xs text-slate-500 font-medium mt-3 flex items-center justify-between">
              <span>{pendingCountInView} tasks remaining</span>
              {progressPercent === 100 ? (
                <span className="text-emerald-700 font-bold">All Completed! 🎉</span>
              ) : (
                <span className="text-slate-600 font-semibold">{totalTasks - completedTasks} left</span>
              )}
            </p>
          </div>

          {/* Event or Special Schedule notice */}
          {isAllottedToEvent && (
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Special Event Duty Active</span>
              </div>
              <h4 className="font-bold text-sm text-white">{eventTiming.eventName}</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Special office schedule assigned by Admin for today.
              </p>
              <div className="pt-2 text-[11px] font-bold text-indigo-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Special Timing: {eventTiming.newTiming}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
