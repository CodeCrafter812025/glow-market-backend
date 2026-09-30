import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowRight, Store, Package, Plus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createSeller, createProduct, fetchSellers, extractErrorMessage, type DBSeller } from '@/lib/api';
import ImageUploadField from '@/components/ImageUploadField';
import { isStorageRef } from '@/lib/storage';
import {
  digitsOnly,
  normalizeNumericInput,
  normalizePhoneInput,
  ELEVEN_DIGIT_PHONE,
} from '@/lib/numerals';

const SKIN_TYPES = ['چرب', 'خشک', 'مختلط', 'معمولی'] as const;
const CONCERNS = ['جوش', 'لک', 'چروک', 'آبرسانی', 'منافذ باز', 'تیرگی'] as const;
const CATEGORIES = ['پاک‌کننده', 'درمان اصلی', 'مرطوب‌کننده', 'سرم', 'ضد آفتاب', 'ماسک'] as const;
const GOALS = ['matte', 'clear', 'glow', 'hydrated'] as const;

// ─── Validation Schemas ──────────────────────────────────────────────────────

const optionalText = z.string().trim().optional();

const imageField = optionalText.refine(
  (val) => !val || isStorageRef(val) || /^https?:\/\/.+/i.test(val),
  'لینک تصویر باید با http:// یا https:// شروع شود، یا فایل را بارگذاری کنید'
);

const optionalPhoneField = z
  .preprocess(
    (val) => (typeof val === 'string' ? digitsOnly(val) : val),
    z.string().trim().optional()
  )
  .refine(
    (val) => !val || ELEVEN_DIGIT_PHONE.test(val),
    'شماره تلفن باید ۱۱ رقم و با ۰ شروع شود (اختیاری)'
  );

const priceField = z
  .preprocess(
    (val) => (typeof val === 'string' ? normalizeNumericInput(val) : val),
    z.string().trim().min(1, 'قیمت الزامی است')
  )
  .refine(
    (val) => !Number.isNaN(Number(val)) && Number(val) > 0,
    'قیمت باید عددی بزرگ‌تر از صفر باشد'
  );

const sellerSchema = z.object({
  brand_name: z
    .string()
    .trim()
    .min(2, 'نام برند باید حداقل ۲ کاراکتر باشد'),
  contact_phone: optionalPhoneField,
  contact_email: optionalText.refine(
    (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val),
    'ایمیل وارد شده معتبر نیست (اختیاری)'
  ),
  logo_url: imageField,
  bio: optionalText,
  is_founder: z.boolean(),
});

const productSchema = z.object({
  seller_id: z.string().min(1, 'انتخاب برند الزامی است'),
  title: z.string().trim().min(2, 'عنوان محصول باید حداقل ۲ کاراکتر باشد'),
  price: priceField,
  image_url: imageField,
  description: optionalText,
  category: optionalText,
  target_skin_type: z.array(z.string()),
  target_concerns: z.array(z.string()),
  target_goals: z.array(z.string()),
  is_sensitive_friendly: z.boolean(),
});

type SellerForm = z.infer<typeof sellerSchema>;
type ProductForm = z.infer<typeof productSchema>;
type FieldErrors = Record<string, string>;

const EMPTY_SELLER: SellerForm = {
  brand_name: '',
  contact_phone: '',
  contact_email: '',
  logo_url: '',
  bio: '',
  is_founder: false,
};

