import React from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { Check, Info, Inbox, Calendar, Clock, UserCheck } from 'lucide-react';

export const TaskRequestsView: React.FC = () => {
  const { currentUser, tasks, acceptTaskRequest, orgSettings } = useTaskToggle();

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
      {/* Clean Corporate Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 tracking-tight">
              Incoming Task Requests
            </h1>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-900 text-white shadow-2xs">
              {orgSettings.orgName} Staff
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Tasks created by colleagues awaiting your official confirmation and date commitment
          </p>
        </div>

        {pendingRequests.length > 0 && (
          <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-slate-900 text-white shadow-xs flex items-center gap-1.5 self-start sm:self-auto">
            <span>{pendingRequests.length} Waiting Acceptance</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 w-full">
        {/* Waiting for your acceptance (2 cols on xl) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-7 border border-slate-200 shadow-xs">
            <div className="mb-5 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 font-['Outfit']">
                  Awaiting Your Acceptance
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Accepting adds the assignment to your daily to-do queue with scheduled target dates.
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
              <div className="space-y-3.5">
                {pendingRequests.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-2xs"
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
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
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-medium">{task.description}</p>
                        )}
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">
                          Delegated by <strong className="font-bold text-slate-900">{task.createdByName}</strong>
                        </p>

                        {/* Prominent Target Deadline */}
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 mt-2">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>Complete by: {task.dueDate}</span>
                          <span className="text-slate-300">•</span>
                          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{task.dueTime}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => acceptTaskRequest(task.id)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Accept Task</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Accepted today & Rules callout (1 col on xl) */}
        <div className="space-y-5 sm:space-y-6">
          {/* Accepted today */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center justify-between">
              <span>Accepted Today</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </h3>
            {acceptedToday.length === 0 ? (
              <p className="text-xs text-slate-400 italic font-medium">No tasks accepted yet today.</p>
            ) : (
              <div className="space-y-3">
                {acceptedToday.map((task) => (
                  <div key={task.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800">{task.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        Accepted
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span className="font-medium text-slate-600">From: {task.createdByName}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{task.dueDate} · {task.dueTime}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rules callout */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed font-medium">
                <strong className="text-slate-900 block mb-1">Staff Delegation Protocol:</strong>
                Colleagues cannot assign work to you without your explicit approval. Once accepted, target date and due time lock directly into your personal schedule.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
