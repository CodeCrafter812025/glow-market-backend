import { useRef, useState } from 'react';
import { Upload, Loader2, X, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { uploadImage, validateImageFile, isStorageRef } from '@/lib/storage';
import { extractErrorMessage } from '@/lib/api';
import ProductImage from '@/components/ProductImage';

interface ImageUploadFieldProps {
  label: string;
  /** Current stored value: `storage://` ref or an http(s) URL. */
  value: string;
  onChange: (value: string) => void;
  /** Bucket folder, e.g. "products" | "sellers". */
  folder: string;
  /** Inline validation error from the parent form. */
  error?: string;
  /** Preview shape — circle for seller logos. */
  circle?: boolean;
  previewAlt?: string;
}

/**
 * Dual-mode image field: upload a real file to Atoms Cloud Object Storage OR
 * paste an image URL. Shows a live square/circle preview before submission.
 */
export default function ImageUploadField({
  label,
  value,
  onChange,
  folder,
  error,
  circle = false,
  previewAlt = 'پیش‌نمایش تصویر',
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    const invalid = validateImageFile(file);
    if (invalid) {
      toast.error(invalid);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setUploading(true);
    try {
      const ref = await uploadImage(file, folder);
      onChange(ref);
      toast.success('تصویر با موفقیت بارگذاری شد');
    } catch (err) {
      // extractErrorMessage always returns a string — safe for toasts.
      toast.error(extractErrorMessage(err, 'بارگذاری تصویر ناموفق بود. دوباره تلاش کنید.'));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>
        {label} <span className="text-muted-foreground text-xs">(اختیاری)</span>
      </Label>

      <div className="flex items-start gap-3">
        {/* Live preview — always 1:1 */}
        <div className="w-20 shrink-0">
          <ProductImage
            src={value}
            alt={previewAlt}
            rounded={circle ? 'full' : 'lg'}
            className="border border-border/50"
          />
        </div>

        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="cursor-pointer rounded-full text-xs"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 ml-1.5 animate-spin" />
                  در حال بارگذاری…
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5 ml-1.5" />
                  بارگذاری فایل
                </>
              )}
            </Button>

            {value && !uploading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange('')}
                className="cursor-pointer rounded-full text-xs text-muted-foreground"
              >
                <X className="h-3.5 w-3.5 ml-1" />
                حذف تصویر
              </Button>
            )}
          </div>

          <div className="relative">
            <Link2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={isStorageRef(value) ? '' : value}
              placeholder={
                isStorageRef(value) ? 'فایل بارگذاری شد — یا لینک وارد کنید' : 'https://example.com/image.jpg'
              }
              onChange={(e) => onChange(e.target.value)}
              className="pr-8 text-xs"
              dir="ltr"
            />
          </div>

          <p className="text-[11px] text-muted-foreground">
            می‌توانید فایل تصویر را بارگذاری کنید یا لینک تصویر را وارد کنید. حداکثر ۵ مگابایت.
          </p>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
}