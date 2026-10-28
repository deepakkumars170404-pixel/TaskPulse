import React, { useState, useEffect, useMemo } from 'react';
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
  Layers,
  CheckCircle2,
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
  const incomingPending = useMemo(() => {
    return tasks.filter(
      (t) => t.assignedTo === currentUser.id && t.type === 'staff' && t.status === 'pending'
    );
  }, [tasks, currentUser.id]);

  const incomingAccepted = useMemo(() => {
    return tasks.filter(
      (t) => t.assignedTo === currentUser.id && t.type === 'staff' && (t.status === 'accepted' || t.status === 'done')
    );
  }, [tasks, currentUser.id]);

  const incomingRejected = useMemo(() => {
    return tasks.filter(
      (t) => t.assignedTo === currentUser.id && t.type === 'staff' && t.status === 'rejected'
    );
  }, [tasks, currentUser.id]);

  // 2. OUTGOING / DELEGATED REQUESTS (Tasks created by current user for colleagues)
  const delegatedTasks = useMemo(() => {
    return tasks.filter(
      (t) => t.createdBy === currentUser.id && t.assignedTo !== currentUser.id
    );
  }, [tasks, currentUser.id]);

  const delegatedDeclined = useMemo(() => {
    return delegatedTasks.filter((t) => t.status === 'rejected');
  }, [delegatedTasks]);

  const delegatedPending = useMemo(() => {
    return delegatedTasks.filter((t) => t.status === 'pending');
  }, [delegatedTasks]);

  const delegatedActive = useMemo(() => {
    return delegatedTasks.filter((t) => t.status === 'accepted');
  }, [delegatedTasks]);

  const delegatedCompleted = useMemo(() => {
    return delegatedTasks.filter((t) => t.status === 'done');
  }, [delegatedTasks]);

  // Active Main Tab: 'incoming' | 'sent'
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

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5 max-w-7xl mx-auto select-none animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center gap-2.5 animate-in fade-in shadow-lg">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          1. HEADER & CONTROLS
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center shadow-xs">
              <Inbox className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-slate-900 tracking-tight">
              Colleague Task Requests
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
              {orgSettings.orgName || 'Workspace'} Delegations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Review incoming work requests between team members — approve, decline with reasons, and track delegated deliverables
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentPage('create')}
          className="btn-primary-gradient px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all self-start md:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Delegate New Task</span>
        </button>
      </div>

      {/* =========================================================================
          2. KPI OVERVIEW SUMMARY (4 CARDS)
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Incoming Pending */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Awaiting Action</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-amber-600">
              {incomingPending.length}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Incoming
            </span>
          </div>
        </div>

        {/* Card 2: Accepted & Done */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Accepted Work</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-emerald-600">
              {incomingAccepted.length}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              In Schedule
            </span>
          </div>
        </div>

        {/* Card 3: Delegated to Colleagues */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] flex items-center gap-1">
            <Send className="w-3 h-3" />
            <span>Given to Team</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-[#4F46E5]">
              {delegatedTasks.length}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Total Delegated
            </span>
          </div>
        </div>

        {/* Card 4: Declined Alerts */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>Declined by Team</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-rose-600">
              {delegatedDeclined.length}
            </span>
            <span className="text-[11px] font-bold text-rose-700">
              {delegatedDeclined.length > 0 ? 'Needs Attention' : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. MAIN TAB NAVIGATION
          ========================================================================= */}
      <div className="bg-white rounded-xl p-1.5 border border-slate-200/80 shadow-2xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('incoming')}
          className={`flex-1 min-w-[200px] py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'incoming'
              ? 'bg-[#4F46E5] text-white shadow-2xs font-bold'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>Incoming Requests (Awaiting Me)</span>
          {incomingPending.length > 0 && (
            <span
              className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'incoming' ? 'bg-white text-[#4F46E5]' : 'bg-rose-500 text-white'
              }`}
            >
              {incomingPending.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sent')}
          className={`flex-1 min-w-[200px] py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'sent'
              ? 'bg-[#4F46E5] text-white shadow-2xs font-bold'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Delegated by Me ({delegatedTasks.length})</span>
          {delegatedDeclined.length > 0 && (
            <span
              className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'sent' ? 'bg-rose-100 text-rose-900' : 'bg-rose-500 text-white'
              }`}
            >
              ⚠️ {delegatedDeclined.length} Declined
            </span>
          )}
        </button>
      </div>

      {/* =========================================================================
          TAB 1: INCOMING REQUESTS
          ========================================================================= */}
      {activeTab === 'incoming' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 w-full">
          {/* Main Feed (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">
                  Requests Awaiting Your Approval ({incomingPending.length})
                </h2>
                <span className="text-[11px] text-slate-400">
                  Accept to schedule · Decline to report reason
                </span>
              </div>

              {incomingPending.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                  <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-slate-700">No requests waiting</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">You are all caught up on staff delegations!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {incomingPending.map((task) => {
                    const isRejecting = rejectingTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-2xs space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-full bg-[#4F46E5] text-white font-bold text-xs flex items-center justify-center shrink-0 uppercase shadow-2xs">
                              {task.createdByName?.slice(0, 1) || 'C'}
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 pt-0.5 text-[11px] text-slate-500 font-medium flex-wrap">
                                <span>From: <strong className="text-slate-800 capitalize">{task.createdByName}</strong></span>
                                <span className="text-slate-300">•</span>
                                <span className="inline-flex items-center gap-1 text-slate-700 font-semibold bg-slate-50 px-2 py-0.2 rounded border border-slate-200">
                                  <Calendar className="w-3 h-3 text-[#4F46E5]" />
                                  <span>{task.dueDate} · {task.dueTime}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {!isRejecting && (
                            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                              <button
                                type="button"
                                onClick={() => acceptTaskRequest(task.id)}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Accept Task</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStartReject(task.id)}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-semibold transition-all border border-slate-200 cursor-pointer flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Decline</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Inline Decline Box */}
                        {isRejecting && (
                          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 space-y-2 animate-in fade-in duration-100">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Provide a reason to {task.createdByName}:</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => setRejectingTaskId(null)}
                                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>

                            <textarea
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder={`e.g. "I am handling urgent client deliverables today and cannot commit to this deadline."`}
                              rows={2}
                              autoFocus
                              className="w-full px-3 py-1.5 text-xs bg-white border border-rose-200 rounded-lg focus:outline-none focus:border-rose-500 text-slate-800 placeholder:text-slate-400"
                            />

                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setRejectingTaskId(null)}
                                className="px-3 py-1 rounded text-xs text-slate-600 hover:bg-slate-200 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleConfirmReject(task.id)}
                                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer active:scale-95"
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

          {/* Right Column: Accepted & Declined History */}
          <div className="space-y-4">
            {/* Accepted Today */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Accepted Deliverables</span>
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700">
                  {incomingAccepted.length}
                </span>
              </div>

              {incomingAccepted.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-3 text-center">No tasks accepted yet.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                  {incomingAccepted.map((task) => (
                    <div key={task.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-800 truncate">{task.title}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 shrink-0">
                          Accepted
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>From: {task.createdByName}</span>
                        <span>{task.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Declined by You */}
            {incomingRejected.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Declined by You</span>
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700">
                    {incomingRejected.length}
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                  {incomingRejected.map((task) => (
                    <div key={task.id} className="p-2.5 rounded-lg bg-rose-50/40 border border-rose-100 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-700 line-through truncate">{task.title}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 shrink-0">
                          Declined
                        </span>
                      </div>
                      {task.rejectReason && (
                        <p className="text-[11px] text-rose-800 italic bg-white p-1.5 rounded border border-rose-100">
                          "{task.rejectReason}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: DELEGATED BY ME
          ========================================================================= */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          {/* Section: Declined by Colleague (Alert at top) */}
          {delegatedDeclined.length > 0 && (
            <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-rose-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                    <XCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-rose-950">
                      Declined by Colleague ({delegatedDeclined.length})
                    </h2>
                    <p className="text-[11px] text-rose-700">
                      Colleagues declined these tasks and provided reasons below. You can take over or reassign.
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                  Action Required
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {delegatedDeclined.map((task) => {
                  const colleagueMsg = getTaskDeclineReason(task) || 'No message provided';

                  return (
                    <div
                      key={task.id}
                      className="bg-white rounded-xl p-3.5 border border-rose-200 shadow-2xs space-y-2.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900">{task.title}</h3>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
                            Declined by {task.assignedToName}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 flex-wrap">
                          <span>Sent to: <strong className="text-slate-800 capitalize">{task.assignedToName}</strong></span>
                          <span>•</span>
                          <span>Due: {task.dueDate} · {task.dueTime}</span>
                        </div>

                        {/* Rejection Message */}
                        <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs">
                          <div className="text-[10px] font-bold text-rose-900 mb-0.5">
                            Why {task.assignedToName} Declined:
                          </div>
                          <p className="font-semibold italic text-rose-950 bg-white p-2 rounded border border-rose-100">
                            "{colleagueMsg}"
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleMoveToSelf(task.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#4F46E5] text-white text-xs font-semibold cursor-pointer shadow-2xs flex items-center gap-1 active:scale-95"
                        >
                          <Check className="w-3 h-3" />
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
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] border border-indigo-200 text-xs font-semibold cursor-pointer flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reassign</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Dismiss task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Awaiting Colleague Response */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                Awaiting Colleague Confirmation ({delegatedPending.length})
              </h2>
            </div>

            {delegatedPending.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-3 text-center">
                No tasks currently waiting for colleague confirmation.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {delegatedPending.map((task) => (
                  <div key={task.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 truncate">{task.title}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                        Pending
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Delegated to: <strong className="text-slate-800 capitalize">{task.assignedToName}</strong>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Due: {task.dueDate} · {task.dueTime}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Accepted & In Progress */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                Accepted & In Progress ({delegatedActive.length + delegatedCompleted.length})
              </h2>
            </div>

            {delegatedActive.length === 0 && delegatedCompleted.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-3 text-center">
                No active tasks with colleagues at the moment.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...delegatedActive, ...delegatedCompleted].map((task) => (
                  <div key={task.id} className="p-3 rounded-lg border border-slate-200 bg-white space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-xs font-semibold truncate ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.title}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                        task.status === 'done' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {task.status === 'done' ? '✓ Finished' : 'In Progress'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Staff: <strong className="text-slate-800 capitalize">{task.assignedToName}</strong>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Due: {task.dueDate} · {task.dueTime}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reassign Modal */}
      {reassignTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-[#4F46E5]">
                <RotateCcw className="w-4 h-4" />
                <h3 className="text-sm font-bold text-slate-900">
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
              Select another colleague to reassign this task to. They will receive an instant notification in their incoming requests.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Choose Colleague:</label>
              <select
                value={reassignTargetUserId}
                onChange={(e) => setReassignTargetUserId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#4F46E5] bg-white shadow-2xs"
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
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
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
                className="btn-primary-gradient px-4 py-1.5 rounded-lg disabled:opacity-50 text-white text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all"
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
