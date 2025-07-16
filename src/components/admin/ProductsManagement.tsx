
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImageManager from './ImageManager';
import { useToast } from '@/hooks/use-toast';

interface Collection {
  id: string;
  name: string;
}

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  collection_id: string;
  in_stock: boolean;
  images: string[];
  karat_22kt_gross_weight: number;
  karat_22kt_stone_weight: number;
  karat_22kt_net_weight: number;
  karat_18kt_gross_weight?: number;
  karat_18kt_stone_weight?: number;
  karat_18kt_net_weight?: number;
  available_karats: string[];
}

interface ProductVariation {
  id?: string;
  parent_product_id: string;
  variation_name: string;
  description: string;
  price: number;
  in_stock: boolean;
  images: string[];
  karat_22kt_gross_weight: number;
  karat_22kt_stone_weight: number;
  karat_22kt_net_weight: number;
  karat_18kt_gross_weight?: number;
  karat_18kt_stone_weight?: number;
  karat_18kt_net_weight?: number;
  available_karats: string[];
}

const ProductsManagement = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showVariationForm, setShowVariationForm] = useState(false);
  const [variations, setVariations] = useState<any[]>([]);
  const { uploadImage } = useImageUpload();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCollections();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    setProducts(data || []);
  };

  const fetchCollections = async () => {
    const { data, error } = await supabase.from('collections').select('*');
    if (error) {
      console.error('Error fetching collections:', error);
      return;
    }
    setCollections(data || []);
  };

  const fetchVariations = async (productId: string) => {
    const { data, error } = await supabase
      .from('product_variations')
      .select('*')
      .eq('parent_product_id', productId);
    if (error) {
      console.error('Error fetching variations:', error);
      return;
    }
    setVariations(data || []);
  };

  const calculateNetWeight = (grossWeight: number, stoneWeight: number = 0) => {
    return Math.max(0, grossWeight - stoneWeight);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const productData = {
        name: selectedProduct.name,
        description: selectedProduct.description || null,
        price: selectedProduct.price || null,
        collection_id: selectedProduct.collection_id || null,
        in_stock: selectedProduct.in_stock,
        images: selectedProduct.images,
        karat_22kt_gross_weight: selectedProduct.karat_22kt_gross_weight || null,
        karat_22kt_stone_weight: selectedProduct.karat_22kt_stone_weight || null,
        karat_22kt_net_weight: selectedProduct.karat_22kt_net_weight || null,
        karat_18kt_gross_weight: selectedProduct.karat_18kt_gross_weight || null,
        karat_18kt_stone_weight: selectedProduct.karat_18kt_stone_weight || null,
        karat_18kt_net_weight: selectedProduct.karat_18kt_net_weight || null,
        available_karats: selectedProduct.available_karats
      };

      if (isEditing && selectedProduct.id) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', selectedProduct.id);
        if (error) throw error;
        toast({ title: "Product updated successfully" });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        if (error) throw error;
        toast({ title: "Product created successfully" });
      }

      setSelectedProduct(null);
      setIsEditing(false);
      fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({ 
        title: "Error saving product", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleVariationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariation) return;

    try {
      const variationData = {
        parent_product_id: selectedVariation.parent_product_id,
        variation_name: selectedVariation.variation_name,
        description: selectedVariation.description || null,
        price: selectedVariation.price || null,
        in_stock: selectedVariation.in_stock,
        images: selectedVariation.images,
        karat_22kt_gross_weight: selectedVariation.karat_22kt_gross_weight || null,
        karat_22kt_stone_weight: selectedVariation.karat_22kt_stone_weight || null,
        karat_22kt_net_weight: selectedVariation.karat_22kt_net_weight || null,
        karat_18kt_gross_weight: selectedVariation.karat_18kt_gross_weight || null,
        karat_18kt_stone_weight: selectedVariation.karat_18kt_stone_weight || null,
        karat_18kt_net_weight: selectedVariation.karat_18kt_net_weight || null,
        available_karats: selectedVariation.available_karats
      };

      if (selectedVariation.id) {
        const { error } = await supabase
          .from('product_variations')
          .update(variationData)
          .eq('id', selectedVariation.id);
        if (error) throw error;
        toast({ title: "Variation updated successfully" });
      } else {
        const { error } = await supabase
          .from('product_variations')
          .insert([variationData]);
        if (error) throw error;
        toast({ title: "Variation created successfully" });
      }

      setSelectedVariation(null);
      setShowVariationForm(false);
      fetchVariations(selectedVariation.parent_product_id);
    } catch (error: any) {
      console.error('Error saving variation:', error);
      toast({ 
        title: "Error saving variation", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const editProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditing(true);
    setShowVariationForm(false);
    setSelectedVariation(null);
    fetchVariations(product.id || '');
  };

  const deleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      toast({ title: "Error deleting product", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Product deleted successfully" });
    fetchProducts();
  };

  const editVariation = (variation: ProductVariation) => {
    setSelectedVariation(variation);
    setShowVariationForm(true);
  };

  const deleteVariation = async (variationId: string, parentProductId: string) => {
    if (!window.confirm('Are you sure you want to delete this variation?')) return;
    const { error } = await supabase.from('product_variations').delete().eq('id', variationId);
    if (error) {
      toast({ title: "Error deleting variation", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Variation deleted successfully" });
    fetchVariations(parentProductId);
  };

  const renderProductForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleProductSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={selectedProduct?.name || ''}
              onChange={(e) => setSelectedProduct(prev => prev ? {...prev, name: e.target.value} : null)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={selectedProduct?.description || ''}
              onChange={(e) => setSelectedProduct(prev => prev ? {...prev, description: e.target.value} : null)}
            />
          </div>

          <div>
            <Label htmlFor="collection">Collection</Label>
            <Select
              value={selectedProduct?.collection_id || ''}
              onValueChange={(value) => setSelectedProduct(prev => prev ? {...prev, collection_id: value} : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a collection" />
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

          {/* Available Karats */}
          <div>
            <Label>Available Karats</Label>
            <div className="flex space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="22kt"
                  checked={selectedProduct?.available_karats?.includes('22kt') || false}
                  onCheckedChange={(checked) => {
                    if (!selectedProduct) return;
                    
                    let newKarats = [...(selectedProduct.available_karats || [])];
                    if (checked) {
                      if (!newKarats.includes('22kt')) {
                        newKarats.push('22kt');
                      }
                    } else {
                      newKarats = newKarats.filter(k => k !== '22kt');
                    }
                    
                    setSelectedProduct(prev => prev ? {...prev, available_karats: newKarats} : null);
                  }}
                />
                <Label htmlFor="22kt">22KT</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="18kt"
                  checked={selectedProduct?.available_karats?.includes('18kt') || false}
                  onCheckedChange={(checked) => {
                    if (!selectedProduct) return;
                    
                    let newKarats = [...(selectedProduct.available_karats || [])];
                    if (checked) {
                      if (!newKarats.includes('18kt')) {
                        newKarats.push('18kt');
                      }
                    } else {
                      newKarats = newKarats.filter(k => k !== '18kt');
                    }
                    
                    setSelectedProduct(prev => prev ? {...prev, available_karats: newKarats} : null);
                  }}
                />
                <Label htmlFor="18kt">18KT</Label>
              </div>
            </div>
          </div>

          {/* 22KT Weights */}
          {selectedProduct?.available_karats?.includes('22kt') && (
            <div className="border p-4 rounded-lg">
              <h4 className="font-semibold mb-3">22KT Weights</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="22kt_gross_weight">Gross Weight (g)</Label>
                  <Input
                    id="22kt_gross_weight"
                    type="number"
                    step="0.001"
                    value={selectedProduct?.karat_22kt_gross_weight || ''}
                    onChange={(e) => {
                      const grossWeight = parseFloat(e.target.value) || 0;
                      const stoneWeight = selectedProduct?.karat_22kt_stone_weight || 0;
                      const netWeight = calculateNetWeight(grossWeight, stoneWeight);
                      
                      setSelectedProduct(prev => prev ? {
                        ...prev, 
                        karat_22kt_gross_weight: grossWeight,
                        karat_22kt_net_weight: netWeight
                      } : null);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="22kt_stone_weight">Stone Weight (g)</Label>
                  <Input
                    id="22kt_stone_weight"
                    type="number"
                    step="0.001"
                    value={selectedProduct?.karat_22kt_stone_weight || ''}
                    onChange={(e) => {
                      const stoneWeight = parseFloat(e.target.value) || 0;
                      const grossWeight = selectedProduct?.karat_22kt_gross_weight || 0;
                      const netWeight = calculateNetWeight(grossWeight, stoneWeight);
                      
                      setSelectedProduct(prev => prev ? {
                        ...prev, 
                        karat_22kt_stone_weight: stoneWeight,
                        karat_22kt_net_weight: netWeight
                      } : null);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="22kt_net_weight">Net Weight (g)</Label>
                  <Input
                    id="22kt_net_weight"
                    type="number"
                    step="0.001"
                    value={selectedProduct?.karat_22kt_net_weight || ''}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 18KT Weights */}
          {selectedProduct?.available_karats?.includes('18kt') && (
            <div className="border p-4 rounded-lg">
              <h4 className="font-semibold mb-3">18KT Weights</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="18kt_gross_weight">Gross Weight (g)</Label>
                  <Input
                    id="18kt_gross_weight"
                    type="number"
                    step="0.001"
                    value={selectedProduct?.karat_18kt_gross_weight || ''}
                    onChange={(e) => {
                      const grossWeight = parseFloat(e.target.value) || 0;
                      const stoneWeight = selectedProduct?.karat_18kt_stone_weight || 0;
                      const netWeight = calculateNetWeight(grossWeight, stoneWeight);
                      
                      setSelectedProduct(prev => prev ? {
                        ...prev, 
                        karat_18kt_gross_weight: grossWeight,
                        karat_18kt_net_weight: netWeight
                      } : null);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="18kt_stone_weight">Stone Weight (g)</Label>
                  <Input
                    id="18kt_stone_weight"
                    type="number"
                    step="0.001"
                    value={selectedProduct?.karat_18kt_stone_weight || ''}
                    onChange={(e) => {
                      const stoneWeight = parseFloat(e.target.value) || 0;
                      const grossWeight = selectedProduct?.karat_18kt_gross_weight || 0;
                      const netWeight = calculateNetWeight(grossWeight, stoneWeight);
                      
                      setSelectedProduct(prev => prev ? {
                        ...prev, 
                        karat_18kt_stone_weight: stoneWeight,
                        karat_18kt_net_weight: netWeight
                      } : null);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="18kt_net_weight">Net Weight (g)</Label>
                  <Input
                    id="18kt_net_weight"
                    type="number"
                    step="0.001"
                    value={selectedProduct?.karat_18kt_net_weight || ''}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="price">Price (₹)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={selectedProduct?.price || ''}
              onChange={(e) => setSelectedProduct(prev => prev ? {...prev, price: parseFloat(e.target.value) || 0} : null)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="in_stock"
              checked={selectedProduct?.in_stock || false}
              onCheckedChange={(checked) => setSelectedProduct(prev => prev ? {...prev, in_stock: !!checked} : null)}
            />
            <Label htmlFor="in_stock">In Stock</Label>
          </div>

          <div>
            <Label>Product Images</Label>
            <ImageManager
              images={selectedProduct?.images || []}
              onImagesChange={(images) => setSelectedProduct(prev => prev ? {...prev, images} : null)}
              maxImages={10}
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit">
              {isEditing ? 'Update Product' : 'Create Product'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setSelectedProduct(null);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const renderVariationForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{selectedVariation?.id ? 'Edit Variation' : 'Add New Variation'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVariationSubmit} className="space-y-4">
          <div>
            <Label htmlFor="variation_name">Variation Name</Label>
            <Input
              id="variation_name"
              value={selectedVariation?.variation_name || ''}
              onChange={(e) => setSelectedVariation(prev => prev ? {...prev, variation_name: e.target.value} : null)}
              required
            />
          </div>

          <div>
            <Label htmlFor="variation_description">Description</Label>
            <Textarea
              id="variation_description"
              value={selectedVariation?.description || ''}
              onChange={(e) => setSelectedVariation(prev => prev ? {...prev, description: e.target.value} : null)}
            />
          </div>

          {/* Available Karats for Variation */}
          <div>
            <Label>Available Karats</Label>
            <div className="flex space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="var_22kt"
                  checked={selectedVariation?.available_karats?.includes('22kt') || false}
                  onCheckedChange={(checked) => {
                    if (!selectedVariation) return;
                    
                    let newKarats = [...(selectedVariation.available_karats || [])];
                    if (checked) {
                      if (!newKarats.includes('22kt')) {
                        newKarats.push('22kt');
                      }
                    } else {
                      newKarats = newKarats.filter(k => k !== '22kt');
                    }
                    
                    setSelectedVariation(prev => prev ? {...prev, available_karats: newKarats} : null);
                  }}
                />
                <Label htmlFor="var_22kt">22KT</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="var_18kt"
                  checked={selectedVariation?.available_karats?.includes('18kt') || false}
                  onCheckedChange={(checked) => {
                    if (!selectedVariation) return;
                    
                    let newKarats = [...(selectedVariation.available_karats || [])];
                    if (checked) {
                      if (!newKarats.includes('18kt')) {
                        newKarats.push('18kt');
                      }
                    } else {
                      newKarats = newKarats.filter(k => k !== '18kt');
                    }
                    
                    setSelectedVariation(prev => prev ? {...prev, available_karats: newKarats} : null);
                  }}
                />
                <Label htmlFor="var_18kt">18KT</Label>
              </div>
            </div>
          </div>

          {/* 22KT Weights for Variation */}
          {selectedVariation?.available_karats?.includes('22kt') && (
            <div className="border p-4 rounded-lg">
              <h4 className="font-semibold mb-3">22KT Weights</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="var_22kt_gross_weight">Gross Weight (g)</Label>
                  <Input
                    id="var_22kt_gross_weight"
                    type="number"
                    step="0.001"
                    value={selectedVariation?.karat_22kt_gross_weight || ''}
                    onChange={(e) => {
                      const grossWeight = parseFloat(e.target.value) || 0;
                      const stoneWeight = selectedVariation?.karat_22kt_stone_weight || 0;
                      const netWeight = calculateNetWeight(grossWeight, stoneWeight);
                      
                      setSelectedVariation(prev => prev ? {
                        ...prev, 
                        karat_22kt_gross_weight: grossWeight,
                        karat_22kt_net_weight: netWeight
                      } : null);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="var_22kt_stone_weight">Stone Weight (g)</Label>
                  <Input
                    id="var_22kt_stone_weight"
                    type="number"
                    step="0.001"
                    value={selectedVariation?.karat_22kt_stone_weight || ''}
                    onChange={(e) => {
                      const stoneWeight = parseFloat(e.target.value) || 0;
                      const grossWeight = selectedVariation?.karat_22kt_gross_weight || 0;
                      const netWeight = calculateNetWeight(grossWeight, stoneWeight);
                      
                      setSelectedVariation(prev => prev ? {
                        ...prev, 
                        karat_22kt_stone_weight: stoneWeight,
                        karat_22kt_net_weight: netWeight
                      } : null);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="var_22kt_net_weight">Net Weight (g)</Label>
                  <Input
                    id="var_22kt_net_weight"
                    type="number"
                    step="0.001"
                    value={selectedVariation?.karat_22kt_net_weight || ''}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 18KT Weights for Variation */}
          {selectedVariation?.available_karats?.includes('18kt') && (
            <div className="border p-4 rounded-lg">
              <h4 className="font-semibold mb-3">18KT Weights</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="var_18kt_gross_weight">Gross Weight (g)</Label>
                  <Input
                    id="var_18kt_gross_weight"
                    type="number"
                    step="0.001"
                    value={selectedVariation?.karat_18kt_gross_weight || ''}
                    onChange={(e) => {
                      const grossWeight = parseFloat(e.target.value) || 0;
                      const stoneWeight = selectedVariation?.karat_18kt_stone_weight || 0;
                      const netWeight = calculateNetWeight(grossWeight, stoneWeight);
                      
                      setSelectedVariation(prev => prev ? {
                        ...prev, 
                        karat_18kt_gross_weight: grossWeight,
                        karat_18kt_net_weight: netWeight
                      } : null);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="var_18kt_stone_weight">Stone Weight (g)</Label>
                  <Input
                    id="var_18kt_stone_weight"
                    type="number"
                    step="0.001"
                    value={selectedVariation?.karat_18kt_stone_weight || ''}
                    onChange={(e) => {
                      const stoneWeight = parseFloat(e.target.value) || 0;
                      const grossWeight = selectedVariation?.karat_18kt_gross_weight || 0;
                      const netWeight = calculateNetWeight(grossWeight, stoneWeight);
                      
                      setSelectedVariation(prev => prev ? {
                        ...prev, 
                        karat_18kt_stone_weight: stoneWeight,
                        karat_18kt_net_weight: netWeight
                      } : null);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="var_18kt_net_weight">Net Weight (g)</Label>
                  <Input
                    id="var_18kt_net_weight"
                    type="number"
                    step="0.001"
                    value={selectedVariation?.karat_18kt_net_weight || ''}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="variation_price">Price (₹)</Label>
            <Input
              id="variation_price"
              type="number"
              step="0.01"
              value={selectedVariation?.price || ''}
              onChange={(e) => setSelectedVariation(prev => prev ? {...prev, price: parseFloat(e.target.value) || 0} : null)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="variation_in_stock"
              checked={selectedVariation?.in_stock || false}
              onCheckedChange={(checked) => setSelectedVariation(prev => prev ? {...prev, in_stock: !!checked} : null)}
            />
            <Label htmlFor="variation_in_stock">In Stock</Label>
          </div>

          <div>
            <Label>Variation Images</Label>
            <ImageManager
              images={selectedVariation?.images || []}
              onImagesChange={(images) => setSelectedVariation(prev => prev ? {...prev, images} : null)}
              maxImages={10}
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit">
              {selectedVariation?.id ? 'Update Variation' : 'Create Variation'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setSelectedVariation(null);
                setShowVariationForm(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Products Management</h2>
      <div className="mb-6">
        <Button onClick={() => {
          setSelectedProduct({
            name: '',
            description: '',
            price: 0,
            collection_id: '',
            in_stock: false,
            images: [],
            karat_22kt_gross_weight: 0,
            karat_22kt_stone_weight: 0,
            karat_22kt_net_weight: 0,
            available_karats: []
          });
          setIsEditing(false);
          setShowVariationForm(false);
          setSelectedVariation(null);
        }}>
          Add New Product
        </Button>
      </div>

      {selectedProduct && renderProductForm()}

      {isEditing && !showVariationForm && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Variations</h3>
          <Button onClick={() => {
            setSelectedVariation({
              parent_product_id: selectedProduct?.id || '',
              variation_name: '',
              description: '',
              price: 0,
              in_stock: false,
              images: [],
              karat_22kt_gross_weight: 0,
              karat_22kt_stone_weight: 0,
              karat_22kt_net_weight: 0,
              available_karats: []
            });
            setShowVariationForm(true);
          }}>
            Add New Variation
          </Button>
          <div className="mt-4 space-y-4">
            {variations.map((variation) => (
              <Card key={variation.id}>
                <CardContent className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{variation.variation_name}</h4>
                    <p className="text-sm text-muted-foreground">{variation.description}</p>
                    <p className="text-sm">Price: ₹{variation.price}</p>
                    <p className="text-sm">In Stock: {variation.in_stock ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="space-x-2">
                    <Button size="sm" onClick={() => editVariation(variation)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteVariation(variation.id, variation.parent_product_id)}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {showVariationForm && selectedVariation && renderVariationForm()}

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">All Products</h3>
        <div className="space-y-4">
          {products.map((product) => (
            <Card key={product.id}>
              <CardContent className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{product.name}</h4>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                  <p className="text-sm">Price: ₹{product.price}</p>
                  <p className="text-sm">In Stock: {product.in_stock ? 'Yes' : 'No'}</p>
                </div>
                <div className="space-x-2">
                  <Button size="sm" onClick={() => editProduct(product)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteProduct(product.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsManagement;
