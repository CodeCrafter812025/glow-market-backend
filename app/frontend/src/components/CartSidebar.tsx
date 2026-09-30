import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import AuthModal from "@/components/AuthModal";
import ProductImage from "@/components/ProductImage";

// تبدیل اعداد به فارسی
function toPersianDigits(num: number | string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

// فرمت قیمت به تومان
function formatPrice(price: number): string {
  // price is in هزار تومان, convert to تومان for display
  const toman = price * 1000;
  return toPersianDigits(toman.toLocaleString("en-US")) + " تومان";
}

export default function CartSidebar() {
  const { items, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, getTotalPrice, getTotalItems } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // بستن سبد و باز کردن مودال ورود
      setOpen(false);
      setTimeout(() => setAuthModalOpen(true), 300);
    } else {
      // بستن سبد و رفتن به صفحه تسویه‌حساب
      setOpen(false);
      navigate("/checkout");
    }
  };

  return (
    <>
      {/* Auth Modal (controlled externally for checkout flow) */}
      <AuthModal
        externalOpen={authModalOpen}
        onOpenChange={setAuthModalOpen}
        hideTrigger
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-secondary relative cursor-pointer">
            <ShoppingCart className="h-4 w-4" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -left-0.5 h-4 w-4 bg-primary text-primary-foreground text-[10px] font-medium rounded-full flex items-center justify-center">
                {toPersianDigits(totalItems > 99 ? 99 : totalItems)}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:w-96 p-0 flex flex-col" dir="rtl">
          {/* سربرگ */}
          <SheetHeader className="p-5 border-b border-border/50">
            <SheetTitle className="text-right flex items-center gap-2" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
              <ShoppingBag className="h-5 w-5 text-primary" />
              سبد خرید شما
              {totalItems > 0 && (
                <span className="text-xs text-muted-foreground font-normal mr-1">
                  ({toPersianDigits(totalItems)} کالا)
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          {/* محتوای سبد */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                  سبد خرید شما خالی است
                </p>
                <p className="text-xs text-muted-foreground/70">
                  محصولات مورد علاقه خود را به سبد اضافه کنید
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-card border border-border/40 rounded-xl transition-all hover:shadow-sm"
                  >
                    {/* تصویر محصول */}
                    <div className="w-16 flex-shrink-0">
                      <ProductImage
                        src={item.image}
                        alt={item.title}
                        seed={item.id}
                        rounded="lg"
                      />
                    </div>

                    {/* اطلاعات محصول */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <h4 className="text-xs font-semibold leading-tight line-clamp-2" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                        {item.title}
                      </h4>
                      <p className="text-xs font-bold text-primary">
                        {formatPrice(item.price)}
                      </p>

                      {/* کنترل تعداد */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center border border-border/80 rounded-full h-7 bg-background">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="w-7 h-full flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold">
                            {toPersianDigits(item.quantity)}
                          </span>
                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="w-7 h-full flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* حذف */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* دکمه پاک کردن سبد */}
                {items.length > 1 && (
                  <button
                    onClick={clearCart}
                    className="w-full text-center text-xs text-muted-foreground hover:text-destructive py-2 cursor-pointer transition-colors"
                  >
                    <X className="h-3 w-3 inline ml-1" />
                    پاک کردن سبد خرید
                  </button>
                )}
              </div>
            )}
          </div>

          {/* فوتر - جمع کل و دکمه ثبت سفارش */}
          {items.length > 0 && (
            <div className="border-t border-border/50 p-5 space-y-4 bg-background">
              {/* جمع کل */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                  جمع کل:
                </span>
                <span className="text-lg font-bold text-foreground" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                  {formatPrice(totalPrice)}
                </span>
              </div>

              {/* دکمه ثبت سفارش */}
              <Button
                size="lg"
                className="w-full rounded-full h-12 text-sm font-semibold gap-2 cursor-pointer shadow-sm"
                onClick={handleCheckout}
              >
                <ShoppingBag className="h-4 w-4" />
                ثبت سفارش
              </Button>

              <p className="text-[10px] text-muted-foreground text-center">
                ارسال رایگان برای سفارش‌های بالای ۵۰۰ هزار تومان
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}