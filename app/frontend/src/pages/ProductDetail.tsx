import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Star, 
  ShoppingCart, 
  BadgeCheck, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Heart, 
  Check, 
  ArrowRight,
  MessageSquare,
  ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useCartStore } from "@/store/cartStore";
import { useDataStore } from "@/store/dataStore";
import ProductImage from "@/components/ProductImage";
import { toPersianDigits } from "@/lib/numerals";

// اطلاعات تکمیلی محصول (ثابت برای همه محصولات در حالت دمو)
const productExtras = {
  aiMatchScore: 95,
  images: [
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1608248597263-00079e96c46a?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600"
  ],
  description: "این سرم با ترکیب چندوزنی هیالورونیک اسید به همراه ویتامین B5، آبرسانی چندلایه‌ای و عمیقی را برای پوست فراهم می‌کند. فرمولاسیون سبک و فاقد چربی آن به سرعت جذب شده و باعث پرتر شدن، کاهش خطوط ریز و شفافیت طبیعی پوست می‌شود.",
  ingredients: "Aqua (Water), Sodium Hyaluronate, Pentylene Glycol, Propanediol, Sodium Hyaluronate Crosspolymer, Panthenol, Ahnfeltia Concinna Extract, Glycerin, Trisodium Ethylenediamine Disuccinate, Citric Acid, Isoceteth-20, Ethoxydiglycol, Ethylhexylglycerin, Hexylene Glycol, 1,2-Hexanediol, Caprylyl Glycol.",
  howToUse: "چند قطره از سرم را صبح و شب قبل از کرم‌های سنگین‌تر و مرطوب‌کننده روی پوست تمیز صورت و گردن بمالید و به آرامی ماساژ دهید تا جذب شود.",
  seller: {
    name: "داروخانه آنلاین سفیر زیبایی",
    rating: 4.9,
    productsCount: 340,
  }
};

