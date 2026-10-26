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
  UserCheck,
} from 'lucide-react';
import { IssueModal } from '../common/IssueModal';
import { Task } from '../../types';

export const TaskMonitorView: React.FC = () => {
  const { tasks } = useTaskToggle();
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'staff' | 'blocked'>('all');
  const [dateTimeline, setDateTimeline] = useState<'all' | 'previous' | 'today' | 'upcoming'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskForIssue, setSelectedTaskForIssue] = useState<Task | null>(null);

  const TODAY_STR = '24 Oct 2026';

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
        (t.pendingReason && t.pendingReason.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const blockedCount = tasks.filter((t) => t.status !== 'done' && t.pendingReason).length;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-slate-900 tracking-tight">
            Central Task Monitor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Complete real-time oversight of all staff assignments, due dates, and delivery timestamps
          </p>
        </div>

        {/* Enhanced Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by task, staff, date, or issue..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/90 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-xs placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Date Timeline Filter Bar (Horizontal scroll on mobile) */}
      <div className="bg-white/95 backdrop-blur-xs p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 ml-1">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-700 mr-1.5 shrink-0 hidden xs:inline">
            Timeline Filter:
          </span>

          {(
            [
              { id: 'all', label: 'All Dates' },
              { id: 'today', label: 'Today (24 Oct)' },
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

        <div className="text-[11px] sm:text-xs text-slate-500 font-medium px-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-indigo-500" />
          <span>Active filter shows <strong>{filteredTasks.length}</strong> tasks</span>
        </div>
      </div>

      {/* Status Filter Tabs (Horizontal scroll on mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {(
          [
            { id: 'all', label: 'All Tasks', count: tasks.length },
            { id: 'completed', label: 'Completed', count: tasks.filter(t => t.status === 'done').length },
            { id: 'pending', label: 'Pending', count: tasks.filter(t => t.status !== 'done').length },
            { id: 'staff', label: 'Peer Delegated', count: tasks.filter(t => t.type === 'staff').length },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 ${
              filter === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
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
              : 'bg-amber-50 text-amber-900 hover:bg-amber-100/80 border border-amber-200 shadow-2xs'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Issues Reported</span>
          {blockedCount > 0 && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                filter === 'blocked' ? 'bg-white text-amber-800' : 'bg-amber-200 text-amber-950'
              }`}
            >
              {blockedCount}
            </span>
          )}
        </button>
      </div>

      {/* High-End Enterprise Tasks Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 sm:px-6 font-bold">Task Title</th>
                <th className="py-3.5 px-4 font-bold">Assigned Staff</th>
                <th className="py-3.5 px-4 font-bold">Created By</th>
                {/* Prominent Target Deadline (Date & Time) */}
                <th className="py-3.5 px-4 font-bold text-indigo-950">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Target Deadline (Date & Time)</span>
                  </div>
                </th>
                <th className="py-3.5 px-4 font-bold text-center">Status & Issues</th>
                <th className="py-3.5 px-4 sm:px-6 font-bold text-right">Completion Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400 italic">
                    No tasks match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isAwaitingAccept = task.type === 'staff' && task.status === 'pending';
                  const isAccepted = task.type === 'staff' && task.status === 'accepted';
                  const isDone = task.status === 'done';

                  return (
                    <tr key={task.id} className="hover:bg-indigo-50/20 transition-colors">
                      {/* Task Title */}
                      <td className="py-4 px-4 sm:px-6 max-w-[220px]">
                        <div className="font-bold text-slate-900 truncate text-[13px]">{task.title}</div>
                        {task.description && (
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">{task.description}</div>
                        )}
                      </td>

                      {/* Staff */}
                      <td className="py-4 px-4">
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

                      {/* Given By */}
                      <td className="py-4 px-4">
                        <span className="font-medium text-slate-600 text-xs inline-flex items-center gap-1">
                          {task.type === 'admin' ? (
                            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                              Admin
                            </span>
                          ) : (
                            <span>{task.createdByName}</span>
                          )}
                        </span>
                      </td>

                      {/* Prominent Target Deadline (Date & Time) */}
                      <td className="py-4 px-4">
                        <div className="inline-flex flex-col gap-1 items-start bg-indigo-50/80 border border-indigo-100/90 rounded-xl px-3 py-1.5 shadow-2xs">
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

                      {/* Status Column with Nearby Written Issue */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${
                              isDone
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs'
                                : isAccepted
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : isAwaitingAccept
                                ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isDone ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                            <span>
                              {isDone
                                ? 'Completed'
                                : isAccepted
                                ? 'Accepted'
                                : isAwaitingAccept
                                ? 'Awaiting Accept'
                                : 'Pending'}
                            </span>
                          </span>

                          {/* Nearby Issue Button that opens Easy Readable Popup */}
                          {!isDone && task.pendingReason && (
                            <button
                              type="button"
                              onClick={() => setSelectedTaskForIssue(task)}
                              className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs max-w-[170px] truncate"
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
                          <span className="text-slate-400 font-semibold text-xs">—</span>
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
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/70 to-slate-50 border border-indigo-100/80 flex items-center gap-3 text-xs text-indigo-900 font-medium shadow-2xs">
        <Info className="w-4 h-4 text-indigo-600 shrink-0" />
        <span>
          Admin visibility is active across all company departments. Every staff-assigned and peer-delegated task automatically reflects here with real-time due dates.
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
