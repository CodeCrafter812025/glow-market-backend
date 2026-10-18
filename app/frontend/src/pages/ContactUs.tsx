import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import InfoPageLayout, { InfoSection } from "@/components/InfoPageLayout";
import { toPersianDigits } from "@/lib/numerals";

const SUPPORT_PHONE = "054-33291359 | 09907488203 | 09017488203";
const SUPPORT_EMAIL = "ghavidelheidarei81@gmail.com";

const channels = [
  {
    icon: Phone,
    title: "تلفن پشتیبانی",
    value: toPersianDigits(SUPPORT_PHONE),
    href: `tel:${SUPPORT_PHONE}`,
    note: "شنبه تا پنجشنبه",
    ltr: false,
  },
  {
    icon: Mail,
    title: "ایمیل",
    value: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
    note: "پاسخ حداکثر تا یک روز کاری",
    ltr: true,
  },
];

const hours = [
  { day: "شنبه تا چهارشنبه", time: "9:00 تا 18:00" },
  { day: "پنجشنبه", time: "9:00 تا 13:00" },
  { day: "جمعه و روزهای تعطیل", time: "تعطیل" },
];

export default function ContactUs() {
  return (
    <InfoPageLayout
      title="تماس با ما"
      subtitle="برای پیگیری سفارش، پرسش درباره محصولات یا همکاری به عنوان فروشنده، از راه‌های زیر با تیم گلو مارکت در ارتباط باشید."
    >
      <InfoSection heading="راه‌های ارتباطی">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
          {channels.map((channel) => (
            <a
              key={channel.title}
              href={channel.href}
              className="block rounded-2xl border border-border/60 bg-secondary/25 p-5 transition-colors hover:border-primary/40 hover:bg-secondary/40 cursor-pointer"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <channel.icon className="h-4 w-4 text-primary" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{channel.title}</h3>
              <p
                className={`mt-1 text-sm font-medium text-primary break-all ${channel.ltr ? "text-left" : ""}`}
                dir={channel.ltr ? "ltr" : "rtl"}
              >
                {channel.value}
              </p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">{channel.note}</p>
            </a>
          ))}
        </div>
      </InfoSection>

      <InfoSection heading="نشانی">
        <div className="rounded-2xl border border-border/60 bg-accent/20 p-5 not-prose">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="h-4 w-4 text-primary" />
          </span>
          <p className="mt-3 text-sm leading-7 text-foreground/85">
            {toPersianDigits(
              "استان : سیستان وبلوچستان - شهرستان : زاهدان - بخش : مرکزی - شهر : زاهدان - محله : شهرک جهاد - خیابان شهدای گمنام - کوچه میرمرادزهی11 - پلاک : 14.0 - طبقه : همکف"
            )}
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            کد پستی: {toPersianDigits("9818997001")} — مراجعه حضوری تنها با هماهنگی تلفنی
            پیشین امکان‌پذیر است.
          </p>
        </div>
      </InfoSection>

      <InfoSection heading="ساعات پاسخ‌گویی">
        <div className="rounded-2xl border border-border/60 bg-secondary/25 overflow-hidden not-prose">
          {hours.map((row, index) => (
            <div
              key={row.day}
              className={`flex items-center justify-between gap-4 px-5 py-3.5 ${
                index > 0 ? "border-t border-border/50" : ""
              }`}
            >
              <span className="flex items-center gap-2 text-sm text-foreground/85">
                <Clock className="h-3.5 w-3.5 text-primary/70" />
                {row.day}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {toPersianDigits(row.time)}
              </span>
            </div>
          ))}
        </div>
      </InfoSection>

      <InfoSection heading="پیش از تماس">
        <p className="flex items-start gap-2">
          <MessageCircle className="mt-1 h-4 w-4 shrink-0 text-primary/70" />
          <span>
            اگر پرسش شما درباره یک سفارش مشخص است، لطفاً کد سفارش را آماده داشته باشید تا
            پیگیری سریع‌تر انجام شود. برای موضوع‌های مربوط به بازگشت وجه، ابتدا صفحه شرایط
            استرداد وجه را مطالعه کنید.
          </span>
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}