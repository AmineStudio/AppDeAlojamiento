import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  housesService, 
  roomsService, 
  storiesService, 
  profileService,
  inquiriesService,
  bookingsService,
  reviewsService,
  BookingRecord
} from '../services';
import { useAuth } from './AuthContext';
import { initialHouses, initialRooms, initialBlogPosts, initialHostProfile, initialInquiries, initialReviews } from '../data';
import { House, Room, BlogPost, HostProfile, MessageInquiry, GuestReview } from '../types';

interface DataContextType {
  isAppDataLoaded: boolean;
  loadFailed: boolean;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (val: boolean) => void;
  isSaving: boolean;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  houses: House[];
  setHouses: React.Dispatch<React.SetStateAction<House[]>>;
  roomsByHouse: Record<string, Room[]>;
  setRoomsByHouse: React.Dispatch<React.SetStateAction<Record<string, Room[]>>>;
  reviewsByHouse: Record<string, GuestReview[]>;
  setReviewsByHouse: React.Dispatch<React.SetStateAction<Record<string, GuestReview[]>>>;
  inquiries: MessageInquiry[];
  setInquiries: React.Dispatch<React.SetStateAction<MessageInquiry[]>>;
  blogPosts: BlogPost[];
  setBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  hostProfile: HostProfile;
  setHostProfile: React.Dispatch<React.SetStateAction<HostProfile>>;
  pastBookings: BookingRecord[];
  
