import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Product {
  id: number;
  image: string;
  brand: string;
  title: string;
  price: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  skinType: string[];
  concerns: string[];
}

// مقادیر ثابت برای نوع پوست و دغدغه‌ها
export const SKIN_TYPES = ["چرب", "خشک", "مختلط", "حساس", "معمولی"] as const;
export const CONCERNS = ["جوش", "لک", "چروک", "آبرسانی", "منافذ باز", "تیرگی"] as const;

export interface OrderItem {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  status: "processing" | "shipped" | "delivered";
  statusText: string;
  date: string;
}

export interface Booking {
  id: string;
  serviceName: string;
  specialistName: string;
  specialistPhoto: string;
  date: string;
  time: string;
  price: number;
  customerName: string;
  customerPhone: string;
  status: "در انتظار تایید" | "تایید شده" | "انجام شده" | "لغو شده";
  createdAt: string;
}

interface DataState {
  products: Product[];
  orders: Order[];
  bookings: Booking[];
  addProduct: (product: Omit<Product, "id">) => void;
  addOrder: (order: Omit<Order, "id">) => void;
  updateOrderStatus: (orderId: string, status: Order["status"], statusText: string) => void;
  addBooking: (booking: Omit<Booking, "id" | "createdAt">) => void;
}

// محصولات اولیه (seed)
const seedProducts: Product[] = [
  {
    id: 1,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7iclacajsa/product-serum-gold-cap.png",
    brand: "لومیر (Lumière)",
    title: "سرم آبرسان طلای ۲۴ عیار با هیالورونیک اسید",
    price: 68.00,
    rating: 4.8,
    reviewCount: 234,
    verified: true,
    skinType: ["خشک", "معمولی", "مختلط"],
    concerns: ["آبرسانی", "چروک"],
  },
  {
    id: 2,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7iczycajrq/product-rose-lip-gloss.png",
    brand: "پتال اند بلوم (Petal & Bloom)",
    title: "لیپ گلاس تینت گل رز - درخشش طبیعی",
    price: 24.50,
    rating: 4.6,
    reviewCount: 189,
    verified: true,
    skinType: ["معمولی", "خشک", "حساس", "چرب", "مختلط"],
    concerns: ["آبرسانی"],
  },
  {
    id: 3,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7idgqcajra/product-organic-face-cream.png",
    brand: "ترا بوتانیکس (Terra Botanics)",
    title: "کرم صورت گیاهی ارگانیک - مرطوب‌کننده عمیق",
    price: 52.00,
    rating: 4.9,
    reviewCount: 312,
    verified: true,
    skinType: ["خشک", "حساس", "معمولی"],
    concerns: ["آبرسانی", "تیرگی"],
  },
  {
    id: 4,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7idvicajqq/product-hair-oil-amber.png",
    brand: "سیلک اند روت (Silk & Root)",
    title: "روغن ترمیم‌کننده موی آرگان و رزماری",
    price: 38.00,
    rating: 4.7,
    reviewCount: 156,
    verified: true,
    skinType: ["خشک", "معمولی"],
    concerns: ["آبرسانی"],
  },
  {
    id: 5,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7iecacajta/product-vitamin-c-serum.png",
    brand: "گلو لب (Glow Lab)",
    title: "سرم روشن‌کننده ویتامین سی ۲۰٪",
    price: 45.00,
    rating: 4.5,
    reviewCount: 278,
    verified: true,
    skinType: ["چرب", "مختلط", "معمولی"],
    concerns: ["لک", "تیرگی", "منافذ باز"],
  },
  {
    id: 6,
    image: "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7ieqycajsq/product-eyeshadow-palette.png",
    brand: "ولوت رز (Velvet Rose)",
    title: "پالت سایه چشم رزگلد - ۱۲ رنگ",
    price: 56.00,
    rating: 4.8,
    reviewCount: 421,
    verified: true,
    skinType: ["معمولی", "خشک", "حساس", "چرب", "مختلط"],
    concerns: ["لک"],
  },
];

// تولید شناسه سفارش
function generateOrderId(): string {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `ORD-${num}`;
}

// تولید شناسه رزرو
function generateBookingId(): string {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `BKG-${num}`;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      products: seedProducts,
      orders: [],
      bookings: [],

      addProduct: (product) => {
        const { products } = get();
        const maxId = products.length > 0 ? Math.max(...products.map((p) => p.id)) : 0;
        const newProduct: Product = {
          skinType: [],
          concerns: [],
          ...product,
          id: maxId + 1,
        };
        set({ products: [...products, newProduct] });
      },

      addOrder: (order) => {
        const newOrder: Order = {
          ...order,
          id: generateOrderId(),
        };
        set({ orders: [newOrder, ...get().orders] });
      },

      updateOrderStatus: (orderId, status, statusText) => {
        set({
          orders: get().orders.map((o) =>
            o.id === orderId ? { ...o, status, statusText } : o
          ),
        });
      },

      addBooking: (booking) => {
        const newBooking: Booking = {
          ...booking,
          id: generateBookingId(),
          createdAt: new Date().toISOString(),
        };
        set({ bookings: [newBooking, ...get().bookings] });
      },
    }),
    {
      name: "glowmarket-data",
    }
  )
);