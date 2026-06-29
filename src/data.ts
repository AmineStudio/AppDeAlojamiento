import { House, Room, GuestReview, MessageInquiry, BlogPost } from './types';

export const initialHouses: House[] = [
  {
    id: 'leon-y-castillo',
    name: 'Casa Compartida León y Castillo',
    location: 'Calle León y Castillo, Las Palmas',
    description: 'A beautifully restored traditional Canarian building featuring soaring 4-meter ceilings, gorgeous private balconies, modern minimalist design, and direct access to Parque Romano, the Marina, and the vibrant city center. Perfect for digital nomads or students who want the rhythm of the city paired with coastal proximity.',
    pricePerNight: 95,
    rating: 4.90,
    reviewCount: 46,
    beds: '3 Rooms',
    guests: 6,
    tag: 'City Central 🏙️',
    tagClass: 'coral',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687931-cebf06fa1a17?w=800&auto=format&fit=crop'
    ],
    features: ['4m High Ceilings', 'High-Speed Fiber Wifi', 'Sunny Private balcony', 'Air Conditioning', 'Fully Equipped Kitchen', 'Parque Romano views']
  },
  {
    id: 'tafira-baja',
    name: 'Casa Compartida Tafira Baja',
    location: 'Tafira Baja, Las Palmas',
    description: 'A serene shared house nestled in Tafira Baja, conveniently located near the university campus. Surrounded by beautiful gardens and historic pathways, this property features comfortable communal spaces and a sunny terrace. An ideal and quiet spot for students or remote workers looking for a relaxed atmosphere.',
    pricePerNight: 110,
    rating: 4.85,
    reviewCount: 38,
    beds: '4 Rooms',
    guests: 8,
    tag: 'Campus Vicinity 🎓',
    tagClass: 'sun',
    images: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1628015081036-0747ec8f077a?w=800&auto=format&fit=crop'
    ],
    features: ['Near Campus', 'Lush Private Garden', 'Study Areas', 'Cozy Fireplace', 'High-Speed Fiber Wifi', 'Quiet Environment']
  }
];

export const initialRooms: Record<string, Room[]> = {
  'leon-y-castillo': [
    {
      id: 'lc-suite',
      name: 'The Grand Balcony Suite',
      description: 'The premier bedroom featuring original double-wooden doors opening to a private French balcony overlooking Calle León y Castillo. King bed, workspace, custom retro artwork.',
      price: 95,
      available: true,
      images: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500'
      ],
      beds: '1 King Bed',
      view: 'Street & City Canopy'
    },
    {
      id: 'lc-double',
      name: 'High-Ceiling Garden Room',
      description: 'Striking room with 4-meter ceilings and beautiful indoor plants. Comfort double bed, extremely quiet back-facing courtyard orientation, reading chair.',
      price: 75,
      available: true,
      images: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500',
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=500'
      ],
      beds: '1 Queen Bed',
      view: 'Courtyard & Bougainvillea'
    },
    {
      id: 'lc-twin',
      name: 'The Alcove Twin',
      description: 'Cozy historical alcove with two single beds. Complete blackout curtains, workspace with power strips, perfect for traveling colleagues or digital nomads.',
      price: 60,
      available: false,
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=500'
      ],
      beds: '2 Single Beds',
      view: 'Inner Courtyard'
    }
  ],
  'tafira-baja': [
    {
      id: 'tf-campus',
      name: 'Campus View Room',
      description: 'Master bedroom with a great view perfect for students or remote workers. Super King bed, premium ensuite bath, large sliding glass window.',
      price: 130,
      available: true,
      images: [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500',
        'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?w=500'
      ],
      beds: '1 Super King',
      view: 'Garden & Campus'
    },
    {
      id: 'tf-garden',
      name: 'The Garden Room',
      description: 'Elegant second bedroom looking east over the gardens of Tafira Baja. King size hardwood bed, warm timber accents.',
      price: 110,
      available: true,
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500',
        'https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=500'
      ],
      beds: '1 King Bed',
      view: 'Garden'
    },
    {
      id: 'tf-cottage',
      name: 'Stone Walls Annex',
      description: 'Tucked away at the historical end of the cottage with original volcanic wall elements exposed. Double queen beds, skylight for watching stars, extreme privacy.',
      price: 100,
      available: true,
      images: [
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=500',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'
      ],
      beds: '2 Queen Beds',
      view: 'Starlit Mountain'
    }
  ]
};

