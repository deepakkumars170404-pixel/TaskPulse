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
  Activity,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-indigo-100/70">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 tracking-tight">
              Executive Dashboard
            </h1>
            <span className="text-[11px] font-black px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-xs shadow-indigo-300/40">
              {orgSettings.orgName} Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-semibold flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-600" />
            <span>Real-time workflow monitoring, live deadlines, and team delegation tracking</span>
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('assign')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white text-xs sm:text-sm font-black shadow-md shadow-indigo-300/60 hover:shadow-indigo-400 transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Assign New Task</span>
        </button>
      </div>

      {/* Date Navigation Bar (Scrollable on mobile) */}
      <div className="bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-indigo-100/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-50 to-cyan-50 flex items-center justify-center text-indigo-600 shrink-0 ml-1 border border-indigo-100">
            <Calendar className="w-4 h-4 text-cyan-600" />
          </div>
          <span className="text-xs font-black text-slate-700 mr-1.5 shrink-0 hidden xs:inline">
            Timeline View:
          </span>

          {(
            [
              { id: 'today', label: 'Today (24 Oct)' },
              { id: 'upcoming', label: 'Upcoming Deadlines' },
              { id: 'previous', label: 'Previous Records' },
              { id: 'all', label: 'All Tasks Directory' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setDateFilter(filter.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                dateFilter === filter.id
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white shadow-xs shadow-indigo-300/40'
                  : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="text-[11px] sm:text-xs text-indigo-950 font-bold px-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse ring-2 ring-cyan-200" />
          <span>Timeline holds <strong>{filteredTasks.length}</strong> active tasks</span>
        </div>
      </div>

      {/* 4 Rich Colored Executive Stat Cards (Indigo, Emerald/Teal, Amber/Orange, Cyan/Blue) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Card 1: Total Workload - Royal Indigo / Violet Gradient */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white rounded-2xl p-4 sm:p-5 shadow-lg shadow-indigo-500/25 relative overflow-hidden group hover:scale-[1.02] transition-all">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-indigo-100">
              {dateFilter === 'today' ? "Today's Workload" : 'Timeline Workload'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Outfit'] mt-2.5 relative z-10">
            {totalTasks}
          </div>
          <div className="text-[11px] text-indigo-200 font-semibold mt-1 flex items-center gap-1 relative z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Assigned across departments</span>
          </div>
        </div>

        {/* Card 2: Completed - Emerald / Mint Gradient */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-2xl p-4 sm:p-5 shadow-lg shadow-emerald-500/25 relative overflow-hidden group hover:scale-[1.02] transition-all">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-100">
              Finished On Time
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Outfit'] mt-2.5 relative z-10">
            {completedTasks}
          </div>
          <div className="text-[11px] text-emerald-200 font-semibold mt-1 flex items-center gap-1 relative z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
            <span>{completionRate}% Delivered successfully</span>
          </div>
        </div>

        {/* Card 3: Pending / In-Progress - Sunset Amber / Warm Orange */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white rounded-2xl p-4 sm:p-5 shadow-lg shadow-amber-500/25 relative overflow-hidden group hover:scale-[1.02] transition-all">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-100">
              In-Progress Work
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Outfit'] mt-2.5 relative z-10">
            {pendingTasks}
          </div>
          <div className="text-[11px] text-amber-100 font-semibold mt-1 flex items-center gap-1 relative z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span>Pending team execution</span>
          </div>
        </div>

        {/* Card 4: Active Staff - Electric Cyan / Sky Blue Gradient */}
        <div className="bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 text-white rounded-2xl p-4 sm:p-5 shadow-lg shadow-cyan-500/25 relative overflow-hidden group hover:scale-[1.02] transition-all">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-cyan-100">
              Active Team Roster
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Outfit'] mt-2.5 relative z-10">
            {staffCount}
          </div>
          <div className="text-[11px] text-cyan-200 font-semibold mt-1 flex items-center gap-1 relative z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
            <span>Operating under Deepak Org</span>
          </div>
        </div>
      </div>

      {/* Main Overview Grid: Tasks Table (2 cols) & Progress (1 col) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 w-full">
        {/* Left Table (2 cols on xl) */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-indigo-100/90 shadow-md shadow-indigo-100/30 overflow-hidden">
          {/* Table Header Controls with Click-to-Strike notice */}
          <div className="p-4 sm:p-5 border-b border-indigo-100/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 font-['Outfit']">
                  {dateFilter === 'today' ? "Today's Target Tasks" : 'Timeline Target Tasks'}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <MousePointerClick className="w-3 h-3 text-emerald-600" />
                  <span>Click anywhere to strike</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Tap any task row to strike & complete it instantly
              </p>
            </div>

            <button
              onClick={() => setCurrentPage('monitor')}
              className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-indigo-100 shadow-2xs hover:shadow-xs transition-all"
            >
              <span>Open Central Monitor</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-4 sm:px-5">Task Title</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-indigo-950 font-black">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Target Deadline (Date & Time)</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 sm:px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold italic">
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
                        className={`hover:bg-gradient-to-r hover:from-indigo-50/40 hover:to-cyan-50/30 transition-all cursor-pointer select-none ${
                          isDone ? 'bg-slate-50/70 opacity-80' : ''
                        }`}
                        title="Click anywhere to toggle task completion"
                      >
                        {/* Task Title with Checkbox & Strikethrough */}
                        <td className="py-3.5 px-4 sm:px-5 max-w-[220px]">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                                isDone
                                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-2xs'
                                  : 'border-2 border-slate-300'
                              }`}
                            >
                              {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                className={`font-extrabold truncate text-[13px] transition-all ${
                                  isDone
                                    ? 'line-through text-slate-400 font-medium decoration-emerald-500 decoration-2'
                                    : 'text-slate-900'
                                }`}
                              >
                                {task.title}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5 capitalize flex items-center gap-1 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                <span>{task.type === 'admin' ? 'Admin Assigned' : `By ${task.createdByName}`}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Assigned Staff */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-800 to-indigo-900 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-white">
                              {task.assignedToName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .substring(0, 2)}
                            </div>
                            <span className="font-bold text-slate-800 truncate max-w-[110px]">
                              {task.assignedToName}
                            </span>
                          </div>
                        </td>

                        {/* Priority Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap ${
                              task.priority === 'High'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs'
                                : task.priority === 'Medium'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs'
                                : 'bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-2xs'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                task.priority === 'High' ? 'bg-rose-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-cyan-500'
                              }`}
                            />
                            <span>{task.priority}</span>
                          </span>
                        </td>

                        {/* Prominent Target Deadline (Date & Time) */}
                        <td className="py-3.5 px-4">
                          <div className="inline-flex flex-col gap-1 items-start bg-gradient-to-r from-indigo-50/90 via-sky-50/80 to-cyan-50/90 border border-indigo-200/90 rounded-xl px-3 py-1.5 shadow-2xs">
                            <div className="flex items-center gap-1.5 text-xs font-black text-indigo-950 whitespace-nowrap">
                              <Calendar className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                              <span>{task.dueDate}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 whitespace-nowrap">
                              <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
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
                              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black cursor-pointer shadow-xs active:scale-95 transition-all ${
                                isDone
                                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-200'
                                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-200'
                              }`}
                              title="Click to toggle status"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
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
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-indigo-100/90 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Team Completion Rate
              </h3>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200">
                {completedTasks}/{totalTasks} tasks
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black font-['Outfit'] text-slate-900 tracking-tight">
              {completionRate}%
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 mt-3 overflow-hidden shadow-inner p-0.5">
              <div
                className="bg-gradient-to-r from-indigo-600 via-cyan-500 to-emerald-500 h-2 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2.5 font-bold flex items-center justify-between">
              <span className="text-emerald-700">Finished: <strong>{completedTasks}</strong></span>
              <span className="text-amber-700">Pending: <strong>{pendingTasks}</strong></span>
            </p>
          </div>

          {/* Upcoming event card - Rich Amber / Sunset Orange */}
          {eventTiming && (
            <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white rounded-2xl p-5 sm:p-6 shadow-md shadow-amber-500/20 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-100 mb-1 relative z-10">
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Special Event Schedule</span>
              </div>
              <h4 className="text-base font-black text-white mt-1 relative z-10">{eventTiming.eventName}</h4>
              <div className="flex items-center gap-2 text-xs font-bold text-white mt-2 bg-white/20 backdrop-blur-xs p-2.5 rounded-xl relative z-10">
                <Clock className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                <span>{eventTiming.date} · {eventTiming.newTiming}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-amber-100 font-bold relative z-10">
                <span>Staff Allotted:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-amber-900 font-black shadow-2xs">
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
