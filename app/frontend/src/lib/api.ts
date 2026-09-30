import { createClient } from '@metagptx/web-sdk';

// Base URL بک‌اند (FastAPI) که از طریق Vite بارگذاری می‌شود.
// اگر روی سرور لوکال هستید معمولا http://127.0.0.1:8000 است.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const client = createClient();

// ─── Types matching the DB schema ────────────────────────────────────────────

export interface DBSeller {
  id: number;
  brand_name: string;
  is_founder: boolean;
  contact_phone: string | null;
  contact_email: string | null;
  logo_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBProduct {
  id: number;
  seller_id: number;
  title: string;
  price: number;
  image_url: string | null;
  description: string | null;
  target_skin_type: string;
  target_concerns: string;
  category: string;
  is_sensitive_friendly: boolean;
  target_goals: string;
  rating: number;
  review_count: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Payload helpers ─────────────────────────────────────────────────────────

export function compactPayload<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    out[key] = typeof value === 'string' ? value.trim() : value;
  }
  return out;
}

// ─── Error handling ──────────────────────────────────────────────────────────

function stringifySafe(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    const json = JSON.stringify(value);
    if (!json || json === '{}' || json === '[]') return '';
    return json.slice(0, 300);
  } catch {
    return '';
  }
}

function normalizeDetail(detail: unknown): string {
  if (detail === undefined || detail === null) return '';

  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail)) {
    const parts = detail
      .map((issue) => {
        if (typeof issue === 'string') return issue;
        const obj = issue as { loc?: unknown; msg?: unknown };
        const msg = typeof obj?.msg === 'string' ? obj.msg : stringifySafe(issue);
        const field = Array.isArray(obj?.loc)
          ? (obj.loc as unknown[]).filter((p) => p !== 'body').map(String).join('.')
          : '';
        return field ? `${field}: ${msg}` : msg;
      })
      .filter((p) => Boolean(p));
    return parts.join(' | ');
  }

  if (typeof detail === 'object') {
    const obj = detail as { msg?: unknown; message?: unknown; detail?: unknown };
    if (typeof obj.msg === 'string') return obj.msg;
    if (typeof obj.message === 'string') return obj.message;
    if (obj.detail !== undefined && obj.detail !== detail) return normalizeDetail(obj.detail);
    return stringifySafe(detail);
  }

  return stringifySafe(detail);
}

export function extractErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback;

  if (typeof err === 'string') return err.trim() || fallback;

  const e = err as {
    data?: { detail?: unknown; message?: unknown };
    response?: { data?: { detail?: unknown; message?: unknown }; statusText?: unknown };
    detail?: unknown;
    message?: unknown;
    error?: unknown;
  };

  const candidates: unknown[] = [
    e?.response?.data?.detail,
    e?.response?.data?.message,
    e?.data?.detail,
    e?.data?.message,
    e?.detail,
    e?.message,
    e?.error,
    e?.response?.statusText,
  ];

  for (const candidate of candidates) {
    const text = normalizeDetail(candidate);
    if (typeof text === 'string' && text.trim()) return text.trim().slice(0, 300);
  }

  return fallback;
}

// ─── Seller API ──────────────────────────────────────────────────────────────

export async function fetchSellers() {
  const response = await client.entities.sellers.query({
    query: {},
    sort: '-created_at',
    limit: 100,
  });
  return (response.data?.items || []) as DBSeller[];
}

export async function fetchSellerById(id: number) {
  const response = await client.entities.sellers.get({ id: String(id) });
  return response.data as DBSeller;
}

export async function createSeller(data: Partial<DBSeller>) {
  const response = await client.entities.sellers.create({
    data: compactPayload(data as Record<string, unknown>),
  });
  return response.data as DBSeller;
}

// ─── Product API ─────────────────────────────────────────────────────────────

export async function fetchProducts(query: Record<string, unknown> = {}, limit = 100) {
  const response = await client.entities.products.query({
    query,
    sort: '-created_at',
    limit,
  });
  return (response.data?.items || []) as DBProduct[];
}

export async function fetchProductsBySeller(sellerId: number) {
  const response = await client.entities.products.query({
    query: { seller_id: sellerId },
    sort: '-created_at',
    limit: 100,
  });
  return (response.data?.items || []) as DBProduct[];
}

export async function createProduct(data: Partial<DBProduct>) {
  const response = await client.entities.products.create({
    data: compactPayload(data as Record<string, unknown>),
  });
  return response.data as DBProduct;
}

// ─── Zarinpal payment API ────────────────────────────────────────────────────

export interface ZarinpalCartItem {
  id: number;
  title: string;
  price: number; 
  quantity: number;
}

export interface ZarinpalRequestPayload {
  items: ZarinpalCartItem[];
  callback_origin: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  shipping_address?: string;
  delivery_method?: string;
}

export interface ZarinpalRequestResult {
  payment_url: string;
  authority: string;
  order_code: string;
  amount_rial: number;
  amount_toman: number;
  sandbox: boolean;
}

export interface ZarinpalVerifyResult {
  success: boolean;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  message: string;
  order_code?: string | null;
  ref_id?: string | null;
  card_pan?: string | null;
  amount_toman?: number | null;
  already_verified: boolean;
  items: Array<{ id: number; title: string; price: number; quantity: number }>;
}

/**
 * Open a Zarinpal payment request using the explicit API Base URL.
 * This prevents GitHub Pages 405 errors caused by relative POSTs.
 */
export async function requestZarinpalPayment(
  payload: ZarinpalRequestPayload,
): Promise<ZarinpalRequestResult> {
  const response = await fetch(`${API_BASE_URL}/api/v1/payments/test-onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // We send an empty body or payload based on the test endpoint needs
    body: JSON.stringify(payload), 
  });
  
  if (!response.ok) {
     const errData = await response.json().catch(() => ({}));
     throw new Error(errData.detail || "خطا در ارتباط با سرور پرداخت");
  }
  
  return await response.json() as ZarinpalRequestResult;
}

export async function verifyZarinpalPayment(
  authority: string,
  status: string,
): Promise<ZarinpalVerifyResult> {
  const url = new URL(`${API_BASE_URL}/api/v1/payments/verify`);
  url.searchParams.append('Authority', authority);
  url.searchParams.append('Status', status);

  const response = await fetch(url.toString(), {
    method: 'GET', // Verify is a GET request in our FastAPI setup
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
     const errData = await response.json().catch(() => ({}));
     throw new Error(errData.detail || "خطا در وریفای پرداخت");
  }
  
  return await response.json() as ZarinpalVerifyResult;
}

export function parseJsonArray(val: string | null | undefined): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}