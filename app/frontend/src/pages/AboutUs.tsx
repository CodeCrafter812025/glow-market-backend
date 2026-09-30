import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Headphones,
  HeartHandshake,
  Leaf,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";
import Header from "@/components/Header";
import ProductImage from "@/components/ProductImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toPersianDigits } from "@/lib/numerals";

/**
 * Hero visual for the About page.
 * Rendered through the shared <ProductImage /> so a CDN failure falls back to a
 * clean on-brand image instead of leaving an empty banner block.
 */
const ABOUT_HERO_IMAGE =
  "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-08-24/vdcbltyaakhq/about-hero-authentic-beauty-pastel.png";

/** The three brand pillars, written as real marketing copy. */
const pillars = [
  {
    icon: BadgeCheck,
    eyebrow: `${toPersianDigits(100)}٪ اصالت کالا`,
    title: "هر محصول، دقیقاً همان چیزی که روی جعبه نوشته شده",
    paragraphs: [
      "بازار محصولات آرایشی و بهداشتی پر از کالای تقلبی است؛ محصولی که بسته‌بندی آن بی‌عیب به نظر می‌رسد اما فرمولاسیون درونش نه فقط بی‌اثر، بلکه برای پوست خطرناک است. ما گلو مارکت را ساختیم تا این نگرانی از خرید شما حذف شود.",
      "هر فروشنده پیش از انتشار نخستین محصول خود بررسی و تأیید می‌شود، مستندات تأمین کالا کنترل می‌گردد و اطلاعات هر محصول شامل ترکیبات، حجم و شرایط نگهداری به‌صورت شفاف در صفحه محصول قرار می‌گیرد. اگر کالایی مغایر با مشخصات اعلام‌شده به دست شما برسد، بدون بحث و توضیح اضافه پیگیری و جبران می‌شود.",
    ],
  },
  {
    icon: Store,
    eyebrow: "حمایت از برندهای مستقل ایرانی",
    title: "جایی برای برندهایی که حرف تازه‌ای دارند",
    paragraphs: [
      "سال‌هاست که قفسه‌های فروش در اختیار چند نام بزرگ جهانی است و برندهای کوچک ایرانی، هر چقدر هم که فرمولاسیون خوبی داشته باشند، فرصتی برای دیده شدن پیدا نمی‌کنند. تولیدکننده‌ای که با دانش داروسازی و مواد بومی محصولی باکیفیت می‌سازد، نباید تنها به دلیل نداشتن بودجه تبلیغات از بازار حذف شود.",
      "گلو مارکت عمداً در کنار برندهای شناخته‌شده، فضایی هم‌ارز برای سازندگان مستقل ایرانی فراهم می‌کند: صفحه فروشگاه اختصاصی، امکان معرفی داستان برند و حضور در همان نتایج پیشنهادی که برندهای بزرگ در آن دیده می‌شوند. خرید از این برندها، سرمایه‌گذاری روی تولید داخلی و تنوع واقعی بازار است.",
    ],
  },
  {
    icon: Sparkles,
    eyebrow: "پیشنهادهای شخصی‌سازی‌شده مراقبت از پوست",
    title: "پوست شما با پوست دیگری یکسان نیست",
    paragraphs: [
      "محبوب‌ترین محصول بازار، لزوماً مناسب پوست شما نیست. سرومی که برای پوست چرب معجزه می‌کند می‌تواند پوست خشک و حساس را تحریک کند. بیشتر ما این را با آزمون و خطا و هزینه‌های بی‌نتیجه یاد گرفته‌ایم.",
      "به همین دلیل تست پوست گلو مارکت را طراحی کردیم: چند پرسش کوتاه درباره نوع پوست، دغدغه‌های اصلی و هدف مراقبتی شما، و در پایان یک روتین پیشنهادی متناسب با همان پاسخ‌ها — نه فهرستی از پرفروش‌های عمومی. نتیجه، خریدی آگاهانه‌تر و مسیری کوتاه‌تر تا رسیدن به پوست سالم است.",
    ],
    cta: { label: "شروع تست پوست", to: "/skin-quiz" },
  },
];

/** Trust badges shown under the narrative. */
const trustBadges = [
  {
    icon: ShieldCheck,
    title: "تضمین اصالت کالا",
    description: "تأیید فروشنده و کنترل مستندات پیش از عرضه هر محصول.",
  },
  {
    icon: Truck,
    title: "ارسال سریع",
    description: "بسته‌بندی ایمن و ارسال در سریع‌ترین زمان ممکن به سراسر ایران.",
  },
  {
    icon: Headphones,
    title: "پشتیبانی اختصاصی",
    description: "همراهی تیم پشتیبانی از ثبت سفارش تا پس از تحویل کالا.",
  },
];

/** Small commitment list closing the page. */
const commitments = [
  {
    icon: Leaf,
    title: "شفافیت در ترکیبات",
    text: "ترکیبات و کاربرد هر محصول بدون اغراق تبلیغاتی بیان می‌شود.",
  },
  {
    icon: HeartHandshake,
    title: "احترام به انتخاب شما",
    text: "بدون فشار فروش؛ پیشنهاد می‌دهیم، تصمیم با شماست.",
  },
];

