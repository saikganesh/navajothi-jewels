import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useCategories } from '@/hooks/useCategories';
import ImageManager from './ImageManager';
import { Edit, Trash2, X } from 'lucide-react';
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
  karat: string;
  images: string[];
  making_charge_percentage: number;
  discount_percentage: number | null;
  product_type: string;
  type: string;
  parent_product_id: string;
  category_id: string | null;
  collection_ids: string[];
  sku?: string;
  gross_weight?: number;
  stone_weight?: number;
  net_weight?: number;
  stock_quantity?: number;
}

interface Collection {
  id: string;
  name: string;
  category_id: string | null;
}

interface ProductVariationsManagerProps {
  productId: string;
}

const ProductVariationsManager = ({ productId }: ProductVariationsManagerProps) => {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [parentProduct, setParentProduct] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVariation, setEditingVariation] = useState<ProductVariation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('22kt');
  const { data: categories } = useCategories();
  
  const [formData, setFormData] = useState({
    variation_name: '',
    description: '',
    karat: '22kt',
    images: [] as string[],
    making_charge_percentage: '',
    discount_percentage: '',
    quantity_type: 'pieces',
    category_id: '',
    collection_ids: [] as string[],
    gross_weight: '',
    stone_weight: '',
    net_weight: 0,
    stock_quantity: ''
  });

  const [sameAsProduct, setSameAsProduct] = useState({
    description: false,
    making_charge: false,
    discount: false,
    category: false,
    collection: false
  });

  const [errors, setErrors] = useState({
    making_charge_percentage: '',
    discount_percentage: '',
    stock_quantity: '',
    gross_weight: '',
    stone_weight: ''
  });

  useEffect(() => {
    if (parentProduct) {
      setSameAsProduct(prev => ({
        ...prev,
        description: formData.description === (parentProduct.description || ''),
        making_charge: formData.making_charge_percentage === (parentProduct.making_charge_percentage?.toString() || ''),
        discount: formData.discount_percentage === (parentProduct.discount_percentage?.toString() || ''),
        category: formData.category_id === (parentProduct.category_id || ''),
        collection: JSON.stringify([...formData.collection_ids].sort()) === JSON.stringify([...(parentProduct.collection_ids || [])].sort())
      }));
    }
  }, [formData, parentProduct]);

  useEffect(() => {
    fetchVariations();
    fetchParentProduct();
    fetchCollections();
  }, [productId]);

  const fetchParentProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      setParentProduct(data);
    } catch (error) {
      console.error('Error fetching parent product:', error);
    }
  };

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('id, name, category_id')
        .order('name');

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const fetchVariations = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('parent_product_id', productId)
        .eq('type', 'variation');

      if (error) throw error;
      
      // Fetch karat data for each variation
      const variationsWithKaratData = await Promise.all(
        (data || []).map(async (variation) => {
          // Determine karat from available_karats array
          const availableKarats = Array.isArray(variation.available_karats) 
            ? (variation.available_karats as string[]).filter((k): k is string => typeof k === 'string')
            : [];
          const karat = availableKarats.length > 0 ? availableKarats[0] : '22kt';
          
          // Fetch corresponding karat data
          let karatData = null;
          if (karat === '22kt') {
            const { data: kt22 } = await supabase
              .from('karat_22kt')
              .select('*')
              .eq('product_id', variation.id)
              .maybeSingle();
            karatData = kt22;
          } else if (karat === '18kt') {
            const { data: kt18 } = await supabase
              .from('karat_18kt')
              .select('*')
              .eq('product_id', variation.id)
              .maybeSingle();
            karatData = kt18;
          } else if (karat === '14kt') {
            const { data: kt14 } = await supabase
              .from('karat_14kt')
              .select('*')
              .eq('product_id', variation.id)
              .maybeSingle();
            karatData = kt14;
          } else if (karat === '9kt') {
            const { data: kt9 } = await supabase
              .from('karat_9kt')
              .select('*')
              .eq('product_id', variation.id)
              .maybeSingle();
            karatData = kt9;
          }

          return {
            id: variation.id,
            name: variation.name,
            description: variation.description,
            karat: karat as string,
            images: Array.isArray(variation.images) 
              ? (variation.images as string[]).filter((img): img is string => typeof img === 'string')
              : [],
            making_charge_percentage: variation.making_charge_percentage,
            discount_percentage: variation.discount_percentage,
            product_type: variation.product_type,
            type: variation.type,
            parent_product_id: variation.parent_product_id,
            category_id: variation.category_id,
            collection_ids: Array.isArray(variation.collection_ids) 
              ? (variation.collection_ids as string[])
              : [],
            sku: karatData?.sku as string | undefined,
            gross_weight: karatData?.gross_weight || undefined,
            stone_weight: karatData?.stone_weight || undefined,
            net_weight: karatData?.net_weight || undefined,
            stock_quantity: karatData?.stock_quantity || undefined
          };
        })
      );
      
      setVariations(variationsWithKaratData);
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

    if (field === 'making_charge_percentage' || field === 'discount_percentage' || field === 'stock_quantity') {
      isValid = validateInteger(value);
      errorMessage = isValid ? '' : 'Please enter a valid integer';
    } else if (['gross_weight', 'stone_weight'].includes(field)) {
      isValid = validateDecimal(value);
      errorMessage = isValid ? '' : 'Please enter a valid decimal (up to 3 decimal places)';
    }

    if (isValid) {
      setFormData(prev => {
        const newData = { ...prev, [field]: value };
        
        // Calculate net weight when gross or stone weights change
        if (field === 'gross_weight' || field === 'stone_weight') {
          const grossWeight = parseFloat(field === 'gross_weight' ? value : prev.gross_weight) || 0;
          const stoneWeight = parseFloat(field === 'stone_weight' ? value : prev.stone_weight) || 0;
          newData.net_weight = parseFloat((grossWeight - stoneWeight).toFixed(3));
        }
        
        return newData;
      });

      setErrors(prev => ({ ...prev, [field]: '' }));
    } else {
      setErrors(prev => ({ ...prev, [field]: errorMessage }));
    }
  };

  const handleSameAsProductChange = (field: keyof typeof sameAsProduct, checked: boolean) => {
    if (checked && parentProduct) {
      switch (field) {
        case 'description':
          setFormData(prev => ({ ...prev, description: parentProduct.description || '' }));
          break;
        case 'making_charge':
          setFormData(prev => ({ ...prev, making_charge_percentage: parentProduct.making_charge_percentage?.toString() || '' }));
          break;
        case 'discount':
          setFormData(prev => ({ ...prev, discount_percentage: parentProduct.discount_percentage?.toString() || '' }));
          break;
        case 'category':
          setFormData(prev => ({ ...prev, category_id: parentProduct.category_id || '' }));
          break;
        case 'collection':
          setFormData(prev => ({ ...prev, collection_ids: parentProduct.collection_ids || [] }));
          break;
      }
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
      karat: activeTab,
      images: [],
      making_charge_percentage: '',
      discount_percentage: '',
      quantity_type: 'pieces',
      category_id: '',
      collection_ids: [],
      gross_weight: '',
      stone_weight: '',
      net_weight: 0,
      stock_quantity: ''
    });
    setSameAsProduct({
      description: false,
      making_charge: false,
      discount: false,
      category: false,
      collection: false
    });
    setErrors({
      making_charge_percentage: '',
      discount_percentage: '',
      stock_quantity: '',
      gross_weight: '',
      stone_weight: ''
    });
    setEditingVariation(null);
  };

  const handleSaveVariation = async () => {
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
        available_karats: [formData.karat],
        images: formData.images,
        making_charge_percentage: formData.making_charge_percentage ? parseInt(formData.making_charge_percentage) : 0,
        discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null,
        product_type: formData.quantity_type,
        type: 'variation',
        parent_product_id: productId,
        category_id: formData.category_id || null,
        collection_ids: formData.collection_ids
      };

      let variationId: string;

      if (editingVariation) {
        const { error: variationError } = await supabase
          .from('products')
          .update(variationData)
          .eq('id', editingVariation.id);

        if (variationError) throw variationError;
        variationId = editingVariation.id;
      } else {
        const { data: newVariation, error: variationError } = await supabase
          .from('products')
          .insert(variationData)
          .select()
          .single();

        if (variationError) throw variationError;
        variationId = newVariation.id;
      }

      // Save karat-specific data
      const hasKaratData = formData.gross_weight || formData.stone_weight || formData.stock_quantity;
      if (hasKaratData) {
        const karatData = {
          product_id: variationId,
          gross_weight: formData.gross_weight ? parseFloat(formData.gross_weight) : null,
          stone_weight: formData.stone_weight ? parseFloat(formData.stone_weight) : null,
          net_weight: formData.net_weight,
          stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0
        };

        // Handle each karat table separately for TypeScript type safety
        if (formData.karat === '22kt') {
          const { data: existingKarat } = await supabase
            .from('karat_22kt')
            .select('id')
            .eq('product_id', variationId)
            .maybeSingle();

          if (existingKarat) {
            const { error } = await supabase
              .from('karat_22kt')
              .update(karatData)
              .eq('product_id', variationId);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('karat_22kt')
              .insert(karatData);
            if (error) throw error;
          }
        } else if (formData.karat === '18kt') {
          const { data: existingKarat } = await supabase
            .from('karat_18kt')
            .select('id')
            .eq('product_id', variationId)
            .maybeSingle();

          if (existingKarat) {
            const { error } = await supabase
              .from('karat_18kt')
              .update(karatData)
              .eq('product_id', variationId);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('karat_18kt')
              .insert(karatData);
            if (error) throw error;
          }
        } else if (formData.karat === '14kt') {
          const { data: existingKarat } = await supabase
            .from('karat_14kt')
            .select('id')
            .eq('product_id', variationId)
            .maybeSingle();

          if (existingKarat) {
            const { error } = await supabase
              .from('karat_14kt')
              .update(karatData)
              .eq('product_id', variationId);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('karat_14kt')
              .insert(karatData);
            if (error) throw error;
          }
        } else if (formData.karat === '9kt') {
          const { data: existingKarat } = await supabase
            .from('karat_9kt')
            .select('id')
            .eq('product_id', variationId)
            .maybeSingle();

          if (existingKarat) {
            const { error } = await supabase
              .from('karat_9kt')
              .update(karatData)
              .eq('product_id', variationId);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('karat_9kt')
              .insert(karatData);
            if (error) throw error;
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
    setFormData(prev => ({ ...prev, karat: activeTab }));
    setShowForm(true);
  };

  const handleEditVariation = async (variation: ProductVariation) => {
    setFormData({
      variation_name: variation.name,
      description: variation.description || '',
      karat: variation.karat,
      images: variation.images,
      making_charge_percentage: variation.making_charge_percentage.toString(),
      discount_percentage: variation.discount_percentage?.toString() || '',
      quantity_type: variation.product_type,
      category_id: variation.category_id || '',
      collection_ids: variation.collection_ids,
      gross_weight: variation.gross_weight?.toString() || '',
      stone_weight: variation.stone_weight?.toString() || '',
      net_weight: variation.net_weight || 0,
      stock_quantity: variation.stock_quantity?.toString() || ''
    });
    
    setEditingVariation(variation);
    setActiveTab(variation.karat);
    setShowForm(true);
  };

  const handleDeleteVariation = async (variationId: string) => {
    try {
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

  const handleCollectionSelect = (collectionId: string) => {
    if (!formData.collection_ids.includes(collectionId)) {
      setFormData(prev => ({ 
        ...prev, 
        collection_ids: [...prev.collection_ids, collectionId] 
      }));
    }
  };

  const handleCollectionRemove = (collectionId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      collection_ids: prev.collection_ids.filter(id => id !== collectionId) 
    }));
  };

  const getVariationsByKarat = (karat: string) => {
    return variations.filter(v => v.karat === karat);
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
              <Label htmlFor="karat">Karat *</Label>
              <Select
                value={formData.karat}
                onValueChange={(value) => setFormData(prev => ({ ...prev, karat: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select karat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="22kt">22KT</SelectItem>
                  <SelectItem value="18kt">18KT</SelectItem>
                  <SelectItem value="14kt">14KT</SelectItem>
                  <SelectItem value="9kt">9KT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="same_description"
                  checked={sameAsProduct.description}
                  onCheckedChange={(checked) => handleSameAsProductChange('description', !!checked)}
                />
                <Label htmlFor="same_description" className="text-sm">Same as Product</Label>
              </div>
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
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="same_making_charge"
                    checked={sameAsProduct.making_charge}
                    onCheckedChange={(checked) => handleSameAsProductChange('making_charge', !!checked)}
                  />
                  <Label htmlFor="same_making_charge" className="text-sm">Same as Product</Label>
                </div>
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
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="same_discount"
                    checked={sameAsProduct.discount}
                    onCheckedChange={(checked) => handleSameAsProductChange('discount', !!checked)}
                  />
                  <Label htmlFor="same_discount" className="text-sm">Same as Product</Label>
                </div>
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
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="same_category"
                  checked={sameAsProduct.category}
                  onCheckedChange={(checked) => handleSameAsProductChange('category', !!checked)}
                />
                <Label htmlFor="same_category" className="text-sm">Same as Product</Label>
              </div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="same_collection"
                  checked={sameAsProduct.collection}
                  onCheckedChange={(checked) => handleSameAsProductChange('collection', !!checked)}
                />
                <Label htmlFor="same_collection" className="text-sm">Same as Product</Label>
              </div>
              <Label htmlFor="collections">Collections</Label>
              <Select
                onValueChange={handleCollectionSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select collections" />
                </SelectTrigger>
                <SelectContent>
                  {collections
                    .filter(collection => !formData.collection_ids.includes(collection.id))
                    .map((collection) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        {collection.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              
              {formData.collection_ids.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.collection_ids.map((collectionId) => {
                    const collection = collections.find(c => c.id === collectionId);
                    return collection ? (
                      <Badge key={collectionId} variant="secondary" className="flex items-center gap-1">
                        {collection.name}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => handleCollectionRemove(collectionId)}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
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

            {/* Weight Fields */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold">Weight Information</Label>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <Label htmlFor="gross_weight">Gross Weight (g)</Label>
                  <Input
                    id="gross_weight"
                    type="text"
                    value={formData.gross_weight}
                    onChange={(e) => handleInputChange('gross_weight', e.target.value)}
                    placeholder="Enter gross weight"
                  />
                  {errors.gross_weight && (
                    <p className="text-sm text-red-500 mt-1">{errors.gross_weight}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="stone_weight">Stone Weight (g)</Label>
                  <Input
                    id="stone_weight"
                    type="text"
                    value={formData.stone_weight}
                    onChange={(e) => handleInputChange('stone_weight', e.target.value)}
                    placeholder="Enter stone weight"
                  />
                  {errors.stone_weight && (
                    <p className="text-sm text-red-500 mt-1">{errors.stone_weight}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="net_weight">Net Weight (g)</Label>
                  <Input
                    id="net_weight"
                    type="number"
                    value={formData.net_weight}
                    readOnly
                    disabled
                    className="bg-muted"
                    placeholder="Calculated automatically"
                  />
                </div>
                <div>
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    type="text"
                    value={formData.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                    placeholder="Enter stock quantity"
                  />
                  {errors.stock_quantity && (
                    <p className="text-sm text-red-500 mt-1">{errors.stock_quantity}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSaveVariation} disabled={isLoading}>
            {isLoading ? 'Saving...' : editingVariation ? 'Update Variation' : 'Add Variation'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Product Variations</h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="22kt">22KT ({getVariationsByKarat('22kt').length})</TabsTrigger>
          <TabsTrigger value="18kt">18KT ({getVariationsByKarat('18kt').length})</TabsTrigger>
          <TabsTrigger value="14kt">14KT ({getVariationsByKarat('14kt').length})</TabsTrigger>
          <TabsTrigger value="9kt">9KT ({getVariationsByKarat('9kt').length})</TabsTrigger>
        </TabsList>

        {['22kt', '18kt', '14kt', '9kt'].map((karat) => (
          <TabsContent key={karat} value={karat} className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleAddVariation}>
                Add {karat.toUpperCase()} Variation
              </Button>
            </div>

            {getVariationsByKarat(karat).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No {karat.toUpperCase()} variations yet. Click "Add {karat.toUpperCase()} Variation" to create one.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Gross Weight</TableHead>
                    <TableHead>Net Weight</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Making Charge</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getVariationsByKarat(karat).map((variation) => (
                    <TableRow key={variation.id}>
                      <TableCell className="font-medium">{variation.name}</TableCell>
                      <TableCell className="font-mono text-sm">{variation.sku || 'N/A'}</TableCell>
                      <TableCell>{variation.gross_weight ? `${variation.gross_weight}g` : '-'}</TableCell>
                      <TableCell>{variation.net_weight ? `${variation.net_weight}g` : '-'}</TableCell>
                      <TableCell>{variation.stock_quantity || 0}</TableCell>
                      <TableCell>{variation.making_charge_percentage}%</TableCell>
                      <TableCell>{variation.discount_percentage ? `${variation.discount_percentage}%` : '-'}</TableCell>
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
                                <AlertDialogTitle>Delete Variation</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{variation.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteVariation(variation.id)}
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ProductVariationsManager;
