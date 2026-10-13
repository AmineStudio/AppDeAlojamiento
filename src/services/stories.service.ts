import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { BlogPost } from '../types';

export const storiesService = {
  async fetchStories(): Promise<BlogPost[]> {
    const querySnapshot = await getDocs(collection(db, 'blogPosts'));
    const stories: BlogPost[] = [];
    querySnapshot.forEach((d) => {
      stories.push({ id: d.id, ...(d.data() as Omit<BlogPost, 'id'>) } as BlogPost);
    });
    return stories;
  },

  async saveStory(story: BlogPost): Promise<void> {
    await setDoc(doc(db, 'blogPosts', story.id), story);
  },

  async deleteStory(storyId: string): Promise<void> {
    await deleteDoc(doc(db, 'blogPosts', storyId));
  }
};
