import React from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { Check, Info, Inbox } from 'lucide-react';

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
    <div className="w-full p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-['Outfit'] text-slate-900">Task Requests</h1>
        <p className="text-sm text-slate-500">Tasks other staff members created for you</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 w-full">
        {/* Waiting for your acceptance (2 cols) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-xs">
            <div className="mb-5">
              <h2 className="text-base font-bold text-slate-900">Waiting for your acceptance</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Accepting adds the task to your to-do list. Until accepted it stays Pending.
              </p>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">No requests waiting</p>
                <p className="text-xs text-slate-400 mt-1">You are all caught up on staff delegations!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-white transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {task.createdByName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{task.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          From <strong className="font-semibold text-slate-700">{task.createdByName}</strong> · due {task.dueTime}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => acceptTaskRequest(task.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Accept</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Accepted today & Rules callout (1 col) */}
        <div className="space-y-6">
          {/* Accepted today */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Accepted today
            </h3>
            {acceptedToday.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No tasks accepted yet today.</p>
            ) : (
              <div className="space-y-3">
                {acceptedToday.map((task) => (
                  <div key={task.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800">{task.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Accepted
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">From {task.createdByName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Admin Rule Callout */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                  <strong>Accept applies only to staff-to-staff tasks.</strong> Admin tasks are compulsory and need no acceptance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

