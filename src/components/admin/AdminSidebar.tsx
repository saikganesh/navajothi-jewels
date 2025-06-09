
import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Tag, FolderOpen, Store, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      id: 'store',
      title: 'Store',
      icon: Store,
      path: '/admin/store',
    },
    {
      id: 'overview',
      title: 'Overview',
      icon: LayoutDashboard,
      path: '/admin/overview',
    },
    {
      id: 'products',
      title: 'Products',
      icon: Package,
      path: '/admin/products',
    },
    {
      id: 'categories',
      title: 'Categories',
      icon: Tag,
      path: '/admin/categories',
    },
    {
      id: 'collections',
      title: 'Collections',
      icon: FolderOpen,
      path: '/admin/collections',
    },
    {
      id: 'orders',
      title: 'Orders',
      icon: ShoppingCart,
      path: '/admin/orders',
    },
    {
      id: 'users',
      title: 'Users',
      icon: Users,
      path: '/admin/users',
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-2 py-4">
          <img 
            src="/lovable-uploads/7fa02271-0a36-48ab-abaa-bb4625909352.png" 
            alt="Sujana Jewels Logo" 
            className="h-8 w-auto"
          />
          <span className="font-bold text-lg">Admin</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                  >
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
