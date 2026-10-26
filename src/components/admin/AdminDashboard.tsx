import React, { useState } from 'react';
import { useTaskPulse } from '../../context/TaskPulseContext';
import { Plus, CheckCircle, Clock, Users, ArrowUpRight, Calendar, AlertTriangle } from 'lucide-react';
import { IssueModal } from '../common/IssueModal';
import { Task } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { tasks, users, setCurrentPage, eventTiming } = useTaskPulse();

  // Selected Date Filter: 'all' | 'previous' | 'today' | 'upcoming' | specific date
  const [dateFilter, setDateFilter] = useState<'today' | 'previous' | 'upcoming' | 'all'>('today');
  const [selectedTaskForIssue, setSelectedTaskForIssue] = useState<Task | null>(null);

  // Standard today reference string
  const TODAY_STR = '24 Oct 2026';

  // Filter tasks based on selected date range
  const filteredTasks = tasks.filter((t) => {
    if (dateFilter === 'today') return t.dueDate === TODAY_STR || !t.dueDate;
    if (dateFilter === 'previous') return t.dueDate && t.dueDate < TODAY_STR;
    if (dateFilter === 'upcoming') return t.dueDate && t.dueDate > TODAY_STR;
    return true; // 'all'
  });

  // Metrics based on filtered range
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter((t) => t.status === 'done').length;
  const pendingTasks = filteredTasks.filter((t) => t.status !== 'done').length;
  const staffCount = users.filter((u) => u.role === 'staff').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const displayTasks = filteredTasks.slice(0, 10);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-7">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">
            Overview of work · Access previous to-do lists and upcoming schedules
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('assign')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-200 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Assign task</span>
        </button>
      </div>

      {/* Date Navigation Bar (Previous, Today, Upcoming) */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-indigo-600 ml-2 mr-1" />
          <span className="text-xs font-bold text-slate-700 mr-2">Timeline View:</span>

          {(
            [
              { id: 'previous', label: 'Previous To-Do Lists' },
              { id: 'today', label: 'Today (24 Oct)' },
              { id: 'upcoming', label: 'Upcoming Days' },
              { id: 'all', label: 'All Tasks' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setDateFilter(filter.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateFilter === filter.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-medium px-2">
          Showing <strong>{filteredTasks.length}</strong> tasks for this timeline
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Tasks today / selected */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {dateFilter === 'today' ? 'Tasks today' : 'Tasks in view'}
          </div>
          <div className="text-3xl font-extrabold font-['Outfit'] text-slate-900 mt-2">
            {totalTasks}
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
        {/* Tasks Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900">
              {dateFilter === 'today'
                ? "Today's tasks"
                : dateFilter === 'previous'
                ? 'Previous tasks history'
                : dateFilter === 'upcoming'
                ? 'Upcoming scheduled tasks'
                : 'All tasks'}
            </h2>
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
                  {/* Status & Nearby Issue column */}
                  <th className="pb-3 font-semibold text-right">Status & Issues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400 italic">
                      No tasks found for this selected timeline.
                    </td>
                  </tr>
                ) : (
                  displayTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pr-3 max-w-[200px]">
                        <div className="font-bold text-slate-800 truncate">{task.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{task.dueDate}</div>
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

                      {/* Status Column with Nearby Written Issue Visibility */}
                      <td className="py-3.5 text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                              task.status === 'done'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {task.status === 'done' ? 'Done' : 'Pending'}
                          </span>

                          {/* Nearby Written Issue Button / Popup Trigger */}
                          {task.status !== 'done' && task.pendingReason && (
                            <button
                              type="button"
                              onClick={() => setSelectedTaskForIssue(task)}
                              className="px-2 py-1 rounded-lg bg-amber-100/90 hover:bg-amber-200 text-amber-950 border border-amber-300 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs max-w-[210px] truncate"
                              title="Click to view full issue in readable popup"
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate">Issue: "{task.pendingReason}"</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Completion Progress & Upcoming Event */}
        <div className="space-y-6">
          {/* Completion card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Completion Rate
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
              {completedTasks} of {totalTasks} tasks finished
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

      {/* Readable Issue Popup Modal */}
      <IssueModal
        task={selectedTaskForIssue}
        onClose={() => setSelectedTaskForIssue(null)}
      />
    </div>
  );
};
