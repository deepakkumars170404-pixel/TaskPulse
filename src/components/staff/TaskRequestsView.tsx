import React, { useState } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { Check, X, Info, Inbox, Calendar, Clock, UserCheck, XCircle, AlertCircle } from 'lucide-react';

export const TaskRequestsView: React.FC = () => {
  const { currentUser, tasks, acceptTaskRequest, rejectTaskRequest, orgSettings } = useTaskToggle();

  const [rejectingTaskId, setRejectingTaskId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pending requests created by other staff for current staff
  const pendingRequests = tasks.filter(
    (t) => t.assignedTo === currentUser.id && t.type === 'staff' && t.status === 'pending'
  );

  // Accepted today requests for current staff
  const acceptedToday = tasks.filter(
    (t) => t.assignedTo === currentUser.id && t.type === 'staff' && (t.status === 'accepted' || t.status === 'done')
  );

  // Rejected / declined requests for current staff
  const rejectedList = tasks.filter(
    (t) => t.assignedTo === currentUser.id && t.type === 'staff' && t.status === 'rejected'
  );

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
    setToastMessage('Task request declined and reason submitted.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-indigo-600 text-white flex items-center gap-3 animate-in fade-in shadow-md">
          <Check className="w-5 h-5 text-white shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Clean Light Corporate Header (No black color) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-slate-800 tracking-tight">
              Incoming Task Requests
            </h1>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {orgSettings.orgName} Staff
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Review tasks delegated by colleagues — approve to add to your schedule or decline with a reason
          </p>
        </div>

        {pendingRequests.length > 0 && (
          <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-indigo-600 text-white shadow-xs flex items-center gap-1.5 self-start sm:self-auto">
            <span>{pendingRequests.length} Waiting Response</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 w-full">
        {/* Waiting for your acceptance / rejection (2 cols on xl) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-7 border border-slate-200 shadow-xs">
            <div className="mb-5 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-800 font-['Outfit']">
                  Awaiting Your Confirmation
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Approving adds the task to your daily schedule; declining requires a reason for the sender.
                </p>
              </div>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No requests waiting</p>
                <p className="text-xs text-slate-400 mt-1">You are all caught up on staff delegations!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((task) => {
                  const isRejecting = rejectingTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      className="flex flex-col gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-2xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
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
                              <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
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
                              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                              title="Decline this task with a reason"
                            >
                              <X className="w-4 h-4 stroke-[2.5]" />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Inline Reject Reason Box */}
                      {isRejecting && (
                        <div className="mt-2 p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2.5 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Provide reason for rejecting:</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setRejectingTaskId(null)}
                              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>

                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g. Schedule is full with priority client reviews, please assign to Karthik..."
                            rows={2}
                            autoFocus
                            className="w-full p-2.5 rounded-lg border border-rose-300 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                          />

                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setRejectingTaskId(null)}
                              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
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

        {/* Right column: Accepted today, Rejected History & Protocol */}
        <div className="space-y-5 sm:space-y-6">
          {/* Accepted today */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
              <span>Accepted Today</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </h3>
            {acceptedToday.length === 0 ? (
              <p className="text-xs text-slate-400 italic font-medium">No tasks accepted yet today.</p>
            ) : (
              <div className="space-y-2.5">
                {acceptedToday.map((task) => (
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
          {rejectedList.length > 0 && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
                <span>Declined Requests</span>
                <XCircle className="w-4 h-4 text-rose-500" />
              </h3>
              <div className="space-y-2.5">
                {rejectedList.map((task) => (
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

          {/* Rules callout */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed font-medium">
                <strong className="text-slate-800 block mb-1">Staff Delegation Protocol:</strong>
                Colleagues cannot assign work to you without your explicit approval. If you decline, provide a clear reason so the task can be reassigned or adjusted.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
