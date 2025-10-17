
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAppSelector } from '@/store';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import ProductsManagement from '@/components/admin/ProductsManagement';
import OrdersManagement from '@/components/admin/OrdersManagement';
import DashboardOverview from '@/components/admin/DashboardOverview';
import CategoriesPage from '@/components/admin/CategoriesPage';
import CollectionsPage from '@/components/admin/CollectionsPage';
import StoreSettings from '@/components/admin/StoreSettings';
import UsersPage from '@/components/admin/UsersPage';
import StorePage from '@/components/admin/StorePage';
import AdminOrderDetail from '@/pages/AdminOrderDetail';

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, isInitialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isInitialized) return;

      try {
        if (!user) {
          navigate('/admin');
          return;
        }

        // Check if user has admin role using the is_admin function
        const { data: isAdminResult, error: adminCheckError } = await supabase
          .rpc('is_admin', { user_id: user.id });

        if (adminCheckError) {
          console.error('Error checking admin status:', adminCheckError);
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "Unable to verify admin privileges.",
            variant: "destructive",
          });
          navigate('/admin');
          return;
        }

        if (!isAdminResult) {
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges.",
            variant: "destructive",
          });
          navigate('/admin');
          return;
        }

        // Fetch user profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          setUserProfile(profile);
        } else {
          // Create a basic profile if none exists
          setUserProfile({
            email: user.email,
            full_name: user.user_metadata?.full_name || 'Admin User',
            role: 'admin'
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        navigate('/admin');
      }
    };

    checkAuth();
  }, [user, isInitialized, navigate, toast]);

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const renderContent = () => {
    const path = location.pathname;
    
    switch (path) {
      case '/admin/overview':
        return <DashboardOverview />;
      case '/admin/products':
        return <ProductsManagement />;
      case '/admin/categories':
        return <CategoriesPage />;
      case '/admin/collections':
        return <CollectionsPage />;
      case '/admin/orders':
        return <OrdersManagement />;
      case '/admin/users':
        return <UsersPage />;
      case '/admin/store':
        return <StoreSettings />;
      case '/admin/gold-price':
        return <StorePage />;
      default:
        // Check if it's an order detail page
        if (path.startsWith('/admin/orders/')) {
          return <AdminOrderDetail />;
        }
        return <DashboardOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <AdminHeader userProfile={userProfile} />
          <div className="container mx-auto px-4 py-6">
            {renderContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
