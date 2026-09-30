import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Star,
  Clock,
  Calendar,
  User,
  CreditCard,
  Scissors,
  Zap,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toJalaali, toGregorian, jalaaliMonthLength } from "jalaali-js";
import { useDataStore } from "@/store/dataStore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

// ─── Data ────────────────────────────────────────────────────────────────────

interface Service {
  id: number;
  name: string;
  price: number;
  icon: React.ReactNode;
  description: string;
}

interface Specialist {
  id: number;
  name: string;
  photo: string;
  rating: number;
  specialty: string;
}

const services: Service[] = [
  {
    id: 1,
    name: "پاکسازی عمیق پوست",
    price: 850000,
    icon: <Sparkles className="h-5 w-5" />,
    description: "پاکسازی کامل منافذ و لایه‌برداری حرفه‌ای",
  },
  {
    id: 2,
    name: "لیزر موهای زائد",
    price: 1200000,
    icon: <Zap className="h-5 w-5" />,
    description: "لیزر با دستگاه‌های پیشرفته و بدون درد",
  },
  {
    id: 3,
    name: "مشاوره روتین مراقبت پوست",
    price: 450000,
    icon: <Heart className="h-5 w-5" />,
    description: "تحلیل پوست و ارائه برنامه مراقبتی اختصاصی",
  },
  {
    id: 4,
    name: "اصلاح و طراحی ابرو",
    price: 350000,
    icon: <Scissors className="h-5 w-5" />,
    description: "طراحی ابرو متناسب با فرم صورت شما",
  },
];

const specialists: Specialist[] = [
  {
    id: 1,
    name: "دکتر سارا احمدی",
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
    rating: 4.9,
    specialty: "متخصص پوست و زیبایی",
  },
  {
    id: 2,
    name: "کلینیک گلو بیوتی",
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
    rating: 4.7,
    specialty: "مرکز تخصصی لیزر",
  },
  {
    id: 3,
    name: "مینا رضایی",
    photo: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face",
    rating: 4.8,
    specialty: "کارشناس مراقبت پوست",
  },
];

const timeSlots = ["۹:۰۰", "۱۰:۰۰", "۱۱:۳۰", "۱۳:۰۰", "۱۴:۳۰", "۱۶:۰۰", "۱۷:۳۰", "۱۹:۰۰"];

const persianMonths = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

const persianWeekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

function toPersianDigits(num: number | string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
}

function formatPrice(price: number): string {
  return toPersianDigits(price.toLocaleString("en-US"));
}

// ─── Jalali Calendar Component ───────────────────────────────────────────────

