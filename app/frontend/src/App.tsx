import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BlogRoutes from './blog-routes';
import Index from './pages/Index';
import SellerDashboard from './pages/SellerDashboard';
import SkinQuiz from './pages/SkinQuiz';
import ProductDetail from './pages/ProductDetail';
import ServiceBooking from './pages/ServiceBooking';
import CheckoutPage from './pages/CheckoutPage';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminAddData from './pages/AdminAddData';
import SellerShop from './pages/SellerShop';
import PaymentCallback from './pages/PaymentCallback';
import AuthCallback from './pages/AuthCallback';
import AuthError from './pages/AuthError';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import TermsConditions from './pages/TermsConditions';
import RefundPolicy from './pages/RefundPolicy';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
// MODULE_IMPORTS_START
// MODULE_IMPORTS_END

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/seller-dashboard" element={<SellerDashboard />} />
    <Route path="/skin-quiz" element={<SkinQuiz />} />
    <Route path="/product/:id" element={<ProductDetail />} />
    <Route path="/booking" element={<ServiceBooking />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/profile" element={<BuyerDashboard />} />
    <Route path="/admin/add-data" element={<AdminAddData />} />
    <Route path="/shop/:sellerId" element={<SellerShop />} />
    {/* <Route path="/blog/*" element={<BlogRoutes />} /> */}
    <Route path="/payment/callback" element={<PaymentCallback />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/auth/error" element={<AuthError />} />
    <Route path="/about" element={<AboutUs />} />
    <Route path="/contact" element={<ContactUs />} />
    <Route path="/terms" element={<TermsConditions />} />
    <Route path="/refund-policy" element={<RefundPolicy />} />
    {/* MODULE_ROUTES_START */}
    {/* MODULE_ROUTES_END */}
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* MODULE_PROVIDERS_START */}
    {/* MODULE_PROVIDERS_END */}
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <ErrorBoundary>
          <ScrollToTop />
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">
              <AppRoutes />
            </div>
            <Footer />
          </div>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
    {/* MODULE_PROVIDERS_CLOSE */}
  </QueryClientProvider>
);

export default App;
export { AppRoutes };