  // Acciones y Mutaciones Centralizadas
  saveHostProfile: (profile: HostProfile) => Promise<boolean>;
  saveAppData: (houses: House[], rooms: Record<string, Room[]>, blogs: BlogPost[], profile: HostProfile, customMsg?: string) => Promise<boolean>;
  saveHouse: (houseData: House, isEdit: boolean) => Promise<{ success: boolean; error?: string }>;
  deleteHouse: (houseId: string) => Promise<{ success: boolean; error?: string }>;
  saveRoom: (targetHouseId: string, roomData: Room, isEdit: boolean, originalHouseId?: string) => Promise<{ success: boolean; error?: string }>;
  deleteRoom: (houseId: string, roomId: string) => Promise<{ success: boolean; error?: string }>;
  saveStory: (storyData: BlogPost, isEdit: boolean) => Promise<{ success: boolean; error?: string }>;
  deleteStory: (storyId: string) => Promise<{ success: boolean; error?: string }>;
  batchUpdatePricing: (houseId: string, pricingMap: Record<string, number>) => Promise<{ success: boolean; error?: string }>;
  toggleRoomAvailable: (houseId: string, roomId: string) => Promise<{ success: boolean; error?: string }>;
  addHousePhoto: (houseId: string, photoUrl: string) => Promise<{ success: boolean; error?: string }>;
  removeHousePhoto: (houseId: string, index: number) => Promise<{ success: boolean; error?: string }>;
  addRoomPhoto: (houseId: string, roomId: string, photoUrl: string) => Promise<{ success: boolean; error?: string }>;
  removeRoomPhoto: (houseId: string, roomId: string, index: number) => Promise<{ success: boolean; error?: string }>;
  sendInquiry: (guestName: string, guestEmail: string, houseName: string, subject: string, message: string) => Promise<{ success: boolean; error?: string }>;
  replyInquiry: (inquiryId: string, replyMessage: string, senderRole: 'host' | 'guest') => Promise<{ success: boolean; error?: string }>;
  toggleInquiryRead: (inquiryId: string) => Promise<{ success: boolean; error?: string }>;
  addReview: (houseId: string, authorName: string, rating: number, comment: string) => Promise<{ success: boolean; error?: string }>;
  createBooking: (guestEmail: string, houseId: string, options?: { totalPrice?: number; days?: number; checkIn?: string; checkOut?: string }) => Promise<{ success: boolean; error?: string }>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [isAppDataLoaded, setIsAppDataLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [houses, setHouses] = useState<House[]>(initialHouses);
  const [roomsByHouse, setRoomsByHouse] = useState<Record<string, Room[]>>(initialRooms);
  const [reviewsByHouse, setReviewsByHouse] = useState<Record<string, GuestReview[]>>(initialReviews);
  const [inquiries, setInquiries] = useState<MessageInquiry[]>(initialInquiries);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [hostProfile, setHostProfile] = useState<HostProfile>(initialHostProfile);
  const [pastBookings, setPastBookings] = useState<BookingRecord[]>([]);

  // 1. Carga inicial de datos desde Firestore
  useEffect(() => {
    let isMounted = true;
    const loadAppData = async () => {
      try {
        const loadedHouses = await housesService.fetchHouses();
        if (isMounted && loadedHouses.length > 0) {
          setHouses(loadedHouses);

          const loadedRooms = await roomsService.fetchAllRooms(loadedHouses);
          if (isMounted && Object.keys(loadedRooms).length > 0) {
            setRoomsByHouse(loadedRooms);
          }
        }

        const loadedBlogs = await storiesService.fetchStories();
        if (isMounted && loadedBlogs.length > 0) {
          setBlogPosts(loadedBlogs);
        }

        const profile = await profileService.fetchHostProfile();
        if (isMounted && profile) {
          setHostProfile(profile);
        }
      } catch (err) {
        console.error("Error al cargar datos desde Firestore:", err);
        if (isMounted) setLoadFailed(true);
      } finally {
        if (isMounted) setIsAppDataLoaded(true);
      }
    };
    
    loadAppData();
    return () => { isMounted = false; };
  }, []);

  // 2. Suscripciones en tiempo real dependientes del usuario autenticado
  useEffect(() => {
    if (!user) {
      setPastBookings([]);
      return;
    }

    const unsubInquiries = inquiriesService.subscribeToInquiries(
      user.email,
      user.role,
      (inqs) => setInquiries(inqs)
    );

    const unsubBookings = bookingsService.subscribeToBookings(
      user.email,
      user.role === 'host',
      (bookings) => setPastBookings(bookings)
    );

    return () => {
      unsubInquiries();
      unsubBookings();
    };
  }, [user]);

  // Alerta de cambios sin guardar en la ventana
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Guardar perfil de anfitriona
  const saveHostProfile = useCallback(async (newProfile: HostProfile): Promise<boolean> => {
    setIsSaving(true);
    try {
      await profileService.saveHostProfile(newProfile);
      setHostProfile(newProfile);
      setHasUnsavedChanges(false);
      return true;
    } catch (err) {
      console.error("Error al guardar perfil de anfitriona:", err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Guardado masivo de contingencia
  const saveAppData = useCallback(async (
    newHouses: House[], 
    newRooms: Record<string, Room[]>, 
    newBlogPosts: BlogPost[], 
    newHostProfile: HostProfile
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      for (const house of newHouses) {
        await housesService.saveHouse(house);
        const rooms = newRooms[house.id] || [];
        for (const room of rooms) {
          await roomsService.saveRoom(house.id, room);
        }
      }
      for (const blog of newBlogPosts) {
        await storiesService.saveStory(blog);
      }
      await profileService.saveHostProfile(newHostProfile);
      setHasUnsavedChanges(false);
      return true;
    } catch (err) {
      console.error("Error al guardar datos masivamente:", err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // ==========================================
  // Acciones CRUD Centralizadas
  // ==========================================
  const saveHouse = useCallback(async (houseData: House, isEdit: boolean) => {
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

    try {
      await housesService.saveHouse(houseData);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [houses, roomsByHouse]);

  const deleteHouse = useCallback(async (houseId: string) => {
    const updatedHouses = houses.filter(h => h.id !== houseId);
    const updatedRooms = { ...roomsByHouse };
    delete updatedRooms[houseId];

    setHouses(updatedHouses);
    setRoomsByHouse(updatedRooms);

    try {
      await housesService.deleteHouse(houseId);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [houses, roomsByHouse]);

  const saveRoom = useCallback(async (
    targetHouseId: string, 
    roomData: Room, 
    isEdit: boolean, 
    originalHouseId?: string
  ) => {
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
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [houses, roomsByHouse]);

  const deleteRoom = useCallback(async (houseId: string, roomId: string) => {
    const currentRooms = roomsByHouse[houseId] || [];
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
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [houses, roomsByHouse]);

  const saveStory = useCallback(async (storyData: BlogPost, isEdit: boolean) => {
    let updatedStories: BlogPost[];
    if (isEdit) {
      updatedStories = blogPosts.map(b => (b.id === storyData.id ? storyData : b));
    } else {
      updatedStories = [storyData, ...blogPosts];
    }

    setBlogPosts(updatedStories);

    try {
      await storiesService.saveStory(storyData);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [blogPosts]);

  const deleteStory = useCallback(async (storyId: string) => {
    setBlogPosts(prev => prev.filter(b => b.id !== storyId));

    try {
      await storiesService.deleteStory(storyId);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const batchUpdatePricing = useCallback(async (houseId: string, pricingMap: Record<string, number>) => {
    const activeRooms = roomsByHouse[houseId] || [];
    const updated = activeRooms.map(r => {
      if (pricingMap[r.id] !== undefined) {
        return { ...r, price: Number(pricingMap[r.id]) };
      }
      return r;
    });

    setRoomsByHouse(prev => ({
      ...prev,
      [houseId]: updated
    }));

    let minPrice = 0;
    if (updated.length > 0) {
      minPrice = Math.min(...updated.map(r => r.price));
      setHouses(prev => prev.map(h => h.id === houseId ? { ...h, pricePerNight: minPrice } : h));
    }

    try {
      await roomsService.batchUpdatePricing(houseId, updated, minPrice);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [roomsByHouse]);

  const toggleRoomAvailable = useCallback(async (houseId: string, roomId: string) => {
    const list = roomsByHouse[houseId] || [];
    const updated = list.map(r => (r.id === roomId ? { ...r, available: !r.available } : r));
    setRoomsByHouse(prev => ({ ...prev, [houseId]: updated }));
    
    try {
      const room = updated.find(r => r.id === roomId);
      if (room) {
        await roomsService.updateRoomAvailability(houseId, roomId, room.available);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [roomsByHouse]);

  const addHousePhoto = useCallback(async (houseId: string, photoUrl: string) => {
    const targetHouse = houses.find(h => h.id === houseId);
    if (!targetHouse) return { success: false, error: 'Stay not found' };

    const newImages = [...targetHouse.images, photoUrl];
    setHouses(prev => prev.map(h => h.id === houseId ? { ...h, images: newImages } : h));

    try {
      await housesService.updateHouseImages(houseId, newImages);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [houses]);

  const removeHousePhoto = useCallback(async (houseId: string, index: number) => {
    const targetHouse = houses.find(h => h.id === houseId);
    if (!targetHouse) return { success: false, error: 'Stay not found' };

    const newImages = [...targetHouse.images];
    newImages.splice(index, 1);
    setHouses(prev => prev.map(h => h.id === houseId ? { ...h, images: newImages } : h));

    try {
      await housesService.updateHouseImages(houseId, newImages);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [houses]);

  const addRoomPhoto = useCallback(async (houseId: string, roomId: string, photoUrl: string) => {
    const rooms = roomsByHouse[houseId] || [];
    const room = rooms.find(r => r.id === roomId);
    if (!room) return { success: false, error: 'Room not found' };

    const newImages = [...room.images, photoUrl];
    setRoomsByHouse(prev => ({
      ...prev,
      [houseId]: (prev[houseId] || []).map(r => r.id === roomId ? { ...r, images: newImages } : r)
    }));

    try {
      await roomsService.updateRoomImages(houseId, roomId, newImages);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [roomsByHouse]);

  const removeRoomPhoto = useCallback(async (houseId: string, roomId: string, index: number) => {
    let newImages: string[] = [];
    setRoomsByHouse(prev => {
      const rooms = prev[houseId] || [];
      const updated = rooms.map(r => {
        if (r.id === roomId) {
          newImages = [...r.images];
          newImages.splice(index, 1);
          return { ...r, images: newImages };
        }
        return r;
      });
      return { ...prev, [houseId]: updated };
    });

    try {
      await roomsService.updateRoomImages(houseId, roomId, newImages);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const sendInquiry = useCallback(async (
    guestName: string, 
    guestEmail: string, 
    houseName: string, 
    subject: string, 
    message: string
  ) => {
    try {
      await inquiriesService.sendInquiry(guestName, guestEmail, houseName, subject, message);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const replyInquiry = useCallback(async (inquiryId: string, replyMessage: string, senderRole: 'host' | 'guest') => {
    const inq = inquiries.find(i => i.id === inquiryId);
    if (!inq) return { success: false, error: 'Inquiry not found' };

    try {
      await inquiriesService.replyInquiry(
        inquiryId,
        inq.thread || [],
        replyMessage,
        senderRole,
        inq.replied
      );
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [inquiries]);

  const toggleInquiryRead = useCallback(async (inquiryId: string) => {
    const inq = inquiries.find(i => i.id === inquiryId);
    if (!inq) return { success: false, error: 'Inquiry not found' };

    try {
      await inquiriesService.toggleReadState(inquiryId, inq.read);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [inquiries]);

  const addReview = useCallback(async (houseId: string, authorName: string, rating: number, comment: string) => {
    try {
      await reviewsService.addReview(houseId, authorName, rating, comment);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const createBooking = useCallback(async (
    guestEmail: string, 
    houseId: string, 
    options?: { totalPrice?: number; days?: number; checkIn?: string; checkOut?: string }
  ) => {
    try {
      await bookingsService.createBooking(guestEmail, houseId, options);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  return (
    <DataContext.Provider value={{
      isAppDataLoaded, loadFailed, hasUnsavedChanges, setHasUnsavedChanges,
      isSaving, setIsSaving, houses, setHouses, roomsByHouse, setRoomsByHouse,
      reviewsByHouse, setReviewsByHouse, inquiries, setInquiries,
      blogPosts, setBlogPosts, hostProfile, setHostProfile, pastBookings,
      saveHostProfile, saveAppData,
      saveHouse, deleteHouse, saveRoom, deleteRoom,
      saveStory, deleteStory, batchUpdatePricing, toggleRoomAvailable,
      addHousePhoto, removeHousePhoto, addRoomPhoto, removeRoomPhoto,
      sendInquiry, replyInquiry, toggleInquiryRead,
      addReview, createBooking
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
