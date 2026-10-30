import React, { useState } from 'react';
import { useTaskToggle } from '../../context/TaskToggleContext';
import { QuickDatePicker } from './DateTimePicker';
import { getTodayDateString } from '../../utils/dateUtils';
import { X, GraduationCap, User, BookOpen, Phone, Mail, Clock, DollarSign, FileText, Sparkles, Check } from 'lucide-react';
import { isExecutiveRole } from '../../types';

interface AddAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStaffId?: string;
}

const POPULAR_COURSES = [
  'Python Full Stack & AI',
  'Full Stack Web Development',
  'Data Science & Machine Learning',
  'UI/UX Design Masterclass',
  'Java Enterprise Architecture',
  'Cloud & DevOps Engineering',
  'Digital Marketing & Growth',
  'Cybersecurity & Ethical Hacking',
];

export const AddAdmissionModal: React.FC<AddAdmissionModalProps> = ({
  isOpen,
  onClose,
  defaultStaffId,
}) => {
  const { currentUser, users, admissions, addAdmission } = useTaskToggle();

  const [studentName, setStudentName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [admissionDate, setAdmissionDate] = useState(() => getTodayDateString());
  const [studentPhone, setStudentPhone] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [feesPaid, setFeesPaid] = useState('');
  const [batchTiming, setBatchTiming] = useState('Morning 10:00 AM');
  const [notes, setNotes] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState(() => defaultStaffId || currentUser.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  if (!isOpen) return null;

  // Next sequential numeric admission number preview
  const nextNo = admissions.reduce((max, a) => Math.max(max, a.admissionNo || 1000), 1000) + 1;

  // All available staff members for Admin selection
  const staffUsers = users.filter((u) => u.role === 'staff' || u.id === currentUser.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !courseName.trim()) return;

    setIsSubmitting(true);
    try {
      await addAdmission({
        studentName,
        courseName,
        admissionDate,
        studentPhone: studentPhone || undefined,
        studentEmail: studentEmail || undefined,
        feesPaid: feesPaid || undefined,
        batchTiming: batchTiming || undefined,
        notes: notes || undefined,
        staffId: isExecutiveRole(currentUser.role) ? selectedStaffId : currentUser.id,
      });

      setSuccessToast(true);
      setTimeout(() => {
        setSuccessToast(false);
        setIsSubmitting(false);
        onClose();
        // Reset form
        setStudentName('');
        setCourseName('');
        setStudentPhone('');
        setStudentEmail('');
        setFeesPaid('');
        setNotes('');
      }, 700);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-primary-50/60 via-white to-primary-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 font-['Outfit']">
                  Add Student Admission
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary-100 text-primary-800 border border-primary-200">
                  Admission #{nextNo}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Register student & tag course enrolled to staff member
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Student Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary-600" />
              <span>Student Full Name <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Kavitha S. or Rahul Kumar"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-semibold text-slate-900 shadow-2xs"
            />
          </div>

          {/* Course Name with quick pills */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-primary-600" />
              <span>Course Enrolled <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              required
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Type course name or choose from below..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-semibold text-slate-900 shadow-2xs"
            />
            {/* Quick popular courses pills */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {POPULAR_COURSES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCourseName(c)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    courseName === c
                      ? 'bg-primary-500 text-white border-primary-500 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Admission Date & Batch Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <QuickDatePicker
                label="Admission Date"
                value={admissionDate}
                onChange={(d) => setAdmissionDate(d)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary-600" />
                <span>Batch Timing</span>
              </label>
              <select
                value={batchTiming}
                onChange={(e) => setBatchTiming(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-semibold text-slate-900 bg-white shadow-2xs cursor-pointer"
              >
                <option value="Morning 08:00 AM - 10:00 AM">Morning 08:00 AM - 10:00 AM</option>
                <option value="Morning 10:00 AM - 12:00 PM">Morning 10:00 AM - 12:00 PM</option>
                <option value="Afternoon 02:00 PM - 04:00 PM">Afternoon 02:00 PM - 04:00 PM</option>
                <option value="Evening 04:00 PM - 06:00 PM">Evening 04:00 PM - 06:00 PM</option>
                <option value="Evening 06:00 PM - 08:00 PM">Evening 06:00 PM - 08:00 PM</option>
                <option value="Weekend Batch (Sat & Sun)">Weekend Batch (Sat & Sun)</option>
              </select>
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Student Phone Number</span>
              </label>
              <input
                type="tel"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-semibold text-slate-900 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Student Email</span>
              </label>
              <input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-semibold text-slate-900 shadow-2xs"
              />
            </div>
          </div>

          {/* Fees Paid & Staff Attribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                <span>Fees / Payment Amount</span>
              </label>
              <input
                type="text"
                value={feesPaid}
                onChange={(e) => setFeesPaid(e.target.value)}
                placeholder="e.g. ₹20,000 / Paid in Full"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-semibold text-slate-900 shadow-2xs"
              />
            </div>

            {/* Staff Attribution: Admin can attribute to any staff, Staff auto-attributes to self */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary-600" />
                <span>Admission Credited To</span>
              </label>
              {isExecutiveRole(currentUser.role) ? (
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-semibold text-slate-900 bg-white shadow-2xs cursor-pointer"
                >
                  {staffUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 flex items-center justify-between">
                  <span>{currentUser.name} (You)</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary-100 text-primary-800">
                    Logged-in Staff
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Notes / Certification / Referral Details</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Student referred by college friend, opted for fast-track syllabus..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-xs font-medium text-slate-900 shadow-2xs"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !studentName.trim() || !courseName.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-95"
            >
              {successToast ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Admission Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Register Admission #{nextNo}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

