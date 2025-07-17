
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
  available_karats: string[];
  making_charge_percentage: string;
  discount_percentage: string;
  apply_same_mc: boolean;
  apply_same_discount: boolean;
  product_type: string;
  images: string[];
}

interface KaratData {
  gross_weight: string;
  stone_weight: string;
  net_weight: string;
  stock_quantity: string;
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
    available_karats: ['22kt'],
    making_charge_percentage: '',
    discount_percentage: '',
    apply_same_mc: false,
    apply_same_discount: false,
    product_type: 'pieces',
    images: []
  });

  const [karat22ktData, setKarat22ktData] = useState<KaratData>({
    gross_weight: '',
    stone_weight: '',
    net_weight: '',
    stock_quantity: ''
  });

  const [karat18ktData, setKarat18ktData] = useState<KaratData>({
    gross_weight: '',
    stone_weight: '',
    net_weight: '',
    stock_quantity: ''
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
        .select(`
          *,
          karat_22kt (
            gross_weight,
            stone_weight,
            net_weight,
            stock_quantity
          ),
          karat_18kt (
            gross_weight,
            stone_weight,
            net_weight,
            stock_quantity
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name || '',
        description: data.description || '',
        category_id: data.category_id || '',
        collection_ids: Array.isArray(data.collection_ids) ? data.collection_ids.filter((id: any): id is string => typeof id === 'string') : [],
        available_karats: Array.isArray(data.available_karats) ? data.available_karats.filter((karat: any): karat is string => typeof karat === 'string') : ['22kt'],
        making_charge_percentage: data.making_charge_percentage?.toString() || '',
        discount_percentage: data.discount_percentage?.toString() || '',
        apply_same_mc: data.apply_same_mc || false,
        apply_same_discount: data.apply_same_discount || false,
        product_type: data.product_type || 'pieces',
        images: Array.isArray(data.images) ? data.images.filter((img: any): img is string => typeof img === 'string') : []
      });

      // Set 22kt data
      if (data.karat_22kt && data.karat_22kt.length > 0) {
        const k22 = data.karat_22kt[0];
        setKarat22ktData({
          gross_weight: k22.gross_weight?.toString() || '',
          stone_weight: k22.stone_weight?.toString() || '',
          net_weight: k22.net_weight?.toString() || '',
          stock_quantity: k22.stock_quantity?.toString() || ''
        });
      }

      // Set 18kt data
      if (data.karat_18kt && data.karat_18kt.length > 0) {
        const k18 = data.karat_18kt[0];
        setKarat18ktData({
          gross_weight: k18.gross_weight?.toString() || '',
          stone_weight: k18.stone_weight?.toString() || '',
          net_weight: k18.net_weight?.toString() || '',
          stock_quantity: k18.stock_quantity?.toString() || ''
        });
      }
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
    const target = e.target as HTMLInputElement;
    const checked = target.checked;
  
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

  const handleImageUpload = async (files: FileList) => {
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const result = await uploadImage(file, 'product-images');
        return result?.url || '';
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url !== '');
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validUrls]
      }));
      
      toast({
        title: "Success",
        description: "Images uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: "Failed to upload images.",
        variant: "destructive",
      });
    }
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
        available_karats,
        making_charge_percentage,
        discount_percentage,
        apply_same_mc,
        apply_same_discount,
        product_type,
        images
      } = formData;

      const parsedCollectionIds = Array.isArray(collection_ids) ? collection_ids : [];

      // Update product
      const { error: productError } = await supabase
        .from('products')
        .update({
          name,
          description,
          category_id,
          collection_ids: parsedCollectionIds,
          available_karats,
          making_charge_percentage: making_charge_percentage ? parseInt(making_charge_percentage) : 0,
          discount_percentage: discount_percentage ? parseInt(discount_percentage) : null,
          apply_same_mc,
          apply_same_discount,
          product_type,
          images
        })
        .eq('id', id);

      if (productError) throw productError;

      // Update or insert 22kt data if available
      if (karat22ktData.gross_weight || karat22ktData.stone_weight || karat22ktData.net_weight || karat22ktData.stock_quantity) {
        const { error: k22Error } = await supabase
          .from('karat_22kt')
          .upsert({
            product_id: id,
            gross_weight: karat22ktData.gross_weight ? parseFloat(karat22ktData.gross_weight) : null,
            stone_weight: karat22ktData.stone_weight ? parseFloat(karat22ktData.stone_weight) : null,
            net_weight: karat22ktData.net_weight ? parseFloat(karat22ktData.net_weight) : null,
            stock_quantity: karat22ktData.stock_quantity ? parseInt(karat22ktData.stock_quantity) : 0,
          }, {
            onConflict: 'product_id'
          });

        if (k22Error) throw k22Error;
      }

      // Update or insert 18kt data if available
      if (karat18ktData.gross_weight || karat18ktData.stone_weight || karat18ktData.net_weight || karat18ktData.stock_quantity) {
        const { error: k18Error } = await supabase
          .from('karat_18kt')
          .upsert({
            product_id: id,
            gross_weight: karat18ktData.gross_weight ? parseFloat(karat18ktData.gross_weight) : null,
            stone_weight: karat18ktData.stone_weight ? parseFloat(karat18ktData.stone_weight) : null,
            net_weight: karat18ktData.net_weight ? parseFloat(karat18ktData.net_weight) : null,
            stock_quantity: karat18ktData.stock_quantity ? parseInt(karat18ktData.stock_quantity) : 0,
          }, {
            onConflict: 'product_id'
          });

        if (k18Error) throw k18Error;
      }

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

        {/* 22kt Gold Section */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4 text-navy">22kt Gold Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="karat_22kt_stock_quantity">22kt Stock Quantity</Label>
              <Input
                type="number"
                id="karat_22kt_stock_quantity"
                value={karat22ktData.stock_quantity}
                onChange={(e) => setKarat22ktData(prev => ({ ...prev, stock_quantity: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="karat_22kt_gross_weight">22kt Gross Weight (g)</Label>
              <Input
                type="number"
                id="karat_22kt_gross_weight"
                value={karat22ktData.gross_weight}
                onChange={(e) => setKarat22ktData(prev => ({ ...prev, gross_weight: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="karat_22kt_stone_weight">22kt Stone Weight (g)</Label>
              <Input
                type="number"
                id="karat_22kt_stone_weight"
                value={karat22ktData.stone_weight}
                onChange={(e) => setKarat22ktData(prev => ({ ...prev, stone_weight: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="karat_22kt_net_weight">22kt Net Weight (g)</Label>
              <Input
                type="number"
                id="karat_22kt_net_weight"
                value={karat22ktData.net_weight}
                onChange={(e) => setKarat22ktData(prev => ({ ...prev, net_weight: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* 18kt Gold Section */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4 text-navy">18kt Gold Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="karat_18kt_stock_quantity">18kt Stock Quantity</Label>
              <Input
                type="number"
                id="karat_18kt_stock_quantity"
                value={karat18ktData.stock_quantity}
                onChange={(e) => setKarat18ktData(prev => ({ ...prev, stock_quantity: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="karat_18kt_gross_weight">18kt Gross Weight (g)</Label>
              <Input
                type="number"
                id="karat_18kt_gross_weight"
                value={karat18ktData.gross_weight}
                onChange={(e) => setKarat18ktData(prev => ({ ...prev, gross_weight: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="karat_18kt_stone_weight">18kt Stone Weight (g)</Label>
              <Input
                type="number"
                id="karat_18kt_stone_weight"
                value={karat18ktData.stone_weight}
                onChange={(e) => setKarat18ktData(prev => ({ ...prev, stone_weight: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="karat_18kt_net_weight">18kt Net Weight (g)</Label>
              <Input
                type="number"
                id="karat_18kt_net_weight"
                value={karat18ktData.net_weight}
                onChange={(e) => setKarat18ktData(prev => ({ ...prev, net_weight: e.target.value }))}
              />
            </div>
          </div>
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

        <ImageManager 
          images={formData.images} 
          onImagesChange={(images) => setFormData(prevData => ({ ...prevData, images }))}
          onFileChange={handleImageUpload}
          label="Product Images"
          multiple={true}
          isLoading={isUploading}
        />

        <Button type="submit" disabled={isSubmitting} className="bg-gold hover:bg-gold-dark text-navy">
          {isSubmitting ? 'Updating...' : 'Update Product'}
        </Button>
      </form>
    </div>
  );
};

export default EditProduct;