const EMPTY_PRODUCT: ProductForm = {
  seller_id: '',
  title: '',
  price: '',
  image_url: '',
  description: '',
  category: '',
  target_skin_type: [],
  target_concerns: [],
  target_goals: [],
  is_sensitive_friendly: false,
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 mt-1.5 text-xs text-red-600 font-vazirmatn">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

export default function AdminAddData() {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState<DBSeller[]>([]);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [sellersError, setSellersError] = useState('');

  const [sellerForm, setSellerForm] = useState<SellerForm>(EMPTY_SELLER);
  const [sellerErrors, setSellerErrors] = useState<FieldErrors>({});
  const [sellerApiError, setSellerApiError] = useState('');
  const [savingSeller, setSavingSeller] = useState(false);
  const [lastSavedSeller, setLastSavedSeller] = useState('');

  const [productForm, setProductForm] = useState<ProductForm>(EMPTY_PRODUCT);
  const [productErrors, setProductErrors] = useState<FieldErrors>({});
  const [productApiError, setProductApiError] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);
  const [lastSavedProduct, setLastSavedProduct] = useState('');

  useEffect(() => {
    loadSellers();
  }, []);

  async function loadSellers() {
    setLoadingSellers(true);
    setSellersError('');
    try {
      const data = await fetchSellers();
      setSellers(data);
    } catch (err) {
      setSellersError(extractErrorMessage(err, 'خطا در بارگذاری فهرست برندها'));
      toast.error('خطا در بارگذاری فهرست برندها');
    } finally {
      setLoadingSellers(false);
    }
  }

  function validate<T>(schema: z.ZodType<T>, value: unknown): { ok: true; data: T } | { ok: false; errors: FieldErrors } {
    const result = schema.safeParse(value);
    if (result.success) return { ok: true, data: result.data };
    const errors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }

  async function handleCreateSeller(e: React.FormEvent) {
    e.preventDefault();
    setSellerApiError('');
    setLastSavedSeller('');

    const result = validate(sellerSchema, sellerForm);
    if (!result.ok) {
      setSellerErrors(result.errors);
      toast.error('لطفاً خطاهای مشخص‌شده در فرم را برطرف کنید');
      return;
    }
    setSellerErrors({});

    setSavingSeller(true);
    try {
      const created = await createSeller({
        brand_name: result.data.brand_name,
        is_founder: result.data.is_founder,
        contact_phone: result.data.contact_phone || undefined,
        contact_email: result.data.contact_email || undefined,
        logo_url: result.data.logo_url || undefined,
        bio: result.data.bio || undefined,
      });

      toast.success(`برند «${result.data.brand_name}» با موفقیت ثبت شد`);
      setLastSavedSeller(result.data.brand_name);
      setSellerForm(EMPTY_SELLER);
      setSellerErrors({});

      await loadSellers();
      if (created?.id) {
        setProductForm((prev) => ({ ...prev, seller_id: String(created.id) }));
      }
    } catch (err) {
      const message = extractErrorMessage(err, 'ثبت برند انجام نشد. لطفاً دوباره تلاش کنید.');
      setSellerApiError(message);
      toast.error(message);
    } finally {
      setSavingSeller(false);
    }
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    setProductApiError('');
    setLastSavedProduct('');

    const result = validate(productSchema, productForm);
    if (!result.ok) {
      setProductErrors(result.errors);
      toast.error('لطفاً خطاهای مشخص‌شده در فرم را برطرف کنید');
      return;
    }
    setProductErrors({});

    setSavingProduct(true);
    try {
      await createProduct({
        seller_id: Number(result.data.seller_id),
        title: result.data.title,
        price: Number(result.data.price),
        image_url: result.data.image_url || undefined,
        description: result.data.description || undefined,
        target_skin_type: JSON.stringify(result.data.target_skin_type),
        target_concerns: JSON.stringify(result.data.target_concerns),
        target_goals: JSON.stringify(result.data.target_goals),
        category: result.data.category ? result.data.category : 'سرم',
        is_sensitive_friendly: result.data.is_sensitive_friendly,
        rating: 0,
        review_count: 0,
        verified: false,
      });

      toast.success(`محصول «${result.data.title}» با موفقیت ثبت شد`);
      setLastSavedProduct(result.data.title);
      setProductForm({ ...EMPTY_PRODUCT, seller_id: result.data.seller_id });
      setProductErrors({});
    } catch (err) {
      const message = extractErrorMessage(err, 'ثبت محصول انجام نشد. لطفاً دوباره تلاش کنید.');
      setProductApiError(message);
      toast.error(message);
    } finally {
      setSavingProduct(false);
    }
  }

  function toggleArrayItem(arr: string[], item: string): string[] {
    return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
  }

  function updateSeller<K extends keyof SellerForm>(key: K, value: SellerForm[K]) {
    setSellerForm((prev) => ({ ...prev, [key]: value }));
    setSellerErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  function updateProduct<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setProductForm((prev) => ({ ...prev, [key]: value }));
    setProductErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  const inputError = 'border-red-400 focus-visible:ring-red-300';

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-rose-100 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <h1 className="text-lg font-bold text-rose-800 font-vazirmatn">پنل مدیریت سایت</h1>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowRight className="h-4 w-4 ml-1" />
            بازگشت
          </Button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <Tabs defaultValue="seller" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="seller" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              برند جدید
            </TabsTrigger>
            <TabsTrigger value="product" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              محصول جدید
            </TabsTrigger>
          </TabsList>

          {/* ─── Seller Tab ─────────────────────────────────────────── */}
          <TabsContent value="seller">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-vazirmatn">ثبت برند</CardTitle>
                <p className="text-xs text-muted-foreground font-vazirmatn">
                  تنها «نام برند» الزامی است. تلفن، ایمیل و توضیحات را می‌توانید خالی بگذارید.
                </p>
              </CardHeader>
              <CardContent>
                {lastSavedSeller && (
                  <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 font-vazirmatn">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>برند «{lastSavedSeller}» در پایگاه داده ذخیره شد.</span>
                  </div>
                )}
                {sellerApiError && (
                  <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 font-vazirmatn">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{sellerApiError}</span>
                  </div>
                )}

                <form onSubmit={handleCreateSeller} className="space-y-4" noValidate>
                  <div>
                    <Label htmlFor="brand_name">
                      نام برند <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="brand_name"
                      value={sellerForm.brand_name}
                      onChange={(e) => updateSeller('brand_name', e.target.value)}
                      placeholder="مثلاً: دِرماکلین (DermaClean)"
                      className={`mt-1 ${sellerErrors.brand_name ? inputError : ''}`}
                      aria-invalid={Boolean(sellerErrors.brand_name)}
                    />
                    <FieldError message={sellerErrors.brand_name} />
                  </div>

                  <div>
                    <Label htmlFor="contact_phone">
                      تلفن تماس <span className="text-muted-foreground text-xs">(اختیاری)</span>
                    </Label>
                    <Input
                      id="contact_phone"
                      inputMode="numeric"
                      value={sellerForm.contact_phone ?? ''}
                      onChange={(e) => updateSeller('contact_phone', normalizePhoneInput(e.target.value))}
                      placeholder="09121234567"
                      className={`mt-1 ${sellerErrors.contact_phone ? inputError : ''}`}
                      aria-invalid={Boolean(sellerErrors.contact_phone)}
                      dir="ltr"
                    />
                    <FieldError message={sellerErrors.contact_phone} />
                  </div>

                  <div>
                    <Label htmlFor="contact_email">
                      ایمیل <span className="text-muted-foreground text-xs">(اختیاری)</span>
                    </Label>
                    <Input
                      id="contact_email"
                      type="text"
                      value={sellerForm.contact_email ?? ''}
                      onChange={(e) => updateSeller('contact_email', e.target.value)}
                      placeholder="info@brand.ir"
                      className={`mt-1 ${sellerErrors.contact_email ? inputError : ''}`}
                      aria-invalid={Boolean(sellerErrors.contact_email)}
                      dir="ltr"
                    />
                    <FieldError message={sellerErrors.contact_email} />
                  </div>

                  <ImageUploadField
                    label="لوگوی برند"
                    value={sellerForm.logo_url ?? ''}
                    onChange={(val) => updateSeller('logo_url', val)}
                    folder="sellers"
                    error={sellerErrors.logo_url}
                    circle
                    previewAlt={sellerForm.brand_name || 'لوگوی برند'}
                  />

                  <div>
                    <Label htmlFor="bio">
                      توضیحات کوتاه <span className="text-muted-foreground text-xs">(اختیاری)</span>
                    </Label>
                    <Textarea
                      id="bio"
                      value={sellerForm.bio ?? ''}
                      onChange={(e) => updateSeller('bio', e.target.value)}
                      placeholder="توضیح مختصر درباره برند..."
                      className="mt-1"
                      rows={2}
                    />
                    <FieldError message={sellerErrors.bio} />
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={sellerForm.is_founder}
                      onCheckedChange={(val) => updateSeller('is_founder', val)}
                    />
                    <Label>بنیان‌گذار پلتفرم</Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                    disabled={savingSeller}
                  >
                    {savingSeller ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : (
                      <Plus className="h-4 w-4 ml-2" />
                    )}
                    {savingSeller ? 'در حال ثبت...' : 'ثبت برند'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Product Tab ────────────────────────────────────────── */}
          <TabsContent value="product">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-vazirmatn">افزودن محصول</CardTitle>
                <p className="text-xs text-muted-foreground font-vazirmatn">
                  فقط برند، عنوان و قیمت الزامی هستند. تصویر و توضیحات را می‌توانید بعداً تکمیل کنید.
                </p>
              </CardHeader>
              <CardContent>
                {lastSavedProduct && (
                  <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 font-vazirmatn">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>محصول «{lastSavedProduct}» در پایگاه داده ذخیره شد.</span>
                  </div>
                )}
                {productApiError && (
                  <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 font-vazirmatn">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{productApiError}</span>
                  </div>
                )}

                <form onSubmit={handleCreateProduct} className="space-y-4" noValidate>
                  {/* Seller selection */}
                  <div>
                    <Label>
                      برند <span className="text-red-500">*</span>
                    </Label>
                    {loadingSellers ? (
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        در حال بارگذاری...
                      </div>
                    ) : sellersError ? (
                      <div className="mt-1 space-y-2">
                        <FieldError message={sellersError} />
                        <Button type="button" variant="outline" size="sm" onClick={loadSellers}>
                          تلاش مجدد
                        </Button>
                      </div>
                    ) : sellers.length === 0 ? (
                      <p className="mt-1 text-xs text-muted-foreground font-vazirmatn">
                        هنوز برندی ثبت نشده است. ابتدا از تب «برند جدید» یک برند ثبت کنید.
                      </p>
                    ) : (
                      <Select
                        value={productForm.seller_id}
                        onValueChange={(val) => updateProduct('seller_id', val)}
                      >
                        <SelectTrigger
                          className={`mt-1 ${productErrors.seller_id ? inputError : ''}`}
                          aria-invalid={Boolean(productErrors.seller_id)}
                        >
                          <SelectValue placeholder="انتخاب برند" />
                        </SelectTrigger>
                        <SelectContent>
                          {sellers.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.brand_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FieldError message={productErrors.seller_id} />
                  </div>

                  <div>
                    <Label htmlFor="p_title">
                      عنوان محصول <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="p_title"
                      value={productForm.title}
                      onChange={(e) => updateProduct('title', e.target.value)}
                      placeholder="مثلاً: سرم ویتامین سی ۲۰٪"
                      className={`mt-1 ${productErrors.title ? inputError : ''}`}
                      aria-invalid={Boolean(productErrors.title)}
                    />
                    <FieldError message={productErrors.title} />
                  </div>

                  <div>
                    <Label htmlFor="p_price">
                      قیمت (تومان) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="p_price"
                      type="text"
                      inputMode="decimal"
                      value={productForm.price}
                      onChange={(e) => updateProduct('price', normalizeNumericInput(e.target.value))}
                      placeholder="320000"
                      className={`mt-1 ${productErrors.price ? inputError : ''}`}
                      aria-invalid={Boolean(productErrors.price)}
                      dir="ltr"
                    />
                    <FieldError message={productErrors.price} />
                  </div>

                  <ImageUploadField
                    label="تصویر محصول"
                    value={productForm.image_url ?? ''}
                    onChange={(val) => updateProduct('image_url', val)}
                    folder="products"
                    error={productErrors.image_url}
                    previewAlt={productForm.title || 'تصویر محصول'}
                  />

                  <div>
                    <Label htmlFor="p_desc">
                      توضیحات <span className="text-muted-foreground text-xs">(اختیاری)</span>
                    </Label>
                    <Textarea
                      id="p_desc"
                      value={productForm.description ?? ''}
                      onChange={(e) => updateProduct('description', e.target.value)}
                      placeholder="توضیحات محصول..."
                      className="mt-1"
                      rows={2}
                    />
                    <FieldError message={productErrors.description} />
                  </div>

                  {/* Category */}
                  <div>
                    <Label>
                      دسته‌بندی <span className="text-muted-foreground text-xs">(اختیاری)</span>
                    </Label>
                    <Select
                      value={productForm.category ?? ''}
                      onValueChange={(val) => updateProduct('category', val)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="انتخاب دسته‌بندی" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Skin Types chips */}
                  <div>
                    <Label className="mb-2 block">
                      نوع پوست هدف <span className="text-muted-foreground text-xs">(اختیاری)</span>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {SKIN_TYPES.map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => updateProduct('target_skin_type', toggleArrayItem(productForm.target_skin_type, st))}
                          className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                            productForm.target_skin_type.includes(st)
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-rose-300'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Concerns chips */}
                  <div>
                    <Label className="mb-2 block">
                      دغدغه‌ها <span className="text-muted-foreground text-xs">(اختیاری)</span>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {CONCERNS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateProduct('target_concerns', toggleArrayItem(productForm.target_concerns, c))}
                          className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                            productForm.target_concerns.includes(c)
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-rose-300'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Goals chips */}
                  <div>
                    <Label className="mb-2 block">
                      اهداف <span className="text-muted-foreground text-xs">(اختیاری)</span>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {GOALS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => updateProduct('target_goals', toggleArrayItem(productForm.target_goals, g))}
                          className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                            productForm.target_goals.includes(g)
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-rose-300'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sensitive friendly */}
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={productForm.is_sensitive_friendly}
                      onCheckedChange={(val) => updateProduct('is_sensitive_friendly', val)}
                    />
                    <Label>مناسب پوست حساس</Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                    disabled={savingProduct}
                  >
                    {savingProduct ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : (
                      <Plus className="h-4 w-4 ml-2" />
                    )}
                    {savingProduct ? 'در حال ثبت...' : 'ثبت محصول'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick links */}
        <div className="mt-6 space-y-3">
          <p className="text-sm text-muted-foreground font-vazirmatn">لینک‌های سریع برندها:</p>
          {loadingSellers ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              در حال بارگذاری...
            </div>
          ) : sellers.length === 0 ? (
            <p className="text-xs text-muted-foreground font-vazirmatn">برندی برای نمایش وجود ندارد.</p>
          ) : (
            sellers.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/shop/${s.id}`)}
                className="block w-full text-right px-4 py-2 rounded-lg border border-rose-100 hover:bg-rose-50 transition-colors text-sm"
              >
                <span className="font-medium text-rose-800">{s.brand_name}</span>
                <span className="text-xs text-muted-foreground mr-2">— /shop/{s.id}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}