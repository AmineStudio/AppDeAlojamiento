import { collection, doc, query, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { GuestReview } from '../types';

export const reviewsService = {
  subscribeToReviews(
    houseId: string,
    onUpdate: (reviews: GuestReview[]) => void,
    onError?: (err: unknown) => void
  ): () => void {
    const q = query(collection(db, `houses/${houseId}/reviews`));
    return onSnapshot(
      q,
      (snapshot) => {
        const reviews = snapshot.docs.map(
          (d) => ({ id: d.id, ...(d.data() as Omit<GuestReview, 'id'>) } as GuestReview)
        );
        onUpdate(reviews);
      },
      (err) => {
        console.error(`Error al escuchar reseñas de la casa ${houseId}:`, err);
        if (onError) onError(err);
      }
    );
  },

  async addReview(
    houseId: string,
    authorName: string,
    rating: number,
    comment: string,
    dateString?: string
  ): Promise<void> {
    const reviewDoc = doc(collection(db, `houses/${houseId}/reviews`));
    const formattedDate = dateString || new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(new Date());

    await setDoc(reviewDoc, {
      authorName,
      date: formattedDate,
      rating,
      comment
    });
  }
};
