import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Label,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Checkbox,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from "@/components/ui";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast"
import { supabase } from '@/integrations/supabase/client';
import ImageManager from '@/components/ImageManager';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
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
}

interface Variation {
  id: string;
  parent_product_id: string;
  variation_name: string;
  description: string;
  price: number;
  in_stock: boolean;
  karat_22kt_gross_weight: number;
  karat_22kt_stone_weight: number;
  karat_22kt_net_weight: number;
  karat_18kt_gross_weight: number;
  karat_18kt_stone_weight: number;
  karat_18kt_net_weight: number;
  available_karats: string[];
  images: string[];
}

interface Collection {
  id: string;
  name: string;
}

const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVariationDialogOpen, setIsVariationDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isVariationImageUploading, setIsVariationImageUploading] = useState(false);

  const resetProductForm = () => {
    setSelectedProduct({
      id: '',
      name: '',
      description: '',
      price: 0,
      collection_id: '',
      in_stock: true,
      karat_22kt_gross_weight: 0,
      karat_22kt_stone_weight: 0,
      karat_22kt_net_weight: 0,
      karat_18kt_gross_weight: 0,
      karat_18kt_stone_weight: 0,
      karat_18kt_net_weight: 0,
      available_karats: ['22kt'],
      images: []
    });
  };

  const resetVariationForm = () => {
    setSelectedVariation({
      id: '',
      parent_product_id: '',
      variation_name: '',
      description: '',
      price: 0,
      in_stock: true,
      karat_22kt_gross_weight: 0,
      karat_22kt_stone_weight: 0,
      karat_22kt_net_weight: 0,
      karat_18kt_gross_weight: 0,
      karat_18kt_stone_weight: 0,
      karat_18kt_net_weight: 0,
      available_karats: ['22kt'],
      images: []
    });
  };

  const handleProductImageUpload = async (file: File) => {
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

      if (error) {
        throw error;
      }

      const publicURL = `https://nauojezdlsfagudtqpcg.supabase.co/storage/v1/object/public/product-images/${filePath}`;

      setSelectedProduct(prev => {
        if (!prev) return null;
        return { ...prev, images: [...prev.images, publicURL] };
      });
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

      if (error) {
        throw error;
      }

      const publicURL = `https://nauojezdlsfagudtqpcg.supabase.co/storage/v1/object/public/product-images/${filePath}`;

      setSelectedVariation(prev => {
        if (!prev) return null;
        return { ...prev, images: [...prev.images, publicURL] };
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVariationImageUploading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products. Please try again.",
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
        description: "Failed to fetch collections. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCollections();
  }, []);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });

      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!selectedProduct) return;

    try {
      const productData = {
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price,
        collection_id: selectedProduct.collection_id || null,
        in_stock: selectedProduct.in_stock,
        carat_22kt_gross_weight: selectedProduct.karat_22kt_gross_weight,
        carat_22kt_stone_weight: selectedProduct.karat_22kt_stone_weight,
        carat_22kt_net_weight: selectedProduct.karat_22kt_net_weight,
        carat_18kt_gross_weight: selectedProduct.karat_18kt_gross_weight,
        carat_18kt_stone_weight: selectedProduct.karat_18kt_stone_weight,
        carat_18kt_net_weight: selectedProduct.karat_18kt_net_weight,
        available_carats: selectedProduct.available_karats,
        images: selectedProduct.images
      };

      let result;
      if (selectedProduct.id) {
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', selectedProduct.id);
      } else {
        result = await supabase
          .from('products')
          .insert([productData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Product ${selectedProduct.id ? 'updated' : 'created'} successfully.`,
      });

      setIsDialogOpen(false);
      fetchProducts();
      resetProductForm();
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
    if (!selectedVariation) return;

    try {
      const variationData = {
        parent_product_id: selectedVariation.parent_product_id,
        variation_name: selectedVariation.variation_name,
        description: selectedVariation.description,
        price: selectedVariation.price,
        in_stock: selectedVariation.in_stock,
        carat_22kt_gross_weight: selectedVariation.karat_22kt_gross_weight,
        carat_22kt_stone_weight: selectedVariation.karat_22kt_stone_weight,
        carat_22kt_net_weight: selectedVariation.karat_22kt_net_weight,
        carat_18kt_gross_weight: selectedVariation.karat_18kt_gross_weight,
        carat_18kt_stone_weight: selectedVariation.karat_18kt_stone_weight,
        carat_18kt_net_weight: selectedVariation.karat_18kt_net_weight,
        available_carats: selectedVariation.available_karats,
        images: selectedVariation.images
      };

      let result;
      if (selectedVariation.id) {
        result = await supabase
          .from('product_variations')
          .update(variationData)
          .eq('id', selectedVariation.id);
      } else {
        result = await supabase
          .from('product_variations')
          .insert([variationData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Variation ${selectedVariation.id ? 'updated' : 'created'} successfully.`,
      });

      setIsVariationDialogOpen(false);
      fetchProducts();
      resetVariationForm();
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-navy">Products Management</h2>
        <Button 
          onClick={() => {
            resetProductForm();
            setIsDialogOpen(true);
          }}
          className="bg-gold hover:bg-gold-dark text-navy"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Table>
        <TableCaption>A list of your products.</TableCaption>
        <TableHead>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>In Stock</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>₹{product.price}</TableCell>
              <TableCell>{product.in_stock ? 'Yes' : 'No'}</TableCell>
              <TableCell>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(product)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedVariation({
                      id: '',
                      parent_product_id: product.id,
                      variation_name: '',
                      description: '',
                      price: 0,
                      in_stock: true,
                      karat_22kt_gross_weight: 0,
                      karat_22kt_stone_weight: 0,
                      karat_22kt_net_weight: 0,
                      karat_18kt_gross_weight: 0,
                      karat_18kt_stone_weight: 0,
                      karat_18kt_net_weight: 0,
                      available_karats: ['22kt'],
                      images: []
                    });
                    setIsVariationDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variation
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              Total products: {products.length}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.id ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={selectedProduct?.name || ''}
                  onChange={(e) => setSelectedProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={selectedProduct?.description || ''}
                  onChange={(e) => setSelectedProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={selectedProduct?.price || 0}
                  onChange={(e) => setSelectedProduct(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="collection">Collection</Label>
                <Select
                  value={selectedProduct?.collection_id || ''}
                  onValueChange={(value) => setSelectedProduct(prev => prev ? { ...prev, collection_id: value } : null)}
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
                  checked={selectedProduct?.in_stock || false}
                  onCheckedChange={(checked) => setSelectedProduct(prev => prev ? { ...prev, in_stock: checked as boolean } : null)}
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
                        checked={selectedProduct?.available_karats?.includes(karat) || false}
                        onCheckedChange={(checked) => {
                          setSelectedProduct(prev => {
                            if (!prev) return null;
                            const currentKarats = prev.available_karats || [];
                            if (checked) {
                              return { ...prev, available_karats: [...currentKarats, karat] };
                            } else {
                              return { ...prev, available_karats: currentKarats.filter(k => k !== karat) };
                            }
                          });
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
                  images={selectedProduct?.images || []}
                  onImagesChange={(images) => setSelectedProduct(prev => prev ? { ...prev, images } : null)}
                  maxImages={5}
                  onFileChange={handleProductImageUpload}
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
                      value={selectedProduct?.karat_22kt_gross_weight || 0}
                      onChange={(e) => setSelectedProduct(prev => prev ? { ...prev, karat_22kt_gross_weight: parseFloat(e.target.value) || 0 } : null)}
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
                      value={selectedProduct?.karat_22kt_stone_weight || 0}
                      onChange={(e) => setSelectedProduct(prev => prev ? { ...prev, karat_22kt_stone_weight: parseFloat(e.target.value) || 0 } : null)}
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
                      value={selectedProduct?.karat_22kt_net_weight || 0}
                      onChange={(e) => setSelectedProduct(prev => prev ? { ...prev, karat_22kt_net_weight: parseFloat(e.target.value) || 0 } : null)}
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
                      value={selectedProduct?.karat_18kt_gross_weight || 0}
                      onChange={(e) => setSelectedProduct(prev => prev ? { ...prev, karat_18kt_gross_weight: parseFloat(e.target.value) || 0 } : null)}
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
                      value={selectedProduct?.karat_18kt_stone_weight || 0}
                      onChange={(e) => setSelectedProduct(prev => prev ? { ...prev, karat_18kt_stone_weight: parseFloat(e.target.value) || 0 } : null)}
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
                      value={selectedProduct?.karat_18kt_net_weight || 0}
                      onChange={(e) => setSelectedProduct(prev => prev ? { ...prev, karat_18kt_net_weight: parseFloat(e.target.value) || 0 } : null)}
                      placeholder="Enter net weight"
                      min="0"
                      step="0.001"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark text-navy">
              {selectedProduct?.id ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Variation Dialog */}
      <Dialog open={isVariationDialogOpen} onOpenChange={setIsVariationDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedVariation?.id ? 'Edit Variation' : 'Add New Variation'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="variation_name">Variation Name</Label>
                <Input
                  id="variation_name"
                  value={selectedVariation?.variation_name || ''}
                  onChange={(e) => setSelectedVariation(prev => prev ? { ...prev, variation_name: e.target.value } : null)}
                  placeholder="Enter variation name"
                />
              </div>

              <div>
                <Label htmlFor="variation_description">Description</Label>
                <Textarea
                  id="variation_description"
                  value={selectedVariation?.description || ''}
                  onChange={(e) => setSelectedVariation(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Enter variation description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="variation_price">Price (₹)</Label>
                <Input
                  id="variation_price"
                  type="number"
                  value={selectedVariation?.price || 0}
                  onChange={(e) => setSelectedVariation(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="variation_in_stock"
                  checked={selectedVariation?.in_stock || false}
                  onCheckedChange={(checked) => setSelectedVariation(prev => prev ? { ...prev, in_stock: checked as boolean } : null)}
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
                        checked={selectedVariation?.available_karats?.includes(karat) || false}
                        onCheckedChange={(checked) => {
                          setSelectedVariation(prev => {
                            if (!prev) return null;
                            const currentKarats = prev.available_karats || [];
                            if (checked) {
                              return { ...prev, available_karats: [...currentKarats, karat] };
                            } else {
                              return { ...prev, available_karats: currentKarats.filter(k => k !== karat) };
                            }
                          });
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
                  images={selectedVariation?.images || []}
                  onImagesChange={(images) => setSelectedVariation(prev => prev ? { ...prev, images } : null)}
                  maxImages={5}
                  onFileChange={handleVariationImageUpload}
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
                      value={selectedVariation?.karat_22kt_gross_weight || 0}
                      onChange={(e) => setSelectedVariation(prev => prev ? { ...prev, karat_22kt_gross_weight: parseFloat(e.target.value) || 0 } : null)}
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
                      value={selectedVariation?.karat_22kt_stone_weight || 0}
                      onChange={(e) => setSelectedVariation(prev => prev ? { ...prev, karat_22kt_stone_weight: parseFloat(e.target.value) || 0 } : null)}
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
                      value={selectedVariation?.karat_22kt_net_weight || 0}
                      onChange={(e) => setSelectedVariation(prev => prev ? { ...prev, karat_22kt_net_weight: parseFloat(e.target.value) || 0 } : null)}
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
                      value={selectedVariation?.karat_18kt_gross_weight || 0}
                      onChange={(e) => setSelectedVariation(prev => prev ? { ...prev, karat_18kt_gross_weight: parseFloat(e.target.value) || 0 } : null)}
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
                      value={selectedVariation?.karat_18kt_stone_weight || 0}
                      onChange={(e) => setSelectedVariation(prev => prev ? { ...prev, karat_18kt_stone_weight: parseFloat(e.target.value) || 0 } : null)}
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
                      value={selectedVariation?.karat_18kt_net_weight || 0}
                      onChange={(e) => setSelectedVariation(prev => prev ? { ...prev, karat_18kt_net_weight: parseFloat(e.target.value) || 0 } : null)}
                      placeholder="Enter net weight"
                      min="0"
                      step="0.001"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVariationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVariation} className="bg-gold hover:bg-gold-dark text-navy">
              {selectedVariation?.id ? 'Update Variation' : 'Create Variation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsManagement;
