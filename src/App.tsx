
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store, useAppDispatch } from './store';
import { setAuthData, setAuthLoading } from './store/slices/authSlice';
import { fetchGoldPrices } from './store/slices/goldPriceSlice';
import { supabase } from '@/integrations/supabase/client';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import ProductDetailPage from "./pages/ProductDetailPage";
import CategoryPage from "./pages/CategoryPage";
import ProductListPage from "./pages/ProductListPage";
import Products from "./pages/Products";
import Collections from "./pages/Collections";
import Contact from "./pages/Contact";

import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderFailed from "./pages/OrderFailed";
import Profile from "./pages/Profile";
import ProfileCart from "./pages/ProfileCart";
import ProfileWishlist from "./pages/ProfileWishlist";
import ProfileOrders from "./pages/ProfileOrders";
import ProfileAddresses from "./pages/ProfileAddresses";
import Auth from "./pages/Auth";
import SignupConfirmation from "./pages/SignupConfirmation";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import AddVariation from "./pages/AddVariation";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CancellationAndRefunds from "./pages/CancellationAndRefunds";
import ShippingPolicy from "./pages/ShippingPolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Check if running in preview environment
const isPreviewEnvironment = () => {
  return window.location.hostname.includes('preview');
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    let authSubscription: any = null;
    let goldPriceInterval: NodeJS.Timeout | null = null;
    let checkoutPauseTimeout: NodeJS.Timeout | null = null;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        dispatch(setAuthData({ user: session?.user ?? null, session }));

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email, 'session:', session);
            console.log('Current auth state:', { event, user: session?.user, session });
            dispatch(setAuthData({ user: session?.user ?? null, session }));
          }
        );
        
        authSubscription = subscription;
      } catch (error) {
        console.error('Error initializing auth:', error);
        dispatch(setAuthData({ user: null, session: null }));
      }
    };

    const initializeGoldPrices = () => {
      // Fetch gold prices immediately
      dispatch(fetchGoldPrices());
      
      // Set up interval to fetch every hour (3600000 ms)
      goldPriceInterval = setInterval(() => {
        dispatch(fetchGoldPrices());
      }, 3600000);
    };

    const handleCheckoutPageVisit = () => {
      // Clear existing interval when on checkout page
      if (goldPriceInterval) {
        clearInterval(goldPriceInterval);
        goldPriceInterval = null;
      }

      // Set timeout to resume gold price fetching after 10 minutes
      checkoutPauseTimeout = setTimeout(() => {
        initializeGoldPrices();
      }, 10 * 60 * 1000); // 10 minutes
    };

    initializeAuth();
    
    // Check if we're on checkout page
    if (location.pathname === '/checkout') {
      handleCheckoutPageVisit();
    } else {
      // Initialize gold prices normally for other pages
      initializeGoldPrices();
    }

    // Cleanup subscription and intervals on unmount
    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
      if (goldPriceInterval) {
        clearInterval(goldPriceInterval);
      }
      if (checkoutPauseTimeout) {
        clearTimeout(checkoutPauseTimeout);
      }
    };
  }, [dispatch, location.pathname]);

  return <>{children}</>;
};

const AppContent = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/products" element={<Products />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collection/:collectionId" element={<ProductListPage />} />
            <Route path="/category/:categoryId/collection/:collectionId" element={<ProductListPage />} />
            <Route path="/contact" element={<Contact />} />
            
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="/order-failed" element={<OrderFailed />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/cart" element={<ProfileCart />} />
            <Route path="/profile/wishlist" element={<ProfileWishlist />} />
            <Route path="/profile/orders" element={<ProfileOrders />} />
            <Route path="/profile/addresses" element={<ProfileAddresses />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup-confirmation" element={<SignupConfirmation />} />
            {isPreviewEnvironment() && (
              <>
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="/admin/products/add" element={<AddProduct />} />
                <Route path="/admin/products/edit/:id" element={<EditProduct />} />
                <Route path="/admin/products/:productId/add-variation" element={<AddVariation />} />
              </>
            )}
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cancellation-and-refunds" element={<CancellationAndRefunds />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const App = () => (
  <Provider store={store}>
    <AppContent />
  </Provider>
);

export default App;
