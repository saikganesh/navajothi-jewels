import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import ImageManager from '@/components/admin/ImageManager';
import { ProductVariation } from '@/types/product';
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

interface Collection {
  id: string;
  name: string;
}

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [showVariationForm, setShowVariationForm] = useState(false);
  const [editingVariation, setEditingVariation] = useState<ProductVariation | null>(null);
  
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
    product_type: 'pieces'
  });

  const [variationForm, setVariationForm] = useState({
    variation_name: '',
    description: '',
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
    product_type: 'pieces'
  });

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('id, name');

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

  const fetchProduct = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name || '',
        description: data.description || '',
        collection_id: data.collection_id || '',
        in_stock: data.in_stock || false,
        karat_22kt_gross_weight: data.carat_22kt_gross_weight || 0,
        karat_22kt_stone_weight: data.carat_22kt_stone_weight || 0,
        karat_22kt_net_weight: data.carat_22kt_net_weight || 0,
        karat_18kt_gross_weight: data.carat_18kt_gross_weight || 0,
        karat_18kt_stone_weight: data.carat_18kt_stone_weight || 0,
        karat_18kt_net_weight: data.carat_18kt_net_weight || 0,
        available_karats: Array.isArray(data.available_carats) 
          ? (data.available_carats as string[])
          : ['22kt'],
        images: Array.isArray(data.images) 
          ? (data.images as string[])
          : [],
        making_charge_percentage: data.making_charge_percentage || 0,
        discount_percentage: data.discount_percentage ? data.discount_percentage.toString() : '',
        apply_same_mc: data.apply_same_mc || false,
        apply_same_discount: data.apply_same_discount || false,
        product_type: data.product_type || 'pieces'
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVariations = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('product_variations')
        .select('*')
        .eq('parent_product_id', id);

      if (error) throw error;

      const mappedVariations = (data || []).map(variation => ({
        id: variation.id,
        parent_product_id: variation.parent_product_id,
        variation_name: variation.variation_name,
        description: variation.description || null,
        net_weight: variation.net_weight || null,
        images: Array.isArray(variation.images) 
          ? (variation.images as string[])
          : [],
        in_stock: variation.in_stock,
        gross_weight: variation.gross_weight || null,
        stone_weight: variation.stone_weight || null,
        karat: variation.carat || null,
        karat_22kt_gross_weight: variation.carat_22kt_gross_weight || null,
        karat_22kt_stone_weight: variation.carat_22kt_stone_weight || null,
        karat_22kt_net_weight: variation.carat_22kt_net_weight || null,
        karat_18kt_gross_weight: variation.carat_18kt_gross_weight || null,
        karat_18kt_stone_weight: variation.carat_18kt_stone_weight || null,
        karat_18kt_net_weight: variation.carat_18kt_net_weight || null,
        available_karats: Array.isArray(variation.available_carats) 
          ? (variation.available_carats as string[])
          : null,
        making_charge_percentage: variation.making_charge_percentage || 0,
        discount_percentage: variation.discount_percentage || null,
        product_type: variation.product_type || 'pieces'
      }));

      setVariations(mappedVariations);
    } catch (error) {
      console.error('Error fetching variations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch variations. Please try again.",
        variant: "destructive",
      });
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
    if (!id) return;
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        collection_id: formData.collection_id || null,
        in_stock: formData.in_stock,
        carat_22kt_gross_weight: formData.karat_22kt_gross_weight,
        carat_22kt_stone_weight: formData.karat_22kt_stone_weight,
        carat_22kt_net_weight: formData.karat_22kt_net_weight,
        carat_18kt_gross_weight: formData.karat_18kt_gross_weight,
        carat_18kt_stone_weight: formData.karat_18kt_stone_weight,
        carat_18kt_net_weight: formData.karat_18kt_net_weight,
        available_carats: formData.available_karats,
        images: formData.images,
        making_charge_percentage: formData.making_charge_percentage,
        discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null,
        apply_same_mc: formData.apply_same_mc,
        apply_same_discount: formData.apply_same_discount,
        product_type: formData.product_type
      };

      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully.",
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

  const handleSaveVariation = async () => {
    if (!id) return;
    
    try {
      const variationData = {
        parent_product_id: id,
        variation_name: variationForm.variation_name,
        description: variationForm.description,
        in_stock: variationForm.in_stock,
        carat_22kt_gross_weight: variationForm.karat_22kt_gross_weight,
        carat_22kt_stone_weight: variationForm.karat_22kt_stone_weight,
        carat_22kt_net_weight: variationForm.karat_22kt_net_weight,
        carat_18kt_gross_weight: variationForm.karat_18kt_gross_weight,
        carat_18kt_stone_weight: variationForm.karat_18kt_stone_weight,
        carat_18kt_net_weight: variationForm.karat_18kt_net_weight,
        available_carats: variationForm.available_karats,
        images: variationForm.images,
        making_charge_percentage: variationForm.making_charge_percentage,
        discount_percentage: variationForm.discount_percentage ? parseInt(variationForm.discount_percentage) : null,
        product_type: variationForm.product_type
      };

      let error;
      if (editingVariation) {
        ({ error } = await supabase
          .from('product_variations')
          .update(variationData)
          .eq('id', editingVariation.id));
      } else {
        ({ error } = await supabase
          .from('product_variations')
          .insert(variationData));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Variation ${editingVariation ? 'updated' : 'added'} successfully.`,
      });

      setShowVariationForm(false);
      setEditingVariation(null);
      setVariationForm({
        variation_name: '',
        description: '',
        in_stock: true,
        karat_22kt_gross_weight: 0,
        karat_22kt_stone_weight: 0,
        karat_22kt_net_weight: 0,
        karat_18kt_gross_weight: 0,
        karat_18kt_stone_weight: 0,
        karat_18kt_net_weight: 0,
        available_karats: ['22kt'],
        images: [],
        making_charge_percentage: 0,
        discount_percentage: '',
        product_type: 'pieces'
      });
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

  const handleEditVariation = (variation: ProductVariation) => {
    setEditingVariation(variation);
    setVariationForm({
      variation_name: variation.variation_name,
      description: variation.description || '',
      in_stock: variation.in_stock,
      karat_22kt_gross_weight: variation.karat_22kt_gross_weight || 0,
      karat_22kt_stone_weight: variation.karat_22kt_stone_weight || 0,
      karat_22kt_net_weight: variation.karat_22kt_net_weight || 0,
      karat_18kt_gross_weight: variation.karat_18kt_gross_weight || 0,
      karat_18kt_stone_weight: variation.karat_18kt_stone_weight || 0,
      karat_18kt_net_weight: variation.karat_18kt_net_weight || 0,
      available_karats: variation.available_karats || ['22kt'],
      images: variation.images || [],
      making_charge_percentage: variation.making_charge_percentage || 0,
      discount_percentage: variation.discount_percentage ? variation.discount_percentage.toString() : '',
      product_type: variation.product_type || 'pieces'
    });
    setShowVariationForm(true);
  };

  const handleDeleteVariation = async (variationId: string) => {
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

  useEffect(() => {
    fetchCollections();
    fetchProduct();
    fetchVariations();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
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

      <div className="space-y-6">
        {/* Product Form */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
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
                  <Label>Product Type</Label>
                  <RadioGroup
                    value={formData.product_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, product_type: value }))}
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
              <Button variant="outline" onClick={() => navigate('/admin/products')}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark text-navy">
                Update Product
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Variations Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Product Variations
              <Button 
                onClick={() => {
                  setEditingVariation(null);
                  setVariationForm({
                    variation_name: '',
                    description: '',
                    in_stock: true,
                    karat_22kt_gross_weight: 0,
                    karat_22kt_stone_weight: 0,
                    karat_22kt_net_weight: 0,
                    karat_18kt_gross_weight: 0,
                    karat_18kt_stone_weight: 0,
                    karat_18kt_net_weight: 0,
                    available_karats: ['22kt'],
                    images: [],
                    making_charge_percentage: formData.apply_same_mc ? formData.making_charge_percentage : 0,
                    discount_percentage: formData.apply_same_discount ? formData.discount_percentage : '',
                    product_type: 'pieces'
                  });
                  setShowVariationForm(true);
                }}
                size="sm"
                className="bg-gold hover:bg-gold-dark text-navy"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Variation
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {variations.length > 0 ? (
              <div className="space-y-4">
                {variations.map((variation) => (
                  <div key={variation.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{variation.variation_name}</h4>
                        <p className="text-sm text-gray-600">
                          Type: {variation.product_type} | 
                          MC: {variation.making_charge_percentage}% | 
                          {variation.discount_percentage ? `Discount: ${variation.discount_percentage}%` : 'No Discount'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditVariation(variation)}
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
                                Are you sure you want to delete the variation "{variation.variation_name}"? This action cannot be undone.
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
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No variations added yet.</p>
            )}

            {/* Variation Form */}
            {showVariationForm && (
              <div className="mt-6 border-t pt-6">
                <h4 className="font-medium mb-4">
                  {editingVariation ? 'Edit Variation' : 'Add New Variation'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="variation_name">Variation Name *</Label>
                      <Input
                        id="variation_name"
                        value={variationForm.variation_name}
                        onChange={(e) => setVariationForm(prev => ({ ...prev, variation_name: e.target.value }))}
                        placeholder="Enter variation name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="variation_description">Description</Label>
                      <Textarea
                        id="variation_description"
                        value={variationForm.description}
                        onChange={(e) => setVariationForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter variation description"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="variation_making_charge">Making Charge (%) *</Label>
                        <Input
                          id="variation_making_charge"
                          type="number"
                          value={variationForm.making_charge_percentage}
                          onChange={(e) => setVariationForm(prev => ({ ...prev, making_charge_percentage: parseInt(e.target.value) || 0 }))}
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
                          value={variationForm.discount_percentage}
                          onChange={(e) => setVariationForm(prev => ({ ...prev, discount_percentage: e.target.value }))}
                          placeholder="Enter discount %"
                          min="0"
                          step="1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Product Type</Label>
                      <RadioGroup
                        value={variationForm.product_type}
                        onValueChange={(value) => setVariationForm(prev => ({ ...prev, product_type: value }))}
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
                        checked={variationForm.in_stock}
                        onCheckedChange={(checked) => setVariationForm(prev => ({ ...prev, in_stock: checked as boolean }))}
                      />
                      <Label htmlFor="variation_in_stock">In Stock</Label>
                    </div>

                    <div>
                      <Label>Available Karats</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['22kt', '18kt'].map((karat) => (
                          <div key={karat} className="flex items-center space-x-2">
                            <Checkbox
                              id={`variation-karat-${karat}`}
                              checked={variationForm.available_karats.includes(karat)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setVariationForm(prev => ({ ...prev, available_karats: [...prev.available_karats, karat] }));
                                } else {
                                  setVariationForm(prev => ({ ...prev, available_karats: prev.available_karats.filter(k => k !== karat) }));
                                }
                              }}
                            />
                            <Label htmlFor={`variation-karat-${karat}`}>{karat.toUpperCase()}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Variation Images</Label>
                      <ImageManager
                        images={variationForm.images}
                        onImagesChange={(images) => setVariationForm(prev => ({ ...prev, images }))}
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
                          <Label htmlFor="variation_22kt_gross_weight">Gross Weight (g)</Label>
                          <Input
                            id="variation_22kt_gross_weight"
                            type="number"
                            value={variationForm.karat_22kt_gross_weight}
                            onChange={(e) => setVariationForm(prev => ({ ...prev, karat_22kt_gross_weight: parseFloat(e.target.value) || 0 }))}
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
                            value={variationForm.karat_22kt_stone_weight}
                            onChange={(e) => setVariationForm(prev => ({ ...prev, karat_22kt_stone_weight: parseFloat(e.target.value) || 0 }))}
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
                            value={variationForm.karat_22kt_net_weight}
                            onChange={(e) => setVariationForm(prev => ({ ...prev, karat_22kt_net_weight: parseFloat(e.target.value) || 0 }))}
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
                            value={variationForm.karat_18kt_gross_weight}
                            onChange={(e) => setVariationForm(prev => ({ ...prev, karat_18kt_gross_weight: parseFloat(e.target.value) || 0 }))}
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
                            value={variationForm.karat_18kt_stone_weight}
                            onChange={(e) => setVariationForm(prev => ({ ...prev, karat_18kt_stone_weight: parseFloat(e.target.value) || 0 }))}
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
                            value={variationForm.karat_18kt_net_weight}
                            onChange={(e) => setVariationForm(prev => ({ ...prev, karat_18kt_net_weight: parseFloat(e.target.value) || 0 }))}
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
                    onClick={() => {
                      setShowVariationForm(false);
                      setEditingVariation(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveVariation} className="bg-gold hover:bg-gold-dark text-navy">
                    {editingVariation ? 'Update Variation' : 'Add Variation'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProduct;
