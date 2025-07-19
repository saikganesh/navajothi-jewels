
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, User, Package, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useCategories } from '@/hooks/useCategories';
import { useWishlist } from '@/hooks/useWishlist';

import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import UserProfile from './UserProfile';
import SearchModal from './SearchModal';
import CartModal from './CartModal';
import WishlistDropdown from './WishlistDropdown';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { items } = useCart();
  const { wishlistCount } = useWishlist();
  
  // Use the cached categories hook
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    ...categories.map(category => ({
      name: category.name,
      href: `/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`
    })),
    { name: 'Products', href: '/products' },
    { name: 'Collections', href: '/collections' },
    { name: 'Bulk Order', href: '/bulk-order' },
    { name: 'About Us', href: '/about-us' },
    { name: 'Contact', href: '/contact' },
  ];

  console.log('Navigation items:', navigation);

  return (
    <>
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <img 
                  src="/lovable-uploads/636f1948-abd1-4971-9a0f-9daa26e9ce83.png" 
                  alt="Navajothi & Co Logo" 
                  className="h-10 w-auto"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {categoriesLoading ? (
                // Show skeleton loading for categories
                <>
                  <div className="h-5 w-12 bg-muted animate-pulse rounded"></div>
                  <div className="h-5 w-16 bg-muted animate-pulse rounded"></div>
                  <div className="h-5 w-14 bg-muted animate-pulse rounded"></div>
                </>
              ) : (
                navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-foreground hover:text-gold transition-colors duration-200 font-medium"
                  >
                    {item.name}
                  </Link>
                ))
              )}
            </nav>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden md:flex"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Wishlist Icon */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden md:flex relative"
                title="Wishlist"
                onClick={() => setIsWishlistOpen(!isWishlistOpen)}
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gold text-navy text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Button>

              {/* My Orders Icon */}
              {user && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hidden md:flex"
                  title="My Orders"
                >
                  <Package className="h-5 w-5" />
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gold text-navy text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </Button>

              {user ? (
                <UserProfile user={user} />
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-border bg-background">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {categoriesLoading ? (
                  // Show skeleton loading for mobile categories
                  <>
                    <div className="h-8 w-20 bg-muted animate-pulse rounded mx-3 my-2"></div>
                    <div className="h-8 w-24 bg-muted animate-pulse rounded mx-3 my-2"></div>
                    <div className="h-8 w-18 bg-muted animate-pulse rounded mx-3 my-2"></div>
                  </>
                ) : (
                  navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block px-3 py-2 text-foreground hover:text-gold transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))
                )}
                <div className="px-3 py-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => {
                      setIsSearchOpen(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
                <div className="px-3 py-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start relative"
                    onClick={() => {
                      setIsWishlistOpen(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="ml-auto bg-gold text-navy text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {wishlistCount}
                      </span>
                    )}
                  </Button>
                </div>
                {user && (
                  <div className="px-3 py-2">
                    <Button variant="ghost" className="w-full justify-start">
                      <Package className="h-4 w-4 mr-2" />
                      My Orders
                    </Button>
                  </div>
                )}
                {!user && (
                  <div className="px-3 py-2">
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      {/* Cart Modal */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Wishlist Dropdown */}
      <WishlistDropdown isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </>
  );
};

export default Header;
