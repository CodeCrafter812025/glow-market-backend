import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Truck, CreditCard, Plus, CheckCircle2, Loader2, ShieldCheck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { toast } from "sonner";
import Header from "@/components/Header";
import ProductImage from "@/components/ProductImage";
import { extractErrorMessage, requestZarinpalPayment } from "@/lib/api";
import { toPersianDigits } from "@/lib/numerals";

function formatPrice(price: number): string {
  const toman = price * 1000;
  return toPersianDigits(toman.toLocaleString("en-US")) + " تومان";
}

const SHIPPING_COSTS: Record<string, number> = {
  standard: 50,
  express: 85,
};

// آدرس پیش‌فرض نمایش‌داده‌شده در همین صفحه
const DEFAULT_ADDRESS = "تهران، خیابان ونک، خیابان گاندی جنوبی، پلاک ۱۲، واحد ۳";

// کلید ذخیره موقت اطلاعات سفارش پیش از انتقال به درگاه
const PENDING_PAYMENT_KEY = "glowmarket-pending-payment";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const addOrder = useDataStore((state) => state.addOrder);
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [loading, setLoading] = useState(false);

  const subtotal = getTotalPrice();
  const shippingCost = SHIPPING_COSTS[deliveryMethod] ?? SHIPPING_COSTS.standard;
  const grandTotal = subtotal + shippingCost;
  const totalItems = getTotalItems();

  if (items.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Header />
        <div className="max-w-screen-xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-secondary/50 flex items-center justify-center">
            <Package className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h2 className="text-lg font-bold" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
            سبد خرید شما خالی است
          </h2>
          <p className="text-sm text-muted-foreground">
            ابتدا محصولاتی را به سبد خرید اضافه کنید
          </p>
          <Button
            onClick={() => navigate("/")}
            className="rounded-full cursor-pointer"
          >
            بازگشت به فروشگاه
          </Button>
        </div>
      </div>
    );
  }

  const createLocalOrder = () => {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, "0");
    const persianDate = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} - ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    addOrder({
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      })),
      totalPrice: grandTotal,
      customerName: user?.name || "کاربر مهمان",
      customerPhone: user?.phone || "نامشخص",
      status: "processing",
      statusText: "در حال پردازش",
      date: persianDate,
    });
  };

  const handlePayment = async () => {
    if (items.length === 0) return;
    setLoading(true);

    if (paymentMethod === "cod") {
      createLocalOrder();
      clearCart();
      setLoading(false);
      toast.success("سفارش شما با موفقیت ثبت شد", {
        description: "پرداخت هنگام تحویل سفارش انجام می‌شود.",
        duration: 5000,
      });
      navigate("/profile");
      return;
    }

    try {
      // ارسال درخواست به بک‌اند FastAPI
      const result = await requestZarinpalPayment({
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
        })),
        callback_origin: window.location.origin,
        customer_name: user?.name || undefined,
        customer_phone: user?.phone || undefined,
        shipping_address: DEFAULT_ADDRESS,
        delivery_method: deliveryMethod,
      });

      try {
        localStorage.setItem(
          PENDING_PAYMENT_KEY,
          JSON.stringify({
            authority: result.authority,
            orderCode: result.order_code,
            customerName: user?.name || "کاربر مهمان",
            customerPhone: user?.phone || "نامشخص",
            deliveryMethod,
            amountToman: result.amount_toman,
          }),
        );
      } catch {
        // Ignore localStorage errors
      }

      toast.success("در حال انتقال به درگاه زرین‌پال...");
      // ریدایرکت مستقیم به صفحه پرداخت زرین‌پال که از بک‌اند برگشته است
      window.location.href = result.payment_url;
      
    } catch (err) {
      setLoading(false);
      toast.error(extractErrorMessage(err, "اتصال به درگاه پرداخت ممکن نشد. لطفاً دوباره تلاش کنید."));
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
            تسویه‌حساب
          </h1>
          <p className="text-sm text-muted-foreground mt-1">مرحله نهایی ثبت سفارش شما</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  آدرس تحویل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-primary/30 bg-primary/5 rounded-xl relative">
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                      پیش‌فرض
                    </span>
                  </div>
                  <div className="space-y-1.5 pl-16">
                    <p className="text-sm font-semibold" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                      {user?.name || "کاربر گلو مارکت"}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      تهران، خیابان ونک، خیابان گاندی جنوبی، پلاک ۱۲، واحد ۳
                    </p>
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      {user?.phone || "09123456789"}
                    </p>
                  </div>
                </div>

                <Button variant="outline" className="w-full rounded-xl h-11 border-dashed border-border/80 text-muted-foreground hover:text-foreground cursor-pointer">
                  <Plus className="h-4 w-4 ml-2" />
                  افزودن آدرس جدید
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="h-4 w-4 text-primary" />
                  </div>
                  زمان ارسال
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod} className="space-y-3" dir="rtl">
                  <div className={`flex items-center gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${
                    deliveryMethod === "standard" ? "border-primary/40 bg-primary/5" : "border-border/50 hover:border-border"
                  }`}>
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>ارسال عادی</p>
                          <p className="text-xs text-muted-foreground mt-0.5">تحویل ۳ تا ۵ روز کاری</p>
                        </div>
                        <span className="text-xs font-bold text-primary">
                          {formatPrice(SHIPPING_COSTS.standard)}
                        </span>
                      </div>
                    </Label>
                  </div>

                  <div className={`flex items-center gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${
                    deliveryMethod === "express" ? "border-primary/40 bg-primary/5" : "border-border/50 hover:border-border"
                  }`}>
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>ارسال پیشتاز</p>
                          <p className="text-xs text-muted-foreground mt-0.5">تحویل ۱ تا ۲ روز کاری</p>
                        </div>
                        <span className="text-xs font-bold text-primary">
                          {formatPrice(SHIPPING_COSTS.express)}
                        </span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  روش پرداخت
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3" dir="rtl">
                  <div className={`flex items-center gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${
                    paymentMethod === "online" ? "border-primary/40 bg-primary/5" : "border-border/50 hover:border-border"
                  }`}>
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online" className="flex-1 cursor-pointer">
                      <p className="text-sm font-semibold" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>پرداخت اینترنتی (زرین‌پال / آیدی‌پی)</p>
                      <p className="text-xs text-muted-foreground mt-0.5">پرداخت امن با درگاه بانکی</p>
                    </Label>
                  </div>

                  <div className={`flex items-center gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${
                    paymentMethod === "cod" ? "border-primary/40 bg-primary/5" : "border-border/50 hover:border-border"
                  }`}>
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <p className="text-sm font-semibold" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>پرداخت در محل</p>
                      <p className="text-xs text-muted-foreground mt-0.5">پرداخت هنگام تحویل سفارش</p>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                    خلاصه سفارش
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 flex-shrink-0">
                          <ProductImage src={item.image} alt={item.title} seed={item.id} rounded="lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium line-clamp-1" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                            {item.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {toPersianDigits(item.quantity)} عدد × {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-3" />

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">مبلغ کل ({toPersianDigits(totalItems)} کالا)</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">هزینه ارسال</span>
                      <span className="font-medium">{formatPrice(shippingCost)}</span>
                    </div>

                    <Separator className="my-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                        مبلغ قابل پرداخت
                      </span>
                      <span className="text-lg font-bold text-primary" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                        {formatPrice(grandTotal)}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full rounded-xl h-13 text-sm font-bold gap-2 cursor-pointer shadow-md mt-4"
                    onClick={handlePayment}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {paymentMethod === "cod" ? "در حال ثبت سفارش..." : "در حال اتصال به سرور..."}
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        {paymentMethod === "cod" ? "ثبت نهایی سفارش" : "پرداخت با زرین‌پال"}
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    <p className="text-[11px] text-muted-foreground">پرداخت امن با رمزنگاری SSL</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}