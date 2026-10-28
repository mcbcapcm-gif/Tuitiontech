import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle,
  Clock,
  CreditCard,
  BookOpen,
  Calendar,
  Phone,
  MessageCircle,
  ChevronRight,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { Student, Batch, TestItem, TuitionCentreInfo } from '../types';

interface ParentViewTabProps {
  students: Student[];
  batches: Batch[];
  tests: TestItem[];
  centreInfo: TuitionCentreInfo;
  homework: Array<{
    id: string;
    batchId: string;
    title: string;
    details: string;
    dueDate: string;
    isDone: boolean;
  }>;
  onToggleHomework: (hwId: string) => void;
  onOpenUpiModal: (student: Student) => void;
}

export const ParentViewTab: React.FC<ParentViewTabProps> = ({
  students,
  batches,
  tests,
  centreInfo,
  homework,
  onToggleHomework,
  onOpenUpiModal,
}) => {
  // Default to first pending student to showcase the "Pay by UPI" button immediately
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) || students[0];
  const studentBatch = batches.find((b) => b.id === selectedStudent?.batchId);

  // Homework for this student's batch
  const studentHw = homework.filter(
    (hw) => hw.batchId === selectedStudent?.batchId
  );

  // Latest test score for this student
  const batchTests = tests.filter((t) => t.batchId === selectedStudent?.batchId);
  const latestTest = batchTests[batchTests.length - 1];
  const studentScore = latestTest?.scores?.[selectedStudent?.id] ?? 0;
  const scorePercent = latestTest
    ? Math.round((studentScore / latestTest.maxMarks) * 100)
    : 0;

  const isFeePending =
    selectedStudent?.feeStatus === 'pending' ||
    selectedStudent?.feeStatus === 'overdue';

  return (
    <div className="space-y-4 pb-24">
      {/* Student Switcher for Demo / Parent View */}
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-sm flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
            Parent Portal Simulation
          </span>
          <span className="text-xs text-slate-300">
            Select student to preview parent experience:
          </span>
        </div>

        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="bg-slate-800 text-white font-bold text-xs rounded-xl px-2.5 py-1.5 border border-slate-700 focus:outline-none cursor-pointer max-w-[140px] truncate"
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.feeStatus === 'paid' ? 'Paid' : 'Due'})
            </option>
          ))}
        </select>
      </div>

      {/* Student Profile Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-base flex items-center justify-center border border-emerald-100 shrink-0">
              {selectedStudent.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedStudent.name}
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  {selectedStudent.rollNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {studentBatch?.name || 'Class 10'} · {studentBatch?.timing}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Institute</span>
            <span className="text-xs font-bold text-slate-800">
              {centreInfo.name}
            </span>
          </div>
        </div>
      </div>

      {/* FEE DUE CARD WITH "PAY BY UPI" BUTTON */}
      <div
        className={`p-4 rounded-2xl border shadow-sm transition-all ${
          isFeePending
            ? 'bg-gradient-to-br from-rose-50 via-white to-amber-50/30 border-rose-200'
            : 'bg-emerald-50/50 border-emerald-200'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Monthly Tuition Fee
            </span>
            {isFeePending ? (
              <div className="mt-0.5">
                <div className="text-2xl font-extrabold text-rose-600 tabular-nums">
                  ₹{selectedStudent.pendingAmount.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-rose-500 ml-1.5">
                    Due ({selectedStudent.daysLate} days late)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Due date was: {selectedStudent.dueDate}
                </p>
              </div>
            ) : (
              <div className="mt-0.5">
                <div className="text-xl font-extrabold text-emerald-700">
                  ₹{selectedStudent.monthlyFee.toLocaleString('en-IN')} Paid
                </div>
                <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  All dues cleared for this month
                </p>
              </div>
            )}
          </div>

          {isFeePending ? (
            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
              Payment Pending
            </span>
          ) : (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Active & Clear
            </span>
          )}
        </div>

        {/* PAY BY UPI PRIMARY BUTTON */}
        {isFeePending ? (
          <div className="mt-4 pt-3 border-t border-rose-100/80 space-y-2">
            <button
              onClick={() => onOpenUpiModal(selectedStudent)}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 min-h-[48px]"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Pay by UPI (₹{selectedStudent.pendingAmount.toLocaleString('en-IN')})</span>
            </button>

            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 pt-1">
              <span>Zero Convenience Fee</span>
              <span>·</span>
              <span>Instant Confirmation</span>
              <span>·</span>
              <span>GPay / PhonePe / Paytm</span>
            </div>
          </div>
        ) : (
          <div className="mt-3 pt-2 border-t border-emerald-100 flex items-center justify-between text-xs text-slate-600">
            <span>Next fee billing cycle: Nov 5, 2026</span>
            <button
              onClick={() => onOpenUpiModal(selectedStudent)}
              className="text-emerald-700 hover:underline font-semibold"
            >
              Receipt
            </button>
          </div>
        )}
      </div>

      {/* ATTENDANCE % SECTION */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              Attendance Record
            </h4>
          </div>
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            {selectedStudent.attendancePercent}% Present
          </span>
        </div>

        {/* Progress bar */}
        <div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${selectedStudent.attendancePercent}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                selectedStudent.attendancePercent >= 85
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              }`}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
            <span>22 of 24 classes attended this term</span>
            <span>Target: 85%+</span>
          </div>
        </div>

        {/* Last 6 classes status dots */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Recent classes:</span>
          <div className="flex items-center gap-1.5">
            {selectedStudent.recentAttendance.map((status, idx) => (
              <span
                key={idx}
                className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center ${
                  status === 'P'
                    ? 'bg-emerald-100 text-emerald-800'
                    : status === 'L'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {status}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* HOMEWORK & DAILY TASKS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              Daily Homework & Revision
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            {studentHw.filter((h) => h.isDone).length}/{studentHw.length} Completed
          </span>
        </div>

        {studentHw.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            No homework pending for today.
          </p>
        ) : (
          <div className="space-y-2">
            {studentHw.map((item) => (
              <div
                key={item.id}
                onClick={() => onToggleHomework(item.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  item.isDone
                    ? 'bg-slate-50 border-slate-200/80 opacity-70'
                    : 'bg-white border-blue-100 hover:border-blue-200 shadow-xs'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-slate-400 hover:text-emerald-600"
                >
                  {item.isDone ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h5
                      className={`text-xs font-bold ${
                        item.isDone
                          ? 'line-through text-slate-500'
                          : 'text-slate-900'
                      }`}
                    >
                      {item.title}
                    </h5>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        item.isDone
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {item.dueDate}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    {item.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LATEST TEST PERFORMANCE REPORT CARD */}
      {latestTest && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Latest Test Result
            </span>
            <span className="text-[11px] text-slate-500">{latestTest.date}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                {latestTest.title}
              </h4>
              <p className="text-[11px] text-slate-500">
                Subject: {latestTest.subject}
              </p>
            </div>
            <div className="text-right">
              <div className="text-base font-extrabold text-emerald-700 tabular-nums">
                {studentScore} / {latestTest.maxMarks}
              </div>
              <span className="text-[10px] font-semibold text-slate-600">
                {scorePercent}% marks
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 flex items-start gap-2 border border-slate-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              <strong>Teacher Feedback:</strong> "Shows great understanding in foundational questions. Advised to focus on speed in 4-mark questions."
            </p>
          </div>
        </div>
      )}

      {/* Direct Contact Button */}
      <div className="flex gap-2">
        <a
          href={`tel:${centreInfo.phone}`}
          className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[44px]"
        >
          <Phone className="w-4 h-4 text-slate-600" />
          <span>Call Teacher</span>
        </a>
        <a
          href={`https://api.whatsapp.com/send?phone=${centreInfo.phone.replace(
            /[^0-9]/g,
            ''
          )}&text=Namaste%20Sir%2C%20I%20have%20a%20query%20regarding%20my%20child's%20tuition%20classes.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[44px]"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
          <span>WhatsApp Query</span>
        </a>
      </div>
    </div>
  );
};
