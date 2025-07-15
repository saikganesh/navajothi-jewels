
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImageManager from './ImageManager';

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

interface ProductVariationFormProps {
  productId: string;
  collections: Collection[];
  variation?: ProductVariation | null;
  onSaved: () => void;
  onCancel: () => void;
}

const ProductVariationForm: React.FC<ProductVariationFormProps> = ({
  productId,
  collections,
  variation,
  onSaved,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    variation_name: '',
    description: '',
    gross_weight: '',
    stone_weight: '',
    carat: '',
    price: '',
    in_stock: true
  });
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { uploadImage, deleteImage, isUploading } = useImageUpload();

  // Initialize form data when variation prop changes
  useEffect(() => {
    if (variation) {
      setFormData({
        variation_name: variation.variation_name,
        description: variation.description || '',
        gross_weight: variation.gross_weight?.toString() || '',
        stone_weight: variation.stone_weight?.toString() || '',
        carat: variation.carat || '',
        price: variation.price?.toString() || '',
        in_stock: variation.in_stock
      });
      setCurrentImages(variation.images || []);
    } else {
      // Reset form for new variation
      setFormData({
        variation_name: '',
        description: '',
        gross_weight: '',
        stone_weight: '',
        carat: '',
        price: '',
        in_stock: true
      });
      setCurrentImages([]);
    }
    setNewFiles(null);
  }, [variation]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (files: FileList) => {
    setNewFiles(files);
  };

  const handleImagesChange = async (images: string[]) => {
    // Find removed images and clean up blob URLs
    const removedImages = currentImages.filter(img => !images.includes(img));
    
    for (const removedImage of removedImages) {
      if (removedImage.startsWith('blob:')) {
        URL.revokeObjectURL(removedImage);
      } else {
        // Delete actual uploaded images from storage
        const imagePath = removedImage.split('/').pop();
        if (imagePath) {
          await deleteImage(`products/${imagePath}`);
        }
      }
    }
    
    setCurrentImages(images);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.variation_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Variation name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImages: string[] = [];

      // Upload new files if any and get real URLs
      if (newFiles && newFiles.length > 0) {
        for (let i = 0; i < newFiles.length; i++) {
          const uploadedImage = await uploadImage(newFiles[i], 'products');
          if (uploadedImage) {
            finalImages.push(uploadedImage.url);
          }
        }
      }

      // Add existing images that are already uploaded (not blob URLs)
      const existingImages = currentImages.filter(img => !img.startsWith('blob:'));
      finalImages = [...existingImages, ...finalImages];

      // Calculate net weight
      const grossWeight = formData.gross_weight ? parseFloat(formData.gross_weight) : null;
      const stoneWeight = formData.stone_weight ? parseFloat(formData.stone_weight) : null;
      const netWeight = grossWeight && stoneWeight ? grossWeight - stoneWeight : grossWeight;

      const variationData = {
        parent_product_id: productId,
        variation_name: formData.variation_name.trim(),
        description: formData.description.trim() || null,
        gross_weight: grossWeight,
        stone_weight: stoneWeight,
        net_weight: netWeight,
        carat: formData.carat || null,
        images: finalImages,
        in_stock: formData.in_stock,
        price: formData.price ? parseFloat(formData.price) : null,
        updated_at: new Date().toISOString()
      };

      if (variation) {
        // Update existing variation
        const { error } = await supabase
          .from('product_variations')
          .update(variationData)
          .eq('id', variation.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Variation updated successfully",
        });
      } else {
        // Create new variation
        const { error } = await supabase
          .from('product_variations')
          .insert([variationData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Variation created successfully",
        });
      }

      onSaved();
    } catch (error) {
      console.error('Error saving variation:', error);
      toast({
        title: "Error",
        description: "Failed to save variation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate net weight for display
  const displayNetWeight = formData.gross_weight && formData.stone_weight 
    ? (parseFloat(formData.gross_weight) - parseFloat(formData.stone_weight)).toFixed(3)
    : formData.gross_weight || '';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="variation_name">Variation Name *</Label>
          <Input
            id="variation_name"
            value={formData.variation_name}
            onChange={(e) => handleInputChange('variation_name', e.target.value)}
            placeholder="e.g., Small Size, Blue Stone, Gold Finish"
            required
          />
        </div>

        <div>
          <Label htmlFor="gross_weight">Gross Weight (g)</Label>
          <Input
            id="gross_weight"
            type="number"
            step="0.001"
            value={formData.gross_weight}
            onChange={(e) => handleInputChange('gross_weight', e.target.value)}
            placeholder="0.000"
          />
        </div>

        <div>
          <Label htmlFor="stone_weight">Stone Weight (g)</Label>
          <Input
            id="stone_weight"
            type="number"
            step="0.001"
            value={formData.stone_weight}
            onChange={(e) => handleInputChange('stone_weight', e.target.value)}
            placeholder="0.000"
          />
        </div>

        <div>
          <Label htmlFor="net_weight">Net Weight (g)</Label>
          <Input
            id="net_weight"
            value={displayNetWeight}
            disabled
            className="bg-muted"
            placeholder="Auto-calculated"
          />
        </div>

        <div>
          <Label htmlFor="carat">Carat</Label>
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
          <Label htmlFor="price">Price (INR)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="in_stock"
            checked={formData.in_stock}
            onCheckedChange={(checked) => handleInputChange('in_stock', checked)}
          />
          <Label htmlFor="in_stock">In Stock</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Additional details about this variation..."
          rows={3}
        />
      </div>

      <ImageManager
        images={currentImages}
        onImagesChange={handleImagesChange}
        onFileChange={handleFileChange}
        isLoading={isUploading}
        label="Variation Images"
        multiple={true}
      />

      <div className="flex space-x-3 pt-4 border-t">
        <Button 
          type="submit" 
          disabled={isSubmitting || isUploading}
          className="flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {variation ? 'Update Variation' : 'Create Variation'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting || isUploading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ProductVariationForm;
