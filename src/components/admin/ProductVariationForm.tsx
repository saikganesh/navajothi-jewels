
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageManager from './ImageManager';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ProductVariationFormProps {
  parentProductId: string;
  collections: any[];
  onFormDataChange: (data: any) => void;
  onImagesChange: (images: string[]) => void;
  onFileChange: (files: FileList | null) => void;
  currentImages: string[];
  isUploading: boolean;
  initialData?: {
    id?: string;
    variation_name?: string;
    description?: string;
    collection_id?: string;
    gross_weight?: string;
    stone_weight?: string;
    carat?: string;
    price?: string;
  };
}

const ProductVariationForm: React.FC<ProductVariationFormProps> = ({
  parentProductId,
  collections,
  onFormDataChange,
  onImagesChange,
  onFileChange,
  currentImages,
  isUploading,
  initialData
}) => {
  const [variationId, setVariationId] = useState<string>('');
  const [formData, setFormData] = useState({
    variation_name: '',
    description: '',
    collection_id: '',
    gross_weight: '',
    stone_weight: '',
    carat: '',
    price: '',
  });

  // Initialize form with existing data if provided
  useEffect(() => {
    if (initialData) {
      setVariationId(initialData.id || crypto.randomUUID());
      setFormData({
        variation_name: initialData.variation_name || '',
        description: initialData.description || '',
        collection_id: initialData.collection_id || '',
        gross_weight: initialData.gross_weight || '',
        stone_weight: initialData.stone_weight || '',
        carat: initialData.carat || '',
        price: initialData.price || '',
      });
    } else {
      setVariationId(crypto.randomUUID());
    }
  }, [initialData]);

  useEffect(() => {
    onFormDataChange({
      ...formData,
      parent_product_id: parentProductId,
      id: variationId,
    });
  }, [formData, parentProductId, variationId, onFormDataChange]);

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
  };

  // Calculate net weight
  const netWeight = formData.gross_weight && formData.stone_weight 
    ? (parseFloat(formData.gross_weight) - parseFloat(formData.stone_weight)).toFixed(3)
    : formData.gross_weight || '';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="variation-id">Variation ID</Label>
          <Input
            id="variation-id"
            value={variationId}
            disabled
            className="bg-muted"
          />
        </div>
        <div>
          <Label htmlFor="variation-name">Variation Name</Label>
          <Input
            id="variation-name"
            value={formData.variation_name}
            onChange={(e) => handleInputChange('variation_name', e.target.value)}
            placeholder="e.g., Small Size, Blue Stone"
            required
          />
        </div>
        <div>
          <Label htmlFor="variation-collection">Collection</Label>
          <Select
            value={formData.collection_id}
            onValueChange={(value) => handleInputChange('collection_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select collection" />
            </SelectTrigger>
            <SelectContent>
              {collections.map((collection) => (
                <SelectItem key={collection.id} value={collection.id}>
                  {collection.name} ({collection.categories?.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="variation-gross-weight">Gross Weight (g)</Label>
          <Input
            id="variation-gross-weight"
            type="number"
            step="0.001"
            value={formData.gross_weight}
            onChange={(e) => handleInputChange('gross_weight', e.target.value)}
            placeholder="0.000"
          />
        </div>
        <div>
          <Label htmlFor="variation-stone-weight">Stone Weight (g)</Label>
          <Input
            id="variation-stone-weight"
            type="number"
            step="0.001"
            value={formData.stone_weight}
            onChange={(e) => handleInputChange('stone_weight', e.target.value)}
            placeholder="0.000"
          />
        </div>
        <div>
          <Label htmlFor="variation-net-weight">Net Weight (g)</Label>
          <Input
            id="variation-net-weight"
            value={netWeight}
            disabled
            className="bg-muted"
            placeholder="Auto-calculated"
          />
        </div>
        <div>
          <Label htmlFor="variation-carat">Carat</Label>
          <Select
            value={formData.carat}
            onValueChange={(value) => handleInputChange('carat', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select carat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="22ct">22ct</SelectItem>
              <SelectItem value="18ct">18ct</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="variation-price">Price (INR)</Label>
          <Input
            id="variation-price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="variation-description">Description</Label>
        <Textarea
          id="variation-description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Variation description..."
        />
      </div>
      
      <ImageManager
        images={currentImages}
        onImagesChange={onImagesChange}
        onFileChange={onFileChange}
        isLoading={isUploading}
        label="Variation Images"
        multiple={true}
      />
    </div>
  );
};

export default ProductVariationForm;
