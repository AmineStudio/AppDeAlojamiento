import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { House, Room } from '../types';

export const roomsService = {
  async fetchRoomsByHouse(houseId: string): Promise<Room[]> {
    const querySnapshot = await getDocs(collection(db, `houses/${houseId}/rooms`));
    const rooms: Room[] = [];
    querySnapshot.forEach((d) => {
      rooms.push({ id: d.id, ...(d.data() as Omit<Room, 'id'>) } as Room);
    });
    return rooms;
  },

  async fetchAllRooms(houses: House[]): Promise<Record<string, Room[]>> {
    const result: Record<string, Room[]> = {};
    for (const house of houses) {
      result[house.id] = await this.fetchRoomsByHouse(house.id);
    }
    return result;
  },

  async saveRoom(targetHouseId: string, room: Room, originalHouseId?: string): Promise<void> {
    if (originalHouseId && originalHouseId !== targetHouseId) {
      await deleteDoc(doc(db, `houses/${originalHouseId}/rooms`, room.id));
    }
    await setDoc(doc(db, `houses/${targetHouseId}/rooms`, room.id), room);
  },

  async deleteRoom(houseId: string, roomId: string): Promise<void> {
    await deleteDoc(doc(db, `houses/${houseId}/rooms`, roomId));
  },

  async updateRoomAvailability(houseId: string, roomId: string, available: boolean): Promise<void> {
    await updateDoc(doc(db, `houses/${houseId}/rooms`, roomId), { available });
  },

  async updateRoomImages(houseId: string, roomId: string, images: string[]): Promise<void> {
    await updateDoc(doc(db, `houses/${houseId}/rooms`, roomId), { images });
  },

  async updateRoomBlockedDates(houseId: string, roomId: string, blockedDates: string[]): Promise<void> {
    await setDoc(doc(db, `houses/${houseId}/rooms`, roomId), { blockedDates }, { merge: true });
  },

  async batchUpdatePricing(houseId: string, rooms: Room[], minPrice: number): Promise<void> {
    const batch = writeBatch(db);
    rooms.forEach((r) => {
      batch.update(doc(db, `houses/${houseId}/rooms`, r.id), { price: r.price });
    });
    batch.update(doc(db, 'houses', houseId), { pricePerNight: minPrice });
    await batch.commit();
  }
};
