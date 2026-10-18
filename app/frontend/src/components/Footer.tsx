import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { toPersianDigits } from "@/lib/numerals";

/** Support phone shown in the footer. Stored in ASCII, displayed in Persian digits. */
const LANDLINE_PHONE = "054-33291359";
const MOBILE_PHONE = "09907488203";
const SUPPORT_PHONE = "09017488203";
const POSTAL_CODE = "9818997001";
const SUPPORT_EMAIL = "ghavidelheidarei81@gmail.com";
const SUPPORT_ADDRESS = "استان : سیستان وبلوچستان - شهرستان : زاهدان - بخش : مرکزی - شهر : زاهدان - محله : شهرک جهاد - خیابان شهدای گمنام - کوچه میرمرادزهی11 - پلاک : 14.0 - طبقه : همکف";

const linkColumns: { header: string; links: { label: string; to: string }[] }[] = [
  {
    header: "درباره گلو مارکت",
    links: [
      { label: "درباره ما", to: "/about" },
      { label: "تماس با ما", to: "/contact" },
    ],
  },
  {
    header: "قوانین و پشتیبانی",
    links: [
      { label: "قوانین و مقررات", to: "/terms" },
      { label: "شرایط استرداد وجه", to: "/refund-policy" },
    ],
  },
];

export default function Footer() {
  const year = toPersianDigits(new Date().getFullYear());

  return (
    <footer
      dir="rtl"
      className="mt-16 border-t border-border/60 bg-gradient-to-b from-secondary/30 via-accent/20 to-secondary/40"
      style={{ fontFamily: "'Vazirmatn', sans-serif" }}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 text-right">
          
          {/* Brand block */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block cursor-pointer">
              <h2 className="text-2xl font-bold tracking-tight">
                <span className="text-primary">گلو</span>
                <span className="text-foreground/80"> مارکت</span>
              </h2>
            </Link>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground max-w-xs">
              فروشگاه تخصصی و مورد اعتماد شما برای خرید محصولات اصیل آرایشی، مراقبت از پوست
              و بهداشت فردی؛ همراه با مشاوره هوشمند پوست و رزرو آنلاین خدمات زیبایی.
            </p>
            
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-background/70 border border-border/60 px-3 py-1.5 h-10">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-medium text-foreground/75">
                  تضمین اصالت کالا
                </span>
              </div>
              
              {/* کد اینماد - تبدیل شده به JSX */}
              <div className="bg-white p-1.5 rounded-xl border border-border/60 shadow-sm h-14 w-14 flex items-center justify-center hover:shadow-md transition-shadow">
                <a
                  referrerPolicy="origin"
                  target="_blank"
                  href="https://trustseal.enamad.ir/?id=7525354&Code=wd6gwPpNPEKtwcHMXYVBydg7y6OKRiVY"
                  rel="noreferrer"
                >
                  <img
                    referrerPolicy="origin"
                    src="https://trustseal.enamad.ir/logo.aspx?id=7525354&Code=wd6gwPpNPEKtwcHMXYVBydg7y6OKRiVY"
                    alt="نماد اعتماد الکترونیکی"
                    style={{ cursor: "pointer" }}
                    id="wd6gwPpNPEKtwcHMXYVBydg7y6OKRiVY"
                    className="w-full h-auto object-contain"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {linkColumns.map((column) => (
            <nav key={column.header} aria-label={column.header}>
              <h3 className="text-sm font-semibold text-foreground/85 mb-4 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary/70" />
                {column.header}
              </h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1.5 group"
                    >
                      <span className="h-1 w-1 rounded-full bg-primary/40 transition-all group-hover:w-2.5" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Contact information */}
          <div>
            <h3 className="text-sm font-semibold text-foreground/85 mb-4 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary/70" />
              اطلاعات تماس
            </h3>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-3 w-3 text-primary" />
                </span>
                <div>
                  <p className="text-[11px] text-muted-foreground/80">تلفن پشتیبانی</p>
                  <a href={	el:${LANDLINE_PHONE}} className="block text-xs font-medium text-foreground/85 hover:text-primary transition-colors cursor-pointer">تلفن ثابت: {toPersianDigits(LANDLINE_PHONE)}</a>
                  <a href={	el:${MOBILE_PHONE}} className="block text-xs font-medium text-foreground/85 hover:text-primary transition-colors cursor-pointer mt-1">همراه: {toPersianDigits(MOBILE_PHONE)} / {toPersianDigits(SUPPORT_PHONE)}</a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-3 w-3 text-primary" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground/80">ایمیل</p>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    dir="ltr"
                    className="block text-xs font-medium text-foreground/85 hover:text-primary transition-colors cursor-pointer break-all text-left"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-3 w-3 text-primary" />
                </span>
                <div>
                  <p className="text-[11px] text-muted-foreground/80">نشانی</p>
                  <p className="text-xs leading-relaxed text-foreground/85">
                    {toPersianDigits(SUPPORT_ADDRESS)}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-foreground/80">
                    کد پستی: {toPersianDigits(POSTAL_CODE)}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground text-center sm:text-right">
            © {year} گلو مارکت. تمامی حقوق محفوظ است.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/terms"
              className="text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              قوانین و مقررات
            </Link>
            <span className="h-3 w-px bg-border" />
            <Link
              to="/refund-policy"
              className="text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              شرایط استرداد وجه
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}