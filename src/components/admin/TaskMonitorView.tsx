import React, { useState } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import {
  Info,
  Search,
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle2,
  Filter,
  Layers,
  MousePointerClick,
  Check,
} from 'lucide-react';
import { IssueModal } from '../common/IssueModal';
import { Task } from '../../types';

export const TaskMonitorView: React.FC = () => {
  const { tasks, orgSettings, toggleTaskStatus } = useTaskToggle();
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'staff' | 'blocked'>('all');
  const [dateTimeline, setDateTimeline] = useState<'all' | 'previous' | 'today' | 'upcoming'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskForIssue, setSelectedTaskForIssue] = useState<Task | null>(null);

  const TODAY_STR = '27 Oct 2026';

  // Filter tasks based on selected tab, timeline, and search
  const filteredTasks = tasks.filter((t) => {
    // Timeline filter
    if (dateTimeline === 'today' && t.dueDate !== TODAY_STR && t.dueDate) return false;
    if (dateTimeline === 'previous' && t.dueDate && t.dueDate >= TODAY_STR) return false;
    if (dateTimeline === 'upcoming' && t.dueDate && t.dueDate <= TODAY_STR) return false;

    // Status filter
    if (filter === 'completed' && t.status !== 'done') return false;
    if (filter === 'pending' && t.status === 'done') return false;
    if (filter === 'staff' && t.type !== 'staff') return false;
    if (filter === 'blocked' && (!t.pendingReason || t.status === 'done')) return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.assignedToName.toLowerCase().includes(q) ||
        t.createdByName.toLowerCase().includes(q) ||
        (t.dueDate && t.dueDate.toLowerCase().includes(q)) ||
        (t.dueTime && t.dueTime.toLowerCase().includes(q)) ||
        (t.pendingReason && t.pendingReason.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalTasksCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const pendingCount = tasks.filter((t) => t.status !== 'done').length;
  const blockedCount = tasks.filter((t) => t.status !== 'done' && t.pendingReason).length;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Clean Corporate Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 tracking-tight">
              Central Task Monitor
            </h1>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-900 text-white shadow-2xs">
              {orgSettings.orgName} Live Feed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Complete real-time oversight of all staff assignments, due dates, and delivery timestamps
          </p>
        </div>

        {/* Enhanced Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search task, staff, date, issue..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-xs placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Quick Status KPI Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Company Tasks</div>
            <div className="text-xl font-black text-slate-900 font-['Outfit'] mt-0.5">{totalTasksCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Layers className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completed On Time</div>
            <div className="text-xl font-black text-emerald-700 font-['Outfit'] mt-0.5">{completedCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Progress / Pending</div>
            <div className="text-xl font-black text-slate-900 font-['Outfit'] mt-0.5">{pendingCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Clock className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Issues Reported</div>
            <div className="text-xl font-black text-rose-700 font-['Outfit'] mt-0.5">{blockedCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Date Timeline Filter Bar */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 ml-1">
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-xs font-bold text-slate-700 mr-1.5 shrink-0 hidden xs:inline">
            Timeline Filter:
          </span>

          {(
            [
              { id: 'all', label: 'All Dates' },
              { id: 'today', label: 'Today (27 Oct)' },
              { id: 'upcoming', label: 'Upcoming Days' },
              { id: 'previous', label: 'Previous Archives' },
            ] as const
          ).map((timeline) => (
            <button
              key={timeline.id}
              onClick={() => setDateTimeline(timeline.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                dateTimeline === timeline.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {timeline.label}
            </button>
          ))}
        </div>

        <div className="text-[11px] sm:text-xs text-slate-600 font-medium px-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-indigo-600" />
          <span>Active filter shows <strong>{filteredTasks.length}</strong> tasks</span>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {(
          [
            { id: 'all', label: 'All Tasks', count: tasks.length },
            { id: 'completed', label: 'Completed', count: completedCount },
            { id: 'pending', label: 'Pending', count: pendingCount },
            { id: 'staff', label: 'Peer Delegated', count: tasks.filter((t) => t.type === 'staff').length },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 ${
              filter === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-2xs'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                filter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}

        {/* Dedicated "Issues Reported" tab */}
        <button
          onClick={() => setFilter('blocked')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
            filter === 'blocked'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 shadow-2xs'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Issues Reported</span>
          {blockedCount > 0 && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                filter === 'blocked' ? 'bg-white text-amber-900' : 'bg-amber-200 text-amber-950'
              }`}
            >
              {blockedCount}
            </span>
          )}
        </button>
      </div>

      {/* Enterprise Tasks Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table top toolbar */}
        <div className="p-3.5 px-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              <MousePointerClick className="w-3 h-3 text-emerald-600" />
              <span>Interactive Table</span>
            </span>
            <span>Click any task row to strike & toggle completion</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Showing {filteredTasks.length} tasks
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-4 sm:px-6">Task Title & Details</th>
                <th className="py-4 px-4">Assigned Staff</th>
                <th className="py-4 px-4">Origin / Created By</th>
                <th className="py-4 px-4 text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Target Deadline</span>
                  </div>
                </th>
                <th className="py-4 px-4 text-center">Status & Issue</th>
                <th className="py-4 px-4 sm:px-6 text-right">Completion Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 font-medium italic">
                    No tasks match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isAwaitingAccept = task.type === 'staff' && task.status === 'pending';
                  const isAccepted = task.type === 'staff' && task.status === 'accepted';
                  const isDone = task.status === 'done';

                  return (
                    <tr
                      key={task.id}
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer select-none ${
                        isDone ? 'bg-slate-50/50 opacity-75' : ''
                      }`}
                      title="Click anywhere to toggle task completion"
                    >
                      {/* Task Title with Checkbox & Strikethrough */}
                      <td className="py-4 px-4 sm:px-6 max-w-[240px]">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 mt-0.5 ${
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
                            {task.description && (
                              <div
                                className={`text-[11px] truncate mt-0.5 font-normal ${
                                  isDone ? 'line-through text-slate-400/80' : 'text-slate-500'
                                }`}
                              >
                                {task.description}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span
                                className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                  task.priority === 'High'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : task.priority === 'Medium'
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {task.priority} Priority
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Staff */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                            {task.assignedToName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .substring(0, 2)}
                          </div>
                          <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                            {task.assignedToName}
                          </span>
                        </div>
                      </td>

                      {/* Given By */}
                      <td className="py-4 px-4">
                        <span className="font-medium text-slate-600 text-xs inline-flex items-center gap-1">
                          {task.type === 'admin' ? (
                            <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                              Admin
                            </span>
                          ) : (
                            <span className="font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                              {task.createdByName}
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Prominent Target Deadline */}
                      <td className="py-4 px-4">
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

                      {/* Status Column with Nearby Written Issue */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskStatus(task.id);
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                              isDone
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : isAccepted
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : isAwaitingAccept
                                ? 'bg-amber-50 text-amber-900 border border-amber-300'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                            title="Click to toggle status"
                          >
                            <span>
                              {isDone
                                ? 'Completed'
                                : isAccepted
                                ? 'Accepted'
                                : isAwaitingAccept
                                ? 'Awaiting Accept'
                                : 'Pending'}
                            </span>
                          </button>

                          {/* Nearby Issue Button that opens Easy Readable Popup */}
                          {!isDone && task.pendingReason && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTaskForIssue(task);
                              }}
                              className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer max-w-[180px] truncate"
                              title="Click to view full issue in readable popup"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span className="truncate">Issue: "{task.pendingReason}"</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Completion Log Timestamp */}
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        {task.completedAt ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{task.completedAt}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom callout note */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-700 font-medium shadow-2xs">
        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
          <Info className="w-4 h-4" />
        </div>
        <span>
          Organization wide visibility active for <strong>{orgSettings.orgName}</strong>. Every staff-assigned and peer-delegated task automatically reflects here with real-time due dates, completion logs, and pending issues.
        </span>
      </div>

      {/* Readable Issue Popup Modal */}
      <IssueModal
        task={selectedTaskForIssue}
        onClose={() => setSelectedTaskForIssue(null)}
      />
    </div>
  );
};
