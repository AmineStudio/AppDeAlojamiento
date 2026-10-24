import { useState, useEffect, useCallback, useMemo } from 'react';
import { bookingsService } from '../services';
import { 
  dateToKey, 
  isDatePast as isDatePastUtil, 
  calculateDaysCount, 
  isDateRangeBlocked 
} from '../utils/booking.utils';
import textos from '../content/textos.json';

interface UseBookingCalendarOptions {
  houseId: string;
  roomBlockedDates?: string[];
  onBlockedDateSelected?: (message: string) => void;
}

export function useBookingCalendar({ houseId, roomBlockedDates, onBlockedDateSelected }: UseBookingCalendarOptions) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [currentCalMonth, setCurrentCalMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [guestCount, setGuestCount] = useState<number>(2);
  const [houseBookedDates, setHouseBookedDates] = useState<Set<string>>(new Set());

  // Cargar fechas ocupadas para la propiedad actual desde reservas de Firestore
  useEffect(() => {
    if (houseId) {
      bookingsService.fetchBookedDatesForHouse(houseId).then(setHouseBookedDates);
    }
  }, [houseId]);

  // Combinar reservas de la casa con fechas bloqueadas específicamente para la habitación
  const bookedDates = useMemo(() => {
    const combined = new Set<string>(houseBookedDates);
    if (roomBlockedDates && roomBlockedDates.length > 0) {
      roomBlockedDates.forEach(d => combined.add(d));
    }
    return combined;
  }, [houseBookedDates, roomBlockedDates]);

  // Si las fechas seleccionadas colisionan con las nuevas fechas bloqueadas de la habitación, resetear
  useEffect(() => {
    if (checkInDate && checkOutDate && isDateRangeBlocked(checkInDate, checkOutDate, bookedDates)) {
      setCheckInDate(null);
      setCheckOutDate(null);
      if (onBlockedDateSelected) {
        onBlockedDateSelected(textos.notificaciones.fechasBloqueadas);
      }
    }
  }, [bookedDates, checkInDate, checkOutDate, onBlockedDateSelected]);

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
            onBlockedDateSelected(textos.notificaciones.fechasBloqueadas);
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
