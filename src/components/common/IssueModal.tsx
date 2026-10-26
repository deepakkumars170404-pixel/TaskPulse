import React from 'react';
import { AlertTriangle, X, Clock, User } from 'lucide-react';
import { Task } from '../../types';

interface IssueModalProps {
  task: Task | null;
  onClose: () => void;
}

export const IssueModal: React.FC<IssueModalProps> = ({ task, onClose }) => {
  if (!task || !task.pendingReason) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-amber-500/10 border-b border-amber-200/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-amber-900">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">Reported Pending Issue</h3>
              <p className="text-[11px] text-amber-800 font-medium">Submitted by staff for Admin review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Task and Assignee Meta */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">
                Task Name
              </span>
              <span className="font-bold text-slate-900 text-sm">{task.title}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-800">{task.assignedToName}</span>
            </div>
          </div>

          {/* Large Readable Issue Box */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Reason Written by Staff
            </label>
            <div className="bg-amber-50/80 border-2 border-amber-300/80 rounded-xl p-4 text-amber-950 font-medium text-sm sm:text-base leading-relaxed whitespace-pre-wrap shadow-inner">
              "{task.pendingReason}"
            </div>
          </div>

          {/* Timestamp footer */}
          {task.pendingReasonUpdatedAt && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Reported at: {task.pendingReasonUpdatedAt}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