export default function AboutUs() {
  return (
    <div
      className="min-h-screen bg-background"
      dir="rtl"
      style={{ fontFamily: "'Vazirmatn', sans-serif" }}
    >
      <Header />

      <main>
        {/* Hero banner */}
        <section className="relative overflow-hidden bg-gradient-to-b from-accent/40 via-secondary/25 to-background border-b border-border/40">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              {/* Copy */}
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 border border-border/60 px-3.5 py-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-medium text-foreground/75">
                    بازارچه تخصصی زیبایی و مراقبت از پوست
                  </span>
                </span>

                <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-foreground">
                  کشف زیبایی اصیل و هوشمند
                </h1>

                <p className="mt-5 text-sm sm:text-base leading-8 text-muted-foreground max-w-xl">
                  گلو مارکت جایی است که اصالت کالا تضمین می‌شود، برندهای مستقل ایرانی دیده
                  می‌شوند و پیشنهادها بر اساس پوست شما ساخته می‌شود؛ نه بر اساس آنچه بیشتر
                  تبلیغ شده است.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="rounded-full cursor-pointer">
                    <Link to="/skin-quiz">شروع تست پوست</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full cursor-pointer !bg-transparent hover:!bg-transparent"
                  >
                    <Link to="/contact">تماس با ما</Link>
                  </Button>
                </div>
              </div>

              {/* Visual */}
              <div className="relative">
                <div className="absolute -inset-3 rounded-[2rem] bg-primary/8 blur-2xl" aria-hidden="true" />
                <ProductImage
                  src={ABOUT_HERO_IMAGE}
                  alt="محصولات مراقبت از پوست با نور نرم و رنگ‌های پاستلی"
                  className="relative aspect-[4/3] rounded-[1.75rem] border border-border/50 shadow-sm"
                  seed="about-us-hero"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Narrative — three pillars */}
        <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="max-w-2xl text-right">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
              ما بر سه اصل ساده ایستاده‌ایم
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              گلو مارکت با یک دغدغه روشن آغاز شد: خرید محصولات آرایشی و مراقبت از پوست در
              ایران نباید به حدس، آزمون و خطا و هزینه‌های بی‌نتیجه تبدیل شود.
            </p>
          </div>

          <div className="mt-12 space-y-12 sm:space-y-16">
            {pillars.map((pillar, index) => (
              <article
                key={pillar.eyebrow}
                className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 text-right"
              >
                {/* Marker column */}
                <div className="lg:col-span-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                      <pillar.icon className="h-5 w-5 text-primary" />
                    </span>
                    <div>
                      <p className="text-[11px] font-medium text-primary/80">
                        اصل {toPersianDigits(index + 1)}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold leading-snug text-foreground">
                        {pillar.eyebrow}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Body column */}
                <div className="lg:col-span-8 lg:border-r lg:border-border/50 lg:pr-8">
                  <h4 className="text-base sm:text-lg font-medium text-foreground/90">
                    {pillar.title}
                  </h4>
                  <div className="mt-3 space-y-3.5">
                    {pillar.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-8 text-muted-foreground">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {pillar.cta && (
                    <Button
                      asChild
                      variant="ghost"
                      className="mt-4 rounded-full px-4 text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                    >
                      <Link to={pillar.cta.to}>
                        {pillar.cta.label}
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Trust badges */}
        <section className="bg-gradient-to-b from-secondary/30 via-accent/20 to-secondary/25 border-y border-border/40">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                خیال شما راحت باشد
              </h2>
              <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto leading-7">
                از لحظه‌ای که سفارش خود را ثبت می‌کنید تا زمانی که محصول را در دست دارید،
                کنار شما هستیم.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5">
              {trustBadges.map((badge) => (
                <Card
                  key={badge.title}
                  className="border-border/60 bg-background/70 shadow-none transition-colors hover:border-primary/40"
                >
                  <CardContent className="pt-6 text-center">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <badge.icon className="h-6 w-6 text-primary" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-foreground">
                      {badge.title}
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-muted-foreground">
                      {badge.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Commitments + closing CTA */}
        <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start text-right">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                تعهد ما به شما
              </h2>
              <div className="mt-6 space-y-5">
                {commitments.map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <item.icon className="h-4 w-4 text-primary" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-xs leading-6 text-muted-foreground">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-border/60 bg-secondary/25 p-7 sm:p-9">
              <h3 className="text-xl font-semibold text-foreground">
                برند یا فروشگاه دارید؟
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                اگر در حوزه زیبایی و مراقبت از پوست فعال هستید، می‌توانید محصولات خود را در
                گلو مارکت عرضه کنید و در کنار برندهای معتبر دیده شوید.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="rounded-full cursor-pointer">
                  <Link to="/seller-dashboard">داشبورد فروشنده</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full cursor-pointer !bg-transparent hover:!bg-transparent"
                >
                  <Link to="/contact">گفت‌وگو با تیم ما</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        {/* Enamad ID */}
        <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <p className="text-xs text-muted-foreground text-center">
            شناسه نماد اعتماد الکترونیکی: 207216824
          </p>
        </section>
      </main>
    </div>
  );
}