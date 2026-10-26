import { Sparkles, ShoppingBag, Star, Shield, Droplets, Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import type { ScoredProduct, QuizAnswers } from "@/data/initialData";
import ProductImage from "@/components/ProductImage";
import { getFallbackImage } from "@/lib/productImages";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toPersianDigits(num: number | string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
}

function formatPriceToman(price: number): string {
  return toPersianDigits(price.toLocaleString("en-US"));
}

function getSkinTypeLabel(value: string): string {
  const map: Record<string, string> = {
    "چرب": "پوست چرب",
    "خشک": "پوست خشک",
    "مختلط": "پوست مختلط",
    "معمولی": "پوست معمولی",
  };
  return map[value] || value;
}

function getConcernLabel(value: string): string {
  const map: Record<string, string> = {
    "جوش": "جوش و آکنه",
    "چروک": "چین و چروک",
    "لک": "لک و تیرگی",
    "آبرسانی": "آبرسانی",
    "منافذ باز": "منافذ باز",
  };
  return map[value] || value;
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "پاک‌کننده":
      return <Droplets className="h-4 w-4" />;
    case "درمان اصلی":
    case "سرم":
      return <Sparkles className="h-4 w-4" />;
    case "مرطوب‌کننده":
      return <Paintbrush className="h-4 w-4" />;
    default:
      return <Star className="h-4 w-4" />;
  }
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface ResultPageProps {
  answers: QuizAnswers;
  recommendedProducts: ScoredProduct[];
  onReset: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ResultPage({ answers, recommendedProducts, onReset }: ResultPageProps) {
  const addToCart = useCartStore((s) => s.addItem);

  const handleAddToCart = (product: ScoredProduct) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price / 1000, // تبدیل از تومان به هزار تومان (فرمت سبد خرید)
      image: product.image || getFallbackImage({ category: product.category, seed: product.id }),
      quantity: 1,
    });
    toast.success("به سبد خرید اضافه شد", {
      description: product.title,
    });
  };

  // بهترین محصول (بالاترین امتیاز)
  const heroProduct = recommendedProducts[0] || null;

  // محصولات روتین (پاک‌کننده، درمان اصلی، مرطوب‌کننده)
  const routineCategories = ["پاک‌کننده", "درمان اصلی", "مرطوب‌کننده"] as const;
  const routineProducts = routineCategories.map((cat) => {
    return recommendedProducts.find((p) => p.category === cat) || null;
  });

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      {/* ─── هدر خلاصه وضعیت پوست ─── */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 text-primary bg-primary/10 px-4 py-1.5 rounded-full text-xs font-semibold">
          <Sparkles className="h-4 w-4" />
          آنالیز هوشمند تکمیل شد
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
          {answers.rootCategory === "hair" ? "روتین اختصاصی مراقبت از موی شما" : answers.rootCategory === "body" ? "روتین اختصاصی مراقبت از بدن شما" : "روتین پوستی اختصاصی شما"}
        </h2>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="px-3 py-1.5 rounded-full bg-secondary/60 text-sm font-medium border border-border/30">
            {getSkinTypeLabel(answers.skinType)}
          </span>
          <span className="text-muted-foreground">|</span>
          <span className="px-3 py-1.5 rounded-full bg-secondary/60 text-sm font-medium border border-border/30">
            دغدغه: {getConcernLabel(answers.concern)}
          </span>
        </div>
      </div>

      {/* ─── Hero Card (بهترین محصول) ─── */}
      {heroProduct && (
        <div className="bg-card border border-primary/20 rounded-3xl p-5 sm:p-7 shadow-lg relative overflow-hidden">
          {/* Decorative blur */}
          <div className="absolute -top-16 -left-16 w-40 h-40 bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />

          <div className="relative flex flex-col sm:flex-row gap-6 items-center">
            {/* تصویر محصول با بج درصد تطابق */}
            <div className="relative flex-shrink-0">
              <div className="w-40 sm:w-48">
                <ProductImage
                  src={heroProduct.image}
                  alt={heroProduct.title}
                  category={heroProduct.category}
                  seed={heroProduct.id}
                  rounded="xl"
                  className="rounded-2xl border border-border/30 shadow-sm"
                />
              </div>
              {/* بج درصد تطابق */}
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                {toPersianDigits(heroProduct.matchPercent)}٪ تطابق
              </div>
            </div>

            {/* جزئیات محصول */}
            <div className="flex-1 space-y-4 text-center sm:text-right">
              <div className="space-y-2">
                <span className="text-xs text-primary font-semibold bg-primary/10 px-2.5 py-1 rounded-full">
                  بهترین انتخاب برای شما
                </span>
                <h3 className="text-xl sm:text-2xl font-bold leading-snug" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                  {heroProduct.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  دسته‌بندی: {heroProduct.category}
                </p>
              </div>

              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <span className="text-2xl font-bold text-primary">
                  {formatPriceToman(heroProduct.price)}
                </span>
                <span className="text-sm text-muted-foreground">تومان</span>
              </div>

              <Button
                className="rounded-full px-8 h-11 text-sm font-bold gap-2 cursor-pointer shadow-sm"
                onClick={() => handleAddToCart(heroProduct)}
              >
                <ShoppingBag className="h-4 w-4" />
                افزودن به سبد خرید
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── روتین پیشنهادی (۳ ستون) ─── */}
      <div className="space-y-5">
        <div className="text-center space-y-1.5">
          <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
            روتین پیشنهادی روزانه
          </h3>
          <p className="text-xs text-muted-foreground">
            سه مرحله اصلی مراقبت بر اساس نیاز پوست شما
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {routineCategories.map((cat, idx) => {
            const product = routineProducts[idx];
            const stepLabels = ["مرحله ۱", "مرحله ۲", "مرحله ۳"];

            return (
              <div
                key={cat}
                className="bg-card border border-border/50 rounded-2xl p-5 space-y-4 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {getCategoryIcon(cat)}
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">{toPersianDigits(stepLabels[idx])}</p>
                      <p className="text-sm font-bold">{cat}</p>
                    </div>
                  </div>
                  {product && (
                    <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {toPersianDigits(product.matchPercent)}٪
                    </span>
                  )}
                </div>

                {product ? (
                  <>
                    {/* Product Image */}
                    <ProductImage
                      src={product.image}
                      alt={product.title}
                      category={product.category}
                      seed={product.id}
                      rounded="xl"
                      className="border border-border/20"
                    />

                    {/* Product Info */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold leading-snug line-clamp-2">
                        {product.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">
                          {formatPriceToman(product.price)}
                          <span className="text-[10px] text-muted-foreground font-normal mr-1">تومان</span>
                        </span>
                      </div>
                    </div>

                    {/* Add to Cart */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-full text-xs font-medium h-9 cursor-pointer gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      افزودن به سبد
                    </Button>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center py-8">
                    <p className="text-xs text-muted-foreground text-center">
                      محصول مناسبی در این دسته یافت نشد
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── سایر محصولات پیشنهادی ─── */}
      {recommendedProducts.length > 1 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
            سایر محصولات پیشنهادی ({toPersianDigits(recommendedProducts.length - 1)} محصول)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendedProducts.slice(1).map((product) => (
              <div
                key={product.id}
                className="bg-card border border-border/50 rounded-xl p-4 flex items-center gap-4 hover:border-primary/20 transition-colors"
              >
                <div className="w-16 flex-shrink-0">
                  <ProductImage
                    src={product.image}
                    alt={product.title}
                    category={product.category}
                    seed={product.id}
                    rounded="lg"
                    className="border border-border/20"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-xs font-bold truncate">{product.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{product.category}</span>
                    <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      {toPersianDigits(product.matchPercent)}٪
                    </span>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {formatPriceToman(product.price)} <span className="text-[10px] text-muted-foreground font-normal">تومان</span>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-primary/10 text-primary cursor-pointer flex-shrink-0"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingBag className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── دکمه تکرار تست ─── */}
      <div className="text-center pt-4">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full px-8 gap-2 cursor-pointer"
          onClick={onReset}
        >
          انجام مجدد تست
        </Button>
      </div>
    </div>
  );
}