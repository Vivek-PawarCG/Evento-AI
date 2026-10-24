import { BudgetItem } from '../types/event';

export interface BudgetSummary {
  targetBudget: number;
  totalAllocated: number;
  totalSpent: number;
  remainingContingency: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  percentAllocated: number;
  categories: {
    category: string;
    allocated: number;
    percentage: number;
  }[];
}

export function calculateBudgetSummary(targetBudget: number, items: BudgetItem[]): BudgetSummary {
  const safeTarget = Math.max(0, targetBudget);
  const totalAllocated = items.reduce((sum, item) => sum + Math.max(0, item.allocated), 0);
  const totalSpent = items.reduce((sum, item) => sum + Math.max(0, item.spent), 0);
  
  const contingencyItem = items.find((i) => i.category.toLowerCase().includes('contingency'));
  const explicitContingency = contingencyItem ? Math.max(0, contingencyItem.allocated) : 0;
  const unallocatedBuffer = safeTarget - totalAllocated;
  const isOverBudget = totalAllocated > safeTarget;
  const remainingContingency = isOverBudget ? 0 : (unallocatedBuffer > 0 ? unallocatedBuffer : explicitContingency);
  const overBudgetAmount = isOverBudget ? totalAllocated - safeTarget : 0;
  
  const percentAllocated = safeTarget > 0 
    ? Math.min(100, Math.round((totalAllocated / safeTarget) * 100))
    : 0;

  const categories = items.map((item) => ({
    category: item.category,
    allocated: item.allocated,
    percentage: totalAllocated > 0 ? Math.round((item.allocated / totalAllocated) * 100) : 0,
  }));

  return {
    targetBudget: safeTarget,
    totalAllocated,
    totalSpent,
    remainingContingency: Math.max(0, remainingContingency),
    isOverBudget,
    overBudgetAmount,
    percentAllocated,
    categories,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateDaysRemaining(targetDateStr: string): {
  days: number;
  isPast: boolean;
  displayText: string;
} {
  try {
    const target = new Date(targetDateStr).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (isNaN(diff)) {
      return { days: 0, isPast: false, displayText: 'Date not set' };
    }

    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) {
      return { days: Math.abs(days), isPast: true, displayText: `${Math.abs(days)} days ago` };
    }
    if (days === 0) {
      return { days: 0, isPast: false, displayText: 'Today is event day!' };
    }
    return { days, isPast: false, displayText: `${days} days remaining` };
  } catch {
    return { days: 0, isPast: false, displayText: 'Invalid date' };
  }
}
