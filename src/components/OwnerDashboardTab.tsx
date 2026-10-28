import React, { useState } from 'react';
import {
  IndianRupee,
  Users,
  UserPlus,
  TrendingUp,
  Phone,
  MessageCircle,
  Lightbulb,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  X,
} from 'lucide-react';
import {
  Student,
  Batch,
  ReferralEnquiry,
  TuitionCentreInfo,
} from '../types';
import { openWhatsApp } from '../utils/whatsapp';

interface OwnerDashboardTabProps {
  students: Student[];
  batches: Batch[];
  referrals: ReferralEnquiry[];
  centreInfo: TuitionCentreInfo;
  onOpenPitch: () => void;
  onAddReferral: (newRef: ReferralEnquiry) => void;
  onUpdateReferralStatus: (id: string, status: ReferralEnquiry['status']) => void;
  onAddStudent: (newStudent: Student) => void;
}

export const OwnerDashboardTab: React.FC<OwnerDashboardTabProps> = ({
  students,
  batches,
  referrals,
  centreInfo,
  onOpenPitch,
  onAddReferral,
  onUpdateReferralStatus,
  onAddStudent,
}) => {
  const [isAddRefOpen, setIsAddRefOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // New referral form state
  const [refParent, setRefParent] = useState('');
  const [refStudent, setRefStudent] = useState('');
  const [refClass, setRefClass] = useState('Class 10 CBSE');
  const [refPhone, setRefPhone] = useState('+91');
  const [refBy, setRefBy] = useState('');
  const [refNotes, setRefNotes] = useState('');

  // New student form state
  const [stuName, setStuName] = useState('');
  const [stuBatch, setStuBatch] = useState<any>('class-10');
  const [stuParent, setStuParent] = useState('');
  const [stuPhone, setStuPhone] = useState('+91');
  const [stuFee, setStuFee] = useState(2200);

  // Financial calculations
  const pendingStudents = students.filter(
    (s) => s.feeStatus === 'pending' || s.feeStatus === 'overdue'
  );
  const totalPendingAmount = pendingStudents.reduce(
    (sum, s) => sum + s.pendingAmount,
    0
  );
  const totalPaidAmount = students
    .filter((s) => s.feeStatus === 'paid')
    .reduce((sum, s) => sum + s.monthlyFee, 0);

  const totalRevenue = totalPaidAmount + totalPendingAmount;
  const collectionPercent =
    totalRevenue > 0 ? Math.round((totalPaidAmount / totalRevenue) * 100) : 0;

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refParent.trim() || !refStudent.trim()) return;

    const newRef: ReferralEnquiry = {
      id: `ref-${Date.now()}`,
      parentName: refParent.trim(),
      studentName: refStudent.trim(),
      targetClass: refClass,
      phone: refPhone.trim(),
      referredBy: refBy.trim() || 'Parent Referral',
      date: new Date().toISOString().split('T')[0],
      status: 'new',
      notes: refNotes.trim() || 'Inquired for tuition admission.',
    };

    onAddReferral(newRef);
    setIsAddRefOpen(false);
    setRefParent('');
    setRefStudent('');
    setRefNotes('');
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stuName.trim() || !stuParent.trim()) return;

    const newStudent: Student = {
      id: `stu-${Date.now()}`,
      name: stuName.trim(),
      rollNumber: `C${stuBatch.slice(-2)}-${students.length + 1}`,
      batchId: stuBatch,
      studentPhone: stuPhone.trim(),
      parentName: stuParent.trim(),
      parentPhone: stuPhone.trim(),
      monthlyFee: Number(stuFee),
      feeStatus: 'pending',
      pendingAmount: Number(stuFee),
      daysLate: 0,
      dueDate: new Date().toISOString().split('T')[0],
      attendancePercent: 100,
      recentAttendance: ['P', 'P', 'P'],
    };

    onAddStudent(newStudent);
    setIsAddStudentOpen(false);
    setStuName('');
    setStuParent('');
  };

  const handleWhatsAppEnquiry = (enquiry: ReferralEnquiry) => {
    const text = `Namaste ${enquiry.parentName} ji 🙏\n\nThank you for your inquiry for ${enquiry.studentName}'s admission in ${enquiry.targetClass} at ${centreInfo.name}.\n\nWe would love to invite ${enquiry.studentName} for a free demo & counseling session this week. Which day and time works best for you?\n\nWarm regards,\n${centreInfo.ownerName}\n${centreInfo.name}`;
    openWhatsApp(enquiry.phone, text);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* PITCH CALLOUT BANNER - AS REQUESTED IN PROMPT */}
      <div className="p-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-2xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full text-white">
              Owner Strategy & Selling Formula
            </span>
            <span className="text-[11px] font-medium text-amber-100">
              Live Bootcamp Bio Link 🙌
            </span>
          </div>

          <h3 className="text-sm font-extrabold text-white">
            "Owner ko kaise dikhao: Demo phone pe dikhao, 1st month free pilot do"
          </h3>

          <p className="text-xs text-amber-50 leading-relaxed">
            Pasand aaye toh: <strong>₹3,999 - ₹4,999 One-Time Setup</strong> + <strong>₹499/mo Chhota Maintenance</strong>. Tap below for the complete pitch playbook:
          </p>

          <button
            onClick={onOpenPitch}
            className="mt-2 py-2 px-3 bg-white hover:bg-amber-50 text-slate-900 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>Open Pitch Playbook & Script</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      </div>

      {/* FINANCIAL OVERVIEW: FEES COLLECTED VS PENDING */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Monthly Revenue Performance
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Fees Collected vs Pending
            </h3>
          </div>
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            {collectionPercent}% Collected
          </span>
        </div>

        {/* Visual Progress Meter */}
        <div className="space-y-1.5">
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${collectionPercent}%` }}
              className="bg-emerald-600 h-full transition-all duration-500 rounded-l-full"
              title={`Collected: ₹${totalPaidAmount}`}
            />
            <div
              style={{ width: `${100 - collectionPercent}%` }}
              className="bg-rose-500 h-full transition-all duration-500 rounded-r-full"
              title={`Pending: ₹${totalPendingAmount}`}
            />
          </div>

          <div className="flex justify-between items-center text-xs font-medium pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span className="text-slate-600">Collected:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                ₹{totalPaidAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="text-slate-600">Pending:</span>
              <span className="font-bold text-rose-600 tabular-nums">
                ₹{totalPendingAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="p-3 bg-slate-50 rounded-xl text-xs flex justify-between items-center border border-slate-100">
          <span className="text-slate-500">
            Total Expected Revenue ({students.length} Students):
          </span>
          <span className="font-extrabold text-slate-900 text-sm tabular-nums">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Students */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {students.length}
            </div>
            <span className="text-[11px] text-slate-500">
              Across {batches.length} Batches
            </span>
          </div>
          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 min-h-[36px]"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Admit Student</span>
          </button>
        </div>

        {/* New Referral Enquiries Count */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Referral Inquiries</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {referrals.length}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">
              Word-of-mouth Pipeline
            </span>
          </div>
          <button
            onClick={() => setIsAddRefOpen(true)}
            className="mt-3 text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 min-h-[36px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Enquiry</span>
          </button>
        </div>
      </div>

      {/* NEW REFERRAL ENQUIRIES TRACKER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              New Referral Enquiries ({referrals.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Follow-ups & free trial booking pipeline
            </p>
          </div>

          <button
            onClick={() => setIsAddRefOpen(true)}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 min-h-[36px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Lead</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {referrals.map((enquiry) => {
            const statusConfig = {
              new: { label: 'New Lead', bg: 'bg-blue-50 text-blue-700' },
              demo_scheduled: {
                label: 'Demo Scheduled',
                bg: 'bg-amber-50 text-amber-700',
              },
              trial_done: {
                label: 'Trial Attended',
                bg: 'bg-purple-50 text-purple-700',
              },
              enrolled: {
                label: 'Enrolled & Paid',
                bg: 'bg-emerald-50 text-emerald-700',
              },
            }[enquiry.status];

            return (
              <div key={enquiry.id} className="p-3.5 space-y-2 hover:bg-slate-50/50">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {enquiry.studentName}
                      </h4>
                      <span className="text-[10px] text-slate-500">
                        ({enquiry.targetClass})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Parent: <strong>{enquiry.parentName}</strong> · Ref by:{' '}
                      <span className="text-slate-700 font-medium">{enquiry.referredBy}</span>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={enquiry.status}
                    onChange={(e) =>
                      onUpdateReferralStatus(
                        enquiry.id,
                        e.target.value as ReferralEnquiry['status']
                      )
                    }
                    className={`text-[10px] font-bold rounded-lg px-2 py-1 border border-slate-200 focus:outline-none cursor-pointer ${statusConfig.bg}`}
                  >
                    <option value="new">New Lead</option>
                    <option value="demo_scheduled">Demo Scheduled</option>
                    <option value="trial_done">Trial Attended</option>
                    <option value="enrolled">Enrolled & Paid</option>
                  </select>
                </div>

                {/* Notes */}
                {enquiry.notes && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg italic">
                    "{enquiry.notes}"
                  </p>
                )}

                {/* Action Buttons: Call & WhatsApp */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[10px] text-slate-400">
                    Date: {enquiry.date}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${enquiry.phone}`}
                      className="p-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-1 min-h-[36px]"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>Call</span>
                    </a>

                    <button
                      onClick={() => handleWhatsAppEnquiry(enquiry)}
                      className="p-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-semibold flex items-center gap-1 min-h-[36px]"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK BATCH SUMMARY */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900">
          Tuition Batches & Timings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {batches.map((b) => (
            <div
              key={b.id}
              className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center"
            >
              <div>
                <h5 className="font-bold text-slate-900">{b.name}</h5>
                <span className="text-[11px] text-slate-500">{b.timing} · {b.days}</span>
              </div>
              <span className="text-xs font-extrabold text-slate-800 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                {b.totalStudents} Students
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Referral Enquiry Modal */}
      {isAddRefOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                New Student Referral Enquiry
              </h3>
              <button
                onClick={() => setIsAddRefOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReferral} className="p-4 space-y-3 overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  required
                  value={refStudent}
                  onChange={(e) => setRefStudent(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Parent Name & Phone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={refParent}
                    onChange={(e) => setRefParent(e.target.value)}
                    placeholder="e.g. Mr. Anil Sharma"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    required
                    value={refPhone}
                    onChange={(e) => setRefPhone(e.target.value)}
                    placeholder="+919812345678"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Target Class / Subject
                  </label>
                  <input
                    type="text"
                    value={refClass}
                    onChange={(e) => setRefClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Referred By
                  </label>
                  <input
                    type="text"
                    value={refBy}
                    onChange={(e) => setRefBy(e.target.value)}
                    placeholder="Existing parent / student"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Notes / Inquiry Requirement
                </label>
                <textarea
                  rows={2}
                  value={refNotes}
                  onChange={(e) => setRefNotes(e.target.value)}
                  placeholder="e.g. Needs maths board preparation, wants trial class on Saturday."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md min-h-[44px]"
                >
                  Save Enquiry to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Student Modal */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                New Student Admission
              </h3>
              <button
                onClick={() => setIsAddStudentOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-4 space-y-3 overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={stuName}
                  onChange={(e) => setStuName(e.target.value)}
                  placeholder="e.g. Dhruv Kapoor"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Assign Batch
                  </label>
                  <select
                    value={stuBatch}
                    onChange={(e) => setStuBatch(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.grade} - {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Monthly Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={stuFee}
                    onChange={(e) => setStuFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Parent Name & Contact
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={stuParent}
                    onChange={(e) => setStuParent(e.target.value)}
                    placeholder="Parent Full Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    required
                    value={stuPhone}
                    onChange={(e) => setStuPhone(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md min-h-[44px]"
                >
                  Confirm Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
