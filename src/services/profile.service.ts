import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { HostProfile } from '../types';

export const profileService = {
  async fetchHostProfile(): Promise<HostProfile | null> {
    const docSnap = await getDoc(doc(db, 'settings', 'hostProfile'));
    if (docSnap.exists()) {
      return docSnap.data() as HostProfile;
    }
    return null;
  },

  async saveHostProfile(profile: HostProfile): Promise<void> {
    await setDoc(doc(db, 'settings', 'hostProfile'), profile);
  }
};
