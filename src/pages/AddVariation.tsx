
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import ImageManager from '@/components/admin/ImageManager';

const AddVariation = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    variation_name: '',
    description: '',
    available_karats: ['22kt'],
    images: [] as string[],
    making_charge_percentage: 0,
    discount_percentage: '',
    quantity_type: 'pieces'
  });

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('type', 'product') // Ensure we're fetching a main product, not a variation
        .single();

      if (error) throw error;

      if (data) {
        setProduct(data);
        // Pre-fill some fields from parent product
        setFormData(prev => ({
          ...prev,
          making_charge_percentage: data.making_charge_percentage || 0,
          discount_percentage: data.discount_percentage?.toString() || '',
          quantity_type: data.product_type || 'pieces',
          available_karats: Array.isArray(data.available_karats) ? data.available_karats as string[] : ['22kt']
        }));
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsImageUploading(true);
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
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.variation_name.trim()) {
        toast({
          title: "Validation Error",
          description: "Variation name is required.",
          variant: "destructive",
        });
        return;
      }

      const variationData = {
        name: formData.variation_name,
        description: formData.description,
        available_karats: formData.available_karats,
        images: formData.images,
        making_charge_percentage: formData.making_charge_percentage,
        discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null,
        product_type: formData.quantity_type,
        type: 'variation',
        parent_product_id: productId,
        // Copy these fields from the parent product
        category_id: product?.category_id,
        collection_ids: product?.collection_ids,
        apply_same_mc: product?.apply_same_mc || false,
        apply_same_discount: product?.apply_same_discount || false
      };

      const { error } = await supabase
        .from('products')
        .insert(variationData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Variation created successfully.",
      });

      navigate(`/admin/products/edit/${productId}`);
    } catch (error) {
      console.error('Error saving variation:', error);
      toast({
        title: "Error",
        description: "Failed to save variation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/admin/products/edit/${productId}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Product
        </Button>
        <h1 className="text-2xl font-bold text-navy">Add Product Variation</h1>
        {product && <span className="text-muted-foreground">for "{product.name}"</span>}
      </div>

      <Card>
        <CardContent className="p-6">
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
                  <Label htmlFor="making_charge">Making Charge (%) *</Label>
                  <Input
                    id="making_charge"
                    type="number"
                    value={formData.making_charge_percentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, making_charge_percentage: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter making charge %"
                    min="0"
                    step="1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_percentage: e.target.value }))}
                    placeholder="Enter discount %"
                    min="0"
                    step="1"
                  />
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
                        id={`available-karat-${karat}`}
                        checked={formData.available_karats.includes(karat)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({ ...prev, available_karats: [...prev.available_karats, karat] }));
                          } else {
                            setFormData(prev => ({ ...prev, available_karats: prev.available_karats.filter(k => k !== karat) }));
                          }
                        }}
                      />
                      <Label htmlFor={`available-karat-${karat}`}>{karat.toUpperCase()}</Label>
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
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={() => navigate(`/admin/products/edit/${productId}`)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark text-navy">
              Create Variation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddVariation;
