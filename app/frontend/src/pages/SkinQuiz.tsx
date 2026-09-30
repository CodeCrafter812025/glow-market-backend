import { useState } from "react";
import { Sparkles, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ResultPage from "@/components/ResultPage";
import { getRecommendedProducts, type QuizAnswers, type ScoredProduct } from "@/data/initialData";

interface Question {
  id: number;
  title: string;
  subtitle: string;
  options: { label: string; value: string; desc?: string }[];
}

const questions: Question[] = [
  {
    id: 1,
    title: "نوع پوست خود را چگونه ارزیابی می‌کنید؟",
    subtitle: "این سوال به ما کمک می‌کند فرمولاسیون پایه مناسب پوست شما را پیدا کنیم.",
    options: [
      { label: "چرب", value: "چرب", desc: "برق افتادن مداوم و منافذ قابل مشاهده" },
      { label: "خشک", value: "خشک", desc: "احساس کشیدگی، پوسته پوسته شدن یا زبری" },
      { label: "مختلط", value: "مختلط", desc: "چرب در ناحیه T (پیشانی و بینی) و معمولی/خشک در گونه‌ها" },
      { label: "معمولی", value: "معمولی", desc: "متعادل، بدون چربی یا خشکی افراطی" },
    ],
  },
  {
    id: 2,
    title: "دغدغه و نگرانی اصلی شما برای پوستتان چیست؟",
    subtitle: "می‌توانید مهم‌ترین اولویت خود را انتخاب کنید.",
    options: [
      { label: "جوش و آکنه", value: "جوش", desc: "کنترل چربی و درمان جوش‌های فعال و سرسیاه" },
      { label: "چین و چروک و خطوط ریز", value: "چروک", desc: "جوان‌سازی، لیفت و افزایش خاصیت ارتجاعی" },
      { label: "لک، تیرگی و عدم یکنواختی رنگ پوست", value: "لک", desc: "روشن‌کننده و شفاف‌کننده پوست" },
      { label: "خشکی شدید و دهیدراته بودن", value: "آبرسانی", desc: "آبرسانی عمیق و ترمیم سد دفاعی پوست" },
      { label: "منافذ باز و بافت ناهموار", value: "منافذ باز", desc: "مات‌کننده و صاف‌کننده سطح پوست" },
    ],
  },
  {
    id: 3,
    title: "روزانه چقدر در معرض نور خورشید یا آلودگی هوا هستید؟",
    subtitle: "عوامل محیطی نقش مهمی در انتخاب ترکیبات آنتی‌اکسیدانی دارند.",
    options: [
      { label: "کم (بیشتر روز در فضای بسته هستم)", value: "low" },
      { label: "متوسط (پیاده‌روی روزانه یا رفت‌وآمد کاری)", value: "medium" },
      { label: "زیاد (فعالیت یا ورزش مداوم در فضای باز)", value: "high" },
    ],
  },
  {
    id: 4,
    title: "پوست شما چقدر به محصولات آرایشی و مراقبتی جدید واکنش نشان می‌دهد؟",
    subtitle: "برای سنجش میزان تحمل‌پذیری پوست شما.",
    options: [
      { label: "به‌ندرت دچار حساسیت می‌شوم", value: "rarely" },
      { label: "گاهی اوقات با برخی ترکیبات خارش یا قرمزی دارم", value: "sometimes" },
      { label: "همیشه (پوستم بسیار واکنش‌پذیر و حساس است)", value: "always" },
    ],
  },
  {
    id: 5,
    title: "هدف نهایی شما از روتین پوستی جدید چیست؟",
    subtitle: "نتیجه‌ای که بیش از همه دوست دارید در آینه ببینید.",
    options: [
      { label: "پوست درخشان، شاداب و طبیعی (Glowy)", value: "glow" },
      { label: "پوست مات و بدون چربی اضافه", value: "matte" },
      { label: "پوست کاملاً نرم، مرطوب و پر حجم", value: "hydrated" },
      { label: "پوست صاف، یکدست و بدون لک", value: "clear" },
    ],
  },
];

export default function SkinQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<ScoredProduct[]>([]);

  const currentQuestion = questions[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / questions.length) * 100);

  const handleSelectOption = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // فرآیند آنالیز هوش مصنوعی
      setIsAnalyzing(true);
      setTimeout(() => {
        // ساخت آبجکت پاسخ‌ها و اجرای موتور پیشنهاد
        const quizAnswers: QuizAnswers = {
          skinType: answers[1] || "",
          concern: answers[2] || "",
          sunExposure: answers[3] || "",
          sensitivity: answers[4] || "",
          goal: answers[5] || "",
        };
        const results = getRecommendedProducts(quizAnswers);
        setRecommendedProducts(results);
        setIsAnalyzing(false);
        setIsComplete(true);
      }, 2500);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setIsComplete(false);
    setIsAnalyzing(false);
    setRecommendedProducts([]);
  };

  // ساخت آبجکت پاسخ‌ها برای ارسال به ResultPage
  const quizAnswers: QuizAnswers = {
    skinType: answers[1] || "",
    concern: answers[2] || "",
    sunExposure: answers[3] || "",
    sensitivity: answers[4] || "",
    goal: answers[5] || "",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <Header />

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-8 sm:py-12">
        {/* حالت در حال آنالیز */}
        {isAnalyzing && (
          <div className="max-w-screen-md mx-auto text-center py-16 space-y-6 animate-in fade-in duration-500">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                هوش مصنوعی در حال تحلیل پاسخ‌های شماست...
              </h2>
              <p className="text-sm text-muted-foreground">
                مقایسه الگوی پوستی شما با بیش از ۱۰,۰۰۰ ترکیب فعال آرایشی و بهداشتی
              </p>
            </div>
          </div>
        )}

        {/* حالت نمایش نتایج — کامپوننت جدید ResultPage */}
        {isComplete && !isAnalyzing && (
          <ResultPage
            answers={quizAnswers}
            recommendedProducts={recommendedProducts}
            onReset={handleReset}
          />
        )}

        {/* حالت نمایش سوالات */}
        {!isComplete && !isAnalyzing && (
          <div className="max-w-screen-md mx-auto space-y-8">
            {/* Header & Progress */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
                <span>سوال {currentStep + 1} از {questions.length}</span>
                <span>{progressPercent}٪ تکمیل شده</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold leading-snug" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                  {currentQuestion.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentQuestion.subtitle}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3 pt-2">
                {currentQuestion.options.map((opt) => {
                  const isSelected = answers[currentQuestion.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelectOption(opt.value)}
                      className={`w-full text-right p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm text-primary"
                          : "border-border/60 hover:border-border bg-background hover:bg-secondary/30 text-foreground"
                      }`}
                    >
                      <div className="space-y-1 pl-4">
                        <div className="text-sm font-semibold">{opt.label}</div>
                        {opt.desc && (
                          <div className="text-xs text-muted-foreground font-normal">
                            {opt.desc}
                          </div>
                        )}
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-border/40">
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="rounded-full gap-2 text-xs font-medium cursor-pointer"
                >
                  <ArrowRight className="h-4 w-4" />
                  قبلی
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={!answers[currentQuestion.id]}
                  className="rounded-full px-6 gap-2 text-xs font-medium cursor-pointer"
                >
                  {currentStep === questions.length - 1 ? "مشاهده نتایج آنالیز" : "بعدی"}
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}