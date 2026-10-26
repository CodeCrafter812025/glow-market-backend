// --- Types ---

export type RootCategory = "skin" | "hair" | "body";

export interface Seller {
  id: number;
  brandName: string;
  isFounder: boolean;
}

export interface RecommendationProduct {
  id: number;
  sellerId: number;
  title: string;
  price: number;
  image: string;
  rootCategory?: RootCategory;
  targetSkinType: string[];
  targetConcerns: string[];
  category: "پاک‌کننده" | "درمان اصلی" | "مرطوب‌کننده" | "سرم" | "ضد آفتاب" | "ماسک";
  isSensitiveFriendly: boolean;
  targetGoals: string[];
}

export interface QuizAnswers {
  rootCategory?: RootCategory;
  skinType: string;
  concern: string;
  sunExposure: string;
  sensitivity: string;
  goal: string;
}

export interface ScoredProduct extends RecommendationProduct {
  matchScore: number;
  matchPercent: number;
}

export const sellers: Seller[] = [
  { id: 1, brandName: "لومیر (Lumière)", isFounder: true },
  { id: 2, brandName: "گلو لب (Glow Lab)", isFounder: true },
  { id: 3, brandName: "ترا بوتانیکس (Terra Botanics)", isFounder: false },
  { id: 4, brandName: "پتال اند بلوم (Petal & Bloom)", isFounder: false },
  { id: 5, brandName: "دِرماکلین (DermaClean)", isFounder: true },
  { id: 6, brandName: "هیدرا پلاس (Hydra Plus)", isFounder: false },
];

