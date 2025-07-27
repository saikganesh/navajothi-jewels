import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { setRedirectAfterAuth } from '@/store/slices/authSlice';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { redirectAfterAuth } = useAppSelector((state) => state.auth);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (isSignUp) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getErrorMessage = (error: any) => {
    if (!error?.message) return 'An unexpected error occurred';
    
    const message = error.message.toLowerCase();
    
    if (message.includes('email not confirmed')) {
      return 'Please check your email and click the verification link before signing in.';
    }
    if (message.includes('invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (message.includes('user already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (message.includes('password should be at least')) {
      return 'Password must be at least 6 characters long.';
    }
    if (message.includes('invalid email')) {
      return 'Please enter a valid email address.';
    }
    if (message.includes('signup is disabled')) {
      return 'Account registration is currently disabled. Please contact support.';
    }
    
    return error.message;
  };

  const checkUserStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_disabled')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking user status:', error);
        return false;
      }

      return !data.is_disabled;
    } catch (error) {
      console.error('Error checking user status:', error);
      return false;
    }
  };

  const handleResendVerification = async () => {
    if (!pendingEmail) return;
    
    setIsResendingVerification(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verification Email Sent",
          description: "Please check your email for the verification link.",
        });
        setShowResendOption(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setShowResendOption(false);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        const errorMessage = getErrorMessage(error);
        
        // Check if it's an email verification error
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setPendingEmail(formData.email);
          setShowResendOption(true);
        }
        
        toast({
          title: "Sign In Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        // Check if user is disabled
        const isUserEnabled = await checkUserStatus(data.user.id);
        
        if (!isUserEnabled) {
          // Sign out the user immediately
          await supabase.auth.signOut();
          
          toast({
            title: "Account Disabled",
            description: "Your account has been disabled. Please contact support for assistance.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
        
        // Check for redirect URL from Redux store
        const redirectTo = redirectAfterAuth;
        if (redirectTo) {
          dispatch(setRedirectAfterAuth(null));
          navigate(redirectTo);
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during sign in.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setShowResendOption(false);
    
    try {
      // Sign up the user with metadata
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.name,
            phone: formData.phone,
          }
        },
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Account Created Successfully!",
          description: "Please check your email for a verification link to complete your registration.",
        });
        
        // Switch to sign in mode and pre-fill email
        setIsSignUp(false);
        setFormData(prev => ({ 
          ...prev, 
          password: '', 
          confirmPassword: '', 
          name: '', 
          phone: '' 
        }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during sign up.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/636f1948-abd1-4971-9a0f-9daa26e9ce83.png" 
              alt="Navajothi & Co Logo" 
              className="h-12 w-auto"
            />
          </div>
          <CardTitle className="text-center">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp 
              ? 'Join Navajothi & Co to start shopping for exquisite jewelry'
              : 'Enter your credentials to access your account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showResendOption && (
            <Alert>
              <AlertDescription className="flex flex-col gap-2">
                <span>Your email address needs to be verified before you can sign in.</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                  className="w-fit"
                >
                  {isResendingVerification ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {errors.email && (
              <Alert variant="destructive">
                <AlertDescription>{errors.email}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {errors.password && (
              <Alert variant="destructive">
                <AlertDescription>{errors.password}</AlertDescription>
              </Alert>
            )}
          </div>

          {isSignUp && (
            <>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.confirmPassword}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
                {errors.name && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.name}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          <Button
            onClick={isSignUp ? handleSignUp : handleSignIn}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setShowResendOption(false);
                  setErrors({});
                }}
              >
                {isSignUp ? 'Sign in here' : 'Sign up here'}
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
