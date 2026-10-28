import React, { useState, useMemo } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import {
  Users,
  Search,
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  UserCheck,
  Check,
  Layers,
  Filter,
  XCircle,
  FileText,
  UserPlus,
  Trash2,
} from 'lucide-react';
import { IssueModal } from '../common/IssueModal';
import { AddStaffModal } from './AddStaffModal';
import { Task, User, getTaskDeclineReason } from '../../types';

export const TaskMonitorView: React.FC = () => {
  const { tasks, users, orgSettings, deleteStaffUser } = useTaskToggle();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskForIssue, setSelectedTaskForIssue] = useState<Task | null>(null);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

  // Expanded staff members (track which staff cards are currently open)
  const [expandedStaffIds, setExpandedStaffIds] = useState<Record<string, boolean>>({});

  // Filter inside expanded staff member's tasks: 'all' | 'pending' | 'completed' | 'declined'
  const [staffTaskFilters, setStaffTaskFilters] = useState<Record<string, 'all' | 'pending' | 'completed' | 'declined'>>({});

  // Get all staff members from users list
  const staffMembers = useMemo(() => {
    return users.filter((u) => u.role === 'staff');
  }, [users]);

  // Toggle staff card accordion
  const toggleStaffExpand = (staffId: string) => {
    setExpandedStaffIds((prev) => ({
      ...prev,
      [staffId]: !prev[staffId],
    }));
  };

  // Expand or collapse all staff
  const handleToggleAll = (expand: boolean) => {
    const updated: Record<string, boolean> = {};
    staffMembers.forEach((s) => {
      updated[s.id] = expand;
    });
    setExpandedStaffIds(updated);
  };

  // Overall organization metrics
  const totalTasksCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const pendingCount = tasks.filter((t) => t.status !== 'done').length;
  const rejectedCount = tasks.filter((t) => t.status === 'rejected').length;

  // Filter staff by search query (matches staff name, email, or any task title they have)
  const filteredStaff = useMemo(() => {
    if (!searchQuery.trim()) return staffMembers;
    const q = searchQuery.toLowerCase();

    return staffMembers.filter((staff) => {
      const nameMatch = staff.name.toLowerCase().includes(q);
      const emailMatch = staff.email.toLowerCase().includes(q);
      const taskMatch = tasks.some(
        (t) =>
          t.assignedTo === staff.id &&
          (t.title.toLowerCase().includes(q) ||
            (t.pendingReason && t.pendingReason.toLowerCase().includes(q)) ||
            (t.rejectReason && t.rejectReason.toLowerCase().includes(q)))
      );
      return nameMatch || emailMatch || taskMatch;
    });
  }, [staffMembers, tasks, searchQuery]);

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-slate-900 tracking-tight">
              Central Task Monitor
            </h1>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-600 text-white shadow-xs">
              {orgSettings.orgName} Live Staff Feed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Staff-first directory: View each staff member's pending workload count, then click to drill down into their tasks
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff name or task title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-xs placeholder:text-slate-400 font-medium"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAddStaffModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Staff</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Assigned Tasks</div>
            <div className="text-2xl font-black text-slate-900 font-['Outfit'] mt-0.5">{totalTasksCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Staff Members</div>
            <div className="text-2xl font-black text-blue-700 font-['Outfit'] mt-0.5">{staffMembers.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Tasks</div>
            <div className="text-2xl font-black text-amber-700 font-['Outfit'] mt-0.5">{pendingCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Finished by Staff</div>
            <div className="text-2xl font-black text-emerald-700 font-['Outfit'] mt-0.5">{completedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Staff Directory Bar & Controls */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 font-['Outfit']">
            Staff Workload Directory ({filteredStaff.length} Members)
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleToggleAll(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={() => handleToggleAll(false)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Staff Accordion Cards List */}
      <div className="space-y-4">
        {filteredStaff.length === 0 ? (
          <div className="p-10 sm:p-14 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 font-['Outfit']">No Staff Members Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery ? `No staff matching "${searchQuery}"` : 'All demo staff names and tasks have been cleared. Add your real organization staff to start managing and assigning work!'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddStaffModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all inline-flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Your First Staff</span>
            </button>
          </div>
        ) : (
          filteredStaff.map((staff) => {
            const isExpanded = !!expandedStaffIds[staff.id];
            const staffTasks = tasks.filter((t) => t.assignedTo === staff.id);
            const staffPending = staffTasks.filter((t) => t.status !== 'done' && t.status !== 'rejected');
            const staffCompleted = staffTasks.filter((t) => t.status === 'done');
            const staffRejected = staffTasks.filter((t) => t.status === 'rejected');
            const staffIssues = staffTasks.filter((t) => t.status !== 'done' && t.pendingReason);

            const staffTotal = staffTasks.length;
            const progress = staffTotal > 0 ? Math.round((staffCompleted.length / staffTotal) * 100) : 0;
            const activeFilter = staffTaskFilters[staff.id] || 'all';

            // Filter tasks for this staff member based on active sub-tab
            const displayedTasks = staffTasks.filter((t) => {
              if (activeFilter === 'pending') return t.status !== 'done' && t.status !== 'rejected';
              if (activeFilter === 'completed') return t.status === 'done';
              if (activeFilter === 'declined') return t.status === 'rejected' || !!t.pendingReason;
              return true;
            });

            return (
              <div
                key={staff.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200"
              >
                {/* Staff Member Card Header (Click to Expand / Collapse) */}
                <div
                  onClick={() => toggleStaffExpand(staff.id)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 select-none transition-colors border-b border-transparent"
                >
                  {/* Left: Staff Avatar & Identity */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-xs shrink-0 ${
                        staff.avatarBg || 'bg-blue-600'
                      }`}
                    >
                      {staff.initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 font-['Outfit'] truncate">
                          {staff.name}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                          {staff.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{staff.email}</p>
                    </div>
                  </div>

                  {/* Right: Pending Count Badge & Progress */}
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 self-start md:self-auto">
                    {/* PENDING COUNT BADGE (Prominently displayed) */}
                    <div
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shadow-2xs ${
                        staffPending.length > 0
                          ? 'bg-amber-50 text-amber-900 border-amber-300 animate-in fade-in'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {staffPending.length > 0 ? (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{staffPending.length} Pending</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>0 Pending (All Done)</span>
                        </>
                      )}
                    </div>

                    {/* Finished Count Badge */}
                    <div className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                      <span>{staffCompleted.length}/{staffTotal} Finished</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-24 hidden lg:flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            progress === 100 ? 'bg-emerald-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Issues / Declined indicators */}
                    {staffRejected.length > 0 && (
                      <span className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold flex items-center gap-1" title="Declined requests">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        <span>{staffRejected.length} Declined</span>
                      </span>
                    )}

                    {staffIssues.length > 0 && (
                      <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold flex items-center gap-1" title="Reported delays / issues">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>{staffIssues.length} Issues</span>
                      </span>
                    )}

                    {/* Remove Staff Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remove staff member "${staff.name}" from ${orgSettings.orgName}?`)) {
                          deleteStaffUser(staff.id);
                        }
                      }}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                      title={`Remove ${staff.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Chevron Expand Indicator */}
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center transition-transform">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* =========================================================================
                    EXPANDED TASKS DRILLDOWN: Displayed ONLY after clicking the staff name
                    ========================================================================= */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 bg-slate-50/50 border-t border-slate-200 space-y-4 animate-in fade-in duration-200">
                    {/* Sub-Filter Tabs for this Staff Member */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {(
                          [
                            { id: 'all', label: 'All Tasks', count: staffTotal },
                            { id: 'pending', label: 'Pending', count: staffPending.length },
                            { id: 'completed', label: 'Completed', count: staffCompleted.length },
                            { id: 'declined', label: 'Declined & Issues', count: staffRejected.length + staffIssues.length },
                          ] as const
                        ).map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() =>
                              setStaffTaskFilters((prev) => ({
                                ...prev,
                                [staff.id]: tab.id,
                              }))
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                              activeFilter === tab.id
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            <span>{tab.label}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                                activeFilter === tab.id
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {tab.count}
                            </span>
                          </button>
                        ))}
                      </div>

                      <span className="text-[11px] text-slate-400 font-medium">
                        Showing {displayedTasks.length} tasks for {staff.name}
                      </span>
                    </div>

                    {/* Tasks List */}
                    {displayedTasks.length === 0 ? (
                      <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                        No tasks found under this filter for {staff.name}.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {displayedTasks.map((task) => {
                          const isDone = task.status === 'done';
                          const isRejected = task.status === 'rejected';

                          return (
                            <div
                              key={task.id}
                              className={`p-4 rounded-xl border transition-all ${
                                isDone
                                  ? 'bg-white/70 border-slate-200 opacity-80'
                                  : isRejected
                                  ? 'bg-rose-50/40 border-rose-200'
                                  : 'bg-white border-slate-200 shadow-xs'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                {/* Title and Metadata */}
                                <div className="space-y-1.5 min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4
                                      className={`text-sm font-bold ${
                                        isDone
                                          ? 'line-through text-slate-400 decoration-emerald-500 decoration-2'
                                          : 'text-slate-900'
                                      }`}
                                    >
                                      {task.title}
                                    </h4>

                                    {/* Priority Badge */}
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                        task.priority === 'High'
                                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                          : 'bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      {task.priority} Priority
                                    </span>
                                  </div>

                                  {task.description && (
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                      {task.description}
                                    </p>
                                  )}

                                  {/* Badges: Target Deadline & Sender */}
                                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-medium text-slate-600">
                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[11px]">
                                      <Calendar className="w-3 h-3 text-blue-600 shrink-0" />
                                      <span>{task.dueDate}</span>
                                      <span className="text-slate-300">•</span>
                                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span>{task.dueTime}</span>
                                    </div>

                                    {task.type === 'admin' ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                                        <ShieldAlert className="w-3 h-3" />
                                        <span>From Admin ({orgSettings.orgName})</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                                        <UserCheck className="w-3 h-3" />
                                        <span>From Colleague: {task.createdByName}</span>
                                      </span>
                                    )}

                                    {isDone && task.completedAt && (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        <span>Struck done at {task.completedAt}</span>
                                      </span>
                                    )}
                                  </div>

                                  {/* Declined Reason Display (Visible to Admin & Work Giver) */}
                                  {isRejected && (
                                    <div className="mt-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 flex items-start gap-2">
                                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                      <div>
                                        <span className="font-bold">Why {task.assignedToName} Declined: </span>
                                        <span className="font-semibold italic">"{getTaskDeclineReason(task) || 'No message provided'}"</span>
                                        {task.rejectedAt && (
                                          <span className="text-[10px] text-rose-700 ml-2 font-medium">
                                            (Declined at {task.rejectedAt})
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Delay Reason Display */}
                                  {task.pendingReason && !isRejected && (
                                    <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start justify-between gap-2">
                                      <div className="flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                        <div>
                                          <span className="font-bold">Delay Reason to Admin: </span>
                                          <span>"{task.pendingReason}"</span>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setSelectedTaskForIssue(task)}
                                        className="text-[11px] font-bold text-amber-900 underline hover:text-amber-950 shrink-0 cursor-pointer"
                                      >
                                        View Full
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Read-Only Status Indicator (Admin cannot strike staff tasks) */}
                                <div className="shrink-0 self-start sm:self-auto">
                                  <div
                                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                                      isDone
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : isRejected
                                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                                        : 'bg-amber-50 text-amber-800 border-amber-200'
                                    }`}
                                  >
                                    {isDone ? (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Done by Staff</span>
                                      </>
                                    ) : isRejected ? (
                                      <>
                                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                        <span>Declined</span>
                                      </>
                                    ) : (
                                      <>
                                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                                        <span>Pending Action</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Popup for Delay Issues */}
      <IssueModal
        task={selectedTaskForIssue}
        onClose={() => setSelectedTaskForIssue(null)}
      />

      {/* Add Staff Member Modal */}
      <AddStaffModal
        isOpen={showAddStaffModal}
        onClose={() => setShowAddStaffModal(false)}
      />
    </div>
  );
};