const mockReviews = [
  {
    id: 1,
    author: "سارا محمدی",
    rating: 5,
    date: "۲ روز پیش",
    verifiedBuyer: true,
    comment: "بعد از انجام تست پوست سیستم این محصول رو بهم پیشنهاد داد. واقعا فوق‌العاده بود! بعد از ۳ روز استفاده پوستم کاملا شفاف و هیدراته شده.",
    likes: 12
  },
  {
    id: 2,
    author: "مریم کاظمی",
    rating: 4,
    date: "۱ هفته پیش",
    verifiedBuyer: true,
    comment: "جذب بسیار سریعی داره و اصلا حس چربی روی پوست ایجاد نمیکنه. فقط حتما باید بعدش مرطوب‌کننده بزنید تا اثرش ماندگار بشه.",
    likes: 5
  }
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "ingredients" | "howToUse" | "seller">("desc");
  const [isLiked, setIsLiked] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);
  const products = useDataStore((state) => state.products);

  // پیدا کردن محصول از دیتا استور
  const storeProduct = products.find((p) => p.id === Number(id));

  // ساخت آبجکت محصول ترکیبی (دیتا استور + اطلاعات تکمیلی)
  const mockProduct = {
    id: storeProduct?.id ?? 1,
    title: storeProduct?.title ?? "محصول یافت نشد",
    brand: storeProduct?.brand ?? "",
    price: storeProduct?.price ?? 0,
    rating: storeProduct?.rating ?? 0,
    reviewCount: storeProduct?.reviewCount ?? 0,
    verified: storeProduct?.verified ?? false,
    aiMatchScore: productExtras.aiMatchScore,
    images: storeProduct ? [storeProduct.image, ...productExtras.images.slice(1)] : productExtras.images,
    description: productExtras.description,
    ingredients: productExtras.ingredients,
    howToUse: productExtras.howToUse,
    seller: productExtras.seller,
  };

  // تبدیل قیمت به فرمت استاندارد تومان (بدون پسوند 'هزار')
  const formattedPrice = toPersianDigits((mockProduct.price * 1000).toLocaleString("en-US"));

  const handleAddToCart = () => {
    addToCart(
      {
        id: mockProduct.id,
        title: mockProduct.title,
        price: mockProduct.price,
        image: mockProduct.images[0],
      },
      quantity
    );
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <Header />

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* دکمه بازگشت */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors cursor-pointer"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت به محصولات
        </button>

        {/* بخش اصلی محصول */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* گالری تصاویر محصول (۵ ستون در دسکتاپ) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative">
              {/* نشان اصالت کالا */}
              {mockProduct.verified && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-background/90 backdrop-blur-md text-xs font-medium text-primary px-3 py-1.5 rounded-full border border-primary/20 shadow-sm">
                  <BadgeCheck className="h-4 w-4" />
                  تضمین ۱۰۰٪ اصالت
                </div>
              )}

              <ProductImage
                src={mockProduct.images[selectedImage]}
                alt={mockProduct.title}
                seed={mockProduct.id}
                rounded="xl"
                className="rounded-2xl border border-border/50"
                imgClassName="transition-all duration-300"
              />
            </div>

            {/* تصاویری کوچک (Thumbnails) */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {mockProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                    selectedImage === idx ? "border-primary shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <ProductImage src={img} alt={mockProduct.title} seed={`${mockProduct.id}-${idx}`} />
                </button>
              ))}
            </div>
          </div>

          {/* اطلاعات و خرید محصول (۷ ستون در دسکتاپ) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* نشان تطابق هوش مصنوعی */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/15 via-primary/10 to-accent/20 border border-primary/30 text-primary px-4 py-2 rounded-full text-xs font-semibold shadow-sm">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span>{toPersianDigits(mockProduct.aiMatchScore)}٪ تطابق با ساختار پوستی شما</span>
            </div>

            {/* برند و عنوان */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {mockProduct.brand}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold leading-snug" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                {mockProduct.title}
              </h1>
            </div>

            {/* امتیاز و نظرات */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(mockProduct.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold">{toPersianDigits(mockProduct.rating)}</span>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-xs text-muted-foreground">({toPersianDigits(mockProduct.reviewCount)} نظر کاربران)</span>
            </div>

            {/* قیمت */}
            <div className="p-4 bg-secondary/30 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">قیمت مصرف‌کننده:</span>
                <span className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                  {formattedPrice} تومان
                </span>
              </div>
              <span className="text-xs text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">
                موجود در انبار
              </span>
            </div>

            {/* تعداد و دکمه افزودن به سبد */}
            <div className="flex items-center gap-4 pt-2">
              {/* انتخاب تعداد */}
              <div className="flex items-center border border-border/80 rounded-full h-12 bg-card">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-full flex items-center justify-center text-lg font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-semibold">{toPersianDigits(quantity)}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-full flex items-center justify-center text-lg font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* دکمه خرید */}
              <Button
                size="lg"
                className={`flex-1 rounded-full h-12 text-sm font-medium gap-2 cursor-pointer transition-all ${
                  addedToCart ? "bg-emerald-600 hover:bg-emerald-700" : ""
                }`}
                onClick={handleAddToCart}
              >
                {addedToCart ? (
                  <>
                    <Check className="h-5 w-5" />
                    به سبد خرید اضافه شد
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    افزودن به سبد خرید
                  </>
                )}
              </Button>

              {/* علاقه مندی و اشتراک */}
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12 cursor-pointer"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
              </Button>
            </div>

            {/* مزایای خرید */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50">
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-card border border-border/40 space-y-1">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-[11px] font-medium">ارسال سریع کشوری</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-card border border-border/40 space-y-1">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-[11px] font-medium">ضمانت اصالت کالا</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-card border border-border/40 space-y-1">
                <RotateCcw className="h-5 w-5 text-primary" />
                <span className="text-[11px] font-medium">۷ روز ضمانت بازگشت</span>
              </div>
            </div>

          </div>
        </div>

        {/* بخش تب‌های اطلاعات تکمیلی */}
        <div className="mt-12 sm:mt-16 space-y-6">
          {/* سربرگ تب‌ها */}
          <div className="flex gap-2 border-b border-border/60 overflow-x-auto">
            <button
              onClick={() => setActiveTab("desc")}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === "desc" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              توضیحات محصول
            </button>
            <button
              onClick={() => setActiveTab("ingredients")}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === "ingredients" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              ترکیبات سازنده (INCI)
            </button>
            <button
              onClick={() => setActiveTab("howToUse")}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === "howToUse" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              نحوه مصرف
            </button>
            <button
              onClick={() => setActiveTab("seller")}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === "seller" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              اطلاعات فروشنده
            </button>
          </div>

          {/* محتوای تب فعال */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 leading-relaxed text-sm text-foreground/90">
            {activeTab === "desc" && <p className="text-justify leading-8">{mockProduct.description}</p>}
            {activeTab === "ingredients" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">فهرست کامل ترکیبات شیمیایی و طبیعی بر اساس استاندارد جهانی INCI:</p>
                <div className="p-4 bg-secondary/30 rounded-xl font-mono text-xs leading-6 text-muted-foreground dir-ltr text-left">
                  {mockProduct.ingredients}
                </div>
              </div>
            )}
            {activeTab === "howToUse" && <p className="leading-8">{mockProduct.howToUse}</p>}
            {activeTab === "seller" && (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-bold text-base">{mockProduct.seller.name}</h4>
                  <p className="text-xs text-muted-foreground">ارائه‌دهنده بیش از {toPersianDigits(mockProduct.seller.productsCount)} محصول بهداشتی آرایشی اصل</p>
                </div>
                <div className="text-left bg-primary/10 px-4 py-2 rounded-xl text-primary font-bold text-sm">
                  امتیاز فروشگاه: {toPersianDigits(mockProduct.seller.rating)} از ۵
                </div>
              </div>
            )}
          </div>
        </div>

        {/* بخش نظرات خریداران */}
        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
              <MessageSquare className="h-5 w-5 text-primary" />
              نظرات و تجربیات خریداران
            </h3>
            <Button variant="outline" size="sm" className="rounded-full text-xs cursor-pointer">
              ثبت نظر جدید
            </Button>
          </div>

          <div className="space-y-4">
            {mockReviews.map((rev) => (
              <div key={rev.id} className="bg-card border border-border/40 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{rev.author}</span>
                      {rev.verifiedBuyer && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                          خریدار تاییدشده
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground block">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < rev.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">{rev.comment}</p>
                <div className="flex justify-end pt-2">
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>مفید بود ({toPersianDigits(rev.likes)})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}