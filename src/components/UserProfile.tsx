
import React from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface UserProfileProps {
  user: any;
}

const UserProfile = ({ user }: UserProfileProps) => {
  const navigate = useNavigate();

  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={() => navigate('/profile')}
    >
      <User className="h-5 w-5" />
    </Button>
  );
};

export default UserProfile;
