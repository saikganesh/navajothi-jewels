
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImageManager from './ImageManager';

interface Category {
  id: string;
  name: string;
}

interface CollectionManagementProps {
  onCollectionAdded?: () => void;
}

const CollectionManagement = ({ onCollectionAdded }: CollectionManagementProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<FileList | null>(null);
  const { toast } = useToast();
  const { uploadImage, deleteImage, isUploading } = useImageUpload();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Collection name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category_id) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let finalImages = [...currentImages];

      // Upload new files if any
      if (newFiles && newFiles.length > 0) {
        for (let i = 0; i < newFiles.length; i++) {
          const uploadedImage = await uploadImage(newFiles[i], 'collections');
          if (uploadedImage) {
            finalImages.push(uploadedImage.url);
          }
        }
      }

      const collectionData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category_id: formData.category_id,
        image_url: finalImages.length > 0 ? finalImages[0] : null,
      };

      const { error } = await supabase
        .from('collections')
        .insert([collectionData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Collection added successfully",
      });

      // Reset form
      resetForm();
      
      // Call the callback to refresh the parent component
      if (onCollectionAdded) {
        onCollectionAdded();
      }
    } catch (error: any) {
      console.error('Error adding collection:', error);
      toast({
        title: "Error",
        description: error.message.includes('duplicate') 
          ? "A collection with this name already exists"
          : "Failed to add collection",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category_id: '',
    });
    setCurrentImages([]);
    setNewFiles(null);
    setIsOpen(false);
  };

  const handleFileChange = (files: FileList) => {
    setNewFiles(files);
    
    // Create preview URLs for new files
    const newPreviews: string[] = [];
    for (let i = 0; i < files.length; i++) {
      newPreviews.push(URL.createObjectURL(files[i]));
    }
    setCurrentImages(prev => [...prev, ...newPreviews]);
  };

  const handleImagesChange = async (images: string[]) => {
    // Find removed images and delete them from storage
    const removedImages = currentImages.filter(img => !images.includes(img));
    
    for (const removedImage of removedImages) {
      // Only delete if it's not a preview URL (actual stored image)
      if (!removedImage.startsWith('blob:')) {
        const imagePath = removedImage.split('/').pop();
        if (imagePath) {
          await deleteImage(`collections/${imagePath}`);
        }
      } else {
        // Clean up preview URL
        URL.revokeObjectURL(removedImage);
      }
    }
    
    setCurrentImages(images);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Collection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Collection</DialogTitle>
          <DialogDescription>
            Create a new collection within a category.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Collection Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter collection name"
              disabled={isLoading}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter collection description (optional)"
              disabled={isLoading}
            />
          </div>

          <ImageManager
            images={currentImages}
            onImagesChange={handleImagesChange}
            onFileChange={handleFileChange}
            isLoading={isLoading || isUploading}
            label="Collection Image"
            multiple={false}
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isUploading}>
              {isLoading ? 'Adding...' : 'Add Collection'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CollectionManagement;
