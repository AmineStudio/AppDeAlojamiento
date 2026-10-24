import { House, Room, GuestReview, MessageInquiry, BlogPost, HostProfile } from './types';

export const initialHostProfile: HostProfile = {
  name: "Mila",
  title: "Host Mila",
  bio: "Born and raised in Gran Canaria. Passionate about island history, ocean swells, and slow travel. Always available to coordinate local excursions or set up your perfect remote work environment.",
  phone: "+34 928 123 456",
  email: "hola@milanomad.es",
  address: "Calle de León y Castillo, Las Palmas de Gran Canaria"
};

export const initialHouses: House[] = [
  {
    id: 'leon-y-castillo',
    name: 'León y Castillo Coliving Townhouse',
    location: 'Calle León y Castillo, Las Palmas',
    description: 'Restored traditional Canarian mansion featuring 4-meter high ceilings, luminous balconies, minimalist design, and direct access to Parque Romano, the marina, and the city center. Ideal for digital nomads and students seeking the city pulse by the ocean.',
    pricePerNight: 95,
    rating: 4.90,
    reviewCount: 46,
    beds: '3 Bedrooms',
    guests: 6,
    tag: 'City Center 🏙️',
    tagClass: 'coral',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687931-cebf06fa1a17?w=800&auto=format&fit=crop'
    ],
    features: [
      '4m High Ceilings',
      'High-Speed Fiber Wi-Fi',
      'Sunny Private Balcony',
      'Air Conditioning',
      'Fully Equipped Kitchen',
      'Views of Romano Park'
    ]
  },
  {
    id: 'tafira-baja',
    name: 'Tafira Baja Garden Coliving',
    location: 'Tafira Baja, Las Palmas',
    description: 'A serene shared estate in Tafira Baja, located next to the university campus. Surrounded by lush gardens and historic trails, featuring spacious common areas and a sunny outdoor terrace. A peaceful haven for remote workers and students.',
    pricePerNight: 110,
    rating: 4.85,
    reviewCount: 38,
    beds: '4 Bedrooms',
    guests: 8,
    tag: 'Near Campus 🎓',
    tagClass: 'sun',
    images: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1628015081036-0747ec8f077a?w=800&auto=format&fit=crop'
    ],
    features: [
      'Next to University Campus',
      'Lush Private Garden',
      'Dedicated Study Areas',
      'Cozy Fireplace',
      'High-Speed Fiber Wi-Fi',
      'Peaceful Natural Setting'
    ]
  }
];

export const initialRooms: Record<string, Room[]> = {
  'leon-y-castillo': [
    {
      id: 'lc-suite',
      name: 'Grand Balcony Suite',
      description: 'Master bedroom with original double wooden doors opening to a private balcony overlooking León y Castillo street. King bed, work desk, and curated artwork.',
      price: 95,
      available: true,
      images: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500'
      ],
      beds: '1 King Bed',
      view: 'City & Tree Canopy',
      blockedDates: []
    },
    {
      id: 'lc-double',
      name: 'High-Ceiling Garden Room',
      description: 'Spacious room with 4-meter ceilings and indoor plants. Highly comfortable queen bed, facing the quiet inner courtyard for complete rest, plus reading armchair.',
      price: 75,
      available: true,
      images: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500',
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=500'
      ],
      beds: '1 Queen Bed',
      view: 'Inner Courtyard & Bougainvillea',
      blockedDates: []
    },
    {
      id: 'lc-twin',
      name: 'Twin Historic Alcove',
      description: 'Cozy historic bedroom with two single beds. Blackout blinds, power strips for remote working, perfect for colleagues or travel partners.',
      price: 60,
      available: false,
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=500'
      ],
      beds: '2 Single Beds',
      view: 'Inner Courtyard',
      blockedDates: []
    }
  ],
  'tafira-baja': [
    {
      id: 'tf-campus',
      name: 'Campus View Master Room',
      description: 'Expansive bedroom with oversized panoramic windows. Super King bed, ensuite bathroom, and large work desk designed for studying or remote work.',
      price: 130,
      available: true,
      images: [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500',
        'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?w=500'
      ],
      beds: '1 Super King Bed',
      view: 'Garden & Campus'
    },
    {
      id: 'tf-garden',
      name: 'The Garden Room',
      description: 'Elegant room looking directly out over the Tafira Baja gardens. Solid wood King bed and warm natural finishes.',
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
      name: 'Stone Wall Annex',
      description: 'Unique detached space with exposed volcanic masonry walls. Two Queen beds, skylight for stargazing, and utmost privacy.',
      price: 100,
      available: true,
      images: [
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=500',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'
      ],
      beds: '2 Queen Beds',
      view: 'Mountain & Stars'
    }
  ]
};

export const initialReviews: Record<string, GuestReview[]> = {};

export const initialInquiries: MessageInquiry[] = [];

export const initialBlogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    category: 'Local Secrets 🤫',
    title: 'The Hidden Magic of Calle León y Castillo',
    subtitle: 'From historic parks to architectural gems: explore the authentic pulse of Las Palmas.',
    excerpt: 'Calle León y Castillo is more than a main avenue; it is an elegant cultural spine lined with grand architecture, traditional coffee kiosks, and leafy civic parks.',
    content: 'Start your morning strolling through Parque Doramas or Parque Romano, surrounded by tropical palm trees. Order a cortado at a traditional Canarian kiosk, listen to birds singing in the laurel trees, or watch rowers train at the marina. León y Castillo preserves the architectural legacy of Las Palmas de Gran Canaria, with neoclassical and modernist facades recounting the island’s rich maritime commerce. Walking here blends historic calm with high-speed remote work spaces, exceptional local bistros, and a cosmopolitan Atlantic vibe.',
    author: 'Mila',
    readTime: '4 min read',
    publishedDate: 'June 18',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop'
  },
  {
    id: 'blog-2',
    category: 'Food & Wine 🍷',
    title: 'Tafira Highlands: Savoring the Volcanic Harvest',
    subtitle: 'A journey through historic vineyards surrounding the Bandama caldera.',
    excerpt: 'Tafira and the Bandama crater region produce distinguished wines with the Gran Canaria Protected Designation of Origin. Spend an afternoon tasting reds and whites grown on volcanic soil.',
    content: 'Just outside the gardens of Tafira rises the Caldera de Bandama, an impressive 200-meter deep volcanic crater. The ash-rich soil nurtures unique pre-phylloxera vines rare in Europe, such as Listán Negro and Malvasía Volcánica. My favorite itinerary is cycling the quiet country lanes of Tafira Alta and stopping by a family-run bodega to enjoy artisanal local goat cheeses paired with mineral-rich volcanic wines. The air is cool, the views stretch out to the ocean, and life’s pace instantly slows down.',
    author: 'Mila',
    readTime: '6 min read',
    publishedDate: 'May 28',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop'
  }
];
