import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImageManager from '@/components/admin/ImageManager';

interface ProductFormData {
  name: string;
  description: string;
  category_id: string;
  collection_ids: string[];
  stock_quantity: number;
  gross_weight: string;
  stone_weight: string;
  net_weight: string;
  karat_22kt_gross_weight: string;
  karat_22kt_stone_weight: string;
  karat_22kt_net_weight: string;
  karat_18kt_gross_weight: string;
  karat_18kt_stone_weight: string;
  karat_18kt_net_weight: string;
  available_karats: string[];
  making_charge_percentage: string;
  discount_percentage: string;
  apply_same_mc: boolean;
  apply_same_discount: boolean;
  product_type: string;
  images: string[];
}

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { uploadImage, isUploading } = useImageUpload();
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category_id: '',
    collection_ids: [],
    stock_quantity: 0,
    gross_weight: '',
    stone_weight: '',
    net_weight: '',
    karat_22kt_gross_weight: '',
    karat_22kt_stone_weight: '',
    karat_22kt_net_weight: '',
    karat_18kt_gross_weight: '',
    karat_18kt_stone_weight: '',
    karat_18kt_net_weight: '',
    available_karats: ['22kt'],
    making_charge_percentage: '',
    discount_percentage: '',
    apply_same_mc: false,
    apply_same_discount: false,
    product_type: 'pieces',
    images: []
  });
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchCollections();
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
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
        category_id: data.category_id || '',
        collection_ids: Array.isArray(data.collection_ids) ? data.collection_ids as string[] : [],
        stock_quantity: data.stock_quantity || 0,
        gross_weight: data.gross_weight?.toString() || '',
        stone_weight: data.stone_weight?.toString() || '',
        net_weight: data.net_weight?.toString() || '',
        karat_22kt_gross_weight: data.karat_22kt_gross_weight?.toString() || '',
        karat_22kt_stone_weight: data.karat_22kt_stone_weight?.toString() || '',
        karat_22kt_net_weight: data.karat_22kt_net_weight?.toString() || '',
        karat_18kt_gross_weight: data.karat_18kt_gross_weight?.toString() || '',
        karat_18kt_stone_weight: data.karat_18kt_stone_weight?.toString() || '',
        karat_18kt_net_weight: data.karat_18kt_net_weight?.toString() || '',
        available_karats: Array.isArray(data.available_karats) ? data.available_karats as string[] : ['22kt'],
        making_charge_percentage: data.making_charge_percentage?.toString() || '',
        discount_percentage: data.discount_percentage?.toString() || '',
        apply_same_mc: data.apply_same_mc || false,
        apply_same_discount: data.apply_same_discount || false,
        product_type: data.product_type || 'pieces',
        images: Array.isArray(data.images) ? data.images as string[] : []
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product details.",
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name');

      if (error) throw error;

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch categories.",
        variant: "destructive",
      });
    }
  };

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
        description: "Failed to fetch collections.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
  
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCollectionToggle = (collectionId: string) => {
    setFormData(prev => ({
      ...prev,
      collection_ids: prev.collection_ids.includes(collectionId)
        ? prev.collection_ids.filter(id => id !== collectionId)
        : [...prev.collection_ids, collectionId]
    }));
  };

  const handleKaratToggle = (karat: string) => {
    setFormData(prev => ({
      ...prev,
      available_karats: prev.available_karats.includes(karat)
        ? prev.available_karats.filter(k => k !== karat)
        : [...prev.available_karats, karat]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { 
        name, 
        description, 
        category_id, 
        collection_ids,
        stock_quantity,
        gross_weight,
        stone_weight,
        net_weight,
        karat_22kt_gross_weight,
        karat_22kt_stone_weight,
        karat_22kt_net_weight,
        karat_18kt_gross_weight,
        karat_18kt_stone_weight,
        karat_18kt_net_weight,
        available_karats,
        making_charge_percentage,
        discount_percentage,
        apply_same_mc,
        apply_same_discount,
        product_type,
        images
      } = formData;

      const parsedCollectionIds = Array.isArray(collection_ids) ? collection_ids : [];

      const { data, error } = await supabase
        .from('products')
        .update({
          name,
          description,
          category_id,
          collection_ids: parsedCollectionIds,
          stock_quantity: stock_quantity || 0,
          gross_weight: gross_weight ? parseFloat(gross_weight) : null,
          stone_weight: stone_weight ? parseFloat(stone_weight) : null,
          net_weight: net_weight ? parseFloat(net_weight) : null,
          karat_22kt_gross_weight: karat_22kt_gross_weight ? parseFloat(karat_22kt_gross_weight) : null,
          karat_22kt_stone_weight: karat_22kt_stone_weight ? parseFloat(karat_22kt_stone_weight) : null,
          karat_22kt_net_weight: karat_22kt_net_weight ? parseFloat(karat_22kt_net_weight) : null,
          karat_18kt_gross_weight: karat_18kt_gross_weight ? parseFloat(karat_18kt_gross_weight) : null,
          karat_18kt_stone_weight: karat_18kt_stone_weight ? parseFloat(karat_18kt_stone_weight) : null,
          karat_18kt_net_weight: karat_18kt_net_weight ? parseFloat(karat_18kt_net_weight) : null,
          available_karats,
          making_charge_percentage: making_charge_percentage ? parseInt(making_charge_percentage) : 0,
          discount_percentage: discount_percentage ? parseInt(discount_percentage) : null,
          apply_same_mc,
          apply_same_discount,
          product_type,
          images
        })
        .eq('id', id)
        .select()

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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-navy">Edit Product</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin/products')}
        >
          Back to Products
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="category_id">Category</Label>
          <Select value={formData.category_id} onValueChange={(value) => setFormData(prevData => ({ ...prevData, category_id: value }))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Collections</Label>
          <div className="grid grid-cols-2 gap-2 p-4 border rounded-lg">
            {collections.map(collection => (
              <div key={collection.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`collection-${collection.id}`}
                  checked={formData.collection_ids.includes(collection.id)}
                  onCheckedChange={() => handleCollectionToggle(collection.id)}
                />
                <Label htmlFor={`collection-${collection.id}`} className="text-sm">
                  {collection.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="stock_quantity">Stock Quantity</Label>
          <Input
            type="number"
            id="stock_quantity"
            name="stock_quantity"
            value={formData.stock_quantity}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="gross_weight">Gross Weight (g)</Label>
          <Input
            type="number"
            id="gross_weight"
            name="gross_weight"
            value={formData.gross_weight}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="stone_weight">Stone Weight (g)</Label>
          <Input
            type="number"
            id="stone_weight"
            name="stone_weight"
            value={formData.stone_weight}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="net_weight">Net Weight (g)</Label>
          <Input
            type="number"
            id="net_weight"
            name="net_weight"
            value={formData.net_weight}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="karat_22kt_gross_weight">22kt Gross Weight (g)</Label>
          <Input
            type="number"
            id="karat_22kt_gross_weight"
            name="karat_22kt_gross_weight"
            value={formData.karat_22kt_gross_weight}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="karat_22kt_stone_weight">22kt Stone Weight (g)</Label>
          <Input
            type="number"
            id="karat_22kt_stone_weight"
            name="karat_22kt_stone_weight"
            value={formData.karat_22kt_stone_weight}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="karat_22kt_net_weight">22kt Net Weight (g)</Label>
          <Input
            type="number"
            id="karat_22kt_net_weight"
            name="karat_22kt_net_weight"
            value={formData.karat_22kt_net_weight}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="karat_18kt_gross_weight">18kt Gross Weight (g)</Label>
          <Input
            type="number"
            id="karat_18kt_gross_weight"
            name="karat_18kt_gross_weight"
            value={formData.karat_18kt_gross_weight}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="karat_18kt_stone_weight">18kt Stone Weight (g)</Label>
          <Input
            type="number"
            id="karat_18kt_stone_weight"
            name="karat_18kt_stone_weight"
            value={formData.karat_18kt_stone_weight}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="karat_18kt_net_weight">18kt Net Weight (g)</Label>
          <Input
            type="number"
            id="karat_18kt_net_weight"
            name="karat_18kt_net_weight"
            value={formData.karat_18kt_net_weight}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label>Available Karats</Label>
          <div className="flex gap-4 p-4 border rounded-lg">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="karat-22kt"
                checked={formData.available_karats.includes('22kt')}
                onCheckedChange={() => handleKaratToggle('22kt')}
              />
              <Label htmlFor="karat-22kt">22kt</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="karat-18kt"
                checked={formData.available_karats.includes('18kt')}
                onCheckedChange={() => handleKaratToggle('18kt')}
              />
              <Label htmlFor="karat-18kt">18kt</Label>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="making_charge_percentage">Making Charge (%)</Label>
          <Input
            type="number"
            id="making_charge_percentage"
            name="making_charge_percentage"
            value={formData.making_charge_percentage}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="discount_percentage">Discount (%)</Label>
          <Input
            type="number"
            id="discount_percentage"
            name="discount_percentage"
            value={formData.discount_percentage}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="apply_same_mc"
            name="apply_same_mc"
            checked={formData.apply_same_mc}
            onCheckedChange={(checked) => setFormData(prevData => ({ ...prevData, apply_same_mc: !!checked }))}
          />
          <Label htmlFor="apply_same_mc">Apply Same Making Charge for all variations</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="apply_same_discount"
            name="apply_same_discount"
            checked={formData.apply_same_discount}
            onCheckedChange={(checked) => setFormData(prevData => ({ ...prevData, apply_same_discount: !!checked }))}
          />
          <Label htmlFor="apply_same_discount">Apply Same Discount for all variations</Label>
        </div>

        <div>
          <Label htmlFor="product_type">Product Type</Label>
          <Select value={formData.product_type} onValueChange={(value) => setFormData(prevData => ({ ...prevData, product_type: value }))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select product type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pieces">Pieces</SelectItem>
              <SelectItem value="pairs">Pairs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Images</Label>
          <ImageManager 
            images={formData.images} 
            onImagesChange={(images) => setFormData(prevData => ({ ...prevData, images }))} 
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="bg-gold hover:bg-gold-dark text-navy">
          {isSubmitting ? 'Updating...' : 'Update Product'}
        </Button>
      </form>
    </div>
  );
};

export default EditProduct;
