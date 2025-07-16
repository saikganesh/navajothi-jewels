
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { supabase } from '@/integrations/supabase/client';

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
  product_type: string;
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
  product_type: string;
}

const EditProduct = () => {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [collections, setCollections] = useState<any[]>([]);

  const form = useForm<Product>({
    defaultValues: {
      name: '',
      description: '',
      collection_id: null,
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
      discount_percentage: null,
      apply_same_mc: false,
      apply_same_discount: false,
      product_type: 'pieces'
    }
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
          product_type: data.product_type || 'pieces'
        };

        setProduct(mappedProduct);
        form.reset(mappedProduct);
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
        product_type: variation.product_type || 'pieces'
      }));

      setVariations(mappedVariations);
    } catch (error) {
      console.error('Error fetching variations:', error);
    }
  };

  const onSubmit = async (data: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: data.name,
          description: data.description,
          collection_id: data.collection_id,
          in_stock: data.in_stock,
          karat_22kt_gross_weight: data.karat_22kt_gross_weight,
          karat_22kt_stone_weight: data.karat_22kt_stone_weight,
          karat_22kt_net_weight: data.karat_22kt_net_weight,
          karat_18kt_gross_weight: data.karat_18kt_gross_weight,
          karat_18kt_stone_weight: data.karat_18kt_stone_weight,
          karat_18kt_net_weight: data.karat_18kt_net_weight,
          available_karats: data.available_karats,
          images: data.images,
          making_charge_percentage: data.making_charge_percentage,
          discount_percentage: data.discount_percentage,
          apply_same_mc: data.apply_same_mc,
          apply_same_discount: data.apply_same_discount,
          product_type: data.product_type
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
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
      <div className="container mx-auto p-4">
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
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button 
          onClick={() => navigate('/admin/products')} 
          variant="outline"
          className="mb-4"
        >
          ← Back to Products
        </Button>
        <h2 className="text-2xl font-bold">Edit Product</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="collection_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a collection" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {collections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="product_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pieces">Pieces</SelectItem>
                      <SelectItem value="grams">Grams</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="in_stock"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">In Stock</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="making_charge_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Making Charge (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discount_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Weight Details (22kt)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="karat_22kt_gross_weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gross Weight (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="karat_22kt_stone_weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stone Weight (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="karat_22kt_net_weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Net Weight (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Weight Details (18kt)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="karat_18kt_gross_weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gross Weight (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="karat_18kt_stone_weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stone Weight (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="karat_18kt_net_weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Net Weight (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Available Karats</h3>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="22kt"
                    checked={form.watch('available_karats')?.includes('22kt')}
                    onCheckedChange={(checked) => {
                      const current = form.getValues('available_karats') || [];
                      if (checked) {
                        form.setValue('available_karats', [...current, '22kt']);
                      } else {
                        form.setValue('available_karats', current.filter(k => k !== '22kt'));
                      }
                    }}
                  />
                  <Label htmlFor="22kt">22kt</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="18kt"
                    checked={form.watch('available_karats')?.includes('18kt')}
                    onCheckedChange={(checked) => {
                      const current = form.getValues('available_karats') || [];
                      if (checked) {
                        form.setValue('available_karats', [...current, '18kt']);
                      } else {
                        form.setValue('available_karats', current.filter(k => k !== '18kt'));
                      }
                    }}
                  />
                  <Label htmlFor="18kt">18kt</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="bg-gold hover:bg-gold-dark text-navy">
              Update Product
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin/products')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Product Variations</h3>
          <Button 
            onClick={() => navigate(`/admin/products/${productId}/add-variation`)}
            className="bg-gold hover:bg-gold-dark text-navy"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Variation
          </Button>
        </div>
        
        {variations.length === 0 ? (
          <div className="text-center py-8 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">No variations found for this product.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add variations to create different options for this product.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>
    </div>
  );
};

export default EditProduct;
