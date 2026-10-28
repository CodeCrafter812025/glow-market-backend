import { useState } from "react";
import { Sparkles, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ResultPage from "@/components/ResultPage";
import {
  getRecommendedProducts,
  type QuizAnswers,
  type RootCategory,
  type ScoredProduct,
} from "@/data/initialData";

interface Question {
  id: string;
  title: string;
  subtitle: string;
  options: { label: string; value: string; desc?: string }[];
}

const rootQuestion: Question = {
  id: "rootCategory",
  title: "مشاوره هوشمند را برای کدام بخش می‌خواهید؟",
  subtitle: "بر اساس انتخاب شما، سوالات تخصصی همان حوزه فعال می‌شود.",
  options: [
    {
      label: "مراقبت از پوست صورت",
      value: "skin",
      desc: "بررسی تایپ پوست، جوش و آکنه، لک، چروک و آبرسانی",
    },
    {
      label: "مراقبت از مو و کف سر",
      value: "hair",
      desc: "بررسی جنس کف سر، ریزش مو، خشکی، وز و آسیب‌دیدگی ساقه مو",
    },
    {
      label: "مراقبت و بهداشت بدن",
      value: "body",
      desc: "بررسی خشکی پوست بدن، جوش بدن، زبری و تیرگی",
    },
  ],
};

const branchQuestions: Record<RootCategory, Question[]> = {
  skin: [
    {
      id: "skinType",
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
      id: "concern",
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
      id: "sunExposure",
      title: "روزانه چقدر در معرض نور خورشید یا آلودگی هوا هستید؟",
      subtitle: "عوامل محیطی نقش مهمی در انتخاب ترکیبات آنتی‌اکسیدانی دارند.",
      options: [
        { label: "کم (بیشتر روز در فضای بسته هستم)", value: "low" },
        { label: "متوسط (پیاده‌روی روزانه یا رفت‌وآمد کاری)", value: "medium" },
        { label: "زیاد (فعالیت یا ورزش مداوم در فضای باز)", value: "high" },
      ],
    },
    {
      id: "sensitivity",
      title: "پوست شما چقدر به محصولات مراقبتی جدید واکنش نشان می‌دهد؟",
      subtitle: "برای سنجش میزان تحمل‌پذیری پوست شما.",
      options: [
        { label: "به‌ندرت دچار حساسیت می‌شوم", value: "rarely" },
        { label: "گاهی اوقات با برخی ترکیبات خارش یا قرمزی دارم", value: "sometimes" },
        { label: "همیشه (پوستم بسیار واکنش‌پذیر و حساس است)", value: "always" },
      ],
    },
    {
      id: "goal",
      title: "هدف نهایی شما از روتین پوستی جدید چیست؟",
      subtitle: "نتیجه‌ای که بیش از همه دوست دارید در آینه ببینید.",
      options: [
        { label: "پوست درخشان، شاداب و طبیعی (Glowy)", value: "glow" },
        { label: "پوست مات و بدون چربی اضافه", value: "matte" },
        { label: "پوست کاملاً نرم، مرطوب و پر حجم", value: "hydrated" },
        { label: "پوست صاف، یکدست و بدون لک", value: "clear" },
      ],
    },
  ],
  hair: [
    {
      id: "skinType",
      title: "جنس کف سر و ساقه موی خود را چگونه ارزیابی می‌کنید؟",
      subtitle: "برای انتخاب شوینده و نرم‌کننده متناسب با طبع موی شما.",
      options: [
        { label: "کف سر چرب", value: "چرب", desc: "موها زودتر از ۲۴ ساعت چرب و کم‌حجم می‌شوند" },
        { label: "خشک و دهیدراته", value: "خشک", desc: "ساقه مو کدر، خشک و مستعد گره خوردن است" },
        { label: "مختلط (ریشه چرب و ساقه خشک)", value: "مختلط", desc: "کف سر چرب اما نوک موها خشک و شکننده" },
        { label: "معمولی و نرمال", value: "معمولی", desc: "تعادل چربی و نرمی طبیعی" },
      ],
    },
    {
      id: "concern",
      title: "مهم‌ترین دغدغه شما برای موهایتان چیست؟",
      subtitle: "ترکیبات درمانی بر اساس این اولویت انتخاب می‌شوند.",
      options: [
        { label: "ریزش مو و کم‌پشتی", value: "ریزش مو", desc: "تقویت فولیکول‌ها و کنترل ریزش" },
        { label: "خشکی، وز و بی‌حالتی مو", value: "خشکی و وز", desc: "آبرسانی عمیق و نرم‌کنندگی ساقه مو" },
        { label: "موخوره و آسیب ناشی از رنگ/دکلره", value: "موخوره و آسیب", desc: "بازسازی پروتئینی و کراتینه ساقه مو" },
        { label: "شوره، پوسته و خارش کف سر", value: "شوره و خارش", desc: "پاک‌سازی ملایم و تسکین پوست سر" },
      ],
    },
    {
      id: "sensitivity",
      title: "آیا پوست کف سر شما حساس است؟",
      subtitle: "برای انتخاب شامپوهای فاقد سولفات و ضدحساسیت.",
      options: [
        { label: "خیر، حساسیت خاصی ندارم", value: "rarely" },
        { label: "گاهی دچار خارش یا التهاب می‌شوم", value: "sometimes" },
        { label: "بله، فقط محصولات فری‌سولفات و ملایم می‌خواهم", value: "always" },
      ],
    },
    {
      id: "goal",
      title: "هدف نهایی شما برای موهایتان چیست؟",
      subtitle: "نتیجه‌ای که از روتین مراقبت از مو انتظار دارید.",
      options: [
        { label: "موهای نرم، ابریشمی و بدون وز", value: "hydrated" },
        { label: "موهای براق، پرپشت و شاداب", value: "glow" },
        { label: "کف سر تمیز و توقف ریزش مو", value: "clear" },
      ],
    },
  ],
  body: [
    {
      id: "skinType",
      title: "جنس پوست بدن شما چگونه است؟",
      subtitle: "برای انتخاب شوینده و لوسیون مناسب بدن.",
      options: [
        { label: "خشک و پوسته‌شونده", value: "خشک", desc: "احساس خشکی پس از استحمام" },
        { label: "چرب و مستعد جوش", value: "چرب", desc: "تعریق و چربی در ناحیه کتف و بازو" },
        { label: "معمولی", value: "معمولی", desc: "پوست متعادل" },
      ],
    },
    {
      id: "concern",
      title: "دغدغه اصلی شما برای پوست بدن چیست؟",
      subtitle: "مهم‌ترین نیاز مراقبتی بدن خود را مشخص کنید.",
      options: [
        { label: "خشکی و نیاز به آبرسانی عمیق", value: "آبرسانی", desc: "رفع خشکی و ایجاد لطافت طولانی‌مدت" },
        { label: "جوش بدن (کتف، بازو و کمر)", value: "جوش", desc: "پاک‌سازی منافذ و کنترل جوش‌های بدن" },
        { label: "زبری، پوست مرغی و تیرگی", value: "زبری و تیرگی", desc: "لایه‌برداری ملایم و یکدست‌سازی پوست" },
      ],
    },
    {
      id: "sensitivity",
      title: "میزان حساسیت پوست بدن شما چگونه است؟",
      subtitle: "برای انتخاب ترکیبات گیاهی و ملایم.",
      options: [
        { label: "معمولی (بدون حساسیت)", value: "rarely" },
        { label: "گاهی حساس", value: "sometimes" },
        { label: "بسیار حساس و مستعد اگزما", value: "always" },
      ],
    },
    {
      id: "goal",
      title: "هدف نهایی شما از روتین مراقبت بدن چیست؟",
      subtitle: "احساسی که می‌خواهید روی پوست خود تجربه کنید.",
      options: [
        { label: "نرمی و رطوبت ۲۴ ساعته", value: "hydrated" },
        { label: "پوست صاف، شفاف و بدون جوش", value: "clear" },
        { label: "پوست درخشان و خوش‌عطر", value: "glow" },
      ],
    },
  ],
};

export default function SkinQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<ScoredProduct[]>([]);

  const selectedRoot = (answers.rootCategory as RootCategory) || "skin";
  const activeQuestions: Question[] = [rootQuestion, ...branchQuestions[selectedRoot]];
  const currentQuestion = activeQuestions[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / activeQuestions.length) * 100);

  const handleSelectOption = (value: string) => {
    if (currentQuestion.id === "rootCategory" && value !== answers.rootCategory) {
      setAnswers({ rootCategory: value });
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: value });
    }
  };

  const handleNext = async () => {
    if (currentStep < activeQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setIsAnalyzing(true);
    const quizAnswers: QuizAnswers = {
      rootCategory: selectedRoot,
      skinType: answers.skinType || "",
      concern: answers.concern || "",
      sunExposure: answers.sunExposure || "medium",
      sensitivity: answers.sensitivity || "rarely",
      goal: answers.goal || "glow",
    };

    const localResults = getRecommendedProducts(quizAnswers);
    try {
      localStorage.setItem(
        "glowmarket_last_quiz",
        JSON.stringify({
          date: new Date().toLocaleDateString("fa-IR"),
          answers: quizAnswers,
          recommendations: localResults.slice(0, 3),
        })
      );
    } catch {
      // ignore storage errors
    }

    try {
      const res = await fetch("/api/v1/smart-test/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          root_category: selectedRoot,
          skinType: quizAnswers.skinType,
          concern: quizAnswers.concern,
          sunExposure: quizAnswers.sunExposure,
          sensitivity: quizAnswers.sensitivity,
          goal: quizAnswers.goal,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.recommendations) && data.recommendations.length > 0 && selectedRoot === "skin") {
          const mapped: ScoredProduct[] = data.recommendations.map((item: any) => ({
            id: item.id,
            sellerId: item.seller_id || 1,
            title: item.name,
            price: item.price,
            image: item.image_url || "",
            rootCategory: selectedRoot,
            targetSkinType: [item.target_skin_type || ""],
            targetConcerns: [item.target_concerns || ""],
            category: item.category || "درمان اصلی",
            isSensitiveFriendly: Boolean(item.is_sensitive_friendly),
            targetGoals: [item.target_goals || ""],
            matchScore: item.score || 80,
            matchPercent: item.matchPercentage || 90,
          }));
          setTimeout(() => {
            setRecommendedProducts(mapped.length >= 3 ? mapped : localResults);
            setIsAnalyzing(false);
            setIsComplete(true);
          }, 1200);
          return;
        }
      }
    } catch {
      // Fallback to client-side scoring engine if backend is offline
    }

    setTimeout(() => {
      setRecommendedProducts(localResults);
      setIsAnalyzing(false);
      setIsComplete(true);
    }, 1500);
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

  const quizAnswers: QuizAnswers = {
    rootCategory: selectedRoot,
    skinType: answers.skinType || "",
    concern: answers.concern || "",
    sunExposure: answers.sunExposure || "medium",
    sensitivity: answers.sensitivity || "rarely",
    goal: answers.goal || "glow",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <Header />

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-8 sm:py-12">
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
                تطبیق برچسب‌های نیاز شما با ترکیبات فعال محصولات گلو مارکت
              </p>
            </div>
          </div>
        )}

        {isComplete && !isAnalyzing && (
          <ResultPage
            answers={quizAnswers}
            recommendedProducts={recommendedProducts}
            onReset={handleReset}
          />
        )}

        {!isComplete && !isAnalyzing && (
          <div className="max-w-screen-md mx-auto space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
                <span>گام {currentStep + 1} از {activeQuestions.length}</span>
                <span>{progressPercent}٪ تکمیل شده</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold leading-snug" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                  {currentQuestion.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentQuestion.subtitle}
                </p>
              </div>

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
                  {currentStep === activeQuestions.length - 1 ? "مشاهده نتایج آنالیز" : "بعدی"}
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