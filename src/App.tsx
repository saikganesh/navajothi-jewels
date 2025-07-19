
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProductDetailPage from "./pages/ProductDetailPage";
import CategoryPage from "./pages/CategoryPage";
import ProductListPage from "./pages/ProductListPage";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/collection/:collectionId" element={<ProductListPage />} />
          <Route path="/category/:categoryId/collection/:collectionId" element={<ProductListPage />} />
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

export default App;
