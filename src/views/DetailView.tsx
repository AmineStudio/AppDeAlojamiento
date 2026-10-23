import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, FileText, Star, Calendar as CalendarIcon } from 'lucide-react';
import { House, Room, GuestReview } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useBookingCalendar } from '../hooks/useBookingCalendar';
import { reviewsService } from '../services';

interface DetailViewProps {
  handleNavigate?: (page: 'home' | 'detail' | 'blog' | 'contact' | 'dashboard' | 'inbox') => void;
  activeHouse?: House;
  showToast?: (msg: string) => void;
  roomsByHouse?: Record<string, Room[]>;
  checkInDate?: Date | null;
  setCheckInDate?: (d: Date | null) => void;
  checkOutDate?: Date | null;
  setCheckOutDate?: (d: Date | null) => void;
  reviewsByHouse?: Record<string, GuestReview[]>;
  calendarOpen?: boolean;
  setCalendarOpen?: (open: boolean) => void;
  currentCalMonth?: Date;
  setCurrentCalMonth?: React.Dispatch<React.SetStateAction<Date>>;
  dateToKey?: (d: Date) => string;
  isDatePast?: (d: Date) => boolean;
  isDateBooked?: (d: Date) => boolean;
  selectDate?: (d: Date) => void;
  guestCount?: number;
  setGuestCount?: (count: number) => void;
  triggerBookingSuccess?: (totalPrice: number) => void;
  getDaysCount?: () => number;
  user?: { name: string; email: string; role: 'host' | 'guest' } | null;
  handleAddReview?: (houseId: string, rating: number, comment: string) => void;
  canReview?: boolean;
}

