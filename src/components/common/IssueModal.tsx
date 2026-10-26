import React from 'react';
import { AlertTriangle, X, Clock, User, Calendar } from 'lucide-react';
import { Task } from '../../types';

interface IssueModalProps {
  task: Task | null;
  onClose: () => void;
}

export const IssueModal: React.FC<IssueModalProps> = ({ task, onClose }) => {
  if (!task || !task.pendingReason) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden transform animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-b border-amber-200/90 px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-amber-950">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black leading-tight font-['Outfit']">Reported Task Issue</h3>
              <p className="text-[11px] text-amber-800 font-semibold">Submitted by staff for immediate Admin review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Task and Assignee Meta */}
          <div className="bg-gradient-to-r from-slate-50 to-indigo-50/40 rounded-2xl p-4 border border-indigo-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                Task Title
              </span>
              <span className="font-black text-slate-900 text-sm">{task.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-slate-700 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs font-bold">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>{task.assignedToName}</span>
              </div>
            </div>
          </div>

          {/* Prominent Target Deadline (Date & Time) */}
          <div className="flex items-center gap-2 bg-indigo-50/70 border border-indigo-100 rounded-xl px-3.5 py-2 text-xs font-black text-indigo-950">
            <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Target Deadline: {task.dueDate}</span>
            <span className="text-indigo-300">•</span>
            <Clock className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>By {task.dueTime}</span>
          </div>

          {/* Large Readable Issue Box */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
              Reason Written by Staff
            </label>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 text-amber-950 font-semibold text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-inner">
              "{task.pendingReason}"
            </div>
          </div>

          {/* Timestamp footer */}
          {task.pendingReasonUpdatedAt && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Reported to Admin at: {task.pendingReasonUpdatedAt}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-5 sm:px-6 py-3.5 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
