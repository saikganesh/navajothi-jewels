
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import ImageManager from '@/components/admin/ImageManager';
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

interface Product {
  id: string;
  name: string;
  description: string;
  collection_id: string | null;
  in_stock: boolean;
  karat_22kt_gross_weight: number;
  karat_22kt_stone_weight: number;
  karat_22kt_net_weight: number;
  karat_18kt_gross_weight: number;
  karat_18kt_stone_weight: number;
  karat_18kt_net_weight: number;
  available_karats: string[];
  images: string[];
  making_charge_percentage: number;
  discount_percentage: number | null;
  apply_same_mc: boolean;
  apply_same_discount: boolean;
  quantity_type: string;
}

interface ProductVariation {
  id: string;
  parent_product_id: string;
  variation_name: string;
  description: string;
  net_weight: number;
  images: string[];
  in_stock: boolean;
  gross_weight: number;
  stone_weight: number;
  karat: string;
  karat_22kt_gross_weight: number;
  karat_22kt_stone_weight: number;
  karat_22kt_net_weight: number;
  karat_18kt_gross_weight: number;
  karat_18kt_stone_weight: number;
  karat_18kt_net_weight: number;
  available_karats: string[];
  making_charge_percentage: number;
  discount_percentage: number | null;
  quantity_type: string;
}

