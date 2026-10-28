import React, { useState } from 'react';
import { X, Copy, Check, QrCode, Smartphone, Download, Share2, CheckCircle2 } from 'lucide-react';
import { generateUpiUri, generateQrMatrix } from '../utils/upi';
import { TuitionCentreInfo } from '../types';
import { copyToClipboard } from '../utils/whatsapp';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  amount: number;
  rollNumber: string;
  batchName: string;
  centreInfo: TuitionCentreInfo;
  onPaymentSuccess?: (amount: number, method: string) => void;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  studentName,
  amount,
  rollNumber,
  batchName,
  centreInfo,
  onPaymentSuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'gpay' | 'phonepe' | 'cash'>('upi');
  const [receiptId, setReceiptId] = useState('');

  if (!isOpen) return null;

  const upiUri = generateUpiUri({
    upiId: centreInfo.upiId,
    payeeName: centreInfo.upiName,
    amount: amount,
    transactionNote: `Tuition Fee - ${studentName} (${rollNumber})`,
  });

  const qrMatrix = generateQrMatrix(upiUri);

  const handleCopyVpa = async () => {
    const success = await copyToClipboard(centreInfo.upiId);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmPaid = () => {
    const generatedId = `TD-${Date.now().toString().slice(-6)}`;
    setReceiptId(generatedId);
    setPaymentDone(true);
    if (onPaymentSuccess) {
      onPaymentSuccess(amount, paymentMethod);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Fast & Secure UPI</span>
            <h3 className="text-base font-bold text-slate-900">
              {paymentDone ? 'Fee Receipt' : 'Pay Tuition Fee'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!paymentDone ? (
          <div className="p-5 space-y-5">
            {/* Amount Banner */}
            <div className="text-center p-4 bg-slate-900 text-white rounded-2xl shadow-sm">
              <span className="text-xs text-slate-400 block mb-1">Amount Payable</span>
              <div className="text-3xl font-extrabold tabular-nums tracking-tight text-white flex items-center justify-center gap-0.5">
                <span className="text-xl font-normal text-slate-300">₹</span>
                <span>{amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="mt-2 text-xs text-slate-300 flex items-center justify-center gap-1.5">
                <span>{studentName}</span>
                <span>•</span>
                <span>{batchName}</span>
              </div>
            </div>

            {/* Offline-Reliable SVG QR Code */}
            <div className="flex flex-col items-center">
              <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-sm relative group">
                <svg
                  viewBox={`0 0 ${qrMatrix.length} ${qrMatrix.length}`}
                  className="w-44 h-44 rounded-lg shape-rendering-crispEdges"
                >
                  {qrMatrix.map((row, r) =>
                    row.map((cell, c) =>
                      cell ? (
                        <rect
                          key={`${r}-${c}`}
                          x={c}
                          y={r}
                          width={1}
                          height={1}
                          fill="#0f172a"
                        />
                      ) : null
                    )
                  )}
                </svg>

                {/* Center UPI Badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-sm text-[10px] font-bold text-slate-800">
                    UPI
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5" />
                Scan with any Indian UPI App (GPay, PhonePe, Paytm)
              </span>
            </div>

            {/* Copy UPI VPA */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="truncate mr-2">
                <span className="text-[10px] text-slate-400 block">Tuition UPI ID</span>
                <span className="text-xs font-mono font-medium text-slate-800 truncate block">
                  {centreInfo.upiId}
                </span>
              </div>
              <button
                onClick={handleCopyVpa}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-1 shrink-0 min-h-[36px]"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* One-Tap App Links */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Or Pay Directly On Your Phone
              </span>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={upiUri}
                  className="flex flex-col items-center justify-center p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors min-h-[44px]"
                >
                  <span className="text-xs font-bold text-blue-600">GPay</span>
                  <span className="text-[10px] text-slate-500">Google Pay</span>
                </a>
                <a
                  href={upiUri}
                  className="flex flex-col items-center justify-center p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors min-h-[44px]"
                >
                  <span className="text-xs font-bold text-purple-600">PhonePe</span>
                  <span className="text-[10px] text-slate-500">PhonePe</span>
                </a>
                <a
                  href={upiUri}
                  className="flex flex-col items-center justify-center p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors min-h-[44px]"
                >
                  <span className="text-xs font-bold text-sky-600">Paytm</span>
                  <span className="text-[10px] text-slate-500">Paytm UPI</span>
                </a>
              </div>
            </div>

            {/* Owner simulation / Record Payment button */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={handleConfirmPaid}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate / Record Payment Received</span>
              </button>
            </div>
          </div>
        ) : (
          /* Payment Done / Digital Receipt View */
          <div className="p-5 space-y-4 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <span className="text-xs font-medium text-emerald-700">Payment Successful</span>
              <h4 className="text-xl font-bold text-slate-900 mt-0.5">
                ₹{amount.toLocaleString('en-IN')} Received
              </h4>
              <p className="text-xs text-slate-500 mt-1">Receipt #{receiptId}</p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-semibold text-slate-800">{studentName} ({rollNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Batch:</span>
                <span className="font-semibold text-slate-800">{batchName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-semibold text-slate-800">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-semibold text-slate-800">UPI ({centreInfo.upiId})</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-slate-900 font-bold">
                <span>Total Paid:</span>
                <span className="text-emerald-700">₹{amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  alert(`Digital Receipt #${receiptId} downloaded successfully.`);
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                <span>Save Receipt</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors min-h-[44px]"
              >
                <span>Done</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
