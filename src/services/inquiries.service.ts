import { collection, doc, query, where, onSnapshot, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { MessageInquiry } from '../types';

export const inquiriesService = {
  subscribeToInquiries(
    email: string | undefined,
    role: 'host' | 'guest',
    onUpdate: (inquiries: MessageInquiry[]) => void,
    onError?: (err: unknown) => void
  ): () => void {
    const q = role === 'host'
      ? query(collection(db, 'inquiries'))
      : query(collection(db, 'inquiries'), where('guestEmail', '==', email || ''));

    return onSnapshot(
      q,
      (snapshot) => {
        const inqs = snapshot.docs.map(
          (d) => ({ id: d.id, ...(d.data() as Omit<MessageInquiry, 'id'>) } as MessageInquiry)
        );
        onUpdate(inqs);
      },
      (err) => {
        console.error('Error al escuchar consultas:', err);
        if (onError) onError(err);
      }
    );
  },

  async sendInquiry(
    guestName: string,
    guestEmail: string,
    houseName: string,
    subject: string,
    message: string
  ): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    await addDoc(collection(db, 'inquiries'), {
      guestName,
      guestEmail,
      houseName,
      subject: subject || `Consulta sobre ${houseName}`,
      message,
      date: today,
      read: false,
      thread: [
        {
          id: `msg-${Date.now()}`,
          sender: 'guest',
          message,
          date: today
        }
      ]
    });
  },

  async replyInquiry(
    inquiryId: string,
    currentThread: NonNullable<MessageInquiry['thread']>,
    replyMessage: string,
    senderRole: 'host' | 'guest',
    currentlyReplied?: boolean
  ): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    const newThread = [
      ...currentThread,
      {
        id: `msg-${Date.now()}`,
        sender: senderRole,
        message: replyMessage.trim(),
        date: today
      }
    ];

    const inqRef = doc(db, 'inquiries', inquiryId);
    await updateDoc(inqRef, {
      thread: newThread,
      replied: senderRole === 'host' ? true : currentlyReplied,
      read: senderRole === 'guest' ? false : true
    });
  },

  async toggleReadState(inquiryId: string, currentReadState: boolean): Promise<void> {
    const inqRef = doc(db, 'inquiries', inquiryId);
    await updateDoc(inqRef, { read: !currentReadState });
  }
};
