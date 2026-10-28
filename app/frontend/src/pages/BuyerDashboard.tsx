import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, CalendarHeart, Clock, CheckCircle2, Truck, ArrowLeft, Sparkles, ShoppingBag } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useDataStore } from "@/store/dataStore";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import ProductImage from "@/components/ProductImage";

function toPersianDigits(num: number | string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
}

function formatPrice(price: number): string {
  return toPersianDigits(price.toLocaleString("en-US"));
}

function getOrderStatusIcon(status: string) {
  switch (status) {
    case "processing":
      return <Clock className="h-4 w-4 text-amber-500" />;
    case "shipped":
      return <Truck className="h-4 w-4 text-blue-500" />;
    case "delivered":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function getBookingStatusColor(status: string) {
  switch (status) {
    case "در انتظار تایید":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "تایید شده":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "انجام شده":
      return "bg-green-100 text-green-700 border-green-200";
    case "لغو شده":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-secondary text-muted-foreground border-border";
  }
}

function getRootCategoryLabel(cat?: string) {
  if (cat === "hair") return "مراقبت از مو و کف سر";
  if (cat === "body") return "مراقبت و بهداشت بدن";
  return "مراقبت از پوست صورت";
}

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const { orders, bookings } = useDataStore();
  const { user, isAuthenticated } = useAuthStore();
  const addToCart = useCartStore((s) => s.addItem);
  const [savedQuiz, setSavedQuiz] = useState<any>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("glowmarket_last_quiz");
      if (raw) {
        setSavedQuiz(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      <Header />

      <main className="max-w-screen-lg mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">
                {isAuthenticated && user?.name ? user.name.charAt(0) : "م"}
              </span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                {isAuthenticated ? user?.name : "کاربر مهمان"}
              </h1>
              <p className="text-sm text-muted-foreground" dir="ltr">
                {isAuthenticated ? user?.phone : "---"}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            بازگشت به فروشگاه
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12 rounded-xl bg-secondary/50 p-1">
            <TabsTrigger
              value="orders"
              className="rounded-lg text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer gap-1.5"
            >
              <Package className="h-4 w-4" />
              سفارش‌های من
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="rounded-lg text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer gap-1.5"
            >
              <CalendarHeart className="h-4 w-4" />
              رزروهای من
            </TabsTrigger>
            <TabsTrigger
              value="quiz"
              className="rounded-lg text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              تست هوشمند من
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            {orders.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-secondary/50 flex items-center justify-center">
                  <Package className="h-7 w-7 text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-medium text-muted-foreground">هنوز سفارشی ثبت نکرده‌اید</p>
                  <p className="text-sm text-muted-foreground/70">محصولات مورد علاقه خود را به سبد خرید اضافه کنید</p>
                </div>
                <button
                  onClick={() => navigate("/")}
                  className="text-sm text-primary font-medium hover:underline cursor-pointer"
                >
                  مشاهده محصولات
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-card border border-border/50 rounded-2xl p-5 space-y-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getOrderStatusIcon(order.status)}
                        <div>
                          <p className="text-sm font-bold">{order.id}</p>
                          <p className="text-xs text-muted-foreground">{order.date}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
                        order.status === "processing" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        order.status === "shipped" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-green-50 text-green-700 border-green-200"
                      }`}>
                        {order.statusText}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="w-12 flex-shrink-0">
                          <ProductImage
                            src={item.image}
                            alt={item.title}
                            seed={item.id}
                            rounded="lg"
                            className="border border-border/30"
                          />
                        </div>
                      ))}
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {toPersianDigits(order.items.length)} کالا
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <span className="text-xs text-muted-foreground">مبلغ کل</span>
                      <span className="text-sm font-bold text-primary">
                        {formatPrice(order.totalPrice * 1000)} تومان
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            {bookings.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-secondary/50 flex items-center justify-center">
                  <CalendarHeart className="h-7 w-7 text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-medium text-muted-foreground">هنوز رزروی ثبت نکرده‌اید</p>
                  <p className="text-sm text-muted-foreground/70">از خدمات زیبایی حرفه‌ای ما استفاده کنید</p>
                </div>
                <button
                  onClick={() => navigate("/booking")}
                  className="text-sm text-primary font-medium hover:underline cursor-pointer"
                >
                  رزرو خدمات
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-card border border-border/50 rounded-2xl p-5 space-y-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={booking.specialistPhoto}
                          alt={booking.specialistName}
                          className="w-10 h-10 rounded-full object-cover border border-border/30"
                        />
                        <div>
                          <p className="text-sm font-bold">{booking.serviceName}</p>
                          <p className="text-xs text-muted-foreground">{booking.specialistName}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getBookingStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 bg-secondary/30 rounded-xl p-3">
                      <div className="text-center">
                        <p className="text-[11px] text-muted-foreground">تاریخ</p>
                        <p className="text-xs font-bold mt-0.5">{booking.date}</p>
                      </div>
                      <div className="text-center border-x border-border/30">
                        <p className="text-[11px] text-muted-foreground">ساعت</p>
                        <p className="text-xs font-bold mt-0.5">{booking.time}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] text-muted-foreground">مبلغ</p>
                        <p className="text-xs font-bold mt-0.5 text-primary">
                          {formatPrice(booking.price)} ت
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-muted-foreground">شماره رزرو: {booking.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="quiz" className="mt-6">
            {!savedQuiz ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-medium text-muted-foreground">هنوز تست هوشمند را انجام نداده‌اید</p>
                  <p className="text-sm text-muted-foreground/70">
                    با پاسخ به چند سوال کوتاه، روتین اختصاصی پوست، مو یا بدن خود را دریافت کنید
                  </p>
                </div>
                <Button onClick={() => navigate("/skin-quiz")} className="rounded-full px-6 gap-2 cursor-pointer">
                  <Sparkles className="h-4 w-4" />
                  شروع تست هوشمند
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-card border border-primary/20 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h3 className="text-base font-bold">
                        {getRootCategoryLabel(savedQuiz.answers?.rootCategory)}
                      </h3>
                    </div>
                    <span className="text-xs text-muted-foreground">{savedQuiz.date}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {savedQuiz.answers?.skinType && (
                      <span className="px-3 py-1 rounded-full bg-secondary font-medium">
                        تایپ: {savedQuiz.answers.skinType}
                      </span>
                    )}
                    {savedQuiz.answers?.concern && (
                      <span className="px-3 py-1 rounded-full bg-secondary font-medium">
                        دغدغه: {savedQuiz.answers.concern}
                      </span>
                    )}
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" onClick={() => navigate("/skin-quiz")} className="rounded-full text-xs cursor-pointer">
                      انجام مجدد تست
                    </Button>
                  </div>
                </div>

                {Array.isArray(savedQuiz.recommendations) && savedQuiz.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold">محصولات پیشنهادی برای شما:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {savedQuiz.recommendations.map((prod: any) => (
                        <div key={prod.id} className="bg-card border border-border/50 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                          <div className="space-y-2">
                            <ProductImage src={prod.image} alt={prod.title} category={prod.category} seed={prod.id} rounded="xl" />
                            <p className="text-xs font-bold line-clamp-2">{prod.title}</p>
                            <p className="text-xs text-primary font-bold">{formatPrice(prod.price)} تومان</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full rounded-full text-xs gap-1.5 cursor-pointer"
                            onClick={() => {
                              addToCart({
                                id: prod.id,
                                title: prod.title,
                                price: prod.price / 1000,
                                image: prod.image,
                                quantity: 1,
                              });
                              toast.success("به سبد خرید اضافه شد");
                            }}
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            افزودن به سبد
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}