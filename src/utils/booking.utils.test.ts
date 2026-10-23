import { describe, it, expect } from 'vitest';
import { 
  dateToKey, 
  isDatePast, 
  calculateDaysCount, 
  isDateRangeBlocked, 
  calculateTotalPrice 
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
});
