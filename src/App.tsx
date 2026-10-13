/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { House, Room, BlogPost, MessageInquiry } from './types';
import { Footer } from './components/Footer';
import { Navigation } from './components/Navigation';
import { LoginModal } from './components/LoginModal';
import { AddPhotoModal } from './components/AddPhotoModal';
import { Toast } from './components/Toast';
import { HomeView } from './views/HomeView';
import { BlogView } from './views/BlogView';
import { ContactView } from './views/ContactView';
import { DashboardView } from './views/DashboardView';
import { DetailView } from './views/DetailView';
import { GuestInboxView } from './views/GuestInboxView';

import { useAuth } from './contexts/AuthContext';
import { useData } from './contexts/DataContext';
import textos from './content/textos.json';

import { 
  housesService, 
  roomsService, 
  storiesService, 
  reviewsService, 
  inquiriesService, 
  bookingsService, 
  BookingRecord 
} from './services';

export default function App() {
  // Navegación principal
  const [currentPage, setCurrentPage] = useState<'home' | 'detail' | 'blog' | 'contact' | 'dashboard' | 'inbox'>('home');
  const [selectedHouseId, setSelectedHouseId] = useState<string>('');

  // Datos globales desde DataContext
  const {
    loadFailed, hasUnsavedChanges, setHasUnsavedChanges,
    isSaving, houses, setHouses, roomsByHouse, setRoomsByHouse,
    reviewsByHouse, setReviewsByHouse, inquiries, setInquiries,
    blogPosts, setBlogPosts, hostProfile, setHostProfile, saveHostProfile
  } = useData();

  // Inicializar selección con el primer alojamiento disponible
  useEffect(() => {
    if (!selectedHouseId && houses.length > 0) {
      setSelectedHouseId(houses[0].id);
    }
  }, [houses, selectedHouseId]);

  const activeHouse = useMemo(() => {
    return houses.find(h => h.id === selectedHouseId) || houses[0];
  }, [houses, selectedHouseId]);

  // Sesión y Auth
  const { user, loginModalOpen, setLoginModalOpen, triggerLoginModal, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notificaciones Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Calendario y Reservas dinámicas
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [currentCalMonth, setCurrentCalMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [guestCount, setGuestCount] = useState<number>(2);
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [pastBookings, setPastBookings] = useState<BookingRecord[]>([]);

  // Cargar fechas bloqueadas reales para la propiedad activa
  useEffect(() => {
    if (activeHouse?.id) {
      bookingsService.fetchBookedDatesForHouse(activeHouse.id).then(setBookedDates);
    }
  }, [activeHouse?.id]);

  // Suscripción en tiempo real a reseñas de la propiedad activa
  useEffect(() => {
    if (activeHouse?.id) {
      const unsubscribe = reviewsService.subscribeToReviews(activeHouse.id, (reviews) => {
        setReviewsByHouse(prev => ({
          ...prev,
          [activeHouse.id]: reviews
        }));
      });
      return () => unsubscribe();
    }
  }, [activeHouse?.id, setReviewsByHouse]);

  // Suscripción en tiempo real a consultas
  useEffect(() => {
    if (user) {
      const unsubscribe = inquiriesService.subscribeToInquiries(
        user.email,
        user.role,
        (inqs) => setInquiries(inqs)
      );
      return () => unsubscribe();
    }
  }, [user, setInquiries]);

  // Suscripción en tiempo real a reservas del usuario
  useEffect(() => {
    if (user) {
      const unsubscribe = bookingsService.subscribeToBookings(
        user.email,
        user.role === 'host',
        (bookings) => setPastBookings(bookings)
      );
      return () => unsubscribe();
    }
  }, [user]);

  // Formulario de Contacto
  const [contactHouseId, setContactHouseId] = useState<string>('');
  const [contactSubject, setContactSubject] = useState<string>('');
  const [contactMessage, setContactMessage] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');

  useEffect(() => {
    if (!contactHouseId && houses.length > 0) {
      setContactHouseId(houses[0].id);
    }
  }, [houses, contactHouseId]);

  // Banner para invitar a reseñar
  const [eligibleReviewPending, setEligibleReviewPending] = useState<boolean>(true);

  // Panel de anfitriona
  const [dashActiveTab, setDashActiveTab] = useState<'listings' | 'inquiries' | 'stories' | 'settings'>('listings');
  const [editPricePrefix, setEditPricePrefix] = useState<Record<string, number>>({});
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogCategory, setNewBlogCategory] = useState('Secretos locales 🤫');
  const [newBlogExcerpt, setNewBlogExcerpt] = useState('');
  const [newBlogContent, setNewBlogContent] = useState('');

  // Sincronizar precios de habitaciones al cambiar de casa
  useEffect(() => {
    if (activeHouse) {
      const roomPricing: Record<string, number> = {};
      const ro = roomsByHouse[activeHouse.id] || [];
      ro.forEach(r => {
        roomPricing[r.id] = r.price;
      });
      setEditPricePrefix(roomPricing);
    }
  }, [activeHouse, roomsByHouse]);

  // Helpers de calendario
  const dateToKey = (d: Date) => d.toISOString().slice(0, 10);
  const isDateBooked = (d: Date) => bookedDates.has(dateToKey(d));
  const isDatePast = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  const selectDate = (date: Date) => {
    if (!checkInDate || (checkInDate && checkOutDate)) {
      setCheckInDate(date);
      setCheckOutDate(null);
    } else {
      if (date <= checkInDate) {
        setCheckInDate(date);
        setCheckOutDate(null);
      } else {
        const testDate = new Date(checkInDate);
        let blockedFound = false;
        while (testDate < date) {
          testDate.setDate(testDate.getDate() + 1);
          if (isDateBooked(testDate) && dateToKey(testDate) !== dateToKey(date)) {
            blockedFound = true;
            break;
          }
        }
        if (blockedFound) {
          showToast('⚠️ Las fechas seleccionadas contienen días no disponibles. Elige otro periodo.');
          setCheckInDate(date);
          setCheckOutDate(null);
        } else {
          setCheckOutDate(date);
          setCalendarOpen(false);
        }
      }
    }
  };

  const getDaysCount = () => {
    if (!checkInDate || !checkOutDate) return 0;
    return Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Guardar perfil de anfitriona
  const handleManualSave = async () => {
    const success = await saveHostProfile(hostProfile);
    if (success) {
      showToast(textos.notificaciones.datosSincronizados);
    } else {
      showToast(textos.notificaciones.errorGuardar);
    }
  };

  // ==========================================
  // Acciones CRUD de la Anfitriona
  // ==========================================
  const handleSaveHouse = async (houseData: House, isEdit: boolean) => {
    let updatedHouses: House[];
    const updatedRooms = { ...roomsByHouse };

    if (isEdit) {
      updatedHouses = houses.map(h => (h.id === houseData.id ? houseData : h));
    } else {
      updatedHouses = [houseData, ...houses];
      if (!updatedRooms[houseData.id]) {
        updatedRooms[houseData.id] = [];
      }
    }

    setHouses(updatedHouses);
    setRoomsByHouse(updatedRooms);
    if (!isEdit) {
      setSelectedHouseId(houseData.id);
    }

    try {
      await housesService.saveHouse(houseData);
      showToast(isEdit ? `Alojamiento "${houseData.name}" actualizado.` : `Alojamiento "${houseData.name}" creado con éxito.`);
    } catch (err: any) {
      showToast('Error al guardar: ' + err.message);
    }
  };

  const handleDeleteHouse = async (houseId: string) => {
    const targetHouse = houses.find(h => h.id === houseId);
    const updatedHouses = houses.filter(h => h.id !== houseId);
    const updatedRooms = { ...roomsByHouse };
    delete updatedRooms[houseId];

    setHouses(updatedHouses);
    setRoomsByHouse(updatedRooms);
    if (selectedHouseId === houseId) {
      setSelectedHouseId(updatedHouses[0]?.id || '');
    }

    try {
      await housesService.deleteHouse(houseId);
      showToast(`Alojamiento "${targetHouse?.name || houseId}" eliminado.`);
    } catch (err: any) {
      showToast('Error al eliminar: ' + err.message);
    }
  };

  const handleSaveRoom = async (targetHouseId: string, roomData: Room, isEdit: boolean, originalHouseId?: string) => {
    const updatedRooms = { ...roomsByHouse };

    if (isEdit && originalHouseId && originalHouseId !== targetHouseId) {
      updatedRooms[originalHouseId] = (updatedRooms[originalHouseId] || []).filter(r => r.id !== roomData.id);
      updatedRooms[targetHouseId] = [...(updatedRooms[targetHouseId] || []), roomData];
    } else if (isEdit) {
      updatedRooms[targetHouseId] = (updatedRooms[targetHouseId] || []).map(r => r.id === roomData.id ? roomData : r);
    } else {
      updatedRooms[targetHouseId] = [...(updatedRooms[targetHouseId] || []), roomData];
    }

    let updatedHouses = [...houses];
    const targetRooms = updatedRooms[targetHouseId] || [];
    if (targetRooms.length > 0) {
      const minPrice = Math.min(...targetRooms.map(r => r.price));
      updatedHouses = updatedHouses.map(h => (h.id === targetHouseId ? { ...h, pricePerNight: minPrice } : h));
      setHouses(updatedHouses);
    }

    setRoomsByHouse(updatedRooms);

    try {
      await roomsService.saveRoom(targetHouseId, roomData, originalHouseId);
      if (targetRooms.length > 0) {
        const minPrice = Math.min(...targetRooms.map(r => r.price));
        await housesService.updateHouseBasePrice(targetHouseId, minPrice);
      }
      showToast(isEdit ? `Habitación "${roomData.name}" actualizada.` : `Habitación "${roomData.name}" creada con éxito.`);
    } catch (err: any) {
      showToast('Error al guardar: ' + err.message);
    }
  };

  const handleDeleteRoom = async (houseId: string, roomId: string) => {
    const currentRooms = roomsByHouse[houseId] || [];
    const targetRoom = currentRooms.find(r => r.id === roomId);
    const remainingRooms = currentRooms.filter(r => r.id !== roomId);
    const updatedRooms = { ...roomsByHouse, [houseId]: remainingRooms };

    let updatedHouses = [...houses];
    let minPrice = 0;
    if (remainingRooms.length > 0) {
      minPrice = Math.min(...remainingRooms.map(r => r.price));
      updatedHouses = updatedHouses.map(h => (h.id === houseId ? { ...h, pricePerNight: minPrice } : h));
      setHouses(updatedHouses);
    }

    setRoomsByHouse(updatedRooms);

    try {
      await roomsService.deleteRoom(houseId, roomId);
      if (remainingRooms.length > 0) {
        await housesService.updateHouseBasePrice(houseId, minPrice);
      }
      showToast(`Habitación "${targetRoom?.name || roomId}" eliminada.`);
    } catch (err: any) {
      showToast('Error al eliminar: ' + err.message);
    }
  };

  const handleSaveStory = async (storyData: BlogPost, isEdit: boolean) => {
    let updatedStories: BlogPost[];
    if (isEdit) {
      updatedStories = blogPosts.map(b => (b.id === storyData.id ? storyData : b));
    } else {
      updatedStories = [storyData, ...blogPosts];
    }

    setBlogPosts(updatedStories);

    try {
      await storiesService.saveStory(storyData);
      showToast(isEdit ? `Historia "${storyData.title}" actualizada.` : `Historia "${storyData.title}" publicada en el blog.`);
    } catch (err: any) {
      showToast('Error al guardar: ' + err.message);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    const targetStory = blogPosts.find(b => b.id === storyId);
    setBlogPosts(blogPosts.filter(b => b.id !== storyId));

    try {
      await storiesService.deleteStory(storyId);
      showToast(`Historia "${targetStory?.title || storyId}" eliminada.`);
    } catch (err: any) {
      showToast('Error al eliminar: ' + err.message);
    }
  };

  // Navegación
  const handleNavigate = (page: 'home' | 'detail' | 'blog' | 'contact' | 'dashboard' | 'inbox') => {
    if (page === 'dashboard') {
      const isHost = user && user.role === 'host';
      if (!isHost) {
        showToast('🔒 Inicia sesión con la cuenta de anfitriona para acceder al panel.');
        setLoginModalOpen(true);
        return;
      }
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setUserDropdownOpen(false);
  };

  const handleHouseClick = (id: string) => {
    setSelectedHouseId(id);
    handleNavigate('detail');
  };

  const executeSignOut = async () => {
    try {
      await logout();
      setUserDropdownOpen(false);
      setCurrentPage('home');
      setEligibleReviewPending(true);
      showToast('Sesión cerrada correctamente.');
    } catch (err: any) {
      showToast(err.message || 'Error al cerrar sesión.');
    }
  };

  // Envío de consultas de contacto
  const handleSendInquiry = async () => {
    const finalEmail = contactEmail.trim() || (user ? user.email : '');
    const finalName = contactName.trim() || (user ? user.name : '');

    if (!finalEmail || !finalName || !contactMessage.trim()) {
      showToast('Por favor completa tu nombre, correo y mensaje.');
      return;
    }

    if (!user) {
      showToast('Debes iniciar sesión para enviar una consulta.');
      triggerLoginModal('signin');
      return;
    }

    const selectedTargetHouse = houses.find(h => h.id === contactHouseId) || activeHouse;

    try {
      await inquiriesService.sendInquiry(
        finalName,
        finalEmail,
        selectedTargetHouse?.name || 'Alojamiento',
        contactSubject.trim(),
        contactMessage.trim()
      );

      setContactSubject('');
      setContactMessage('');
      showToast(`✉️ Mensaje enviado a ${hostProfile.name}. Te responderemos pronto.`);
    } catch (err: any) {
      showToast('Error al enviar el mensaje: ' + err.message);
    }
  };

  const handleReplyInquiry = async (inquiryId: string, replyMessage: string, senderRole: 'host' | 'guest') => {
    if (!replyMessage.trim()) {
      showToast('Por favor escribe un mensaje para responder.');
      return;
    }
    
    try {
      const inq = inquiries.find(i => i.id === inquiryId);
      if (!inq) return;

      await inquiriesService.replyInquiry(
        inquiryId,
        inq.thread || [],
        replyMessage,
        senderRole,
        inq.replied
      );
      showToast('✉️ Respuesta enviada con éxito.');
    } catch (err: any) {
      showToast('Error al enviar respuesta: ' + err.message);
    }
  };

  const toggleInquiryRead = async (id: string) => {
    try {
      const inq = inquiries.find(i => i.id === id);
      if (!inq) return;
      await inquiriesService.toggleReadState(id, inq.read);
    } catch (err: any) {
      showToast('Error al actualizar estado: ' + err.message);
    }
  };

  // Publicar reseña de huésped
  const handleAddReview = async (houseId: string, rating: number, comment: string) => {
    if (!user) {
      showToast('Debes iniciar sesión para dejar una reseña.');
      triggerLoginModal('signin');
      return;
    }
    
    try {
      await reviewsService.addReview(houseId, user.name, rating, comment);
      showToast('✨ ¡Muchas gracias por tu reseña!');
      setEligibleReviewPending(false);
    } catch (err: any) {
      showToast('Error al publicar la reseña: ' + err.message);
    }
  };

  // Realizar reserva
  const triggerBookingSuccess = async (totalPrice: number) => {
    if (!user) {
      triggerLoginModal('signin');
      return;
    }
    if (user.role === 'host') {
      showToast('Como anfitriona no puedes reservar tus propios alojamientos.');
      return;
    }
    const days = getDaysCount();
    
    try {
      await bookingsService.createBooking(user.email, activeHouse.id, {
        totalPrice,
        days,
        checkIn: checkInDate ? dateToKey(checkInDate) : undefined,
        checkOut: checkOutDate ? dateToKey(checkOutDate) : undefined
      });
      showToast(`🎉 ¡Solicitud enviada! Reserva registrada de ${days} noches en ${activeHouse.name}. Total: ${totalPrice}€`);
      setCheckInDate(null);
      setCheckOutDate(null);
    } catch (err: any) {
      showToast('Error al registrar la reserva: ' + err.message);
    }
  };

  // Modificar precios de habitaciones en lote (Panel)
  const handleHostSavePricing = async () => {
    const activeRooms = roomsByHouse[activeHouse.id] || [];
    const updated = activeRooms.map(r => {
      if (editPricePrefix[r.id] !== undefined) {
        return { ...r, price: Number(editPricePrefix[r.id]) };
      }
      return r;
    });

    setRoomsByHouse(prev => ({
      ...prev,
      [activeHouse.id]: updated
    }));

    let minPrice = activeHouse.pricePerNight;
    if (updated.length > 0) {
      minPrice = Math.min(...updated.map(r => r.price));
      setHouses(prev => prev.map(h => h.id === activeHouse.id ? { ...h, pricePerNight: minPrice } : h));
    }

    try {
      await roomsService.batchUpdatePricing(activeHouse.id, updated, minPrice);
      showToast('✔️ Precios actualizados y guardados correctamente.');
    } catch (err: any) {
      showToast('Error al guardar precios: ' + err.message);
    }
  };

  // Publicar nueva historia
  const handlePublishStory = async () => {
    if (!newBlogTitle.trim() || !newBlogContent.trim()) {
      showToast('Por favor escribe un título y el contenido de la historia.');
      return;
    }

    const newStory: BlogPost = {
      id: `story-${Date.now()}`,
      category: newBlogCategory,
      title: newBlogTitle,
      subtitle: newBlogExcerpt || 'Historias y aventuras locales.',
      excerpt: newBlogExcerpt || newBlogContent.substring(0, 150) + '...',
      content: newBlogContent,
      author: hostProfile.name || 'Mila',
      readTime: `${Math.max(1, Math.ceil(newBlogContent.split(' ').length / 200))} min de lectura`,
      publishedDate: new Intl.DateTimeFormat('es-ES', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()),
      image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&auto=format&fit=crop'
    };

    setBlogPosts(prev => [newStory, ...prev]);
    
    try {
      await storiesService.saveStory(newStory);
      setNewBlogTitle('');
      setNewBlogExcerpt('');
      setNewBlogContent('');
      showToast('✍️ ¡Nueva historia publicada en el blog!');
    } catch (err: any) {
      showToast('Error al publicar: ' + err.message);
    }
  };

  // Gestión de Fotos
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoModalTarget, setPhotoModalTarget] = useState<{ type: 'house' | 'room', id?: string } | null>(null);

  const handleAddHousePhoto = () => {
    setPhotoModalTarget({ type: 'house' });
    setPhotoModalOpen(true);
  };

  const handleAddRoomPhoto = (roomId: string) => {
    setPhotoModalTarget({ type: 'room', id: roomId });
    setPhotoModalOpen(true);
  };

  const handleConfirmAddPhoto = async (url: string) => {
    if (!photoModalTarget) return;

    try {
      if (photoModalTarget.type === 'house') {
        const newImages = [...activeHouse.images, url];
        setHouses(prev => prev.map(h => h.id === activeHouse.id ? { ...h, images: newImages } : h));
        await housesService.updateHouseImages(activeHouse.id, newImages);
        showToast('📸 Foto añadida a la galería del alojamiento.');
      } else if (photoModalTarget.type === 'room' && photoModalTarget.id) {
        const rooms = roomsByHouse[activeHouse.id] || [];
        const room = rooms.find(r => r.id === photoModalTarget.id);
        if (room) {
          const newImages = [...room.images, url];
          setRoomsByHouse(prev => ({
            ...prev,
            [activeHouse.id]: (prev[activeHouse.id] || []).map(r => 
              r.id === photoModalTarget.id ? { ...r, images: newImages } : r
            )
          }));
          await roomsService.updateRoomImages(activeHouse.id, photoModalTarget.id, newImages);
          showToast('📸 Foto añadida a la galería de la habitación.');
        }
      }
    } catch (err: any) {
      showToast('Error al guardar la foto: ' + err.message);
    }
  };

  const handleRemoveHousePhoto = async (index: number) => {
    const newImages = [...activeHouse.images];
    newImages.splice(index, 1);
    
    setHouses(prev => prev.map(h => h.id === activeHouse.id ? { ...h, images: newImages } : h));
    
    try {
      await housesService.updateHouseImages(activeHouse.id, newImages);
      showToast('📸 Foto eliminada de la galería del alojamiento.');
    } catch (err: any) {
      showToast('Error al borrar la foto: ' + err.message);
    }
  };

  const handleRemoveRoomPhoto = async (roomId: string, index: number) => {
    let newImages: string[] = [];
    setRoomsByHouse(prev => {
      const rooms = prev[activeHouse.id] || [];
      const updated = rooms.map(r => {
        if (r.id === roomId) {
          newImages = [...r.images];
          newImages.splice(index, 1);
          return { ...r, images: newImages };
        }
        return r;
      });
      return { ...prev, [activeHouse.id]: updated };
    });
    
    try {
      await roomsService.updateRoomImages(activeHouse.id, roomId, newImages);
      showToast('📸 Foto eliminada de la galería de la habitación.');
    } catch (err: any) {
      showToast('Error al borrar la foto: ' + err.message);
    }
  };

  const toggleRoomAvailableOnDash = async (roomId: string) => {
    const list = roomsByHouse[activeHouse.id] || [];
    const updated = list.map(r => (r.id === roomId ? { ...r, available: !r.available } : r));
    setRoomsByHouse(prev => ({ ...prev, [activeHouse.id]: updated }));
    
    try {
      const room = updated.find(r => r.id === roomId);
      if (room) {
        await roomsService.updateRoomAvailability(activeHouse.id, roomId, room.available);
      }
    } catch (err: any) {
      showToast('Error al actualizar disponibilidad: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF7EC] text-[#3F434D] font-sans antialiased overflow-x-clip selection:bg-[#CFE4EC] selection:text-[#3D7A95]">
      
      {/* Notificaciones */}
      <Toast toastMessage={toastMessage} />
      
      {loadFailed && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[60] flex items-center gap-3 bg-red-600 text-white py-3 px-5 rounded-2xl shadow-xl max-w-sm">
          <span className="text-sm font-medium">No se han podido cargar los datos de Firestore. Recarga la página.</span>
        </div>
      )}

      {/* Navegación Principal */}
      <Navigation 
        currentPage={currentPage}
        user={user}
        userDropdownOpen={userDropdownOpen}
        setUserDropdownOpen={setUserDropdownOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        handleNavigate={handleNavigate}
        triggerLoginModal={triggerLoginModal}
        executeSignOut={executeSignOut}
        showToast={showToast}
      />

      {/* Banner de Invitación a Reseñar (Solo para huéspedes con reserva) */}
      {user && user.role === 'guest' && eligibleReviewPending && activeHouse && (
        <div className="bg-gradient-to-r from-[#F0DDBE] to-[#CFE4EC] border-b border-[rgba(63,67,77,0.1)] py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 text-md rounded-full bg-white flex items-center justify-center shadow-sm">⭐</div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3F434D]">¡Queremos saber tu opinión!</h4>
                <p className="text-xs text-[#6E727C] mt-0.5">Cuéntanos cómo fue tu estancia en {activeHouse.name}.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleHouseClick(activeHouse.id)} 
                className="py-2 px-5 bg-[#3F434D] text-[#FBF7EC] rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#1E2024] transition-all"
              >
                Escribir reseña
              </button>
              <button 
                onClick={() => setEligibleReviewPending(false)} 
                className="h-8 w-8 hover:bg-[rgba(0,0,0,0.05)] rounded-full flex items-center justify-center text-xs text-[#6E727C]"
                title="Cerrar aviso"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vistas Principales */}
      <main>
        {/* 1. CATÁLOGO / INICIO */}
        {currentPage === 'home' && (
          <HomeView 
            houses={houses}
            handleNavigate={handleNavigate}
            handleHouseClick={handleHouseClick}
            showToast={showToast}
          />
        )}

        {/* 2. DETALLE DE ALOJAMIENTO */}
        {currentPage === 'detail' && activeHouse && (
          <DetailView 
            handleNavigate={handleNavigate}
            activeHouse={activeHouse}
            showToast={showToast}
            roomsByHouse={roomsByHouse}
            checkInDate={checkInDate}
            setCheckInDate={setCheckInDate}
            checkOutDate={checkOutDate}
            setCheckOutDate={setCheckOutDate}
            reviewsByHouse={reviewsByHouse}
            calendarOpen={calendarOpen}
            setCalendarOpen={setCalendarOpen}
            currentCalMonth={currentCalMonth}
            setCurrentCalMonth={setCurrentCalMonth}
            dateToKey={dateToKey}
            isDatePast={isDatePast}
            isDateBooked={isDateBooked}
            selectDate={selectDate}
            guestCount={guestCount}
            setGuestCount={setGuestCount}
            triggerBookingSuccess={triggerBookingSuccess}
            getDaysCount={getDaysCount}
            user={user}
            handleAddReview={handleAddReview}
            canReview={Boolean(
              user?.role === 'guest' && 
              activeHouse && 
              pastBookings.some(b => b.guestEmail.toLowerCase() === user.email.toLowerCase() && b.houseId === activeHouse.id)
            )}
          />
        )}

        {/* 3. HISTORIAS / BLOG */}
        {currentPage === 'blog' && <BlogView blogPosts={blogPosts} />}

        {/* 4. CONTACTO Y CONSULTAS */}
        {currentPage === 'contact' && (
          <ContactView 
            houses={houses}
            hostProfile={hostProfile}
            contactName={contactName}
            setContactName={setContactName}
            contactEmail={contactEmail}
            setContactEmail={setContactEmail}
            contactHouseId={contactHouseId}
            setContactHouseId={setContactHouseId}
            contactSubject={contactSubject}
            setContactSubject={setContactSubject}
            contactMessage={contactMessage}
            setContactMessage={setContactMessage}
            handleSendInquiry={handleSendInquiry}
          />
        )}

        {/* 5. PANEL DE GESTIÓN (ANFITRIONA) */}
        {currentPage === 'dashboard' && (
          <DashboardView 
            user={user}
            triggerLoginModal={triggerLoginModal}
            dashActiveTab={dashActiveTab}
            setDashActiveTab={setDashActiveTab}
            inquiries={inquiries}
            setInquiries={setInquiries}
            toggleInquiryRead={toggleInquiryRead}
            houses={houses}
            blogPosts={blogPosts}
            setBlogPosts={setBlogPosts}
            hostProfile={hostProfile}
            setHostProfile={setHostProfile}
            selectedHouseId={selectedHouseId}
            setSelectedHouseId={setSelectedHouseId}
            activeHouse={activeHouse!}
            roomsByHouse={roomsByHouse}
            setHouses={setHouses}
            setRoomsByHouse={setRoomsByHouse}
            editPricePrefix={editPricePrefix}
            setEditPricePrefix={setEditPricePrefix}
            toggleRoomAvailableOnDash={toggleRoomAvailableOnDash}
            handleRemoveHousePhoto={handleRemoveHousePhoto}
            handleAddHousePhoto={handleAddHousePhoto}
            handleRemoveRoomPhoto={handleRemoveRoomPhoto}
            handleAddRoomPhoto={handleAddRoomPhoto}
            handleHostSavePricing={handleHostSavePricing}
            showToast={showToast}
            newBlogTitle={newBlogTitle}
            setNewBlogTitle={setNewBlogTitle}
            newBlogCategory={newBlogCategory}
            setNewBlogCategory={setNewBlogCategory}
            newBlogExcerpt={newBlogExcerpt}
            setNewBlogExcerpt={setNewBlogExcerpt}
            newBlogContent={newBlogContent}
            setNewBlogContent={setNewBlogContent}
            handlePublishStory={handlePublishStory}
            handleReplyInquiry={handleReplyInquiry}
            handleNavigate={handleNavigate}
            loadFailed={loadFailed}
            hasUnsavedChanges={hasUnsavedChanges}
            setHasUnsavedChanges={setHasUnsavedChanges}
            isSaving={isSaving}
            handleManualSave={handleManualSave}
            onSaveHouse={handleSaveHouse}
            onDeleteHouse={handleDeleteHouse}
            onSaveRoom={handleSaveRoom}
            onDeleteRoom={handleDeleteRoom}
            onSaveStory={handleSaveStory}
            onDeleteStory={handleDeleteStory}
          />
        )}

        {/* 6. BANDEJA DE MENSAJES DEL HUÉSPED */}
        {currentPage === 'inbox' && user && user.role === 'guest' && (
          <GuestInboxView
            user={user}
            inquiries={inquiries}
            handleReplyInquiry={handleReplyInquiry}
          />
        )}
      </main>

      {/* Modales */}
      <LoginModal 
        loginModalOpen={loginModalOpen}
        setLoginModalOpen={setLoginModalOpen}
        showToast={showToast}
      />

      <AddPhotoModal 
        isOpen={photoModalOpen}
        onClose={() => { setPhotoModalOpen(false); setPhotoModalTarget(null); }}
        onAdd={handleConfirmAddPhoto}
        title={photoModalTarget?.type === 'house' ? 'Añadir Foto del Alojamiento' : 'Añadir Foto de la Habitación'}
      />

      <Footer 
        houses={houses}
        handleNavigate={handleNavigate}
        handleHouseClick={handleHouseClick}
        showToast={showToast}
      />
    </div>
  );
}
