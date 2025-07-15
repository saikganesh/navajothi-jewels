
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
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [activeTab, setActiveTab] = useState<string>('default');

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
    setActiveTab('default');
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

      {variations.length === 0 ? (
        <div className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <p>No variations created yet.</p>
            <p className="text-sm">Click "Add Variation" to create the first variation of this product.</p>
          </div>
          
          {/* Show default variation form when no variations exist */}
          <div className="border rounded-lg p-4">
            <h4 className="text-md font-medium mb-4">Create First Variation</h4>
            <ProductVariationForm
              parentProductId={parentProductId}
              collections={collections}
              onFormDataChange={() => {}}
              onImagesChange={() => {}}
              onFileChange={() => {}}
              currentImages={[]}
              isUploading={isUploading}
            />
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            {variations.map((variation, index) => (
              <TabsTrigger key={variation.id} value={variation.id} className="group">
                <span>Variation {index + 1}</span>
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
      )}
    </div>
  );
};

export default ProductVariationsTab;
