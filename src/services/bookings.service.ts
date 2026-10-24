import { collection, query, where, onSnapshot, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface BookingRecord {
  id?: string;
  guestEmail: string;
  houseId: string;
  roomId?: string;
  totalPrice?: number;
  days?: number;
  checkIn?: string;
  checkOut?: string;
  createdAt?: string;
}

export const bookingsService = {
  subscribeToBookings(
    email: string | undefined,
    isHost: boolean,
    onUpdate: (bookings: BookingRecord[]) => void,
    onError?: (err: unknown) => void
  ): () => void {
    const q = isHost
      ? query(collection(db, 'pastBookings'))
      : query(collection(db, 'pastBookings'), where('guestEmail', '==', (email || '').toLowerCase()));

    return onSnapshot(
      q,
      (snapshot) => {
        const bookings = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            guestEmail: data.guestEmail,
            houseId: data.houseId,
            roomId: data.roomId,
            totalPrice: data.totalPrice,
            days: data.days,
            checkIn: data.checkIn,
            checkOut: data.checkOut,
            createdAt: data.createdAt
          } as BookingRecord;
        });
        onUpdate(bookings);
      },
      (err) => {
        console.error('Error al escuchar reservas:', err);
        if (onError) onError(err);
      }
    );
  },

  async createBooking(
    guestEmail: string,
    houseId: string,
    options?: { totalPrice?: number; days?: number; checkIn?: string; checkOut?: string; roomId?: string }
  ): Promise<void> {
    await addDoc(collection(db, 'pastBookings'), {
      guestEmail: guestEmail.toLowerCase(),
      houseId,
      roomId: options?.roomId,
      totalPrice: options?.totalPrice,
      days: options?.days,
      checkIn: options?.checkIn,
      checkOut: options?.checkOut,
      createdAt: new Date().toISOString()
    });
  },

  async fetchBookedDatesForHouse(houseId: string): Promise<Set<string>> {
    try {
      const q = query(collection(db, 'pastBookings'), where('houseId', '==', houseId));
      const snap = await getDocs(q);
      const bookedSet = new Set<string>();

      snap.forEach((d) => {
        const data = d.data();
        if (data.checkIn && data.checkOut) {
          const start = new Date(data.checkIn);
          const end = new Date(data.checkOut);
          const current = new Date(start);
          while (current < end) {
            bookedSet.add(current.toISOString().slice(0, 10));
            current.setDate(current.getDate() + 1);
          }
        }
      });
      return bookedSet;
    } catch {
      return new Set<string>();
    }
  }
};
