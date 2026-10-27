import React from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { Clock, CheckCircle2, X } from 'lucide-react';

export const DueReminderBanner: React.FC = () => {
  const {
    activeDueReminder,
    dismissDueReminder,
    toggleTaskStatus,
    snoozeTask,
  } = useTaskToggle();

  if (!activeDueReminder) return null;

  const { task, minutesRemaining } = activeDueReminder;

  return (
    <div className="fixed top-16 right-4 sm:right-6 z-50 max-w-sm w-[calc(100vw-32px)] bg-white border border-amber-300 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-4 duration-200">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 shadow-2xs">
          <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300">
              ⏰ Due in {minutesRemaining} min{minutesRemaining > 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={dismissDueReminder}
              className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-all"
              title="Dismiss reminder"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5 leading-snug truncate">
            {task.title}
          </h4>

          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Deadline: <strong className="text-slate-800">{task.dueTime}</strong> · {task.assignedToName}
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={() => {
                toggleTaskStatus(task.id);
                dismissDueReminder();
              }}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Strike Done</span>
            </button>

            <button
              type="button"
              onClick={() => {
                snoozeTask(task.id, 15);
                dismissDueReminder();
              }}
              className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer active:scale-95 transition-all"
              title="Snooze deadline by +15 minutes"
            >
              +15m
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

