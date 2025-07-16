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

const EditVariation = () => {
  const { id: variationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [variation, setVariation] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    variation_name: '',
    description: '',
    in_stock: true,
    gross_weight: 0,
    stone_weight: 0,
    net_weight: 0,
    karat: '22kt',
    karat_22kt_gross_weight: 0,
    karat_22kt_stone_weight: 0,
    karat_22kt_net_weight: 0,
    karat_18kt_gross_weight: 0,
    karat_18kt_stone_weight: 0,
    karat_18kt_net_weight: 0,
    available_karats: ['22kt'],
    images: [] as string[],
    making_charge_percentage: 0,
    discount_percentage: '',
    quantity_type: 'pieces'
  });

  useEffect(() => {
    if (variationId) {
      fetchVariation();
    }
  }, [variationId]);

  const fetchVariation = async () => {
    try {
      const { data, error } = await supabase
        .from('product_variations')
        .select(`
          *,
          products (
            id,
            name
          )
        `)
        .eq('id', variationId)
        .single();

      if (error) throw error;

      if (data) {
        setVariation(data);
        setProduct(data.products);
        
        // Map the variation data to form data
        setFormData({
          variation_name: data.variation_name || '',
          description: data.description || '',
          in_stock: data.in_stock,
          gross_weight: data.gross_weight || 0,
          stone_weight: data.stone_weight || 0,
          net_weight: data.net_weight || 0,
          karat: data.karat || '22kt',
          karat_22kt_gross_weight: data.karat_22kt_gross_weight || 0,
          karat_22kt_stone_weight: data.karat_22kt_stone_weight || 0,
          karat_22kt_net_weight: data.karat_22kt_net_weight || 0,
          karat_18kt_gross_weight: data.karat_18kt_gross_weight || 0,
          karat_18kt_stone_weight: data.karat_18kt_stone_weight || 0,
          karat_18kt_net_weight: data.karat_18kt_net_weight || 0,
          available_karats: Array.isArray(data.available_karats) ? data.available_karats as string[] : ['22kt'],
          images: Array.isArray(data.images) ? data.images as string[] : [],
          making_charge_percentage: data.making_charge_percentage || 0,
          discount_percentage: data.discount_percentage?.toString() || '',
          quantity_type: data.quantity_type || data.product_type || 'pieces'
        });
      }
    } catch (error) {
      console.error('Error fetching variation:', error);
      toast({
        title: "Error",
        description: "Failed to fetch variation details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

      const { error } = await supabase
        .from('product_variations')
        .update({
          variation_name: formData.variation_name,
          description: formData.description,
          in_stock: formData.in_stock,
          gross_weight: formData.gross_weight,
          stone_weight: formData.stone_weight,
          net_weight: formData.net_weight,
          karat: formData.karat as "22kt" | "18kt",
          karat_22kt_gross_weight: formData.karat_22kt_gross_weight,
          karat_22kt_stone_weight: formData.karat_22kt_stone_weight,
          karat_22kt_net_weight: formData.karat_22kt_net_weight,
          karat_18kt_gross_weight: formData.karat_18kt_gross_weight,
          karat_18kt_stone_weight: formData.karat_18kt_stone_weight,
          karat_18kt_net_weight: formData.karat_18kt_net_weight,
          available_karats: formData.available_karats,
          images: formData.images,
          making_charge_percentage: formData.making_charge_percentage,
          discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null,
          quantity_type: formData.quantity_type
        })
        .eq('id', variationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Variation updated successfully.",
      });

      navigate(`/admin/products/edit/${variation.parent_product_id}`);
    } catch (error) {
      console.error('Error updating variation:', error);
      toast({
        title: "Error",
        description: "Failed to update variation. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading variation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!variation) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Variation not found.</p>
            <Button onClick={() => navigate('/admin/products')} variant="outline">
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/admin/products/edit/${variation.parent_product_id}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Product
        </Button>
        <h1 className="text-2xl font-bold text-navy">Edit Variation</h1>
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
                <Label>Primary Karat</Label>
                <RadioGroup
                  value={formData.karat}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, karat: value }))}
                  className="flex gap-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="22kt" id="karat-22kt" />
                    <Label htmlFor="karat-22kt">22KT</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="18kt" id="karat-18kt" />
                    <Label htmlFor="karat-18kt">18KT</Label>
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

              {/* Basic Weight Fields */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold">Basic Weights</Label>
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <Label htmlFor="gross_weight">Gross Weight (g)</Label>
                    <Input
                      id="gross_weight"
                      type="number"
                      value={formData.gross_weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, gross_weight: parseFloat(e.target.value) || 0 }))}
                      placeholder="Enter gross weight"
                      min="0"
                      step="0.001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stone_weight">Stone Weight (g)</Label>
                    <Input
                      id="stone_weight"
                      type="number"
                      value={formData.stone_weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, stone_weight: parseFloat(e.target.value) || 0 }))}
                      placeholder="Enter stone weight"
                      min="0"
                      step="0.001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="net_weight">Net Weight (g)</Label>
                    <Input
                      id="net_weight"
                      type="number"
                      value={formData.net_weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, net_weight: parseFloat(e.target.value) || 0 }))}
                      placeholder="Enter net weight"
                      min="0"
                      step="0.001"
                    />
                  </div>
                </div>
              </div>

              {/* 22KT Weight Fields */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold">22KT Gold Weights</Label>
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <Label htmlFor="22kt_gross_weight">Gross Weight (g)</Label>
                    <Input
                      id="22kt_gross_weight"
                      type="number"
                      value={formData.karat_22kt_gross_weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, karat_22kt_gross_weight: parseFloat(e.target.value) || 0 }))}
                      placeholder="Enter gross weight"
                      min="0"
                      step="0.001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="22kt_stone_weight">Stone Weight (g)</Label>
                    <Input
                      id="22kt_stone_weight"
                      type="number"
                      value={formData.karat_22kt_stone_weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, karat_22kt_stone_weight: parseFloat(e.target.value) || 0 }))}
                      placeholder="Enter stone weight"
                      min="0"
                      step="0.001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="22kt_net_weight">Net Weight (g)</Label>
                    <Input
                      id="22kt_net_weight"
                      type="number"
                      value={formData.karat_22kt_net_weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, karat_22kt_net_weight: parseFloat(e.target.value) || 0 }))}
                      placeholder="Enter net weight"
                      min="0"
                      step="0.001"
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
                      type="number"
                      value={formData.karat_18kt_gross_weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, karat_18kt_gross_weight: parseFloat(e.target.value) || 0 }))}
                      placeholder="Enter gross weight"
                      min="0"
                      step="0.001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="18kt_stone_weight">Stone Weight (g)</Label>
                    <Input
                      id="18kt_stone_weight"
                      type="number"
                      value={formData.karat_18kt_stone_weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, karat_18kt_stone_weight: parseFloat(e.target.value) || 0 }))}
                      placeholder="Enter stone weight"
                      min="0"
                      step="0.001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="18kt_net_weight">Net Weight (g)</Label>
                    <Input
                      id="18kt_net_weight"
                      type="number"
                      value={formData.karat_18kt_net_weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, karat_18kt_net_weight: parseFloat(e.target.value) || 0 }))}
                      placeholder="Enter net weight"
                      min="0"
                      step="0.001"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={() => navigate(`/admin/products/edit/${variation.parent_product_id}`)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark text-navy">
              Update Variation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditVariation;