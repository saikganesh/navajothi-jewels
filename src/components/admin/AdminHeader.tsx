
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, ExternalLink } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

interface AdminHeaderProps {
  userProfile: any;
}

const AdminHeader = ({ userProfile }: AdminHeaderProps) => {
  const { signOut } = useAuth();

  return (
    <header className="bg-white border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between px-2 sm:px-4 py-3 gap-2">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <SidebarTrigger />
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
            Welcome, {userProfile?.full_name || userProfile?.email}
          </span>
          <Link to="/">
            <Button variant="outline" size="sm" className="h-8 sm:h-9">
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden md:inline">Visit Store</span>
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={signOut} className="h-8 sm:h-9">
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden md:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