const EditProduct = () => {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [collections, setCollections] = useState<any[]>([]);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [showAddVariationForm, setShowAddVariationForm] = useState(false);
  const [isVariationImageUploading, setIsVariationImageUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    collection_id: '',
    in_stock: true,
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
    apply_same_mc: false,
    apply_same_discount: false,
    quantity_type: 'pieces'
  });

  const [variationFormData, setVariationFormData] = useState({
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
    quantity_type: 'pieces',
    apply_same_mc: false,
    apply_same_discount: false
  });

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchVariations();
      fetchCollections();
    }
  }, [productId]);

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*');

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      if (data) {
        const mappedProduct = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          collection_id: data.collection_id,
          in_stock: data.in_stock,
          karat_22kt_gross_weight: data.karat_22kt_gross_weight || 0,
          karat_22kt_stone_weight: data.karat_22kt_stone_weight || 0,
          karat_22kt_net_weight: data.karat_22kt_net_weight || 0,
          karat_18kt_gross_weight: data.karat_18kt_gross_weight || 0,
          karat_18kt_stone_weight: data.karat_18kt_stone_weight || 0,
          karat_18kt_net_weight: data.karat_18kt_net_weight || 0,
          available_karats: Array.isArray(data.available_karats) 
            ? (data.available_karats as string[])
            : ['22kt'],
          images: Array.isArray(data.images) 
            ? (data.images as string[])
            : [],
          making_charge_percentage: data.making_charge_percentage || 0,
          discount_percentage: data.discount_percentage,
          apply_same_mc: data.apply_same_mc || false,
          apply_same_discount: data.apply_same_discount || false,
          quantity_type: data.product_type || 'pieces'
        };

        setProduct(mappedProduct);
        setFormData({
          name: mappedProduct.name,
          description: mappedProduct.description,
          collection_id: mappedProduct.collection_id || '',
          in_stock: mappedProduct.in_stock,
          karat_22kt_gross_weight: mappedProduct.karat_22kt_gross_weight,
          karat_22kt_stone_weight: mappedProduct.karat_22kt_stone_weight,
          karat_22kt_net_weight: mappedProduct.karat_22kt_net_weight,
          karat_18kt_gross_weight: mappedProduct.karat_18kt_gross_weight,
          karat_18kt_stone_weight: mappedProduct.karat_18kt_stone_weight,
          karat_18kt_net_weight: mappedProduct.karat_18kt_net_weight,
          available_karats: mappedProduct.available_karats,
          images: mappedProduct.images,
          making_charge_percentage: mappedProduct.making_charge_percentage,
          discount_percentage: mappedProduct.discount_percentage?.toString() || '',
          apply_same_mc: mappedProduct.apply_same_mc,
          apply_same_discount: mappedProduct.apply_same_discount,
          quantity_type: mappedProduct.quantity_type
        });
        
        // Pre-fill variation form with parent product defaults
        setVariationFormData(prev => ({
          ...prev,
          making_charge_percentage: mappedProduct.making_charge_percentage,
          discount_percentage: mappedProduct.discount_percentage?.toString() || '',
          quantity_type: mappedProduct.quantity_type,
          available_karats: mappedProduct.available_karats
        }));
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVariations = async () => {
    try {
      const { data, error } = await supabase
        .from('product_variations')
        .select('*')
        .eq('parent_product_id', productId);

      if (error) throw error;

      const mappedVariations = (data || []).map(variation => ({
        id: variation.id,
        parent_product_id: variation.parent_product_id,
        variation_name: variation.variation_name,
        description: variation.description || '',
        net_weight: variation.net_weight || 0,
        images: Array.isArray(variation.images) ? (variation.images as string[]) : [],
        in_stock: variation.in_stock,
        gross_weight: variation.gross_weight || 0,
        stone_weight: variation.stone_weight || 0,
        karat: variation.karat || '22kt',
        karat_22kt_gross_weight: variation.karat_22kt_gross_weight || 0,
        karat_22kt_stone_weight: variation.karat_22kt_stone_weight || 0,
        karat_22kt_net_weight: variation.karat_22kt_net_weight || 0,
        karat_18kt_gross_weight: variation.karat_18kt_gross_weight || 0,
        karat_18kt_stone_weight: variation.karat_18kt_stone_weight || 0,
        karat_18kt_net_weight: variation.karat_18kt_net_weight || 0,
        available_karats: Array.isArray(variation.available_karats) 
          ? variation.available_karats as string[]
          : ['22kt'],
        making_charge_percentage: variation.making_charge_percentage || 0,
        discount_percentage: variation.discount_percentage,
        quantity_type: variation.product_type || 'pieces'
      }));

      setVariations(mappedVariations);
    } catch (error) {
      console.error('Error fetching variations:', error);
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
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          collection_id: formData.collection_id || null,
          in_stock: formData.in_stock,
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
          apply_same_mc: formData.apply_same_mc,
          apply_same_discount: formData.apply_same_discount,
          product_type: formData.quantity_type
        })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully.",
      });

      navigate('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVariationDelete = async (variationId: string) => {
    try {
      const { error } = await supabase
        .from('product_variations')
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

  const handleVariationImageUpload = async (file: File) => {
    setIsVariationImageUploading(true);
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
      setVariationFormData(prev => ({ ...prev, images: [...prev.images, publicURL] }));
    } catch (error) {
      console.error('Error uploading variation image:', error);
      toast({
        title: "Error",
        description: "Failed to upload variation image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVariationImageUploading(false);
    }
  };

  const handleVariationSave = async () => {
    try {
      if (!variationFormData.variation_name.trim()) {
        toast({
          title: "Validation Error",
          description: "Variation name is required.",
          variant: "destructive",
        });
        return;
      }

      const variationData = {
        parent_product_id: productId,
        variation_name: variationFormData.variation_name,
        description: variationFormData.description,
        in_stock: variationFormData.in_stock,
        gross_weight: variationFormData.gross_weight,
        stone_weight: variationFormData.stone_weight,
        net_weight: variationFormData.net_weight,
        karat: variationFormData.karat as "22kt" | "18kt",
        karat_22kt_gross_weight: variationFormData.karat_22kt_gross_weight,
        karat_22kt_stone_weight: variationFormData.karat_22kt_stone_weight,
        karat_22kt_net_weight: variationFormData.karat_22kt_net_weight,
        karat_18kt_gross_weight: variationFormData.karat_18kt_gross_weight,
        karat_18kt_stone_weight: variationFormData.karat_18kt_stone_weight,
        karat_18kt_net_weight: variationFormData.karat_18kt_net_weight,
        available_karats: variationFormData.available_karats,
        images: variationFormData.images,
        making_charge_percentage: variationFormData.making_charge_percentage,
        discount_percentage: variationFormData.discount_percentage ? parseInt(variationFormData.discount_percentage) : null,
        product_type: variationFormData.quantity_type
      };

      const { error } = await supabase
        .from('product_variations')
        .insert(variationData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Variation created successfully.",
      });

      // Reset form and hide it
      setVariationFormData({
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
        images: [],
        making_charge_percentage: product?.making_charge_percentage || 0,
        discount_percentage: product?.discount_percentage?.toString() || '',
        quantity_type: product?.quantity_type || 'pieces',
        apply_same_mc: false,
        apply_same_discount: false
      });
      setShowAddVariationForm(false);
      fetchVariations();
    } catch (error) {
      console.error('Error saving variation:', error);
      toast({
        title: "Error",
        description: "Failed to save variation. Please try again.",
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
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Product not found.</p>
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
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
        <h1 className="text-2xl font-bold text-navy">Edit Product</h1>
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
                <Label htmlFor="collection">Collection</Label>
                <Select
                  value={formData.collection_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, collection_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select collection" />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map((collection) => (
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
                      placeholder="0.000"
                      value={formData.karat_22kt_gross_weight?.toFixed(3) || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const regex = /^\d*\.?\d{0,3}$/;
                        if (regex.test(value)) {
                          setFormData(prev => ({ ...prev, karat_22kt_gross_weight: value ? parseFloat(value) : 0 }));
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="22kt_stone_weight">Stone Weight (g)</Label>
                    <Input
                      id="22kt_stone_weight"
                      type="text"
                      placeholder="0.000"
                      value={formData.karat_22kt_stone_weight?.toFixed(3) || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const regex = /^\d*\.?\d{0,3}$/;
                        if (regex.test(value)) {
                          setFormData(prev => ({ ...prev, karat_22kt_stone_weight: value ? parseFloat(value) : 0 }));
                        }
                      }}
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
                      type="text"
                      placeholder="0.000"
                      value={formData.karat_18kt_gross_weight?.toFixed(3) || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const regex = /^\d*\.?\d{0,3}$/;
                        if (regex.test(value)) {
                          setFormData(prev => ({ ...prev, karat_18kt_gross_weight: value ? parseFloat(value) : 0 }));
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="18kt_stone_weight">Stone Weight (g)</Label>
                    <Input
                      id="18kt_stone_weight"
                      type="text"
                      placeholder="0.000"
                      value={formData.karat_18kt_stone_weight?.toFixed(3) || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const regex = /^\d*\.?\d{0,3}$/;
                        if (regex.test(value)) {
                          setFormData(prev => ({ ...prev, karat_18kt_stone_weight: value ? parseFloat(value) : 0 }));
                        }
                      }}
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
            <Button variant="outline" onClick={() => navigate('/admin/products')}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark text-navy">
              Update Product
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Product Variations Section */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Product Variations</h3>
            <Button 
              onClick={() => setShowAddVariationForm(!showAddVariationForm)}
              className="bg-gold hover:bg-gold-dark text-navy"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Variation
            </Button>
          </div>
          
          {/* Existing Variations */}
          {variations.length === 0 ? (
            <div className="text-center py-8 bg-muted/50 rounded-lg mb-6">
              <p className="text-muted-foreground">No variations found for this product.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add variations to create different options for this product.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {variations.map((variation) => (
                <div key={variation.id} className="border rounded-lg p-4 bg-background">
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {variation.variation_name}</p>
                    <p><strong>Net Weight:</strong> {variation.net_weight}g</p>
                    <p><strong>Karat:</strong> {variation.karat}</p>
                    <p><strong>In Stock:</strong> {variation.in_stock ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/admin/products/edit-variation/${variation.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Variation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{variation.variation_name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleVariationDelete(variation.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Variation Form */}
          {showAddVariationForm && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold mb-4">Add New Variation</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="variation_name">Variation Name *</Label>
                    <Input
                      id="variation_name"
                      value={variationFormData.variation_name}
                      onChange={(e) => setVariationFormData(prev => ({ ...prev, variation_name: e.target.value }))}
                      placeholder="Enter variation name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="variation_description">Description</Label>
                    <Textarea
                      id="variation_description"
                      value={variationFormData.description}
                      onChange={(e) => setVariationFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter variation description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="variation_making_charge">Making Charge (%) *</Label>
                      <Input
                        id="variation_making_charge"
                        type="number"
                        value={variationFormData.making_charge_percentage}
                        onChange={(e) => setVariationFormData(prev => ({ ...prev, making_charge_percentage: parseInt(e.target.value) || 0 }))}
                        placeholder="Enter making charge %"
                        min="0"
                        step="1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="variation_discount">Discount (%)</Label>
                      <Input
                        id="variation_discount"
                        type="number"
                        value={variationFormData.discount_percentage}
                        onChange={(e) => setVariationFormData(prev => ({ ...prev, discount_percentage: e.target.value }))}
                        placeholder="Enter discount %"
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="variation_gross_weight">Gross Weight (grams)</Label>
                      <Input
                        id="variation_gross_weight"
                        type="text"
                        placeholder="0.000"
                        value={variationFormData.gross_weight?.toFixed(3) || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          const regex = /^\d*\.?\d{0,3}$/;
                          if (regex.test(value)) {
                            setVariationFormData(prev => ({ ...prev, gross_weight: value ? parseFloat(value) : 0 }));
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="variation_stone_weight">Stone Weight (grams)</Label>
                      <Input
                        id="variation_stone_weight"
                        type="text"
                        placeholder="0.000"
                        value={variationFormData.stone_weight?.toFixed(3) || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          const regex = /^\d*\.?\d{0,3}$/;
                          if (regex.test(value)) {
                            setVariationFormData(prev => ({ ...prev, stone_weight: value ? parseFloat(value) : 0 }));
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="variation_apply_same_mc"
                        checked={variationFormData.apply_same_mc}
                        disabled={formData.apply_same_mc}
                        onCheckedChange={(checked) => setVariationFormData(prev => ({ ...prev, apply_same_mc: checked as boolean }))}
                      />
                      <Label htmlFor="variation_apply_same_mc">Apply Same MC</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="variation_apply_same_discount"
                        checked={variationFormData.apply_same_discount}
                        disabled={formData.apply_same_discount}
                        onCheckedChange={(checked) => setVariationFormData(prev => ({ ...prev, apply_same_discount: checked as boolean }))}
                      />
                      <Label htmlFor="variation_apply_same_discount">Apply Same DIS</Label>
                    </div>
                  </div>

                  <div>
                    <Label>Quantity Type</Label>
                    <RadioGroup
                      value={variationFormData.quantity_type}
                      onValueChange={(value) => setVariationFormData(prev => ({ ...prev, quantity_type: value }))}
                      className="flex gap-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pieces" id="variation_pieces" />
                        <Label htmlFor="variation_pieces">Pieces</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pairs" id="variation_pairs" />
                        <Label htmlFor="variation_pairs">Pairs</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="variation_in_stock"
                      checked={variationFormData.in_stock}
                      onCheckedChange={(checked) => setVariationFormData(prev => ({ ...prev, in_stock: checked as boolean }))}
                    />
                    <Label htmlFor="variation_in_stock">In Stock</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Variation Images</Label>
                    <ImageManager
                      images={variationFormData.images}
                      onImagesChange={(images) => setVariationFormData(prev => ({ ...prev, images }))}
                      maxImages={5}
                      onFileChange={(files) => {
                        if (files && files.length > 0) {
                          handleVariationImageUpload(files[0]);
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
                        <Label htmlFor="variation_22kt_gross_weight">Gross Weight (g)</Label>
                        <Input
                          id="variation_22kt_gross_weight"
                          type="number"
                          value={variationFormData.karat_22kt_gross_weight}
                          onChange={(e) => setVariationFormData(prev => ({ ...prev, karat_22kt_gross_weight: parseFloat(e.target.value) || 0 }))}
                          placeholder="Enter gross weight"
                          min="0"
                          step="0.001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="variation_22kt_stone_weight">Stone Weight (g)</Label>
                        <Input
                          id="variation_22kt_stone_weight"
                          type="number"
                          value={variationFormData.karat_22kt_stone_weight}
                          onChange={(e) => setVariationFormData(prev => ({ ...prev, karat_22kt_stone_weight: parseFloat(e.target.value) || 0 }))}
                          placeholder="Enter stone weight"
                          min="0"
                          step="0.001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="variation_22kt_net_weight">Net Weight (g)</Label>
                        <Input
                          id="variation_22kt_net_weight"
                          type="number"
                          value={variationFormData.karat_22kt_net_weight}
                          onChange={(e) => setVariationFormData(prev => ({ ...prev, karat_22kt_net_weight: parseFloat(e.target.value) || 0 }))}
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
                        <Label htmlFor="variation_18kt_gross_weight">Gross Weight (g)</Label>
                        <Input
                          id="variation_18kt_gross_weight"
                          type="number"
                          value={variationFormData.karat_18kt_gross_weight}
                          onChange={(e) => setVariationFormData(prev => ({ ...prev, karat_18kt_gross_weight: parseFloat(e.target.value) || 0 }))}
                          placeholder="Enter gross weight"
                          min="0"
                          step="0.001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="variation_18kt_stone_weight">Stone Weight (g)</Label>
                        <Input
                          id="variation_18kt_stone_weight"
                          type="number"
                          value={variationFormData.karat_18kt_stone_weight}
                          onChange={(e) => setVariationFormData(prev => ({ ...prev, karat_18kt_stone_weight: parseFloat(e.target.value) || 0 }))}
                          placeholder="Enter stone weight"
                          min="0"
                          step="0.001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="variation_18kt_net_weight">Net Weight (g)</Label>
                        <Input
                          id="variation_18kt_net_weight"
                          type="number"
                          value={variationFormData.karat_18kt_net_weight}
                          onChange={(e) => setVariationFormData(prev => ({ ...prev, karat_18kt_net_weight: parseFloat(e.target.value) || 0 }))}
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
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddVariationForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleVariationSave}
                  className="bg-gold hover:bg-gold-dark text-navy"
                >
                  Save Variation
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProduct;
