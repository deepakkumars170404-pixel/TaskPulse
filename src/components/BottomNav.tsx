import React from 'react';
import { useTaskToggle } from '../context/TaskToggleContext';
import {
  LayoutDashboard,
  UserPlus,
  ListTodo,
  Clock,
  CheckCircle2,
  PlusCircle,
  Inbox,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentUser, currentPage, setCurrentPage, tasks } = useTaskToggle();

  const pendingRequestsCount = tasks.filter(
    (t) => t.assignedTo === currentUser.id && t.type === 'staff' && t.status === 'pending'
  ).length;

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assign', label: 'Assign', icon: UserPlus },
    { id: 'monitor', label: 'Monitor', icon: ListTodo },
    { id: 'timing', label: 'Timing', icon: Clock },
  ] as const;

  const staffNavItems = [
    { id: 'mytodo', label: 'My To-Do', icon: CheckCircle2 },
    { id: 'create', label: 'Create', icon: PlusCircle },
    { id: 'requests', label: 'Requests', icon: Inbox, badge: pendingRequestsCount },
  ] as const;

  const navItems = currentUser.role === 'admin' ? adminNavItems : staffNavItems;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 transition-all"
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const badgeCount = 'badge' in item ? item.badge : 0;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id as any)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <div
                  className={`w-9 h-8 flex items-center justify-center rounded-xl transition-all ${
                    isActive ? 'bg-indigo-50 text-indigo-600 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                </div>

                {badgeCount !== undefined && badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                    {badgeCount}
                  </span>
                )}
              </div>

              <span className={`text-[11px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-indigo-700' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