export const initialReviews: Record<string, GuestReview[]> = {
  'leon-y-castillo': [
    {
      id: 'rev-lc-1',
      authorName: 'Alex Thorne',
      date: 'June 2026',
      rating: 5,
      comment: 'As a digital nomad, the location on Calle León y Castillo is absolutely perfect. The park Romano is just across for morning jogs, and the bus lines are incredibly convenient. The house has gorgeous historic character with modern fast fiber internet. Highly recommended!',
      categories: { cleanliness: 5, location: 5, value: 4.8, communication: 5 }
    },
    {
      id: 'rev-lc-2',
      authorName: 'Mathilde Laurent',
      date: 'May 2026',
      rating: 4.8,
      comment: 'Waking up, having espresso on the grand balcony, and working from the high-ceiling room was a dream. Mila was very responsive and told us about hidden local spots that made our trip. Beautifully decorated!',
      categories: { cleanliness: 4.8, location: 5, value: 4.6, communication: 4.9 }
    }
  ],
  'tafira-baja': [
    {
      id: 'rev-tf-1',
      authorName: 'Dr. Klaus Meyer',
      date: 'June 2026',
      rating: 5,
      comment: 'Lush greenery, absolute silence, and cool mountain air. Tafira Baja exceeded our expectations. The house is magnificent, well-restored, and has wonderful outdoor space. We stayed here and loved every second of it. Mila is an exceptional host.',
      categories: { cleanliness: 5, location: 4.8, value: 5, communication: 5 }
    },
    {
      id: 'rev-tf-2',
      authorName: 'Elena & Juan',
      date: 'April 2026',
      rating: 4.9,
      comment: 'We spent our semester here and it was perfect. The campus proximity in the morning is stunning, and the property is very peaceful. An incredible contrast to the beach cities, yet so close to everything.',
      categories: { cleanliness: 4.9, location: 4.7, value: 4.9, communication: 5 }
    }
  ]
};

export const initialInquiries: MessageInquiry[] = [
  {
    id: 'inq-1',
    guestName: 'Julian & Clara Voss',
    guestEmail: 'julian.voss@gmail.com',
    houseName: 'Casa Compartida León y Castillo',
    subject: 'Nomad stay for July & August query',
    message: 'Hello Mila! We are remote designers from Berlin planning to relocate to Las Palmas for July and August. Is the Grand Balcony Loft fully free during that window? We require high-speed WiFi for zoom calls (minimum 100mbps sync). Also, do you provide weekly cleaning service options? We love the Parque Romano proximity in León y Castillo! Best, Julian',
    date: '2026-06-21',
    read: false,
    thread: [
      {
        id: 'msg-1',
        sender: 'guest',
        message: 'Hello Mila! We are remote designers from Berlin planning to relocate to Las Palmas for July and August. Is the Grand Balcony Loft fully free during that window? We require high-speed WiFi for zoom calls (minimum 100mbps sync). Also, do you provide weekly cleaning service options? We love the Parque Romano proximity in León y Castillo! Best, Julian',
        date: '2026-06-21'
      }
    ]
  },
  {
    id: 'inq-2',
    guestName: 'Estelle Lefevre',
    guestEmail: 'estelle.lefe@hotmail.com',
    houseName: 'Casa Compartida Tafira Baja',
    subject: 'Student Stay Inquiry - October 2026',
    message: 'Dear Mila, we are looking to book your beautiful house in Tafira Baja for a masters semester. Is it safe to park at the property gates? Looking forward to hearing from you. Cheers, Estelle',
    date: '2026-06-20',
    read: false,
    thread: [
      {
        id: 'msg-2',
        sender: 'guest',
        message: 'Dear Mila, we are looking to book your beautiful house in Tafira Baja for a masters semester. Is it safe to park at the property gates? Looking forward to hearing from you. Cheers, Estelle',
        date: '2026-06-20'
      }
    ]
  }
];

export const initialBlogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    category: 'Local secrets 🤫',
    title: 'The Hidden Magic of Calle León y Castillo',
    subtitle: 'From lush historical parks to neoclassical treasures, explore the heartbeat of Las Palmas.',
    excerpt: 'Calle León y Castillo isn’t just a primary traffic vein—it is an elegant cultural strip lined with turn-of-the-century architecture, quiet coffee gardens, and majestic civic parks. Here is how I spend a perfect slow Saturday on this avenue.',
    content: 'Start your morning with a stroll through Parque Doramas or Parque Romano, surrounded by towering tropical palms and traditional clay-roofed kiosks. Order a cafe cortado at the traditional Canary Garden kiosk, listen to the parrots nesting in the palm fronds, or watch rowers train at the adjacent Marina. León y Castillo preserves the rich architectural legacy of Las Palmas de Gran Canaria, offering neoclassical and moderniste facades that tell stories of the island’s rich maritime commerce. Walking here is like slipping back into the 1920s, but with active high-speed workspaces, incredible local bistros, and a lively cosmopolitan energy.',
    author: 'Mila',
    readTime: '4 min read',
    publishedDate: 'June 18, 2026',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop'
  },
  {
    id: 'blog-2',
    category: 'Food & Wine 🍷',
    title: 'Tafira Alta: Tasting the volcanic vintage',
    subtitle: 'Inside the historic mountain vineyards surrounding Monte Lentiscal.',
    excerpt: 'Tafira and the Bandama crater zone host the protected Designation of Origin wines of Gran Canaria. Spend a peaceful afternoon tasting red and golden volcanic grapes.',
    content: 'Just outside the lush gardens of Tafira lies the towering Bandama Caldera—a dramatic 200m deep volcanic crater. The rich ash soil surrounding this region nurtures some of the rarest pre-phylloxera vine stocks in Europe, including Listán Negro and Malvasía Volcánica. My favorite itinerary is taking a bicycle from Finca El Laurel, riding down the quiet lanes of Tafira Alta, and stopping at a family-owned "Bodega" for a wood-fired local cheese board accompanied by a glass of mineral-dense island red. The air is cool, the views stretch down to the blue ocean line of Jinámar, and life slows down instantly.',
    author: 'Mila',
    readTime: '6 min read',
    publishedDate: 'May 28, 2026',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop'
  }
];
