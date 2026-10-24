import React, { useState } from 'react';
import { EventPlan, EventType, BudgetItem } from '../../types/event';
import { createDynamicEvent } from '../../data/defaultEvents';
import { X, Sparkles, Calendar, IndianRupee, Users, Tag } from 'lucide-react';
import confetti from 'canvas-confetti';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (newEvent: EventPlan) => void;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({
  isOpen,
  onClose,
  onCreateEvent,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('wedding');
  const [date, setDate] = useState('2025-11-20');
  const [targetBudget, setTargetBudget] = useState('1500000');
  const [guestCount, setGuestCount] = useState('250');
  const [location, setLocation] = useState('Aurangabad, Maharashtra');
  const [theme, setTheme] = useState('Royal Marigold & Emerald Splendor');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const budgetNum = parseInt(targetBudget) || 1500000;
    const guestNum = parseInt(guestCount) || 200;

    const newEvent = createDynamicEvent({
      title: title.trim(),
      type,
      date,
      targetBudget: budgetNum,
      guestCount: guestNum,
      venueLocation: location.trim() || undefined,
      theme: theme.trim() || undefined,
    });

    onCreateEvent(newEvent);
    onClose();

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#a78bfa', '#34d399', '#f59e0b'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121215] border border-[#27272a] max-w-lg w-full p-6 sm:p-8 rounded-2xl flex flex-col gap-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#fafafa] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#a78bfa]" /> Create New Celebration Event
            </h3>
            <p className="text-xs text-[#a1a1aa] mt-0.5">
              Evento.AI will configure tailored budgets, timelines, and ideas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-mono text-[#a1a1aa] block mb-1">Event Name</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Advait & Riya's Royal Palace Wedding"
              className="w-full bg-[#18181b] border border-[#27272a] text-sm text-[#fafafa] px-3.5 py-2.5 rounded-xl focus:border-[#a78bfa] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-[#a1a1aa] block mb-1 flex items-center justify-between">
              <span>Destination City / Region</span>
              <span className="text-[10px] text-[#a78bfa]">AI Venue Matching</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Aurangabad, Maharashtra / Goa / Udaipur / Mumbai / Bengaluru"
              className="w-full bg-[#18181b] border border-[#27272a] text-sm text-[#fafafa] px-3.5 py-2.5 rounded-xl focus:border-[#a78bfa] outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-[#a1a1aa] block mb-1">Event Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className="w-full bg-[#18181b] border border-[#27272a] text-sm text-[#fafafa] px-3.5 py-2.5 rounded-xl focus:border-[#a78bfa] outline-none cursor-pointer"
              >
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday Celebration</option>
                <option value="community">Community Gathering</option>
                <option value="gala">Corporate Gala / Summit</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-[#a1a1aa] block mb-1">Target Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#18181b] border border-[#27272a] text-sm text-[#fafafa] px-3.5 py-2.5 rounded-xl focus:border-[#a78bfa] outline-none cursor-pointer"
              >
              </input>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-[#a1a1aa] block mb-1">Total Budget (₹ INR)</label>
              <input
                type="number"
                required
                min={1000}
                value={targetBudget}
                onChange={(e) => setTargetBudget(e.target.value)}
                className="w-full bg-[#18181b] border border-[#27272a] text-sm text-[#fafafa] px-3.5 py-2.5 rounded-xl focus:border-[#a78bfa] outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[#a1a1aa] block mb-1">Guest Headcount</label>
              <input
                type="number"
                required
                min={5}
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className="w-full bg-[#18181b] border border-[#27272a] text-sm text-[#fafafa] px-3.5 py-2.5 rounded-xl focus:border-[#a78bfa] outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-[#a1a1aa] block mb-1">Theme & Aesthetic Vibe</label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. Neo-Classical Botanical Garden"
              className="w-full bg-[#18181b] border border-[#27272a] text-sm text-[#fafafa] px-3.5 py-2.5 rounded-xl focus:border-[#a78bfa] outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#27272a]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#18181b] hover:bg-[#1e1e22] text-xs font-mono text-[#a1a1aa] hover:text-[#fafafa] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#a78bfa] hover:bg-[#c4b5fd] text-xs font-semibold text-[#0a0012] cursor-pointer shadow-md shadow-[#a78bfa]/20 active:scale-95"
            >
              Initialize Event Suite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
