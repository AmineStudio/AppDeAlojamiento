import { useState, useEffect, useCallback } from 'react';
import { bookingsService } from '../services';
import { 
  dateToKey, 
  isDatePast as isDatePastUtil, 
  calculateDaysCount, 
  isDateRangeBlocked 
} from '../utils/booking.utils';

interface UseBookingCalendarOptions {
  houseId: string;
  onBlockedDateSelected?: (message: string) => void;
}

export function useBookingCalendar({ houseId, onBlockedDateSelected }: UseBookingCalendarOptions) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [currentCalMonth, setCurrentCalMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [guestCount, setGuestCount] = useState<number>(2);
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());

  // Cargar fechas ocupadas para la propiedad actual
  useEffect(() => {
    if (houseId) {
      bookingsService.fetchBookedDatesForHouse(houseId).then(setBookedDates);
    }
  }, [houseId]);

  const isDateBooked = useCallback((d: Date) => {
    return bookedDates.has(dateToKey(d));
  }, [bookedDates]);

  const isDatePast = useCallback((d: Date) => {
    return isDatePastUtil(d);
  }, []);

  const selectDate = useCallback((date: Date) => {
    if (!checkInDate || (checkInDate && checkOutDate)) {
      setCheckInDate(date);
      setCheckOutDate(null);
    } else {
      if (date <= checkInDate) {
        setCheckInDate(date);
        setCheckOutDate(null);
      } else {
        if (isDateRangeBlocked(checkInDate, date, bookedDates)) {
          if (onBlockedDateSelected) {
            onBlockedDateSelected('⚠️ Las fechas seleccionadas contienen días no disponibles. Elige otro periodo.');
          }
          setCheckInDate(date);
          setCheckOutDate(null);
        } else {
          setCheckOutDate(date);
          setCalendarOpen(false);
        }
      }
    }
  }, [checkInDate, checkOutDate, bookedDates, onBlockedDateSelected]);

  const getDaysCount = useCallback(() => {
    return calculateDaysCount(checkInDate, checkOutDate);
  }, [checkInDate, checkOutDate]);

  const resetDates = useCallback(() => {
    setCheckInDate(null);
    setCheckOutDate(null);
  }, []);

  return {
    calendarOpen,
    setCalendarOpen,
    checkInDate,
    setCheckInDate,
    checkOutDate,
    setCheckOutDate,
    currentCalMonth,
    setCurrentCalMonth,
    guestCount,
    setGuestCount,
    bookedDates,
    selectDate,
    isDateBooked,
    isDatePast,
    getDaysCount,
    dateToKey,
    resetDates
  };
}
