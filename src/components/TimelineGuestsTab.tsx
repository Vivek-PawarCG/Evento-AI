import React, { useState } from 'react';
import { EventPlan, Milestone } from '../types/event';
import confetti from 'canvas-confetti';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Users,
  UtensilsCrossed,
  AlertCircle,
  Plus,
  Check,
  ChevronRight,
  ListTodo,
} from 'lucide-react';

interface TimelineGuestsTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

export const TimelineGuestsTab: React.FC<TimelineGuestsTabProps> = ({
  event,
  onUpdateEvent,
}) => {
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newCategory, setNewCategory] = useState<Milestone['category']>('Day-Of Logistics');

  const handleToggleMilestone = (milestoneId: string) => {
    const updated = event.milestones.map((m) => {
      if (m.id === milestoneId) {
        const nextState = !m.completed;
        if (nextState) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#34d399', '#a78bfa', '#f59e0b'],
          });
        }
        return { ...m, completed: nextState };
      }
      return m;
    });

    onUpdateEvent({
      ...event,
      milestones: updated,
    });
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newM: Milestone = {
      id: `m-${Date.now()}`,
      title: newTitle.trim(),
      dueDate: newDueDate || '2025-09-01',
      deadlineDescription: 'Added by organizer',
      completed: false,
      category: newCategory,
    };

    onUpdateEvent({
      ...event,
      milestones: [...event.milestones, newM],
    });

    setNewTitle('');
    setShowAddMilestone(false);
  };

  const handleUpdateRsvp = (type: 'confirmed' | 'declined', delta: number) => {
    if (type === 'confirmed') {
      const next = Math.max(0, event.rsvpConfirmed + delta);
      onUpdateEvent({ ...event, rsvpConfirmed: next });
    } else {
      const next = Math.max(0, event.rsvpDeclined + delta);
      onUpdateEvent({ ...event, rsvpDeclined: next });
    }
  };

  const completedCount = event.milestones.filter((m) => m.completed).length;

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Top Split: Milestones Tracker + RSVP & Dietary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Milestone Checklist (Span 7) */}
        <div className="lg:col-span-7 bg-[#121215] border border-[#27272a] p-6 sm:p-8 rounded-2xl flex flex-col justify-between gap-6 shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-[#fafafa] flex items-center gap-2 font-headline">
                  <ListTodo className="w-5 h-5 text-[#a78bfa]" /> Critical Path Milestone Checklist
                </h2>
                <p className="text-xs text-[#a1a1aa] mt-0.5 font-mono">
                  {completedCount} of {event.milestones.length} tasks completed ({Math.round((completedCount / (event.milestones.length || 1)) * 100)}%)
                </p>
              </div>

              <button
                onClick={() => setShowAddMilestone(!showAddMilestone)}
                className="flex items-center gap-1.5 text-xs font-mono text-[#a78bfa] hover:text-[#fafafa] bg-[#18181b] hover:bg-[#1e1e22] px-3 py-1.5 rounded-lg border border-[#27272a] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Add Task Inline Form */}
            {showAddMilestone && (
              <form onSubmit={handleAddMilestone} className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] mb-4 flex flex-col gap-3">
                <input
                  type="text"
                  required
                  placeholder="Task title (e.g. Schedule final floral walkthrough)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-[#121215] border border-[#27272a] text-xs sm:text-sm text-[#fafafa] px-3.5 py-2 rounded-lg outline-none focus:border-[#a78bfa]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="bg-[#121215] border border-[#27272a] text-xs text-[#fafafa] px-3.5 py-2 rounded-lg outline-none focus:border-[#a78bfa]"
                  />
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="bg-[#121215] border border-[#27272a] text-xs text-[#fafafa] px-3.5 py-2 rounded-lg outline-none focus:border-[#a78bfa] cursor-pointer"
                  >
                    <option>Legal & Venue</option>
                    <option>Vendors</option>
                    <option>Guests & Invites</option>
                    <option>Decor & Aesthetics</option>
                    <option>Day-Of Logistics</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMilestone(false)}
                    className="px-3 py-1.5 text-xs text-[#a1a1aa] hover:text-[#fafafa] font-mono cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs bg-[#a78bfa] text-[#0a0012] font-semibold rounded-lg hover:bg-[#c4b5fd] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            {/* Milestone List Items */}
            <div className="flex flex-col gap-3">
              {event.milestones.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleToggleMilestone(m.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    m.completed
                      ? 'bg-[#18181b]/50 border-[#27272a] opacity-75'
                      : 'bg-[#18181b] border-[#27272a] hover:border-[#a78bfa]/50'
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ${
                        m.completed ? 'bg-[#34d399] text-[#001a12]' : 'border border-[#52525b] hover:border-[#a78bfa]'
                      }`}
                    >
                      {m.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span
                        className={`text-sm font-medium truncate ${
                          m.completed ? 'line-through text-[#71717a]' : 'text-[#fafafa]'
                        }`}
                      >
                        {m.title}
                      </span>
                      <span className="text-[11px] text-[#a1a1aa] font-mono">
                        {m.dueDate} • {m.deadlineDescription}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#121215] text-[#a78bfa] border border-[#27272a] flex-shrink-0 hidden sm:inline">
                    {m.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: RSVP & Dietary Analytics (Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* RSVP Tracker Card */}
          <div className="bg-[#121215] border border-[#27272a] p-6 rounded-2xl flex flex-col gap-5 shadow-xl">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#fafafa] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#34d399]" /> RSVP & Guest Demographics
              </h3>
              <p className="text-xs text-[#a1a1aa] mt-0.5 font-mono">
                Total Invited: {event.guestCount} Guests
              </p>
            </div>

            {/* Confirmed / Declined Counters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] flex flex-col justify-between">
                <span className="text-xs text-[#a1a1aa] font-mono">Attending (Confirmed)</span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-[#34d399] my-1">
                  {event.rsvpConfirmed}
                </span>
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => handleUpdateRsvp('confirmed', -5)}
                    className="w-6 h-6 rounded bg-[#27272a] text-xs hover:bg-[#3f3f46] text-[#fafafa] flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleUpdateRsvp('confirmed', 5)}
                    className="w-6 h-6 rounded bg-[#27272a] text-xs hover:bg-[#3f3f46] text-[#fafafa] flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] flex flex-col justify-between">
                <span className="text-xs text-[#a1a1aa] font-mono">Declined / Unanswered</span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-[#ef4444] my-1">
                  {event.rsvpDeclined}
                </span>
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => handleUpdateRsvp('declined', -5)}
                    className="w-6 h-6 rounded bg-[#27272a] text-xs hover:bg-[#3f3f46] text-[#fafafa] flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleUpdateRsvp('declined', 5)}
                    className="w-6 h-6 rounded bg-[#27272a] text-xs hover:bg-[#3f3f46] text-[#fafafa] flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Attendance Progress Bar */}
            <div>
              <div className="flex justify-between text-xs font-mono text-[#a1a1aa] mb-1">
                <span>Confirmation Ratio</span>
                <span className="text-[#34d399] font-bold">
                  {Math.round((event.rsvpConfirmed / (event.guestCount || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-[#18181b] h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#34d399] h-full"
                  style={{ width: `${(event.rsvpConfirmed / (event.guestCount || 1)) * 100}%` }}
                />
                <div
                  className="bg-[#ef4444] h-full"
                  style={{ width: `${(event.rsvpDeclined / (event.guestCount || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Dietary Breakdown Card */}
          <div className="bg-[#121215] border border-[#27272a] p-6 rounded-2xl flex flex-col gap-4 shadow-xl">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#fafafa] flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-[#a78bfa]" /> Banquet Dietary Breakdown
              </h3>
              <p className="text-xs text-[#a1a1aa] mt-0.5 font-mono">
                Mandatory for catering headcount and allergy isolation.
              </p>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#18181b] border border-[#27272a]">
                <span className="text-[#fafafa]">Standard Plated Course</span>
                <span className="font-bold text-[#fafafa]">{event.dietary.standard} guests</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#18181b] border border-[#27272a]">
                <span className="text-[#34d399]">Vegetarian / Vegan</span>
                <span className="font-bold text-[#34d399]">{event.dietary.vegetarianVegan} guests</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#18181b] border border-[#27272a]">
                <span className="text-[#a78bfa]">Gluten-Free (Celiac Safe)</span>
                <span className="font-bold text-[#a78bfa]">{event.dietary.glutenFree} guests</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#18181b] border border-[#27272a]">
                <span className="text-[#f59e0b]">Halal / Kosher Verified</span>
                <span className="font-bold text-[#f59e0b]">{event.dietary.halalKosher} guests</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#18181b] border border-[#27272a]">
                <span className="text-[#ef4444]">Nut / Shellfish Allergies</span>
                <span className="font-bold text-[#ef4444]">{event.dietary.allergies} guests</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Day-Of Master Event Schedule Run-of-Show */}
      <div className="bg-[#121215] border border-[#27272a] p-6 sm:p-8 rounded-2xl flex flex-col gap-5 shadow-xl">
        <div>
          <h3 className="text-lg font-bold text-[#fafafa] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#a78bfa]" /> Day-Of Run-of-Show Master Schedule
          </h3>
          <p className="text-xs text-[#a1a1aa] font-mono mt-0.5">
            Synchronized timeline cues for coordinator, audio team, and culinary director.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] flex flex-col gap-1">
            <span className="text-xs font-mono text-[#a78bfa] font-bold">08:00 AM – 11:30 AM</span>
            <h4 className="text-sm font-semibold text-[#fafafa]">Load-In & Production Setup</h4>
            <p className="text-xs text-[#a1a1aa]">AV line arrays soundcheck, floral installations, table styling.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] flex flex-col gap-1">
            <span className="text-xs font-mono text-[#34d399] font-bold">05:30 PM – 07:00 PM</span>
            <h4 className="text-sm font-semibold text-[#fafafa]">Arrivals & Welcome Sips</h4>
            <p className="text-xs text-[#a1a1aa]">Red carpet entry, live ambient string quartet, signature violet cocktails.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] flex flex-col gap-1">
            <span className="text-xs font-mono text-[#a78bfa] font-bold">07:00 PM – 09:30 PM</span>
            <h4 className="text-sm font-semibold text-[#fafafa]">Keynotes & Dinner Banquet</h4>
            <p className="text-xs text-[#a1a1aa]">Executive address, 5-course seasonal service, wine pairings.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] flex flex-col gap-1">
            <span className="text-xs font-mono text-[#f59e0b] font-bold">09:30 PM – 12:30 AM</span>
            <h4 className="text-sm font-semibold text-[#fafafa]">After-Party & Midnight Toast</h4>
            <p className="text-xs text-[#a1a1aa]">Live DJ set, holographic light show, espresso martini bar, load-out.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
