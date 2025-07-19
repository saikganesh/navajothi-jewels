import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import ImageManager from './ImageManager';

interface Collection {
  id: string;
  name: string;
}

interface ProductVariation {
  id?: string;
  variation_name: string;
  description: string;
  images: string[];
  available_karats: string[];
  making_charge_percentage: string;
  discount_percentage: string;
  collection_ids: string[];
  karat_22kt_gross_weight: string;
  karat_22kt_stone_weight: string;
  karat_22kt_net_weight: number;
  karat_22kt_stock_quantity: string;
  karat_18kt_gross_weight: string;
  karat_18kt_stone_weight: string;
  karat_18kt_net_weight: number;
  karat_18kt_stock_quantity: string;
}

interface ProductVariationsManagerProps {
  productId: string;
  onVariationsChange?: (variations: ProductVariation[]) => void;
}

const ProductVariationsManager: React.FC<ProductVariationsManagerProps> = ({ 
  productId, 
  onVariationsChange 
}) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCollections();
    fetchVariations();
  }, [productId]);

  useEffect(() => {
    if (onVariationsChange) {
      onVariationsChange(variations);
    }
  }, [variations, onVariationsChange]);

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

  const safeParseJsonArray = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(item => typeof item === 'string');
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const fetchVariations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('parent_product_id', productId);

      if (error) throw error;

      const formattedVariations: ProductVariation[] = (data || []).map(variation => ({
        id: variation.id,
        variation_name: variation.name || '',
        description: variation.description || '',
        images: safeParseJsonArray(variation.images),
        available_karats: safeParseJsonArray(variation.available_karats),
        making_charge_percentage: variation.making_charge_percentage?.toString() || '',
        discount_percentage: variation.discount_percentage?.toString() || '',
        collection_ids: safeParseJsonArray(variation.collection_ids),
        karat_22kt_gross_weight: '',
        karat_22kt_stone_weight: '',
        karat_22kt_net_weight: 0,
        karat_22kt_stock_quantity: '',
        karat_18kt_gross_weight: '',
        karat_18kt_stone_weight: '',
        karat_18kt_net_weight: 0,
        karat_18kt_stock_quantity: '',
      }));

      setVariations(formattedVariations);
    } catch (error) {
      console.error('Error fetching variations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product variations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addVariation = () => {
    setVariations(prevVariations => [
      ...prevVariations,
      {
        variation_name: '',
        description: '',
        images: [],
        available_karats: [],
        making_charge_percentage: '',
        discount_percentage: '',
        collection_ids: [],
        karat_22kt_gross_weight: '',
        karat_22kt_stone_weight: '',
        karat_22kt_net_weight: 0,
        karat_22kt_stock_quantity: '',
        karat_18kt_gross_weight: '',
        karat_18kt_stone_weight: '',
        karat_18kt_net_weight: 0,
        karat_18kt_stock_quantity: '',
      }
    ]);
  };

  const updateVariation = (index: number, field: string, value: any) => {
    setVariations(prevVariations => {
      const newVariations = [...prevVariations];
      newVariations[index] = { ...newVariations[index], [field]: value };
      return newVariations;
    });
  };

  const removeVariation = async (index: number) => {
    const variationToRemove = variations[index];

    if (variationToRemove.id) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', variationToRemove.id);

        if (error) {
          console.error('Error deleting variation:', error);
          toast({
            title: "Error",
            description: "Failed to delete product variation. Please try again.",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        console.error('Error deleting variation:', error);
        toast({
          title: "Error",
          description: "Failed to delete product variation. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    setVariations(prevVariations => {
      const newVariations = [...prevVariations];
      newVariations.splice(index, 1);
      return newVariations;
    });
  };

  const handleSaveVariation = async (index: number) => {
    const variation = variations[index];

    if (!variation.variation_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Variation name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const variationData = {
        name: variation.variation_name,
        description: variation.description,
        images: variation.images,
        available_karats: variation.available_karats,
        making_charge_percentage: variation.making_charge_percentage ? parseInt(variation.making_charge_percentage) : 0,
        discount_percentage: variation.discount_percentage ? parseInt(variation.discount_percentage) : null,
        collection_ids: variation.collection_ids,
        product_type: 'variation',
        type: 'variation',
        parent_product_id: productId
      };

      if (variation.id) {
        // Update existing variation
        const { data, error } = await supabase
          .from('products')
          .update(variationData)
          .eq('id', variation.id)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Success",
          description: "Product variation updated successfully.",
        });
      } else {
        // Create new variation
        const { data, error } = await supabase
          .from('products')
          .insert(variationData)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Success",
          description: "Product variation added successfully.",
        });

        setVariations(prevVariations => {
          const newVariations = [...prevVariations];
          newVariations[index].id = data.id;
          return newVariations;
        });
      }

      fetchVariations();
    } catch (error) {
      console.error('Error saving variation:', error);
      toast({
        title: "Error",
        description: "Failed to save product variation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCollectionSelect = (index: number, collectionId: string) => {
    setVariations(prev => {
      const newVariations = [...prev];
      const isSelected = newVariations[index].collection_ids.includes(collectionId);

      if (isSelected) {
        newVariations[index].collection_ids = newVariations[index].collection_ids.filter(id => id !== collectionId);
      } else {
        newVariations[index].collection_ids = [...newVariations[index].collection_ids, collectionId];
      }

      return newVariations;
    });
  };

  const removeCollection = (index: number, collectionId: string) => {
    setVariations(prev => {
      const newVariations = [...prev];
      newVariations[index].collection_ids = newVariations[index].collection_ids.filter(id => id !== collectionId);
      return newVariations;
    });
  };

  const getSelectedCollections = (index: number) => {
    return collections.filter(collection =>
      variations[index].collection_ids.includes(collection.id)
    );
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Product Variations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading variations...</div>
          ) : (
            <div>
              {variations.map((variation, index) => (
                <div key={index} className="mb-6 p-4 border rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`variation_name_${index}`}>Variation Name</Label>
                      <Input
                        type="text"
                        id={`variation_name_${index}`}
                        value={variation.variation_name}
                        onChange={(e) => updateVariation(index, 'variation_name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`variation_description_${index}`}>Description</Label>
                      <Textarea
                        id={`variation_description_${index}`}
                        value={variation.description}
                        onChange={(e) => updateVariation(index, 'description', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label>Collections</Label>
                    <Select onValueChange={(value) => handleCollectionSelect(index, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select collections" />
                      </SelectTrigger>
                      <SelectContent>
                        {collections.map((collection) => (
                          <SelectItem key={collection.id} value={collection.id}>
                            {collection.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {variation.collection_ids.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {getSelectedCollections(index).map((collection) => (
                          <Badge key={collection.id} variant="secondary" className="flex items-center gap-1">
                            {collection.name}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => removeCollection(index, collection.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <Label>Available Karats</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['22kt', '18kt'].map((karat) => (
                        <div key={karat} className="flex items-center space-x-2">
                          <Checkbox
                            id={`karat-${karat}-${index}`}
                            checked={variation.available_karats.includes(karat)}
                            onCheckedChange={(checked) => {
                              const updatedKarats = checked
                                ? [...variation.available_karats, karat]
                                : variation.available_karats.filter(k => k !== karat);
                              updateVariation(index, 'available_karats', updatedKarats);
                            }}
                          />
                          <Label htmlFor={`karat-${karat}-${index}`}>{karat.toUpperCase()}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label>Images</Label>
                    <ImageManager
                      images={variation.images}
                      onImagesChange={(images) => updateVariation(index, 'images', images)}
                      maxImages={5}
                      onFileChange={(files) => {
                        // Handle image upload here
                      }}
                      label="Upload Variation Images"
                      multiple={true}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor={`making_charge_percentage_${index}`}>Making Charge (%)</Label>
                      <Input
                        type="text"
                        id={`making_charge_percentage_${index}`}
                        value={variation.making_charge_percentage}
                        onChange={(e) => updateVariation(index, 'making_charge_percentage', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`discount_percentage_${index}`}>Discount (%)</Label>
                      <Input
                        type="text"
                        id={`discount_percentage_${index}`}
                        value={variation.discount_percentage}
                        onChange={(e) => updateVariation(index, 'discount_percentage', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => handleSaveVariation(index)}>
                      Save
                    </Button>
                    <Button variant="destructive" onClick={() => removeVariation(index)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button onClick={addVariation} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Variation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductVariationsManager;
