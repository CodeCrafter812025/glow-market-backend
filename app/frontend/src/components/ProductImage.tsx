import { useEffect, useMemo, useState } from 'react';
import { getFallbackImage, type FallbackImageInput } from '@/lib/productImages';
import { resolveImageSrc } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface ProductImageProps extends FallbackImageInput {
  /** Stored image value: a `storage://` ref, an http(s) URL, or empty. */
  src?: string | null;
  alt: string;
  /** Extra classes for the square container. */
  className?: string;
  /** Extra classes for the <img> element (e.g. hover transforms). */
  imgClassName?: string;
  /** Render as a circle (used for seller logos). */
  rounded?: 'none' | 'md' | 'lg' | 'xl' | 'full';
}

const ROUNDED: Record<NonNullable<ProductImageProps['rounded']>, string> = {
  none: '',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

/**
 * Unified product image renderer.
 *
 * Guarantees for every product surface:
 * 1. A fixed 1:1 square container with `object-cover`, so missing or oddly
 *    sized images can never break the grid layout.
 * 2. Atoms Cloud storage references are resolved to a download URL.
 * 3. If there is no image — or the image fails to load — a clean, high-quality
 *    beauty/skincare stock photo is rendered instead of a grey icon.
 */
export default function ProductImage({
  src,
  alt,
  className,
  imgClassName,
  rounded = 'none',
  category,
  skinTypes,
  concerns,
  seed,
}: ProductImageProps) {
  const fallback = useMemo(
    () => getFallbackImage({ category, skinTypes, concerns, seed }),
    [category, skinTypes, concerns, seed]
  );

  // `null` = still resolving, '' = nothing stored → go straight to fallback.
  const [resolved, setResolved] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setFailed(false);
    setFallbackFailed(false);
    setResolved(null);

    resolveImageSrc(src)
      .then((url) => {
        if (active) setResolved(url ?? '');
      })
      .catch(() => {
        if (active) setResolved('');
      });

    return () => {
      active = false;
    };
  }, [src]);

  const useFallback = failed || resolved === '';
  const displaySrc = useFallback ? fallback : resolved;

  return (
    <div
      className={cn(
        'relative w-full aspect-square overflow-hidden bg-secondary/30',
        ROUNDED[rounded],
        className
      )}
    >
      {/* Ultimate safety net: an on-brand gradient, never a grey icon. */}
      {fallbackFailed ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/15 via-secondary to-primary/5">
          <span
            className="text-sm font-medium text-primary/70 px-3 text-center line-clamp-2"
            style={{ fontFamily: "'Vazirmatn', sans-serif" }}
          >
            {alt}
          </span>
        </div>
      ) : (
        displaySrc && (
          <img
            src={displaySrc}
            alt={alt}
            loading="lazy"
            className={cn('w-full h-full object-cover', imgClassName)}
            onError={() => {
              if (useFallback) setFallbackFailed(true);
              else setFailed(true);
            }}
          />
        )
      )}
    </div>
  );
}