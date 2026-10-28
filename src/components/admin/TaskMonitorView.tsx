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
  ShieldCheck,
  UserCheck,
  Check,
  Layers,
  Filter,
  XCircle,
  FileText,
  UserPlus,
  Trash2,
  TrendingUp,
  Plus,
  Table as TableIcon,
  LayoutGrid,
  X,
  Sparkles,
} from 'lucide-react';
import { IssueModal } from '../common/IssueModal';
import { AddStaffModal } from './AddStaffModal';
import { AssignTaskModal } from './ExecutiveModals';
import { Task, getTaskDeclineReason } from '../../types';

export const TaskMonitorView: React.FC = () => {
  const { tasks, users, orgSettings, deleteStaffUser, deleteTask } = useTaskToggle();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskForIssue, setSelectedTaskForIssue] = useState<Task | null>(null);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // View Mode: 'cards' (Staff Workload Cards) | 'table' (Master Deliverables Table)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Global Status Filter: 'all' | 'pending' | 'completed' | 'declined'
  const [globalStatusFilter, setGlobalStatusFilter] = useState<'all' | 'pending' | 'completed' | 'declined'>('all');

  // Priority filter for table view
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

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
  const pendingCount = tasks.filter((t) => t.status !== 'done' && t.status !== 'rejected').length;
  const rejectedCount = tasks.filter((t) => t.status === 'rejected' || !!t.pendingReason).length;
  const overallRate = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 100;

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

  // Master deliverables list for table view
  const masterFilteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Exclude admin self tasks from staff monitor view
      if (t.assignedTo === 'admin_deepak' && t.type === 'self') return false;

      // Status filter
      if (globalStatusFilter === 'pending' && (t.status === 'done' || t.status === 'rejected')) return false;
      if (globalStatusFilter === 'completed' && t.status !== 'done') return false;
      if (globalStatusFilter === 'declined' && t.status !== 'rejected' && !t.pendingReason) return false;

      // Priority filter
      if (priorityFilter !== 'all' && t.priority.toLowerCase() !== priorityFilter.toLowerCase()) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesStaff = (t.assignedToName || '').toLowerCase().includes(q);
        const matchesCreator = (t.createdByName || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesStaff && !matchesCreator) return false;
      }

      return true;
    });
  }, [tasks, globalStatusFilter, priorityFilter, searchQuery]);

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5 max-w-7xl mx-auto select-none animate-in fade-in duration-200">
      {/* =========================================================================
          1. HEADER & CONTROLS
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-slate-900 tracking-tight">
              Central Task Monitor
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Cloud Sync</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Audit real-time staff workload, delivery rates, and active task progress across departments
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff or task title..."
              className="w-full pl-9 pr-7 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#4F46E5] transition-all shadow-2xs text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Add Staff Button */}
          <button
            type="button"
            onClick={() => setShowAddStaffModal(true)}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-500" />
            <span>+ Add Staff</span>
          </button>

          {/* Assign Task Button */}
          <button
            type="button"
            onClick={() => setShowAssignModal(true)}
            className="btn-primary-gradient px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Assign Task</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. KPI OVERVIEW SUMMARY (4 CARDS)
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Total Tasks */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Deliverables
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {totalTasksCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              In Database
            </span>
          </div>
        </div>

        {/* Card 2: Active Staff Team */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>Staff Roster</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-[#4F46E5]">
              {staffMembers.length}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Active Members
            </span>
          </div>
        </div>

        {/* Card 3: Overall Delivery Rate */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Delivery Rate</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-emerald-600">
              {overallRate}%
            </span>
            <span className="text-[11px] font-bold text-emerald-700">
              {completedCount}/{totalTasksCount} Done
            </span>
          </div>
        </div>

        {/* Card 4: Pending Workload */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>In Progress</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-amber-600">
              {pendingCount}
            </span>
            {rejectedCount > 0 ? (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                {rejectedCount} Issues
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-500">
                On Schedule
              </span>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. VIEW MODE & GLOBAL STATUS FILTER BAR
          ========================================================================= */}
      <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: View Mode Switcher (Cards vs Table) */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>Staff Cards ({filteredStaff.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>Deliverables Table ({masterFilteredTasks.length})</span>
          </button>
        </div>

        {/* Center: Status Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(
            [
              { id: 'all', label: 'All Tasks', count: totalTasksCount },
              { id: 'pending', label: 'In Progress', count: pendingCount },
              { id: 'completed', label: 'Completed', count: completedCount },
              { id: 'declined', label: 'Issues & Declined', count: rejectedCount },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setGlobalStatusFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                globalStatusFilter === tab.id
                  ? 'bg-[#EEF2FF] text-[#4F46E5] font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  globalStatusFilter === tab.id
                    ? 'bg-[#4F46E5] text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right Controls: Expand/Collapse in Cards mode, or Priority filter in Table mode */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {viewMode === 'cards' ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleToggleAll(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium transition-all cursor-pointer"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={() => handleToggleAll(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium transition-all cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-400">Priority:</span>
              {['all', 'High', 'Medium', 'Low'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriorityFilter(p)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                    priorityFilter.toLowerCase() === p.toLowerCase()
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          4. VIEW MODE 1: STAFF DIRECTORY CARDS (GROUPED ACCORDION VIEW)
          ========================================================================= */}
      {viewMode === 'cards' && (
        <div className="space-y-3.5">
          {filteredStaff.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-xl border border-dashed border-slate-300 space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">No Staff Members Found</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {searchQuery ? `No staff matching "${searchQuery}"` : 'Add your organization staff to start managing workloads.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStaffModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Staff Member</span>
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
              const progress = staffTotal > 0 ? Math.round((staffCompleted.length / staffTotal) * 100) : 100;
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
                  className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-150"
                >
                  {/* Staff Card Header */}
                  <div
                    onClick={() => toggleStaffExpand(staff.id)}
                    className="p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 select-none transition-colors"
                  >
                    {/* Left: Staff Avatar & Identity */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-xs font-bold uppercase shadow-2xs shrink-0">
                        {staff.initials || staff.name.slice(0, 2)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 truncate capitalize">
                            {staff.name}
                          </h3>
                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 capitalize">
                            {staff.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                          {staff.email}
                        </p>
                      </div>
                    </div>

                    {/* Right: Badges, Progress & Actions */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-start md:self-auto">
                      {/* Delivery Rate Pill */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <span className="text-[10px] text-slate-400 font-medium">Rate:</span>
                        <span className={`font-bold ${progress === 100 ? 'text-emerald-600' : 'text-[#4F46E5]'}`}>
                          {progress}%
                        </span>
                        <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden ml-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              progress === 100 ? 'bg-emerald-500' : 'bg-[#4F46E5]'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Pending Count Badge */}
                      <div
                        className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${
                          staffPending.length > 0
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {staffPending.length > 0 ? (
                          <>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <span>{staffPending.length} In Progress</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>All Done</span>
                          </>
                        )}
                      </div>

                      {/* Completed Badge */}
                      <div className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                        <span>{staffCompleted.length}/{staffTotal} Delivered</span>
                      </div>

                      {/* Issues Badge */}
                      {staffRejected.length > 0 && (
                        <span className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>{staffRejected.length} Declined</span>
                        </span>
                      )}

                      {/* Delete Staff Icon */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove staff member "${staff.name}" from ${orgSettings.orgName}?`)) {
                            deleteStaffUser(staff.id);
                          }
                        }}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                        title={`Remove ${staff.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Chevron Indicator */}
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center transition-transform">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Drilldown */}
                  {isExpanded && (
                    <div className="p-3.5 sm:p-5 bg-slate-50/70 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                      {/* Sub-Filter Tabs */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-slate-200/60">
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                          {(
                            [
                              { id: 'all', label: 'All Work', count: staffTotal },
                              { id: 'pending', label: 'In Progress', count: staffPending.length },
                              { id: 'completed', label: 'Completed', count: staffCompleted.length },
                              { id: 'declined', label: 'Issues & Declined', count: staffRejected.length + staffIssues.length },
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
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                                activeFilter === tab.id
                                  ? 'bg-[#4F46E5] text-white shadow-2xs font-bold'
                                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                              }`}
                            >
                              <span>{tab.label}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                  activeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
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
                        <div className="py-6 text-center bg-white rounded-lg border border-dashed border-slate-200 text-slate-400 text-xs">
                          No tasks found under this filter for {staff.name}.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {displayedTasks.map((task) => {
                            const isDone = task.status === 'done';
                            const isRejected = task.status === 'rejected';

                            return (
                              <div
                                key={task.id}
                                className={`p-3.5 rounded-xl border transition-all ${
                                  isDone
                                    ? 'bg-white/80 border-slate-200/80 opacity-85'
                                    : isRejected
                                    ? 'bg-rose-50/40 border-rose-200'
                                    : 'bg-white border-slate-200 shadow-2xs'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                  {/* Left Details */}
                                  <div className="space-y-1 min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4
                                        className={`text-xs sm:text-sm font-bold ${
                                          isDone ? 'line-through text-slate-400 decoration-emerald-500' : 'text-slate-900'
                                        }`}
                                      >
                                        {task.title}
                                      </h4>

                                      {/* Priority Badge */}
                                      <span
                                        className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider ${
                                          task.priority === 'High'
                                            ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                            : task.priority === 'Medium'
                                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                            : 'bg-slate-100 text-slate-600'
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
                                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                                        <Calendar className="w-3 h-3 text-[#4F46E5] shrink-0" />
                                        <span>{task.dueDate}</span>
                                        <span className="text-slate-300">•</span>
                                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span>{task.dueTime}</span>
                                      </div>

                                      {task.type === 'admin' ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#4F46E5] bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                          <ShieldCheck className="w-3 h-3" />
                                          <span>Admin Allotted</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                          <UserCheck className="w-3 h-3 text-slate-500" />
                                          <span>By Colleague: {task.createdByName}</span>
                                        </span>
                                      )}

                                      {isDone && task.completedAt && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                          <Check className="w-3 h-3 text-emerald-600" />
                                          <span>Struck at {task.completedAt}</span>
                                        </span>
                                      )}
                                    </div>

                                    {/* Declined Reason Display */}
                                    {isRejected && (
                                      <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-950 flex items-start gap-2">
                                        <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                                        <div>
                                          <span className="font-bold">Declined by {task.assignedToName}: </span>
                                          <span className="italic">"{getTaskDeclineReason(task) || 'No reason provided'}"</span>
                                        </div>
                                      </div>
                                    )}

                                    {/* Delay Reason Display */}
                                    {task.pendingReason && !isRejected && (
                                      <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2">
                                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                          <div>
                                            <span className="font-bold">Delay Reason: </span>
                                            <span>"{task.pendingReason}"</span>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => setSelectedTaskForIssue(task)}
                                          className="text-[11px] font-bold text-amber-900 underline hover:text-amber-950 shrink-0 cursor-pointer"
                                        >
                                          View Details
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* Right: Status Pill & Delete Button */}
                                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold select-none ${
                                        isDone
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : isRejected
                                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                                      }`}
                                    >
                                      {isDone ? (
                                        <>
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.4]" />
                                          <span>Completed</span>
                                        </>
                                      ) : isRejected ? (
                                        <>
                                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                          <span>Declined</span>
                                        </>
                                      ) : (
                                        <>
                                          <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                          </span>
                                          <span>In Progress</span>
                                        </>
                                      )}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() => deleteTask(task.id)}
                                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
                                      title="Delete task"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
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
      )}

      {/* =========================================================================
          5. VIEW MODE 2: MASTER DELIVERABLES TABLE (UNIFIED AUDIT FEED)
          ========================================================================= */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">STAFF MEMBER</th>
                  <th className="py-2.5 px-3">TASK DELIVERABLE</th>
                  <th className="py-2.5 px-3">PRIORITY</th>
                  <th className="py-2.5 px-3">DEADLINE</th>
                  <th className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1">
                      <span>STATUS</span>
                      <span className="text-[9px] font-normal text-slate-400 lowercase">(auto-sync)</span>
                    </span>
                  </th>
                  <th className="py-2.5 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {masterFilteredTasks.map((task, index) => {
                  const isCompleted = task.status === 'done';
                  const isRejected = task.status === 'rejected';

                  return (
                    <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* # */}
                      <td className="py-3 px-3 text-center text-[11px] font-semibold text-slate-400">
                        {index + 1}
                      </td>

                      {/* STAFF MEMBER */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[10px] font-bold uppercase shadow-2xs">
                            {task.assignedToName?.slice(0, 1) || 'S'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 capitalize">
                              {task.assignedToName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* TASK DELIVERABLE */}
                      <td className="py-3 px-3 max-w-[280px]">
                        <div className="font-semibold text-slate-900 truncate">
                          {task.title}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          {task.type === 'admin' ? (
                            <span className="text-[#4F46E5] font-medium flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              <span>Admin Allotted</span>
                            </span>
                          ) : (
                            <span>By: {task.createdByName}</span>
                          )}
                        </div>
                      </td>

                      {/* PRIORITY */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-semibold ${
                            task.priority === 'High'
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : task.priority === 'Medium'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      {/* DEADLINE */}
                      <td className="py-3 px-3 whitespace-nowrap text-[11px] text-slate-500">
                        <div className="font-medium text-slate-800">{task.dueDate}</div>
                        <div className="text-[10px] text-slate-400">By {task.dueTime}</div>
                      </td>

                      {/* STATUS */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs select-none">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.4]" />
                            <span>Completed</span>
                            {task.completedAt && (
                              <span className="text-[10px] text-emerald-600/80 font-normal">
                                • {task.completedAt}
                              </span>
                            )}
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 select-none">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Declined</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 select-none">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <span>In Progress</span>
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {task.pendingReason && (
                            <button
                              type="button"
                              onClick={() => setSelectedTaskForIssue(task)}
                              className="px-2 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold hover:bg-amber-100 cursor-pointer"
                              title="View reported issue"
                            >
                              Issue
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteTask(task.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {masterFilteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                      No deliverables match the selected filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. MODALS
          ========================================================================= */}
      {/* Delay / Decline Issues Modal */}
      <IssueModal
        task={selectedTaskForIssue}
        onClose={() => setSelectedTaskForIssue(null)}
      />

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={showAddStaffModal}
        onClose={() => setShowAddStaffModal(false)}
      />

      {/* Assign Task Modal */}
      <AssignTaskModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
      />
    </div>
  );
};
