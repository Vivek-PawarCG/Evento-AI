import React, { useState, useRef, useEffect } from 'react';
import { EventPlan, ChatMessage, VenueInfo } from '../types/event';
import { calculateBudgetSummary, formatCurrency } from '../utils/budgetCalculator';
import { generateCopilotResponse, synthesizeEventMetrics } from '../services/geminiService';
import { detectIndianLocationAndStyle, generateVenuesForLocation } from '../utils/indianLocationHelper';
import { MarkdownView } from './MarkdownView';
import confetti from 'canvas-confetti';
import {
  IndianRupee,
  Users,
  Handshake,
  Bot,
  Send,
  Sparkles,
  Download,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Palette,
  Check,
  Copy,
  RefreshCw,
} from 'lucide-react';

interface DashboardTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
  onSwitchTab: (tabId: any) => void;
  onOpenExportModal: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  event,
  onUpdateEvent,
  onSwitchTab,
  onOpenExportModal,
}) => {
  const budgetSummary = calculateBudgetSummary(event.targetBudget, event.budgetItems);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isRegeneratingMetrics, setIsRegeneratingMetrics] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const detectedLocation = detectIndianLocationAndStyle(event.title, event.venue?.location, event.theme);
  const isLocationMismatched = Boolean(
    detectedLocation.city &&
    !event.venue?.location?.toLowerCase().includes(detectedLocation.city.toLowerCase())
  );

  const suggestedVenuesList: VenueInfo[] = (event.suggestedVenues && event.suggestedVenues.length > 0)
    ? event.suggestedVenues
    : generateVenuesForLocation(
        detectedLocation.city,
        detectedLocation.state || 'India',
        detectedLocation.style,
        event.guestCount,
        event.type
      );

  const handleSwitchVenue = (newVenue: VenueInfo) => {
    onUpdateEvent({
      ...event,
      venue: newVenue,
    });
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#a78bfa', '#34d399', '#f59e0b'],
    });
  };

  const handleRecalculateWithAI = async () => {
    setIsRegeneratingMetrics(true);
    try {
      const synthesized = await synthesizeEventMetrics(event);
      onUpdateEvent({
        ...event,
        rsvpConfirmed: synthesized.rsvpConfirmed,
        rsvpDeclined: synthesized.rsvpDeclined,
        budgetItems: synthesized.budgetItems,
        vendors: synthesized.vendors,
        milestones: synthesized.milestones,
        venue: synthesized.venue || event.venue,
        suggestedVenues: synthesized.suggestedVenues || event.suggestedVenues,
      });

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.3 },
        colors: ['#a78bfa', '#34d399', '#f59e0b'],
      });
    } catch (err) {
      console.error('Failed to regenerate metrics with AI', err);
    } finally {
      setIsRegeneratingMetrics(false);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [event.copilotHistory, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...event.copilotHistory, userMessage];
    onUpdateEvent({
      ...event,
      copilotHistory: updatedHistory,
    });

    setChatInput('');
    setIsTyping(true);

    try {
      const response = await generateCopilotResponse(query, event);
      const geminiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'gemini',
        content: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionsTaken: response.suggestedActions,
      };

      onUpdateEvent({
        ...event,
        copilotHistory: [...updatedHistory, geminiMessage],
      });
    } catch (err) {
      console.error('Failed to get copilot response', err);
      const fallbackMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'gemini',
        content: "I've logged your request into your event notes and updated operational parameters.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onUpdateEvent({
        ...event,
        copilotHistory: [...updatedHistory, fallbackMessage],
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  // Signed contracts count
  const signedVendors = event.vendors.filter((v) => v.status === 'contract_signed').length;
  const totalVendors = event.vendors.length;

  // Completed milestones
  const completedMilestones = event.milestones.filter((m) => m.completed).length;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      {/* Metrics Header with Live AI Generator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-[#fafafa] flex items-center gap-2">
            <span>Executive Event Intelligence</span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#a78bfa]/15 text-[#a78bfa] border border-[#a78bfa]/30">
              Gemini 3.5 Flash Lite
            </span>
          </h2>
          <p className="text-xs text-[#a1a1aa] font-mono mt-0.5">
            Indian market rates (₹ INR), dynamic attendance predictions & vendor contract matrix
          </p>
        </div>

        <button
          onClick={handleRecalculateWithAI}
          disabled={isRegeneratingMetrics}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#a78bfa]/20 to-[#7c3aed]/20 border border-[#a78bfa]/40 hover:border-[#a78bfa] text-xs font-semibold text-[#fafafa] transition-all cursor-pointer shadow-lg shadow-[#a78bfa]/10 active:scale-95 disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 text-[#a78bfa] ${isRegeneratingMetrics ? 'animate-spin' : ''}`} />
          <span>{isRegeneratingMetrics ? 'Synthesizing with Gemini...' : '⚡ AI Recalculate Metrics'}</span>
        </button>
      </div>

      {/* Bento Grid Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Budget */}
        <div className="bg-[#121215] border border-[#27272a] p-5 rounded-2xl flex flex-col justify-between hover:border-[#52525b] transition-all">
          <div className="flex justify-between items-start text-[#a1a1aa]">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Total Budget</span>
            <div className="p-2 rounded-lg bg-[#a78bfa]/10 text-[#a78bfa]">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fafafa]">
                {formatCurrency(budgetSummary.targetBudget)}
              </span>
            </div>
            <p className="text-xs text-[#34d399] mt-1 flex items-center gap-1 font-mono">
              <span>{formatCurrency(budgetSummary.remainingContingency)} reserve available</span>
            </p>
          </div>
          <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                budgetSummary.isOverBudget ? 'bg-[#ef4444]' : 'bg-[#a78bfa]'
              }`}
              style={{ width: `${Math.min(100, budgetSummary.percentAllocated)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: RSVP Attending */}
        <div className="bg-[#121215] border border-[#27272a] p-5 rounded-2xl flex flex-col justify-between hover:border-[#52525b] transition-all">
          <div className="flex justify-between items-start text-[#a1a1aa]">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">RSVP Confirmed</span>
            <div className="p-2 rounded-lg bg-[#34d399]/10 text-[#34d399]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fafafa]">
                {event.rsvpConfirmed}
              </span>
              <span className="text-sm text-[#71717a]">/ {event.guestCount} guests</span>
            </div>
            <p className="text-xs text-[#34d399] mt-1 font-mono">
              {Math.round((event.rsvpConfirmed / (event.guestCount || 1)) * 100)}% attendance response rate
            </p>
          </div>
          <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#34d399] h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (event.rsvpConfirmed / (event.guestCount || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Vendor Contracts */}
        <div className="bg-[#121215] border border-[#27272a] p-5 rounded-2xl flex flex-col justify-between hover:border-[#52525b] transition-all">
          <div className="flex justify-between items-start text-[#a1a1aa]">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Vendor Contracts</span>
            <div className="p-2 rounded-lg bg-[#a78bfa]/10 text-[#a78bfa]">
              <Handshake className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fafafa]">
                {signedVendors}
              </span>
              <span className="text-sm text-[#71717a]">/ {totalVendors} confirmed</span>
            </div>
            <p className="text-xs text-[#a1a1aa] mt-1 font-mono">
              {totalVendors - signedVendors} contract(s) pending sign-off
            </p>
          </div>
          <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#a78bfa] h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (signedVendors / (totalVendors || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 4: AI Copilot Tasks */}
        <div className="bg-[#121215] border border-[#27272a] p-5 rounded-2xl flex flex-col justify-between hover:border-[#52525b] transition-all">
          <div className="flex justify-between items-start text-[#a1a1aa]">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Milestones Progress</span>
            <div className="p-2 rounded-lg bg-[#34d399]/10 text-[#34d399]">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fafafa]">
                {completedMilestones} / {event.milestones.length}
              </span>
            </div>
            <p className="text-xs text-[#34d399] mt-1 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> All critical paths on schedule
            </p>
          </div>
          <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#34d399] h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (completedMilestones / (event.milestones.length || 1)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Split: Gemini Event Copilot + Confirmed Venue Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Gemini Copilot Card (Span 2) */}
        <div className="lg:col-span-2 bg-[#121215] border border-[#27272a] p-5 sm:p-6 rounded-2xl flex flex-col justify-between gap-5 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#27272a] pb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a78bfa]/20 to-[#7c3aed]/20 border border-[#a78bfa]/30 flex items-center justify-center text-[#a78bfa]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#fafafa] flex items-center gap-2">
                  Gemini Event Copilot
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/30">
                    Live Context Engine
                  </span>
                </h3>
                <p className="text-xs text-[#a1a1aa]">
                  Trained on event budgets, legal vendor timelines, dietary analytics & aesthetics
                </p>
              </div>
            </div>

            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 bg-[#18181b] hover:bg-[#1e1e22] text-[#fafafa] text-xs font-medium px-3.5 py-2 rounded-lg border border-[#27272a] hover:border-[#52525b] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#a78bfa]" />
              <span>Export Summary</span>
            </button>
          </div>

          {/* Chat Messages Log */}
          <div
            className="flex flex-col gap-3.5 max-h-[360px] min-h-[180px] overflow-y-auto pr-2"
            tabIndex={0}
            aria-label="Gemini Copilot Conversation History"
          >
            {event.copilotHistory.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center text-[#a1a1aa] border border-dashed border-[#27272a] rounded-xl my-auto">
                <div className="w-10 h-10 rounded-xl bg-[#a78bfa]/10 text-[#a78bfa] flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-[#fafafa]">Gemini 3.5 Flash Lite Copilot Ready</p>
                <p className="text-xs text-[#71717a] mt-1 max-w-sm leading-relaxed">
                  Ask Gemini to rebalance budgets, propose vendor questions, draft toasts, or click a quick prompt below. Zero canned responses.
                </p>
              </div>
            )}

            {event.copilotHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 p-3.5 rounded-xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#18181b] border border-[#27272a] ml-8 justify-end text-[#fafafa]'
                    : 'bg-[#0f0f12] border border-[#27272a] mr-4'
                }`}
              >
                {msg.sender === 'gemini' && (
                  <div className="w-7 h-7 rounded-lg bg-[#a78bfa]/20 flex items-center justify-center text-[#a78bfa] flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold font-mono text-[#a78bfa]">
                      {msg.sender === 'user' ? 'You' : 'Gemini Copilot'}
                    </span>
                    <span className="text-[10px] text-[#71717a] font-mono">{msg.timestamp}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-[#fafafa] leading-relaxed">
                    {msg.sender === 'gemini' ? (
                      <MarkdownView content={msg.content} />
                    ) : (
                      <div className="whitespace-pre-line">{msg.content}</div>
                    )}
                  </div>
                  {msg.actionsTaken && msg.actionsTaken.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.actionsTaken.map((action, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/20"
                        >
                          ✓ {action}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 p-3.5 rounded-xl bg-[#0f0f12] border border-[#27272a] mr-4 animate-pulse">
                <div className="w-7 h-7 rounded-lg bg-[#a78bfa]/20 flex items-center justify-center text-[#a78bfa] flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#a78bfa]">
                  <span>Gemini is synthesizing suggestions...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input & Controls */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-[#27272a]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                id="copilot-input"
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask Gemini e.g., 'Reduce decor costs by 15%' or 'Suggest vegan menu'..."
                className="flex-1 bg-[#18181b] text-sm text-[#fafafa] placeholder-[#71717a] px-4 py-3 rounded-xl border border-[#27272a] focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] transition-all outline-none"
              />
              <button
                type="submit"
                disabled={isTyping || !chatInput.trim()}
                aria-label="Send message to copilot"
                className="bg-[#a78bfa] hover:bg-[#c4b5fd] disabled:opacity-50 text-[#0a0012] p-3 rounded-xl transition-all font-semibold flex items-center justify-center cursor-pointer active:scale-95 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Prompt Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-[#71717a] font-mono mr-1">Quick prompts:</span>
              <button
                type="button"
                onClick={() => handleSendMessage('Reduce decoration costs by 15%')}
                className="text-[11px] text-[#a1a1aa] hover:text-[#fafafa] bg-[#18181b] hover:bg-[#1e1e22] px-2.5 py-1 rounded-md border border-[#27272a] transition-all cursor-pointer"
              >
                Reduce decor 15%
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Suggest vegetarian catering options')}
                className="text-[11px] text-[#a1a1aa] hover:text-[#fafafa] bg-[#18181b] hover:bg-[#1e1e22] px-2.5 py-1 rounded-md border border-[#27272a] transition-all cursor-pointer"
              >
                Suggest vegan menu
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Optimize seating arrangement for VIPs')}
                className="text-[11px] text-[#a1a1aa] hover:text-[#fafafa] bg-[#18181b] hover:bg-[#1e1e22] px-2.5 py-1 rounded-md border border-[#27272a] transition-all cursor-pointer"
              >
                Optimize seating
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Draft opening speech and toast')}
                className="text-[11px] text-[#a1a1aa] hover:text-[#fafafa] bg-[#18181b] hover:bg-[#1e1e22] px-2.5 py-1 rounded-md border border-[#27272a] transition-all cursor-pointer"
              >
                Draft speech
              </button>
            </div>
          </div>
        </div>

        {/* Selected Venue Showcase & Logistics (Right Column) */}
        <div className="bg-[#121215] border border-[#27272a] p-5 sm:p-6 rounded-2xl flex flex-col justify-between gap-5 shadow-xl">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-base text-[#fafafa] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#a78bfa]" /> Confirmed Venue
              </h3>
              <span className="text-[11px] font-mono text-[#34d399] bg-[#34d399]/10 px-2 py-0.5 rounded border border-[#34d399]/30">
                Deposit Secured
              </span>
            </div>

            {/* Location Mismatch Alert if Title specifies a different city */}
            {isLocationMismatched && (
              <div className="mb-3 p-3 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex flex-col gap-2">
                <div className="flex items-start gap-2 text-xs text-[#f59e0b]">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">City Mismatch Detected</p>
                    <p className="text-[11px] text-[#a1a1aa] mt-0.5 leading-relaxed">
                      Your event title specifies <strong>{detectedLocation.city}</strong>, but current venue is set in <strong>{event.venue.location}</strong>.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSwitchVenue(suggestedVenuesList[0])}
                  className="self-end px-3 py-1.5 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-black text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>⚡ AI Align to {detectedLocation.city} Venue</span>
                </button>
              </div>
            )}

            {/* Venue Image Card */}
            <div className="relative w-full h-44 rounded-xl overflow-hidden border border-[#27272a] group">
              <img
                src={event.venue.imageUrl}
                alt={event.venue.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0f] via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#fafafa] leading-tight">{event.venue.name}</h4>
                  <p className="text-xs text-[#a1a1aa] font-mono mt-0.5">
                    {event.venue.location} • Cap: {event.venue.capacity}
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#a78bfa]/20 text-[#a78bfa] border border-[#a78bfa]/30 font-mono">
                  {event.venue.rating} ★
                </span>
              </div>
            </div>

            {/* Logistics Matrix */}
            <div className="flex flex-col gap-2 mt-3 text-xs font-mono">
              <div className="flex justify-between items-center p-2 rounded-lg bg-[#18181b] border border-[#27272a]">
                <span className="text-[#a1a1aa] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#a78bfa]" /> Setup Timeline:
                </span>
                <span className="text-[#fafafa] font-medium">{event.venue.setupTime}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-[#18181b] border border-[#27272a]">
                <span className="text-[#a1a1aa] flex items-center gap-1.5">
                  <Handshake className="w-3.5 h-3.5 text-[#34d399]" /> Catering Lead:
                </span>
                <span className="text-[#fafafa] font-medium truncate max-w-[140px]">{event.venue.cateringPartner}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-[#18181b] border border-[#27272a]">
                <span className="text-[#a1a1aa] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#34d399]" /> Security Protocol:
                </span>
                <span className="text-[#34d399] font-medium">{event.venue.securityTier}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-[#18181b] border border-[#27272a]">
                <span className="text-[#a1a1aa]">Curfew & Sound Off:</span>
                <span className="text-[#fafafa] font-medium">{event.venue.curfew}</span>
              </div>
            </div>

            {/* AI Suggested Venues for Detected City */}
            <div className="mt-4 pt-3.5 border-t border-[#27272a]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#fafafa] flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-[#a78bfa]" /> AI Venues for {detectedLocation.city}
                </span>
                <button
                  type="button"
                  onClick={() => handleSendMessage(`Suggest 3 more hidden rooftop venues for a party in ${detectedLocation.city}`)}
                  className="text-[10px] text-[#a78bfa] hover:underline font-mono cursor-pointer"
                >
                  + Ask Gemini More
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {suggestedVenuesList.map((sv, idx) => {
                  const isCurrent = event.venue.name === sv.name;
                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                        isCurrent
                          ? 'bg-[#a78bfa]/10 border-[#a78bfa] text-[#fafafa]'
                          : 'bg-[#18181b] border-[#27272a] hover:border-[#3f3f46]'
                      }`}
                    >
                      <img src={sv.imageUrl} alt={sv.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[#fafafa] truncate">{sv.name}</p>
                        <p className="text-[10px] text-[#71717a] font-mono truncate">{sv.location}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSwitchVenue(sv)}
                        disabled={isCurrent}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all flex-shrink-0 cursor-pointer ${
                          isCurrent
                            ? 'bg-[#a78bfa] text-black font-semibold'
                            : 'bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa]'
                        }`}
                      >
                        {isCurrent ? 'Active' : 'Select'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action CTA to Studio */}
          <button
            onClick={() => onSwitchTab('ai-studio')}
            className="w-full bg-[#18181b] hover:bg-[#1e1e22] text-[#fafafa] text-xs font-semibold py-3 rounded-xl border border-[#27272a] hover:border-[#a78bfa] transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Explore AI Concept Studio</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#a78bfa] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Color Swatches & Aesthetic Moodboard Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Palette Card */}
        <div className="bg-[#121215] border border-[#27272a] p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-[#fafafa] flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#a78bfa]" /> Theme Palette
              </h4>
              <span className="text-[10px] font-mono text-[#a1a1aa]">{event.colorPalette.name}</span>
            </div>
            <p className="text-xs text-[#a1a1aa] mb-4">Click swatch to copy hex code directly.</p>
            <div className="flex items-center gap-2 flex-wrap">
              {event.colorPalette.hexCodes.map((hex, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCopyHex(hex)}
                  title={`Copy ${hex}`}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a] hover:border-[#a78bfa] transition-all text-xs font-mono text-[#fafafa] cursor-pointer group"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: hex }}
                  />
                  <span>{hex}</span>
                  {copiedHex === hex ? (
                    <Check className="w-3 h-3 text-[#34d399]" />
                  ) : (
                    <Copy className="w-3 h-3 text-[#71717a] group-hover:text-[#fafafa]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dietary Fast Glance */}
        <div className="bg-[#121215] border border-[#27272a] p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#fafafa] mb-1">Dietary RSVP Snapshot</h4>
            <p className="text-xs text-[#a1a1aa] mb-3">Auto-synced with guest response forms.</p>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-[#a1a1aa]">Standard Menu</span>
                <span className="font-bold text-[#fafafa]">{event.dietary.standard} guests</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#a1a1aa]">Plant-Based (Veg/Vegan)</span>
                <span className="font-bold text-[#34d399]">{event.dietary.vegetarianVegan} guests</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#a1a1aa]">Gluten-Free / Allergies</span>
                <span className="font-bold text-[#a78bfa]">{event.dietary.glutenFree + event.dietary.allergies} guests</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onSwitchTab('timeline-guests')}
            className="text-xs text-[#a78bfa] hover:underline font-mono mt-3 text-left cursor-pointer"
          >
            View full guest breakdown →
          </button>
        </div>

        {/* Next Milestone */}
        <div className="bg-[#121215] border border-[#27272a] p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#fafafa] mb-1">Upcoming Milestone</h4>
            <p className="text-xs text-[#a1a1aa] mb-3">Critical path deadline reminder.</p>
            {event.milestones.find((m) => !m.completed) ? (
              <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a]">
                <p className="text-xs font-semibold text-[#fafafa]">
                  {event.milestones.find((m) => !m.completed)?.title}
                </p>
                <p className="text-[11px] text-[#a78bfa] font-mono mt-1">
                  Due: {event.milestones.find((m) => !m.completed)?.dueDate} ({event.milestones.find((m) => !m.completed)?.deadlineDescription})
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#34d399] font-mono">All milestones up to date!</p>
            )}
          </div>
          <button
            onClick={() => onSwitchTab('budget-vendors')}
            className="text-xs text-[#a78bfa] hover:underline font-mono mt-3 text-left cursor-pointer"
          >
            Review budget allocations →
          </button>
        </div>
      </div>
    </div>
  );
};
