
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  
  const isEditMode = !!editCategory;

  // Initialize form with edit data
  React.useEffect(() => {
    if (editCategory) {
      setIsOpen(true);
      setCategoryName(editCategory.name);
    }
  }, [editCategory]);
  const { toast } = useToast();


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

      let error;
      if (isEditMode && editCategory) {
        // Update existing category
        ({ error } = await supabase
          .from('categories')
          .update({ 
            name: categoryName.trim()
          })
          .eq('id', editCategory.id));
      } else {
        // Insert new category
        ({ error } = await supabase
          .from('categories')
          .insert([{ 
            name: categoryName.trim()
          }]));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: isEditMode ? "Category updated successfully" : "Category added successfully",
      });

      setCategoryName('');
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
    <>
      {!isEditMode && (
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      )}
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          // Reset form when closing
          setCategoryName('');
          if (isEditMode && onEditComplete) {
            onEditComplete();
          }
        }
      }}>
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
                disabled={isLoading}
                required
              />
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
              <Button type="submit" disabled={isLoading}>
                {isLoading 
                  ? (isEditMode ? 'Updating...' : 'Adding...') 
                  : (isEditMode ? 'Update Category' : 'Add Category')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CategoryManagement;
