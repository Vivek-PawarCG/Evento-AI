import React from 'react';
import { LayoutDashboard, Sparkles, DollarSign, CalendarDays, FileCode2 } from 'lucide-react';

export type TabId = 'dashboard' | 'ai-studio' | 'budget-vendors' | 'timeline-guests' | 'architecture';

interface TabsNavProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

export const TabsNav: React.FC<TabsNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'ai-studio', label: 'AI Concept Studio', icon: <Sparkles className="w-4 h-4" />, badge: 'GenAI' },
    { id: 'budget-vendors', label: 'Budget & Vendors', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'timeline-guests', label: 'Timeline & Guests', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'architecture', label: 'Architecture & README', icon: <FileCode2 className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full border-b border-[#27272a] bg-[#0c0c0f]/60 backdrop-blur-md sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          role="tablist"
          aria-label="Event Planner Navigation Tabs"
          className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 no-scrollbar"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#a78bfa] text-[#0a0012] font-semibold shadow-md shadow-[#a78bfa]/20'
                    : 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[#0a0012]/20 text-[#0a0012] font-bold'
                        : 'bg-[#a78bfa]/15 text-[#a78bfa] border border-[#a78bfa]/30'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
