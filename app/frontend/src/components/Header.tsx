import { useState } from "react";
import { Search, User, Filter, Menu, X, CalendarHeart, Home, Store, LayoutDashboard, LogOut, Settings, Package } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import CartSidebar from "@/components/CartSidebar";
import AuthModal from "@/components/AuthModal";
import { useAuthStore } from "@/store/authStore";

const navLinks = [
  { label: "خانه", path: "/", icon: Home },
  { label: "فروشگاه", path: "/#products", icon: Store },
  // لینک داشبورد فروشنده موقتاً برای تایید اینماد مخفی شده است
  // { label: "داشبورد فروشنده", path: "/seller-dashboard", icon: LayoutDashboard },
];

export default function Header() {
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path.startsWith("/#")) return location.pathname === "/" && location.hash === path.slice(1);
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate("/")}>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
              <span className="text-primary">گلو</span>
              <span className="text-foreground/80"> مارکت</span>
            </h1>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Button
                key={link.path}
                variant="ghost"
                size="sm"
                className={`rounded-full text-sm font-medium cursor-pointer transition-colors ${
                  isActive(link.path)
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
                onClick={() => {
                  if (link.path.startsWith("/#")) {
                    navigate("/");
                    setTimeout(() => {
                      const el = document.getElementById(link.path.slice(2));
                      el?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  } else {
                    navigate(link.path);
                  }
                }}
              >
                <link.icon className="h-3.5 w-3.5 ml-1.5" />
                {link.label}
              </Button>
            ))}
            {/* Prominent Book Services button */}
            <Button
              size="sm"
              className="rounded-full text-sm font-medium cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm mr-1"
              onClick={() => navigate("/booking")}
            >
              <CalendarHeart className="h-3.5 w-3.5 ml-1.5" />
              رزرو خدمات
            </Button>
          </nav>

          {/* Search bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجوی محصولات، برندها..."
                className="pr-10 pl-4 h-10 bg-secondary/50 border-border/50 rounded-full focus-visible:ring-primary/30"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-secondary cursor-pointer"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile search trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-full cursor-pointer">
                  <Search className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="pt-12">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="جستجوی محصولات..."
                      className="pr-10 pl-4 h-11 rounded-full bg-secondary/50"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <Select>
                      <SelectTrigger className="rounded-full text-right" dir="rtl">
                        <SelectValue placeholder="نوع پوست" />
                      </SelectTrigger>
                      <SelectContent dir="rtl">
                        <SelectItem value="oily">چرب</SelectItem>
                        <SelectItem value="dry">خشک</SelectItem>
                        <SelectItem value="combination">مختلط</SelectItem>
                        <SelectItem value="sensitive">حساس</SelectItem>
                        <SelectItem value="normal">معمولی</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="rounded-full text-right" dir="rtl">
                        <SelectValue placeholder="نوع مو" />
                      </SelectTrigger>
                      <SelectContent dir="rtl">
                        <SelectItem value="straight">صاف</SelectItem>
                        <SelectItem value="wavy">موج‌دار</SelectItem>
                        <SelectItem value="curly">فر</SelectItem>
                        <SelectItem value="coily">خیلی فر / وز</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="rounded-full text-right" dir="rtl">
                        <SelectValue placeholder="دسته‌بندی" />
                      </SelectTrigger>
                      <SelectContent dir="rtl">
                        <SelectItem value="skincare">مراقبت از پوست</SelectItem>
                        <SelectItem value="makeup">لوازم آرایشی</SelectItem>
                        <SelectItem value="haircare">مراقبت از مو</SelectItem>
                        <SelectItem value="fragrance">عطر و ادکلن</SelectItem>
                        <SelectItem value="bodycare">مراقبت از بدن</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Auth: Login button or Profile dropdown */}
            {isAuthenticated ? (
              <DropdownMenu dir="rtl">
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 rounded-full hover:bg-secondary cursor-pointer gap-1.5 px-3">
                    <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="hidden sm:inline text-xs font-medium text-foreground/80">
                      پروفایل من
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48" dir="rtl">
                  <div className="px-3 py-2 border-b border-border/50">
                    <p className="text-xs font-semibold">{user?.name}</p>
                    <p className="text-[11px] text-muted-foreground" dir="ltr">{user?.phone}</p>
                  </div>
                  <DropdownMenuItem className="cursor-pointer gap-2 text-xs" onClick={() => navigate("/profile")}>
                    <Package className="h-3.5 w-3.5" />
                    سفارش‌های من
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer gap-2 text-xs" onClick={() => navigate("/profile")}>
                    <Settings className="h-3.5 w-3.5" />
                    پروفایل من
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive"
                    onClick={logout}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    خروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <AuthModal />
            )}
            <CartSidebar />

            {/* Mobile hamburger menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 rounded-full cursor-pointer">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile menu header */}
                  <div className="p-5 border-b border-border/50">
                    <h2 className="text-xl font-bold" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                      <span className="text-primary">گلو</span>
                      <span className="text-foreground/80"> مارکت</span>
                    </h2>
                  </div>

                  {/* Mobile nav links */}
                  <nav className="flex-1 p-4 space-y-1">
                    {navLinks.map((link) => (
                      <SheetClose key={link.path} asChild>
                        <button
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                            isActive(link.path)
                              ? "bg-secondary text-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                          }`}
                          onClick={() => {
                            if (link.path.startsWith("/#")) {
                              navigate("/");
                              setTimeout(() => {
                                const el = document.getElementById(link.path.slice(2));
                                el?.scrollIntoView({ behavior: "smooth" });
                              }, 100);
                            } else {
                              navigate(link.path);
                            }
                          }}
                        >
                          <link.icon className="h-4 w-4" />
                          {link.label}
                        </button>
                      </SheetClose>
                    ))}

                    {/* Prominent Book Services in mobile */}
                    <SheetClose asChild>
                      <button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-sm mt-2"
                        onClick={() => navigate("/booking")}
                      >
                        <CalendarHeart className="h-4 w-4" />
                        رزرو خدمات
                      </button>
                    </SheetClose>
                  </nav>

                  {/* Mobile menu footer */}
                  <div className="p-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground text-center">
                      © ۲۰۲۶ گلو مارکت
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Filter bar - Desktop */}
        {showFilters && (
          <div className="hidden md:flex items-center gap-3 pb-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <Select>
              <SelectTrigger className="w-[150px] rounded-full h-9 text-sm text-right" dir="rtl">
                <SelectValue placeholder="نوع پوست" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="oily">چرب</SelectItem>
                <SelectItem value="dry">خشک</SelectItem>
                <SelectItem value="combination">مختلط</SelectItem>
                <SelectItem value="sensitive">حساس</SelectItem>
                <SelectItem value="normal">معمولی</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[150px] rounded-full h-9 text-sm text-right" dir="rtl">
                <SelectValue placeholder="نوع مو" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="straight">صاف</SelectItem>
                <SelectItem value="wavy">موج‌دار</SelectItem>
                <SelectItem value="curly">فر</SelectItem>
                <SelectItem value="coily">خیلی فر / وز</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[150px] rounded-full h-9 text-sm text-right" dir="rtl">
                <SelectValue placeholder="دسته‌بندی" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="skincare">مراقبت از پوست</SelectItem>
                <SelectItem value="makeup">لوازم آرایشی</SelectItem>
                <SelectItem value="haircare">مراقبت از مو</SelectItem>
                <SelectItem value="fragrance">عطر و ادکلن</SelectItem>
                <SelectItem value="bodycare">مراقبت از بدن</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => setShowFilters(false)}
            >
              <X className="h-3 w-3 ml-1" />
              بستن
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}