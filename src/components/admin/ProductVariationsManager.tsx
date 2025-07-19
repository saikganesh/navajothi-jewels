
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProductVariation } from '@/types/product';
import { v4 as uuidv4 } from 'uuid';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImageManager from './ImageManager';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

interface ProductVariationsManagerProps {
  productId: string;
  onVariationAdded?: () => void;
}

const ProductVariationsManager = ({ productId, onVariationAdded }: ProductVariationsManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<FileList | null>(null);
  const { toast } = useToast();
  const { uploadImage, deleteImage, isUploading } = useImageUpload();

  const [formData, setFormData] = useState({
    variation_name: '',
    description: '',
    price: '',
    in_stock: true,
    available_karats: [],
    making_charge_percentage: '',
    discount_percentage: '',
    product_type: 'variation',
  });

  useEffect(() => {
    fetchCollections();
    fetchVariations();
  }, [productId]);

  useEffect(() => {
    if (selectedVariation) {
      setIsEditOpen(true);
      setFormData({
        variation_name: selectedVariation.variation_name || '',
        description: selectedVariation.description || '',
        price: selectedVariation.price?.toString() || '',
        in_stock: selectedVariation.in_stock || true,
        available_karats: selectedVariation.available_karats || [],
        making_charge_percentage: selectedVariation.making_charge_percentage?.toString() || '',
        discount_percentage: selectedVariation.discount_percentage?.toString() || '',
        product_type: 'variation',
      });
      setCurrentImages(selectedVariation.images ? [selectedVariation.images] : []);
    }
  }, [selectedVariation]);

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('id, name, description, image_url')
        .order('name');

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const fetchVariations = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('parent_product_id', productId)
        .eq('type', 'variation');

      if (error) throw error;
      
      // Map the database results to ProductVariation interface
      const mappedVariations: ProductVariation[] = (data || []).map(item => ({
        id: item.id,
        parent_product_id: item.parent_product_id || '',
        variation_name: item.name || '', // Use 'name' field as 'variation_name'
        description: item.description,
        price: null, // Price is calculated dynamically
        images: item.images,
        in_stock: true, // Default to true
        available_karats: item.available_karats,
        making_charge_percentage: item.making_charge_percentage,
        discount_percentage: item.discount_percentage,
        product_type: item.product_type
      }));
      
      setVariations(mappedVariations);
    } catch (error) {
      console.error('Error fetching variations:', error);
    }
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

  const handleFileChange = (files: FileList) => {
    setNewFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalImage = null;

      // Upload new file if any
      if (newFiles && newFiles.length > 0) {
        const uploadedImage = await uploadImage(newFiles[0], 'products');
        if (uploadedImage) {
          finalImage = uploadedImage.url;
        }
      } else {
        // Use existing image that's not a blob URL
        const existingImage = currentImages.find(img => !img.startsWith('blob:'));
        if (existingImage) {
          finalImage = existingImage;
        }
      }

      const variationData = {
        id: uuidv4(),
        parent_product_id: productId,
        name: formData.variation_name.trim(), // Use 'name' field instead of 'variation_name'
        description: formData.description.trim() || null,
        images: finalImage,
        available_karats: formData.available_karats,
        making_charge_percentage: parseFloat(formData.making_charge_percentage),
        discount_percentage: parseFloat(formData.discount_percentage),
        product_type: 'variation',
        type: 'variation',
      };

      const { error } = await supabase
        .from('products')
        .insert([variationData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Variation added successfully",
      });

      resetForm();
      fetchVariations();
      if (onVariationAdded) {
        onVariationAdded();
      }
    } catch (error: any) {
      console.error('Error saving variation:', error);
      toast({
        title: "Error",
        description: error.message.includes('duplicate') 
          ? "A variation with this name already exists"
          : "Failed to add variation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditLoading(true);
  
    if (!selectedVariation) {
      toast({
        title: "Error",
        description: "No variation selected for editing",
        variant: "destructive",
      });
      setIsEditLoading(false);
      return;
    }
  
    try {
      let finalImage = null;
  
      // Upload new file if any
      if (newFiles && newFiles.length > 0) {
        const uploadedImage = await uploadImage(newFiles[0], 'products');
        if (uploadedImage) {
          finalImage = uploadedImage.url;
        }
      } else {
        // Use existing image that's not a blob URL
        const existingImage = currentImages.find(img => !img.startsWith('blob:'));
        if (existingImage) {
          finalImage = existingImage;
        }
      }
  
      const variationData = {
        name: formData.variation_name.trim(), // Use 'name' field instead of 'variation_name'
        description: formData.description.trim() || null,
        images: finalImage,
        available_karats: formData.available_karats,
        making_charge_percentage: parseFloat(formData.making_charge_percentage),
        discount_percentage: parseFloat(formData.discount_percentage),
      };
  
      const { error } = await supabase
        .from('products')
        .update(variationData)
        .eq('id', selectedVariation.id);
  
      if (error) throw error;
  
      toast({
        title: "Success",
        description: "Variation updated successfully",
      });
  
      resetForm();
      fetchVariations();
      if (onVariationAdded) {
        onVariationAdded();
      }
    } catch (error: any) {
      console.error('Error updating variation:', error);
      toast({
        title: "Error",
        description: error.message.includes('duplicate')
          ? "A variation with this name already exists"
          : "Failed to update variation",
        variant: "destructive",
      });
    } finally {
      setIsEditLoading(false);
      setIsEditOpen(false);
    }
  };

  const handleDelete = async (variationId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', variationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Variation deleted successfully",
      });
      
      fetchVariations();
    } catch (error) {
      console.error('Error deleting variation:', error);
      toast({
        title: "Error",
        description: "Failed to delete variation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      variation_name: '',
      description: '',
      price: '',
      in_stock: true,
      available_karats: [],
      making_charge_percentage: '',
      discount_percentage: '',
      product_type: 'variation',
    });
    
    // Clean up any blob URLs
    currentImages.forEach(img => {
      if (img.startsWith('blob:')) {
        URL.revokeObjectURL(img);
      }
    });
    
    setCurrentImages([]);
    setNewFiles(null);
    setIsOpen(false);
    setIsEditOpen(false);
    setSelectedVariation(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          // Reset form when closing
          resetForm();
        }
      }}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Variation
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Variation</DialogTitle>
            <DialogDescription>
              Create a new product variation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="variation_name">Variation Name</Label>
              <Input
                id="variation_name"
                value={formData.variation_name}
                onChange={(e) => setFormData({ ...formData, variation_name: e.target.value })}
                placeholder="Enter variation name"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter variation description (optional)"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="available_karats">Available Karats</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, available_karats: [value] })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a karat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="22kt">22kt</SelectItem>
                  <SelectItem value="18kt">18kt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="making_charge_percentage">Making Charge Percentage</Label>
              <Input
                type="number"
                id="making_charge_percentage"
                value={formData.making_charge_percentage}
                onChange={(e) => setFormData({ ...formData, making_charge_percentage: e.target.value })}
                placeholder="Enter making charge percentage"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <Label htmlFor="discount_percentage">Discount Percentage</Label>
              <Input
                type="number"
                id="discount_percentage"
                value={formData.discount_percentage}
                onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                placeholder="Enter discount percentage"
                disabled={isLoading}
                required
              />
            </div>

            <ImageManager
              images={currentImages}
              onImagesChange={handleImagesChange}
              onFileChange={handleFileChange}
              isLoading={isLoading || isUploading}
              label="Variation Image"
              multiple={false}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isUploading}>
                {isLoading ? 'Adding...' : 'Add Variation'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open);
        if (!open) {
          // Reset form when closing
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Variation</DialogTitle>
            <DialogDescription>
              Update the variation details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="variation_name">Variation Name</Label>
              <Input
                id="variation_name"
                value={formData.variation_name}
                onChange={(e) => setFormData({ ...formData, variation_name: e.target.value })}
                placeholder="Enter variation name"
                disabled={isEditLoading}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter variation description (optional)"
                disabled={isEditLoading}
              />
            </div>

            <div>
              <Label htmlFor="available_karats">Available Karats</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, available_karats: [value] })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a karat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="22kt">22kt</SelectItem>
                  <SelectItem value="18kt">18kt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="making_charge_percentage">Making Charge Percentage</Label>
              <Input
                type="number"
                id="making_charge_percentage"
                value={formData.making_charge_percentage}
                onChange={(e) => setFormData({ ...formData, making_charge_percentage: e.target.value })}
                placeholder="Enter making charge percentage"
                disabled={isEditLoading}
                required
              />
            </div>

            <div>
              <Label htmlFor="discount_percentage">Discount Percentage</Label>
              <Input
                type="number"
                id="discount_percentage"
                value={formData.discount_percentage}
                onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                placeholder="Enter discount percentage"
                disabled={isEditLoading}
                required
              />
            </div>

            <ImageManager
              images={currentImages}
              onImagesChange={handleImagesChange}
              onFileChange={handleFileChange}
              isLoading={isEditLoading || isUploading}
              label="Variation Image"
              multiple={false}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={isEditLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isEditLoading || isUploading}>
                {isEditLoading ? 'Updating...' : 'Update Variation'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div>
        <h3 className="text-xl font-bold tracking-tight mb-4">Product Variations</h3>
        {variations.length === 0 ? (
          <p className="text-muted-foreground">No variations found for this product.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {variations.map((variation) => (
              <div key={variation.id} className="border rounded-md p-4">
                <h4 className="font-semibold">{variation.variation_name}</h4>
                <p className="text-sm text-muted-foreground">Price: Calculated dynamically</p>
                <div className="flex justify-end space-x-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                    onClick={() => setSelectedVariation(variation)}
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
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the variation
                          "{variation.variation_name}" from your system.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(variation.id)}
                          className="bg-red-600 hover:bg-red-700"
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
    </>
  );
};

export default ProductVariationsManager;
