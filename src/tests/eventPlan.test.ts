import { describe, it, expect } from 'vitest';
import { createDynamicEvent, INITIAL_EVENTS } from '../data/defaultEvents';
import { EventType } from '../types/event';

describe('Dynamic Event Generator & Model Integrity', () => {
  it('starts with an empty initial state with zero hardcoded static events', () => {
    expect(INITIAL_EVENTS).toEqual([]);
  });

  it('dynamically generates complete, valid event suites for all celebration types', () => {
    const celebrationTypes: EventType[] = ['wedding', 'birthday', 'community', 'gala'];

    celebrationTypes.forEach((type) => {
      const event = createDynamicEvent({
        title: `Custom ${type} celebration`,
        type,
        date: '2025-11-20',
        targetBudget: 50000,
        guestCount: 150,
      });

      expect(event.id).toBeTruthy();
      expect(event.type).toBe(type);
      expect(event.targetBudget).toBe(50000);
      expect(event.guestCount).toBe(150);
      expect(event.budgetItems.length).toBe(6);
      expect(event.vendors.length).toBeGreaterThanOrEqual(1);
      expect(event.milestones.length).toBeGreaterThanOrEqual(3);
      expect(event.colorPalette.hexCodes.length).toBeGreaterThanOrEqual(3);
      expect(event.venue.name).toBeTruthy();
      expect(event.venue.capacity).toBeGreaterThanOrEqual(150);
    });
  });

  it('guarantees budget item sum matches target budget', () => {
    const event = createDynamicEvent({
      title: 'Summer Festival',
      type: 'community',
      date: '2025-08-15',
      targetBudget: 100000,
      guestCount: 500,
    });

    const sumAllocated = event.budgetItems.reduce((sum, item) => sum + item.allocated, 0);
    expect(sumAllocated).toBe(100000);
  });

  it('generates dietary breakdown correlated with guest headcount', () => {
    const event = createDynamicEvent({
      title: 'Liam 30th Birthday',
      type: 'birthday',
      date: '2025-09-10',
      targetBudget: 25000,
      guestCount: 80,
    });

    const sumDietary =
      event.dietary.standard +
      event.dietary.vegetarianVegan +
      event.dietary.glutenFree +
      event.dietary.halalKosher +
      event.dietary.allergies;

    expect(sumDietary).toBeGreaterThanOrEqual(75);
    expect(sumDietary).toBeLessThanOrEqual(85);
  });
});
