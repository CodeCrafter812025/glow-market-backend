import { useState, useEffect, useCallback } from "react";
import { Loader2, Phone, KeyRound, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import {
  digitsOnly,
  normalizePhoneInput,
  toPersianDigits,
  IRAN_MOBILE,
} from "@/lib/numerals";

interface AuthModalProps {
  /** If provided, the dialog is controlled externally */
  externalOpen?: boolean;
  /** Callback when the dialog closes (for external control) */
  onOpenChange?: (open: boolean) => void;
  /** If true, hide the trigger button (used when controlled externally) */
  hideTrigger?: boolean;
}

export default function AuthModal({ externalOpen, onOpenChange, hideTrigger }: AuthModalProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);

  const login = useAuthStore((state) => state.login);

  // Determine if controlled or uncontrolled
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) {
      onOpenChange?.(value);
    } else {
      setInternalOpen(value);
    }
  };

  // ریست کردن فرم هنگام باز/بسته شدن
  useEffect(() => {
    if (!open) {
      setStep(1);
      setPhone("");
      setOtp("");
      setError("");
      setLoading(false);
      setCountdown(120);
      setCanResend(false);
    }
  }, [open]);

  // تایمر شمارش معکوس
  useEffect(() => {
    if (step !== 2) return;
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  // اعتبارسنجی شماره موبایل ایرانی (ارقام فارسی/عربی هم پذیرفته می‌شود)
  const validatePhone = (value: string): boolean => {
    return IRAN_MOBILE.test(digitsOnly(value));
  };

  // ارسال کد تایید (مرحله ۱)
  const handleSendOtp = useCallback(() => {
    setError("");
    if (!validatePhone(phone)) {
      setError("شماره موبایل نامعتبر است");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      setCountdown(120);
      setCanResend(false);
    }, 1000);
  }, [phone]);

  // تایید کد OTP (مرحله ۲)
  const handleVerifyOtp = useCallback(() => {
    setError("");
    if (otp.length !== 4) {
      setError("کد تایید باید ۴ رقم باشد");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login(phone);
      setOpen(false);
    }, 1000);
  }, [otp, phone, login]);

  // ارسال مجدد کد
  const handleResend = () => {
    setCountdown(120);
    setCanResend(false);
    setOtp("");
    setError("");
  };

  // فرمت تایمر
  const formatTimer = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return toPersianDigits(`${m}:${s.toString().padStart(2, "0")}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs font-medium cursor-pointer border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
          >
            <Phone className="h-3.5 w-3.5 ml-1.5" />
            ورود | ثبت‌نام
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden"
        dir="rtl"
      >
        {/* هدر */}
        <DialogHeader className="p-6 pb-0">
          <DialogTitle
            className="text-center text-lg font-bold"
            style={{ fontFamily: "'Vazirmatn', sans-serif" }}
          >
            {step === 1 ? "ورود به گلو مارکت" : "تایید شماره موبایل"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* مرحله ۱: ورود شماره موبایل */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                لطفاً شماره موبایل خود را وارد کنید
              </p>

              <div className="space-y-2">
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    value={phone}
                    inputMode="numeric"
                    onChange={(e) => {
                      setPhone(normalizePhoneInput(e.target.value));
                      setError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendOtp();
                    }}
                    className="pr-10 pl-4 h-12 rounded-xl text-center text-base tracking-widest"
                    dir="ltr"
                    maxLength={11}
                  />
                </div>
                {error && (
                  <p className="text-xs text-destructive text-center animate-in fade-in">
                    {error}
                  </p>
                )}
              </div>

              <Button
                className="w-full h-12 rounded-xl text-sm font-semibold cursor-pointer"
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    در حال ارسال...
                  </>
                ) : (
                  "دریافت کد تایید"
                )}
              </Button>

              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                با ورود به گلو مارکت، شرایط استفاده و حریم خصوصی را می‌پذیرید.
              </p>
            </div>
          )}

          {/* مرحله ۲: ورود کد OTP */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">
                  کد تایید به شماره زیر ارسال شد:
                </p>
                <p className="text-sm font-bold tracking-wider" dir="ltr">
                  {phone}
                </p>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="- - - -"
                    value={otp}
                    onChange={(e) => {
                      const val = digitsOnly(e.target.value).slice(0, 4);
                      setOtp(val);
                      setError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleVerifyOtp();
                    }}
                    className="pr-10 pl-4 h-12 rounded-xl text-center text-xl tracking-[0.5em] font-bold"
                    dir="ltr"
                    maxLength={4}
                  />
                </div>
                {error && (
                  <p className="text-xs text-destructive text-center animate-in fade-in">
                    {error}
                  </p>
                )}
              </div>

              <Button
                className="w-full h-12 rounded-xl text-sm font-semibold cursor-pointer"
                onClick={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    در حال تایید...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                    تایید و ورود
                  </>
                )}
              </Button>

              {/* تایمر و ارسال مجدد */}
              <div className="text-center">
                {canResend ? (
                  <button
                    onClick={handleResend}
                    className="text-xs text-primary font-medium cursor-pointer hover:underline"
                  >
                    ارسال مجدد کد
                  </button>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    ارسال مجدد کد تا{" "}
                    <span className="font-bold text-foreground">
                      {formatTimer(countdown)}
                    </span>
                  </p>
                )}
              </div>

              {/* دکمه تغییر شماره */}
              <button
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError("");
                }}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                تغییر شماره موبایل
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}