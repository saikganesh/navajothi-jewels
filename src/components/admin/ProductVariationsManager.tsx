import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import ImageManager from './ImageManager';

interface ProductVariation {
  id: string;
  variation_name: string;
  description: string | null;
  in_stock: boolean;
  available_karats: string[];
  images: string[];
  making_charge_percentage: number;
  discount_percentage: number | null;
  product_type: string;
}

interface ProductVariationsManagerProps {
  productId: string;
}

const ProductVariationsManager = ({ productId }: ProductVariationsManagerProps) => {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    variation_name: '',
    description: '',
    in_stock: true,
    available_karats: ['22kt'],
    images: [] as string[],
    making_charge_percentage: '',
    discount_percentage: '',
    quantity_type: 'pieces',
    karat_22kt_gross_weight: '',
    karat_22kt_stone_weight: '',
    karat_22kt_net_weight: 0,
    karat_22kt_stock_quantity: '',
    karat_18kt_gross_weight: '',
    karat_18kt_stone_weight: '',
    karat_18kt_net_weight: 0,
    karat_18kt_stock_quantity: ''
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

  useEffect(() => {
    fetchVariations();
  }, [productId]);

  const fetchVariations = async () => {
    try {
      const { data, error } = await supabase
        .from('product_variations')
        .select('*')
        .eq('parent_product_id', productId);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(variation => ({
        id: variation.id,
        variation_name: variation.variation_name,
        description: variation.description,
        in_stock: variation.in_stock,
        available_karats: Array.isArray(variation.available_karats) 
          ? variation.available_karats as string[]
          : [],
        images: Array.isArray(variation.images) 
          ? variation.images as string[]
          : [],
        making_charge_percentage: variation.making_charge_percentage,
        discount_percentage: variation.discount_percentage,
        product_type: variation.product_type
      }));
      
      setVariations(transformedData);
    } catch (error) {
      console.error('Error fetching variations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch variations.",
        variant: "destructive",
      });
    }
  };

  const validateInteger = (value: string) => {
    if (value === '') return true;
    const integerRegex = /^\d+$/;
    return integerRegex.test(value);
  };

  const validateDecimal = (value: string) => {
    if (value === '') return true;
    const decimalRegex = /^\d*\.?\d{0,3}$/;
    return decimalRegex.test(value);
  };

  const handleInputChange = (field: string, value: string) => {
    let isValid = true;
    let errorMessage = '';

    if (field === 'making_charge_percentage' || field === 'discount_percentage' || field === 'karat_22kt_stock_quantity' || field === 'karat_18kt_stock_quantity') {
      isValid = validateInteger(value);
      errorMessage = isValid ? '' : 'Please enter a valid integer';
    } else if (['karat_22kt_gross_weight', 'karat_22kt_stone_weight', 'karat_18kt_gross_weight', 'karat_18kt_stone_weight'].includes(field)) {
      isValid = validateDecimal(value);
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
    try {
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `variation_image_${timestamp}.${fileExt}`;
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
    }
  };

  const resetForm = () => {
    setFormData({
      variation_name: '',
      description: '',
      in_stock: true,
      available_karats: ['22kt'],
      images: [],
      making_charge_percentage: '',
      discount_percentage: '',
      quantity_type: 'pieces',
      karat_22kt_gross_weight: '',
      karat_22kt_stone_weight: '',
      karat_22kt_net_weight: 0,
      karat_22kt_stock_quantity: '',
      karat_18kt_gross_weight: '',
      karat_18kt_stone_weight: '',
      karat_18kt_net_weight: 0,
      karat_18kt_stock_quantity: ''
    });
    setErrors({
      making_charge_percentage: '',
      discount_percentage: '',
      karat_22kt_stock_quantity: '',
      karat_18kt_stock_quantity: '',
      karat_22kt_gross_weight: '',
      karat_22kt_stone_weight: '',
      karat_18kt_gross_weight: '',
      karat_18kt_stone_weight: ''
    });
  };

  const handleSaveVariation = async () => {
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

    if (!formData.variation_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Variation name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Insert the variation
      const variationData = {
        parent_product_id: productId,
        variation_name: formData.variation_name,
        description: formData.description || null,
        in_stock: formData.in_stock,
        available_karats: formData.available_karats,
        images: formData.images,
        making_charge_percentage: formData.making_charge_percentage ? parseInt(formData.making_charge_percentage) : 0,
        discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null,
        product_type: formData.quantity_type
      };

      const { data: newVariation, error: variationError } = await supabase
        .from('product_variations')
        .insert(variationData)
        .select()
        .single();

      if (variationError) throw variationError;

      // Handle 22kt data
      if (formData.karat_22kt_gross_weight || formData.karat_22kt_stone_weight || formData.karat_22kt_stock_quantity) {
        const karat22ktData = {
          product_id: newVariation.id,
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
          product_id: newVariation.id,
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
        description: "Variation created successfully.",
      });

      resetForm();
      setShowForm(false);
      fetchVariations();
    } catch (error) {
      console.error('Error saving variation:', error);
      toast({
        title: "Error",
        description: "Failed to save variation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVariation = () => {
    resetForm();
    setShowForm(true);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Add New Variation</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="variation_name">Variation Name *</Label>
              <Input
                id="variation_name"
                value={formData.variation_name}
                onChange={(e) => setFormData(prev => ({ ...prev, variation_name: e.target.value }))}
                placeholder="Enter variation name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter variation description"
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
              <Label>Variation Images</Label>
              <ImageManager
                images={formData.images}
                onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                maxImages={5}
                onFileChange={(files) => {
                  if (files && files.length > 0) {
                    handleImageUpload(files[0]);
                  }
                }}
                label="Upload Variation Images"
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
                <div>
                  <Label htmlFor="22kt_stock_quantity">22KT Stock Quantity</Label>
                  <Input
                    id="22kt_stock_quantity"
                    type="text"
                    value={formData.karat_22kt_stock_quantity}
                    onChange={(e) => handleInputChange('karat_22kt_stock_quantity', e.target.value)}
                    placeholder="Enter 22kt stock quantity"
                  />
                  {errors.karat_22kt_stock_quantity && (
                    <p className="text-sm text-red-500 mt-1">{errors.karat_22kt_stock_quantity}</p>
                  )}
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
                <div>
                  <Label htmlFor="18kt_stock_quantity">18KT Stock Quantity</Label>
                  <Input
                    id="18kt_stock_quantity"
                    type="text"
                    value={formData.karat_18kt_stock_quantity}
                    onChange={(e) => handleInputChange('karat_18kt_stock_quantity', e.target.value)}
                    placeholder="Enter 18kt stock quantity"
                  />
                  {errors.karat_18kt_stock_quantity && (
                    <p className="text-sm text-red-500 mt-1">{errors.karat_18kt_stock_quantity}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSaveVariation} disabled={isLoading} className="bg-gold hover:bg-gold-dark text-navy">
            {isLoading ? 'Saving...' : 'Save Variation'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Variations</h3>
        <Button onClick={handleAddVariation} className="bg-gold hover:bg-gold-dark text-navy">
          Add Variation
        </Button>
      </div>

      {variations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No variations found. Click "Add Variation" to create one.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Available Karats</TableHead>
              <TableHead>Making Charge (%)</TableHead>
              <TableHead>Discount (%)</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variations.map((variation) => (
              <TableRow key={variation.id}>
                <TableCell className="font-medium">{variation.variation_name}</TableCell>
                <TableCell>{variation.description || '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {variation.available_karats.map((karat) => (
                      <Badge key={karat} variant="secondary">
                        {karat.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{variation.making_charge_percentage}%</TableCell>
                <TableCell>{variation.discount_percentage ? `${variation.discount_percentage}%` : '-'}</TableCell>
                <TableCell className="capitalize">{variation.product_type}</TableCell>
                <TableCell>
                  <Badge variant={variation.in_stock ? "default" : "secondary"}>
                    {variation.in_stock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ProductVariationsManager;
