
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableRow, TableHeader } from "@/components/ui/table";
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
  stock_quantity: number;
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
  collection_ids: string[];
  categories?: {
    name: string;
  };
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
          )
        `);

      if (error) throw error;

      // Map database columns to Product interface
      const mappedProducts = (data || []).map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        category_id: product.category_id,
        stock_quantity: product.stock_quantity,
        karat_22kt_gross_weight: product.karat_22kt_gross_weight || 0,
        karat_22kt_stone_weight: product.karat_22kt_stone_weight || 0,
        karat_22kt_net_weight: product.karat_22kt_net_weight || 0,
        karat_18kt_gross_weight: product.karat_18kt_gross_weight || 0,
        karat_18kt_stone_weight: product.karat_18kt_stone_weight || 0,
        karat_18kt_net_weight: product.karat_18kt_net_weight || 0,
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
        categories: product.categories
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-navy">Products Management</h2>
        <Button 
          onClick={() => navigate('/admin/products/add')}
          className="bg-gold hover:bg-gold-dark text-navy"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Table>
        <TableCaption>A list of your products.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Making Charge</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.categories?.name || '-'}</TableCell>
              <TableCell className="capitalize">{product.product_type}</TableCell>
              <TableCell>{product.making_charge_percentage}%</TableCell>
              <TableCell>{product.discount_percentage ? `${product.discount_percentage}%` : '-'}</TableCell>
              <TableCell>{product.stock_quantity}</TableCell>
              <TableCell>
                <div className="flex gap-2">
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
            <TableCell colSpan={7} className="text-center">
              Total products: {products.length}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default ProductsManagement;
