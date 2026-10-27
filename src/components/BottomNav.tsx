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
  CalendarDays,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentUser, currentPage, setCurrentPage, tasks, setRequestViewTab } = useTaskToggle();

  const pendingRequestsCount = tasks.filter(
    (t) => t.assignedTo === currentUser.id && t.type === 'staff' && t.status === 'pending'
  ).length;

  const declinedRequestsCount = tasks.filter(
    (t) => t.createdBy === currentUser.id && t.assignedTo !== currentUser.id && t.status === 'rejected'
  ).length;

  const totalRequestsBadge = pendingRequestsCount + declinedRequestsCount;

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assign', label: 'Assign', icon: UserPlus },
    { id: 'monitor', label: 'Monitor', icon: ListTodo },
    { id: 'timing', label: 'Timing', icon: Clock },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  ] as const;

  const staffNavItems = [
    { id: 'mytodo', label: 'My To-Do', icon: CheckCircle2 },
    { id: 'create', label: 'Create', icon: PlusCircle },
    { id: 'requests', label: 'Requests', icon: Inbox, badge: totalRequestsBadge },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  ] as const;

  const navItems = currentUser.role === 'admin' ? adminNavItems : staffNavItems;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-2 transition-all"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const badgeCount = 'badge' in item ? item.badge : 0;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'requests' && declinedRequestsCount > 0 && pendingRequestsCount === 0) {
                  setRequestViewTab('sent');
                }
                setCurrentPage(item.id as any);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <div
                  className={`w-10 h-8 flex items-center justify-center rounded-xl transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs scale-105'
                      : 'text-slate-500'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                </div>

                {badgeCount !== undefined && badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs ring-2 ring-white">
                    {badgeCount}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-1 tracking-tight ${
                  isActive ? 'font-bold text-slate-900' : 'text-slate-500 font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
