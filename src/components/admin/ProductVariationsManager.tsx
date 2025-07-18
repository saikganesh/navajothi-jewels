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
import { Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProductVariation {
  id: string;
  name: string;
  description: string | null;
  available_karats: string[];
  images: string[];
  making_charge_percentage: number;
  discount_percentage: number | null;
  product_type: string;
  type: string;
  parent_product_id: string;
}

interface ProductVariationsManagerProps {
  productId: string;
}

const ProductVariationsManager = ({ productId }: ProductVariationsManagerProps) => {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVariation, setEditingVariation] = useState<ProductVariation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    variation_name: '',
    description: '',
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
        .from('products')
        .select('*')
        .eq('parent_product_id', productId)
        .eq('type', 'variation');

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(variation => ({
        id: variation.id,
        name: variation.name,
        description: variation.description,
        available_karats: Array.isArray(variation.available_karats) 
          ? (variation.available_karats as string[]).filter((karat): karat is string => typeof karat === 'string')
          : [],
        images: Array.isArray(variation.images) 
          ? (variation.images as string[]).filter((img): img is string => typeof img === 'string')
          : [],
        making_charge_percentage: variation.making_charge_percentage,
        discount_percentage: variation.discount_percentage,
        product_type: variation.product_type,
        type: variation.type,
        parent_product_id: variation.parent_product_id
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

  const fetchVariationKaratData = async (variationId: string) => {
    try {
      console.log('Fetching karat data for variation:', variationId);
      
      // Fetch 22kt data - use maybeSingle() to handle cases where no data exists
      const { data: karat22kt, error: error22kt } = await supabase
        .from('karat_22kt')
        .select('*')
        .eq('product_id', variationId)
        .maybeSingle();

      if (error22kt) {
        console.error('Error fetching 22kt data:', error22kt);
      }

      // Fetch 18kt data - use maybeSingle() to handle cases where no data exists
      const { data: karat18kt, error: error18kt } = await supabase
        .from('karat_18kt')
        .select('*')
        .eq('product_id', variationId)
        .maybeSingle();

      if (error18kt) {
        console.error('Error fetching 18kt data:', error18kt);
      }

      console.log('Fetched karat data:', { karat22kt, karat18kt });
      return { karat22kt, karat18kt };
    } catch (error) {
      console.error('Error fetching karat data:', error);
      return { karat22kt: null, karat18kt: null };
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
    setEditingVariation(null);
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
      const variationData = {
        name: formData.variation_name,
        description: formData.description || null,
        available_karats: formData.available_karats,
        images: formData.images,
        making_charge_percentage: formData.making_charge_percentage ? parseInt(formData.making_charge_percentage) : 0,
        discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null,
        product_type: formData.quantity_type,
        type: 'variation',
        parent_product_id: productId
      };

      let variationId: string;

      if (editingVariation) {
        console.log('Updating existing variation:', editingVariation.id);
        // Update existing variation
        const { error: variationError } = await supabase
          .from('products')
          .update(variationData)
          .eq('id', editingVariation.id);

        if (variationError) throw variationError;
        variationId = editingVariation.id;
      } else {
        console.log('Creating new variation');
        // Insert new variation
        const { data: newVariation, error: variationError } = await supabase
          .from('products')
          .insert(variationData)
          .select()
          .single();

        if (variationError) throw variationError;
        variationId = newVariation.id;
        console.log('Created new variation with ID:', variationId);
      }

      // Handle 22kt data - only process if there's actual data to save
      const has22ktData = formData.karat_22kt_gross_weight || formData.karat_22kt_stone_weight || formData.karat_22kt_stock_quantity;
      if (has22ktData) {
        console.log('Processing 22kt data for variation:', variationId);
        
        // Check if existing record exists using maybeSingle()
        const { data: existing22kt, error: check22ktError } = await supabase
          .from('karat_22kt')
          .select('id')
          .eq('product_id', variationId)
          .maybeSingle();

        if (check22ktError) {
          console.error('Error checking existing 22kt data:', check22ktError);
          throw check22ktError;
        }

        const karat22ktData = {
          product_id: variationId, // This should reference the variation ID
          gross_weight: formData.karat_22kt_gross_weight ? parseFloat(formData.karat_22kt_gross_weight) : null,
          stone_weight: formData.karat_22kt_stone_weight ? parseFloat(formData.karat_22kt_stone_weight) : null,
          net_weight: formData.karat_22kt_net_weight,
          stock_quantity: formData.karat_22kt_stock_quantity ? parseInt(formData.karat_22kt_stock_quantity) : 0
        };

        console.log('22kt data to save:', karat22ktData);

        if (existing22kt) {
          console.log('Updating existing 22kt record');
          const { error } = await supabase
            .from('karat_22kt')
            .update(karat22ktData)
            .eq('product_id', variationId);
          if (error) {
            console.error('Error updating 22kt data:', error);
            throw error;
          }
        } else {
          console.log('Inserting new 22kt record');
          const { error } = await supabase
            .from('karat_22kt')
            .insert(karat22ktData);
          if (error) {
            console.error('Error inserting 22kt data:', error);
            throw error;
          }
        }
      }

      // Handle 18kt data - only process if there's actual data to save
      const has18ktData = formData.karat_18kt_gross_weight || formData.karat_18kt_stone_weight || formData.karat_18kt_stock_quantity;
      if (has18ktData) {
        console.log('Processing 18kt data for variation:', variationId);
        
        // Check if existing record exists using maybeSingle()
        const { data: existing18kt, error: check18ktError } = await supabase
          .from('karat_18kt')
          .select('id')
          .eq('product_id', variationId)
          .maybeSingle();

        if (check18ktError) {
          console.error('Error checking existing 18kt data:', check18ktError);
          throw check18ktError;
        }

        const karat18ktData = {
          product_id: variationId, // This should reference the variation ID
          gross_weight: formData.karat_18kt_gross_weight ? parseFloat(formData.karat_18kt_gross_weight) : null,
          stone_weight: formData.karat_18kt_stone_weight ? parseFloat(formData.karat_18kt_stone_weight) : null,
          net_weight: formData.karat_18kt_net_weight,
          stock_quantity: formData.karat_18kt_stock_quantity ? parseInt(formData.karat_18kt_stock_quantity) : 0
        };

        console.log('18kt data to save:', karat18ktData);

        if (existing18kt) {
          console.log('Updating existing 18kt record');
          const { error } = await supabase
            .from('karat_18kt')
            .update(karat18ktData)
            .eq('product_id', variationId);
          if (error) {
            console.error('Error updating 18kt data:', error);
            throw error;
          }
        } else {
          console.log('Inserting new 18kt record');
          const { error } = await supabase
            .from('karat_18kt')
            .insert(karat18ktData);
          if (error) {
            console.error('Error inserting 18kt data:', error);
            throw error;
          }
        }
      }

      toast({
        title: "Success",
        description: editingVariation ? "Variation updated successfully." : "Variation created successfully.",
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

  const handleEditVariation = async (variation: ProductVariation) => {
    console.log('Editing variation:', variation);
    
    // Fetch karat data for this variation
    const { karat22kt, karat18kt } = await fetchVariationKaratData(variation.id);
    
    setFormData({
      variation_name: variation.name,
      description: variation.description || '',
      available_karats: variation.available_karats,
      images: variation.images,
      making_charge_percentage: variation.making_charge_percentage.toString(),
      discount_percentage: variation.discount_percentage?.toString() || '',
      quantity_type: variation.product_type,
      karat_22kt_gross_weight: karat22kt?.gross_weight?.toString() || '',
      karat_22kt_stone_weight: karat22kt?.stone_weight?.toString() || '',
      karat_22kt_net_weight: karat22kt?.net_weight || 0,
      karat_22kt_stock_quantity: karat22kt?.stock_quantity?.toString() || '',
      karat_18kt_gross_weight: karat18kt?.gross_weight?.toString() || '',
      karat_18kt_stone_weight: karat18kt?.stone_weight?.toString() || '',
      karat_18kt_net_weight: karat18kt?.net_weight || 0,
      karat_18kt_stock_quantity: karat18kt?.stock_quantity?.toString() || ''
    });
    
    setEditingVariation(variation);
    setShowForm(true);
  };

  const handleDeleteVariation = async (variationId: string) => {
    try {
      console.log('Deleting variation:', variationId);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', variationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Variation deleted successfully.",
      });

      fetchVariations();
    } catch (error) {
      console.error('Error deleting variation:', error);
      toast({
        title: "Error",
        description: "Failed to delete variation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {editingVariation ? 'Edit Variation' : 'Add New Variation'}
          </h3>
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
            {isLoading ? 'Saving...' : editingVariation ? 'Update Variation' : 'Save Variation'}
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
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variations.map((variation) => (
              <TableRow key={variation.id}>
                <TableCell className="font-medium">{variation.name}</TableCell>
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditVariation(variation)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the variation
                            "{variation.name}" and all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteVariation(variation.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
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
