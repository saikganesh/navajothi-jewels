import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Tag, FolderOpen, Store } from 'lucide-react';
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

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminSidebar = ({ activeTab, setActiveTab }: AdminSidebarProps) => {
  const menuItems = [
    {
      id: 'store',
      title: 'Store',
      icon: Store,
    },
    {
      id: 'overview',
      title: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'products',
      title: 'Products',
      icon: Package,
    },
    {
      id: 'categories',
      title: 'Categories',
      icon: Tag,
    },
    {
      id: 'collections',
      title: 'Collections',
      icon: FolderOpen,
    },
    {
      id: 'orders',
      title: 'Orders',
      icon: ShoppingCart,
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
                    isActive={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
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
