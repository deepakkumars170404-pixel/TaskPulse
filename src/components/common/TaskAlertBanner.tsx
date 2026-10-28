import React, { useEffect } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { Bell, ShieldAlert, Users, XCircle, AlertTriangle, X, ArrowRight, Calendar, Clock } from 'lucide-react';

export const TaskAlertBanner: React.FC = () => {
  const { activeTaskAlert, dismissTaskAlert, setCurrentPage, currentUser } = useTaskToggle();

  // Auto-dismiss the popup banner after 9 seconds
  useEffect(() => {
    if (activeTaskAlert) {
      const timer = setTimeout(() => {
        dismissTaskAlert();
      }, 9000);
      return () => clearTimeout(timer);
    }
  }, [activeTaskAlert, dismissTaskAlert]);

  if (!activeTaskAlert) return null;

  const isDecline = activeTaskAlert.type === 'decline';
  const isIssue = activeTaskAlert.type === 'issue';
  const isAdmin = activeTaskAlert.type === 'admin';

  const handleActionClick = () => {
    if (isDecline) {
      setCurrentPage(currentUser.role === 'admin' ? 'monitor' : 'requests');
    } else {
      setCurrentPage(currentUser.role === 'admin' ? 'dashboard' : 'mytodo');
    }
    dismissTaskAlert();
  };

  return (
    <div className="fixed top-4 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100vw-32px)] animate-in slide-in-from-top-4 duration-200">
      <div
        className={`bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border-2 transition-all ${
          isDecline
            ? 'border-rose-400 shadow-rose-500/10'
            : isIssue
            ? 'border-amber-400 shadow-amber-500/15 ring-2 ring-amber-400/20'
            : isAdmin
            ? 'border-primary-500 shadow-primary-500/15 ring-2 ring-primary-400/20'
            : 'border-sky-400 shadow-sky-500/10'
        }`}
      >
        <div className="flex items-start gap-3.5">
          {/* Glowing Animated Icon */}
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              isDecline
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : isIssue
                ? 'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse'
                : isAdmin
                ? 'bg-primary-500 text-white animate-bounce'
                : 'bg-sky-50 text-sky-600 border border-sky-200'
            }`}
          >
            {isDecline ? (
              <XCircle className="w-5 h-5 stroke-[2.5]" />
            ) : isIssue ? (
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            ) : isAdmin ? (
              <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <Users className="w-5 h-5 stroke-[2.5]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header Badge & Dismiss Button */}
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                  isDecline
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : isIssue
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : isAdmin
                    ? 'bg-primary-100 text-primary-800 border-primary-300'
                    : 'bg-sky-100 text-sky-800 border-sky-300'
                }`}
              >
                <Bell className="w-3 h-3 animate-pulse" />
                <span>{activeTaskAlert.title}</span>
              </span>

              <button
                type="button"
                onClick={dismissTaskAlert}
                className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-all"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Task Title */}
            <h4 className="text-sm sm:text-base font-black text-slate-900 mt-2 leading-snug">
              {activeTaskAlert.taskTitle}
            </h4>

            {/* Message / Reason */}
            {activeTaskAlert.message && (
              <p className="text-xs text-slate-800 font-bold italic mt-1 bg-amber-50/70 p-2 rounded-lg border border-amber-200">
                {activeTaskAlert.message}
              </p>
            )}

            {/* From & Details */}
            <p className="text-xs text-slate-600 font-medium mt-1">
              From: <strong className="text-slate-900">{activeTaskAlert.senderName}</strong>
            </p>

            {/* Metadata Pills */}
            {(activeTaskAlert.dueDate || activeTaskAlert.dueTime) && (
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-600 flex-wrap">
                {activeTaskAlert.dueDate && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-800 border border-slate-200">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{activeTaskAlert.dueDate}</span>
                  </span>
                )}
                {activeTaskAlert.dueTime && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-800 border border-slate-200">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{activeTaskAlert.dueTime}</span>
                  </span>
                )}
                {activeTaskAlert.priority && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200">
                    {activeTaskAlert.priority} Priority
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-3.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleActionClick}
                className={`flex-1 py-2 px-3 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 ${
                  isDecline
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : isIssue
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-primary-500 hover:bg-primary-600'
                }`}
              >
                <span>{isDecline ? 'Review Rejection' : isIssue ? 'View Issue in My To-Do' : 'Open in My To-Do'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={dismissTaskAlert}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer active:scale-95 transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

