import { describe, it, expect } from 'vitest';
import { calculateBudgetSummary, formatCurrency, calculateDaysRemaining } from '../utils/budgetCalculator';
import { BudgetItem } from '../types/event';

describe('Budget Calculator Utilities', () => {
  const sampleItems: BudgetItem[] = [
    { id: '1', category: 'Venue & Rentals', allocated: 40000, spent: 40000, min: 10000, max: 60000 },
    { id: '2', category: 'Catering & Bar', allocated: 30000, spent: 28000, min: 5000, max: 50000 },
    { id: '3', category: 'Photography & AV', allocated: 15000, spent: 15000, min: 5000, max: 25000 },
    { id: '4', category: 'Decor & Florals', allocated: 10000, spent: 8000, min: 2000, max: 20000 },
  ];

  it('correctly calculates total allocated and remaining contingency when within cap', () => {
    const targetBudget = 100000;
    const summary = calculateBudgetSummary(targetBudget, sampleItems);

    expect(summary.totalAllocated).toBe(95000);
    expect(summary.remainingContingency).toBe(5000);
    expect(summary.isOverBudget).toBe(false);
    expect(summary.overBudgetAmount).toBe(0);
    expect(summary.percentAllocated).toBe(95);
  });

  it('flags over-budget condition and calculates exact overage when allocations exceed cap', () => {
    const targetBudget = 90000;
    const summary = calculateBudgetSummary(targetBudget, sampleItems);

    expect(summary.totalAllocated).toBe(95000);
    expect(summary.remainingContingency).toBe(0);
    expect(summary.isOverBudget).toBe(true);
    expect(summary.overBudgetAmount).toBe(5000);
  });

  it('correctly calculates category distribution percentages', () => {
    const targetBudget = 100000;
    const summary = calculateBudgetSummary(targetBudget, sampleItems);

    const venue = summary.categories.find((c) => c.category === 'Venue & Rentals');
    expect(venue).toBeDefined();
    expect(venue?.percentage).toBe(42); // 40000 / 95000 = ~42%
  });

  it('handles zero or negative budget safely without dividing by zero', () => {
    const summary = calculateBudgetSummary(0, []);
    expect(summary.totalAllocated).toBe(0);
    expect(summary.percentAllocated).toBe(0);
    expect(summary.isOverBudget).toBe(false);
  });

  it('formats currency correctly in Indian Rupees (INR)', () => {
    expect(formatCurrency(125000)).toBe('₹1,25,000');
    expect(formatCurrency(0)).toBe('₹0');
  });

  it('calculates days remaining accurately', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateStr = futureDate.toISOString().split('T')[0];

    const result = calculateDaysRemaining(dateStr);
    expect(result.days).toBeGreaterThanOrEqual(29);
    expect(result.days).toBeLessThanOrEqual(31);
    expect(result.isPast).toBe(false);
  });
});
