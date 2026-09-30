/**
 * Smart image fallbacks for product surfaces.
 *
 * When a product has no image — or its image fails to load — we never show a
 * generic grey icon. Instead we render a clean, high-quality beauty/skincare
 * stock photo from Unsplash, selected by the product's category, then by its
 * skin-type / concern tags, and finally a generic beauty photo.
 *
 * These are stable, direct Unsplash CDN URLs with sizing params — NO API key
 * is required.
 */

/** Build a sized Unsplash CDN URL from a photo id. */
const u = (id: string, w = 800): string =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}`;

/** Generic, always-safe beauty/skincare photos. */
const GENERIC_BEAUTY: string[] = [
  u('1556228578-0d85b1a4d571'),
  u('1556228720-195a672e8a03'),
  u('1571781926291-c477ebfd024b'),
  u('1522335789203-aabd1fc54bc9'),
];

/** Category → curated photo set (Persian category labels used across the app). */
const CATEGORY_IMAGES: Record<string, string[]> = {
  'پاک‌کننده': [u('1600428877878-1a0fd85beda8'), u('1547887538-e3a2f32cb1cc')],
  'درمان اصلی': [u('1620916566398-39f1143ab7be'), u('1631730359585-38a4935cbec4')],
  'مرطوب‌کننده': [u('1596755094514-f87e34085b2c'), u('1608248543803-ba4f8c70ae0b')],
  'سرم': [u('1620916566398-39f1143ab7be'), u('1612817288484-6f916006741a')],
  'ضد آفتاب': [u('1556228841-a3f7bcb15dd0'), u('1585652757141-8837d676fac8')],
  'ماسک': [u('1598440947619-2c35fc9aa908'), u('1570172619644-dfd03ed5d881')],
};

/** Skin-type / concern tag → curated photo set (second-level fallback). */
const TAG_IMAGES: Record<string, string[]> = {
  'چرب': [u('1600428877878-1a0fd85beda8')],
  'خشک': [u('1596755094514-f87e34085b2c')],
  'مختلط': [u('1571781926291-c477ebfd024b')],
  'معمولی': [u('1522335789203-aabd1fc54bc9')],
  'حساس': [u('1608248543803-ba4f8c70ae0b')],
  'جوش': [u('1631730359585-38a4935cbec4')],
  'لک': [u('1620916566398-39f1143ab7be')],
  'چروک': [u('1612817288484-6f916006741a')],
  'آبرسانی': [u('1596755094514-f87e34085b2c')],
  'منافذ باز': [u('1547887538-e3a2f32cb1cc')],
  'تیرگی': [u('1570172619644-dfd03ed5d881')],
};

/** Stable, deterministic hash so a given product always gets the same photo. */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Pick one item from a list deterministically, based on a seed string. */
function pick(list: string[], seed: string): string {
  if (list.length === 1) return list[0];
  return list[hashString(seed) % list.length];
}

export interface FallbackImageInput {
  /** Product category label, e.g. "سرم". */
  category?: string | null;
  /** Skin-type tags, e.g. ["چرب", "مختلط"]. */
  skinTypes?: string[] | null;
  /** Concern tags, e.g. ["جوش"]. */
  concerns?: string[] | null;
  /** Anything stable & unique (id or title) so the same product keeps one photo. */
  seed?: string | number | null;
}

/**
 * Resolve a high-quality beauty stock photo for a product that has no usable
 * image. Priority: category → skin-type tag → concern tag → generic beauty.
 */
export function getFallbackImage(input: FallbackImageInput = {}): string {
  const seed = String(input.seed ?? input.category ?? 'glowmarket');

  const category = input.category?.trim();
  if (category && CATEGORY_IMAGES[category]) {
    return pick(CATEGORY_IMAGES[category], seed);
  }

  const tags = [...(input.skinTypes || []), ...(input.concerns || [])];
  for (const tag of tags) {
    const key = tag?.trim();
    if (key && TAG_IMAGES[key]) {
      return pick(TAG_IMAGES[key], seed);
    }
  }

  return pick(GENERIC_BEAUTY, seed);
}

/** A neutral, on-brand beauty photo for seller logos with no uploaded image. */
export function getSellerLogoFallback(seed: string | number = 'seller'): string {
  return pick(GENERIC_BEAUTY, String(seed));
}