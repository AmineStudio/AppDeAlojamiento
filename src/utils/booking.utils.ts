/**
 * Utilidades puras para el cálculo de reservas y gestión de fechas.
 */

export const dateToKey = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isDatePast = (d: Date, referenceDate: Date = new Date()): boolean => {
  const refKey = dateToKey(referenceDate);
  const targetKey = dateToKey(d);
  return targetKey < refKey;
};

export const calculateDaysCount = (checkIn: Date | null, checkOut: Date | null): number => {
  if (!checkIn || !checkOut) return 0;
  const diffTime = checkOut.getTime() - checkIn.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const isDateRangeBlocked = (
  checkIn: Date,
  checkOut: Date,
  bookedDates: Set<string>
): boolean => {
  const current = new Date(checkIn);
  while (current < checkOut) {
    if (bookedDates.has(dateToKey(current))) {
      return true;
    }
    current.setDate(current.getDate() + 1);
  }
  return false;
};

export const calculateTotalPrice = (pricePerNight: number, days: number): number => {
  if (days <= 0 || pricePerNight <= 0) return 0;
  return pricePerNight * days;
};
