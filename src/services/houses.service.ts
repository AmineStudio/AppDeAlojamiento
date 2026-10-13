import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { House } from '../types';

export const housesService = {
  async fetchHouses(): Promise<House[]> {
    const querySnapshot = await getDocs(collection(db, 'houses'));
    const houses: House[] = [];
    querySnapshot.forEach((d) => {
      houses.push({ id: d.id, ...(d.data() as Omit<House, 'id'>) } as House);
    });
    return houses;
  },

  async saveHouse(house: House): Promise<void> {
    await setDoc(doc(db, 'houses', house.id), house);
  },

  async deleteHouse(houseId: string): Promise<void> {
    await deleteDoc(doc(db, 'houses', houseId));
  },

  async updateHouseBasePrice(houseId: string, minPrice: number): Promise<void> {
    await updateDoc(doc(db, 'houses', houseId), { pricePerNight: minPrice });
  },

  async updateHouseImages(houseId: string, images: string[]): Promise<void> {
    await updateDoc(doc(db, 'houses', houseId), { images });
  }
};
