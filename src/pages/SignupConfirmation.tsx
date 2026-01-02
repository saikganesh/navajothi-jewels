import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const SignupConfirmation = () => {
  const navigate = useNavigate();
  const [timerStopped, setTimerStopped] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerStopped) return;

    timerRef.current = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [navigate, timerStopped]);

  useEffect(() => {
    const handleScroll = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setTimerStopped(true);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center text-2xl">
            Thanks for signing up
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            You will be able to purchase once your sign-up request has been approved by the admin.
          </p>
          {!timerStopped && (
            <p className="text-sm text-muted-foreground">
              Redirecting to home page in 10 seconds...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupConfirmation;
