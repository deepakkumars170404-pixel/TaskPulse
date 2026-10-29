import React, { useState, useMemo } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import {
  GraduationCap,
  Search,
  Filter,
  Calendar,
  Phone,
  Mail,
  Clock,
  ArrowLeft,
  Trash2,
  BookOpen,
  Award,
  Users,
  ShieldCheck,
  UserCheck,
  Download,
  DollarSign,
  TrendingUp,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const AdmissionsManagementView: React.FC = () => {
  const { currentUser, users, admissions, deleteAdmission, setCurrentPage, orgSettings } = useTaskToggle();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');

  // List of all staff users (strictly staff members; excludes Admin from recruiter breakdown)
  const staffMembers = useMemo(() => {
    return users.filter((u) => u.role === 'staff');
  }, [users]);

  // Aggregate count of admissions per staff member (strictly staff only; Admin excluded)
  const staffStats = useMemo(() => {
    const stats: Record<string, { user: typeof staffMembers[0]; count: number; courses: Set<string> }> = {};
    staffMembers.forEach((u) => {
      stats[u.id] = { user: u, count: 0, courses: new Set() };
    });

    admissions.forEach((a) => {
      if (stats[a.staffId]) {
        stats[a.staffId].count += 1;
        stats[a.staffId].courses.add(a.courseName);
      } else {
        // Exclude admin if encountered
        const matchedUser = users.find((u) => u.id === a.staffId);
        if (matchedUser?.role === 'admin' || a.staffId.toLowerCase().includes('admin')) {
          return;
        }
        // Custom staff member
        stats[a.staffId] = {
          user: {
            id: a.staffId,
            name: a.staffName,
            email: '',
            role: 'staff',
            initials: a.staffName.slice(0, 2).toUpperCase(),
          },
          count: 1,
          courses: new Set([a.courseName]),
        };
      }
    });

    return Object.values(stats).sort((a, b) => b.count - a.count);
  }, [staffMembers, admissions, users]);

  // Unique courses across all admissions
  const uniqueCourses = useMemo(() => {
    const set = new Set(admissions.map((a) => a.courseName));
    return Array.from(set);
  }, [admissions]);

  // Filtered admissions based on active filters & search
  const filteredAdmissions = useMemo(() => {
    return admissions.filter((a) => {
      const matchesSearch =
        a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.studentPhone && a.studentPhone.includes(searchQuery)) ||
        String(a.admissionNo).includes(searchQuery);

      const matchesStaff = selectedStaffFilter === 'all' || a.staffId === selectedStaffFilter;
      const matchesCourse = selectedCourseFilter === 'all' || a.courseName === selectedCourseFilter;

      return matchesSearch && matchesStaff && matchesCourse;
    });
  }, [admissions, searchQuery, selectedStaffFilter, selectedCourseFilter]);

  // Top performing staff member
  const topStaff = staffStats[0]?.count > 0 ? staffStats[0] : null;

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      setCurrentPage('dashboard');
    }
  };

  const handleDelete = (admissionId: string, studentName: string) => {
    if (window.confirm(`Are you sure you want to remove admission record for ${studentName}?`)) {
      deleteAdmission(admissionId);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredAdmissions.length === 0) {
      alert('No admissions to export');
      return;
    }

    const headers = [
      'Admission No',
      'Student Name',
      'Course',
      'Admission Date',
      'Staff Enrolled',
      'Phone',
      'Email',
      'Batch Timing',
      'Fees Paid',
      'Notes',
    ];

    const rows = filteredAdmissions.map((a) => [
      `#${a.admissionNo}`,
      `"${a.studentName}"`,
      `"${a.courseName}"`,
      `"${a.admissionDate}"`,
      `"${a.staffName}"`,
      `"${a.studentPhone || ''}"`,
      `"${a.studentEmail || ''}"`,
      `"${a.batchTiming || ''}"`,
      `"${a.feesPaid || ''}"`,
      `"${a.notes || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TaskToggle_Admissions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Name of selected staff for filter badge
  const activeStaffName =
    selectedStaffFilter === 'all'
      ? 'All Staff'
      : staffStats.find((s) => s.user.id === selectedStaffFilter)?.user.name || 'Staff Member';

  return (
    <div className="w-full p-2.5 sm:p-4 lg:p-6 space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
            title="Return to previous page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black font-['Outfit'] text-slate-900 tracking-tight">
                Student Admissions & Staff Tracking
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary-500 text-white shadow-2xs">
                {orgSettings.orgName} Executive
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Real-time overview of course admissions registered across all staff members
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold shadow-2xs">
            <span>👁️ Admin View-Only</span>
          </span>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Card 1: Total Admissions */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Admissions
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit'] mt-1">
            {admissions.length}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Registered students across team
          </div>
        </div>

        {/* Card 2: Top Staff Recruiter */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Top Staff Recruiter
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 font-['Outfit'] mt-1 truncate" title={topStaff?.user.name}>
            {topStaff ? topStaff.user.name : '—'}
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
            {topStaff ? `${topStaff.count} admissions brought` : 'No admissions yet'}
          </div>
        </div>

        {/* Card 3: Active Courses */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Courses
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit'] mt-1">
            {uniqueCourses.length}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Courses with enrollments
          </div>
        </div>

        {/* Card 4: Contributing Staff Members */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Recruiters
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit'] mt-1">
            {staffStats.filter((s) => s.count > 0).length} <span className="text-xs text-slate-400 font-semibold">/ {staffMembers.length}</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Staff with at least 1 admission
          </div>
        </div>
      </div>

      {/* =========================================================================
          STAFF ADMISSIONS BREAKDOWN & 1-CLICK INTERACTIVE FILTER PILLS
          (Directly satisfies user requirement: "ela staff uu evalo admissionpotruknaga nu
           click pani patha entha staff ethan aadmission ku admin ku matu katanuu")
          ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-black text-slate-900 font-['Outfit'] flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-600" />
              <span>Staff Admission Breakdown · Click Any Staff to View Their Students</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Click any staff member pill below to view their specific students and admissions
            </p>
          </div>

          {selectedStaffFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedStaffFilter('all')}
              className="text-xs font-bold text-primary-600 hover:text-primary-800 underline cursor-pointer"
            >
              Reset to All Staff
            </button>
          )}
        </div>

        {/* Interactive Clickable Staff Cards/Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {/* "All Staff" Pill */}
          <button
            type="button"
            onClick={() => setSelectedStaffFilter('all')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              selectedStaffFilter === 'all'
                ? 'bg-primary-500 text-white border-primary-500 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <span>👥 All Staff</span>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                selectedStaffFilter === 'all'
                  ? 'bg-white text-primary-600'
                  : 'bg-slate-200 text-slate-800'
              }`}
            >
              {admissions.length}
            </span>
          </button>

          {/* Individual Staff Member Interactive Pills */}
          {staffStats.map((stat) => {
            const isSelected = selectedStaffFilter === stat.user.id;
            return (
              <button
                key={stat.user.id}
                type="button"
                onClick={() => setSelectedStaffFilter(stat.user.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-primary-500 text-white border-primary-500 shadow-xs ring-2 ring-primary-500/30'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs'
                }`}
                title={`Click to show ${stat.user.name}'s admissions only`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                    isSelected
                      ? 'bg-white text-primary-600'
                      : stat.user.avatarBg || 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {stat.user.initials}
                </div>
                <span>{stat.user.name}</span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-white/90 text-primary-700'
                      : stat.count > 0
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {stat.count} {stat.count === 1 ? 'adm' : 'adms'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Indicator Banner if filtering by staff */}
      {selectedStaffFilter !== 'all' && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-bold text-primary-950 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary-600" />
            <span>
              Showing only <strong>{filteredAdmissions.length}</strong> admissions enrolled by{' '}
              <strong className="underline">{activeStaffName}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedStaffFilter('all')}
            className="px-2.5 py-1 rounded-lg bg-white border border-primary-200 text-primary-700 hover:bg-primary-100 text-[11px] cursor-pointer"
          >
            Show All Staff
          </button>
        </div>
      )}

      {/* Search & Course Filter Bar */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, course, staff, or #..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-xs font-semibold text-slate-800 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="all">All Courses ({admissions.length})</option>
            {uniqueCourses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Master Admissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredAdmissions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 font-['Outfit']">
              {admissions.length === 0 ? 'No Admissions Registered Yet' : 'No admissions match current filter'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {admissions.length === 0
                ? 'Staff can register student admissions from their portal. Admin can also add admissions directly.'
                : 'Try resetting the staff filter or search criteria to view all admissions.'}
            </p>
            {admissions.length === 0 ? (
              <p className="text-xs text-primary-700 font-semibold bg-primary-50 p-3 rounded-xl border border-primary-200 inline-block">
                Staff members can register student admissions in their staff portal. Once submitted, they will automatically appear here.
              </p>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSelectedStaffFilter('all');
                  setSelectedCourseFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-primary-600 underline cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Adm #</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Course Enrolled</th>
                  <th className="py-3 px-4">Enrolled By (Staff)</th>
                  <th className="py-3 px-4">Admission Date</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Batch & Fees</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdmissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Numeric Admission # */}
                    <td className="py-3 px-4 font-mono font-black text-slate-700">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold">
                        #{adm.admissionNo}
                      </span>
                    </td>

                    {/* Student Name */}
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-700 border border-primary-100 flex items-center justify-center font-black text-[11px]">
                          {adm.studentName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{adm.studentName}</div>
                          {adm.notes && (
                            <div className="text-[10px] text-slate-400 font-medium truncate max-w-[170px]" title={adm.notes}>
                              {adm.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Course Enrolled */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold text-[11px]">
                        <BookOpen className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span>{adm.courseName}</span>
                      </span>
                    </td>

                    {/* Enrolled By (Staff Name with avatar) */}
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setSelectedStaffFilter(adm.staffId)}
                        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-primary-50 border border-slate-200 text-slate-800 hover:text-primary-800 transition-all cursor-pointer font-bold text-[11px]"
                        title={`Filter by ${adm.staffName}`}
                      >
                        <UserCheck className="w-3.5 h-3.5 text-primary-600" />
                        <span>{adm.staffName}</span>
                      </button>
                    </td>

                    {/* Admission Date */}
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      <span className="inline-flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{adm.admissionDate}</span>
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4">
                      {adm.studentPhone ? (
                        <a
                          href={`tel:${adm.studentPhone}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-700 hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{adm.studentPhone}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Batch Timing & Fees */}
                    <td className="py-3 px-4 text-[11px]">
                      <div className="font-semibold text-slate-800">{adm.batchTiming || 'Standard Batch'}</div>
                      {adm.feesPaid && (
                        <div className="text-[10px] text-emerald-700 font-bold">{adm.feesPaid}</div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(adm.id, adm.studentName)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Delete admission record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

