import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import InfoPageLayout, { InfoSection } from "@/components/InfoPageLayout";
import { toPersianDigits } from "@/lib/numerals";

const eligible = [
  "کالا آسیب‌دیده یا با بسته‌بندی مخدوش تحویل داده شده باشد.",
  "کالای ارسالی با محصول ثبت‌شده در سفارش مغایرت داشته باشد.",
  "تاریخ انقضای محصول گذشته یا در آستانه پایان باشد.",
  "کالا پس از ثبت سفارش موجود نباشد و سفارش لغو شود.",
  "پلمب و بسته‌بندی اصلی محصول باز نشده باشد.",
];

const notEligible = [
  "محصولات آرایشی و بهداشتی که پلمب آن‌ها باز شده یا استفاده شده‌اند.",
  "اعلام مغایرت پس از گذشت بازه زمانی مجاز از تاریخ تحویل.",
  "آسیب ناشی از نگهداری نامناسب یا استفاده نادرست از محصول.",
  "عدم تمایل به محصول بدون وجود هیچ‌گونه ایراد فنی یا مغایرت.",
  "نبود بسته‌بندی، کارتن یا اقلام همراه محصول.",
];

const steps = [
  {
    title: "ثبت درخواست",
    text: "حداکثر تا 48 ساعت پس از تحویل، با پشتیبانی تماس بگیرید و کد سفارش را اعلام کنید.",
  },
  {
    title: "بررسی کارشناسی",
    text: "درخواست و مستندات ارسالی مانند تصویر کالا و بسته‌بندی، تا 3 روز کاری بررسی می‌شود.",
  },
  {
    title: "بازگرداندن کالا",
    text: "در صورت تأیید، کالا با بسته‌بندی اصلی و اقلام همراه عودت داده می‌شود.",
  },
  {
    title: "بازگشت وجه",
    text: "پس از تأیید سلامت کالای عودتی، مبلغ به همان روش پرداخت اولیه بازگردانده می‌شود.",
  },
];

export default function RefundPolicy() {
  return (
    <InfoPageLayout
      title="شرایط استرداد وجه"
      subtitle="این صفحه شرایط و مراحل بازگشت وجه در گلو مارکت را توضیح می‌دهد تا پیش از ثبت درخواست، از روند کار آگاه باشید."
    >
      <p className="mb-8 text-xs text-muted-foreground">
        آخرین بازنگری: {toPersianDigits("1405/06/02")}
      </p>

      <InfoSection heading="کلیات">
        <p>
          محصولات آرایشی، بهداشتی و مراقبت از پوست به دلیل ماهیت بهداشتی خود، شرایط ویژه‌ای
          برای مرجوعی دارند. به همین دلیل بازگشت وجه تنها در موارد مشخص و با رعایت بازه
          زمانی اعلام‌شده امکان‌پذیر است.
        </p>
      </InfoSection>

      <InfoSection heading="موارد قابل استرداد">
        <ul className="space-y-2.5 not-prose">
          {eligible.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm leading-7 text-muted-foreground">
              <CheckCircle2 className="mt-1.5 h-4 w-4 shrink-0 text-primary" />
              <span>{toPersianDigits(item)}</span>
            </li>
          ))}
        </ul>
      </InfoSection>

      <InfoSection heading="موارد غیرقابل استرداد">
        <ul className="space-y-2.5 not-prose">
          {notEligible.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm leading-7 text-muted-foreground">
              <XCircle className="mt-1.5 h-4 w-4 shrink-0 text-destructive/70" />
              <span>{toPersianDigits(item)}</span>
            </li>
          ))}
        </ul>
      </InfoSection>

      <InfoSection heading="مراحل ثبت درخواست">
        <ol className="space-y-3 not-prose">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="flex items-start gap-3.5 rounded-2xl border border-border/60 bg-secondary/25 p-4"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-bold text-primary">
                {toPersianDigits(index + 1)}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  {toPersianDigits(step.text)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </InfoSection>

      <InfoSection heading="زمان و روش بازگشت وجه">
        <p>
          در پرداخت‌های آنلاین، مبلغ تأییدشده به همان کارت یا حساب پرداخت‌کننده بازگردانده
          می‌شود و بسته به فرآیند بانکی معمولاً بین {toPersianDigits("3")} تا{" "}
          {toPersianDigits("7")} روز کاری زمان می‌برد. در سفارش‌های پرداخت در محل، مبلغ طبق
          هماهنگی با پشتیبانی به حساب اعلامی خریدار واریز می‌گردد.
        </p>
        <p>
          هزینه ارسال در مواردی که ایراد از سوی فروشنده یا گلو مارکت باشد، بازگردانده می‌شود.
        </p>
      </InfoSection>

      <InfoSection heading="سفارش لغوشده یا پرداخت ناموفق">
        <p className="flex items-start gap-2.5">
          <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-primary/70" />
          <span>
            اگر پرداخت شما در درگاه بانکی ناموفق بوده اما مبلغ از حساب کسر شده است، سفارش
            ثبت نمی‌شود و مبلغ طبق چرخه تسویه بانکی به‌صورت خودکار بازمی‌گردد. در صورت عدم
            بازگشت مبلغ، با در دست داشتن زمان تراکنش با پشتیبانی تماس بگیرید.
          </span>
        </p>
      </InfoSection>

      <InfoSection heading="پیگیری درخواست">
        <p>
          برای ثبت یا پیگیری درخواست استرداد، از راه‌های اعلام‌شده در صفحه{" "}
          <Link to="/contact" className="text-primary hover:underline cursor-pointer">
            تماس با ما
          </Link>{" "}
          با پشتیبانی در ارتباط باشید. این صفحه مکمل{" "}
          <Link to="/terms" className="text-primary hover:underline cursor-pointer">
            قوانین و مقررات
          </Link>{" "}
          است.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}