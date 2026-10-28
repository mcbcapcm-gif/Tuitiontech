import React, { useState } from 'react';
import {
  Send,
  MessageCircle,
  CheckCircle,
  Search,
  Filter,
  Check,
  X,
  CreditCard,
  Copy,
  ExternalLink,
  Users,
} from 'lucide-react';
import { Student, Batch, TuitionCentreInfo } from '../types';
import {
  openWhatsApp,
  generateFeeReminderText,
  copyToClipboard,
} from '../utils/whatsapp';

interface FeesTabProps {
  students: Student[];
  batches: Batch[];
  centreInfo: TuitionCentreInfo;
  onMarkPaid: (studentId: string, amount: number) => void;
  onOpenUpiModal: (student: Student) => void;
}

export const FeesTab: React.FC<FeesTabProps> = ({
  students,
  batches,
  centreInfo,
  onMarkPaid,
  onOpenUpiModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBatch, setFilterBatch] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid'>('all');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [copiedAll, setCopiedAll] = useState(false);

  // Compute pending fees statistics
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

  // Filter students based on UI selections
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBatch =
      filterBatch === 'all' || student.batchId === filterBatch;

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'pending' &&
        (student.feeStatus === 'pending' || student.feeStatus === 'overdue')) ||
      (filterStatus === 'paid' && student.feeStatus === 'paid');

    return matchesSearch && matchesBatch && matchesStatus;
  });

  // Handle single WhatsApp reminder
  const handleSendSingleReminder = (student: Student) => {
    const batch = batches.find((b) => b.id === student.batchId);
    const text = generateFeeReminderText({
      studentName: student.name,
      parentName: student.parentName,
      batchName: batch?.name || student.batchId,
      pendingAmount: student.pendingAmount,
      daysLate: student.daysLate,
      dueDate: student.dueDate,
      centreName: centreInfo.name,
      upiId: centreInfo.upiId,
    });

    openWhatsApp(student.parentPhone, text);
  };

  // Handle Copy All Messages in bulk modal
  const handleCopyAllMessages = async () => {
    const compiled = pendingStudents
      .map((student, idx) => {
        const batch = batches.find((b) => b.id === student.batchId);
        const text = generateFeeReminderText({
          studentName: student.name,
          parentName: student.parentName,
          batchName: batch?.name || student.batchId,
          pendingAmount: student.pendingAmount,
          daysLate: student.daysLate,
          dueDate: student.dueDate,
          centreName: centreInfo.name,
          upiId: centreInfo.upiId,
        });
        return `[#${idx + 1} - To: ${student.parentName} (${student.parentPhone})]\n${text}\n--------------------`;
      })
      .join('\n\n');

    const success = await copyToClipboard(compiled);
    if (success) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner KPI Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs text-slate-400 font-medium">Fee Collection Status</span>
            <div className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight mt-0.5 text-white">
              ₹{totalPendingAmount.toLocaleString('en-IN')}
              <span className="text-xs font-normal text-rose-300 ml-2">
                Pending ({pendingStudents.length} Students)
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-medium">Collected</span>
            <div className="text-base font-bold text-emerald-400 tabular-nums">
              ₹{totalPaidAmount.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Primary Action Button: WhatsApp Reminder to ALL */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              setCurrentQueueIndex(0);
              setIsBulkModalOpen(true);
            }}
            disabled={pendingStudents.length === 0}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 min-h-[48px]"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Send WhatsApp Reminder to All ({pendingStudents.length} Pending)</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, roll no, or parent..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
          />
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap min-h-[36px] transition-colors ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Students ({students.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap min-h-[36px] transition-colors flex items-center gap-1 ${
              filterStatus === 'pending'
                ? 'bg-rose-600 text-white'
                : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
            }`}
          >
            Pending Fees ({pendingStudents.length})
          </button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap min-h-[36px] transition-colors ${
              filterStatus === 'paid'
                ? 'bg-emerald-700 text-white'
                : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Paid ({students.filter((s) => s.feeStatus === 'paid').length})
          </button>
        </div>

        {/* Batch Filter Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <span className="text-slate-400 text-[11px] ml-auto">
            Showing {filteredStudents.length} of {students.length}
          </span>
        </div>
      </div>

      {/* Student Fee List */}
      <div className="space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-500">
            <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs">No students match this filter.</p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const batch = batches.find((b) => b.id === student.batchId);
            const isPending =
              student.feeStatus === 'pending' || student.feeStatus === 'overdue';

            return (
              <div
                key={student.id}
                className={`bg-white rounded-2xl border p-4 shadow-sm transition-all ${
                  isPending
                    ? student.daysLate > 15
                      ? 'border-rose-200 ring-1 ring-rose-100'
                      : 'border-slate-200'
                    : 'border-slate-200 opacity-90'
                }`}
              >
                {/* Row Header */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {student.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        {student.rollNumber}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      <span>{batch?.name || student.batchId}</span>
                      <span className="mx-1.5 text-slate-300">·</span>
                      <span>{student.parentName}</span>
                    </div>
                  </div>

                  {/* Fee Status Badge / Amount */}
                  <div className="text-right">
                    {isPending ? (
                      <div>
                        <div className="text-sm font-bold text-rose-600 tabular-nums">
                          ₹{student.pendingAmount.toLocaleString('en-IN')} Due
                        </div>
                        <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                          {student.daysLate} days late
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-bold text-emerald-600 tabular-nums">
                          ₹{student.monthlyFee.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 mt-0.5">
                          <Check className="w-3 h-3" /> Paid
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Overdue Alert Bar if late */}
                {isPending && student.daysLate > 0 && (
                  <div className="mt-3 p-2 bg-slate-50 rounded-xl text-[11px] text-slate-600 flex justify-between items-center">
                    <span>
                      Due date was <strong>{student.dueDate}</strong>
                    </span>
                    <span className="text-slate-400">
                      Fee: ₹{student.monthlyFee}/mo
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isPending ? (
                    <>
                      {/* Individual WhatsApp button */}
                      <button
                        onClick={() => handleSendSingleReminder(student)}
                        className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                        <span>Send WhatsApp</span>
                      </button>

                      {/* Pay via UPI Modal */}
                      <button
                        onClick={() => onOpenUpiModal(student)}
                        className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1 min-h-[44px]"
                        title="Show UPI QR Code"
                      >
                        <CreditCard className="w-4 h-4 text-slate-500" />
                        <span>UPI QR</span>
                      </button>

                      {/* Quick Mark Paid */}
                      <button
                        onClick={() => onMarkPaid(student.id, student.pendingAmount)}
                        className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 min-h-[44px]"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Paid</span>
                      </button>
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-between text-xs text-slate-500">
                      <span>Last cleared on {student.lastPaymentDate || 'recent date'}</span>
                      <button
                        onClick={() => onOpenUpiModal(student)}
                        className="text-emerald-700 hover:underline font-semibold flex items-center gap-1 min-h-[36px]"
                      >
                        <span>View Receipt / QR</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bulk WhatsApp Reminder Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 fill-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Bulk WhatsApp Fee Reminder
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {pendingStudents.length} parents with overdue fees
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List / Stepper */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
                💡 <strong>Instant 1-Click Dispatch:</strong> Tap "Open in WhatsApp" for each parent to launch their chat with their personalized name, pending fee & UPI details pre-filled.
              </div>

              {pendingStudents.map((student, idx) => {
                const batch = batches.find((b) => b.id === student.batchId);
                return (
                  <div
                    key={student.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {student.name}
                        </span>
                        <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.2 rounded">
                          {student.daysLate}d late
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {student.parentName} · {student.parentPhone}
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-1">
                        ₹{student.pendingAmount.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSendSingleReminder(student)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shrink-0 min-h-[44px]"
                    >
                      <span>Send</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
              <button
                onClick={handleCopyAllMessages}
                className="w-full py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>All {pendingStudents.length} Messages Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copy All Pre-formatted Messages</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="w-full py-2 text-slate-500 text-xs font-medium hover:text-slate-800 text-center min-h-[36px]"
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
