
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import ImageManager from '@/components/admin/ImageManager';
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
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([]);
  const [isImageUploading, setIsImageUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    collection_id: '',
    in_stock: true,
    karat_22kt_gross_weight: '',
    karat_22kt_stone_weight: '',
    karat_22kt_net_weight: 0,
    karat_18kt_gross_weight: '',
    karat_18kt_stone_weight: '',
    karat_18kt_net_weight: 0,
    available_karats: ['22kt'],
    images: [] as string[],
    making_charge_percentage: '',
    discount_percentage: '',
    apply_same_mc: false,
    apply_same_discount: false,
    quantity_type: 'pieces'
  });

  const [errors, setErrors] = useState({
    making_charge_percentage: '',
    discount_percentage: '',
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
      setFilteredCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast({
        title: "Error",
        description: "Failed to fetch collections. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  // Filter collections based on selected category
  useEffect(() => {
    if (formData.category_id) {
      const filtered = collections.filter(collection => 
        collection.category_id === formData.category_id
      );
      setFilteredCollections(filtered);
    } else {
      setFilteredCollections(collections);
    }
    // Reset collection selection when category changes
    setFormData(prev => ({ ...prev, collection_id: '' }));
  }, [formData.category_id, collections]);

  const validateInteger = (value: string, fieldName: string) => {
    if (value === '') return true;
    const integerRegex = /^\d+$/;
    return integerRegex.test(value);
  };

  const validateDecimal = (value: string, fieldName: string) => {
    if (value === '') return true;
    const decimalRegex = /^\d+(\.\d{1,3})?$/;
    return decimalRegex.test(value);
  };

  const handleInputChange = (field: string, value: string) => {
    let isValid = true;
    let errorMessage = '';

    if (field === 'making_charge_percentage' || field === 'discount_percentage') {
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
          newData.karat_22kt_net_weight = grossWeight - stoneWeight;
        }
        
        if (field === 'karat_18kt_gross_weight' || field === 'karat_18kt_stone_weight') {
          const grossWeight = parseFloat(field === 'karat_18kt_gross_weight' ? value : prev.karat_18kt_gross_weight) || 0;
          const stoneWeight = parseFloat(field === 'karat_18kt_stone_weight' ? value : prev.karat_18kt_stone_weight) || 0;
          newData.karat_18kt_net_weight = grossWeight - stoneWeight;
        }
        
        return newData;
      });

      setErrors(prev => ({ ...prev, [field]: '' }));
    } else {
      setErrors(prev => ({ ...prev, [field]: errorMessage }));
    }
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

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        collection_id: formData.collection_id || null,
        in_stock: formData.in_stock,
        carat_22kt_gross_weight: formData.karat_22kt_gross_weight ? parseFloat(formData.karat_22kt_gross_weight) : null,
        carat_22kt_stone_weight: formData.karat_22kt_stone_weight ? parseFloat(formData.karat_22kt_stone_weight) : null,
        carat_22kt_net_weight: formData.karat_22kt_net_weight,
        carat_18kt_gross_weight: formData.karat_18kt_gross_weight ? parseFloat(formData.karat_18kt_gross_weight) : null,
        carat_18kt_stone_weight: formData.karat_18kt_stone_weight ? parseFloat(formData.karat_18kt_stone_weight) : null,
        carat_18kt_net_weight: formData.karat_18kt_net_weight,
        available_carats: formData.available_karats,
        images: formData.images,
        making_charge_percentage: formData.making_charge_percentage ? parseInt(formData.making_charge_percentage) : 0,
        discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null,
        apply_same_mc: formData.apply_same_mc,
        apply_same_discount: formData.apply_same_discount,
        product_type: formData.quantity_type
      };

      const { error } = await supabase
        .from('products')
        .insert([productData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product created successfully.",
      });

      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="making_charge">Making Charge (%) *</Label>
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

                <div className="space-y-2 pt-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="apply_same_mc"
                      checked={formData.apply_same_mc}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, apply_same_mc: checked as boolean }))}
                    />
                    <Label htmlFor="apply_same_mc" className="text-sm">Apply Same MC</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="apply_same_discount"
                      checked={formData.apply_same_discount}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, apply_same_discount: checked as boolean }))}
                    />
                    <Label htmlFor="apply_same_discount" className="text-sm">Apply Same DIS</Label>
                  </div>
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
                <Label htmlFor="collection">Collection</Label>
                <Select
                  value={formData.collection_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, collection_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select collection" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCollections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        {collection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in_stock"
                  checked={formData.in_stock}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, in_stock: checked as boolean }))}
                />
                <Label htmlFor="in_stock">In Stock</Label>
              </div>

              <div>
                <Label>Available Karats</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['22kt', '18kt'].map((karat) => (
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

              {/* 22KT Weight Fields */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold">22KT Gold Weights</Label>
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <Label htmlFor="22kt_gross_weight">Gross Weight (g)</Label>
                    <Input
                      id="22kt_gross_weight"
                      type="text"
                      value={formData.karat_22kt_gross_weight}
                      onChange={(e) => handleInputChange('karat_22kt_gross_weight', e.target.value)}
                      placeholder="Enter gross weight"
                    />
                    {errors.karat_22kt_gross_weight && (
                      <p className="text-sm text-red-500 mt-1">{errors.karat_22kt_gross_weight}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="22kt_stone_weight">Stone Weight (g)</Label>
                    <Input
                      id="22kt_stone_weight"
                      type="text"
                      value={formData.karat_22kt_stone_weight}
                      onChange={(e) => handleInputChange('karat_22kt_stone_weight', e.target.value)}
                      placeholder="Enter stone weight"
                    />
                    {errors.karat_22kt_stone_weight && (
                      <p className="text-sm text-red-500 mt-1">{errors.karat_22kt_stone_weight}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="22kt_net_weight">Net Weight (g)</Label>
                    <Input
                      id="22kt_net_weight"
                      type="number"
                      value={formData.karat_22kt_net_weight}
                      readOnly
                      disabled
                      className="bg-muted"
                      placeholder="Calculated automatically"
                    />
                  </div>
                </div>
              </div>

              {/* 18KT Weight Fields */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold">18KT Gold Weights</Label>
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <Label htmlFor="18kt_gross_weight">Gross Weight (g)</Label>
                    <Input
                      id="18kt_gross_weight"
                      type="text"
                      value={formData.karat_18kt_gross_weight}
                      onChange={(e) => handleInputChange('karat_18kt_gross_weight', e.target.value)}
                      placeholder="Enter gross weight"
                    />
                    {errors.karat_18kt_gross_weight && (
                      <p className="text-sm text-red-500 mt-1">{errors.karat_18kt_gross_weight}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="18kt_stone_weight">Stone Weight (g)</Label>
                    <Input
                      id="18kt_stone_weight"
                      type="text"
                      value={formData.karat_18kt_stone_weight}
                      onChange={(e) => handleInputChange('karat_18kt_stone_weight', e.target.value)}
                      placeholder="Enter stone weight"
                    />
                    {errors.karat_18kt_stone_weight && (
                      <p className="text-sm text-red-500 mt-1">{errors.karat_18kt_stone_weight}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="18kt_net_weight">Net Weight (g)</Label>
                    <Input
                      id="18kt_net_weight"
                      type="number"
                      value={formData.karat_18kt_net_weight}
                      readOnly
                      disabled
                      className="bg-muted"
                      placeholder="Calculated automatically"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={() => navigate('/admin/products')}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark text-navy">
              Create Product
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProduct;
