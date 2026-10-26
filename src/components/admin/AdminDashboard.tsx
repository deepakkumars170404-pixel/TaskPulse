import React from 'react';
import { useTaskPulse } from '../../context/TaskPulseContext';
import { Plus, CheckCircle, Clock, Users, ArrowUpRight, Calendar, AlertTriangle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { tasks, users, setCurrentPage, eventTiming } = useTaskPulse();

  // Metrics
  const tasksToday = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'done').length;
  const staffCount = users.filter((u) => u.role === 'staff').length;
  const completionRate = tasksToday > 0 ? Math.round((completedTasks / tasksToday) * 100) : 0;

  // Today's tasks table list
  const recentTasks = tasks.slice(0, 8);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Sat, 24 Oct 2026 · Overview of today's work</p>
        </div>

        <button
          onClick={() => setCurrentPage('assign')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-200 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Assign task</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Tasks today */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Tasks today</div>
          <div className="text-3xl font-extrabold font-['Outfit'] text-slate-900 mt-2">
            {tasksToday}
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Completed</span>
          </div>
          <div className="text-3xl font-extrabold font-['Outfit'] text-emerald-600 mt-2">
            {completedTasks}
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </div>
          <div className="text-3xl font-extrabold font-['Outfit'] text-amber-600 mt-2">
            {pendingTasks}
          </div>
        </div>

        {/* Staff active */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Staff active</span>
          </div>
          <div className="text-3xl font-extrabold font-['Outfit'] text-indigo-600 mt-2">
            {staffCount}
          </div>
        </div>
      </div>

      {/* Content Grid: Tasks Table (2 cols) & Widgets (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Tasks Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900">Today's tasks</h2>
            <button
              onClick={() => setCurrentPage('monitor')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View full monitor</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-semibold">Task</th>
                  <th className="pb-3 font-semibold">Assigned to</th>
                  <th className="pb-3 font-semibold">Priority</th>
                  <th className="pb-3 font-semibold">Due</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 pr-3 max-w-[220px]">
                      <div className="font-bold text-slate-800 truncate">{task.title}</div>
                      {task.status !== 'done' && task.pendingReason && (
                        <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 mt-0.5 truncate">
                          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Issue: "{task.pendingReason}"</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {task.assignedToName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .substring(0, 2)}
                        </div>
                        <span className="font-medium text-slate-700">{task.assignedToName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          task.priority === 'High'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : task.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3.5 pr-3 font-medium text-slate-500">{task.dueTime}</td>
                    <td className="py-3.5 text-right">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          task.status === 'done'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {task.status === 'done' ? 'Done' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Completion Progress & Upcoming Event */}
        <div className="space-y-6">
          {/* Completion today */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Completion today
            </h3>
            <div className="text-4xl font-extrabold font-['Outfit'] text-slate-900 tracking-tight">
              {completionRate}%
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {completedTasks} of {tasksToday} tasks finished
            </p>
          </div>

          {/* Upcoming event card */}
          {eventTiming && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>Upcoming event</span>
              </div>
              <h4 className="text-sm font-bold text-amber-950 mt-1">{eventTiming.eventName}</h4>
              <p className="text-xs text-amber-800 mt-1 font-medium">
                {eventTiming.date} · Timing changed to {eventTiming.newTiming}
              </p>
              <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-900 font-semibold">
                <span>Staff allotted:</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-950 font-bold">
                  {eventTiming.allottedStaffIds.length}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
