import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function AIRecommendation() {
  const navigate = useNavigate();

  return (
    <section className="w-full py-16 sm:py-20 bg-gradient-to-br from-primary/5 via-accent/20 to-secondary/30">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Right content (Text) */}
          <div className="flex-1 text-center md:text-right space-y-5">
            <div className="inline-flex items-center gap-2 text-primary bg-primary/10 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide">
              <Sparkles className="h-3.5 w-3.5" />
              قدرت‌گرفته از هوش مصنوعی
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
              شخصی‌سازی شده برای پوست شما
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto md:mx-0 leading-relaxed text-justify md:text-right">
              هوش مصنوعی ما پروفایل منحصربه‌فرد پوست شما را تحلیل می‌کند تا محصولاتی را پیشنهاد دهد که واقعاً برای شما کارساز هستند. دیگر نیازی به حدس زدن نیست — روتین زیبایی علمی و شخصی خود را دریافت کنید.
            </p>
            <Button
              className="rounded-full px-8 h-12 text-sm font-medium cursor-pointer group mt-2"
              onClick={() => navigate("/skin-quiz")}
            >
              <Sparkles className="ml-2 h-4 w-4 transition-transform group-hover:rotate-12" />
              شروع تست هوشمند پوست
            </Button>
          </div>

          {/* Left visual */}
          <div className="flex-1 max-w-sm w-full">
            <div className="relative">
              {/* Decorative circles */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent/30 rounded-full blur-xl" />

              {/* Card */}
              <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">آنالیز پوست</p>
                      <p className="text-xs text-muted-foreground">نتایج کاملاً شخصی‌سازی شده</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-primary">۷۸٪</span>
                      <span className="text-xs text-muted-foreground">میزان رطوبت</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full w-[78%] bg-primary/70 rounded-full" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-primary">۸۵٪</span>
                      <span className="text-xs text-muted-foreground">خاصیت ارتجاعی</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full w-[85%] bg-primary/70 rounded-full" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-primary">۳۲٪</span>
                      <span className="text-xs text-muted-foreground">میزان حساسیت</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full w-[32%] bg-primary/70 rounded-full" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                    پیشنهاد سیستم: سرم هیالورونیک اسید + شوینده ملایم
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
