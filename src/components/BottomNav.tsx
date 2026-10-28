import React from 'react';
import { IndianRupee, UserCheck, Award, Smartphone, LayoutDashboard } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingFeesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingFeesCount,
}) => {
  const tabs = [
    {
      id: 'fees' as ActiveTab,
      label: 'Fees',
      icon: IndianRupee,
      badge: pendingFeesCount > 0 ? pendingFeesCount : undefined,
    },
    {
      id: 'attendance' as ActiveTab,
      label: 'Attendance',
      icon: UserCheck,
    },
    {
      id: 'tests' as ActiveTab,
      label: 'Tests',
      icon: Award,
    },
    {
      id: 'parent' as ActiveTab,
      label: 'Parent View',
      icon: Smartphone,
    },
    {
      id: 'owner' as ActiveTab,
      label: 'Owner',
      icon: LayoutDashboard,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center min-h-[44px] transition-colors ${
                isActive ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 truncate max-w-full ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
