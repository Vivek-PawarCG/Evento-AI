import React, { useState } from 'react';
import { EventPlan, BudgetItem, Vendor } from '../types/event';
import { calculateBudgetSummary, formatCurrency } from '../utils/budgetCalculator';
import confetti from 'canvas-confetti';
import {
  DollarSign,
  AlertTriangle,
  Sparkles,
  Handshake,
  CheckCircle2,
  FileText,
  Mail,
  Plus,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

interface BudgetVendorsTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

export const BudgetVendorsTab: React.FC<BudgetVendorsTabProps> = ({ event, onUpdateEvent }) => {
  const budgetSummary = calculateBudgetSummary(event.targetBudget, event.budgetItems);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showAddVendor, setShowAddVendor] = useState(false);

  // New Vendor form state
  const [vendorName, setVendorName] = useState('');
  const [vendorCategory, setVendorCategory] = useState('Catering & Bar');
  const [vendorPrice, setVendorPrice] = useState('15000');
  const [vendorDesc, setVendorDesc] = useState('');

  const handleSliderChange = (itemId: string, newAllocated: number) => {
    const updatedItems = event.budgetItems.map((item) =>
      item.id === itemId ? { ...item, allocated: newAllocated } : item
    );

    onUpdateEvent({
      ...event,
      budgetItems: updatedItems,
    });
  };

  const handleAutoBalance = () => {
    // 40% Venue, 28% Catering, 14% AV, 10% Decor, 5% Entertainment, 3% Contingency
    const target = event.targetBudget;
    const balanced: BudgetItem[] = [
      { id: 'b1', category: 'Venue & Rentals', allocated: Math.round(target * 0.40), spent: Math.round(target * 0.40), min: 5000, max: target },
      { id: 'b2', category: 'Catering & Bar', allocated: Math.round(target * 0.28), spent: Math.round(target * 0.25), min: 3000, max: target },
      { id: 'b3', category: 'Photography & AV', allocated: Math.round(target * 0.14), spent: Math.round(target * 0.12), min: 2000, max: target },
      { id: 'b4', category: 'Decor & Florals', allocated: Math.round(target * 0.10), spent: Math.round(target * 0.08), min: 1000, max: target },
      { id: 'b5', category: 'Entertainment', allocated: Math.round(target * 0.05), spent: Math.round(target * 0.05), min: 1000, max: target },
      { id: 'b6', category: 'Contingency', allocated: Math.round(target * 0.03), spent: 0, min: 500, max: target },
    ];

    onUpdateEvent({
      ...event,
      budgetItems: balanced,
    });

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#a78bfa', '#34d399', '#ffffff'],
    });
  };

  const handleVendorStatusChange = (vendorId: string, newStatus: Vendor['status']) => {
    const updatedVendors = event.vendors.map((v) =>
      v.id === vendorId ? { ...v, status: newStatus } : v
    );

    onUpdateEvent({
      ...event,
      vendors: updatedVendors,
    });

    if (newStatus === 'contract_signed') {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#34d399', '#a78bfa', '#f59e0b'],
      });
    }
  };

  const handleAddVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim()) return;

    const newVendor: Vendor = {
      id: `v-${Date.now()}`,
      name: vendorName.trim(),
      category: vendorCategory,
      price: parseInt(vendorPrice) || 5000,
      rating: 4.9,
      matchScore: 92,
      description: vendorDesc || 'Added by planning committee.',
      status: 'shortlisted',
      contactEmail: 'contact@vendor.com',
      features: ['Custom Proposal', 'Insured & Bonded', 'Flexible Payment Schedule'],
    };

    onUpdateEvent({
      ...event,
      vendors: [newVendor, ...event.vendors],
    });

    setVendorName('');
    setVendorDesc('');
    setShowAddVendor(false);
  };

  const filteredVendors = event.vendors.filter((v) => {
    if (selectedFilter === 'all') return true;
    return v.status === selectedFilter;
  });

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Interactive Budget Allocation Sliders */}
      <div className="bg-[#121215] border border-[#27272a] p-6 sm:p-8 rounded-2xl flex flex-col gap-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#fafafa] font-headline tracking-tight">
              Interactive Budget Allocation & Real-Time Cap Engine
            </h2>
            <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1">
              Adjust sliders dynamically to simulate trade-offs. The allocation engine guarantees contingency safety.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAutoBalance}
              className="flex items-center gap-1.5 bg-[#18181b] hover:bg-[#1e1e22] text-xs font-mono text-[#a78bfa] border border-[#a78bfa]/30 hover:border-[#a78bfa] px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#a78bfa]" />
              <span>Auto-Balance Allocations</span>
            </button>
          </div>
        </div>

        {/* Budget Status Metric Line */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#18181b] border border-[#27272a]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#a1a1aa] font-mono">Total Budget Cap:</span>
            <span className="text-sm font-bold text-[#fafafa] font-mono">
              {formatCurrency(budgetSummary.targetBudget)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#a1a1aa] font-mono">Allocated:</span>
            <span
              className={`text-sm font-bold font-mono ${
                budgetSummary.isOverBudget ? 'text-[#ef4444]' : 'text-[#a78bfa]'
              }`}
            >
              {formatCurrency(budgetSummary.totalAllocated)} ({budgetSummary.percentAllocated}%)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#a1a1aa] font-mono">Contingency Reserve:</span>
            <span className="text-sm font-bold text-[#34d399] font-mono">
              {formatCurrency(budgetSummary.remainingContingency)}
            </span>
          </div>
        </div>

        {/* Live Overbudget Warning Banner */}
        {budgetSummary.isOverBudget && (
          <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 flex items-start gap-3 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-[#ef4444] flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-[#ef4444]">
              <strong>Budget Cap Exceeded:</strong> Total allocations currently exceed your target cap by{' '}
              <strong>{formatCurrency(budgetSummary.overBudgetAmount)}</strong>. Reduce allocations or increase your target budget in event settings.
            </div>
          </div>
        )}

        {/* Category Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {event.budgetItems.map((item) => {
            const percentOfTotal = budgetSummary.totalAllocated > 0
              ? Math.round((item.allocated / budgetSummary.totalAllocated) * 100)
              : 0;

            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 p-4 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-[#52525b] transition-all"
              >
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-semibold text-[#fafafa]">{item.category}</span>
                  <span className="font-bold text-[#a78bfa]">{formatCurrency(item.allocated)}</span>
                </div>

                <input
                  type="range"
                  min={item.min}
                  max={item.max}
                  step={500}
                  value={item.allocated}
                  onChange={(e) => handleSliderChange(item.id, parseInt(e.target.value))}
                  className="w-full accent-[#a78bfa] bg-[#27272a] rounded-lg h-1.5 cursor-pointer"
                />

                <div className="flex justify-between items-center text-[10px] text-[#71717a] font-mono">
                  <span>Range: {formatCurrency(item.min)} – {formatCurrency(item.max)}</span>
                  <span>{percentOfTotal}% of total</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vendor Management & Checklist */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#fafafa] font-headline">
              AI-Matched Vendors & Contract Checklist
            </h3>
            <p className="text-xs text-[#a1a1aa]">
              Review proposals, track contract signatures, and manage deposits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-[#121215] border border-[#27272a] p-1 rounded-xl text-xs font-mono">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedFilter === 'all' ? 'bg-[#a78bfa] text-[#0a0012] font-semibold' : 'text-[#a1a1aa] hover:text-[#fafafa]'
                }`}
              >
                All ({event.vendors.length})
              </button>
              <button
                onClick={() => setSelectedFilter('contract_signed')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedFilter === 'contract_signed' ? 'bg-[#34d399] text-[#0a0012] font-semibold' : 'text-[#a1a1aa] hover:text-[#fafafa]'
                }`}
              >
                Signed
              </button>
              <button
                onClick={() => setSelectedFilter('contract_pending')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedFilter === 'contract_pending' ? 'bg-[#a78bfa] text-[#0a0012] font-semibold' : 'text-[#a1a1aa] hover:text-[#fafafa]'
                }`}
              >
                Pending
              </button>
            </div>

            <button
              onClick={() => setShowAddVendor(true)}
              className="flex items-center gap-1.5 bg-[#a78bfa] hover:bg-[#c4b5fd] text-[#0a0012] text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-[#a78bfa]/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vendor</span>
            </button>
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => {
            const isSigned = vendor.status === 'contract_signed';
            const isPending = vendor.status === 'contract_pending';

            return (
              <div
                key={vendor.id}
                className="bg-[#121215] border border-[#27272a] hover:border-[#52525b] transition-all p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-lg group"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30">
                      {vendor.matchScore}% AI Match
                    </span>
                    <span className="text-sm font-bold font-mono text-[#fafafa]">
                      {formatCurrency(vendor.price)}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-[#fafafa] leading-snug">{vendor.name}</h4>
                  <p className="text-xs text-[#a78bfa] font-mono mb-2">{vendor.category} • {vendor.rating} ★</p>

                  <p className="text-xs text-[#a1a1aa] leading-relaxed mb-3">
                    {vendor.description}
                  </p>

                  {/* Feature Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {vendor.features.map((feat, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18181b] text-[#a1a1aa] border border-[#27272a]"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status selector & Actions */}
                <div className="flex flex-col gap-2 pt-3 border-t border-[#27272a]">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#a1a1aa]">Contract Status:</span>
                    <span
                      className={`font-semibold capitalize ${
                        isSigned
                          ? 'text-[#34d399]'
                          : isPending
                          ? 'text-[#a78bfa]'
                          : 'text-[#f59e0b]'
                      }`}
                    >
                      {vendor.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {!isSigned ? (
                      <button
                        onClick={() => handleVendorStatusChange(vendor.id, 'contract_signed')}
                        className="w-full bg-[#34d399] hover:bg-[#6ee7b7] text-[#001a12] text-xs font-semibold py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sign Contract</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVendorStatusChange(vendor.id, 'shortlisted')}
                        className="w-full bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] text-xs font-medium py-2 rounded-lg transition-all cursor-pointer"
                      >
                        Re-open Bid
                      </button>
                    )}

                    <button
                      onClick={() => alert(`Proposal and scope of work dispatched to ${vendor.contactEmail}`)}
                      className="w-full bg-[#18181b] hover:bg-[#1e1e22] text-[#fafafa] text-xs font-medium py-2 rounded-lg border border-[#27272a] hover:border-[#52525b] transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#a78bfa]" />
                      <span>Contact</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Vendor Modal */}
      {showAddVendor && (
        <div className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-[#27272a] max-w-md w-full p-6 rounded-2xl flex flex-col gap-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#fafafa]">Add New Vendor Proposal</h3>
            <form onSubmit={handleAddVendorSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-[#a1a1aa] font-mono">Vendor Name</label>
                <input
                  type="text"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g., Solstice Lighting Co."
                  className="w-full bg-[#18181b] border border-[#27272a] text-sm text-[#fafafa] px-3.5 py-2.5 rounded-lg mt-1 focus:border-[#a78bfa] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#a1a1aa] font-mono">Category</label>
                  <select
                    value={vendorCategory}
                    onChange={(e) => setVendorCategory(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#27272a] text-sm text-[#fafafa] px-3.5 py-2.5 rounded-lg mt-1 focus:border-[#a78bfa] outline-none cursor-pointer"
                  >
                    <option>Catering & Bar</option>
                    <option>Production & AV</option>
                    <option>Cinematography</option>
                    <option>Decor & Florals</option>
                    <option>Entertainment</option>
                    <option>Rentals & Tent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#a1a1aa] font-mono">Estimated Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={vendorPrice}
                    onChange={(e) => setVendorPrice(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#27272a] text-sm text-[#fafafa] px-3.5 py-2.5 rounded-lg mt-1 focus:border-[#a78bfa] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#a1a1aa] font-mono">Description / Notes</label>
                <textarea
                  rows={3}
                  value={vendorDesc}
                  onChange={(e) => setVendorDesc(e.target.value)}
                  placeholder="Details about packages, reviews, or special perks..."
                  className="w-full bg-[#18181b] border border-[#27272a] text-sm text-[#fafafa] px-3.5 py-2.5 rounded-lg mt-1 focus:border-[#a78bfa] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setShowAddVendor(false)}
                  className="px-4 py-2 rounded-lg bg-[#18181b] text-xs font-mono text-[#a1a1aa] hover:text-[#fafafa] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#a78bfa] text-xs font-semibold text-[#0a0012] hover:bg-[#c4b5fd] cursor-pointer"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
