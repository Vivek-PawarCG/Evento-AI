import React, { useState, useEffect } from 'react';
import { EventPlan } from './types/event';
import { INITIAL_EVENTS } from './data/defaultEvents';
import { getStoredApiKey, getStoredModel } from './services/geminiService';
import {
  detectIndianLocationAndStyle,
  generateVenuesForLocation,
  generateVendorsForLocation,
  generateMilestonesForTimeframe,
} from './utils/indianLocationHelper';
import { Navbar } from './components/Navbar';
import { TabsNav, TabId } from './components/TabsNav';
import { DashboardTab } from './components/DashboardTab';
import { AIStudioTab } from './components/AIStudioTab';
import { BudgetVendorsTab } from './components/BudgetVendorsTab';
import { TimelineGuestsTab } from './components/TimelineGuestsTab';
import { ArchitectureTab } from './components/ArchitectureTab';
import { WelcomeScreen } from './components/WelcomeScreen';
import { NewEventModal } from './components/modals/NewEventModal';
import { ExportSummaryModal } from './components/modals/ExportSummaryModal';
import { ApiKeyModal } from './components/modals/ApiKeyModal';

const EVENTS_STORAGE_KEY = 'eventgenie_clean_events_v3';
const CURRENT_EVENT_KEY = 'eventgenie_clean_current_id_v3';

