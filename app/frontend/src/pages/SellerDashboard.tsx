import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingBag, 
  DollarSign, 
  Package, 
  Star, 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Search,
  ArrowRight,
  X,
  ImagePlus,
  CalendarHeart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Header from "@/components/Header";
import { useDataStore, SKIN_TYPES, CONCERNS } from "@/store/dataStore";
import { toast } from "sonner";
import { normalizeNumericInput, toPersianDigits } from "@/lib/numerals";
import ProductImage from "@/components/ProductImage";
import { getFallbackImage } from "@/lib/productImages";

// فرمت قیمت به تومان
function formatPrice(price: number): string {
  const toman = price * 1000;
  return toPersianDigits(toman.toLocaleString("en-US")) + " تومان";
}

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<"orders" | "products" | "bookings">("orders");
  const [showAddProduct, setShowAddProduct] = useState(false);

  // فرم افزودن محصول
  const [newProduct, setNewProduct] = useState({
    title: "",
    brand: "",
    price: "",
    image: "",
    skinType: [] as string[],
    concerns: [] as string[],
  });

  const { products, orders, bookings, addProduct } = useDataStore();

  // آمار محاسبه‌شده از دیتا استور
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const processingOrders = orders.filter((o) => o.status === "processing").length;

  const mockStats = [
    {
      title: "فروش کل",
      value: totalRevenue > 0 ? formatPrice(totalRevenue) : "۰ تومان",
      change: `${toPersianDigits(orders.length)} سفارش ثبت شده`,
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: "سفارشات جدید",
      value: `${toPersianDigits(processingOrders)} سفارش`,
      change: "در حال پردازش",
      isPositive: processingOrders > 0,
      icon: ShoppingBag,
    },
    {
      title: "محصولات فعال",
      value: `${toPersianDigits(products.length)} کالا`,
      change: "در فروشگاه شما",
      isPositive: true,
      icon: Package,
    },
    {
      title: "امتیاز فروشگاه",
      value: "۴.۹ از ۵",
      change: "از مجموع ۳۲۰ نظر",
      isPositive: true,
      icon: Star,
    },
  ];

  // ثبت محصول جدید
  const handleAddProduct = () => {
    if (!newProduct.title || !newProduct.brand || !newProduct.price) {
      toast.error("لطفاً تمام فیلدهای ضروری را پر کنید");
      return;
    }
    const parsedPrice = parseFloat(normalizeNumericInput(newProduct.price));
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("قیمت باید عددی بزرگ‌تر از صفر باشد");
      return;
    }

    addProduct({
      title: newProduct.title,
      brand: newProduct.brand,
      price: parseFloat(normalizeNumericInput(newProduct.price)),
      // Empty image is fine — ProductImage renders a smart category-based fallback.
      image:
        newProduct.image ||
        getFallbackImage({
          skinTypes: newProduct.skinType,
          concerns: newProduct.concerns,
          seed: newProduct.title,
        }),
      rating: 0,
      reviewCount: 0,
      verified: true,
      skinType: newProduct.skinType,
      concerns: newProduct.concerns,
    });

    toast.success("محصول با موفقیت اضافه شد", {
      description: `"${newProduct.title}" به فروشگاه شما اضافه شد.`,
    });

    setNewProduct({ title: "", brand: "", price: "", image: "", skinType: [], concerns: [] });
    setShowAddProduct(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <Header />

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        
        {/* هدر پنل فروشنده */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/50">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
              داشبورد مدیریت فروشندگان
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              خوش آمدید! وضعیت فروش، سفارشات و محصولات فروشگاه خود را مدیریت کنید.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              className="rounded-full gap-2 text-xs font-medium cursor-pointer"
              onClick={() => setShowAddProduct(true)}
            >
              <Plus className="h-4 w-4" />
              افزودن محصول جدید
            </Button>
          </div>
        </div>

        {/* کارت‌های آمار و گزارشات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-card border border-border/50 rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">{stat.title}</span>
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-foreground" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                    {stat.value}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] mt-1 text-muted-foreground">
                    <TrendingUp className={`h-3.5 w-3.5 ${stat.isPositive ? "text-emerald-500" : "text-amber-500"}`} />
                    <span className={stat.isPositive ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* بخش مدیریت سفارشات و محصولات */}
        <div className="bg-card border border-border/50 rounded-3xl p-6 space-y-6 shadow-sm">
          
          {/* سربرگ تب‌ها و جستجو */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTab("orders")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedTab === "orders" ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                آخرین سفارشات ({toPersianDigits(orders.length)})
              </button>
              <button
                onClick={() => setSelectedTab("products")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedTab === "products" ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                لیست محصولات ({toPersianDigits(products.length)})
              </button>
              <button
                onClick={() => setSelectedTab("bookings")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedTab === "bookings" ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                رزروها ({toPersianDigits(bookings.length)})
              </button>
            </div>

            {/* کادر جستجو */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="جستجوی کد سفارش یا خریدار..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-9 py-2 bg-secondary/30 border border-border/50 rounded-full text-xs focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* جدول سفارشات */}
          {selectedTab === "orders" ? (
            <div className="overflow-x-auto">
              {orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs space-y-3">
                  <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground/50" />
                  <p>هنوز سفارشی ثبت نشده است.</p>
                  <p className="text-[11px]">وقتی خریداران از فروشگاه شما خرید کنند، سفارشات اینجا نمایش داده می‌شوند.</p>
                </div>
              ) : (
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground font-medium bg-secondary/20 rounded-xl">
                      <th className="p-3.5 rounded-r-xl">کد سفارش</th>
                      <th className="p-3.5">نام خریدار</th>
                      <th className="p-3.5">محصولات</th>
                      <th className="p-3.5">مبلغ کل</th>
                      <th className="p-3.5">تاریخ ثبت</th>
                      <th className="p-3.5">وضعیت</th>
                      <th className="p-3.5 rounded-l-xl text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {orders
                      .filter(o => 
                        o.customerName.includes(searchTerm) || 
                        o.id.includes(searchTerm) || 
                        o.items.some(item => item.title.includes(searchTerm))
                      )
                      .map((order) => (
                        <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-3.5 font-mono font-semibold text-primary">{order.id}</td>
                          <td className="p-3.5 font-medium">{order.customerName}</td>
                          <td className="p-3.5 text-foreground/80 max-w-xs truncate">
                            {order.items.map((item) => item.title).join("، ")}
                          </td>
                          <td className="p-3.5 font-bold">{formatPrice(order.totalPrice)}</td>
                          <td className="p-3.5 text-muted-foreground">{order.date}</td>
                          <td className="p-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
                              order.status === "processing" 
                                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                : order.status === "shipped"
                                ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                                : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            }`}>
                              {order.status === "processing" && <Clock className="h-3 w-3" />}
                              {order.status === "shipped" && <Truck className="h-3 w-3" />}
                              {order.status === "delivered" && <CheckCircle2 className="h-3 w-3" />}
                              {order.statusText}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <Button variant="ghost" size="sm" className="h-7 text-[11px] rounded-full cursor-pointer">
                              جزئیات
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {products.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs space-y-3">
                  <Package className="h-10 w-10 mx-auto text-muted-foreground/50" />
                  <p>هنوز محصولی اضافه نشده است.</p>
                  <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => setShowAddProduct(true)}>
                    افزودن اولین محصول
                  </Button>
                </div>
              ) : (
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground font-medium bg-secondary/20 rounded-xl">
                      <th className="p-3.5 rounded-r-xl">تصویر</th>
                      <th className="p-3.5">نام محصول</th>
                      <th className="p-3.5">برند</th>
                      <th className="p-3.5">قیمت</th>
                      <th className="p-3.5">امتیاز</th>
                      <th className="p-3.5 rounded-l-xl">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {products
                      .filter(p => p.title.includes(searchTerm) || p.brand.includes(searchTerm))
                      .map((product) => (
                        <tr key={product.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-3.5">
                            <div className="w-10">
                              <ProductImage
                                src={product.image}
                                alt={product.title}
                                seed={product.id}
                                rounded="lg"
                              />
                            </div>
                          </td>
                          <td className="p-3.5 font-medium max-w-xs truncate">{product.title}</td>
                          <td className="p-3.5 text-muted-foreground">{product.brand}</td>
                          <td className="p-3.5 font-bold">{formatPrice(product.price)}</td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span>{toPersianDigits(product.rating.toFixed(1))}</span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              <CheckCircle2 className="h-3 w-3" />
                              فعال
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* جدول رزروها */}
          {selectedTab === "bookings" && (
            <div className="overflow-x-auto">
              {bookings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs space-y-3">
                  <CalendarHeart className="h-10 w-10 mx-auto text-muted-foreground/50" />
                  <p>هنوز رزروی ثبت نشده است.</p>
                  <p className="text-[11px]">وقتی مشتریان نوبت رزرو کنند، اینجا نمایش داده می‌شوند.</p>
                </div>
              ) : (
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground font-medium bg-secondary/20 rounded-xl">
                      <th className="p-3.5 rounded-r-xl">شماره رزرو</th>
                      <th className="p-3.5">نام مشتری</th>
                      <th className="p-3.5">خدمت</th>
                      <th className="p-3.5">تاریخ</th>
                      <th className="p-3.5">ساعت</th>
                      <th className="p-3.5">مبلغ</th>
                      <th className="p-3.5 rounded-l-xl">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {bookings
                      .filter(b =>
                        b.customerName.includes(searchTerm) ||
                        b.id.includes(searchTerm) ||
                        b.serviceName.includes(searchTerm)
                      )
                      .map((booking) => (
                        <tr key={booking.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-3.5 font-mono font-semibold text-primary">{booking.id}</td>
                          <td className="p-3.5 font-medium">{booking.customerName}</td>
                          <td className="p-3.5 text-foreground/80">{booking.serviceName}</td>
                          <td className="p-3.5 text-muted-foreground">{booking.date}</td>
                          <td className="p-3.5 text-muted-foreground">{booking.time}</td>
                          <td className="p-3.5 font-bold">{toPersianDigits(booking.price.toLocaleString("en-US"))} تومان</td>
                          <td className="p-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
                              booking.status === "در انتظار تایید"
                                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                : booking.status === "تایید شده"
                                ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                                : booking.status === "انجام شده"
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-600 border border-red-500/20"
                            }`}>
                              {booking.status === "در انتظار تایید" && <Clock className="h-3 w-3" />}
                              {booking.status === "تایید شده" && <CheckCircle2 className="h-3 w-3" />}
                              {booking.status === "انجام شده" && <CheckCircle2 className="h-3 w-3" />}
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>

      </main>

        {/* مودال افزودن محصول جدید */}
        <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
          {/* تغییر ۱: اضافه کردن max-h-[90vh] و flex flex-col */}
          <DialogContent className="sm:max-w-lg p-0 overflow-hidden flex flex-col max-h-[90vh]" dir="rtl">
            {/* تغییر ۲: اضافه کردن shrink-0 تا هدر فشرده نشود */}
            <DialogHeader className="p-6 pb-0 shrink-0">
              <DialogTitle className="text-lg font-bold" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                افزودن محصول جدید
              </DialogTitle>
            </DialogHeader>

            {/* تغییر ۳: اضافه کردن overflow-y-auto و flex-1 برای فعال شدن اسکرول */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="space-y-2">
                <Label className="text-xs font-medium">نام محصول *</Label>
                <Input
                  placeholder="مثال: سرم ویتامین C ۲۰٪"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="h-11 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">نام برند *</Label>
                <Input
                  placeholder="مثال: گلو لب (Glow Lab)"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  className="h-11 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">قیمت (هزار تومان) *</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="مثال: ۴۵"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: normalizeNumericInput(e.target.value) })
                  }
                  className="h-11 rounded-xl text-sm"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">لینک تصویر محصول (اختیاری)</Label>
                <Input
                  placeholder="https://..."
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="h-11 rounded-xl text-sm"
                  dir="ltr"
                />
                <p className="text-[11px] text-muted-foreground">
                  اگر خالی بگذارید، تصویر پیش‌فرض استفاده می‌شود.
                </p>
              </div>

              {/* نوع پوست مناسب */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">نوع پوست مناسب</Label>
                <div className="flex flex-wrap gap-2">
                  {SKIN_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        const current = newProduct.skinType;
                        setNewProduct({
                          ...newProduct,
                          skinType: current.includes(type)
                            ? current.filter((t) => t !== type)
                            : [...current, type],
                        });
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                        newProduct.skinType.includes(type)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary/30 text-muted-foreground border-border/50 hover:border-border"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* دغدغه‌های پوستی */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">دغدغه‌های پوستی مرتبط</Label>
                <div className="flex flex-wrap gap-2">
                  {CONCERNS.map((concern) => (
                    <button
                      key={concern}
                      type="button"
                      onClick={() => {
                        const current = newProduct.concerns;
                        setNewProduct({
                          ...newProduct,
                          concerns: current.includes(concern)
                            ? current.filter((c) => c !== concern)
                            : [...current, concern],
                        });
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                        newProduct.concerns.includes(concern)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary/30 text-muted-foreground border-border/50 hover:border-border"
                      }`}
                    >
                      {concern}
                    </button>
                  ))}
                </div>
              </div>

              {/* دکمه‌های تایید و انصراف (حالا دیگه زیر صفحه نمیرن) */}
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 rounded-xl h-11 text-sm font-semibold cursor-pointer"
                  onClick={handleAddProduct}
                >
                  <Plus className="h-4 w-4 ml-2" />
                  ثبت محصول
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl h-11 text-sm cursor-pointer"
                  onClick={() => setShowAddProduct(false)}
                >
                  انصراف
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
}