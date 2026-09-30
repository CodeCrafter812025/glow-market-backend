// ─── Types ───────────────────────────────────────────────────────────────────

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
  targetSkinType: string[];
  targetConcerns: string[];
  category: "پاک‌کننده" | "درمان اصلی" | "مرطوب‌کننده" | "سرم" | "ضد آفتاب" | "ماسک";
  isSensitiveFriendly: boolean;
  targetGoals: string[];
}

export interface QuizAnswers {
  skinType: string;       // پاسخ سوال ۱: نوع پوست
  concern: string;        // پاسخ سوال ۲: دغدغه اصلی
  sunExposure: string;    // پاسخ سوال ۳: تماس با آفتاب
  sensitivity: string;    // پاسخ سوال ۴: حساسیت پوست
  goal: string;           // پاسخ سوال ۵: هدف نهایی
}

export interface ScoredProduct extends RecommendationProduct {
  matchScore: number;
  matchPercent: number;
}

// ─── Mock Sellers ────────────────────────────────────────────────────────────

export const sellers: Seller[] = [
  { id: 1, brandName: "لومیر (Lumière)", isFounder: true },
  { id: 2, brandName: "گلو لب (Glow Lab)", isFounder: true },
  { id: 3, brandName: "ترا بوتانیکس (Terra Botanics)", isFounder: false },
  { id: 4, brandName: "پتال اند بلوم (Petal & Bloom)", isFounder: false },
  { id: 5, brandName: "دِرماکلین (DermaClean)", isFounder: true },
  { id: 6, brandName: "هیدرا پلاس (Hydra Plus)", isFounder: false },
];

// ─── Mock Products ───────────────────────────────────────────────────────────

export const products: RecommendationProduct[] = [
  {
    id: 101,
    sellerId: 5,
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
    title: "سرم آزلائیک اسید ۱۰٪ ضد لک و ضد جوش",
    price: 490000,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7iecacajta/product-vitamin-c-serum.png",
    targetSkinType: ["چرب", "مختلط", "معمولی"],
    targetConcerns: ["جوش", "لک", "تیرگی"],
    category: "درمان اصلی",
    isSensitiveFriendly: true,
    targetGoals: ["clear", "matte"],
  },
];

// ─── Recommendation Engine ───────────────────────────────────────────────────

/**
 * تبدیل امتیاز خام به درصد تطابق (حداکثر ۹۸٪)
 */
export function scoreToPercent(score: number, maxPossible: number = 80): number {
  const raw = Math.round((score / maxPossible) * 100);
  return Math.min(raw, 98);
}

/**
 * فیلتر و امتیازدهی محصولات بر اساس پاسخ‌های کوئیز
 */
export function getRecommendedProducts(answers: QuizAnswers): ScoredProduct[] {
  const { skinType, concern, sensitivity, goal } = answers;

  // آیا کاربر پوست بسیار حساس دارد؟
  const isVerySensitive = sensitivity === "always";

  const scored: ScoredProduct[] = [];

  for (const product of products) {
    // ─── حذف بر اساس عدم تطابق نوع پوست ───
    if (!product.targetSkinType.includes(skinType)) {
      continue;
    }

    // ─── حذف محصولات نامناسب برای پوست بسیار حساس ───
    if (isVerySensitive && !product.isSensitiveFriendly) {
      continue;
    }

    // ─── محاسبه امتیاز ───
    let matchScore = 0;

    // تطابق با دغدغه اصلی = ۵۰ امتیاز
    if (product.targetConcerns.includes(concern)) {
      matchScore += 50;
    }

    // تطابق با هدف نهایی = ۳۰ امتیاز
    if (product.targetGoals.includes(goal)) {
      matchScore += 30;
    }

    // امتیاز اضافه اگر محصول مناسب پوست حساس باشد و کاربر حساسیت دارد
    if (sensitivity === "sometimes" && product.isSensitiveFriendly) {
      matchScore += 5;
    }

    scored.push({
      ...product,
      matchScore,
      matchPercent: scoreToPercent(matchScore),
    });
  }

  // مرتب‌سازی بر اساس امتیاز از بالا به پایین
  scored.sort((a, b) => b.matchScore - a.matchScore);

  return scored;
}