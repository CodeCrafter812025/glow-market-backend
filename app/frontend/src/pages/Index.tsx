import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AIRecommendation from "@/components/AIRecommendation";
import ProductGrid from "@/components/ProductGrid";
import { useDataStore } from "@/store/dataStore";

const HERO_IMAGE = "https://mgx-backend-cdn.metadl.com/generate/images/1465854/2026-07-25/te7ibqacajsq/hero-beauty-marketplace-banner.png";

export default function Index() {
  const products = useDataStore((state) => state.products);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection heroImage={HERO_IMAGE} />
        <AIRecommendation />
        <ProductGrid products={products} />
      </main>
    </div>
  );
}