export function DetailView(props: DetailViewProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    houses, 
    roomsByHouse: ctxRoomsByHouse, 
    reviewsByHouse: ctxReviewsByHouse, 
    setReviewsByHouse,
    pastBookings,
    createBooking,
    addReview
  } = useData();
  const { user: ctxUser, triggerLoginModal } = useAuth();
  const { showToast: ctxShowToast } = useToast();

  const user = props.user !== undefined ? props.user : ctxUser;
  const showToast = props.showToast || ctxShowToast;
  const roomsByHouse = props.roomsByHouse || ctxRoomsByHouse;
  const reviewsByHouse = props.reviewsByHouse || ctxReviewsByHouse;

  const activeHouse = props.activeHouse || houses.find(h => h.id === id) || houses[0];

  const internalCalendar = useBookingCalendar({
    houseId: activeHouse?.id || '',
    onBlockedDateSelected: (msg) => showToast(msg)
  });

  const checkInDate = props.checkInDate !== undefined ? props.checkInDate : internalCalendar.checkInDate;
  const setCheckInDate = props.setCheckInDate || internalCalendar.setCheckInDate;
  const checkOutDate = props.checkOutDate !== undefined ? props.checkOutDate : internalCalendar.checkOutDate;
  const setCheckOutDate = props.setCheckOutDate || internalCalendar.setCheckOutDate;
  const calendarOpen = props.calendarOpen !== undefined ? props.calendarOpen : internalCalendar.calendarOpen;
  const setCalendarOpen = props.setCalendarOpen || internalCalendar.setCalendarOpen;
  const currentCalMonth = props.currentCalMonth !== undefined ? props.currentCalMonth : internalCalendar.currentCalMonth;
  const setCurrentCalMonth = props.setCurrentCalMonth || internalCalendar.setCurrentCalMonth;
  const dateToKey = props.dateToKey || internalCalendar.dateToKey;
  const isDatePast = props.isDatePast || internalCalendar.isDatePast;
  const isDateBooked = props.isDateBooked || internalCalendar.isDateBooked;
  const selectDate = props.selectDate || internalCalendar.selectDate;
  const guestCount = props.guestCount !== undefined ? props.guestCount : internalCalendar.guestCount;
  const setGuestCount = props.setGuestCount || internalCalendar.setGuestCount;
  const getDaysCount = props.getDaysCount || internalCalendar.getDaysCount;

  // Suscribirse a reseñas en tiempo real para esta propiedad
  useEffect(() => {
    if (activeHouse?.id) {
      const unsub = reviewsService.subscribeToReviews(activeHouse.id, (reviews) => {
        setReviewsByHouse(prev => ({
          ...prev,
          [activeHouse.id]: reviews
        }));
      });
      return () => unsub();
    }
  }, [activeHouse?.id, setReviewsByHouse]);

  const canReview = props.canReview !== undefined ? props.canReview : Boolean(
    user?.role === 'guest' && 
    activeHouse && 
    pastBookings.some(b => b.guestEmail.toLowerCase() === (user.email || '').toLowerCase() && b.houseId === activeHouse.id)
  );

  const handleAddReview = props.handleAddReview || (async (houseId: string, rating: number, comment: string) => {
    if (!user) {
      showToast('Debes iniciar sesión para dejar una reseña.');
      triggerLoginModal('signin');
      return;
    }
    const res = await addReview(houseId, user.name, rating, comment);
    if (res.success) {
      showToast('✨ ¡Muchas gracias por tu reseña!');
    } else {
      showToast('Error al publicar la reseña: ' + (res.error || 'Error'));
    }
  });

  const triggerBookingSuccess = props.triggerBookingSuccess || (async (totalPrice: number) => {
    if (!user) {
      triggerLoginModal('signin');
      return;
    }
    if (user.role === 'host') {
      showToast('Como anfitriona no puedes reservar tus propios alojamientos.');
      return;
    }
    const days = getDaysCount();
    const res = await createBooking(user.email, activeHouse.id, {
      totalPrice,
      days,
      checkIn: checkInDate ? dateToKey(checkInDate) : undefined,
      checkOut: checkOutDate ? dateToKey(checkOutDate) : undefined
    });
    if (res.success) {
      showToast(`🎉 ¡Solicitud enviada! Reserva registrada de ${days} noches en ${activeHouse.name}. Total: ${totalPrice}€`);
      setCheckInDate(null);
      setCheckOutDate(null);
    } else {
      showToast('Error al registrar la reserva: ' + (res.error || 'Error'));
    }
  });

  const onNavigateHome = () => {
    if (props.handleNavigate) {
      props.handleNavigate('home');
    } else {
      navigate('/');
    }
  };

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  
  useEffect(() => {
    setSelectedRoomId(null);
  }, [activeHouse?.id]);

  if (!activeHouse) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-[#6E727C]">Cargando información del alojamiento...</p>
      </div>
    );
  }
  const activeRooms = roomsByHouse[activeHouse.id] || [];
  const selectedRoom = activeRooms.find(r => r.id === selectedRoomId) || activeRooms[0];
  const currentPrice = selectedRoom ? selectedRoom.price : activeHouse.pricePerNight;
  const calculatedSubtotal = getDaysCount() * currentPrice;

  const [newReviewRating, setNewReviewRating] = React.useState(5);
  const [newReviewText, setNewReviewText] = React.useState('');

  const submitReview = () => {
    if (!newReviewText.trim()) {
      showToast('Por favor escribe un comentario para tu reseña.');
      return;
    }
    handleAddReview(activeHouse.id, newReviewRating, newReviewText);
    setNewReviewText('');
    setNewReviewRating(5);
  };

  return (
    <div className="animate-fade-in py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Back breadcrumb navigation */}
        <button 
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6E727C] hover:text-[#3F434D] mb-8"
        >
          ← Volver al catálogo
        </button>

        {/* Title & Stats */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest text-[#3D7A95] uppercase block mb-1">📍 {activeHouse.location}</span>
            <h1 className="font-display font-light text-3xl sm:text-5xl text-[#3F434D] tracking-tight">{activeHouse.name}</h1>
            
            <div className="flex items-center gap-4 flex-wrap text-xs text-[#6E727C] font-medium mt-3 border-t border-[rgba(63,67,77,0.06)] pt-3">
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Hasta {activeHouse.guests} huéspedes</span>
              <span>•</span>
              <span><FileText className="h-3.5 w-3.5 inline mr-1" /> {activeHouse.beds}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-[#E6BE7A] fill-[#E6BE7A]" /> 
                <strong>{activeHouse.rating}</strong> ({activeHouse.reviewCount} opiniones)
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                }
                showToast('↗️ ¡Enlace copiado al portapapeles!');
              }} 
              className="py-2.5 px-6 bg-white border border-[rgba(63,67,77,0.1)] hover:bg-[#F5EFE0] rounded-full text-xs font-semibold uppercase tracking-wider text-[#3F434D] transition-all"
            >
              ↗️ Compartir
            </button>
          </div>
        </div>

        {/* High-Fidelity Custom Layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left hand content (Story + Rooms + Amenities) */}
          <div className="lg:col-span-2">
            
            {/* Photo Gallery banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {activeHouse.images.map((img, idx) => (
                <div key={idx} className={`rounded-3xl overflow-hidden shadow-md w-full ${idx === 0 ? 'sm:col-span-2 aspect-[21/9]' : 'aspect-[4/3]'} max-h-[500px]`}>
                  <img src={img} alt="" className="object-cover h-full w-full transition-transform duration-500 hover:scale-[1.01]" />
                </div>
              ))}
            </div>

            {/* House Bio Description */}
            <div className="border-b border-[rgba(63,67,77,0.08)] pb-10 mb-10">
              <h3 className="font-display font-medium text-2xl text-[#3F434D] mb-4">Sobre el alojamiento</h3>
              <p className="text-sm font-light leading-relaxed text-[#6E727C] whitespace-pre-line">
                {activeHouse.description}
              </p>
            </div>

            {/* Amenities/Features section */}
            <div className="border-b border-[rgba(63,67,77,0.08)] pb-10 mb-10">
              <h3 className="font-display font-medium text-2xl text-[#3F434D] mb-6">Comodidades y Servicios</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeHouse.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white border border-[rgba(63,67,77,0.06)] rounded-2xl p-4">
                    <div className="h-8 w-8 rounded-xl bg-[#CFE4EC] text-[#3D7A95] flex items-center justify-center font-bold text-sm">✓</div>
                    <span className="text-xs font-medium text-[#3F434D]">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Room options & Pricing */}
            <div className="border-b border-[rgba(63,67,77,0.08)] pb-10 mb-10">
              <h3 className="font-display font-medium text-2xl text-[#3F434D] mb-6">Elige tu Habitación</h3>
              <div className="space-y-4">
                {(roomsByHouse[activeHouse.id] || []).map((r) => (
                  <div 
                    key={r.id} 
                    className={`flex flex-col gap-4 p-5 rounded-3xl bg-white border shadow-sm transition-all duration-200 ${!r.available ? 'opacity-50' : ''} ${selectedRoomId === r.id ? 'border-[#3D7A95] ring-1 ring-[#3D7A95]' : 'border-[rgba(63,67,77,0.06)] hover:border-[#3D7A95]'}`}
                  >
                    <div className="flex gap-3 overflow-x-auto snap-x pb-2 w-full no-scrollbar">
                      {r.images.map((img, idx) => (
                        <img key={idx} src={img} alt={r.name} className="h-40 w-56 object-cover rounded-2xl shrink-0 snap-start" />
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h5 className="font-display font-medium text-lg text-[#3F434D]">{r.name}</h5>
                        <p className="text-sm text-[#6E727C] mt-1 max-w-xl">{r.description}</p>
                        <div className="flex gap-4 mt-3 text-[10px] font-bold text-[#3D7A95] uppercase tracking-wider">
                          <span>🛏️ {r.beds}</span>
                          <span>🌳 {r.view}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                        <div className="text-right">
                          <span className="font-display text-lg font-bold text-[#3F434D] block">{r.price}€</span>
                          <span className="text-[9px] uppercase tracking-wider font-bold text-[#6E727C]">/ noche</span>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedRoomId(r.id);
                            showToast(`✨ Habitación seleccionada: ${r.name}`);
                          }}
                          disabled={!r.available}
                          className={`py-2 px-5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${r.available ? (selectedRoomId === r.id ? 'bg-[#3D7A95] text-white' : 'bg-[#A7AB5E] text-white hover:bg-[#888B47]') : 'bg-gray-200 text-[#6E727C] cursor-not-allowed'}`}
                        >
                          {r.available ? (selectedRoomId === r.id ? 'Seleccionada' : 'Seleccionar') : 'No disponible'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div>
              <h3 className="font-display font-medium text-2xl text-[#3F434D] mb-6">Opiniones de Huéspedes</h3>
              
              {/* Reviews breakdown widget */}
              <div className="bg-white border border-[rgba(63,67,77,0.06)] p-6 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
                <div className="text-center md:border-r border-[rgba(63,67,77,0.08)] py-4">
                  <h4 className="font-display text-6xl font-light text-[#3D7A95] leading-none mb-2">{activeHouse.rating}</h4>
                  <div className="flex justify-center text-[#E6BE7A] font-bold text-md mb-2">★★★★★</div>
                  <span className="text-xs uppercase font-bold tracking-widest text-[#6E727C]">{activeHouse.reviewCount} opiniones verificadas</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#6E727C]">Limpieza</span>
                    <div className="flex items-center gap-3 w-3/5">
                      <div className="h-1.5 w-full bg-[#F5EFE0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#A7AB5E]" style={{ width: '96%' }}></div>
                      </div>
                      <span className="text-[#3F434D]">4.9</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#6E727C]">Ubicación</span>
                    <div className="flex items-center gap-3 w-3/5">
                      <div className="h-1.5 w-full bg-[#F5EFE0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#A7AB5E]" style={{ width: '98%' }}></div>
                      </div>
                      <span className="text-[#3F434D]">5.0</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#6E727C]">Relación calidad/precio</span>
                    <div className="flex items-center gap-3 w-3/5">
                      <div className="h-1.5 w-full bg-[#F5EFE0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#A7AB5E]" style={{ width: '94%' }}></div>
                      </div>
                      <span className="text-[#3F434D]">4.8</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#6E727C]">Atención y comunicación</span>
                    <div className="flex items-center gap-3 w-3/5">
                      <div className="h-1.5 w-full bg-[#F5EFE0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#A7AB5E]" style={{ width: '98%' }}></div>
                      </div>
                      <span className="text-[#3F434D]">4.9</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Reviews Stream */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {(reviewsByHouse[activeHouse.id] || []).map((rev) => (
                  <div key={rev.id} className="p-5 bg-white border border-[rgba(63,67,77,0.06)] rounded-3xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 text-xs text-white rounded-full bg-gradient-to-tr from-[#3D7A95] to-[#E6BE7A] flex items-center justify-center font-bold">
                        {rev.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h6 className="text-xs font-bold uppercase tracking-wider text-[#3F434D]">{rev.authorName}</h6>
                        <span className="text-[10px] text-[#6E727C] block">{rev.date}</span>
                      </div>
                    </div>
                    <div className="flex gap-0.5 text-[#E6BE7A] text-xs mb-3">{"★".repeat(Math.round(rev.rating))}</div>
                    <p className="text-xs font-light text-[#6E727C] leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>

              {/* Submit Review Box Container */}
              <div id="reviewFormWrap" className="mt-8">
                {canReview ? (
                  <div className="bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] rounded-3xl p-6">
                    <h4 className="font-display font-medium text-lg text-[#3F434D] mb-4">Escribir una Reseña</h4>
                    <div className="mb-4">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-2">Puntuación</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star} 
                            onClick={() => setNewReviewRating(star)}
                            className={`text-xl transition-colors ${star <= newReviewRating ? 'text-[#E6BE7A]' : 'text-[#D1D5DB]'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-2">Tu Experiencia</label>
                      <textarea
                        value={newReviewText}
                        onChange={(e) => setNewReviewText(e.target.value)}
                        placeholder="Cuéntanos cómo fue tu estancia..."
                        className="w-full bg-white border border-[rgba(63,67,77,0.1)] rounded-2xl p-4 text-sm focus:outline-none focus:border-[#3D7A95] min-h-[100px] resize-none"
                      ></textarea>
                    </div>
                    <button 
                      onClick={submitReview}
                      className="py-2.5 px-6 bg-[#3F434D] text-[#FBF7EC] hover:bg-[#1E2024] rounded-full text-xs font-semibold uppercase tracking-wider transition-colors"
                    >
                      Publicar Reseña
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right hand booking sidebar card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white border border-[rgba(63,67,77,0.1)] rounded-3xl p-6 shadow-xl">
              <div className="flex flex-col gap-1 mb-6">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display font-light text-4xl text-[#3F434D]">{currentPrice}€</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#6E727C]">/ noche</span>
                </div>
                {selectedRoom && <span className="text-[10px] font-bold text-[#3D7A95] uppercase tracking-wider">{selectedRoom.name}</span>}
              </div>

              {/* Custom Interactive Calendar Widget Input */}
              <div className="relative mb-4">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-2">Fechas Seleccionadas</label>
                <div 
                  onClick={() => setCalendarOpen(!calendarOpen)}
                  className={`flex justify-between items-center bg-[#F5EFE0] py-3.5 px-4 rounded-2xl border transition-all cursor-pointer ${calendarOpen ? 'border-[#3D7A95] shadow-inner' : 'border-[rgba(63,67,77,0.08)]'}`}
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-[#3D7A95]" />
                    <span className="text-xs font-medium text-[#3F434D]">
                      {checkInDate ? checkInDate.toLocaleDateString('es-ES', {month: 'short', day: 'numeric'}) : 'Entrada'}
                      {' → '}
                      {checkOutDate ? checkOutDate.toLocaleDateString('es-ES', {month: 'short', day: 'numeric'}) : 'Salida'}
                    </span>
                  </div>
                  <span className="text-md text-[#6E727C]">▾</span>
                </div>

                {/* Custom Built React Calendar overlay */}
                {calendarOpen && (
                  <div className="absolute top-18 right-0 left-0 bg-white border border-[#3D7A95] rounded-3xl p-5 shadow-2xl z-40 animate-fade-in w-full max-w-sm">
                    <div className="grid grid-cols-1 gap-6">
                      
                      {/* Months grid loops dynamically */}
                      {Array.from({ length: 2 }).map((_, idx) => {
                        const targetMonth = new Date(currentCalMonth.getFullYear(), currentCalMonth.getMonth() + idx, 1);
                        const monthName = targetMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                        const firstDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
                        const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
                        const startWeekday = (firstDay.getDay() + 6) % 7; // Lunes=0
                        const daysInMonth = lastDay.getDate();

                        return (
                          <div key={idx}>
                            <div className="flex items-center justify-between mb-3">
                              {idx === 0 && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setCurrentCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)); }}
                                  className="h-7 w-7 rounded-full hover:bg-[#F5EFE0] flex items-center justify-center text-xs"
                                  title="Mes anterior"
                                >
                                  ‹
                                </button>
                              )}
                              <span className="text-xs font-bold uppercase tracking-wider text-[#3F434D] mx-auto capitalize">{monthName}</span>
                              {idx === 1 && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setCurrentCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)); }}
                                  className="h-7 w-7 rounded-full hover:bg-[#F5EFE0] flex items-center justify-center text-xs"
                                  title="Mes siguiente"
                                >
                                  ›
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center">
                              {['L','M','X','J','V','S','D'].map((d, dIdx) => (
                                <div key={`${d}-${dIdx}`} className="text-[9px] font-bold text-[#6E727C] py-1">{d}</div>
                              ))}
                              {Array.from({ length: startWeekday }).map((_, i) => (
                                <div key={i} className="aspect-square"></div>
                              ))}
                              {Array.from({ length: daysInMonth }).map((_, dIdx) => {
                                const dayNum = dIdx + 1;
                                const d = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), dayNum);
                                d.setHours(0,0,0,0);
                                const dKey = dateToKey(d);

                                const isPastDay = isDatePast(d);
                                const isBooked = isDateBooked(d);
                                
                                let cellClass = "aspect-square flex items-center justify-center rounded-xl text-xs font-semibold relative transition-all";
                                
                                const checkInKey = checkInDate ? dateToKey(checkInDate) : null;
                                const checkOutKey = checkOutDate ? dateToKey(checkOutDate) : null;

                                if (checkInKey === dKey || checkOutKey === dKey) {
                                  cellClass += " bg-[#3F434D] text-[#FBF7EC] scale-105 shadow-sm";
                                } else if (checkInDate && checkOutDate && d > checkInDate && d < checkOutDate) {
                                  cellClass += " bg-[#CFE4EC] text-[#3D7A95]";
                                } else if (isPastDay || isBooked) {
                                  cellClass += " text-[rgba(63,67,77,0.18)] cursor-not-allowed line-through";
                                } else {
                                  cellClass += " hover:bg-[#F5EFE0] text-[#3F434D]";
                                }

                                return (
                                  <button 
                                    key={dayNum} 
                                    onClick={(e) => { e.stopPropagation(); if(!isPastDay && !isBooked) selectDate(d); }}
                                    disabled={isPastDay || isBooked}
                                    className={cellClass}
                                  >
                                    {dayNum}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 justify-end border-t border-[rgba(63,67,77,0.08)] pt-4 mt-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setCheckInDate(null); setCheckOutDate(null); }}
                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#888B47]"
                      >
                        Limpiar fechas
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setCalendarOpen(false); }}
                        className="px-4 py-1.5 bg-[#3F434D] text-[#FBF7EC] rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-[#1E2024]"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="field-full border border-[rgba(63,67,77,0.08)] bg-[#F5EFE0] rounded-2xl p-3.5 mb-6">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1">Huéspedes</label>
                <select 
                  value={guestCount} 
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="bg-transparent font-medium text-xs text-[#3F434D] w-full outline-none"
                >
                  <option value={1}>1 huésped</option>
                  <option value={2}>2 huéspedes</option>
                  <option value={3}>3 huéspedes</option>
                  <option value={4}>4 huéspedes</option>
                </select>
              </div>

              <button 
                onClick={() => triggerBookingSuccess(calculatedSubtotal)}
                disabled={!checkInDate || !checkOutDate}
                className="w-full py-4 bg-[#A7AB5E] text-[#FBF7EC] hover:bg-[#888B47] disabled:bg-gray-200 disabled:text-[#6E727C] disabled:cursor-not-allowed rounded-full text-xs font-semibold uppercase tracking-widest shadow-md hover:shadow-lg transition-all"
              >
                {checkInDate && checkOutDate ? `Reservar · ${calculatedSubtotal}€` : 'Elige fechas para continuar'}
              </button>

              {/* Calculated Prices Block */}
              {checkInDate && checkOutDate && (
                <div className="border-t border-dashed border-[rgba(63,67,77,0.1)] pt-6 mt-6 text-xs text-[#6E727C] space-y-3">
                  <div className="flex justify-between">
                    <span>{currentPrice}€ × {getDaysCount()} noches</span>
                    <span className="font-semibold text-[#3F434D]">{calculatedSubtotal}€</span>
                  </div>
                  <div className="border-t border-[rgba(63,67,77,0.08)] pt-3 flex justify-between text-sm font-bold text-[#3F434D]">
                    <span>Total de la estancia</span>
                    <span>{calculatedSubtotal}€</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
