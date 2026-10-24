import { describe, it, expect } from 'vitest';
import { 
  dateToKey, 
  isDatePast, 
  calculateDaysCount, 
  isDateRangeBlocked, 
  calculateTotalPrice,
  getDateRangeKeys,
  toggleDateInBlockedList,
  addDatesToBlockedList,
  removeDatesFromBlockedList,
  formatDateKeyDisplay
} from './booking.utils';

describe('booking.utils', () => {
  it('converts date to YYYY-MM-DD key', () => {
    const d = new Date('2026-05-15T12:00:00Z');
    expect(dateToKey(d)).toBe('2026-05-15');
  });

  it('determines if a date is in the past correctly', () => {
    const today = new Date(2026, 5, 10, 12, 0, 0);
    const yesterday = new Date(2026, 5, 9, 12, 0, 0);
    const tomorrow = new Date(2026, 5, 11, 12, 0, 0);

    expect(isDatePast(yesterday, today)).toBe(true);
    expect(isDatePast(today, today)).toBe(false);
    expect(isDatePast(tomorrow, today)).toBe(false);
  });

  it('calculates the number of booking nights correctly', () => {
    const checkIn = new Date('2026-07-01');
    const checkOut = new Date('2026-07-05');
    expect(calculateDaysCount(checkIn, checkOut)).toBe(4);
    expect(calculateDaysCount(null, checkOut)).toBe(0);
    expect(calculateDaysCount(checkIn, null)).toBe(0);
  });

  it('detects blocked date overlap in a selected range', () => {
    const checkIn = new Date('2026-08-01');
    const checkOut = new Date('2026-08-05');
    const bookedDates = new Set(['2026-08-03']);

    expect(isDateRangeBlocked(checkIn, checkOut, bookedDates)).toBe(true);

    const emptyBooked = new Set<string>();
    expect(isDateRangeBlocked(checkIn, checkOut, emptyBooked)).toBe(false);
  });

  it('calculates total price accurately', () => {
    expect(calculateTotalPrice(75, 4)).toBe(300);
    expect(calculateTotalPrice(0, 4)).toBe(0);
    expect(calculateTotalPrice(75, 0)).toBe(0);
  });

  it('generates all date keys in range inclusive', () => {
    const start = new Date(2026, 9, 20); // 2026-10-20
    const end = new Date(2026, 9, 23); // 2026-10-23
    const keys = getDateRangeKeys(start, end);
    expect(keys).toEqual(['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23']);
  });

  it('toggles a date in the blocked list correctly', () => {
    let list: string[] = ['2026-10-20', '2026-10-25'];
    // Toggle existing date (should remove)
    list = toggleDateInBlockedList(list, '2026-10-20');
    expect(list).toEqual(['2026-10-25']);

    // Toggle new date (should add and keep sorted)
    list = toggleDateInBlockedList(list, '2026-10-22');
    expect(list).toEqual(['2026-10-22', '2026-10-25']);
  });

  it('adds and removes multiple dates cleanly', () => {
    const initial = ['2026-10-01'];
    const added = addDatesToBlockedList(initial, ['2026-10-05', '2026-10-03', '2026-10-01']);
    expect(added).toEqual(['2026-10-01', '2026-10-03', '2026-10-05']);

    const removed = removeDatesFromBlockedList(added, ['2026-10-03', '2026-10-99']);
    expect(removed).toEqual(['2026-10-01', '2026-10-05']);
  });

  it('formats date key display', () => {
    const formatted = formatDateKeyDisplay('2026-10-25', 'en-US');
    expect(formatted).toContain('25');
    expect(formatted).toContain('2026');
  });
});
