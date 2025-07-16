
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);

  console.log('EditProduct: productId from params:', productId);

  useEffect(() => {
    console.log('EditProduct: Component mounted, productId:', productId);
    if (productId) {
      fetchProduct();
      fetchVariations();
    } else {
      console.error('EditProduct: No productId provided in URL params');
      setError('No product ID provided');
      setIsLoading(false);
    }
  }, [productId]);

  const fetchProduct = async () => {
    if (!productId) {
      console.error('EditProduct: No productId available for fetching');
      return;
    }

    try {
      console.log('EditProduct: Fetching product with ID:', productId);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

      console.log('EditProduct: Product query result:', { data, error });

      if (error) {
        console.error('EditProduct: Database error:', error);
        throw error;
      }

      if (!data) {
        console.warn('EditProduct: No product found with ID:', productId);
        setError('Product not found');
        setIsLoading(false);
        return;
      }

      // Map database columns to Product interface
      const mappedProduct: Product = {
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

      console.log('EditProduct: Mapped product:', mappedProduct);
      setProduct(mappedProduct);
    } catch (error) {
      console.error('EditProduct: Error fetching product:', error);
      setError('Failed to fetch product. Please try again.');
      toast({
        title: "Error",
        description: "Failed to fetch product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchVariations = async () => {
    if (!productId) {
      console.error('EditProduct: No productId available for fetching variations');
      return;
    }

    try {
      console.log('EditProduct: Fetching variations for product:', productId);

      const { data, error } = await supabase
        .from('product_variations')
        .select('*')
        .eq('parent_product_id', productId);

      console.log('EditProduct: Variations query result:', { data, error });

      if (error) {
        console.error('EditProduct: Error fetching variations:', error);
        throw error;
      }

      const mappedVariations: ProductVariation[] = (data || []).map(variation => ({
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

      console.log('EditProduct: Mapped variations:', mappedVariations);
      setVariations(mappedVariations);
    } catch (error) {
      console.error('EditProduct: Error fetching variations:', error);
      // Don't set error state here since variations are optional
      // Just log the error and continue
    } finally {
      // Set loading to false after both product and variations are processed
      setIsLoading(false);
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

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => navigate('/admin/products')} variant="outline">
              Back to Products
            </Button>
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

      <div className="mb-6 p-6 border rounded-lg bg-background">
        <h3 className="text-xl font-semibold mb-4">Product Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Name:</strong> {product.name}</p>
            <p><strong>Description:</strong> {product.description || 'No description'}</p>
            <p><strong>Product Type:</strong> {product.product_type}</p>
            <p><strong>In Stock:</strong> {product.in_stock ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p><strong>Making Charge:</strong> {product.making_charge_percentage}%</p>
            <p><strong>Discount:</strong> {product.discount_percentage ? `${product.discount_percentage}%` : 'None'}</p>
            <p><strong>Available Karats:</strong> {product.available_karats.join(', ')}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
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
