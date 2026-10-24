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

/**
 * Retorna todas las claves de fecha (YYYY-MM-DD) entre dos fechas inclusive.
 */
export const getDateRangeKeys = (startDate: Date, endDate: Date): string[] => {
  const keys: string[] = [];
  const start = new Date(Math.min(startDate.getTime(), endDate.getTime()));
  const end = new Date(Math.max(startDate.getTime(), endDate.getTime()));
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const curr = new Date(start);
  while (curr <= end) {
    keys.push(dateToKey(curr));
    curr.setDate(curr.getDate() + 1);
  }
  return keys;
};

/**
 * Alterna (agrega o remueve) una fecha en la lista de fechas bloqueadas y mantiene el orden cronológico.
 */
export const toggleDateInBlockedList = (
  blockedDates: string[] | undefined,
  dateKey: string
): string[] => {
  const current = new Set(blockedDates || []);
  if (current.has(dateKey)) {
    current.delete(dateKey);
  } else {
    current.add(dateKey);
  }
  return Array.from(current).sort();
};

/**
 * Agrega un conjunto de fechas a la lista de bloqueadas asegurando unicidad y orden cronológico.
 */
export const addDatesToBlockedList = (
  blockedDates: string[] | undefined,
  newDates: string[]
): string[] => {
  const combined = new Set(blockedDates || []);
  newDates.forEach(d => combined.add(d));
  return Array.from(combined).sort();
};

/**
 * Remueve un conjunto de fechas de la lista de fechas bloqueadas.
 */
export const removeDatesFromBlockedList = (
  blockedDates: string[] | undefined,
  datesToRemove: string[]
): string[] => {
  const toRemove = new Set(datesToRemove);
  const current = blockedDates || [];
  return current.filter(d => !toRemove.has(d)).sort();
};

/**
 * Formatea una clave YYYY-MM-DD para visualización amigable (ej: "25 Oct 2026").
 */
export const formatDateKeyDisplay = (dateKey: string, locale: string = 'en-US'): string => {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) return dateKey;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
};
