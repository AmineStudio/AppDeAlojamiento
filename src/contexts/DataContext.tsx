import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
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
        // Intentar cargar de las colecciones separadas
        const housesSnap = await getDocs(collection(db, 'houses'));
        
        // Si no hay alojamientos en la nueva colección, intentar migrar desde appData/main
        if (housesSnap.empty) {
          console.log("No houses found in new collection. Attempting migration from appData/main...");
          const mainRef = doc(db, 'appData/main');
          const mainSnap = await getDoc(mainRef);
          
          if (mainSnap.exists()) {
            const data = mainSnap.data();
            const batch = writeBatch(db);
            
            if (data.houses) {
              data.houses.forEach((h: House) => batch.set(doc(db, 'houses', h.id), h));
            }
            if (data.roomsByHouse) {
              Object.entries(data.roomsByHouse).forEach(([houseId, rooms]) => {
                (rooms as Room[]).forEach(r => batch.set(doc(db, `houses/${houseId}/rooms`, r.id), r));
              });
            }
            if (data.blogPosts) {
              data.blogPosts.forEach((b: BlogPost) => batch.set(doc(db, 'blogPosts', b.id), b));
            }
            if (data.hostProfile) {
              batch.set(doc(db, 'settings', 'hostProfile'), data.hostProfile);
            }
            
            await batch.commit();
            console.log("Migration successful!");
          }
        }

        // Cargar colecciones individuales
        const newHousesSnap = await getDocs(collection(db, 'houses'));
        const loadedHouses: House[] = [];
        newHousesSnap.forEach(doc => loadedHouses.push(doc.data() as House));
        if (loadedHouses.length > 0) setHouses(loadedHouses);

        const loadedRooms: Record<string, Room[]> = {};
        for (const house of loadedHouses) {
          const roomsSnap = await getDocs(collection(db, `houses/${house.id}/rooms`));
          loadedRooms[house.id] = [];
          roomsSnap.forEach(doc => loadedRooms[house.id].push(doc.data() as Room));
        }
        if (Object.keys(loadedRooms).length > 0) setRoomsByHouse(loadedRooms);

        const blogsSnap = await getDocs(collection(db, 'blogPosts'));
        const loadedBlogs: BlogPost[] = [];
        blogsSnap.forEach(doc => loadedBlogs.push(doc.data() as BlogPost));
        if (loadedBlogs.length > 0) setBlogPosts(loadedBlogs);

        const profileSnap = await getDoc(doc(db, 'settings/hostProfile'));
        if (profileSnap.exists()) {
          setHostProfile(profileSnap.data() as HostProfile);
        }

      } catch (err) {
        console.error("Failed to load app data from Firestore", err);
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

  // saveAppData is deprecated, used only as a fallback if anything still calls it
  const saveAppData = async (
    newHouses: House[], 
    newRooms: Record<string, Room[]>, 
    newBlogPosts: BlogPost[], 
    newHostProfile: HostProfile,
    customMessage?: string
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      newHouses.forEach(h => batch.set(doc(db, 'houses', h.id), h));
      Object.entries(newRooms).forEach(([houseId, rooms]) => {
        rooms.forEach(r => batch.set(doc(db, `houses/${houseId}/rooms`, r.id), r));
      });
      newBlogPosts.forEach(b => batch.set(doc(db, 'blogPosts', b.id), b));
      batch.set(doc(db, 'settings', 'hostProfile'), newHostProfile);
      
      await batch.commit();
      setHasUnsavedChanges(false);
      return true;
    } catch (err) {
      console.error("Error al guardar datos masivamente", err);
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
      blogPosts, setBlogPosts, hostProfile, setHostProfile, saveAppData
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
