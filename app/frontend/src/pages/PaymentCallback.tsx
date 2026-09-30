import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Loader2,
  XCircle,
  AlertTriangle,
  Home,
  ShoppingBag,
  RefreshCw,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Header from "@/components/Header";
import { useCartStore } from "@/store/cartStore";
import { useDataStore } from "@/store/dataStore";
import {
  extractErrorMessage,
  verifyZarinpalPayment,
  type ZarinpalVerifyResult,
} from "@/lib/api";
import { toPersianDigits } from "@/lib/numerals";

const PENDING_KEY = "glowmarket-pending-payment";

interface PendingPayment {
  authority: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  deliveryMethod: string;
  amountToman: number;
}

/** Read the checkout snapshot saved right before redirecting to the gateway. */
function readPending(): PendingPayment | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as PendingPayment) : null;
  } catch {
    return null;
  }
}

/** Marker so a page refresh never creates the same order twice. */
function settledKey(authority: string): string {
  return `glowmarket-order-settled-${authority}`;
}

function formatToman(amount: number): string {
  return toPersianDigits(Math.round(amount).toLocaleString("en-US")) + " تومان";
}

type Phase = "verifying" | "success" | "failed" | "invalid";

export default function PaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);
  const addOrder = useDataStore((state) => state.addOrder);

  const [phase, setPhase] = useState<Phase>("verifying");
  const [result, setResult] = useState<ZarinpalVerifyResult | null>(null);
  const [message, setMessage] = useState("");

  // Zarinpal returns ?Authority=...&Status=OK|NOK
  const authority = searchParams.get("Authority") || searchParams.get("authority") || "";
  const status = searchParams.get("Status") || searchParams.get("status") || "";

  // Guard against React StrictMode double-invoke and any accidental re-run.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!authority) {
      setPhase("invalid");
      setMessage("اطلاعات بازگشت از درگاه پرداخت ناقص است.");
      return;
    }

    const verify = async () => {
      try {
        const data = await verifyZarinpalPayment(authority, status);
        setResult(data);
        setMessage(data.message);

        if (!data.success) {
          setPhase("failed");
          return;
        }

        // Record the order locally exactly once per authority.
        const alreadySettled = localStorage.getItem(settledKey(authority));
        if (!alreadySettled) {
          const pending = readPending();
          const now = new Date();
          const pad = (value: number) => String(value).padStart(2, "0");
          const persianDate = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(
            now.getDate(),
          )} - ${pad(now.getHours())}:${pad(now.getMinutes())}`;

          addOrder({
            items: data.items.map((item) => ({
              id: item.id,
              title: item.title,
              price: item.price,
              image: "",
              quantity: item.quantity,
            })),
            totalPrice: (data.amount_toman ?? pending?.amountToman ?? 0) / 1000,
            customerName: pending?.customerName || "کاربر گلومارکت",
            customerPhone: pending?.customerPhone || "نامشخص",
            status: "processing",
            statusText: "در حال پردازش",
            date: persianDate,
          });

          localStorage.setItem(settledKey(authority), "1");
          localStorage.removeItem(PENDING_KEY);
          clearCart();
        }

        setPhase("success");
      } catch (err) {
        setPhase("failed");
        setMessage(extractErrorMessage(err, "بررسی وضعیت پرداخت با خطا مواجه شد."));
      }
    };

    verify();
    // Intentionally run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyRefId = async () => {
    if (!result?.ref_id) return;
    try {
      await navigator.clipboard.writeText(result.ref_id);
      toast.success("شماره پیگیری کپی شد");
    } catch {
      toast.error("کپی کردن شماره پیگیری ممکن نبود");
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-12 sm:py-16">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-8 pb-8 space-y-6 text-center">
            {/* در حال بررسی */}
            {phase === "verifying" && (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-7 w-7 text-primary animate-spin" />
                </div>
                <div className="space-y-2">
                  <h1
                    className="text-lg font-bold"
                    style={{ fontFamily: "'Vazirmatn', sans-serif" }}
                  >
                    در حال بررسی پرداخت
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    لطفاً این صفحه را نبندید. نتیجه تراکنش در حال تأیید از درگاه زرین‌پال است.
                  </p>
                </div>
              </>
            )}

            {/* پرداخت موفق */}
            {phase === "success" && (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h1
                    className="text-lg font-bold text-green-700"
                    style={{ fontFamily: "'Vazirmatn', sans-serif" }}
                  >
                    پرداخت با موفقیت انجام شد
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result?.already_verified
                      ? "این تراکنش پیش‌تر تأیید شده بود و سفارش شما ثبت است."
                      : "از خرید شما متشکریم! سفارش شما ثبت شد و به‌زودی پردازش می‌شود."}
                  </p>
                </div>

                <Separator />

                <div className="space-y-3 text-right">
                  {result?.ref_id && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">شماره پیگیری (RefID)</span>
                      <button
                        type="button"
                        onClick={copyRefId}
                        className="flex items-center gap-1.5 text-sm font-bold text-primary cursor-pointer hover:opacity-80"
                        dir="ltr"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {toPersianDigits(result.ref_id)}
                      </button>
                    </div>
                  )}
                  {result?.order_code && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">کد سفارش</span>
                      <span className="text-sm font-semibold" dir="ltr">
                        {result.order_code}
                      </span>
                    </div>
                  )}
                  {typeof result?.amount_toman === "number" && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">مبلغ پرداخت‌شده</span>
                      <span className="text-sm font-bold text-primary">
                        {formatToman(result.amount_toman)}
                      </span>
                    </div>
                  )}
                  {result?.card_pan && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">کارت پرداخت</span>
                      <span className="text-sm font-medium" dir="ltr">
                        {toPersianDigits(result.card_pan)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    className="flex-1 rounded-xl cursor-pointer gap-2"
                    onClick={() => navigate("/profile")}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    مشاهده سفارش‌های من
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl cursor-pointer gap-2"
                    onClick={() => navigate("/")}
                  >
                    <Home className="h-4 w-4" />
                    بازگشت به فروشگاه
                  </Button>
                </div>
              </>
            )}

            {/* پرداخت ناموفق یا لغو شده */}
            {phase === "failed" && (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                  {result?.status === "cancelled" ? (
                    <AlertTriangle className="h-8 w-8 text-amber-600" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600" />
                  )}
                </div>
                <div className="space-y-2">
                  <h1
                    className="text-lg font-bold"
                    style={{ fontFamily: "'Vazirmatn', sans-serif" }}
                  >
                    {result?.status === "cancelled" ? "پرداخت لغو شد" : "پرداخت ناموفق بود"}
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {message || "تراکنش شما تکمیل نشد."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    سبد خرید شما دست‌نخورده باقی مانده و می‌توانید دوباره تلاش کنید. در صورت کسر
                    مبلغ، طی ۷۲ ساعت به حساب شما بازمی‌گردد.
                  </p>
                </div>

                {result?.order_code && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between gap-3 text-right">
                      <span className="text-xs text-muted-foreground">کد سفارش</span>
                      <span className="text-sm font-semibold" dir="ltr">
                        {result.order_code}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    className="flex-1 rounded-xl cursor-pointer gap-2"
                    onClick={() => navigate("/checkout")}
                  >
                    <RefreshCw className="h-4 w-4" />
                    تلاش دوباره
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl cursor-pointer gap-2"
                    onClick={() => navigate("/")}
                  >
                    <Home className="h-4 w-4" />
                    بازگشت به فروشگاه
                  </Button>
                </div>
              </>
            )}

            {/* پارامترهای نامعتبر */}
            {phase === "invalid" && (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                </div>
                <div className="space-y-2">
                  <h1
                    className="text-lg font-bold"
                    style={{ fontFamily: "'Vazirmatn', sans-serif" }}
                  >
                    اطلاعات پرداخت یافت نشد
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {message} این صفحه فقط پس از بازگشت از درگاه زرین‌پال معنا دارد.
                  </p>
                </div>
                <Button
                  className="w-full rounded-xl cursor-pointer gap-2"
                  onClick={() => navigate("/")}
                >
                  <Home className="h-4 w-4" />
                  بازگشت به فروشگاه
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}