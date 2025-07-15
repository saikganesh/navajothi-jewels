
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import ProductVariationForm from './ProductVariationForm';

interface ProductVariation {
  id: string;
  formData: any;
  images: string[];
  newFiles: FileList | null;
}

interface ProductVariationsTabProps {
  parentProductId: string;
  collections: any[];
  isUploading: boolean;
  onVariationsChange: (variations: ProductVariation[]) => void;
}

const ProductVariationsTab: React.FC<ProductVariationsTabProps> = ({
  parentProductId,
  collections,
  isUploading,
  onVariationsChange
}) => {
  const [variations, setVariations] = useState<ProductVariation[]>(() => {
    // Initialize with one default variation
    const defaultVariation: ProductVariation = {
      id: crypto.randomUUID(),
      formData: {},
      images: [],
      newFiles: null,
    };
    return [defaultVariation];
  });
  const [activeTab, setActiveTab] = useState<string>('');

  React.useEffect(() => {
    if (variations.length > 0 && !activeTab) {
      setActiveTab(variations[0].id);
    }
    // Notify parent about the initial variation
    onVariationsChange(variations);
  }, [variations, activeTab, onVariationsChange]);

  const addVariation = () => {
    const newVariation: ProductVariation = {
      id: crypto.randomUUID(),
      formData: {},
      images: [],
      newFiles: null,
    };
    
    const updatedVariations = [...variations, newVariation];
    setVariations(updatedVariations);
    setActiveTab(newVariation.id);
    onVariationsChange(updatedVariations);
  };

  const removeVariation = (variationId: string) => {
    const updatedVariations = variations.filter(v => v.id !== variationId);
    setVariations(updatedVariations);
    
    // Set active tab to the first remaining variation
    if (updatedVariations.length > 0) {
      setActiveTab(updatedVariations[0].id);
    }
    
    onVariationsChange(updatedVariations);
  };

  const updateVariation = (variationId: string, updates: Partial<ProductVariation>) => {
    const updatedVariations = variations.map(v => 
      v.id === variationId ? { ...v, ...updates } : v
    );
    setVariations(updatedVariations);
    onVariationsChange(updatedVariations);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Product Variations</h3>
        <Button
          type="button"
          onClick={addVariation}
          size="sm"
          className="bg-primary hover:bg-primary/90"
          disabled={variations.length >= 20}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Variation
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          {variations.map((variation, index) => (
            <TabsTrigger key={variation.id} value={variation.id} className="group">
              <span>Variation {index + 1}</span>
              {variations.length > 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="ml-2 h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeVariation(variation.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {variations.map((variation) => (
          <TabsContent key={variation.id} value={variation.id} className="mt-4">
            <ProductVariationForm
              parentProductId={parentProductId}
              collections={collections}
              onFormDataChange={(data) => updateVariation(variation.id, { formData: data })}
              onImagesChange={(images) => updateVariation(variation.id, { images })}
              onFileChange={(files) => updateVariation(variation.id, { newFiles: files })}
              currentImages={variation.images}
              isUploading={isUploading}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ProductVariationsTab;
