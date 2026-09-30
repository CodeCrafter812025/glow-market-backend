import ProductCard, { Product } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <section className="w-full py-16 sm:py-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
            محصولات پرطرفدار
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            محبوب‌ترین و ضروری‌ترین محصولات زیبایی از نگاه کاربران ما
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
