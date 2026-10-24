import React, { useState } from 'react';
import { EventPlan, EventType } from '../types/event';
import { createDynamicEvent } from '../data/defaultEvents';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Calendar,
  DollarSign,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Heart,
  Cake,
  Building2,
  PartyPopper,
} from 'lucide-react';

interface WelcomeScreenProps {
  onEventCreated: (event: EventPlan) => void;
  onOpenApiKeyModal: () => void;
  selectedModel: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onEventCreated,
  onOpenApiKeyModal,
  selectedModel,
}) => {
  const [selectedType, setSelectedType] = useState<EventType>('wedding');
  const [title, setTitle] = useState('');
  const [targetBudget, setTargetBudget] = useState('2500000');
  const [guestCount, setGuestCount] = useState('350');
  const [date, setDate] = useState('2025-11-28');
  const [isInitializing, setIsInitializing] = useState(false);

  const eventTypePresets: {
    type: EventType;
    label: string;
    icon: React.ReactNode;
    defaultTitle: string;
    budget: string;
    guests: string;
    theme: string;
  }[] = [
    {
      type: 'wedding',
      label: 'Royal Indian Wedding',
      icon: <Heart className="w-4 h-4 text-[#a78bfa]" />,
      defaultTitle: 'Royal Rajputana Wedding Celebration',
      budget: '2500000',
      guests: '350',
      theme: 'Royal Rajputana Grandeur & Marigold Splendor',
    },
    {
      type: 'birthday',
      label: 'Bollywood Rooftop Birthday',
      icon: <Cake className="w-4 h-4 text-[#34d399]" />,
      defaultTitle: 'Glamorous Bollywood Rooftop Party',
      budget: '500000',
      guests: '80',
      theme: 'Cyberpunk Neon Bollywood Rooftop',
    },
    {
      type: 'community',
      label: 'Diwali & Arts Utsav',
      icon: <Users className="w-4 h-4 text-[#f59e0b]" />,
      defaultTitle: 'Grand Diwali Mela & Cultural Festival',
      budget: '1200000',
      guests: '800',
      theme: 'Vibrant Deepavali & Rangoli Cultural Pavilion',
    },
    {
      type: 'gala',
      label: 'India Leadership Gala',
      icon: <Building2 className="w-4 h-4 text-[#a78bfa]" />,
      defaultTitle: 'India Tech Leadership Summit & Gala',
      budget: '3500000',
      guests: '450',
      theme: 'Obsidian & Gold Minimalist Leadership Summit',
    },
  ];

  const handleSelectPreset = (preset: (typeof eventTypePresets)[0]) => {
    setSelectedType(preset.type);
    setTitle(preset.defaultTitle);
    setTargetBudget(preset.budget);
    setGuestCount(preset.guests);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const eventName = title.trim() || `${selectedType.toUpperCase()} Celebration`;
    setIsInitializing(true);

    setTimeout(() => {
      const newEvent = createDynamicEvent({
        title: eventName,
        type: selectedType,
        date: date || '2025-10-18',
        targetBudget: parseInt(targetBudget) || 50000,
        guestCount: parseInt(guestCount) || 100,
      });

      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#a78bfa', '#34d399', '#ffffff'],
      });

      onEventCreated(newEvent);
    }, 700);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-12 px-4 max-w-4xl mx-auto">
      {/* Top Hero Indicator */}
      <div className="relative flex flex-col items-center text-center pb-8 overflow-hidden w-full">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#a78bfa]/30 to-[#7c3aed]/20 border border-[#a78bfa]/30 flex items-center justify-center mb-6 shadow-2xl shadow-[#a78bfa]/20 animate-pulse">
          <Sparkles className="w-10 h-10 text-[#a78bfa]" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121215] border border-[#27272a] mb-4 text-xs font-mono text-[#a78bfa]">
          <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" />
          <span>{selectedModel} Engine Ready</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#fafafa] font-headline max-w-2xl leading-tight mb-4">
          Orchestrate Every Moment with AI Precision
        </h1>
        <p className="text-sm sm:text-base text-[#a1a1aa] max-w-xl leading-relaxed">
          Create a personalized, GenAI-powered planning workspace for your weddings, birthdays, or community gatherings with real-time budgets, timelines, and vendor matrices.
        </p>
      </div>

      {/* Main Interactive Creation Card */}
      <div className="w-full bg-[#121215] border border-[#27272a] p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-bold text-[#fafafa] flex items-center gap-2">
            <PartyPopper className="w-5 h-5 text-[#a78bfa]" /> Initialize Your Celebration
          </h2>
          <p className="text-xs text-[#a1a1aa] font-mono mt-0.5">
            Select a celebration type or click a preset for instant zero-config setup.
          </p>
        </div>

        {/* Celebration Type Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {eventTypePresets.map((preset) => {
            const isSelected = selectedType === preset.type;
            return (
              <button
                key={preset.type}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#18181b] border-[#a78bfa] shadow-md shadow-[#a78bfa]/15'
                    : 'bg-[#121215] border-[#27272a] hover:border-[#52525b]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-[#09090b]">{preset.icon}</div>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-[#a78bfa]" />}
                </div>
                <span className="text-xs font-bold text-[#fafafa]">{preset.label}</span>
                <span className="text-[10px] text-[#71717a] font-mono mt-0.5 truncate">{preset.theme}</span>
              </button>
            );
          })}
        </div>

        {/* Creation Form */}
        <form onSubmit={handleCreate} className="flex flex-col gap-4 pt-2 border-t border-[#27272a]">
          <div>
            <label className="text-xs font-mono text-[#a1a1aa] block mb-1">
              Event Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ananya & Kabir's Royal Sangeet & Vivah"
              className="w-full bg-[#18181b] border border-[#27272a] text-sm text-[#fafafa] px-4 py-3 rounded-xl focus:border-[#a78bfa] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-mono text-[#a1a1aa] block mb-1">Target Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#18181b] border border-[#27272a] text-sm text-[#fafafa] px-3.5 py-2.5 rounded-xl focus:border-[#a78bfa] outline-none cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[#a1a1aa] block mb-1">Total Budget (₹ INR)</label>
              <input
                type="number"
                required
                min={10000}
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

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
            <button
              type="button"
              onClick={onOpenApiKeyModal}
              className="text-xs font-mono text-[#a78bfa] hover:underline cursor-pointer"
            >
              Configure Gemini API Key / Model (Optional)
            </button>

            <button
              type="submit"
              disabled={isInitializing}
              className="w-full sm:w-auto bg-[#a78bfa] hover:bg-[#c4b5fd] text-[#0a0012] font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-[#a78bfa]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className={`w-4 h-4 ${isInitializing ? 'animate-spin' : ''}`} />
              <span>{isInitializing ? 'Configuring AI Suite...' : 'Initialize Event Suite'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* 3 Core Capability Cards from Stitch Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-6">
        <div className="p-4 rounded-2xl bg-[#121215] border border-[#27272a] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#fafafa]">Smart Timeline</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#a78bfa]/15 text-[#a78bfa]">
              Predictive
            </span>
          </div>
          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            Dynamically shifts your meetings, catering cues, and vendor load-ins with zero friction.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#121215] border border-[#27272a] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#fafafa]">AI Concept Studio</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#34d399]/15 text-[#34d399]">
              Generative
            </span>
          </div>
          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            Synthesizes themes, bespoke cocktails, and aesthetic mood boards via Gemini 3.5 Flash Lite.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#121215] border border-[#27272a] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#fafafa]">Budget Intelligence</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f59e0b]/15 text-[#f59e0b]">
              Autonomous
            </span>
          </div>
          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            Real-time slider allocation engine with over-budget prevention and contingency guarding.
          </p>
        </div>
      </div>
    </div>
  );
};
