import React, { useState } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import {
  Plus,
  CheckCircle2,
  Clock,
  Users,
  ArrowUpRight,
  Calendar,
  AlertTriangle,
  Sparkles,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { IssueModal } from '../common/IssueModal';
import { Task } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { tasks, users, setCurrentPage, eventTiming, orgSettings } = useTaskToggle();

  // Selected Date Filter: 'all' | 'previous' | 'today' | 'upcoming'
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
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Page Header with Rich Gradient Accent */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-slate-900 tracking-tight">
              Executive Dashboard
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/90 shadow-2xs">
              {orgSettings.orgName}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Monitor real-time task completion, manage deadlines, and oversee team workflows
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('assign')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-200/80 hover:shadow-indigo-300 transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Assign New Task</span>
        </button>
      </div>

      {/* Date Navigation Bar (Scrollable on mobile) */}
      <div className="bg-white/95 backdrop-blur-xs p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 ml-1">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-700 mr-1.5 shrink-0 hidden xs:inline">
            Timeline View:
          </span>

          {(
            [
              { id: 'today', label: 'Today (24 Oct)' },
              { id: 'upcoming', label: 'Upcoming Deadlines' },
              { id: 'previous', label: 'Previous Records' },
              { id: 'all', label: 'All Tasks' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setDateFilter(filter.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                dateFilter === filter.id
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="text-[11px] sm:text-xs text-slate-500 font-semibold px-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Showing <strong>{filteredTasks.length}</strong> tasks in this timeline</span>
        </div>
      </div>

      {/* 4 Executive Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Total Tasks */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              {dateFilter === 'today' ? "Today's Workload" : 'Timeline Tasks'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-slate-900 mt-2">
            {totalTasks}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-1">
            <span>Assigned across team</span>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700">
              Finished
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm shadow-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-emerald-600 mt-2">
            {completedTasks}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{completionRate}% completion rate</span>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-700">
              Pending Actions
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-sm shadow-amber-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-amber-600 mt-2">
            {pendingTasks}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            <span>Awaiting completion</span>
          </div>
        </div>

        {/* Staff active */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-violet-700">
              Staff Active
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 text-white flex items-center justify-center shadow-sm shadow-violet-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-violet-700 mt-2">
            {staffCount}
          </div>
          <div className="text-[11px] text-violet-600 font-medium mt-1">
            <span>Organization members</span>
          </div>
        </div>
      </div>

      {/* Content Grid: Tasks Table (2 cols) & Widgets (1 col) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 w-full">
        {/* Main Tasks Table with Prominent Target Completion (Date & Time) */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/50">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 font-['Outfit']">
                {dateFilter === 'today'
                  ? "Today's Task Assignments"
                  : dateFilter === 'previous'
                  ? 'Archived Task Records'
                  : dateFilter === 'upcoming'
                  ? 'Upcoming Scheduled Deadlines'
                  : 'All Tasks Directory'}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Target date and completion deadline for every team assignment
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('monitor')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 transition-all cursor-pointer"
            >
              <span>Full Monitor</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 sm:px-5 font-bold">Task Title</th>
                  <th className="py-3 px-4 font-bold">Assigned Staff</th>
                  <th className="py-3 px-4 font-bold">Priority</th>
                  {/* Dedicated Prominent Target Completion (Date & Time) */}
                  <th className="py-3 px-4 font-bold text-indigo-950">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Target Deadline (Date & Time)</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 sm:px-5 font-bold text-right">Status & Issues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                      No tasks found for this selected timeline.
                    </td>
                  </tr>
                ) : (
                  displayTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-indigo-50/20 transition-colors">
                      {/* Task Title */}
                      <td className="py-3.5 px-4 sm:px-5 max-w-[210px]">
                        <div className="font-bold text-slate-900 truncate text-[13px]">{task.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 capitalize flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <span>{task.type === 'admin' ? 'Admin Assigned' : `By ${task.createdByName}`}</span>
                        </div>
                      </td>

                      {/* Assigned Staff */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                            {task.assignedToName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .substring(0, 2)}
                          </div>
                          <span className="font-semibold text-slate-800 truncate max-w-[110px]">
                            {task.assignedToName}
                          </span>
                        </div>
                      </td>

                      {/* Priority Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap ${
                            task.priority === 'High'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs'
                              : task.priority === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              task.priority === 'High' ? 'bg-rose-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-slate-400'
                            }`}
                          />
                          <span>{task.priority}</span>
                        </span>
                      </td>

                      {/* Prominent Target Deadline (Date & Time) */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex flex-col gap-1 items-start bg-indigo-50/70 border border-indigo-100/90 rounded-xl px-2.5 py-1 shadow-2xs">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 whitespace-nowrap">
                            <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>{task.dueDate}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 whitespace-nowrap">
                            <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span>By {task.dueTime}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status Column & Issue Trigger */}
                      <td className="py-3.5 px-4 sm:px-5 text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              task.status === 'done'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs'
                                : 'bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                task.status === 'done' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                              }`}
                            />
                            <span>{task.status === 'done' ? 'Completed' : 'Pending'}</span>
                          </span>

                          {/* Nearby Written Issue Button / Popup Trigger */}
                          {task.status !== 'done' && task.pendingReason && (
                            <button
                              type="button"
                              onClick={() => setSelectedTaskForIssue(task)}
                              className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs max-w-[190px] truncate"
                              title="Click to view full issue in readable popup"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
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
        <div className="space-y-5 sm:space-y-6">
          {/* Completion card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Completion Rate
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {completedTasks}/{totalTasks} tasks
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-['Outfit'] text-slate-900 tracking-tight">
              {completionRate}%
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 mt-3 overflow-hidden shadow-inner p-0.5">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2.5 font-medium flex items-center justify-between">
              <span>Finished: <strong>{completedTasks}</strong></span>
              <span>Pending: <strong>{pendingTasks}</strong></span>
            </p>
          </div>

          {/* Upcoming event card */}
          {eventTiming && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200/90 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Special Event Schedule</span>
              </div>
              <h4 className="text-sm font-bold text-amber-950 mt-1">{eventTiming.eventName}</h4>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 mt-2 bg-amber-100/70 p-2 rounded-xl border border-amber-200/70">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{eventTiming.date} · {eventTiming.newTiming}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-amber-200/70 flex items-center justify-between text-xs text-amber-900 font-semibold">
                <span>Staff Allotted:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200/90 text-amber-950 font-bold shadow-2xs">
                  {eventTiming.allottedStaffIds.length} members
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
