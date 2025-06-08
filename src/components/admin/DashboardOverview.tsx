
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, DollarSign, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [databaseSetup, setDatabaseSetup] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Try to fetch products count
        const { count: productsCount, error: productsError } = await supabase
          .from('products' as any)
          .select('*', { count: 'exact', head: true });

        if (productsError) {
          console.log('Products table not accessible:', productsError);
          setDatabaseSetup(false);
          return;
        }

        // Try to fetch orders count and revenue
        const { data: orders, error: ordersError } = await supabase
          .from('orders' as any)
          .select('total_amount, status');

        if (ordersError) {
          console.log('Orders table not accessible:', ordersError);
          setDatabaseSetup(false);
          return;
        }

        setDatabaseSetup(true);
        const totalOrders = orders?.length || 0;
        const totalRevenue = orders?.reduce((sum: number, order: any) => sum + Number(order.total_amount), 0) || 0;
        const pendingOrders = orders?.filter((order: any) => order.status === 'pending').length || 0;

        setStats({
          totalProducts: productsCount || 0,
          totalOrders,
          totalRevenue,
          pendingOrders,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setDatabaseSetup(false);
      }
    };

    fetchStats();
  }, []);

  if (!databaseSetup) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Set up your database to see store statistics.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Database Setup Required</CardTitle>
            <CardDescription>
              Please run the SQL migration commands to set up your database tables.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The database tables for products, orders, and profiles need to be created before you can use the admin dashboard features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      description: 'Products in catalog',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      description: 'All time orders',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: 'All time revenue',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Users,
      description: 'Orders awaiting processing',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Here's what's happening with your store today.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardOverview;
