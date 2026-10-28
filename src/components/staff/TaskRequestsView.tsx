import React, { useState, useEffect } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { getTaskDeclineReason } from '../../types';
import {
  Check,
  X,
  Info,
  Inbox,
  Calendar,
  Clock,
  UserCheck,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Send,
  RotateCcw,
  Trash2,
  ArrowRight,
  UserPlus,
  ArrowLeft,
} from 'lucide-react';

export const TaskRequestsView: React.FC = () => {
  const {
    currentUser,
    users,
    tasks,
    acceptTaskRequest,
    rejectTaskRequest,
    moveToMyOwnToDo,
    reassignTask,
    deleteTask,
    setCurrentPage,
    requestViewTab,
    setRequestViewTab,
    orgSettings,
  } = useTaskToggle();

  // 1. INCOMING REQUESTS (Tasks sent by colleagues to current user)
  const incomingPending = tasks.filter(
    (t) => t.assignedTo === currentUser.id && t.type === 'staff' && t.status === 'pending'
  );

  const incomingAccepted = tasks.filter(
    (t) => t.assignedTo === currentUser.id && t.type === 'staff' && (t.status === 'accepted' || t.status === 'done')
  );

  const incomingRejected = tasks.filter(
    (t) => t.assignedTo === currentUser.id && t.type === 'staff' && t.status === 'rejected'
  );

  // 2. OUTGOING / DELEGATED REQUESTS (Tasks created by current user for colleagues)
  const delegatedTasks = tasks.filter(
    (t) => t.createdBy === currentUser.id && t.assignedTo !== currentUser.id
  );

  const delegatedDeclined = delegatedTasks.filter((t) => t.status === 'rejected');
  const delegatedPending = delegatedTasks.filter((t) => t.status === 'pending');
  const delegatedActive = delegatedTasks.filter((t) => t.status === 'accepted');
  const delegatedCompleted = delegatedTasks.filter((t) => t.status === 'done');

  // Active Main Tab: 'incoming' (Requests Sent to Me) | 'sent' (Tasks I Delegated to Colleagues)
  const [activeTab, setActiveTab] = useState<'incoming' | 'sent'>(() => {
    if (requestViewTab) return requestViewTab;
    if (delegatedDeclined.length > 0 && incomingPending.length === 0) return 'sent';
    return 'incoming';
  });

  useEffect(() => {
    if (requestViewTab) {
      setActiveTab(requestViewTab);
    }
  }, [requestViewTab]);

  const [rejectingTaskId, setRejectingTaskId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reassignTaskId, setReassignTaskId] = useState<string | null>(null);
  const [reassignTargetUserId, setReassignTargetUserId] = useState<string>('');

  const handleStartReject = (taskId: string) => {
    setRejectingTaskId(taskId);
    setRejectReason('');
  };

  const handleConfirmReject = (taskId: string) => {
    if (!rejectReason.trim()) {
      alert('Please enter a short reason explaining why you are declining this task.');
      return;
    }
    rejectTaskRequest(taskId, rejectReason);
    setRejectingTaskId(null);
    setRejectReason('');
    setToastMessage('Task request declined and reason submitted to colleague.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleMoveToSelf = (taskId: string) => {
    moveToMyOwnToDo(taskId);
    setToastMessage('Task moved to your own personal to-do list!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    setToastMessage('Task dismissed and removed.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      setCurrentPage('mytodo');
    }
  };

  return (
    <div className="w-full p-2.5 sm:p-4 lg:p-5 space-y-2.5 sm:space-y-3.5">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-primary-500 text-white flex items-center gap-3 animate-in fade-in shadow-md">
          <Check className="w-5 h-5 text-white shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Clean Corporate Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 sm:pb-2.5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
            title="1-click return to previous page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black font-['Outfit'] text-slate-900 tracking-tight">
                Colleague Task Requests
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-600 border border-primary-200">
                {orgSettings.orgName} Staff
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium hidden sm:block">
              Manage work requests between team members — approve, decline with reasons, and track delegated tasks
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCurrentPage('create')}
          className="px-3.5 py-1.5 sm:py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Delegate New Task</span>
        </button>
      </div>

      {/* Main Tab Navigation: Incoming vs Delegated */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('incoming')}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'incoming'
              ? 'bg-primary-500 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>📥 Incoming Requests (Awaiting Me)</span>
          {incomingPending.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'incoming' ? 'bg-white/20 text-white' : 'bg-rose-600 text-white shadow-2xs'
              }`}
            >
              {incomingPending.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sent')}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'sent'
              ? 'bg-primary-500 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>📤 Delegated by Me (Tasks Given to Colleagues)</span>
          {delegatedDeclined.length > 0 ? (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'sent' ? 'bg-rose-100 text-rose-900 border border-rose-300' : 'bg-rose-600 text-white shadow-xs'
              }`}
            >
              ⚠️ {delegatedDeclined.length} Declined
            </span>
          ) : (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'sent' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {delegatedTasks.length}
            </span>
          )}
        </button>
      </div>

      {/* =========================================================================
          TAB 1: INCOMING REQUESTS (WAITING FOR MY ACCEPTANCE / DECLINE)
          ========================================================================= */}
      {activeTab === 'incoming' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4 w-full">
          {/* Main Incoming Feed (2 cols on xl) */}
          <div className="xl:col-span-2 space-y-4">
            <div className="bg-white rounded-xl p-3 sm:p-4.5 border border-slate-200 shadow-2xs">
              <div className="mb-5 pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-800 font-['Outfit'] flex items-center gap-2">
                    <span>Awaiting Your Confirmation</span>
                    <span className="text-xs font-semibold text-slate-500">
                      ({incomingPending.length} pending)
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Approving adds the task to your daily schedule; declining sends your reason directly to the colleague.
                  </p>
                </div>
              </div>

              {incomingPending.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No requests waiting</p>
                  <p className="text-xs text-slate-400 mt-1">You are all caught up on staff delegations!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incomingPending.map((task) => {
                    const isRejecting = rejectingTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        className="flex flex-col gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-primary-300 transition-all shadow-2xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
                          <div className="flex items-start gap-3.5 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-primary-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {task.createdByName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .substring(0, 2)
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-bold text-slate-800 truncate">{task.title}</h3>
                              {task.description && (
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-medium">{task.description}</p>
                              )}
                              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                                Delegated by <strong className="font-semibold text-slate-800">{task.createdByName}</strong>
                              </p>

                              {/* Target Deadline */}
                              <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 mt-2">
                                <Calendar className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                                <span>Complete by: {task.dueDate}</span>
                                <span className="text-slate-300">•</span>
                                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span>{task.dueTime}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons: Accept or Reject */}
                          {!isRejecting && (
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => acceptTaskRequest(task.id)}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                                title="Approve and accept into your schedule"
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>Accept Task</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStartReject(task.id)}
                                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-bold transition-all border border-slate-200 cursor-pointer flex items-center gap-1.5"
                                title="Decline task with reason"
                              >
                                <X className="w-4 h-4" />
                                <span>Decline</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Inline Rejection Reason Box */}
                        {isRejecting && (
                          <div className="mt-2 p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-3 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 text-rose-600" />
                                <span>Please provide a reason to {task.createdByName}:</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => setRejectingTaskId(null)}
                                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>

                            <textarea
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder={`e.g. "I have back-to-back client demos today and cannot take this up before 5 PM."`}
                              rows={2}
                              autoFocus
                              className="w-full px-3 py-2 text-xs bg-white border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-800 placeholder:text-slate-400 font-medium"
                            />

                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setRejectingTaskId(null)}
                                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleConfirmReject(task.id)}
                                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                              >
                                Submit Rejection
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

          {/* Right column: Accepted Today & Decline History */}
          <div className="space-y-5 sm:space-y-6">
            {/* Accepted today */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
                <span>Accepted Today</span>
                <UserCheck className="w-4 h-4 text-emerald-600" />
              </h3>
              {incomingAccepted.length === 0 ? (
                <p className="text-xs text-slate-400 italic font-medium">No tasks accepted yet today.</p>
              ) : (
                <div className="space-y-2.5">
                  {incomingAccepted.map((task) => (
                    <div key={task.id} className="border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800">{task.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          Accepted
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                        <span className="font-medium text-slate-600">From: {task.createdByName}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{task.dueDate} · {task.dueTime}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rejected Requests History */}
            {incomingRejected.length > 0 && (
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
                  <span>Declined by You</span>
                  <XCircle className="w-4 h-4 text-rose-500" />
                </h3>
                <div className="space-y-2.5">
                  {incomingRejected.map((task) => (
                    <div key={task.id} className="border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-700 line-through">{task.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                          Declined
                        </span>
                      </div>
                      {task.rejectReason && (
                        <p className="text-[11px] text-rose-800 font-medium mt-1 bg-rose-50/50 p-1.5 rounded-md border border-rose-100">
                          Reason: "{task.rejectReason}"
                        </p>
                      )}
                      <div className="text-[10px] text-slate-400 mt-1">
                        From: {task.createdByName} {task.rejectedAt ? `· ${task.rejectedAt}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: DELEGATED BY ME (TASKS I GAVE TO COLLEAGUES)
          Allows the task giver to immediately see if a colleague rejected
          the task and read their full message / reason with action buttons!
          ========================================================================= */}
      {activeTab === 'sent' && (
        <div className="space-y-6">
          {/* SECTION 1: 🚨 DECLINED BY COLLEAGUES (HIGHLIGHTED AT TOP) */}
          {delegatedDeclined.length > 0 && (
            <div className="bg-rose-50/70 border-2 border-rose-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-rose-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-rose-950 font-['Outfit']">
                      Declined by Colleague ({delegatedDeclined.length})
                    </h2>
                    <p className="text-xs text-rose-800 font-medium">
                      Colleagues were unable to accept these tasks and provided the following reasons.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                  Action Required
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {delegatedDeclined.map((task) => {
                  const colleagueMsg = getTaskDeclineReason(task) || 'No message provided';

                  return (
                    <div
                      key={task.id}
                      className="bg-white rounded-xl p-4 border-2 border-rose-200 shadow-2xs space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        {/* Task Header */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-black text-slate-900">{task.title}</h3>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 shrink-0">
                            ❌ Declined by {task.assignedToName}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 font-semibold flex-wrap">
                          <span className="text-slate-700">Sent to: <strong>{task.assignedToName}</strong></span>
                          <span>•</span>
                          <span className="text-slate-500">Due: {task.dueDate} · {task.dueTime}</span>
                        </div>

                        {/* Colleague Rejection Message Box */}
                        <div className="mt-3 p-3 rounded-xl bg-rose-50/90 border border-rose-200 space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                            <div className="flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span>Why {task.assignedToName} Declined:</span>
                            </div>
                            {task.rejectedAt && (
                              <span className="text-[10px] text-rose-700 font-medium">
                                at {task.rejectedAt}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-rose-950 font-bold italic bg-white p-2.5 rounded-lg border border-rose-100 leading-relaxed shadow-2xs">
                            "{colleagueMsg}"
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleMoveToSelf(task.id)}
                          className="px-3 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-600 border border-primary-200 text-xs font-bold cursor-pointer transition-all flex items-center gap-1 active:scale-95"
                          title="Take over this task and move it to your own personal to-do list"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Move to My Schedule</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setReassignTaskId(task.id);
                              const firstOther = users.find((u) => u.role === 'staff' && u.id !== currentUser.id && u.id !== task.assignedTo);
                              setReassignTargetUserId(firstOther?.id || '');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1 active:scale-95 shadow-xs"
                            title="Reassign to another colleague"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reassign</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Dismiss and remove task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: ⏳ AWAITING COLLEAGUE CONFIRMATION */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 font-['Outfit'] flex items-center gap-2">
                <span>Awaiting Colleague Response</span>
                <span className="text-xs font-semibold text-slate-500">
                  ({delegatedPending.length} pending)
                </span>
              </h2>
            </div>

            {delegatedPending.length === 0 ? (
              <p className="text-xs text-slate-400 italic font-medium py-3">
                No tasks currently waiting for colleague confirmation.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {delegatedPending.map((task) => (
                  <div key={task.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">{task.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                        Pending
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Delegated to: <strong className="text-slate-800">{task.assignedToName}</strong>
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">
                      Due: {task.dueDate} · {task.dueTime}
                    </div>
                    {task.pendingReason && task.status !== 'done' && (
                      <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium space-y-0.5">
                        <div className="flex items-center gap-1 font-bold text-[11px] text-amber-800">
                          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Issue from {task.assignedToName}:</span>
                        </div>
                        <p className="italic text-[11px] font-semibold text-slate-900">
                          "{task.pendingReason.replace(/^\[DECLINED\]:\s*/, '')}"
                        </p>
                        {task.pendingReasonUpdatedAt && (
                          <div className="text-[10px] text-amber-700 font-medium">
                            Reported at {task.pendingReasonUpdatedAt}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: ✓ ACCEPTED & FINISHED BY COLLEAGUES */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 font-['Outfit'] flex items-center gap-2">
                <span>Accepted & In Progress</span>
                <span className="text-xs font-semibold text-slate-500">
                  ({delegatedActive.length + delegatedCompleted.length} tasks)
                </span>
              </h2>
            </div>

            {delegatedActive.length === 0 && delegatedCompleted.length === 0 ? (
              <p className="text-xs text-slate-400 italic font-medium py-3">
                No accepted tasks from colleagues at the moment.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...delegatedActive, ...delegatedCompleted].map((task) => (
                  <div key={task.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-xs font-bold truncate ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.title}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                        task.status === 'done' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-primary-50 text-primary-600 border border-primary-200'
                      }`}>
                        {task.status === 'done' ? '✓ Finished' : 'In Progress'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Executing by: <strong className="text-slate-800">{task.assignedToName}</strong>
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">
                      Due: {task.dueDate} · {task.dueTime}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reassign Colleague Modal */}
      {reassignTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-primary-500">
                <RotateCcw className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                  Reassign Task to Colleague
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReassignTaskId(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Select another colleague to reassign this task to. They will receive an instant notification.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Choose Colleague:</label>
              <select
                value={reassignTargetUserId}
                onChange={(e) => setReassignTargetUserId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-primary-500 bg-white"
              >
                <option value="">-- Select a Colleague --</option>
                {users
                  .filter((u) => u.role === 'staff' && u.id !== currentUser.id)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReassignTaskId(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!reassignTargetUserId}
                onClick={() => {
                  if (reassignTaskId && reassignTargetUserId) {
                    reassignTask(reassignTaskId, reassignTargetUserId);
                    const targetUser = users.find((u) => u.id === reassignTargetUserId);
                    setReassignTaskId(null);
                    setToastMessage(`Task successfully reassigned to ${targetUser?.name || 'colleague'}!`);
                    setTimeout(() => setToastMessage(null), 3500);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                Confirm Reassignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
