export type Category =
  | "mode-vetements"
  | "beaute-soins"
  | "maison-decoration"
  | "electronique"
  | "sport-fitness";

export interface MockProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCfa: number;
  images: string[];
  origin: string;
  isFeatured: boolean;
  category: {
    slug: Category;
    name: string;
  };
  shop: {
    name: string;
    slug: string;
    city: string;
    isVerified: boolean;
  };
  reviewCount: number;
  averageRating: number;
}

export const MOCK_CATEGORIES: { slug: Category; name: string; icon: string; count: number }[] = [
  { slug: "mode-vetements",    name: "Mode & Vêtements",      icon: "Shirt",       count: 342 },
  { slug: "beaute-soins",      name: "Beauté & Soins",         icon: "Sparkles",    count: 218 },
  { slug: "maison-decoration", name: "Maison & Décoration",    icon: "Home",        count: 195 },
  { slug: "electronique",      name: "Électronique & High-Tech", icon: "Cpu",       count: 167 },
  { slug: "sport-fitness",     name: "Sport & Fitness",        icon: "Dumbbell",    count: 124 },
];

export const MOCK_PRODUCTS: MockProduct[] = [
  /* ── Mode & Vêtements ── */
  {
    id: "prod_01",
    name: "Boubou Brodé Prestige",
    slug: "boubou-brode-prestige",
    description: "Boubou homme taille XL, tissu bazin riche brodé à la main. Origine Sénégal.",
    priceCfa: 35000,
    images: ["https://images.unsplash.com/photo-1594938298603-c8148c4b4f49?w=600&q=80"],
    origin: "Dakar, Sénégal",
    isFeatured: true,
    category: { slug: "mode-vetements", name: "Mode & Vêtements" },
    shop: { name: "Atelier Thiossane", slug: "atelier-thiossane", city: "Dakar", isVerified: true },
    reviewCount: 24,
    averageRating: 4.8,
  },
  {
    id: "prod_02",
    name: "Robe Wax Imprimée",
    slug: "robe-wax-imprimee",
    description: "Robe longue en wax 100% coton, motifs géométriques multicolores, taille ajustable.",
    priceCfa: 18500,
    images: ["https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&q=80"],
    origin: "Abidjan, Côte d'Ivoire",
    isFeatured: false,
    category: { slug: "mode-vetements", name: "Mode & Vêtements" },
    shop: { name: "Mode Afrik", slug: "mode-afrik", city: "Abidjan", isVerified: true },
    reviewCount: 17,
    averageRating: 4.5,
  },
  {
    id: "prod_03",
    name: "Sneakers Cuir Local",
    slug: "sneakers-cuir-local",
    description: "Baskets en cuir tanné localement, semelle caoutchouc durable. Fabrication artisanale.",
    priceCfa: 42000,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"],
    origin: "Bamako, Mali",
    isFeatured: true,
    category: { slug: "mode-vetements", name: "Mode & Vêtements" },
    shop: { name: "CuirBamako", slug: "cuir-bamako", city: "Bamako", isVerified: false },
    reviewCount: 9,
    averageRating: 4.2,
  },

  /* ── Beauté & Soins ── */
  {
    id: "prod_04",
    name: "Huile de Karité Pure",
    slug: "huile-de-karite-pure",
    description: "Beurre de karité 100% naturel et non raffiné, récolte manuelle. 500 ml.",
    priceCfa: 8500,
    images: ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80"],
    origin: "Ouagadougou, Burkina Faso",
    isFeatured: true,
    category: { slug: "beaute-soins", name: "Beauté & Soins" },
    shop: { name: "Karité Nature", slug: "karite-nature", city: "Ouagadougou", isVerified: true },
    reviewCount: 58,
    averageRating: 4.9,
  },
  {
    id: "prod_05",
    name: "Savon au Lait de Chèvre",
    slug: "savon-lait-de-chevre",
    description: "Savon artisanal enrichi au lait de chèvre frais et huile de coco. Lot de 3.",
    priceCfa: 4500,
    images: ["https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=600&q=80"],
    origin: "Lomé, Togo",
    isFeatured: false,
    category: { slug: "beaute-soins", name: "Beauté & Soins" },
    shop: { name: "SavonTogo", slug: "savon-togo", city: "Lomé", isVerified: true },
    reviewCount: 31,
    averageRating: 4.6,
  },
  {
    id: "prod_06",
    name: "Huile de Baobab Sèrum",
    slug: "huile-de-baobab-serum",
    description: "Sèrum facial à l'huile de baobab bio, anti-âge et hydratant. 30 ml.",
    priceCfa: 12000,
    images: ["https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80"],
    origin: "Dakar, Sénégal",
    isFeatured: false,
    category: { slug: "beaute-soins", name: "Beauté & Soins" },
    shop: { name: "Karité Nature", slug: "karite-nature", city: "Dakar", isVerified: true },
    reviewCount: 14,
    averageRating: 4.7,
  },

  /* ── Maison & Décoration ── */
  {
    id: "prod_07",
    name: "Panier Osier Tressé",
    slug: "panier-osier-tresse",
    description: "Panier de rangement en osier tressé à la main. Dimensions : 40×30×25 cm.",
    priceCfa: 9800,
    images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80"],
    origin: "Marrakech, Maroc",
    isFeatured: false,
    category: { slug: "maison-decoration", name: "Maison & Décoration" },
    shop: { name: "Artisanat Maroc", slug: "artisanat-maroc", city: "Marrakech", isVerified: true },
    reviewCount: 22,
    averageRating: 4.4,
  },
  {
    id: "prod_08",
    name: "Lampe Bogolan Décorative",
    slug: "lampe-bogolan-decorative",
    description: "Lampe de table habillée d'un tissu bogolan teint naturellement. Câble 1,5 m.",
    priceCfa: 22000,
    images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80"],
    origin: "Bamako, Mali",
    isFeatured: true,
    category: { slug: "maison-decoration", name: "Maison & Décoration" },
    shop: { name: "CuirBamako", slug: "cuir-bamako", city: "Bamako", isVerified: false },
    reviewCount: 7,
    averageRating: 4.3,
  },

  /* ── Électronique ── */
  {
    id: "prod_09",
    name: "Panneau Solaire 100W",
    slug: "panneau-solaire-100w",
    description: "Panneau solaire monocristallin 100W, assemblé localement. Garantie 2 ans.",
    priceCfa: 85000,
    images: ["https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80"],
    origin: "Dakar, Sénégal",
    isFeatured: true,
    category: { slug: "electronique", name: "Électronique & High-Tech" },
    shop: { name: "SolarTech SN", slug: "solartech-sn", city: "Dakar", isVerified: true },
    reviewCount: 41,
    averageRating: 4.7,
  },
  {
    id: "prod_10",
    name: "Batterie Solaire Portable",
    slug: "batterie-solaire-portable",
    description: "Batterie externe 20 000 mAh avec panneau solaire intégré. USB-A + USB-C.",
    priceCfa: 28000,
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"],
    origin: "Lagos, Nigeria",
    isFeatured: false,
    category: { slug: "electronique", name: "Électronique & High-Tech" },
    shop: { name: "TechLagos", slug: "tech-lagos", city: "Lagos", isVerified: true },
    reviewCount: 19,
    averageRating: 4.1,
  },

  /* ── Sport & Fitness ── */
  {
    id: "prod_11",
    name: "Corde à Sauter Pro",
    slug: "corde-a-sauter-pro",
    description: "Corde à sauter en acier câblé, poignées ergonomiques bois. Réglable 2,8 m.",
    priceCfa: 7500,
    images: ["https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&q=80"],
    origin: "Accra, Ghana",
    isFeatured: false,
    category: { slug: "sport-fitness", name: "Sport & Fitness" },
    shop: { name: "FitGhana", slug: "fit-ghana", city: "Accra", isVerified: true },
    reviewCount: 33,
    averageRating: 4.5,
  },
  {
    id: "prod_12",
    name: "Tapis de Yoga Naturel",
    slug: "tapis-yoga-naturel",
    description: "Tapis de yoga en caoutchouc naturel antidérapant, 6 mm d'épaisseur. 183×61 cm.",
    priceCfa: 19500,
    images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80"],
    origin: "Nairobi, Kenya",
    isFeatured: false,
    category: { slug: "sport-fitness", name: "Sport & Fitness" },
    shop: { name: "ZenKenya", slug: "zen-kenya", city: "Nairobi", isVerified: true },
    reviewCount: 28,
    averageRating: 4.6,
  },
];
