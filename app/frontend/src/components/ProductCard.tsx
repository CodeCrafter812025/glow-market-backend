import { useNavigate } from "react-router-dom";
import { Star, ShoppingCart, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import ProductImage from "@/components/ProductImage";
import { getFallbackImage } from "@/lib/productImages";
import { toPersianDigits } from "@/lib/numerals";

export interface Product {
  id: number;
  image: string;
  brand: string;
  title: string;
  price: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);

  // تبدیل قیمت از واحد هزار تومان به رقم استاندارد تومان (ضرب در ۱۰۰۰ و بدون پسوند 'هزار')
  const formattedPrice = toPersianDigits((product.price * 1000).toLocaleString("en-US"));

  return (
    <div
      className="group relative bg-card border border-border/40 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md hover:border-border/80 hover:-translate-y-0.5 cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Verified badge */}
      {product.verified && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-background/90 backdrop-blur-sm text-[10px] font-medium text-primary px-2 py-1 rounded-full border border-primary/20">
          <BadgeCheck className="h-3 w-3" />
          تضمین اصالت
        </div>
      )}

      {/* Image — unified 1:1 container with smart fallback */}
      <ProductImage
        src={product.image}
        alt={`${product.brand} - ${product.title}`}
        seed={product.id}
        imgClassName="transition-transform duration-500 group-hover:scale-105"
      />

      {/* Content */}
      <div className="p-4 space-y-2.5">
        {/* Brand */}
        <p className="text-[11px] font-bold tracking-wider text-muted-foreground">
          {product.brand}
        </p>

        {/* Title */}
        <h3 className="text-sm font-medium leading-snug line-clamp-2 text-foreground/90" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(product.rating)
                    ? "fill-amber-400 text-amber-400"
                    : i < product.rating
                    ? "fill-amber-400/50 text-amber-400"
                    : "fill-muted text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">
            ({toPersianDigits(product.reviewCount)} نظر)
          </span>
        </div>

        {/* Price + Add to Cart */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
            {formattedPrice} تومان
          </span>
          <Button
            size="sm"
            className="h-8 px-3 rounded-full text-xs font-medium cursor-pointer group/btn"
            onClick={(e) => {
              e.stopPropagation();
              addToCart({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image || getFallbackImage({ seed: product.id }),
              });
            }}
          >
            <ShoppingCart className="h-3 w-3 ml-1.5 transition-transform group-hover/btn:scale-110" />
            افزودن
          </Button>
        </div>
      </div>
    </div>
  );
}