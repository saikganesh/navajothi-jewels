
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Try to check profile from database
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile && profile.role === 'admin') {
              navigate('/admin/dashboard');
            } else if (session.user.email === 'admin@sujanajewels.com') {
              // Allow admin access if email matches admin pattern (fallback for missing profile)
              navigate('/admin/dashboard');
            }
          } catch (profileError) {
            // If profile doesn't exist but email is admin email, allow access
            if (session.user.email === 'admin@sujanajewels.com') {
              navigate('/admin/dashboard');
            }
          }
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      }
    };

    checkUser();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        // Try to check profile from database
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile && profile.role === 'admin') {
            toast({
              title: "Success",
              description: "Logged in successfully!",
            });
            navigate('/admin/dashboard');
          } else if (data.user.email === 'admin@sujanajewels.com') {
            // Allow admin access if email matches admin pattern (fallback for missing profile)
            toast({
              title: "Success",
              description: "Logged in successfully!",
            });
            navigate('/admin/dashboard');
          } else {
            await supabase.auth.signOut();
            toast({
              title: "Access Denied",
              description: "You don't have admin privileges.",
              variant: "destructive",
            });
          }
        } catch (profileError) {
          // If profile doesn't exist but email is admin email, allow access
          if (data.user.email === 'admin@sujanajewels.com') {
            toast({
              title: "Success",
              description: "Logged in successfully!",
            });
            navigate('/admin/dashboard');
          } else {
            await supabase.auth.signOut();
            toast({
              title: "Access Denied",
              description: "You don't have admin privileges.",
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@sujanajewels.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
