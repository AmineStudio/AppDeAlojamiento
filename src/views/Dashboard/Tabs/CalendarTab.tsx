import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Lock, 
  Unlock, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Trash2, 
  Sparkles, 
  Home, 
  Bed, 
  Users, 
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { House, Room } from '../../../types';
import { BookingRecord } from '../../../services';
import { 
  dateToKey, 
  isDatePast, 
  getDateRangeKeys, 
  toggleDateInBlockedList, 
  addDatesToBlockedList, 
  removeDatesFromBlockedList,
  formatDateKeyDisplay
} from '../../../utils/booking.utils';
import textos from '../../../content/textos.json';

interface CalendarTabProps {
  houses: House[];
  roomsByHouse: Record<string, Room[]>;
  selectedHouseId?: string;
  selectedRoomId?: string;
  onUpdateBlockedDates: (houseId: string, roomId: string, blockedDates: string[]) => Promise<{ success: boolean; error?: string }>;
  pastBookings?: BookingRecord[];
  showToast: (msg: string) => void;
  handleNavigate?: (page: string, params?: { houseId?: string }) => void;
}

export function CalendarTab({
  houses,
  roomsByHouse,
  selectedHouseId: propSelectedHouseId,
  selectedRoomId: propSelectedRoomId,
  onUpdateBlockedDates,
  pastBookings = [],
  showToast,
  handleNavigate
}: CalendarTabProps) {
  const tCal = textos.panel.calendarioTab;
  const tToast = textos.panel.toasts;

  // Estado del alojamiento seleccionado
  const [activeHouseId, setActiveHouseId] = useState<string>(
    propSelectedHouseId || houses[0]?.id || ''
  );

  // Lista de habitaciones para la casa activa
  const houseRooms = useMemo(() => {
    return roomsByHouse[activeHouseId] || [];
  }, [roomsByHouse, activeHouseId]);

  // Habitación activa seleccionada
  const [activeRoomId, setActiveRoomId] = useState<string>(
    propSelectedRoomId || houseRooms[0]?.id || ''
  );

  // Asegurar que activeHouseId y activeRoomId sean válidos si cambian las casas
  useEffect(() => {
    if (propSelectedHouseId && houses.some(h => h.id === propSelectedHouseId)) {
      setActiveHouseId(propSelectedHouseId);
    }
  }, [propSelectedHouseId, houses]);

  useEffect(() => {
    if (propSelectedRoomId && houseRooms.some(r => r.id === propSelectedRoomId)) {
      setActiveRoomId(propSelectedRoomId);
    } else if (houseRooms.length > 0 && !houseRooms.some(r => r.id === activeRoomId)) {
      setActiveRoomId(houseRooms[0].id);
    }
  }, [activeHouseId, houseRooms, propSelectedRoomId]);

  const activeHouse = houses.find(h => h.id === activeHouseId) || houses[0];
  const activeRoom = houseRooms.find(r => r.id === activeRoomId) || houseRooms[0];

  // Fechas bloqueadas locales para la habitación activa
  const [localBlockedDates, setLocalBlockedDates] = useState<string[]>([]);
  const [initialBlockedDates, setInitialBlockedDates] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar fechas cuando cambia la habitación activa
  useEffect(() => {
    if (activeRoom) {
      const dates = activeRoom.blockedDates || [];
      setLocalBlockedDates(dates);
      setInitialBlockedDates(dates);
      setRangeStart(null);
      setRangeEnd(null);
    } else {
      setLocalBlockedDates([]);
      setInitialBlockedDates([]);
    }
  }, [activeRoom?.id, activeRoom?.blockedDates]);

  // Mes visible en el calendario
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Selección de rango
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

  // Comprobar cambios sin guardar
  const hasChanges = useMemo(() => {
    if (localBlockedDates.length !== initialBlockedDates.length) return true;
    const initialSet = new Set(initialBlockedDates);
    return localBlockedDates.some(d => !initialSet.has(d));
  }, [localBlockedDates, initialBlockedDates]);

  // Fechas de reservas de huéspedes para esta casa y habitación
  const guestBookedDates = useMemo(() => {
    const booked = new Set<string>();
    if (!activeHouse) return booked;
    pastBookings.forEach(b => {
      if (b.houseId === activeHouse.id && (!b.roomId || b.roomId === activeRoom?.id) && b.checkIn && b.checkOut) {
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
  }, [pastBookings, activeHouse?.id, activeRoom?.id]);

  // Próximas reservas registradas
  const upcomingBookings = useMemo(() => {
    if (!activeHouse) return [];
    const todayKey = dateToKey(new Date());
    return pastBookings
      .filter(b => b.houseId === activeHouse.id && b.checkOut && b.checkOut >= todayKey)
      .sort((a, b) => (a.checkIn || '').localeCompare(b.checkIn || ''));
  }, [pastBookings, activeHouse?.id]);

  const blockedSet = useMemo(() => new Set(localBlockedDates), [localBlockedDates]);

  // Guardar en Firestore
  const handleSave = async (datesToSave?: string[]) => {
    if (!activeHouse || !activeRoom) return;
    const targetDates = datesToSave !== undefined ? datesToSave : localBlockedDates;
    setIsSaving(true);
    const res = await onUpdateBlockedDates(activeHouse.id, activeRoom.id, targetDates);
    setIsSaving(false);
    if (res.success) {
      setInitialBlockedDates(targetDates);
      showToast(tCal.guardadoExitoso);
    } else {
      showToast(textos.notificaciones.errorGuardar + (res.error ? `: ${res.error}` : ''));
    }
  };

  // Clic en fecha del calendario
  const handleDateClick = (date: Date) => {
    const key = dateToKey(date);

    if (rangeStart && rangeEnd) {
      setRangeStart(date);
      setRangeEnd(null);
      return;
    }

    if (!rangeStart) {
      setRangeStart(date);
      return;
    }

    // Si hace clic en la misma fecha inicial -> toggle inmediato
    if (dateToKey(rangeStart) === key) {
      const updated = toggleDateInBlockedList(localBlockedDates, key);
      setLocalBlockedDates(updated);
      setRangeStart(null);
      setRangeEnd(null);
      return;
    }

    if (date > rangeStart) {
      setRangeEnd(date);
    } else {
      setRangeStart(date);
      setRangeEnd(null);
    }
  };

  // Bloquear rango
  const handleBlockRange = () => {
    if (!rangeStart || !rangeEnd || !activeRoom) return;
    const keys = getDateRangeKeys(rangeStart, rangeEnd);
    const updated = addDatesToBlockedList(localBlockedDates, keys);
    setLocalBlockedDates(updated);
    setRangeStart(null);
    setRangeEnd(null);
    showToast(tToast.datesBlocked.replace('{name}', activeRoom.name));
  };

  // Desbloquear rango
  const handleUnblockRange = () => {
    if (!rangeStart || !rangeEnd || !activeRoom) return;
    const keys = getDateRangeKeys(rangeStart, rangeEnd);
    const updated = removeDatesFromBlockedList(localBlockedDates, keys);
    setLocalBlockedDates(updated);
    setRangeStart(null);
    setRangeEnd(null);
    showToast(tToast.datesUnblocked.replace('{name}', activeRoom.name));
  };

  // Presets
  const handleBlockUpcomingWeekend = () => {
    if (!activeRoom) return;
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    const sat = new Date(today);
    sat.setDate(today.getDate() + daysUntilSaturday);
    const sun = new Date(sat);
    sun.setDate(sat.getDate() + 1);

    const keys = [dateToKey(sat), dateToKey(sun)];
    const updated = addDatesToBlockedList(localBlockedDates, keys);
    setLocalBlockedDates(updated);
    showToast(tToast.datesBlocked.replace('{name}', activeRoom.name));
  };

  const handleBlockNext7Days = () => {
    if (!activeRoom) return;
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 6);

    const keys = getDateRangeKeys(today, nextWeek);
    const updated = addDatesToBlockedList(localBlockedDates, keys);
    setLocalBlockedDates(updated);
    showToast(tToast.datesBlocked.replace('{name}', activeRoom.name));
  };

  const handleClearAllBlocked = () => {
    if (!activeRoom || localBlockedDates.length === 0) return;
    if (window.confirm(tCal.confirmarDesbloquearTodo)) {
      setLocalBlockedDates([]);
      showToast(tToast.datesCleared.replace('{name}', activeRoom.name));
    }
  };

  const handleRemoveSingleDate = (dateKey: string) => {
    const updated = localBlockedDates.filter(d => d !== dateKey);
    setLocalBlockedDates(updated);
  };

  if (houses.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-[rgba(63,67,77,0.08)] shadow-sm">
        <Home className="h-12 w-12 text-[#6E727C] mx-auto mb-3" />
        <h3 className="font-display font-medium text-xl text-[#3F434D] mb-1">
          {tCal.noHousesRegistered}
        </h3>
        <p className="text-xs text-[#6E727C]">
          {tCal.noHousesDesc}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Header con Selector de Alojamiento y Habitación */}
      <div className="bg-white rounded-3xl p-6 border border-[rgba(63,67,77,0.08)] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(63,67,77,0.06)] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" /> {tCal.titulo}
              </span>
            </div>
            <h2 className="font-display font-medium text-2xl sm:text-3xl text-[#3F434D]">
              {tCal.titulo}
            </h2>
            <p className="text-xs text-[#6E727C] mt-1 max-w-2xl">
              {tCal.subtitulo}
            </p>
          </div>

          {/* Selector de Alojamiento */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6E727C]">
              {tCal.seleccionarAlojamiento}:
            </span>
            <select
              value={activeHouseId}
              onChange={(e) => setActiveHouseId(e.target.value)}
              className="bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] py-2 px-3.5 rounded-xl text-xs font-bold text-[#3F434D] outline-none shadow-2xs focus:border-[#3D7A95]"
            >
              {houses.map(h => (
                <option key={h.id} value={h.id}>
                  🏡 {h.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selector de Habitaciones del Alojamiento */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6E727C]">
              {tCal.seleccionarHabitacion} ({houseRooms.length}):
            </span>
            {activeHouse && handleNavigate && (
              <button
                onClick={() => handleNavigate('detail', { houseId: activeHouse.id })}
                className="text-[10px] font-bold uppercase tracking-wider text-[#3D7A95] hover:underline flex items-center gap-1"
              >
                <span>{tCal.viewOnPublic}</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            )}
          </div>

          {houseRooms.length === 0 ? (
            <div className="p-4 bg-[#FBF7EC] rounded-2xl text-center text-xs text-[#6E727C]">
              {tCal.noRoomsForHouse}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {houseRooms.map(r => {
                const isSelected = r.id === activeRoomId;
                const blockedCount = (r.blockedDates || []).length;
                return (
                  <button
                    key={r.id}
                    onClick={() => setActiveRoomId(r.id)}
                    className={`p-4 rounded-2xl text-left border transition-all duration-200 flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#3F434D] text-white border-[#3F434D] shadow-md scale-[1.01]'
                        : 'bg-[#FBF7EC] border-[rgba(63,67,77,0.08)] text-[#3F434D] hover:bg-white hover:border-[#3D7A95]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Bed className={`h-3.5 w-3.5 ${isSelected ? 'text-[#E6BE7A]' : 'text-[#3D7A95]'}`} />
                        <h4 className="font-display font-medium text-sm leading-tight">
                          {r.name}
                        </h4>
                      </div>
                      <p className={`text-[11px] ${isSelected ? 'text-gray-300' : 'text-[#6E727C]'}`}>
                        {r.beds} · {r.view}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[11px] font-bold ${isSelected ? 'text-white' : 'text-[#3F434D]'}`}>
                          €{r.price} <span className="text-[9px] font-normal opacity-80">/ {textos.home.perNight.toLowerCase()}</span>
                        </span>
                        <span className={`text-[9px] px-2 py-0.2 rounded-full font-bold ${
                          r.available
                            ? (isSelected ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/30' : 'bg-emerald-100 text-emerald-800')
                            : (isSelected ? 'bg-stone-600 text-stone-200' : 'bg-stone-200 text-stone-700')
                        }`}>
                          {r.available ? tCal.openStatus : tCal.closedStatus}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {blockedCount > 0 ? (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
                          isSelected ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
                        }`}>
                          <Lock className="h-2.5 w-2.5" />
                          {blockedCount}
                        </span>
                      ) : (
                        <span className={`text-[10px] font-medium ${isSelected ? 'text-gray-300' : 'text-[#6E727C]'}`}>
                          {tCal.zeroBlocked}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. Área Principal de Gestión del Calendario */}
      {activeRoom && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Calendario Dual Interactivo (2 cols en lg) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[rgba(63,67,77,0.08)] shadow-sm space-y-6">
              
              {/* Barra superior de Presets y Guardado */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FBF7EC] p-3.5 rounded-2xl border border-[rgba(63,67,77,0.08)]">
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
                  {localBlockedDates.length > 0 && (
                    <button
                      onClick={handleClearAllBlocked}
                      className="py-1 px-3 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-medium transition-colors shadow-2xs flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      {tCal.desbloquearTodo}
                    </button>
                  )}
                </div>

                {/* Botón Guardar Cambios */}
                <button
                  onClick={() => handleSave()}
                  disabled={isSaving || !hasChanges}
                  className="py-2 px-5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#3F434D] text-[#FBF7EC] hover:bg-[#1E2024] disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
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

              {/* Banner de Rango de Fechas */}
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

              {/* Leyenda de colores */}
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

              {/* Cuadrículas de Calendario (2 Meses) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[0, 1].map(offset => {
                  const targetMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
                  const monthName = targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  const firstDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
                  const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
                  const startWeekday = (firstDay.getDay() + 6) % 7;
                  const daysInMonth = lastDay.getDate();

                  return (
                    <div key={offset} className="bg-[#FBF7EC]/50 rounded-2xl p-4 border border-[rgba(63,67,77,0.06)] shadow-2xs">
                      {/* Cabecera del mes */}
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

                      {/* Nombres de los días de la semana */}
                      <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, idx) => (
                          <div key={idx} className="text-[10px] font-bold text-[#6E727C] py-1">
                            {d}
                          </div>
                        ))}
                      </div>

                      {/* Días del mes */}
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

                          const isRangeStart = rangeStart && dateToKey(rangeStart) === dKey;
                          const isRangeEnd = rangeEnd && dateToKey(rangeEnd) === dKey;
                          const isInRange = rangeStart && rangeEnd && d > rangeStart && d < rangeEnd;

                          let cellClass = "aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-semibold relative transition-all duration-150 select-none cursor-pointer ";

                          if (isRangeStart || isRangeEnd) {
                            cellClass += "ring-2 ring-[#3D7A95] bg-[#3D7A95] text-white font-bold shadow-sm ";
                          } else if (isInRange) {
                            cellClass += "bg-[#CFE4EC] text-[#3D7A95] font-bold ";
                          } else if (isHostBlocked) {
                            cellClass += "bg-rose-100/90 text-rose-800 border border-rose-300 hover:bg-rose-200 ";
                          } else if (isGuestBooked) {
                            cellClass += "bg-sky-100/90 text-sky-800 border border-sky-300 cursor-not-allowed ";
                          } else if (isPast) {
                            cellClass += "text-gray-300 bg-gray-50/50 cursor-not-allowed ";
                          } else {
                            cellClass += "bg-white border border-[rgba(63,67,77,0.08)] hover:bg-[#F5EFE0] text-[#3F434D] ";
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
            </div>
          </div>

          {/* Columna Derecha: Panel Lateral de Fechas Bloqueadas y Reservas */}
          <div className="space-y-6">
            
            {/* Tarjeta de Fechas Bloqueadas para esta habitación */}
            <div className="bg-white rounded-3xl p-6 border border-[rgba(63,67,77,0.08)] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-medium text-base text-[#3F434D] flex items-center gap-2">
                  <Lock className="h-4 w-4 text-rose-600" />
                  {tCal.fechasBloqueadas} ({localBlockedDates.length})
                </h4>
                {localBlockedDates.length > 0 && (
                  <button
                    onClick={handleClearAllBlocked}
                    className="text-[10px] font-bold uppercase tracking-wider text-rose-600 hover:underline"
                  >
                    {tCal.clearAllShort}
                  </button>
                )}
              </div>

              {localBlockedDates.length === 0 ? (
                <div className="p-4 bg-[#FBF7EC] rounded-2xl text-center">
                  <p className="text-xs text-[#6E727C] italic">
                    {tCal.sinFechasBloqueadas}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {localBlockedDates.map(dateKey => (
                    <div
                      key={dateKey}
                      className="flex items-center justify-between p-2.5 bg-[#FBF7EC] rounded-xl border border-rose-200/80 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                        <span className="font-semibold text-[#3F434D]">
                          {formatDateKeyDisplay(dateKey, 'en-US')}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveSingleDate(dateKey)}
                        className="h-6 w-6 rounded-full hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors text-xs"
                        title={tCal.unblockSingleTitle}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tarjeta de Próximas Reservas de Huéspedes */}
            <div className="bg-white rounded-3xl p-6 border border-[rgba(63,67,77,0.08)] shadow-sm space-y-4">
              <h4 className="font-display font-medium text-base text-[#3F434D] flex items-center gap-2">
                <Users className="h-4 w-4 text-[#3D7A95]" />
                {tCal.upcomingBookings.replace('{count}', String(upcomingBookings.length))}
              </h4>

              {upcomingBookings.length === 0 ? (
                <div className="p-4 bg-[#FBF7EC] rounded-2xl text-center">
                  <p className="text-xs text-[#6E727C] italic">
                    {tCal.noUpcomingBookings}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {upcomingBookings.map((b, idx) => (
                    <div
                      key={b.id || idx}
                      className="p-3 bg-[#FBF7EC] rounded-2xl border border-[rgba(63,67,77,0.06)] text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#3F434D] truncate max-w-[170px]">
                          {b.guestEmail}
                        </span>
                        {b.totalPrice !== undefined && (
                          <span className="font-bold text-emerald-700">
                            €{b.totalPrice}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#6E727C]">
                        <span>
                          📅 {b.checkIn ? formatDateKeyDisplay(b.checkIn, 'en-US') : '—'} → {b.checkOut ? formatDateKeyDisplay(b.checkOut, 'en-US') : '—'}
                        </span>
                        {b.days && <span>{tCal.nightsCount.replace('{count}', String(b.days))}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
