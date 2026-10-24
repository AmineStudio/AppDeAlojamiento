import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Lock, 
  Unlock, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Trash2, 
  Sparkles, 
  AlertCircle,
  Clock,
  Bed,
  Home
} from 'lucide-react';
import { House, Room } from '../types';
import { BookingRecord } from '../services';
import { 
  dateToKey, 
  isDatePast, 
  getDateRangeKeys, 
  toggleDateInBlockedList, 
  addDatesToBlockedList, 
  removeDatesFromBlockedList,
  formatDateKeyDisplay
} from '../utils/booking.utils';
import textos from '../content/textos.json';

interface RoomCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  house: House;
  room: Room;
  allRooms?: Room[];
  onSwitchRoom?: (room: Room) => void;
  onSaveBlockedDates: (houseId: string, roomId: string, blockedDates: string[]) => Promise<{ success: boolean; error?: string }>;
  pastBookings?: BookingRecord[];
  showToast: (msg: string) => void;
}

export function RoomCalendarModal({
  isOpen,
  onClose,
  house,
  room,
  allRooms = [],
  onSwitchRoom,
  onSaveBlockedDates,
  pastBookings = [],
  showToast
}: RoomCalendarModalProps) {
  const tCal = textos.panel.calendarioTab;
  const tToast = textos.panel.toasts;

  // Fechas bloqueadas locales
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [initialBlockedDates, setInitialBlockedDates] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Navegación de mes en el calendario
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Rango de fechas seleccionado para acciones masivas
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

  // Sincronizar estado al abrir o cambiar de habitación
  useEffect(() => {
    if (isOpen && room) {
      const dates = room.blockedDates || [];
      setBlockedDates(dates);
      setInitialBlockedDates(dates);
      setRangeStart(null);
      setRangeEnd(null);
    }
  }, [isOpen, room?.id, room?.blockedDates]);

  // Verificar si hay cambios sin guardar
  const hasChanges = useMemo(() => {
    if (blockedDates.length !== initialBlockedDates.length) return true;
    const initialSet = new Set(initialBlockedDates);
    return blockedDates.some(d => !initialSet.has(d));
  }, [blockedDates, initialBlockedDates]);

  // Calcular fechas reservadas por huéspedes para esta casa/habitación
  const guestBookedDates = useMemo(() => {
    const booked = new Set<string>();
    pastBookings.forEach(b => {
      if (b.houseId === house.id && (!b.roomId || b.roomId === room.id) && b.checkIn && b.checkOut) {
        const start = new Date(b.checkIn);
        const end = new Date(b.checkOut);
        const curr = new Date(start);
        while (curr < end) {
          booked.add(dateToKey(curr));
          curr.setDate(curr.getDate() + 1);
        }
      }
    });
    return booked;
  }, [pastBookings, house.id, room.id]);

  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);

  // Guardar cambios en Firestore
  const handleSave = async (datesToSave?: string[]) => {
    const finalDates = datesToSave !== undefined ? datesToSave : blockedDates;
    setIsSaving(true);
    const res = await onSaveBlockedDates(house.id, room.id, finalDates);
    setIsSaving(false);
    if (res.success) {
      setInitialBlockedDates(finalDates);
      showToast(tCal.guardadoExitoso);
    } else {
      showToast(textos.notificaciones.errorGuardar + (res.error ? `: ${res.error}` : ''));
    }
  };

  // Manejo de clic en un día del calendario
  const handleDateClick = (date: Date) => {
    const key = dateToKey(date);

    // Si ya hay un inicio y fin seleccionados, reiniciar seleccionando este nuevo día
    if (rangeStart && rangeEnd) {
      setRangeStart(date);
      setRangeEnd(null);
      return;
    }

    // Si no hay inicio, establecer como inicio
    if (!rangeStart) {
      setRangeStart(date);
      return;
    }

    // Si hace clic en la misma fecha de inicio, toggle inmediato de bloqueo
    if (dateToKey(rangeStart) === key) {
      const updated = toggleDateInBlockedList(blockedDates, key);
      setBlockedDates(updated);
      setRangeStart(null);
      setRangeEnd(null);
      return;
    }

    // Si hace clic en una fecha posterior, establecer como fin de rango
    if (date > rangeStart) {
      setRangeEnd(date);
    } else {
      // Si hizo clic en una fecha anterior, actualizar el inicio
      setRangeStart(date);
      setRangeEnd(null);
    }
  };

  // Bloquear rango seleccionado
  const handleBlockRange = () => {
    if (!rangeStart || !rangeEnd) return;
    const keys = getDateRangeKeys(rangeStart, rangeEnd);
    const updated = addDatesToBlockedList(blockedDates, keys);
    setBlockedDates(updated);
    setRangeStart(null);
    setRangeEnd(null);
    showToast(tToast.datesBlocked.replace('{name}', room.name));
  };

  // Desbloquear rango seleccionado
  const handleUnblockRange = () => {
    if (!rangeStart || !rangeEnd) return;
    const keys = getDateRangeKeys(rangeStart, rangeEnd);
    const updated = removeDatesFromBlockedList(blockedDates, keys);
    setBlockedDates(updated);
    setRangeStart(null);
    setRangeEnd(null);
    showToast(tToast.datesUnblocked.replace('{name}', room.name));
  };

  // Preset: Bloquear próximo fin de semana (sábado y domingo)
  const handleBlockUpcomingWeekend = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 domingo, 6 sábado
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    const sat = new Date(today);
    sat.setDate(today.getDate() + daysUntilSaturday);
    const sun = new Date(sat);
    sun.setDate(sat.getDate() + 1);

    const keys = [dateToKey(sat), dateToKey(sun)];
    const updated = addDatesToBlockedList(blockedDates, keys);
    setBlockedDates(updated);
    showToast(tToast.datesBlocked.replace('{name}', room.name));
  };

  // Preset: Bloquear próximos 7 días
  const handleBlockNext7Days = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 6);

    const keys = getDateRangeKeys(today, nextWeek);
    const updated = addDatesToBlockedList(blockedDates, keys);
    setBlockedDates(updated);
    showToast(tToast.datesBlocked.replace('{name}', room.name));
  };

  // Desbloquear todas las fechas
  const handleClearAllBlocked = () => {
    if (blockedDates.length === 0) return;
    if (window.confirm(tCal.confirmarDesbloquearTodo)) {
      setBlockedDates([]);
      showToast(tToast.datesCleared.replace('{name}', room.name));
    }
  };

  // Eliminar una fecha bloqueada específica
  const handleRemoveSingleDate = (dateKey: string) => {
    const updated = blockedDates.filter(d => d !== dateKey);
    setBlockedDates(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div 
        className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-[rgba(63,67,77,0.1)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-6 pb-4 bg-gradient-to-b from-[#FBF7EC] to-white border-b border-[rgba(63,67,77,0.08)] flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-200/60 text-[#888B47] flex items-center justify-center shrink-0 shadow-sm">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#3D7A95] bg-[#CFE4EC]/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Home className="h-3 w-3" /> {house.name}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#888B47] bg-[#F5EFE0] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Bed className="h-3 w-3" /> {room.beds}
                </span>
                <span className="text-[10px] font-bold text-[#3F434D] bg-white border border-[rgba(63,67,77,0.1)] px-2.5 py-0.5 rounded-full">
                  €{room.price} {textos.home.perNight}
                </span>
              </div>
              <h3 className="font-display font-medium text-2xl text-[#3F434D]">
                {room.name}
              </h3>
              <p className="text-xs text-[#6E727C] mt-0.5">
                {tCal.subtitulo}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-white hover:bg-[#F5EFE0] text-[#6E727C] hover:text-[#3F434D] border border-[rgba(63,67,77,0.1)] flex items-center justify-center transition-colors shrink-0"
            title={textos.general.cancelar}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selector de habitaciones (si hay más de una en la casa) */}
        {allRooms.length > 1 && (
          <div className="px-6 py-2.5 bg-[#FBF7EC]/60 border-b border-[rgba(63,67,77,0.06)] flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E727C] shrink-0 mr-1">
              {tCal.seleccionarHabitacion}:
            </span>
            {allRooms.map(r => {
              const isCurrent = r.id === room.id;
              const count = (r.blockedDates || []).length;
              return (
                <button
                  key={r.id}
                  onClick={() => onSwitchRoom && onSwitchRoom(r)}
                  className={`py-1 px-3 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-[#3F434D] text-white shadow-sm'
                      : 'bg-white border border-[rgba(63,67,77,0.1)] text-[#6E727C] hover:bg-[#F5EFE0] hover:text-[#3F434D]'
                  }`}
                >
                  <span>{r.name}</span>
                  {count > 0 && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      isCurrent ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Cuerpo del Modal */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Barra de Acciones Rápidas y Presets */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FBF7EC] p-3.5 rounded-2xl border border-[rgba(63,67,77,0.08)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mr-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[#E6BE7A]" /> {tCal.shortcuts}
              </span>
              <button
                onClick={handleBlockUpcomingWeekend}
                className="py-1 px-3 bg-white border border-[rgba(63,67,77,0.1)] hover:border-[#3D7A95] hover:text-[#3D7A95] rounded-xl text-xs font-medium text-[#3F434D] transition-colors shadow-2xs"
              >
                {tCal.bloquearFinDeSemana}
              </button>
              <button
                onClick={handleBlockNext7Days}
                className="py-1 px-3 bg-white border border-[rgba(63,67,77,0.1)] hover:border-[#3D7A95] hover:text-[#3D7A95] rounded-xl text-xs font-medium text-[#3F434D] transition-colors shadow-2xs"
              >
                {tCal.bloquearProximaSemana}
              </button>
              {blockedDates.length > 0 && (
                <button
                  onClick={handleClearAllBlocked}
                  className="py-1 px-3 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-medium transition-colors shadow-2xs flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  {tCal.desbloquearTodo}
                </button>
              )}
            </div>

            {/* Contador de fechas bloqueadas */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#3F434D] bg-white border border-[rgba(63,67,77,0.1)] px-3 py-1 rounded-full shadow-2xs flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                {tCal.totalBloqueadas.replace('{count}', String(blockedDates.length))}
              </span>
            </div>
          </div>

          {/* Banner de Rango Seleccionado */}
          {rangeStart && (
            <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-medium text-sky-900">
                <CalendarIcon className="h-4 w-4 text-[#3D7A95]" />
                <span>
                  {tCal.rangoSeleccionado}: <strong>{formatDateKeyDisplay(dateToKey(rangeStart))}</strong>
                  {rangeEnd && (
                    <> → <strong>{formatDateKeyDisplay(dateToKey(rangeEnd))}</strong></>
                  )}
                  {!rangeEnd && <span className="text-sky-600 text-[11px] ml-1">{tCal.rangeInstruction}</span>}
                </span>
              </div>

              {rangeStart && rangeEnd && (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleBlockRange}
                    className="py-1.5 px-3 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    {tCal.bloquearRango}
                  </button>
                  <button
                    onClick={handleUnblockRange}
                    className="py-1.5 px-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Unlock className="h-3.5 w-3.5" />
                    {tCal.desbloquearRango}
                  </button>
                  <button
                    onClick={() => { setRangeStart(null); setRangeEnd(null); }}
                    className="py-1.5 px-2 text-xs text-[#6E727C] hover:text-[#3F434D] font-medium"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Leyenda explicativa */}
          <div className="flex items-center justify-between flex-wrap gap-3 text-xs text-[#6E727C] border-b border-[rgba(63,67,77,0.06)] pb-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-white border border-[rgba(63,67,77,0.2)]"></span>
                <span>{tCal.disponible}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-rose-100 border border-rose-300"></span>
                <span className="text-rose-700 font-semibold flex items-center gap-1">
                  <Lock className="h-3 w-3" /> {tCal.bloqueadoPorAnfitriona}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-sky-100 border border-sky-300"></span>
                <span className="text-sky-800 font-semibold">{tCal.reservaHuesped}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-gray-100 border border-gray-200"></span>
                <span>{tCal.pasada}</span>
              </div>
            </div>

            <span className="text-[11px] text-[#888B47] font-medium">
              💡 {tCal.instrucciones}
            </span>
          </div>

          {/* Visualizador de Meses Dual / Interactivo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[0, 1].map(offset => {
              const targetMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
              const monthName = targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              const firstDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
              const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
              const startWeekday = (firstDay.getDay() + 6) % 7; // Monday = 0
              const daysInMonth = lastDay.getDate();

              return (
                <div key={offset} className="bg-white rounded-2xl p-4 border border-[rgba(63,67,77,0.08)] shadow-2xs">
                  {/* Month header */}
                  <div className="flex items-center justify-between mb-4">
                    {offset === 0 ? (
                      <button
                        onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                        className="h-8 w-8 rounded-full hover:bg-[#F5EFE0] text-[#3F434D] flex items-center justify-center transition-colors"
                        title={tCal.monthPrevious}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    ) : <div className="w-8"></div>}

                    <h4 className="font-display font-medium text-base text-[#3F434D] capitalize">
                      {monthName}
                    </h4>

                    {offset === 1 ? (
                      <button
                        onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                        className="h-8 w-8 rounded-full hover:bg-[#F5EFE0] text-[#3F434D] flex items-center justify-center transition-colors"
                        title={tCal.monthNext}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : <div className="w-8"></div>}
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                      <div key={idx} className="text-[10px] font-bold text-[#6E727C] py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Cuadrícula de días */}
                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {Array.from({ length: startWeekday }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square"></div>
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, dayIdx) => {
                      const dayNum = dayIdx + 1;
                      const d = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), dayNum);
                      d.setHours(0, 0, 0, 0);
                      const dKey = dateToKey(d);

                      const isPast = isDatePast(d);
                      const isHostBlocked = blockedSet.has(dKey);
                      const isGuestBooked = guestBookedDates.has(dKey);

                      // Estado de selección de rango
                      const isRangeStart = rangeStart && dateToKey(rangeStart) === dKey;
                      const isRangeEnd = rangeEnd && dateToKey(rangeEnd) === dKey;
                      const isInRange = rangeStart && rangeEnd && d > rangeStart && d < rangeEnd;

                      let cellClass = "aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-semibold relative transition-all duration-150 select-none cursor-pointer ";

                      if (isRangeStart || isRangeEnd) {
                        cellClass += "ring-2 ring-[#3D7A95] bg-[#3D7A95] text-white font-bold shadow-sm ";
                      } else if (isInRange) {
                        cellClass += "bg-[#CFE4EC] text-[#3D7A95] font-bold ";
                      } else if (isHostBlocked) {
                        cellClass += "bg-rose-100/80 text-rose-800 border border-rose-300 hover:bg-rose-200/80 ";
                      } else if (isGuestBooked) {
                        cellClass += "bg-sky-100/90 text-sky-800 border border-sky-300 cursor-not-allowed ";
                      } else if (isPast) {
                        cellClass += "text-gray-300 bg-gray-50/50 cursor-not-allowed ";
                      } else {
                        cellClass += "bg-white border border-[rgba(63,67,77,0.1)] hover:bg-[#F5EFE0] text-[#3F434D] ";
                      }

                      return (
                        <button
                          key={dayNum}
                          onClick={() => !isPast && handleDateClick(d)}
                          disabled={isPast}
                          className={cellClass}
                          title={
                            isHostBlocked
                              ? tCal.cellBlockedHost.replace('{date}', dKey)
                              : isGuestBooked
                              ? tCal.cellBookedGuest.replace('{date}', dKey)
                              : isPast
                              ? tCal.cellPast.replace('{date}', dKey)
                              : tCal.cellAvailable.replace('{date}', dKey)
                          }
                        >
                          <span>{dayNum}</span>
                          {isHostBlocked && !isRangeStart && !isRangeEnd && (
                            <span className="text-[8px] text-rose-600 leading-none mt-0.5">🔒</span>
                          )}
                          {isGuestBooked && !isHostBlocked && (
                            <span className="text-[8px] text-sky-600 leading-none mt-0.5">👤</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lista de Fechas Bloqueadas Actuales */}
          <div className="bg-[#FBF7EC] p-4 rounded-2xl border border-[rgba(63,67,77,0.08)]">
            <h5 className="font-display font-medium text-sm text-[#3F434D] mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-rose-600" />
                {tCal.fechasBloqueadas} ({blockedDates.length})
              </span>
              {blockedDates.length > 0 && (
                <span className="text-[10px] text-[#6E727C] font-normal">
                  {tCal.clickToRemoveTip}
                </span>
              )}
            </h5>

            {blockedDates.length === 0 ? (
              <p className="text-xs text-[#6E727C] italic py-2">
                {tCal.sinFechasBloqueadas}
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {blockedDates.map(dateKey => (
                  <span
                    key={dateKey}
                    className="inline-flex items-center gap-1.5 bg-white border border-rose-200 text-rose-800 text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-2xs group"
                  >
                    <span>{formatDateKeyDisplay(dateKey, 'en-US')}</span>
                    <button
                      onClick={() => handleRemoveSingleDate(dateKey)}
                      className="text-rose-400 hover:text-rose-800 transition-colors"
                      title={tCal.unblockSingleTitle}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="p-4 px-6 bg-[#FBF7EC] border-t border-[rgba(63,67,77,0.08)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {hasChanges ? (
              <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {tCal.unsavedChanges}
              </span>
            ) : (
              <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                {tCal.synced}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="py-2.5 px-5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#6E727C] hover:text-[#3F434D] hover:bg-white transition-all"
            >
              {textos.general.cancelar}
            </button>
            <button
              onClick={() => handleSave()}
              disabled={isSaving || !hasChanges}
              className="py-2.5 px-6 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#3F434D] text-[#FBF7EC] hover:bg-[#1E2024] disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {textos.general.guardando}
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 text-[#A7AB5E]" />
                  {textos.general.guardarCambios}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