function JalaliCalendar({
  selectedDay,
  onSelectDay,
}: {
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}) {
  const today = new Date();
  const jToday = toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const jYear = jToday.jy;
  const jMonth = jToday.jm;
  const jDay = jToday.jd;

  // Get number of days in current Jalali month
  const daysInMonth = jalaaliMonthLength(jYear, jMonth);

  // Get the weekday of the first day of the month
  const firstDayGregorian = toGregorian(jYear, jMonth, 1);
  const firstDayDate = new Date(firstDayGregorian.gy, firstDayGregorian.gm - 1, firstDayGregorian.gd);
  // Saturday = 0 in Persian calendar
  let startWeekday = firstDayDate.getDay(); // 0=Sun
  // Convert to Saturday-based: Sat=0, Sun=1, Mon=2, ..., Fri=6
  startWeekday = (startWeekday + 1) % 7;

  const days: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  return (
    <div className="space-y-4">
      {/* Month header */}
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
          {persianMonths[jMonth - 1]} {toPersianDigits(jYear)}
        </h3>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {persianWeekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} />;
          }
          const isPast = day < jDay;
          const isToday = day === jDay;
          const isSelected = day === selectedDay;

          return (
            <button
              key={day}
              disabled={isPast}
              onClick={() => onSelectDay(day)}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 cursor-pointer
                ${isPast ? "text-muted-foreground/30 cursor-not-allowed" : ""}
                ${isToday && !isSelected ? "border border-primary/40 text-primary" : ""}
                ${isSelected ? "bg-primary text-primary-foreground shadow-sm" : ""}
                ${!isPast && !isSelected ? "hover:bg-primary/10" : ""}
              `}
              style={{ fontFamily: "'Vazirmatn', sans-serif" }}
            >
              {toPersianDigits(day)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ServiceBooking() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addBooking } = useDataStore();
  const { user } = useAuthStore();

  const steps = [
    { label: "انتخاب خدمت", icon: <Sparkles className="h-4 w-4" /> },
    { label: "انتخاب متخصص", icon: <User className="h-4 w-4" /> },
    { label: "تاریخ و ساعت", icon: <Calendar className="h-4 w-4" /> },
    { label: "تأیید نهایی", icon: <CreditCard className="h-4 w-4" /> },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0: return selectedService !== null;
      case 1: return selectedSpecialist !== null;
      case 2: return selectedDay !== null && selectedTime !== null;
      case 3: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  // Get Jalali date string for summary
  const getJalaliDateString = () => {
    if (!selectedDay) return "";
    const today = new Date();
    const jToday = toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return `${toPersianDigits(selectedDay)} ${persianMonths[jToday.jm - 1]} ${toPersianDigits(jToday.jy)}`;
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <span
            className="text-lg font-bold tracking-tight cursor-pointer"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            onClick={() => navigate("/")}
          >
            GlowMarket
          </span>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            بازگشت
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Stepper */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-5 right-0 left-0 h-0.5 bg-border/50 -z-10" />
          <div
            className="absolute top-5 right-0 h-0.5 bg-primary transition-all duration-500 -z-10"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  index < currentStep
                    ? "bg-primary border-primary text-primary-foreground"
                    : index === currentStep
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 bg-background text-muted-foreground"
                }`}
              >
                {index < currentStep ? <Check className="h-4 w-4" /> : step.icon}
              </div>
              <span
                className={`text-[11px] font-medium hidden sm:block ${
                  index <= currentStep ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-28">
        {/* Step 1: Select Service */}
        {currentStep === 0 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                خدمت مورد نظر خود را انتخاب کنید
              </h2>
              <p className="text-sm text-muted-foreground">از میان خدمات زیبایی حرفه‌ای ما انتخاب کنید</p>
            </div>

            <div className="grid gap-3">
              {services.map((service) => {
                const isSelected = selectedService?.id === service.id;
                return (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`w-full text-right p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/50 bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                      }`}>
                        {service.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm sm:text-base">{service.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-bold text-primary">
                          {formatPrice(service.price)}
                        </span>
                        <span className="text-xs text-muted-foreground mr-1">تومان</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Select Specialist */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold">متخصص خود را انتخاب کنید</h2>
              <p className="text-sm text-muted-foreground">بهترین متخصصان و کلینیک‌ها در دسترس شما</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {specialists.map((specialist) => {
                const isSelected = selectedSpecialist?.id === specialist.id;
                return (
                  <button
                    key={specialist.id}
                    onClick={() => setSelectedSpecialist(specialist)}
                    className={`p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer text-center ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/50 bg-card hover:border-primary/40"
                    }`}
                  >
                    <img
                      src={specialist.photo}
                      alt={specialist.name}
                      className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-border/30"
                    />
                    <h3 className="font-bold text-sm mt-3">{specialist.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{specialist.specialty}</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-medium">{toPersianDigits(specialist.rating)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Select Date & Time */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold">تاریخ و ساعت را انتخاب کنید</h2>
              <p className="text-sm text-muted-foreground">روز و ساعت مناسب خود را مشخص کنید</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Calendar */}
              <div className="p-5 rounded-xl border border-border/50 bg-card">
                <JalaliCalendar selectedDay={selectedDay} onSelectDay={setSelectedDay} />
              </div>

              {/* Time slots */}
              <div className="p-5 rounded-xl border border-border/50 bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm">ساعت‌های موجود</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((time) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-secondary/50 hover:bg-primary/10 text-foreground"
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Summary */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold">خلاصه رزرو</h2>
              <p className="text-sm text-muted-foreground">اطلاعات نوبت خود را بررسی و تأیید کنید</p>
            </div>

            <div className="p-6 rounded-2xl border border-border/50 bg-card space-y-5">
              {/* Service */}
              <div className="flex items-center justify-between pb-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">خدمت</p>
                    <p className="text-sm font-bold">{selectedService?.name}</p>
                  </div>
                </div>
              </div>

              {/* Specialist */}
              <div className="flex items-center justify-between pb-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedSpecialist?.photo}
                    alt={selectedSpecialist?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs text-muted-foreground">متخصص</p>
                    <p className="text-sm font-bold">{selectedSpecialist?.name}</p>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-center justify-between pb-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">تاریخ و ساعت</p>
                    <p className="text-sm font-bold">
                      {getJalaliDateString()} — ساعت {selectedTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium text-muted-foreground">مبلغ قابل پرداخت</span>
                <div className="text-left">
                  <span className="text-xl font-bold text-primary">
                    {selectedService ? formatPrice(selectedService.price) : "۰"}
                  </span>
                  <span className="text-sm text-muted-foreground mr-1">تومان</span>
                </div>
              </div>
            </div>

            {/* Confirm button */}
            <Button
              className="w-full h-13 rounded-full text-base font-bold cursor-pointer group"
              style={{ fontFamily: "'Vazirmatn', sans-serif" }}
              disabled={isSubmitting}
              onClick={() => {
                if (!selectedService || !selectedSpecialist || !selectedDay || !selectedTime) return;
                setIsSubmitting(true);
                setTimeout(() => {
                  addBooking({
                    serviceName: selectedService.name,
                    specialistName: selectedSpecialist.name,
                    specialistPhoto: selectedSpecialist.photo,
                    date: getJalaliDateString(),
                    time: selectedTime,
                    price: selectedService.price,
                    customerName: user?.name || "کاربر مهمان",
                    customerPhone: user?.phone || "---",
                    status: "در انتظار تایید",
                  });
                  toast.success("رزرو با موفقیت ثبت شد", {
                    description: `نوبت ${selectedService.name} نزد ${selectedSpecialist.name} ثبت شد.`,
                  });
                  setIsSubmitting(false);
                  navigate("/profile");
                }, 1000);
              }}
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin ml-2" />
              ) : (
                <CreditCard className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
              )}
              {isSubmitting ? "در حال ثبت..." : "تأیید و پرداخت"}
            </Button>
          </div>
        )}
      </main>

      {/* Navigation buttons (fixed bottom) — hidden on step 4 */}
      {currentStep < 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 px-4 sm:px-6 py-4 z-40">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="rounded-full px-5 h-10 text-sm font-medium cursor-pointer disabled:opacity-30"
              style={{ fontFamily: "'Vazirmatn', sans-serif" }}
            >
              قبلی
              <ArrowRight className="mr-2 h-4 w-4" />
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="rounded-full px-6 h-10 text-sm font-medium cursor-pointer disabled:opacity-40"
              style={{ fontFamily: "'Vazirmatn', sans-serif" }}
            >
              <ArrowLeft className="ml-2 h-4 w-4" />
              بعدی
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}