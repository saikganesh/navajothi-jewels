
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchVariations();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      // Map database columns to Product interface
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
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product. Please try again.",
        variant: "destructive",
      });
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
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Edit Product</h2>

      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Product Details</h3>
        <p><strong>Name:</strong> {product.name}</p>
        <p><strong>Description:</strong> {product.description}</p>
        {/* Display other product details here */}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Variations</h3>
        <div className="mb-4">
          <Button 
            onClick={() => navigate(`/admin/products/${productId}/add-variation`)}
            className="bg-gold hover:bg-gold-dark text-navy"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Variation
          </Button>
        </div>
        {variations.length === 0 ? (
          <p>No variations found for this product.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {variations.map((variation) => (
              <div key={variation.id} className="border rounded p-4">
                <p><strong>Name:</strong> {variation.variation_name}</p>
                <p><strong>Net Weight:</strong> {variation.net_weight}g</p>
                <p><strong>Karat:</strong> {variation.karat}</p>
                <div className="flex gap-2 mt-2">
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
