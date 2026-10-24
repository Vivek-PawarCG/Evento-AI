import React, { useState } from 'react';
import { EventPlan, AIConceptCard } from '../types/event';
import { generateBespokeConcept, generateCopilotResponse } from '../services/geminiService';
import { Sparkles, Palette, Utensils, Wand2, Download, Copy, Check, Plus, Image as ImageIcon } from 'lucide-react';

interface AIStudioTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

export const AIStudioTab: React.FC<AIStudioTabProps> = ({ event, onUpdateEvent }) => {
  const [selectedTheme, setSelectedTheme] = useState('Cyberpunk Minimalist Luxe');
  const [selectedPalette, setSelectedPalette] = useState('Obsidian Violet & Neon Emerald');
  const [selectedCatering, setSelectedCatering] = useState('Molecular Gastronomy Plated');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom prompt sandbox
  const [customPrompt, setCustomPrompt] = useState('');
  const [customResult, setCustomResult] = useState<string | null>(null);
  const [isPromptGenerating, setIsPromptGenerating] = useState(false);

  const handleGenerateConcept = async () => {
    setIsGenerating(true);
    try {
      const newConcept = await generateBespokeConcept(
        selectedTheme,
        selectedPalette,
        selectedCatering,
        event
      );

      onUpdateEvent({
        ...event,
        concepts: [newConcept, ...event.concepts],
      });
    } catch (err) {
      console.error('Failed to generate concept', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomPromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim() || isPromptGenerating) return;

    setIsPromptGenerating(true);
    try {
      const res = await generateCopilotResponse(customPrompt, event);
      setCustomResult(res.text);
    } catch (err) {
      console.error(err);
      setCustomResult('Failed to generate. Please try again.');
    } finally {
      setIsPromptGenerating(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Top Banner & Generation Wizard */}
      <div className="bg-[#121215] border border-[#27272a] p-6 sm:p-8 rounded-2xl flex flex-col gap-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold text-[#a78bfa] uppercase tracking-wider">
                Generative Architecture
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30 font-mono">
                Gemini Vision Ready
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#fafafa] font-headline tracking-tight">
              AI Concept Studio & Aesthetic Synthesis
            </h2>
            <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1 max-w-2xl">
              Synthesize bespoke themes, signature cocktail formulations, spatial lighting maps, and floral sculptures tailored to {event.title}.
            </p>
          </div>

          <button
            onClick={handleGenerateConcept}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-[#a78bfa] hover:bg-[#c4b5fd] disabled:opacity-60 text-[#0a0012] text-sm font-semibold px-5 py-3 rounded-xl transition-all shadow-lg shadow-[#a78bfa]/20 cursor-pointer active:scale-95 flex-shrink-0"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing with Gemini...' : 'Generate Bespoke Concept'}</span>
          </button>
        </div>

        {/* Wizard Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#27272a]">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#a1a1aa]">
              Theme & Vibe
            </label>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="bg-[#18181b] border border-[#27272a] hover:border-[#52525b] text-[#fafafa] text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:border-[#a78bfa] focus:outline-none transition-all cursor-pointer"
            >
              <option>Cyberpunk Minimalist Luxe</option>
              <option>Modern Gothic Romance</option>
              <option>Neo-Classical Botanical Garden</option>
              <option>Industrial Brutalist Tech</option>
              <option>Ethereal Twilight Dreamscape</option>
              <option>Mid-Century Modern Garden Party</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#a1a1aa]">
              Primary Color Palette
            </label>
            <select
              value={selectedPalette}
              onChange={(e) => setSelectedPalette(e.target.value)}
              className="bg-[#18181b] border border-[#27272a] hover:border-[#52525b] text-[#fafafa] text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:border-[#a78bfa] focus:outline-none transition-all cursor-pointer"
            >
              <option>Obsidian Violet & Neon Emerald</option>
              <option>Midnight Blue & Platinum Silver</option>
              <option>Champagne Gold & Charcoal</option>
              <option>Deep Rose & Obsidian Black</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#a1a1aa]">
              Catering & Mixology Style
            </label>
            <select
              value={selectedCatering}
              onChange={(e) => setSelectedCatering(e.target.value)}
              className="bg-[#18181b] border border-[#27272a] hover:border-[#52525b] text-[#fafafa] text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:border-[#a78bfa] focus:outline-none transition-all cursor-pointer"
            >
              <option>Molecular Gastronomy Plated</option>
              <option>Artisanal Farm-to-Table Buffet</option>
              <option>Global Fusion Tapas Stations</option>
              <option>Plant-Based Haute Cuisine</option>
            </select>
          </div>
        </div>
      </div>

      {/* Generated Concept Cards Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#fafafa]">Active Concept Cards ({event.concepts.length})</h3>
            <p className="text-xs text-[#a1a1aa]">Curated visual and experiential touchpoints for this celebration.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {event.concepts.map((concept) => (
            <div
              key={concept.id}
              className="bg-[#121215] border border-[#27272a] hover:border-[#52525b] transition-all rounded-2xl overflow-hidden flex flex-col justify-between group shadow-lg"
            >
              <div>
                {/* Image Preview with Category Badge */}
                {concept.imageUrl && (
                  <div className="relative w-full h-48 overflow-hidden bg-[#18181b]">
                    <img
                      src={concept.imageUrl}
                      alt={concept.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-transparent opacity-80" />
                    <div className="absolute top-3 left-3 bg-[#09090b]/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#a78bfa] border border-[#27272a]">
                      {concept.badge}
                    </div>
                  </div>
                )}

                <div className="p-5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#34d399] uppercase tracking-wider">
                      {concept.category}
                    </span>
                    {/* Swatches */}
                    <div className="flex items-center gap-1">
                      {concept.paletteColors.map((color, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <h4 className="font-bold text-base text-[#fafafa] leading-snug">{concept.title}</h4>
                  <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                    {concept.description}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-5 pt-0 flex items-center justify-between border-t border-[#27272a]/50 mt-3">
                <button
                  onClick={() => handleCopyText(concept.id, `${concept.title}: ${concept.description}`)}
                  className="flex items-center gap-1.5 text-xs text-[#a1a1aa] hover:text-[#fafafa] font-mono transition-colors cursor-pointer"
                >
                  {copiedId === concept.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#34d399]" />
                      <span className="text-[#34d399]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Concept</span>
                    </>
                  )}
                </button>
                <span className="text-[11px] text-[#71717a] font-mono">Gemini Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Freeform Prompt Generator Sandbox */}
      <div className="bg-[#121215] border border-[#27272a] p-6 sm:p-8 rounded-2xl flex flex-col gap-4 shadow-xl">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#fafafa] flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-[#a78bfa]" /> Custom AI Idea Generator Sandbox
          </h3>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            Brainstorm anything specific: bespoke cocktail names, custom icebreaker games, guest gift box ideas, or floral arrangements.
          </p>
        </div>

        <form onSubmit={handleCustomPromptSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., 'Suggest 4 interactive icebreaker games for a 30th birthday' or 'Eco-friendly party favors'..."
            className="flex-1 bg-[#18181b] border border-[#27272a] focus:border-[#a78bfa] text-sm text-[#fafafa] placeholder-[#71717a] px-4 py-3 rounded-xl focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={isPromptGenerating || !customPrompt.trim()}
            className="bg-[#a78bfa] hover:bg-[#c4b5fd] disabled:opacity-50 text-[#0a0012] font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 flex-shrink-0"
          >
            <Sparkles className={`w-4 h-4 ${isPromptGenerating ? 'animate-spin' : ''}`} />
            <span>{isPromptGenerating ? 'Generating...' : 'Synthesize'}</span>
          </button>
        </form>

        {customResult && (
          <div className="mt-2 p-4 rounded-xl bg-[#18181b] border border-[#27272a] text-xs sm:text-sm text-[#fafafa] whitespace-pre-line leading-relaxed flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs text-[#a78bfa] font-mono border-b border-[#27272a] pb-2">
              <span>Synthesized Response:</span>
              <button
                onClick={() => handleCopyText('sandbox', customResult)}
                className="hover:text-[#fafafa] flex items-center gap-1 cursor-pointer"
              >
                {copiedId === 'sandbox' ? <Check className="w-3.5 h-3.5 text-[#34d399]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'sandbox' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div>{customResult}</div>
          </div>
        )}
      </div>
    </div>
  );
};
