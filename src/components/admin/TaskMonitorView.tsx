import React, { useState } from 'react';
import { useTaskPulse } from '../../context/TaskPulseContext';
import { Info, Search } from 'lucide-react';

export const TaskMonitorView: React.FC = () => {
  const { tasks } = useTaskPulse();
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'staff'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tasks based on selected tab and search
  const filteredTasks = tasks.filter((t) => {
    // Tab filter
    if (filter === 'completed' && t.status !== 'done') return false;
    if (filter === 'pending' && t.status === 'done') return false;
    if (filter === 'staff' && t.type !== 'staff') return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.assignedToName.toLowerCase().includes(q) ||
        t.createdByName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-slate-900">Task Monitor</h1>
          <p className="text-sm text-slate-500">
            See what staff have completed and what is still pending
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks or staff..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(
          [
            { id: 'all', label: 'All' },
            { id: 'completed', label: 'Completed' },
            { id: 'pending', label: 'Pending' },
            { id: 'staff', label: 'Staff to staff' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
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
                <th className="py-3.5 px-6 font-semibold text-center">Status</th>
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
                      <td className="py-4 px-6 font-bold text-slate-800 max-w-[260px]">
                        {task.title}
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
                      <td className="py-4 px-6 text-center">
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
    </div>
  );
};
