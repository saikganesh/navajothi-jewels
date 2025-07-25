import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoldPrice } from '@/hooks/useGoldPrice';
import { Clock } from 'lucide-react';

interface CheckoutTimerProps {
  onExpiry?: () => void;
}

const CheckoutTimer: React.FC<CheckoutTimerProps> = ({ onExpiry }) => {
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds
  const navigate = useNavigate();
  const { refetch } = useGoldPrice();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Timer expired
          clearInterval(timer);
          refetch(); // Fetch latest gold price
          navigate('/'); // Redirect to home
          if (onExpiry) onExpiry();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, refetch, onExpiry]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft <= 60) return 'text-red-600'; // Last minute - red
    if (timeLeft <= 300) return 'text-orange-600'; // Last 5 minutes - orange
    return 'text-red-700'; // Default - red
  };

  return (
    <div className="flex items-center gap-2">
      <Clock className={`h-4 w-4 ${getTimerColor()}`} />
      <span className={`font-mono text-sm font-semibold ${getTimerColor()}`}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
};

export default CheckoutTimer;