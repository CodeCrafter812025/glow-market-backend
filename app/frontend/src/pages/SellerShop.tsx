import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, ShoppingBag, Star, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { fetchSellerById, fetchProductsBySeller, parseJsonArray, type DBSeller, type DBProduct } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import ProductImage from '@/components/ProductImage';
import { getFallbackImage } from '@/lib/productImages';

export default function SellerShop() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const addToCart = useCartStore((s) => s.addToCart);

  const [seller, setSeller] = useState<DBSeller | null>(null);
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sellerId) return;
    loadData(Number(sellerId));
  }, [sellerId]);

  async function loadData(id: number) {
    setLoading(true);
    setError('');
    try {
      const [sellerData, productsData] = await Promise.all([
        fetchSellerById(id),
        fetchProductsBySeller(id),
      ]);
      setSeller(sellerData);
      setProducts(productsData);
    } catch {
      setError('فروشنده یافت نشد');
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart(product: DBProduct) {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      // Keep the cart thumbnail meaningful even when the product has no image.
      image:
        product.image_url ||
        getFallbackImage({
          category: product.category,
          skinTypes: parseJsonArray(product.target_skin_type),
          concerns: parseJsonArray(product.target_concerns),
          seed: product.id,
        }),
    });
    toast.success('به سبد خرید اضافه شد');
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-white gap-4" dir="rtl">
        <p className="text-lg text-gray-600 font-vazirmatn">{error || 'فروشنده یافت نشد'}</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowRight className="h-4 w-4 ml-1" />
          بازگشت به فروشگاه
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-rose-100 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowRight className="h-4 w-4 ml-1" />
            فروشگاه اصلی
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/checkout')}>
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Seller Hero */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4">
            {seller.logo_url ? (
              <ProductImage
                src={seller.logo_url}
                alt={seller.brand_name}
                rounded="full"
                seed={seller.id}
                className="border border-rose-100"
              />
            ) : (
              <div className="w-full aspect-square rounded-full bg-rose-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-rose-600">{seller.brand_name.charAt(0)}</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-rose-900 font-vazirmatn">{seller.brand_name}</h1>
          {seller.bio && <p className="text-sm text-muted-foreground mt-2">{seller.bio}</p>}
          <div className="flex items-center justify-center gap-3 mt-3">
            {seller.is_founder && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                <ShieldCheck className="h-3 w-3 ml-1" />
                بنیان‌گذار
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {products.length} محصول
            </Badge>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-vazirmatn">هنوز محصولی ثبت نشده</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <ProductImage
                    src={product.image_url}
                    alt={product.title}
                    category={product.category}
                    skinTypes={parseJsonArray(product.target_skin_type)}
                    concerns={parseJsonArray(product.target_concerns)}
                    seed={product.id}
                  />
                  {product.verified && (
                    <Badge className="absolute top-2 right-2 bg-emerald-500 text-white text-xs">
                      <ShieldCheck className="h-3 w-3 ml-1" />
                      تایید شده
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2 font-vazirmatn">
                    {product.title}
                  </h3>
                  {product.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {parseJsonArray(product.target_skin_type).map((st) => (
                      <span key={st} className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                        {st}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-700 text-sm">{formatPrice(product.price)}</span>
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <Star className="h-3 w-3 fill-amber-400" />
                      <span>{product.rating}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-3 bg-rose-600 hover:bg-rose-700 text-white text-xs"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingBag className="h-3 w-3 ml-1" />
                    افزودن به سبد
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Package({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}