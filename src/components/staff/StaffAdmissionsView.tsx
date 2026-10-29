import React, { useState, useMemo } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { AddAdmissionModal } from '../common/AddAdmissionModal';
import {
  GraduationCap,
  PlusCircle,
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
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

export const StaffAdmissionsView: React.FC = () => {
  const { currentUser, admissions, deleteAdmission, setCurrentPage, orgSettings } = useTaskToggle();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');

  // Filter admissions that belong ONLY to the logged-in staff member
  const myAdmissions = useMemo(() => {
    return admissions.filter((a) => a.staffId === currentUser.id);
  }, [admissions, currentUser.id]);

  // Extract list of unique courses this staff's students enrolled in
  const uniqueCourses = useMemo(() => {
    const set = new Set(myAdmissions.map((a) => a.courseName));
    return Array.from(set);
  }, [myAdmissions]);

  // Filtered list based on search and course filter
  const filteredAdmissions = useMemo(() => {
    return myAdmissions.filter((a) => {
      const matchesSearch =
        a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.studentPhone && a.studentPhone.includes(searchQuery)) ||
        String(a.admissionNo).includes(searchQuery);

      const matchesCourse = selectedCourse === 'all' || a.courseName === selectedCourse;
      return matchesSearch && matchesCourse;
    });
  }, [myAdmissions, searchQuery, selectedCourse]);

  // Calculate top course
  const topCourse = useMemo(() => {
    if (myAdmissions.length === 0) return '—';
    const counts: Record<string, number> = {};
    myAdmissions.forEach((a) => {
      counts[a.courseName] = (counts[a.courseName] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }, [myAdmissions]);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      setCurrentPage('mytodo');
    }
  };

  const handleDelete = (admissionId: string, studentName: string) => {
    if (window.confirm(`Are you sure you want to remove admission record for ${studentName}?`)) {
      deleteAdmission(admissionId);
    }
  };

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
                My Student Admissions
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-800 border border-primary-200">
                Staff: {currentUser.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Manage all students registered under your referral at {orgSettings.orgName}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Admission</span>
        </button>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              My Total Admissions
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit'] mt-1">
              {myAdmissions.length}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              Students enrolled by you
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Top Enrolled Course
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 font-['Outfit'] mt-1 truncate max-w-[200px]" title={topCourse}>
              {topCourse}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              Highest student preference
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Latest Admission
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 font-['Outfit'] mt-1 truncate max-w-[200px]">
              {myAdmissions.length > 0 ? myAdmissions[0].studentName : 'None yet'}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              {myAdmissions.length > 0 ? `${myAdmissions[0].courseName} · ${myAdmissions[0].admissionDate}` : 'Add your first student'}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, course, phone, or #..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-xs font-semibold text-slate-800 shadow-2xs"
          />
        </div>

        {/* Course Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="all">All Courses ({myAdmissions.length})</option>
            {uniqueCourses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Admissions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredAdmissions.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 font-['Outfit']">
              {myAdmissions.length === 0 ? 'No Student Admissions Added Yet' : 'No matching admissions found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {myAdmissions.length === 0
                ? 'Start registering students you brought to the institute. Every admission is tracked with a numeric number and visible to Admin.'
                : 'Try adjusting your search query or course filter.'}
            </p>
            {myAdmissions.length === 0 && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add First Student Admission</span>
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
                  <th className="py-3 px-4">Admission Date</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Timing & Fees</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdmissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Admission # */}
                    <td className="py-3 px-4 font-mono font-black text-slate-700">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px]">
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
                            <div className="text-[10px] text-slate-400 font-medium truncate max-w-[160px]" title={adm.notes}>
                              {adm.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Course */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold text-[11px]">
                        <BookOpen className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span>{adm.courseName}</span>
                      </span>
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

                    {/* Timing & Fees */}
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

      {/* Add Admission Modal */}
      <AddAdmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultStaffId={currentUser.id}
      />
    </div>
  );
};

