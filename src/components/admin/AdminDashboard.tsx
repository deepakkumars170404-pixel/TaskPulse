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
  Layers,
  MousePointerClick,
  Check,
} from 'lucide-react';
import { IssueModal } from '../common/IssueModal';
import { Task } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { tasks, users, setCurrentPage, eventTiming, orgSettings, toggleTaskStatus } = useTaskToggle();

  // Selected Date Filter: 'all' | 'previous' | 'today' | 'upcoming'
  const [dateFilter, setDateFilter] = useState<'today' | 'previous' | 'upcoming' | 'all'>('today');
  const [selectedTaskForIssue, setSelectedTaskForIssue] = useState<Task | null>(null);

  // Standard today reference string
  const TODAY_STR = '27 Oct 2026';

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
      {/* Clean Corporate Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 tracking-tight">
              Executive Dashboard
            </h1>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-600 text-white shadow-2xs">
              {orgSettings.orgName} Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Real-time workflow monitoring, live deadlines, and team delegation tracking
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('assign')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Assign New Task</span>
        </button>
      </div>

      {/* Date Navigation Bar */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 ml-1 border border-slate-200">
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-xs font-bold text-slate-700 mr-1.5 shrink-0 hidden xs:inline">
            Timeline View:
          </span>

          {(
            [
              { id: 'today', label: 'Today (27 Oct)' },
              { id: 'upcoming', label: 'Upcoming Deadlines' },
              { id: 'previous', label: 'Previous Records' },
              { id: 'all', label: 'All Tasks Directory' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setDateFilter(filter.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                dateFilter === filter.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="text-[11px] sm:text-xs text-slate-600 font-medium px-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-indigo-200" />
          <span>Timeline holds <strong>{filteredTasks.length}</strong> active tasks</span>
        </div>
      </div>

      {/* 4 Professional Light Executive Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Card 1: Total Workload */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              {dateFilter === 'today' ? "Today's Workload" : 'Timeline Workload'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 mt-2">
            {totalTasks}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Assigned across departments
          </div>
        </div>

        {/* Card 2: Completed On Time */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Finished On Time
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-emerald-700 mt-2">
            {completedTasks}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            {completionRate}% Delivered successfully
          </div>
        </div>

        {/* Card 3: In-Progress Work */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              In-Progress Work
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 mt-2">
            {pendingTasks}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Pending team execution
          </div>
        </div>

        {/* Card 4: Active Staff */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Team Roster
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 mt-2">
            {staffCount}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Operating under {orgSettings.orgName}
          </div>
        </div>
      </div>

      {/* Main Overview Grid: Tasks Table (2 cols) & Progress (1 col) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 w-full">
        {/* Left Table (2 cols on xl) */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-['Outfit']">
                  {dateFilter === 'today' ? "Today's Target Tasks" : 'Timeline Target Tasks'}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <MousePointerClick className="w-3 h-3 text-emerald-600" />
                  <span>Click row to strike</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Tap any task row to strike & complete it instantly
              </p>
            </div>

            <button
              onClick={() => setCurrentPage('monitor')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all"
            >
              <span>Open Central Monitor</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 sm:px-5">Task Title</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-slate-700 font-bold">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Target Deadline</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 sm:px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium italic">
                      No tasks found for this selected timeline.
                    </td>
                  </tr>
                ) : (
                  displayTasks.map((task) => {
                    const isDone = task.status === 'done';

                    return (
                      <tr
                        key={task.id}
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`hover:bg-slate-50/80 transition-all cursor-pointer select-none ${
                          isDone ? 'bg-slate-50/50 opacity-75' : ''
                        }`}
                        title="Click anywhere to toggle task completion"
                      >
                        {/* Task Title with Checkbox & Strikethrough */}
                        <td className="py-3.5 px-4 sm:px-5 max-w-[220px]">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                                isDone
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'border-2 border-slate-300'
                              }`}
                            >
                              {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                className={`font-bold truncate text-[13px] transition-all ${
                                  isDone
                                    ? 'line-through text-slate-400 font-medium decoration-emerald-500 decoration-2'
                                    : 'text-slate-900'
                                }`}
                              >
                                {task.title}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5 capitalize flex items-center gap-1 font-medium">
                                <span>{task.type === 'admin' ? 'Admin Assigned' : `By ${task.createdByName}`}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Assigned Staff */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
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
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap ${
                              task.priority === 'High'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : task.priority === 'Medium'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            <span>{task.priority}</span>
                          </span>
                        </td>

                        {/* Prominent Target Deadline */}
                        <td className="py-3.5 px-4">
                          <div className="inline-flex flex-col gap-0.5 items-start bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 whitespace-nowrap">
                              <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>{task.dueDate}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 whitespace-nowrap">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>By {task.dueTime}</span>
                            </div>
                          </div>
                        </td>

                        {/* Status Column & Issue Trigger */}
                        <td className="py-3.5 px-4 sm:px-5 text-right">
                          <div className="flex flex-col items-end gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskStatus(task.id);
                              }}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                                isDone
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                              }`}
                              title="Click to toggle status"
                            >
                              <span>{isDone ? 'Completed' : 'Pending'}</span>
                            </button>

                            {/* Nearby Written Issue Button / Popup Trigger */}
                            {!isDone && task.pendingReason && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTaskForIssue(task);
                                }}
                                className="px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer max-w-[190px] truncate"
                                title="Click to view full issue in readable popup"
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                <span className="truncate">Issue: "{task.pendingReason}"</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Completion Progress & Upcoming Event */}
        <div className="space-y-5 sm:space-y-6">
          {/* Completion card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Team Completion Rate
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                {completedTasks}/{totalTasks} tasks
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black font-['Outfit'] text-slate-900 tracking-tight">
              {completionRate}%
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden p-0.5">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2.5 font-medium flex items-center justify-between">
              <span className="text-emerald-700 font-semibold">Finished: <strong>{completedTasks}</strong></span>
              <span className="text-slate-600">Pending: <strong>{pendingTasks}</strong></span>
            </p>
          </div>

          {/* Upcoming event card */}
          {eventTiming && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Special Event Schedule</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-1">{eventTiming.eventName}</h4>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mt-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>{eventTiming.date} · {eventTiming.newTiming}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Staff Allotted:</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold border border-slate-200">
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
