import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShoppingCart, Heart, Package, MapPin, Lock, LogOut, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import ChangePasswordModal from '@/components/ChangePasswordModal';


const Profile = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { user, isLoading, isInitialized } = useAppSelector((state) => state.auth);
  const cartItems = useAppSelector((state) => state.cart.items);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (isInitialized && !user) {
      navigate('/auth');
    }
  }, [user, isInitialized, navigate]);

  // Show loading state while checking authentication
  if (!isInitialized || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await signOut();
  };

  const profileCards = [
    {
      title: 'My Cart',
      description: `${cartItems.length} items in your cart`,
      icon: ShoppingCart,
      action: () => navigate('/profile/cart'),
      color: 'text-blue-600',
    },
    {
      title: 'My Wishlist',
      description: `${wishlistItems.length} items in your wishlist`,
      icon: Heart,
      action: () => navigate('/profile/wishlist'),
      color: 'text-red-600',
    },
    {
      title: 'My Orders',
      description: 'View your order history',
      icon: Package,
      action: () => navigate('/profile/orders'),
      color: 'text-green-600',
    },
    {
      title: 'My Addresses',
      description: 'Manage your saved addresses',
      icon: MapPin,
      action: () => navigate('/profile/addresses'),
      color: 'text-purple-600',
    },
    {
      title: 'Change Password',
      description: 'Update your password',
      icon: Lock,
      action: () => setIsChangePasswordModalOpen(true),
      color: 'text-orange-600',
    },
    {
      title: 'Delete Account',
      description: 'Permanently delete your account',
      icon: Trash2,
      action: () => {}, // Will be implemented later
      color: 'text-red-600',
      disabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {profileCards.map((card) => (
            <Card 
              key={card.title} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                card.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
              onClick={card.disabled ? undefined : card.action}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                </div>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="bg-destructive/5 border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Log Out
            </CardTitle>
            <CardDescription>
              Sign out of your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="w-full sm:w-auto"
            >
              Log Out
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen} 
        onClose={() => setIsChangePasswordModalOpen(false)} 
      />
    </div>
  );
};

export default Profile;