export const products: RecommendationProduct[] = [
  // --- Skin Products ---
  {
    id: 101,
    sellerId: 5,
    rootCategory: "skin",
    title: "ژل شست‌وشوی کنترل چربی با سالیسیلیک اسید",
    price: 320000,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7iclacajsa/product-serum-gold-cap.png",
    targetSkinType: ["چرب", "مختلط"],
    targetConcerns: ["جوش", "منافذ باز"],
    category: "پاک‌کننده",
    isSensitiveFriendly: false,
    targetGoals: ["matte", "clear"],
  },
  {
    id: 102,
    sellerId: 2,
    rootCategory: "skin",
    title: "سرم نیاسینامید ۱۰٪ + زینک",
    price: 450000,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7iecacajta/product-vitamin-c-serum.png",
    targetSkinType: ["چرب", "مختلط", "معمولی"],
    targetConcerns: ["جوش", "منافذ باز", "لک"],
    category: "درمان اصلی",
    isSensitiveFriendly: true,
    targetGoals: ["matte", "clear", "glow"],
  },
  {
    id: 103,
    sellerId: 6,
    rootCategory: "skin",
    title: "ژل مرطوب‌کننده بدون چربی هیالورونیک اسید",
    price: 380000,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7idgqcajra/product-organic-face-cream.png",
    targetSkinType: ["چرب", "مختلط", "معمولی"],
    targetConcerns: ["آبرسانی"],
    category: "مرطوب‌کننده",
    isSensitiveFriendly: true,
    targetGoals: ["hydrated", "glow"],
  },
  {
    id: 104,
    sellerId: 1,
    rootCategory: "skin",
    title: "سرم ویتامین سی ۲۰٪ روشن‌کننده",
    price: 520000,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7iecacajta/product-vitamin-c-serum.png",
    targetSkinType: ["معمولی", "مختلط", "خشک"],
    targetConcerns: ["لک", "تیرگی"],
    category: "درمان اصلی",
    isSensitiveFriendly: false,
    targetGoals: ["glow", "clear"],
  },
  {
    id: 105,
    sellerId: 3,
    rootCategory: "skin",
    title: "کرم مرطوب‌کننده عمیق با سرامید و شی‌باتر",
    price: 480000,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7idgqcajra/product-organic-face-cream.png",
    targetSkinType: ["خشک", "معمولی"],
    targetConcerns: ["آبرسانی", "چروک"],
    category: "مرطوب‌کننده",
    isSensitiveFriendly: true,
    targetGoals: ["hydrated", "glow"],
  },
  {
    id: 106,
    sellerId: 4,
    rootCategory: "skin",
    title: "فوم شست‌وشوی ملایم گلاب و عسل",
    price: 280000,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7iczycajrq/product-rose-lip-gloss.png",
    targetSkinType: ["خشک", "معمولی", "مختلط"],
    targetConcerns: ["آبرسانی"],
    category: "پاک‌کننده",
    isSensitiveFriendly: true,
    targetGoals: ["hydrated", "glow"],
  },
  {
    id: 107,
    sellerId: 1,
    rootCategory: "skin",
    title: "سرم رتینول ۰.۵٪ ضد چروک شبانه",
    price: 620000,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7iclacajsa/product-serum-gold-cap.png",
    targetSkinType: ["معمولی", "مختلط", "چرب"],
    targetConcerns: ["چروک", "لک"],
    category: "سرم",
    isSensitiveFriendly: false,
    targetGoals: ["clear", "glow"],
  },
  {
    id: 108,
    sellerId: 6,
    rootCategory: "skin",
    title: "کرم ژلی آبرسان بدون عطر مناسب پوست حساس",
    price: 350000,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7idgqcajra/product-organic-face-cream.png",
    targetSkinType: ["معمولی", "خشک", "مختلط", "چرب"],
    targetConcerns: ["آبرسانی"],
    category: "مرطوب‌کننده",
    isSensitiveFriendly: true,
    targetGoals: ["hydrated"],
  },
  {
    id: 109,
    sellerId: 5,
    rootCategory: "skin",
    title: "ژل شست‌وشوی ملایم آلوورا مناسب انواع پوست",
    price: 250000,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7iczycajrq/product-rose-lip-gloss.png",
    targetSkinType: ["معمولی", "خشک", "مختلط", "چرب"],
    targetConcerns: ["آبرسانی", "جوش"],
    category: "پاک‌کننده",
    isSensitiveFriendly: true,
    targetGoals: ["hydrated", "clear"],
  },
  {
    id: 110,
    sellerId: 2,
    rootCategory: "skin",
    title: "سرم آزلائیک اسید ۱۰٪ ضد لک و ضد جوش",
    price: 490000,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7iecacajta/product-vitamin-c-serum.png",
    targetSkinType: ["چرب", "مختلط", "معمولی"],
    targetConcerns: ["جوش", "لک", "تیرگی"],
    category: "درمان اصلی",
    isSensitiveFriendly: true,
    targetGoals: ["clear", "matte"],
  },
  // --- Hair Products ---
  {
    id: 201,
    sellerId: 3,
    rootCategory: "hair",
    title: "شامپو تقویت‌کننده و ضدریزش کافئین و رزماری (فاقد سولفات)",
    price: 340000,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7iczycajrq/product-rose-lip-gloss.png",
    targetSkinType: ["چرب", "معمولی", "مختلط", "خشک"],
    targetConcerns: ["ریزش مو", "شوره و خارش"],
    category: "پاک‌کننده",
    isSensitiveFriendly: true,
    targetGoals: ["clear", "glow", "matte"],
  },
  {
    id: 202,
    sellerId: 1,
    rootCategory: "hair",
    title: "تونیک و سرم پپتیدی محرک رشد و ترمیم ساقه مو",
    price: 560000,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7iclacajsa/product-serum-gold-cap.png",
    targetSkinType: ["چرب", "خشک", "مختلط", "معمولی"],
    targetConcerns: ["ریزش مو", "موخوره و آسیب", "خشکی و وز"],
    category: "درمان اصلی",
    isSensitiveFriendly: true,
    targetGoals: ["glow", "hydrated", "clear"],
  },
  {
    id: 203,
    sellerId: 6,
    rootCategory: "hair",
    title: "ماسک موی آبرسان عمیق کراتین و روغن آرگان مراکشی",
    price: 430000,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7idgqcajra/product-organic-face-cream.png",
    targetSkinType: ["خشک", "معمولی", "مختلط", "چرب"],
    targetConcerns: ["خشکی و وز", "موخوره و آسیب"],
    category: "مرطوب‌کننده",
    isSensitiveFriendly: true,
    targetGoals: ["hydrated", "glow"],
  },
  // --- Body Products ---
  {
    id: 301,
    sellerId: 4,
    rootCategory: "body",
    title: "شامپو بدن گیاهی و صابون دست‌ساز جو دوسر و عسل",
    price: 260000,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7iczycajrq/product-rose-lip-gloss.png",
    targetSkinType: ["خشک", "چرب", "معمولی", "مختلط"],
    targetConcerns: ["آبرسانی", "جوش", "زبری و تیرگی"],
    category: "پاک‌کننده",
    isSensitiveFriendly: true,
    targetGoals: ["hydrated", "clear"],
  },
  {
    id: 302,
    sellerId: 2,
    rootCategory: "body",
    title: "سرم و اسکراب لایه‌بردار بدن AHA ضد جوش و روشن‌کننده",
    price: 410000,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7iecacajta/product-vitamin-c-serum.png",
    targetSkinType: ["خشک", "چرب", "معمولی", "مختلط"],
    targetConcerns: ["جوش", "لک", "زبری و تیرگی"],
    category: "درمان اصلی",
    isSensitiveFriendly: true,
    targetGoals: ["clear", "glow"],
  },
  {
    id: 303,
    sellerId: 6,
    rootCategory: "body",
    title: "لوسیون مرطوب‌کننده و ترمیم‌کننده بدن با اوره و شی‌باتر",
    price: 370000,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7idgqcajra/product-organic-face-cream.png",
    targetSkinType: ["خشک", "چرب", "معمولی", "مختلط"],
    targetConcerns: ["آبرسانی", "زبری و تیرگی"],
    category: "مرطوب‌کننده",
    isSensitiveFriendly: true,
    targetGoals: ["hydrated", "glow"],
  },
];

export function scoreToPercent(score: number, maxPossible: number = 85): number {
  const raw = Math.round((score / maxPossible) * 100);
  return Math.max(65, Math.min(raw, 98));
}

export function getRecommendedProducts(answers: QuizAnswers): ScoredProduct[] {
  const { rootCategory = "skin", skinType, concern, sensitivity, goal } = answers;
  const isVerySensitive = sensitivity === "always";
  const scored: ScoredProduct[] = [];

  for (const product of products) {
    if ((product.rootCategory || "skin") !== rootCategory) {
      continue;
    }
    if (skinType && !product.targetSkinType.includes(skinType)) {
      continue;
    }
    if (isVerySensitive && !product.isSensitiveFriendly) {
      continue;
    }

    let matchScore = 25;
    if (product.targetConcerns.includes(concern)) {
      matchScore += 40;
    }
    if (product.targetGoals.includes(goal)) {
      matchScore += 20;
    }
    if (sensitivity === "sometimes" && product.isSensitiveFriendly) {
      matchScore += 10;
    }

    scored.push({
      ...product,
      matchScore,
      matchPercent: scoreToPercent(matchScore),
    });
  }

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored;
}