import React from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { Check, Info, Inbox, Calendar, Clock, UserCheck } from 'lucide-react';

export const TaskRequestsView: React.FC = () => {
  const { currentUser, tasks, acceptTaskRequest } = useTaskToggle();

  // Pending requests created by other staff for current staff
  const pendingRequests = tasks.filter(
    (t) => t.assignedTo === currentUser.id && t.type === 'staff' && t.status === 'pending'
  );

  // Accepted today requests for current staff
  const acceptedToday = tasks.filter(
    (t) => t.assignedTo === currentUser.id && t.type === 'staff' && (t.status === 'accepted' || t.status === 'done')
  );

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-slate-900 tracking-tight">
          Incoming Task Requests
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Tasks created by your colleagues awaiting your official confirmation and date commitment
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 w-full">
        {/* Waiting for your acceptance (2 cols) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-7 border border-slate-200/90 shadow-sm">
            <div className="mb-5 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 font-['Outfit']">
                  Awaiting Your Acceptance
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Accepting adds the assignment to your daily to-do queue with scheduled target dates.
                </p>
              </div>

              {pendingRequests.length > 0 && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                  {pendingRequests.length} pending
                </span>
              )}
            </div>

            {pendingRequests.length === 0 ? (
              <div className="text-center py-14 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No requests waiting</p>
                <p className="text-xs text-slate-400 mt-1">You are all caught up on staff delegations!</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {pendingRequests.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 rounded-2xl border border-slate-200/90 hover:border-indigo-300 bg-white transition-all shadow-xs hover:shadow-md"
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Avatar */}
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {task.createdByName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{task.title}</h3>
                        {task.description && (
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{task.description}</p>
                        )}
                        <p className="text-[11px] text-slate-500 mt-1">
                          Delegated by <strong className="font-semibold text-slate-800">{task.createdByName}</strong>
                        </p>

                        {/* Prominent Target Deadline (Date & Time) */}
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-950 mt-2 shadow-2xs">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>Complete by: {task.dueDate}</span>
                          <span className="text-indigo-300">•</span>
                          <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{task.dueTime}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => acceptTaskRequest(task.id)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-200 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Accept Task</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Accepted today & Rules callout (1 col) */}
        <div className="space-y-5 sm:space-y-6">
          {/* Accepted today */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
              <span>Accepted Today</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </h3>
            {acceptedToday.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No tasks accepted yet today.</p>
            ) : (
              <div className="space-y-3">
                {acceptedToday.map((task) => (
                  <div key={task.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800">{task.title}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        Accepted
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>From: {task.createdByName}</span>
                      <span className="font-semibold text-slate-400">{task.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rules callout */}
          <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-800 block mb-1">Staff Delegation Protocol:</strong>
                Colleagues cannot assign work to you without your explicit approval. Once accepted, target date and due time lock into your personal schedule.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
