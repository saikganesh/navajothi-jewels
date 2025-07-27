
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
import StorePage from '@/components/admin/StorePage';
import UsersPage from '@/components/admin/UsersPage';

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

        // Try to fetch user profile from database
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) throw error;

          if (profile && profile.role === 'admin') {
            setUserProfile(profile);
          } else {
            await supabase.auth.signOut();
            toast({
              title: "Access Denied",
              description: "You don't have admin privileges.",
              variant: "destructive",
            });
            navigate('/admin');
            return;
          }
        } catch (profileError) {
          // If profile doesn't exist but email is admin email, allow access
          if (user.email === 'admin@navajothi.com') {
            setUserProfile({
              email: user.email,
              full_name: 'Admin User',
              role: 'admin'
            });
          } else {
            await supabase.auth.signOut();
            toast({
              title: "Access Denied",
              description: "You don't have admin privileges.",
              variant: "destructive",
            });
            navigate('/admin');
            return;
          }
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
        return <StorePage />;
      default:
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
