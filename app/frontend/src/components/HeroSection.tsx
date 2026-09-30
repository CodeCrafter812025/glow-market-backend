import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface HeroSectionProps {
  heroImage: string;
}

export default function HeroSection({ heroImage }: HeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="محصولات لوکس زیبایی که با ظرافت روی سطح مرمر چیده شده‌اند"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-background/90 via-background/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="max-w-lg space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
          <span className="inline-block text-xs font-medium tracking-widest uppercase text-primary/80 bg-primary/10 px-3 py-1 rounded-full">
            زیبایی دست‌چین‌شده
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.2]" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
            کشف برندهای آرایشی <span className="text-primary">بومی و اصیل</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed">
            خرید محصولات پریمیوم مراقبت از پوست، لوازم آرایش و بهداشت فردی از تولیدکنندگان معتبر و برندهای قابل اعتماد ایرانی.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button className="rounded-full px-6 h-11 text-sm font-medium cursor-pointer group">
              همین حالا خرید کنید
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            </Button>
            <Button variant="outline" className="rounded-full px-6 h-11 text-sm font-medium cursor-pointer">
              گشت‌وگذار در برندها
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
