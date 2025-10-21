
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import ImageManager from '@/components/admin/ImageManager';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useCategories } from '@/hooks/useCategories';

interface Collection {
  id: string;
  name: string;
  category_id: string | null;
}

const AddProduct = () => {
  const navigate = useNavigate();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    collection_ids: [] as string[],
    karat_22kt_gross_weight: '',
    karat_22kt_stone_weight: '',
    karat_22kt_net_weight: 0,
    karat_22kt_stock_quantity: '',
    karat_18kt_gross_weight: '',
    karat_18kt_stone_weight: '',
    karat_18kt_net_weight: 0,
    karat_18kt_stock_quantity: '',
    available_karats: ['22kt'],
    images: [] as string[],
    making_charge_percentage: '',
    discount_percentage: '',
    quantity_type: 'pieces'
  });

  const [errors, setErrors] = useState({
    making_charge_percentage: '',
    discount_percentage: '',
    karat_22kt_stock_quantity: '',
    karat_18kt_stock_quantity: '',
    karat_22kt_gross_weight: '',
    karat_22kt_stone_weight: '',
    karat_18kt_gross_weight: '',
    karat_18kt_stone_weight: ''
  });

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('id, name, category_id');

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast({
        title: "Error",
        description: "Failed to fetch collections. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin');
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setUserProfile(profile);
      } catch (profileError) {
        if (session.user.email === 'admin@navajothi.com') {
          setUserProfile({
            email: session.user.email,
            full_name: 'Admin User',
            role: 'admin'
          });
        } else {
          navigate('/admin');
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      navigate('/admin');
    }
  };

  useEffect(() => {
    fetchCollections();
    fetchUserProfile();
  }, []);

  const validateInteger = (value: string, fieldName: string) => {
    if (value === '') return true;
    const integerRegex = /^\d+$/;
    return integerRegex.test(value);
  };

  const validateDecimal = (value: string, fieldName: string) => {
    if (value === '') return true;
    const decimalRegex = /^\d*\.?\d{0,3}$/;
    return decimalRegex.test(value);
  };

  const handleInputChange = (field: string, value: string) => {
    let isValid = true;
    let errorMessage = '';

    if (field === 'making_charge_percentage' || field === 'discount_percentage' || field === 'karat_22kt_stock_quantity' || field === 'karat_18kt_stock_quantity') {
      isValid = validateInteger(value, field);
      errorMessage = isValid ? '' : 'Please enter a valid integer';
    } else if (['karat_22kt_gross_weight', 'karat_22kt_stone_weight', 'karat_18kt_gross_weight', 'karat_18kt_stone_weight'].includes(field)) {
      isValid = validateDecimal(value, field);
      errorMessage = isValid ? '' : 'Please enter a valid decimal (up to 3 decimal places)';
    }

    if (isValid) {
      setFormData(prev => {
        const newData = { ...prev, [field]: value };
        
        // Calculate net weights when gross or stone weights change
        if (field === 'karat_22kt_gross_weight' || field === 'karat_22kt_stone_weight') {
          const grossWeight = parseFloat(field === 'karat_22kt_gross_weight' ? value : prev.karat_22kt_gross_weight) || 0;
          const stoneWeight = parseFloat(field === 'karat_22kt_stone_weight' ? value : prev.karat_22kt_stone_weight) || 0;
          newData.karat_22kt_net_weight = parseFloat((grossWeight - stoneWeight).toFixed(3));
        }
        
        if (field === 'karat_18kt_gross_weight' || field === 'karat_18kt_stone_weight') {
          const grossWeight = parseFloat(field === 'karat_18kt_gross_weight' ? value : prev.karat_18kt_gross_weight) || 0;
          const stoneWeight = parseFloat(field === 'karat_18kt_stone_weight' ? value : prev.karat_18kt_stone_weight) || 0;
          newData.karat_18kt_net_weight = parseFloat((grossWeight - stoneWeight).toFixed(3));
        }
        
        return newData;
      });

      setErrors(prev => ({ ...prev, [field]: '' }));
    } else {
      setErrors(prev => ({ ...prev, [field]: errorMessage }));
    }
  };

  const handleCollectionSelect = (collectionId: string) => {
    setFormData(prev => {
      const isSelected = prev.collection_ids.includes(collectionId);
      if (isSelected) {
        return {
          ...prev,
          collection_ids: prev.collection_ids.filter(id => id !== collectionId)
        };
      } else {
        return {
          ...prev,
          collection_ids: [...prev.collection_ids, collectionId]
        };
      }
    });
  };

  const removeCollection = (collectionId: string) => {
    setFormData(prev => ({
      ...prev,
      collection_ids: prev.collection_ids.filter(id => id !== collectionId)
    }));
  };

  const getSelectedCollections = () => {
    return collections.filter(collection => 
      formData.collection_ids.includes(collection.id)
    );
  };

  const handleImageUpload = async (file: File) => {
    setIsImageUploading(true);
    try {
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `product_image_${timestamp}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const publicURL = `https://nauojezdlsfagudtqpcg.supabase.co/storage/v1/object/public/product-images/${filePath}`;
      setFormData(prev => ({ ...prev, images: [...prev.images, publicURL] }));
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleSave = async () => {
    // Check for validation errors
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (hasErrors) {
      toast({
        title: "Validation Error",
        description: "Please fix all validation errors before saving.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Insert the main product
      const productData = {
        name: formData.name,
        description: formData.description,
        available_karats: formData.available_karats,
        images: formData.images,
        making_charge_percentage: formData.making_charge_percentage ? parseInt(formData.making_charge_percentage) : 0,
        discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null,
        product_type: formData.quantity_type,
        collection_ids: formData.collection_ids,
        category_id: formData.category_id,
        type: 'product',
        parent_product_id: null
      };

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (productError) throw productError;

      // Handle 22kt data
      if (formData.karat_22kt_gross_weight || formData.karat_22kt_stone_weight || formData.karat_22kt_stock_quantity) {
        const karat22ktData = {
          product_id: product.id,
          gross_weight: formData.karat_22kt_gross_weight ? parseFloat(formData.karat_22kt_gross_weight) : null,
          stone_weight: formData.karat_22kt_stone_weight ? parseFloat(formData.karat_22kt_stone_weight) : null,
          net_weight: formData.karat_22kt_net_weight,
          stock_quantity: formData.karat_22kt_stock_quantity ? parseInt(formData.karat_22kt_stock_quantity) : 0
        };

        const { error: karat22ktError } = await supabase
          .from('karat_22kt')
          .insert(karat22ktData);

        if (karat22ktError) throw karat22ktError;
      }

      // Handle 18kt data
      if (formData.karat_18kt_gross_weight || formData.karat_18kt_stone_weight || formData.karat_18kt_stock_quantity) {
        const karat18ktData = {
          product_id: product.id,
          gross_weight: formData.karat_18kt_gross_weight ? parseFloat(formData.karat_18kt_gross_weight) : null,
          stone_weight: formData.karat_18kt_stone_weight ? parseFloat(formData.karat_18kt_stone_weight) : null,
          net_weight: formData.karat_18kt_net_weight,
          stock_quantity: formData.karat_18kt_stock_quantity ? parseInt(formData.karat_18kt_stock_quantity) : 0
        };

        const { error: karat18ktError } = await supabase
          .from('karat_18kt')
          .insert(karat18ktData);

        if (karat18ktError) throw karat18ktError;
      }

      toast({
        title: "Success",
        description: "Product added successfully.",
      });

      navigate('/admin/products');
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <AdminHeader userProfile={userProfile} />
          
          <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-navy">Add New Product</h1>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter product name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter product description"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="making_charge">Making Charge (%)</Label>
                        <Input
                          id="making_charge"
                          type="text"
                          value={formData.making_charge_percentage}
                          onChange={(e) => handleInputChange('making_charge_percentage', e.target.value)}
                          placeholder="Enter making charge %"
                          required
                        />
                        {errors.making_charge_percentage && (
                          <p className="text-sm text-red-500 mt-1">{errors.making_charge_percentage}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="discount">Discount (%)</Label>
                        <Input
                          id="discount"
                          type="text"
                          value={formData.discount_percentage}
                          onChange={(e) => handleInputChange('discount_percentage', e.target.value)}
                          placeholder="Enter discount %"
                        />
                        {errors.discount_percentage && (
                          <p className="text-sm text-red-500 mt-1">{errors.discount_percentage}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Quantity Type</Label>
                      <RadioGroup
                        value={formData.quantity_type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, quantity_type: value }))}
                        className="flex gap-6 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pieces" id="pieces" />
                          <Label htmlFor="pieces">Pieces</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pairs" id="pairs" />
                          <Label htmlFor="pairs">Pairs</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="collections">Collections</Label>
                      <Select onValueChange={handleCollectionSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select collections" />
                        </SelectTrigger>
                        <SelectContent>
                          {collections.map((collection) => (
                            <SelectItem key={collection.id} value={collection.id}>
                              {collection.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {formData.collection_ids.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {getSelectedCollections().map((collection) => (
                            <Badge key={collection.id} variant="secondary" className="flex items-center gap-1">
                              {collection.name}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                                onClick={() => removeCollection(collection.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Available Karats</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['22kt', '18kt', '14kt', '9kt'].map((karat) => (
                          <div key={karat} className="flex items-center space-x-2">
                            <Checkbox
                              id={`karat-${karat}`}
                              checked={formData.available_karats.includes(karat)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData(prev => ({ ...prev, available_karats: [...prev.available_karats, karat] }));
                                } else {
                                  setFormData(prev => ({ ...prev, available_karats: prev.available_karats.filter(k => k !== karat) }));
                                }
                              }}
                            />
                            <Label htmlFor={`karat-${karat}`}>{karat.toUpperCase()}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Product Images</Label>
                      <ImageManager
                        images={formData.images}
                        onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                        maxImages={5}
                        onFileChange={(files) => {
                          if (files && files.length > 0) {
                            handleImageUpload(files[0]);
                          }
                        }}
                        label="Upload Product Images"
                        multiple={true}
                      />
                    </div>

                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <Button variant="outline" onClick={() => navigate('/admin/products')}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark text-navy">
                    Save Product
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AddProduct;
