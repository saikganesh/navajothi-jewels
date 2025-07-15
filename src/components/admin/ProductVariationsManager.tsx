
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProductVariationForm from './ProductVariationForm';

interface ProductVariation {
  id: string;
  parent_product_id: string;
  variation_name: string;
  description: string | null;
  gross_weight: number | null;
  stone_weight: number | null;
  net_weight: number | null;
  carat: '22ct' | '18ct' | null;
  images: string[];
  in_stock: boolean;
  price: number | null;
  created_at: string;
  updated_at: string;
}

interface Collection {
  id: string;
  name: string;
  category_id: string;
  categories?: {
    name: string;
  };
}

interface ProductVariationsManagerProps {
  productId: string;
  collections: Collection[];
  onVariationsUpdated: () => void;
}

const ProductVariationsManager: React.FC<ProductVariationsManagerProps> = ({
  productId,
  collections,
  onVariationsUpdated
}) => {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingVariation, setEditingVariation] = useState<ProductVariation | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVariations();
  }, [productId]);

  const fetchVariations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('product_variations')
        .select('*')
        .eq('parent_product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform images field to ensure it's always a string array
      const transformedVariations = (data || []).map(variation => ({
        ...variation,
        images: Array.isArray(variation.images) 
          ? variation.images.map(img => String(img))
          : variation.images 
            ? [String(variation.images)]
            : []
      })) as ProductVariation[];

      setVariations(transformedVariations);
    } catch (error) {
      console.error('Error fetching variations:', error);
      toast({
        title: "Error",
        description: "Failed to load product variations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVariation = () => {
    setEditingVariation(null);
    setShowAddForm(true);
  };

  const handleEditVariation = (variation: ProductVariation) => {
    setEditingVariation(variation);
    setShowAddForm(true);
  };

  const handleDeleteVariation = async (variationId: string, variationName: string) => {
    try {
      const { error } = await supabase
        .from('product_variations')
        .delete()
        .eq('id', variationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Variation "${variationName}" deleted successfully`,
      });

      fetchVariations();
      onVariationsUpdated();
    } catch (error) {
      console.error('Error deleting variation:', error);
      toast({
        title: "Error",
        description: "Failed to delete variation",
        variant: "destructive",
      });
    }
  };

  const handleVariationSaved = () => {
    setShowAddForm(false);
    setEditingVariation(null);
    fetchVariations();
    onVariationsUpdated();
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingVariation(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Variations</CardTitle>
          <CardDescription>Loading variations...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Product Variations</h3>
          <p className="text-sm text-muted-foreground">
            Manage different variations of this product
          </p>
        </div>
        <Button onClick={handleAddVariation} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Variation
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{editingVariation ? 'Edit Variation' : 'Add New Variation'}</CardTitle>
                <CardDescription>
                  {editingVariation ? 'Update variation details' : 'Create a new product variation'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={handleCancelForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ProductVariationForm
              productId={productId}
              collections={collections}
              variation={editingVariation}
              onSaved={handleVariationSaved}
              onCancel={handleCancelForm}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Existing Variations ({variations.length})</CardTitle>
          <CardDescription>
            All variations for this product
          </CardDescription>
        </CardHeader>
        <CardContent>
          {variations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No variations found for this product.</p>
              <p className="text-sm">Click "Add Variation" to create the first one.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Weight (g)</TableHead>
                  <TableHead>Carat</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variations.map((variation) => (
                  <TableRow key={variation.id}>
                    <TableCell className="font-medium">{variation.variation_name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>G: {variation.gross_weight ? variation.gross_weight.toFixed(3) : '-'}</div>
                        <div>S: {variation.stone_weight ? variation.stone_weight.toFixed(3) : '-'}</div>
                        <div className="font-medium">N: {variation.net_weight ? variation.net_weight.toFixed(3) : '-'}</div>
                      </div>
                    </TableCell>
                    <TableCell>{variation.carat || '-'}</TableCell>
                    <TableCell>
                      {variation.price ? `₹${variation.price.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={variation.in_stock ? "default" : "destructive"}>
                        {variation.in_stock ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {variation.images.length} image{variation.images.length !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditVariation(variation)}
                          className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-red-50 hover:bg-red-100 border-red-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Variation</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the variation "{variation.variation_name}"? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteVariation(variation.id, variation.variation_name)}
                                className="bg-red-600 hover:bg-red-700"
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductVariationsManager;