export function App() {
  const [events, setEvents] = useState<EventPlan[]>(() => {
    try {
      // Automatically purge old hardcoded cached events from previous versions
      const oldSaved = localStorage.getItem('eventgenie_saved_events');
      if (oldSaved) {
        localStorage.removeItem('eventgenie_saved_events');
        localStorage.removeItem('eventgenie_current_event_id');
      }

      const saved = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Purge any lingering legacy named events and auto-align city venues
          const cleanEvents = parsed.filter(
            (ev: EventPlan) =>
              ev &&
              ev.title &&
              !ev.title.includes('TechCorp') &&
              !ev.title.includes('Sarah & Alex') &&
              !ev.title.includes("Maya's 30th") &&
              !ev.title.includes('Oakridge Community')
          );

          return cleanEvents.map((ev: EventPlan) => {
            const detected = detectIndianLocationAndStyle(ev.title, ev.venue?.location, ev.theme);
            const isMismatched = detected.city && !ev.venue?.location?.toLowerCase().includes(detected.city.toLowerCase());
            if (isMismatched) {
              const venues = generateVenuesForLocation(
                detected.city,
                detected.state || 'India',
                detected.style,
                ev.guestCount,
                ev.type
              );
              const vendors = generateVendorsForLocation(detected.city, ev.targetBudget, ev.type);
              const milestones = generateMilestonesForTimeframe(ev.date, detected.city, ev.type);

              const eventDate = new Date(ev.date);
              const now = new Date();
              const diffDays = Math.max(1, Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
              const seed = (ev.title.length * 37 + ev.guestCount * 13) % 9;
              const ratio = diffDays <= 10 ? 0.92 + (seed * 0.005) : 0.81 + (seed * 0.01);
              const rsvpConfirmed = Math.min(ev.guestCount, Math.round(ev.guestCount * ratio));

              return {
                ...ev,
                venue: venues[0],
                suggestedVenues: venues,
                vendors,
                milestones,
                rsvpConfirmed,
              };
            }
            return ev;
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load events from storage', e);
    }
    return INITIAL_EVENTS;
  });

  const [currentEventId, setCurrentEventId] = useState<string>(() => {
    try {
      return localStorage.getItem(CURRENT_EVENT_KEY) || '';
    } catch {
      return '';
    }
  });

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const [selectedModel, setSelectedModel] = useState(getStoredModel());
  const [isLiveApiKey, setIsLiveApiKey] = useState(Boolean(getStoredApiKey()));

  // Sync events to local storage
  useEffect(() => {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [events]);

  // Sync active event ID
  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_EVENT_KEY, currentEventId);
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [currentEventId]);

  const currentEvent = events.find((e) => e.id === currentEventId) || (events.length > 0 ? events[0] : null);

  const handleUpdateCurrentEvent = (updated: EventPlan) => {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  const handleCreateNewEvent = (newEvent: EventPlan) => {
    setEvents((prev) => [newEvent, ...prev]);
    setCurrentEventId(newEvent.id);
    setActiveTab('dashboard');
  };

  const handleDeleteCurrentEvent = () => {
    if (!currentEvent) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${currentEvent.title}"?`);
    if (confirmDelete) {
      const remaining = events.filter((e) => e.id !== currentEvent.id);
      setEvents(remaining);
      if (remaining.length > 0) {
        setCurrentEventId(remaining[0].id);
      } else {
        setCurrentEventId('');
      }
    }
  };

  const handleResetAllEvents = () => {
    const confirmReset = window.confirm('Reset app to clean state? All events will be cleared.');
    if (confirmReset) {
      try {
        localStorage.removeItem(EVENTS_STORAGE_KEY);
        localStorage.removeItem(CURRENT_EVENT_KEY);
        localStorage.removeItem('eventgenie_saved_events');
        localStorage.removeItem('eventgenie_current_event_id');
      } catch (err) {
        console.warn('Reset storage cleanup warning', err);
      }
      setEvents([]);
      setCurrentEventId('');
      setActiveTab('dashboard');
    }
  };

  const refreshApiSettings = () => {
    setSelectedModel(getStoredModel());
    setIsLiveApiKey(Boolean(getStoredApiKey()));
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col font-sans selection:bg-[#a78bfa]/30 selection:text-[#fafafa]">
      {/* Top Navigation */}
      <Navbar
        events={events}
        currentEvent={currentEvent}
        onSelectEvent={(id) => setCurrentEventId(id)}
        onOpenNewEventModal={() => setIsNewEventModalOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onDeleteCurrentEvent={handleDeleteCurrentEvent}
        onResetAllEvents={handleResetAllEvents}
        isLiveApiKey={isLiveApiKey}
        selectedModel={selectedModel}
      />

      {/* If no events exist, show Welcome & Onboarding screen */}
      {events.length === 0 || !currentEvent ? (
        <WelcomeScreen
          onEventCreated={handleCreateNewEvent}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          selectedModel={selectedModel}
        />
      ) : (
        <>
          {/* Tabs Bar */}
          <TabsNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

          {/* Main Content Workspace */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
            <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
              {activeTab === 'dashboard' && (
                <DashboardTab
                  event={currentEvent}
                  onUpdateEvent={handleUpdateCurrentEvent}
                  onSwitchTab={(t) => setActiveTab(t)}
                  onOpenExportModal={() => setIsExportModalOpen(true)}
                />
              )}

              {activeTab === 'ai-studio' && (
                <AIStudioTab
                  event={currentEvent}
                  onUpdateEvent={handleUpdateCurrentEvent}
                />
              )}

              {activeTab === 'budget-vendors' && (
                <BudgetVendorsTab
                  event={currentEvent}
                  onUpdateEvent={handleUpdateCurrentEvent}
                />
              )}

              {activeTab === 'timeline-guests' && (
                <TimelineGuestsTab
                  event={currentEvent}
                  onUpdateEvent={handleUpdateCurrentEvent}
                />
              )}

              {activeTab === 'architecture' && <ArchitectureTab />}
            </div>
          </main>
        </>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-[#27272a] bg-[#0c0c0f] py-8 mt-auto text-xs text-[#a1a1aa] font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" />
            <span className="text-[#fafafa] font-semibold">Evento.AI Planner Suite</span>
            <span className="text-[#71717a] hidden sm:inline">•</span>
            <span className="text-[#71717a] hidden sm:inline">Obsidian High-Contrast Dark</span>
          </div>

          <div className="flex items-center gap-4 text-[#71717a]">
            <span>Active Model: {selectedModel}</span>
            <span>•</span>
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="text-[#a78bfa] hover:underline cursor-pointer"
            >
              API Key Config
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <NewEventModal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        onCreateEvent={handleCreateNewEvent}
      />

      {currentEvent && (
        <ExportSummaryModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          event={currentEvent}
        />
      )}

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSaved={refreshApiSettings}
      />
    </div>
  );
}

export default App;
