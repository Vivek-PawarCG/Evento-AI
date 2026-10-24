import React from 'react';
import { EventPlan } from '../types/event';
import { calculateDaysRemaining } from '../utils/budgetCalculator';
import { Sparkles, Calendar, Plus, Key, Clock, Trash2, RotateCcw } from 'lucide-react';

interface NavbarProps {
  events: EventPlan[];
  currentEvent: EventPlan | null;
  onSelectEvent: (eventId: string) => void;
  onOpenNewEventModal: () => void;
  onOpenApiKeyModal: () => void;
  onOpenExportModal: () => void;
  onDeleteCurrentEvent: () => void;
  onResetAllEvents?: () => void;
  isLiveApiKey: boolean;
  selectedModel: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  events,
  currentEvent,
  onSelectEvent,
  onOpenNewEventModal,
  onOpenApiKeyModal,
  onOpenExportModal,
  onDeleteCurrentEvent,
  onResetAllEvents,
  isLiveApiKey,
  selectedModel,
}) => {
  const daysInfo = currentEvent ? calculateDaysRemaining(currentEvent.date) : null;

  return (
    <header className="sticky top-0 z-40 w-full glass-obsidian border-b border-[#27272a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Event Selector */}
        <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-[#a78bfa]/20 border border-[#c4b5fd]/30">
              <Sparkles className="w-5 h-5 text-[#0a0012]" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-base font-bold tracking-tight text-[#fafafa] flex items-center gap-1.5 font-headline">
                Evento.AI <span className="text-xs px-2 py-0.5 rounded-full bg-[#a78bfa]/15 text-[#a78bfa] border border-[#a78bfa]/30 font-mono font-medium">Suite</span>
              </span>
              <span className="text-[11px] text-[#a1a1aa] font-mono">Celebration & Event Planner</span>
            </div>
          </div>

          {/* Event Dropdown (if events exist) */}
          {currentEvent && events.length > 0 && (
            <div className="relative max-w-xs w-full min-w-[180px]">
              <div className="flex items-center bg-[#121215] border border-[#27272a] hover:border-[#52525b] transition-colors rounded-lg px-3 py-1.5">
                <Calendar className="w-4 h-4 text-[#a78bfa] mr-2 flex-shrink-0" />
                <select
                  id="event-selector"
                  aria-label="Select active event"
                  value={currentEvent.id}
                  onChange={(e) => onSelectEvent(e.target.value)}
                  className="w-full bg-transparent text-sm text-[#fafafa] font-medium focus:outline-none cursor-pointer truncate pr-2"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id} className="bg-[#121215] text-[#fafafa]">
                      {ev.title} ({ev.type.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Days Remaining Badge */}
          {daysInfo && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a] text-xs font-medium text-[#a1a1aa] flex-shrink-0">
              <Clock className="w-3.5 h-3.5 text-[#34d399]" />
              <span>{daysInfo.displayText}</span>
            </div>
          )}
        </div>

        {/* Right Actions: Model, API Key, Delete, + New Event */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* AI Model Badge */}
          <button
            onClick={onOpenApiKeyModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121215] border border-[#27272a] hover:border-[#a78bfa]/50 transition-all text-xs font-medium cursor-pointer group"
            title="Configure Gemini API Key & Model"
          >
            <span className={`w-2 h-2 rounded-full ${isLiveApiKey ? 'bg-[#34d399] shadow-[0_0_8px_#34d399]' : 'bg-[#a78bfa] shadow-[0_0_8px_#a78bfa]'} animate-pulse`} />
            <span className="text-[#a1a1aa] group-hover:text-[#fafafa] hidden md:inline truncate max-w-[150px] font-mono">
              {selectedModel.replace('gemini-', '').toUpperCase()}
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#18181b] text-[#34d399] border border-[#34d399]/20">
              {isLiveApiKey ? 'Cloud' : 'Active'}
            </span>
          </button>

          {/* Settings / API Key Button */}
          <button
            onClick={onOpenApiKeyModal}
            aria-label="Gemini API Key and Settings"
            className="p-2 rounded-lg bg-[#121215] hover:bg-[#18181b] text-[#a1a1aa] hover:text-[#fafafa] border border-[#27272a] hover:border-[#52525b] transition-all cursor-pointer"
            title="Gemini API Settings"
          >
            <Key className="w-4 h-4" />
          </button>

          {/* Delete Current Event Button */}
          {currentEvent && (
            <button
              onClick={onDeleteCurrentEvent}
              aria-label="Delete current event"
              className="p-2 rounded-lg bg-[#121215] hover:bg-[#ef4444]/20 text-[#a1a1aa] hover:text-[#ef4444] border border-[#27272a] hover:border-[#ef4444]/40 transition-all cursor-pointer"
              title="Delete current event workspace"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Reset All to Fresh App Button */}
          {events.length > 0 && onResetAllEvents && (
            <button
              onClick={onResetAllEvents}
              aria-label="Reset to fresh app"
              className="p-2 rounded-lg bg-[#121215] hover:bg-[#a78bfa]/20 text-[#a1a1aa] hover:text-[#a78bfa] border border-[#27272a] hover:border-[#a78bfa]/40 transition-all cursor-pointer"
              title="Reset to fresh clean app (clear all)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* New Event Wizard Button */}
          <button
            onClick={onOpenNewEventModal}
            aria-label="Create new event"
            className="flex items-center gap-1.5 bg-[#a78bfa] hover:bg-[#c4b5fd] text-[#0a0012] font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-lg transition-all shadow-md shadow-[#a78bfa]/20 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Event</span>
          </button>
        </div>
      </div>
    </header>
  );
};
