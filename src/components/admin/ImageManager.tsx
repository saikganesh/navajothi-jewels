
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
  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      onFileChange(files);
    }
    // Clear the input so the same file can be selected again if needed
    e.target.value = '';
  };

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
      
      {/* Display only the actual uploaded images */}
      {images.length > 0 && (
        <div className="mt-4">
          <Label className="text-sm font-medium">Current Images:</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
            {images.map((imageUrl, index) => (
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
