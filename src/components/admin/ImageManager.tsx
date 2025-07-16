
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface ImageManagerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onFileChange: (files: FileList) => void;
  isLoading?: boolean;
  label: string;
  multiple?: boolean;
  maxImages?: number;
}

const ImageManager: React.FC<ImageManagerProps> = ({
  images,
  onImagesChange,
  onFileChange,
  isLoading = false,
  label,
  multiple = false,
  maxImages = 10
}) => {
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const handleRemoveImage = (index: number) => {
    const imageToRemove = images[index];
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    // Clean up preview URLs
    if (imageToRemove && imageToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove);
    }
    
    // Remove from preview images as well
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setPreviewImages(newPreviews);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Create preview URLs for immediate display
      const newPreviews: string[] = [];
      for (let i = 0; i < files.length; i++) {
        newPreviews.push(URL.createObjectURL(files[i]));
      }
      
      setPreviewImages(prev => [...prev, ...newPreviews]);
      onFileChange(files);
    }
  };

  const displayImages = [...images, ...previewImages];

  return (
    <div>
      <Label htmlFor="images">{label}</Label>
      <Input
        id="images"
        type="file"
        multiple={multiple}
        accept="image/*"
        onChange={handleFileInputChange}
        disabled={isLoading}
        className="cursor-pointer"
      />
      
      {/* Display existing and new images */}
      {displayImages.length > 0 && (
        <div className="mt-4">
          <Label className="text-sm font-medium">Current Images:</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
            {displayImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-md border border-border"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveImage(index)}
                  disabled={isLoading}
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="absolute bottom-1 left-1 bg-background/80 rounded px-1">
                  <span className="text-xs text-muted-foreground">
                    {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageManager;
