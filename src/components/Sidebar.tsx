import React from 'react';
import { useTaskPulse } from '../context/TaskPulseContext';
import {
  LayoutDashboard,
  UserPlus,
  ListTodo,
  Clock,
  CheckCircle2,
  PlusCircle,
  Inbox,
  LogOut,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentUser, currentPage, setCurrentPage, logout, tasks } = useTaskPulse();

  // Calculate pending requests count for current staff member
  const pendingRequestsCount = tasks.filter(
    (t) => t.assignedTo === currentUser.id && t.type === 'staff' && t.status === 'pending'
  ).length;

  return (
    <aside className="w-60 bg-white border-r border-slate-200 min-h-[calc(100vh-61px)] p-4 flex flex-col justify-between shrink-0">
      <div>
        {/* Panel label */}
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-3">
          {currentUser.role === 'admin' ? 'Admin Panel' : 'Staff Panel'}
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {currentUser.role === 'admin' ? (
            <>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentPage === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setCurrentPage('assign')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentPage === 'assign'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Assign Task</span>
              </button>

              <button
                onClick={() => setCurrentPage('monitor')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentPage === 'monitor'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <ListTodo className="w-4 h-4" />
                <span>Task Monitor</span>
              </button>

              <button
                onClick={() => setCurrentPage('timing')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentPage === 'timing'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Timing Settings</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentPage('mytodo')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentPage === 'mytodo'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>My To-Do</span>
              </button>

              <button
                onClick={() => setCurrentPage('create')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentPage === 'create'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create To-Do</span>
              </button>

              <button
                onClick={() => setCurrentPage('requests')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentPage === 'requests'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Inbox className="w-4 h-4" />
                  <span>Requests</span>
                </div>
                {pendingRequestsCount > 0 && (
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                      currentPage === 'requests' ? 'bg-white text-indigo-700' : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Logout button at bottom */}
      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50/70 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

