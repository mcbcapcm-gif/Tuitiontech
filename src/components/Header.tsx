import React from 'react';
import { Smartphone, Monitor, RotateCcw, Lightbulb } from 'lucide-react';
import { TuitionCentreInfo } from '../types';

interface HeaderProps {
  centreInfo: TuitionCentreInfo;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
  onOpenPitch: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  centreInfo,
  isMobileFrame,
  onToggleFrame,
  onOpenPitch,
  onResetData,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
            TD
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-slate-900 truncate">
                TuitionDesk
              </h1>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded shrink-0">
                India
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate leading-none">
              {centreInfo.name}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Direct APK Download Button */}
          <a
            href="/app-debug.apk"
            download="TuitionDesk-debug.apk"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors min-h-[36px] shadow-xs"
            title="Download Android APK (1.4 MB)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download APK</span>
            <span className="sm:hidden">APK</span>
          </a>

          {/* Pitch Strategy Button */}
          <button
            onClick={onOpenPitch}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-lg text-xs font-semibold transition-colors min-h-[36px]"
            title="How to show and pitch this to tuition owners"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Owner Pitch Guide</span>
            <span className="sm:hidden">Pitch</span>
          </button>

          {/* Desktop/Mobile Frame Toggle (Visible on larger screens) */}
          <button
            onClick={onToggleFrame}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors min-h-[36px]"
            title={isMobileFrame ? 'Expand to wide layout' : 'Fit to mobile phone preview'}
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>Wide</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone View</span>
              </>
            )}
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetData}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Reset to sample data"
            aria-label="Reset demo data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
