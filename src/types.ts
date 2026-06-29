export interface House {
  id: string;
  name: string;
  location: string;
  description: string;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  beds: string;
  guests: number;
  tag: string;
  tagClass?: string;
  images: string[];
  features: string[];
}

export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  images: string[];
  beds: string;
  view: string;
}

export interface GuestReview {
  id: string;
  authorName: string;
  authorAvatar?: string;
  date: string;
  rating: number;
  comment: string;
  categories: {
    cleanliness: number;
    location: number;
    value: number;
    communication: number;
  };
}

export interface MessageInquiry {
  id: string;
  guestName: string;
  guestEmail: string;
  houseName: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
  replied?: boolean;
  thread?: { id: string; sender: 'host' | 'guest'; message: string; date: string }[];
}

export interface BlogPost {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  author: string;
  readTime: string;
  publishedDate: string;
  image: string;
}
