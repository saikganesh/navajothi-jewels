
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useImageUpload } from '@/hooks/useImageUpload';

interface Category {
  id: string;
  name: string;
  image_url: string | null;
}

interface CategoryManagementProps {
  onCategoryAdded?: () => void;
  editCategory?: Category | null;
  onEditComplete?: () => void;
}

const CategoryManagement = ({ onCategoryAdded, editCategory, onEditComplete }: CategoryManagementProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  
  const isEditMode = !!editCategory;

  // Initialize form with edit data
  React.useEffect(() => {
    if (editCategory) {
      setIsOpen(true);
      setCategoryName(editCategory.name);
      setCoverPhotoPreview(editCategory.image_url);
      setCoverPhoto(null);
    }
  }, [editCategory]);
  const { toast } = useToast();
  const { uploadImage, isUploading } = useImageUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setCoverPhoto(file);
        const reader = new FileReader();
        reader.onload = () => setCoverPhotoPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
      }
    }
  };

  const removeCoverPhoto = () => {
    setCoverPhoto(null);
    setCoverPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = null;
      
      // Upload cover photo if provided
      if (coverPhoto) {
        const uploadedImage = await uploadImage(coverPhoto, 'categories');
        if (uploadedImage) {
          imageUrl = uploadedImage.url;
        }
      } else if (isEditMode && !coverPhoto) {
        // Keep existing image if no new photo is uploaded in edit mode
        imageUrl = editCategory?.image_url || null;
      }

      let error;
      if (isEditMode && editCategory) {
        // Update existing category
        ({ error } = await supabase
          .from('categories')
          .update({ 
            name: categoryName.trim(),
            image_url: imageUrl
          })
          .eq('id', editCategory.id));
      } else {
        // Insert new category
        ({ error } = await supabase
          .from('categories')
          .insert([{ 
            name: categoryName.trim(),
            image_url: imageUrl
          }]));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: isEditMode ? "Category updated successfully" : "Category added successfully",
      });

      setCategoryName('');
      setCoverPhoto(null);
      setCoverPhotoPreview(null);
      setIsOpen(false);
      
      // Call the appropriate callback to refresh the parent component
      if (isEditMode && onEditComplete) {
        onEditComplete();
      } else if (onCategoryAdded) {
        onCategoryAdded();
      }
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: error.message.includes('duplicate') 
          ? "A category with this name already exists"
          : isEditMode ? "Failed to update category" : "Failed to add category",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        // Reset form when closing
        setCategoryName('');
        setCoverPhoto(null);
        setCoverPhotoPreview(null);
        if (isEditMode && onEditComplete) {
          onEditComplete();
        }
      }
    }}>
      {!isEditMode && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update the category details for your jewelry collections.'
              : 'Create a new category for organizing your jewelry collections.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
              disabled={isLoading || isUploading}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="coverPhoto">Cover Photo</Label>
            <div className="mt-2">
              {coverPhotoPreview ? (
                <div className="relative">
                  <img 
                    src={coverPhotoPreview} 
                    alt="Cover photo preview" 
                    className="w-full h-32 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeCoverPhoto}
                    disabled={isLoading || isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    id="coverPhoto"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isLoading || isUploading}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-32 border-dashed"
                    onClick={() => document.getElementById('coverPhoto')?.click()}
                    disabled={isLoading || isUploading}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload cover photo
                      </span>
                    </div>
                  </Button>
                </div>
              )}
            </div>
          </div>
          
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
              {isLoading || isUploading 
                ? (isEditMode ? 'Updating...' : 'Adding...') 
                : (isEditMode ? 'Update Category' : 'Add Category')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManagement;
