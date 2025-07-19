import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Link } from 'react-router-dom';
import { Slider } from "@/components/ui/slider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import ImageManager from '@/components/admin/ImageManager';
import { useImageUpload } from '@/hooks/useImageUpload';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

const AddProduct = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [productType, setProductType] = useState('ring');
  const [availableKarats, setAvailableKarats] = useState<string[]>([]);
  const [makingChargePercentage, setMakingChargePercentage] = useState<number>(10);
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(null);
  const [applySameMC, setApplySameMC] = useState(false);
  const [applySameDiscount, setApplySameDiscount] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<FileList | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { uploadImage, deleteImage, isUploading } = useImageUpload();

  useEffect(() => {
    fetchCollections();
  }, []);

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

  const handleImageUpload = async (files: FileList) => {
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

  const handleAddProduct = async () => {
    setIsAdding(true);

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Product name is required",
        variant: "destructive",
      });
      setIsAdding(false);
      return;
    }

    try {
      let finalImages: string[] = [];

      // Upload new files if any
      if (newFiles && newFiles.length > 0) {
        for (let i = 0; i < newFiles.length; i++) {
          const uploadedImage = await uploadImage(newFiles[i], 'products');
          if (uploadedImage) {
            finalImages.push(uploadedImage.url);
          }
        }
      } else {
        // Use existing images that are not blob URLs
        const existingImages = currentImages.filter(img => !img.startsWith('blob:'));
        finalImages = existingImages;
      }

      const productData: Omit<Product, 'id' | 'price' | 'image' | 'inStock' | 'category' | 'weight' | 'purity' | 'stock_quantity' | 'net_weight'> = {
        name: name.trim(),
        description: description.trim() || null,
        product_type: productType,
        available_karats: availableKarats,
        making_charge_percentage: makingChargePercentage,
        discount_percentage: discountPercentage,
        apply_same_mc: applySameMC,
        apply_same_discount: applySameDiscount,
        collection_ids: selectedCollectionIds,
        type: 'product',
      };

      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          images: finalImages,
        }])
        .select('id');

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Product added successfully",
      });

      // Redirect to the newly created product's edit page
      const newProductId = data && data.length > 0 ? data[0].id : null;
      if (newProductId) {
        navigate(`/admin/edit-product/${newProductId}`);
      } else {
        navigate('/admin/products');
      }
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: error.message.includes('duplicate') 
          ? "A product with this name already exists"
          : "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleKaratChange = (karat: string) => {
    setAvailableKarats(prevKarats => {
      if (prevKarats.includes(karat)) {
        return prevKarats.filter(k => k !== karat);
      } else {
        return [...prevKarats, karat];
      }
    });
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setProductType('ring');
    setAvailableKarats([]);
    setMakingChargePercentage(10);
    setDiscountPercentage(null);
    setApplySameMC(false);
    setApplySameDiscount(false);
    setSelectedCollectionIds([]);
    
    // Clean up any blob URLs
    currentImages.forEach(img => {
      if (img.startsWith('blob:')) {
        URL.revokeObjectURL(img);
      }
    });
    
    setCurrentImages([]);
    setNewFiles(null);
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <CardContent className="pl-6 pr-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="productType">Product Type</Label>
              <Select value={productType} onValueChange={setProductType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select product type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ring">Ring</SelectItem>
                  <SelectItem value="earring">Earring</SelectItem>
                  <SelectItem value="pendant">Pendant</SelectItem>
                  <SelectItem value="bangle">Bangle</SelectItem>
                  <SelectItem value="necklace">Necklace</SelectItem>
                  <SelectItem value="bracelet">Bracelet</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Available Karats</Label>
              <div className="flex gap-2 mt-2">
                <Badge
                  variant={availableKarats.includes('22kt') ? 'default' : 'outline'}
                  onClick={() => handleKaratChange('22kt')}
                  className="cursor-pointer"
                >
                  22kt
                </Badge>
                <Badge
                  variant={availableKarats.includes('18kt') ? 'default' : 'outline'}
                  onClick={() => handleKaratChange('18kt')}
                  className="cursor-pointer"
                >
                  18kt
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="makingCharge">Making Charge (%)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    id="makingCharge"
                    value={makingChargePercentage}
                    onChange={(e) => setMakingChargePercentage(Number(e.target.value))}
                    className="w-32"
                  />
                  <Slider
                    defaultValue={[makingChargePercentage]}
                    max={50}
                    step={1}
                    onValueChange={(value) => setMakingChargePercentage(value[0])}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  type="number"
                  id="discount"
                  value={discountPercentage === null ? '' : discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value === '' ? null : Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="applySameMC">Apply Same Making Charge to all variations</Label>
              <Switch
                id="applySameMC"
                checked={applySameMC}
                onCheckedChange={setApplySameMC}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="applySameDiscount">Apply Same Discount to all variations</Label>
              <Switch
                id="applySameDiscount"
                checked={applySameDiscount}
                onCheckedChange={setApplySameDiscount}
              />
            </div>

            <div>
              <Label>Collections</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {collections.map((collection) => (
                  <Badge
                    key={collection.id}
                    variant={selectedCollectionIds.includes(collection.id) ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedCollectionIds((prevIds) =>
                        prevIds.includes(collection.id)
                          ? prevIds.filter((id) => id !== collection.id)
                          : [...prevIds, collection.id]
                      );
                    }}
                    className="cursor-pointer"
                  >
                    {collection.name}
                  </Badge>
                ))}
              </div>
            </div>

            <ImageManager
              images={currentImages}
              onImagesChange={handleImagesChange}
              onFileChange={handleImageUpload}
              isLoading={isAdding || isUploading}
              label="Product Images"
              multiple={true}
            />

            <Button onClick={handleAddProduct} disabled={isAdding || isUploading}>
              {isAdding ? 'Adding...' : 'Add Product'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProduct;
