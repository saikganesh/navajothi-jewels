
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImageManager from './ImageManager';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

interface CollectionManagementProps {
  onCollectionAdded?: () => void;
  editCollection?: Collection | null;
  onEditComplete?: () => void;
}

const CollectionManagement = ({ onCollectionAdded, editCollection, onEditComplete }: CollectionManagementProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<FileList | null>(null);
  const { toast } = useToast();
  const { uploadImage, deleteImage, isUploading } = useImageUpload();

  const isEditMode = !!editCollection;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  // Initialize form with edit data
  useEffect(() => {
    if (editCollection) {
      setIsOpen(true);
      setFormData({
        name: editCollection.name,
        description: editCollection.description || '',
      });
      setCurrentImages(editCollection.image_url ? [editCollection.image_url] : []);
    }
  }, [editCollection]);

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

    setIsLoading(true);

    try {
      let finalImage = null;

      // Upload new file if any
      if (newFiles && newFiles.length > 0) {
        const uploadedImage = await uploadImage(newFiles[0], 'collections');
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

      const collectionData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        image_url: finalImage,
      };

      let error;
      if (isEditMode && editCollection) {
        // Update existing collection
        ({ error } = await supabase
          .from('collections')
          .update(collectionData)
          .eq('id', editCollection.id));
      } else {
        // Insert new collection
        ({ error } = await supabase
          .from('collections')
          .insert([collectionData]));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: isEditMode ? "Collection updated successfully" : "Collection added successfully",
      });

      resetForm();
      
      // Call the appropriate callback to refresh the parent component
      if (isEditMode && onEditComplete) {
        onEditComplete();
      } else if (onCollectionAdded) {
        onCollectionAdded();
      }
    } catch (error: any) {
      console.error('Error saving collection:', error);
      toast({
        title: "Error",
        description: error.message.includes('duplicate') 
          ? "A collection with this name already exists"
          : isEditMode ? "Failed to update collection" : "Failed to add collection",
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
          await deleteImage(`collections/${imagePath}`);
        }
      }
    }
    
    setCurrentImages(images);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        // Reset form when closing
        resetForm();
        if (isEditMode && onEditComplete) {
          onEditComplete();
        }
      }
    }}>
      {!isEditMode && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Collection
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Collection' : 'Add New Collection'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update the collection details.'
              : 'Create a new collection.'}
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
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isUploading}>
              {isLoading 
                ? (isEditMode ? 'Updating...' : 'Adding...') 
                : (isEditMode ? 'Update Collection' : 'Add Collection')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CollectionManagement;
