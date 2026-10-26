import React, { useState } from 'react';
import { useTaskPulse } from '../../context/TaskPulseContext';
import { Info, Search, AlertTriangle, Calendar } from 'lucide-react';
import { IssueModal } from '../common/IssueModal';
import { Task } from '../../types';

export const TaskMonitorView: React.FC = () => {
  const { tasks } = useTaskPulse();
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
        (t.pendingReason && t.pendingReason.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const blockedCount = tasks.filter((t) => t.status !== 'done' && t.pendingReason).length;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-slate-900">Task Monitor</h1>
          <p className="text-sm text-slate-500">
            See all tasks, previous to-do archives, upcoming dates, and reported issues
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, staff or issues..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>
      </div>

      {/* Date Timeline Filter Bar */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-indigo-600 ml-2 mr-1" />
          <span className="text-xs font-bold text-slate-700 mr-2">Timeline:</span>

          {(
            [
              { id: 'all', label: 'All Dates' },
              { id: 'previous', label: 'Previous To-Do Lists' },
              { id: 'today', label: 'Today (24 Oct)' },
              { id: 'upcoming', label: 'Upcoming Days' },
            ] as const
          ).map((timeline) => (
            <button
              key={timeline.id}
              onClick={() => setDateTimeline(timeline.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateTimeline === timeline.id
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {timeline.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { id: 'all', label: 'All Statuses' },
            { id: 'completed', label: 'Completed' },
            { id: 'pending', label: 'Pending' },
            { id: 'staff', label: 'Staff to staff' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}

        {/* Dedicated "Issues Reported" tab */}
        <button
          onClick={() => setFilter('blocked')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'blocked'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Issues Reported</span>
          {blockedCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                filter === 'blocked' ? 'bg-white text-amber-800' : 'bg-amber-200 text-amber-950'
              }`}
            >
              {blockedCount}
            </span>
          )}
        </button>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-6 font-semibold">Task</th>
                <th className="py-3.5 px-6 font-semibold">Staff</th>
                <th className="py-3.5 px-6 font-semibold">Given by</th>
                <th className="py-3.5 px-6 font-semibold text-center">Status & Nearby Issue</th>
                <th className="py-3.5 px-6 font-semibold text-right">Completed at</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                    No tasks match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isAwaitingAccept = task.type === 'staff' && task.status === 'pending';
                  const isAccepted = task.type === 'staff' && task.status === 'accepted';
                  const isDone = task.status === 'done';

                  return (
                    <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 max-w-[260px]">
                        <div className="font-bold text-slate-800">{task.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Due: {task.dueDate} · {task.dueTime}</div>
                      </td>
                      <td className="py-4 px-6">
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
                      <td className="py-4 px-6 font-medium text-slate-600">
                        {task.type === 'admin' ? 'Admin' : task.createdByName}
                      </td>

                      {/* Status Column with Nearby Written Issue Visibility */}
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex flex-col items-center gap-1.5">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isDone
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isAccepted
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : isAwaitingAccept
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {isDone
                              ? 'Done'
                              : isAccepted
                              ? 'Accepted'
                              : isAwaitingAccept
                              ? 'Awaiting accept'
                              : 'Pending'}
                          </span>

                          {/* Nearby Issue Button that opens Easy Readable Popup */}
                          {!isDone && task.pendingReason && (
                            <button
                              type="button"
                              onClick={() => setSelectedTaskForIssue(task)}
                              className="px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer max-w-[180px] truncate"
                              title="Click to view full issue in readable popup"
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate">Issue: "{task.pendingReason}"</span>
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right font-medium text-slate-500">
                        {task.completedAt || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom callout note matching mockups */}
      <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-2.5 text-xs text-indigo-900 font-medium">
        <Info className="w-4 h-4 text-indigo-600 shrink-0" />
        <span>Admin can see everything staff complete, including tasks staff create for each other.</span>
      </div>

      {/* Readable Issue Popup Modal */}
      <IssueModal
        task={selectedTaskForIssue}
        onClose={() => setSelectedTaskForIssue(null)}
      />
    </div>
  );
};
