
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableRow, TableHeader } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
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
  category_id: string | null;
  available_karats: string[];
  images: string[];
  making_charge_percentage: number;
  discount_percentage: number | null;
  apply_same_mc: boolean;
  apply_same_discount: boolean;
  product_type: string;
  collection_ids: string[];
  type: string; // Added type field
  parent_product_id: string | null; // Added parent_product_id field
  categories?: {
    name: string;
  };
  // Karat data from joined tables
  karat_22kt?: {
    gross_weight: number;
    stone_weight: number;
    net_weight: number;
    stock_quantity: number;
  }[];
  karat_18kt?: {
    gross_weight: number;
    stone_weight: number;
    net_weight: number;
    stock_quantity: number;
  }[];
}

const ProductsManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          ),
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
        .eq('type', 'product'); // Only fetch main products, not variations

      if (error) throw error;

      // Map database columns to Product interface
      const mappedProducts = (data || []).map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        category_id: product.category_id,
        available_karats: Array.isArray(product.available_karats) 
          ? (product.available_karats as string[])
          : ['22kt'],
        images: Array.isArray(product.images) 
          ? (product.images as string[])
          : [],
        making_charge_percentage: product.making_charge_percentage || 0,
        discount_percentage: product.discount_percentage,
        apply_same_mc: product.apply_same_mc || false,
        apply_same_discount: product.apply_same_discount || false,
        product_type: product.product_type || 'pieces',
        collection_ids: Array.isArray(product.collection_ids) 
          ? (product.collection_ids as string[])
          : [],
        type: product.type || 'product',
        parent_product_id: product.parent_product_id,
        categories: product.categories,
        karat_22kt: product.karat_22kt,
        karat_18kt: product.karat_18kt
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product: Product) => {
    navigate(`/admin/products/edit/${product.id}`);
  };

  const handleDelete = async (id: string, productName: string) => {
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

  const get22ktStock = (product: Product) => {
    return product.karat_22kt?.[0]?.stock_quantity || 0;
  };

  const get18ktStock = (product: Product) => {
    return product.karat_18kt?.[0]?.stock_quantity || 0;
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-navy">Products Management</h2>
        <Button 
          onClick={() => navigate('/admin/products/add')}
          className="bg-gold hover:bg-gold-dark text-navy w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="overflow-x-auto">
          <Table>
        <TableCaption>A list of your products.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead className="hidden lg:table-cell">Type</TableHead>
            <TableHead className="hidden xl:table-cell">Making Charge</TableHead>
            <TableHead className="hidden xl:table-cell">Discount</TableHead>
            <TableHead className="hidden sm:table-cell">22kt Stock</TableHead>
            <TableHead className="hidden sm:table-cell">18kt Stock</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">
                <div className="min-w-[120px]">{product.name}</div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{product.categories?.name || '-'}</TableCell>
              <TableCell className="hidden lg:table-cell capitalize">{product.product_type}</TableCell>
              <TableCell className="hidden xl:table-cell">{product.making_charge_percentage}%</TableCell>
              <TableCell className="hidden xl:table-cell">{product.discount_percentage ? `${product.discount_percentage}%` : '-'}</TableCell>
              <TableCell className="hidden sm:table-cell">{get22ktStock(product)}</TableCell>
              <TableCell className="hidden sm:table-cell">{get18ktStock(product)}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 sm:gap-2 justify-end">
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(product)}
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
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{product.name}"? This action cannot be undone and will also delete all associated variations.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(product.id, product.name)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
        <TableFooter>
          <TableRow>
            <TableCell colSpan={8} className="text-center py-4">
              Total products: {products.length}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      </div>
    </div>
  );
};

export default ProductsManagement;
