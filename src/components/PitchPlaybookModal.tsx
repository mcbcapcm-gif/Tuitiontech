import React from 'react';
import { X, Smartphone, Gift, BadgePercent, CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react';

interface PitchPlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PitchPlaybookModal: React.FC<PitchPlaybookModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Tuition Centre Pitch Strategy</span>
            <h3 className="text-lg font-bold text-slate-900">Owner Ko Kaise Dikhayein & Sell Karein</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 text-sm text-slate-600">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-base">
              1
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-600" />
                Demo Phone Pe Dikhao (Live Experience)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Laptop mat le jao. Unke coaching centre jao aur <strong>apne mobile phone pe TuitionDesk open karke unke haath mein do</strong>. Unse bolo: <em>"Sir, bas 1-tap karke dekhiye saare defaulters ko WhatsApp fee reminder chala jaata hai."</em>
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-base">
              2
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-emerald-600" />
                Pehla Mahina Free Pilot Do (Zero Risk)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                No advance, no contract. Offer <strong>30 days 100% free pilot</strong> for their top batch (e.g. Class 10). Set up their 15-20 students in 5 minutes. Let them experience real parent appreciation and instant UPI fee collections.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold text-base">
              3
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                <BadgePercent className="w-4 h-4 text-amber-600" />
                No-Brainer Pricing Model
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                When they see results after 3 weeks:
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 mt-1 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-700">• One-time Setup & Onboarding</span>
                  <span className="font-bold text-slate-900">₹3,999 - ₹4,999</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-700">• Low Monthly Maintenance / Hosting</span>
                  <span className="font-bold text-emerald-600">₹399 - ₹499 / month</span>
                </div>
              </div>
            </div>
          </div>

          {/* The Pitch Hook */}
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Winning Pitch Line to Owner:
            </span>
            <p className="text-xs text-emerald-950 italic">
              "Sir, aapke mahine ke ₹15,000 to ₹25,000 fees late aati hai kyunki parents ko baar-baar phone karna awkward lagta hai. TuitionDesk se 1 click mein respectful WhatsApp reminder chala jaata hai with direct UPI QR. Sirf 1 student ki late fee time pe aa gayi toh yeh software free ho gaya!"
            </p>
          </div>

          {/* Key Selling Features */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top 4 Features Owners Love:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>1-Tap Bulk WhatsApp Fee Alert</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Instant Absent Alert to Parents</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>6-Test Performance Bar Chart</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Direct UPI Pay Link (Zero Cut)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Live Bootcamp: Link in Bio 🙌</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1 min-h-[44px]"
          >
            <span>Close & Try Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
