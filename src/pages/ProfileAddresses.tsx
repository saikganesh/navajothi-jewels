import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus, Edit, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';


interface Address {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

const ProfileAddresses = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const { user, isLoading: authLoading, isInitialized } = useAppSelector((state) => state.auth);
  const { toast } = useToast();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (isInitialized && !user) {
      navigate('/auth');
    }
  }, [user, isInitialized, navigate]);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    is_default: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching addresses:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch addresses',
          variant: 'destructive',
        });
      } else {
        setAddresses(data || []);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!user?.id) return;

    try {
      const addressData = {
        ...formData,
        user_id: user.id,
      };

      if (editingAddress) {
        const { error } = await supabase
          .from('user_addresses')
          .update(addressData)
          .eq('id', editingAddress.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Address updated successfully' });
      } else {
        const { error } = await supabase
          .from('user_addresses')
          .insert([addressData]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Address added successfully' });
      }

      setIsDialogOpen(false);
      setEditingAddress(null);
      resetForm();
      fetchAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: 'Error',
        description: 'Failed to save address',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Address deleted successfully' });
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete address',
        variant: 'destructive',
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      // First, unset all default addresses
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      // Then set the selected address as default
      const { error } = await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Default address updated' });
      fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      toast({
        title: 'Error',
        description: 'Failed to update default address',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      first_name: address.first_name,
      last_name: address.last_name,
      email: address.email,
      phone: address.phone,
      address: address.address,
      city: address.city,
      pincode: address.pincode,
      is_default: address.is_default,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      pincode: '',
      is_default: false,
    });
  };

  const openAddDialog = () => {
    setEditingAddress(null);
    resetForm();
    setIsDialogOpen(true);
  };

  // Show loading state while checking authentication
  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading addresses...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/profile')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">My Addresses</h1>
                <p className="text-muted-foreground">{addresses.length} addresses</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        value={formData.pincode}
                        onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_default"
                      checked={formData.is_default}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked === true }))}
                    />
                    <Label htmlFor="is_default">Set as default address</Label>
                  </div>
                  <Button onClick={handleSaveAddress} className="w-full">
                    {editingAddress ? 'Update Address' : 'Save Address'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {addresses.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No addresses saved</h3>
                <p className="text-muted-foreground mb-6">Add your delivery addresses for faster checkout</p>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Address
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <Card key={address.id} className={address.is_default ? 'ring-2 ring-primary' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {address.first_name} {address.last_name}
                        {address.is_default && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(address)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm">{address.address}</p>
                    <p className="text-sm">{address.city}, {address.pincode}</p>
                    <p className="text-sm text-muted-foreground">{address.phone}</p>
                    <p className="text-sm text-muted-foreground">{address.email}</p>
                    {!address.is_default && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileAddresses;