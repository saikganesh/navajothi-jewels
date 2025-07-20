
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store, useAppDispatch } from './store';
import { setAuthData, setAuthLoading } from './store/slices/authSlice';
import { supabase } from '@/integrations/supabase/client';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProductDetailPage from "./pages/ProductDetailPage";
import CategoryPage from "./pages/CategoryPage";
import ProductListPage from "./pages/ProductListPage";
import Products from "./pages/Products";
import Collections from "./pages/Collections";
import Contact from "./pages/Contact";
import BulkOrder from "./pages/BulkOrder";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderFailed from "./pages/OrderFailed";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import AddVariation from "./pages/AddVariation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let authSubscription: any = null;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        dispatch(setAuthData({ user: session?.user ?? null, session }));

        // Set up auth state listener
        authSubscription = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            dispatch(setAuthData({ user: session?.user ?? null, session }));
          }
        );
      } catch (error) {
        console.error('Error initializing auth:', error);
        dispatch(setAuthData({ user: null, session: null }));
      }
    };

    initializeAuth();

    // Cleanup subscription on unmount
    return () => {
      if (authSubscription) {
        authSubscription.data.subscription.unsubscribe();
      }
    };
  }, [dispatch]);

  return <>{children}</>;
};

const AppContent = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collection/:collectionId" element={<ProductListPage />} />
          <Route path="/category/:categoryId/collection/:collectionId" element={<ProductListPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/bulk-order" element={<BulkOrder />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/order-failed" element={<OrderFailed />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/admin/products/add" element={<AddProduct />} />
          <Route path="/admin/products/edit/:id" element={<EditProduct />} />
          <Route path="/admin/products/:productId/add-variation" element={<AddVariation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const App = () => (
  <Provider store={store}>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </Provider>
);

export default App;
