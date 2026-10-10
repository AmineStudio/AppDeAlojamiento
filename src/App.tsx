/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  MapPin, 
  User, 
  Users, 
  Star, 
  Wifi, 
  Coffee, 
  Compass, 
  Waves, 
  Sunset, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Check, 
  Lock, 
  Mail, 
  FileText, 
  Heart, 
  X, 
  Send,
  MessageSquare,
  TrendingUp,
  Settings,
  Image as ImageIcon,
  LogOut,
  Sliders,
  DollarSign,
  Menu
} from 'lucide-react';

import { initialHouses, initialRooms, initialReviews, initialInquiries, initialBlogPosts, initialHostProfile } from './data';
import { House, Room, GuestReview, MessageInquiry, BlogPost, HostProfile } from './types';
import { MilaLogo } from './components/MilaLogo';
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

import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, setDoc, doc, addDoc, updateDoc, getDoc, where, deleteDoc, writeBatch } from 'firebase/firestore';
import { ADMIN_EMAILS } from './config/admins';
import textos from './content/textos.json';

export default function App() {
  // Navigation & View State
  const [currentPage, setCurrentPage] = useState<'home' | 'detail' | 'blog' | 'contact' | 'dashboard' | 'inbox'>('home');
  const [selectedHouseId, setSelectedHouseId] = useState<string>('leon-y-castillo');
  const [houseCategory, setHouseCategory] = useState<string>('All stays');

  // Core Data State (Traído desde DataContext)
  const {
    isAppDataLoaded, loadFailed, hasUnsavedChanges, setHasUnsavedChanges,
    isSaving, setIsSaving, houses, setHouses, roomsByHouse, setRoomsByHouse,
    reviewsByHouse, setReviewsByHouse, inquiries, setInquiries,
    blogPosts, setBlogPosts, hostProfile, setHostProfile
  } = useData();
  const [pastBookings, setPastBookings] = useState<{guestEmail: string, houseId: string}[]>([
    { guestEmail: 'guest@example.com', houseId: 'leon-y-castillo' },
    { guestEmail: 'amine.saidani.101@gmail.com', houseId: 'leon-y-castillo' }
  ]);

  // Active Selected House computation
  const activeHouse = useMemo(() => {
    return houses.find(h => h.id === selectedHouseId) || houses[0];
  }, [houses, selectedHouseId]);

  // Auth State
  const { user, loginModalOpen, setLoginModalOpen, triggerLoginModal, logout, loginWithGoogle } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Booking Calendar Widget State
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [currentCalMonth, setCurrentCalMonth] = useState<Date>(new Date(2026, 5, 1)); // June 2026
  const [guestCount, setGuestCount] = useState<number>(2);

  // Review Form State
  const [guestRating, setGuestRating] = useState<number>(5);
  const [cleanlinessScore, setCleanlinessScore] = useState<number>(5);
  const [locationScore, setLocationScore] = useState<number>(5);
  const [valueScore, setValueScore] = useState<number>(5);
  const [communicationScore, setCommunicationScore] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [eligibleReviewPending, setEligibleReviewPending] = useState<boolean>(true);

  // Contact / Inquiry Form State
  const [contactHouseId, setContactHouseId] = useState<string>('leon-y-castillo');
  const [contactSubject, setContactSubject] = useState<string>('');
  const [contactMessage, setContactMessage] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');

  // Dashboard Tabs (Host Mode Only)
  const [dashActiveTab, setDashActiveTab] = useState<'listings' | 'inquiries' | 'stories' | 'settings'>('listings');

  // Host Listing Editor State
  const [editPricePrefix, setEditPricePrefix] = useState<Record<string, number>>({});

  // Host Story Creator State
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogCategory, setNewBlogCategory] = useState('Local secrets 🤫');
  const [newBlogExcerpt, setNewBlogExcerpt] = useState('');
  const [newBlogContent, setNewBlogContent] = useState('');

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Generate Simulated Booked Days in May-July 2026
  const BOOKED_DATES_SET = useMemo(() => {
    return new Set<string>([
      '2026-06-01', '2026-06-02', '2026-06-03',
      '2026-06-10', '2026-06-11', '2026-06-12', '2026-06-13',
      '2026-06-24', '2026-06-25', '2026-06-26',
      '2026-07-04', '2026-07-05', '2026-07-06', '2026-07-15', '2026-07-16'
    ]);
  }, []);

  // Sync pricing editor inputs on house change
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

  // Save app data to Firestore
  const saveAppData = async (
    newHouses: House[], 
    newRooms: Record<string, Room[]>, 
    newBlogPosts: BlogPost[], 
    newHostProfile: HostProfile,
    customMessage?: string
  ) => {
    if (loadFailed) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'appData/main'), {
        houses: newHouses,
        roomsByHouse: newRooms,
        blogPosts: newBlogPosts,
        hostProfile: newHostProfile
      });
      showToast(customMessage || textos.notificaciones.datosSincronizados);
      setHasUnsavedChanges(false);
    } catch (err: any) {
      console.error("Failed to save app data", err);
      if (err.code === 'permission-denied' || (err.message && err.message.includes('permission'))) {
        try {
          handleFirestoreError(err, OperationType.WRITE, 'appData/main');
        } catch {
          showToast("Aviso: Se requiere iniciar sesión con la cuenta de anfitriona para guardar.");
        }
      } else {
        showToast(textos.notificaciones.errorGuardar);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSave = async () => {
    await saveAppData(houses, roomsByHouse, blogPosts, hostProfile, textos.notificaciones.datosSincronizados);
  };

  // ==========================================
  // Gestiones de la Anfitriona (Panel)
  // ==========================================

  // 1. Alojamientos
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
      await setDoc(doc(db, 'houses', houseData.id), houseData);
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
      await deleteDoc(doc(db, 'houses', houseId));
      showToast(`Alojamiento "${targetHouse?.name || houseId}" eliminado.`);
    } catch (err: any) {
      showToast('Error al eliminar: ' + err.message);
    }
  };

  // 2. Habitaciones
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
      if (isEdit && originalHouseId && originalHouseId !== targetHouseId) {
        await deleteDoc(doc(db, `houses/${originalHouseId}/rooms`, roomData.id));
      }
      await setDoc(doc(db, `houses/${targetHouseId}/rooms`, roomData.id), roomData);
      
      if (targetRooms.length > 0) {
        const minPrice = Math.min(...targetRooms.map(r => r.price));
        await updateDoc(doc(db, 'houses', targetHouseId), { pricePerNight: minPrice });
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
    const updatedRooms = {
      ...roomsByHouse,
      [houseId]: remainingRooms
    };

    let updatedHouses = [...houses];
    let minPrice = 0;
    if (remainingRooms.length > 0) {
      minPrice = Math.min(...remainingRooms.map(r => r.price));
      updatedHouses = updatedHouses.map(h => (h.id === houseId ? { ...h, pricePerNight: minPrice } : h));
      setHouses(updatedHouses);
    }

    setRoomsByHouse(updatedRooms);

    try {
      await deleteDoc(doc(db, `houses/${houseId}/rooms`, roomId));
      if (remainingRooms.length > 0) {
        await updateDoc(doc(db, 'houses', houseId), { pricePerNight: minPrice });
      }
      showToast(`Habitación "${targetRoom?.name || roomId}" eliminada.`);
    } catch (err: any) {
      showToast('Error al eliminar: ' + err.message);
    }
  };

  // 3. Historias
  const handleSaveStory = async (storyData: BlogPost, isEdit: boolean) => {
    let updatedStories: BlogPost[];
    if (isEdit) {
      updatedStories = blogPosts.map(b => (b.id === storyData.id ? storyData : b));
    } else {
      updatedStories = [storyData, ...blogPosts];
    }

    setBlogPosts(updatedStories);

    try {
      await setDoc(doc(db, 'blogPosts', storyData.id), storyData);
      showToast(isEdit ? `Historia "${storyData.title}" actualizada.` : `Historia "${storyData.title}" publicada en el blog.`);
    } catch (err: any) {
      showToast('Error al guardar: ' + err.message);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    const targetStory = blogPosts.find(b => b.id === storyId);
    const updatedStories = blogPosts.filter(b => b.id !== storyId);
    setBlogPosts(updatedStories);

    try {
      await deleteDoc(doc(db, 'blogPosts', storyId));
      showToast(`Historia "${targetStory?.title || storyId}" eliminada.`);
    } catch (err: any) {
      showToast('Error al eliminar: ' + err.message);
    }
  };


  useEffect(() => {
    if (activeHouse) {
      const q = query(collection(db, `houses/${activeHouse.id}/reviews`));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reviews = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as GuestReview));
        setReviewsByHouse(prev => ({
          ...prev,
          [activeHouse.id]: reviews
        }));
      }, (err) => {
        console.error("Error fetching reviews", err);
      });
      return () => unsubscribe();
    }
  }, [activeHouse]);

  // Handle Navigation Guard
  const handleNavigate = (page: 'home' | 'detail' | 'blog' | 'contact' | 'dashboard' | 'inbox') => {
    if (page === 'dashboard') {
      const isHost = user && user.role === 'host';
      if (!isHost) {
        showToast('🔒 Inicia sesión con la cuenta de la dueña (admin) para acceder al panel.');
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

  // Auth Handling

  const executeSignOut = async () => {
    try {
      await logout();
      setUserDropdownOpen(false);
      setCurrentPage('home');
      setEligibleReviewPending(true);
      showToast('Successfully signed out.');
    } catch (err: any) {
      showToast(err.message || 'Error signing out.');
    }
  };

  // Calendar Helpers
  const dateToKey = (d: Date) => d.toISOString().slice(0, 10);
  const isDateBooked = (d: Date) => BOOKED_DATES_SET.has(dateToKey(d));
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
        // Ensure no blocked dates lie between selection range
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
          showToast('⚠️ Selected range contains unavailable dates. Please choose a free slot.');
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

  // Posting Reviews (Real-time update)
  const handlePostReview = () => {
    if (!user) {
      triggerLoginModal();
      return;
    }
    if (user.role === 'host') {
      showToast('Hosts cannot review properties.');
      return;
    }
    if (!reviewComment.trim()) {
      showToast('Please type a comment before posting.');
      return;
    }

    const newReview: GuestReview = {
      id: `rev-${Date.now()}`,
      authorName: user.name,
      date: 'June 2026',
      rating: guestRating,
      comment: reviewComment,
      categories: {
        cleanliness: cleanlinessScore,
        location: locationScore,
        value: valueScore,
        communication: communicationScore
      }
    };

    // Calculate new ratings
    const existing = reviewsByHouse[activeHouse.id] || [];
    const updatedReviews = [newReview, ...existing];
    
    // Update overall house ratings symmetrically
    const avgRating = parseFloat((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(2));
    
    setHouses(prev => prev.map(h => {
      if (h.id === activeHouse.id) {
        return {
          ...h,
          rating: avgRating,
          reviewCount: updatedReviews.length
        };
      }
      return h;
    }));

    setReviewsByHouse(prev => ({
      ...prev,
      [activeHouse.id]: updatedReviews
    }));

    setReviewComment('');
    setEligibleReviewPending(false);
    showToast('⭐ Review submitted and live! Thank you for sharing your stay.');
  };

  useEffect(() => {
    if (user && user.role === 'host') {
      const q = query(collection(db, 'inquiries'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const inqs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as MessageInquiry));
        setInquiries(inqs);
      }, (err) => console.error(err));
      return () => unsubscribe();
    } else if (user && user.role === 'guest') {
      // Guest inquiries
      const q = query(collection(db, 'inquiries'), where('guestEmail', '==', user.email));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const inqs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as MessageInquiry));
        setInquiries(inqs);
      }, (err) => console.error(err));
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const q = user.role === 'host' 
        ? query(collection(db, 'pastBookings')) 
        : query(collection(db, 'pastBookings'), where('guestEmail', '==', user.email));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map(doc => {
          const data = doc.data();
          return { guestEmail: data.guestEmail, houseId: data.houseId };
        });
        setPastBookings(bookings);
      }, (err) => console.error(err));
      return () => unsubscribe();
    }
  }, [user]);

  // Submit Contact Form Inquiry
  const handleSendInquiry = async () => {
    const finalEmail = contactEmail.trim() || (user ? user.email : '');
    const finalName = contactName.trim() || (user ? user.name : '');

    if (!finalEmail || !finalName || !contactMessage.trim()) {
      showToast('Please fill in your name, email and message.');
      return;
    }

    if (!user) {
      showToast('You must be logged in and verified to send an inquiry.');
      return;
    }

    const selectedTargetHouse = houses.find(h => h.id === contactHouseId) || activeHouse;

    try {
      await addDoc(collection(db, 'inquiries'), {
        guestName: finalName,
        guestEmail: finalEmail,
        houseName: selectedTargetHouse.name,
        subject: contactSubject.trim() || `Inquiry regarding ${selectedTargetHouse.name}`,
        message: contactMessage.trim(),
        date: new Date().toISOString().slice(0, 10),
        read: false,
        thread: [
          {
            id: `msg-${Date.now()}`,
            sender: 'guest',
            message: contactMessage.trim(),
            date: new Date().toISOString().slice(0, 10)
          }
        ]
      });

      setContactSubject('');
      setContactMessage('');
      showToast('✉️ Message dispatched to Mila. We expect to reply within 4 hours.');
    } catch (err: any) {
      showToast('Failed to send message: ' + err.message);
    }
  };

  const handleReplyInquiry = async (inquiryId: string, replyMessage: string, senderRole: 'host' | 'guest') => {
    if (!replyMessage.trim()) {
      showToast('Please type a message to reply.');
      return;
    }
    
    try {
      const inq = inquiries.find(i => i.id === inquiryId);
      if (!inq) return;

      const newThread = [
        ...(inq.thread || []),
        {
          id: `msg-${Date.now()}`,
          sender: senderRole,
          message: replyMessage.trim(),
          date: new Date().toISOString().slice(0, 10)
        }
      ];

      const inqRef = doc(db, 'inquiries', inquiryId);
      await updateDoc(inqRef, {
        thread: newThread,
        replied: senderRole === 'host' ? true : inq.replied,
        read: senderRole === 'guest' ? false : true // Mark unread for host if guest replies
      });
      showToast('✉️ Reply sent successfully.');
    } catch (err: any) {
      showToast('Error sending reply: ' + err.message);
    }
  };

  const handleAddReview = async (houseId: string, rating: number, comment: string) => {
    if (!user) {
      showToast('You must be logged in to leave a review.');
      return;
    }
    
    try {
      const reviewDoc = doc(collection(db, `houses/${houseId}/reviews`));
      await setDoc(reviewDoc, {
        authorName: user.name,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        rating,
        comment
      });
      showToast('✨ Thank you for your review!');
    } catch (err: any) {
      showToast('Error posting review: ' + err.message);
    }
  };

  // Booking Execution Action
  const triggerBookingSuccess = async (totalPrice: number) => {
    if (!user) {
      triggerLoginModal();
      return;
    }
    if (user.role === 'host') {
      showToast('Mila, you cannot book rooms on your own host portal!');
      return;
    }
    const days = getDaysCount();
    
    try {
      await addDoc(collection(db, 'pastBookings'), {
        guestEmail: user.email,
        houseId: activeHouse.id
      });
      showToast(`🎉 Reservation Request Registered! Mila has received your booking for ${days} nights on ${activeHouse.name}. Total: €${totalPrice}`);
      setCheckInDate(null);
      setCheckOutDate(null);
    } catch (err: any) {
      showToast('Error registering booking: ' + err.message);
    }
  };

  // Host Action: Save and update room rates on active listing
  // Host Action: Save and update room rates on active listing
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

    // Update base price of House listing dynamically
    let minPrice = activeHouse.pricePerNight;
    if (updated.length > 0) {
      minPrice = Math.min(...updated.map(r => r.price));
      setHouses(prev => prev.map(h => {
        if (h.id === activeHouse.id) {
          return { ...h, pricePerNight: minPrice };
        }
        return h;
      }));
    }

    try {
      const batch = writeBatch(db);
      updated.forEach(r => {
        batch.update(doc(db, `houses/${activeHouse.id}/rooms`, r.id), { price: r.price });
      });
      batch.update(doc(db, 'houses', activeHouse.id), { pricePerNight: minPrice });
      await batch.commit();
      showToast('✔️ Precios actualizados y guardados correctamente.');
    } catch (err: any) {
      showToast('Error al guardar precios: ' + err.message);
    }
  };

  // Host Action: Publish a new blog story
  const handlePublishStory = async () => {
    if (!newBlogTitle.trim() || !newBlogContent.trim()) {
      showToast('Please fill in a title and the content story.');
      return;
    }

    const newStory: BlogPost = {
      id: `story-${Date.now()}`,
      category: newBlogCategory,
      title: newBlogTitle,
      subtitle: newBlogExcerpt || 'Local stories and adventures.',
      excerpt: newBlogExcerpt || newBlogContent.substring(0, 150) + '...',
      content: newBlogContent,
      author: 'Mila',
      readTime: `${Math.ceil(newBlogContent.split(' ').length / 200)} min read`,
      publishedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&auto=format&fit=crop'
    };

    setBlogPosts(prev => [newStory, ...prev]);
    
    try {
      await setDoc(doc(db, 'blogPosts', newStory.id), newStory);
      setNewBlogTitle('');
      setNewBlogExcerpt('');
      setNewBlogContent('');
      showToast('✍️ New Story published to Mila\'s blog page!');
    } catch (err: any) {
      showToast('Error al publicar: ' + err.message);
    }
  };

  // Helper: toggle inbox messages read state
  const toggleInquiryRead = async (id: string) => {
    try {
      const inq = inquiries.find(i => i.id === id);
      if (!inq) return;
      const inqRef = doc(db, 'inquiries', id);
      await updateDoc(inqRef, { read: !inq.read });
    } catch (err: any) {
      showToast('Error updating read state: ' + err.message);
    }
  };

  // Helper: toggle room base availability (Host dashboard switches)
  const toggleRoomAvailableOnDash = async (roomId: string) => {
    const list = roomsByHouse[activeHouse.id] || [];
    const updated = list.map(r => {
      if (r.id === roomId) {
        return { ...r, available: !r.available };
      }
      return r;
    });
    setRoomsByHouse(prev => ({
      ...prev,
      [activeHouse.id]: updated
    }));
    
    try {
      const room = updated.find(r => r.id === roomId);
      if (room) {
        await updateDoc(doc(db, `houses/${activeHouse.id}/rooms`, roomId), { available: room.available });
      }
    } catch (err: any) {
      showToast('Error al guardar disponibilidad: ' + err.message);
    }
  };

  // Photo Management Handlers
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
        await updateDoc(doc(db, 'houses', activeHouse.id), { images: newImages });
        showToast("📸 Photo added successfully to the house gallery.");
      } else if (photoModalTarget.type === 'room') {
        const rooms = roomsByHouse[activeHouse.id] || [];
        const room = rooms.find(r => r.id === photoModalTarget.id);
        if (room) {
          const newImages = [...room.images, url];
          setRoomsByHouse(prev => ({
            ...prev,
            [activeHouse.id]: prev[activeHouse.id].map(r => 
              r.id === photoModalTarget.id ? { ...r, images: newImages } : r
            )
          }));
          await updateDoc(doc(db, `houses/${activeHouse.id}/rooms`, photoModalTarget.id), { images: newImages });
          showToast("📸 Photo added successfully to the room gallery.");
        }
      }
    } catch (err: any) {
      showToast('Error al guardar la foto: ' + err.message);
    }
  };

  const handleRemoveHousePhoto = async (index: number) => {
    const newImages = [...activeHouse.images];
    newImages.splice(index, 1);
    
    setHouses(prev => prev.map(h => {
      if (h.id === activeHouse.id) return { ...h, images: newImages };
      return h;
    }));
    
    try {
      await updateDoc(doc(db, 'houses', activeHouse.id), { images: newImages });
      showToast("📸 Photo removed from the house gallery.");
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
      await updateDoc(doc(db, `houses/${activeHouse.id}/rooms`, roomId), { images: newImages });
      showToast("📸 Photo removed from room gallery.");
    } catch (err: any) {
      showToast('Error al borrar la foto: ' + err.message);
    }
  }

  // Filtered houses
  const filteredHousesList = houses;

  return (
    <div className="min-h-screen bg-[#FBF7EC] text-[#3F434D] font-sans antialiased overflow-x-clip selection:bg-[#CFE4EC] selection:text-[#3D7A95]">
      
      {/* Toast Notification */}
      <Toast toastMessage={toastMessage} />
      
      {loadFailed && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[60] flex items-center gap-3 bg-red-600 text-white py-3 px-5 rounded-2xl shadow-xl max-w-sm">
          <span className="text-sm font-medium">No se han podido cargar los datos. Recarga la página antes de editar.</span>
        </div>
      )}

      {/* Navigation Header */}
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

      {/* Review incentive notice banner (Only for logged guests with stays pending) */}
      {user && user.role === 'guest' && eligibleReviewPending && (
        <div className="bg-gradient-to-r from-[#F0DDBE] to-[#CFE4EC] border-b border-[rgba(63,67,77,0.1)] py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 text-md rounded-full bg-white flex items-center justify-center shadow-sm">⭐</div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3F434D]">We want to hear from you!</h4>
                <p className="text-xs text-[#6E727C] mt-0.5">Let Mila know how your recent stay at Urban Loft León y Castillo was.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => handleHouseClick('leon-y-castillo')} className="py-2 px-5 bg-[#3F434D] text-[#FBF7EC] rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#1E2024] transition-all">
                Write Review
              </button>
              <button onClick={() => setEligibleReviewPending(false)} className="h-8 w-8 hover:bg-[rgba(0,0,0,0.05)] rounded-full flex items-center justify-center text-xs text-[#6E727C]">
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Pages */}
      <main>

        {/* 1. HOME VIEW */}
        {currentPage === 'home' && (
          <HomeView 
            houses={filteredHousesList}
            handleNavigate={handleNavigate}
            handleHouseClick={handleHouseClick}
            showToast={showToast}
          />
        )}

        {/* 2. DETAIL VIEW */}
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
            canReview={user?.role === 'guest' && pastBookings.some(b => b.guestEmail.toLowerCase() === user.email.toLowerCase() && b.houseId === activeHouse.id)}
          />
        )}

        {/* 3. STORIES / BLOG VIEW */}
        {currentPage === 'blog' && <BlogView blogPosts={blogPosts} />}

        {/* 4. CONTACT / QUESTION VIEW */}
        {currentPage === 'contact' && (
          <ContactView 
            houses={initialHouses}
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

        {/* 5. HOST DASHBOARD VIEW */}
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
        {/* 6. GUEST INBOX VIEW */}
        {currentPage === 'inbox' && user && user.role === 'guest' && (
          <GuestInboxView
            user={user}
            inquiries={inquiries}
            handleReplyInquiry={handleReplyInquiry}
          />
        )}
      </main>

      {/* Auth Modal overlay */}
      <LoginModal 
        loginModalOpen={loginModalOpen}
        setLoginModalOpen={setLoginModalOpen}
        showToast={showToast}
      />

      {/* Photo Modal overlay */}
      <AddPhotoModal 
        isOpen={photoModalOpen}
        onClose={() => { setPhotoModalOpen(false); setPhotoModalTarget(null); }}
        onAdd={handleConfirmAddPhoto}
        title={photoModalTarget?.type === 'house' ? 'Add House Photo' : 'Add Room Photo'}
      />

      <Footer 
        handleNavigate={handleNavigate}
        handleHouseClick={handleHouseClick}
        showToast={showToast}
      />
    </div>
  );
}

