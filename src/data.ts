import { House, Room, GuestReview, MessageInquiry, BlogPost, HostProfile } from './types';

export const initialHostProfile: HostProfile = {
  name: "Mila",
  title: "Anfitriona Mila",
  bio: "Nacida y criada en Gran Canaria. Amante de la historia de la isla y el surf, siempre disponible para coordinar excursiones locales o acondicionar tu espacio de trabajo.",
  phone: "+34 928 123 456",
  email: "hola@milanomad.es",
  address: "Calle de León y Castillo, Las Palmas de Gran Canaria"
};

export const initialHouses: House[] = [
  {
    id: 'leon-y-castillo',
    name: 'Casa Compartida León y Castillo',
    location: 'Calle León y Castillo, Las Palmas',
    description: 'Edificio tradicional canario restaurado con techos altos de 4 metros, balcones luminosos, diseño minimalista y acceso directo al Parque Romano, el Puerto Deportivo y el centro urbano. Ideal para nómadas digitales o estudiantes que buscan el pulso de la ciudad junto al mar.',
    pricePerNight: 95,
    rating: 4.90,
    reviewCount: 46,
    beds: '3 Habitaciones',
    guests: 6,
    tag: 'Centro Ciudad 🏙️',
    tagClass: 'coral',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687931-cebf06fa1a17?w=800&auto=format&fit=crop'
    ],
    features: ['Techos de 4m de altura', 'Fibra óptica de alta velocidad', 'Balcón privado soleado', 'Aire acondicionado', 'Cocina totalmente equipada', 'Vistas al Parque Romano']
  },
  {
    id: 'tafira-baja',
    name: 'Casa Compartida Tafira Baja',
    location: 'Tafira Baja, Las Palmas',
    description: 'Una tranquila casa compartida en Tafira Baja, situada junto al campus universitario. Rodeada de jardines y senderos históricos, cuenta con amplios espacios comunes y una terraza soleada. Un remanso de paz para estudiantes o profesionales en teletrabajo.',
    pricePerNight: 110,
    rating: 4.85,
    reviewCount: 38,
    beds: '4 Habitaciones',
    guests: 8,
    tag: 'Cerca del Campus 🎓',
    tagClass: 'sun',
    images: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1628015081036-0747ec8f077a?w=800&auto=format&fit=crop'
    ],
    features: ['Junto al Campus Universitario', 'Jardín privado exuberante', 'Zonas de estudio', 'Chimenea acogedora', 'Wifi de fibra de alta velocidad', 'Entorno tranquilo']
  }
];

export const initialRooms: Record<string, Room[]> = {
  'leon-y-castillo': [
    {
      id: 'lc-suite',
      name: 'Suite Gran Balcón',
      description: 'Dormitorio principal con puertas originales de madera que abren a un balcón privado con vistas a la calle León y Castillo. Cama King, escritorio de trabajo y obras de arte seleccionadas.',
      price: 95,
      available: true,
      images: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500'
      ],
      beds: '1 Cama King',
      view: 'Ciudad y Arboleda'
    },
    {
      id: 'lc-double',
      name: 'Habitación Jardín de Techos Altos',
      description: 'Habitación con techos de 4 metros y plantas de interior. Cama doble de gran confort, orientación hacia el patio interior para máxima tranquilidad y sillón de lectura.',
      price: 75,
      available: true,
      images: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500',
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=500'
      ],
      beds: '1 Cama Queen',
      view: 'Patio Interior y Buganvillas'
    },
    {
      id: 'lc-twin',
      name: 'Alcoba Twin',
      description: 'Acogedora alcoba histórica con dos camas individuales. Cortinas opacas, escritorio con regleta y enchufes para teletrabajo, ideal para compañeros o nómadas.',
      price: 60,
      available: false,
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=500'
      ],
      beds: '2 Camas Individuales',
      view: 'Patio Interior'
    }
  ],
  'tafira-baja': [
    {
      id: 'tf-campus',
      name: 'Habitación Vistas al Campus',
      description: 'Dormitorio amplio con grandes ventanales con vistas. Cama Super King, baño ensuite y escritorio amplio para estudiar o trabajar.',
      price: 130,
      available: true,
      images: [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500',
        'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?w=500'
      ],
      beds: '1 Cama Super King',
      view: 'Jardín y Campus'
    },
    {
      id: 'tf-garden',
      name: 'Habitación El Jardín',
      description: 'Elegante habitación orientada hacia los jardines de Tafira Baja. Cama de madera maciza King y cálidos acabados naturales.',
      price: 110,
      available: true,
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500',
        'https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=500'
      ],
      beds: '1 Cama King',
      view: 'Jardín'
    },
    {
      id: 'tf-cottage',
      name: 'Anexo Muros de Piedra',
      description: 'Espacio singular con paredes volcánicas vistas. Dos camas Queen, claraboya para observar las estrellas y máxima privacidad.',
      price: 100,
      available: true,
      images: [
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=500',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'
      ],
      beds: '2 Camas Queen',
      view: 'Montaña y Estrellas'
    }
  ]
};

export const initialReviews: Record<string, GuestReview[]> = {};

export const initialInquiries: MessageInquiry[] = [];

export const initialBlogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    category: 'Secretos locales 🤫',
    title: 'La magia oculta de la Calle León y Castillo',
    subtitle: 'De parques históricos a joyas arquitectónicas: explora el pulso de Las Palmas.',
    excerpt: 'La Calle León y Castillo no es solo una avenida principal; es un elegante eje cultural jalonado de arquitectura señorial, quioscos de café y amplios parques cívicos.',
    content: 'Comienza tu mañana paseando por el Parque Doramas o el Parque Romano, rodeado de palmeras tropicales. Pide un café cortado en un quiosco tradicional canario, escucha el canto de las aves en los árboles o contempla a los remeros entrenar en el Muelle Deportivo. León y Castillo conserva el legado arquitectónico de Las Palmas de Gran Canaria, con fachadas neoclásicas y modernistas que narran historias del rico comercio marítimo de la isla. Caminar por aquí combina la tranquilidad histórica con espacios de teletrabajo de alta velocidad, excelentes bistrós locales y una vibrante energía cosmopolita.',
    author: 'Mila',
    readTime: '4 min de lectura',
    publishedDate: '18 de junio',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop'
  },
  {
    id: 'blog-2',
    category: 'Gastronomía y Vinos 🍷',
    title: 'Tafira Alta: Degustando la vendimia volcánica',
    subtitle: 'Ruta por los viñedos históricos que rodean el cráter de Bandama.',
    excerpt: 'Tafira y la zona de Bandama albergan vinos con Denominación de Origen Gran Canaria. Pasa una tarde degustando uvas tintas y doradas sobre suelo volcánico.',
    content: 'Justo a las afueras de los jardines de Tafira se alza la Caldera de Bandama, un cráter volcánico de 200 metros de profundidad. La tierra rica en ceniza nutre cepas prefiloxéricas singulares en Europa, como el Listán Negro y la Malvasía Volcánica. Mi plan preferido es recorrer en bicicleta los senderos tranquilos de Tafira Alta y parar en una bodega familiar para disfrutar de una tabla de quesos locales acompañada de un vino de la tierra con carácter mineral. El aire es fresco, las vistas se abren hacia el océano y el ritmo de vida se calma al instante.',
    author: 'Mila',
    readTime: '6 min de lectura',
    publishedDate: '28 de mayo',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop'
  }
];
