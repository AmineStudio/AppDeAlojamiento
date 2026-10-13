import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  housesService, 
  roomsService, 
  storiesService, 
  profileService 
} from '../services';
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
  saveHostProfile: (profile: HostProfile) => Promise<boolean>;
  saveAppData: (houses: House[], rooms: Record<string, Room[]>, blogs: BlogPost[], profile: HostProfile, customMsg?: string) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
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

  useEffect(() => {
    const loadAppData = async () => {
      try {
        // Cargar alojamientos
        const loadedHouses = await housesService.fetchHouses();
        if (loadedHouses.length > 0) {
          setHouses(loadedHouses);

          // Cargar habitaciones asociadas
          const loadedRooms = await roomsService.fetchAllRooms(loadedHouses);
          if (Object.keys(loadedRooms).length > 0) {
            setRoomsByHouse(loadedRooms);
          }
        }

        // Cargar historias del blog
        const loadedBlogs = await storiesService.fetchStories();
        if (loadedBlogs.length > 0) {
          setBlogPosts(loadedBlogs);
        }

        // Cargar perfil de anfitriona
        const profile = await profileService.fetchHostProfile();
        if (profile) {
          setHostProfile(profile);
        }
      } catch (err) {
        console.error("Error al cargar datos desde Firestore:", err);
        setLoadFailed(true);
      } finally {
        setIsAppDataLoaded(true);
      }
    };
    
    loadAppData();
  }, []);

  // Alerta de cambios sin guardar
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

  // Guardar perfil de anfitriona directamente en settings/hostProfile
  const saveHostProfile = async (newProfile: HostProfile): Promise<boolean> => {
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
  };

  // Guardado global de contingencia
  const saveAppData = async (
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
  };

  return (
    <DataContext.Provider value={{
      isAppDataLoaded, loadFailed, hasUnsavedChanges, setHasUnsavedChanges,
      isSaving, setIsSaving, houses, setHouses, roomsByHouse, setRoomsByHouse,
      reviewsByHouse, setReviewsByHouse, inquiries, setInquiries,
      blogPosts, setBlogPosts, hostProfile, setHostProfile, 
      saveHostProfile, saveAppData
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
