
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Product } from '@/types/product';
import { Collection } from '@/types/collection';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ImageManager from '@/components/admin/ImageManager';
import { useImageUpload } from '@/hooks/useImageUpload';

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { uploadImage, deleteImage, isUploading } = useImageUpload();

  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [images, setImages] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [inStock, setInStock] = useState(false);
  const [weight, setWeight] = useState('');
  const [purity, setPurity] = useState('');
  const [availableKarats, setAvailableKarats] = useState<string[]>([]);
  const [makingChargePercentage, setMakingChargePercentage] = useState<number | undefined>(undefined);
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(null);
  const [applySameMC, setApplySameMC] = useState(false);
  const [applySameDiscount, setApplySameDiscount] = useState(false);
  const [productType, setProductType] = useState('');
  const [stockQuantity, setStockQuantity] = useState<number | undefined>(undefined);
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [netWeight, setNetWeight] = useState<number | undefined>(undefined);
	const [type, setType] = useState<string>('product');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newFiles, setNewFiles] = useState<FileList | null>(null);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
      fetchCollections();
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        });
      }

      if (data) {
        // Create a Product object that matches our interface
        const productData: Product = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          price: undefined, // price is calculated dynamically
          image: Array.isArray(data.images) && data.images.length > 0 ? data.images[0] : '',
          category: data.category_id || '',
          inStock: true, // Assuming inStock is always true
          weight: '', // These fields don't exist in the current database schema
          purity: '', // These fields don't exist in the current database schema
          available_karats: data.available_karats as string[] || [],
          making_charge_percentage: data.making_charge_percentage,
          discount_percentage: data.discount_percentage,
          apply_same_mc: data.apply_same_mc,
          apply_same_discount: data.apply_same_discount,
          product_type: data.product_type || '',
          stock_quantity: undefined, // stock_quantity is managed in karats table
          category_id: data.category_id,
          collection_ids: data.collection_ids as string[] || [],
          net_weight: undefined, // This field doesn't exist in current schema
          type: data.type || 'product',
          parent_product_id: data.parent_product_id
        };

        setProduct(productData);
        setName(data.name);
        setDescription(data.description || '');
        setPrice(undefined); // price is calculated dynamically
        setImages(data.images as string[] || []);
        setCategory(data.category_id || '');
        setInStock(true); // Assuming inStock is always true
        setWeight(''); // These fields don't exist in the current database schema
        setPurity(''); // These fields don't exist in the current database schema
        setAvailableKarats(data.available_karats as string[] || []);
        setMakingChargePercentage(data.making_charge_percentage);
        setDiscountPercentage(data.discount_percentage);
        setApplySameMC(data.apply_same_mc);
        setApplySameDiscount(data.apply_same_discount);
        setProductType(data.product_type || '');
        setStockQuantity(undefined); // stock_quantity is managed in karats table
        setCollectionIds(data.collection_ids as string[] || []);
        setNetWeight(undefined); // This field doesn't exist in current schema
				setType(data.type || 'product');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('id, name, description, image_url, created_at, updated_at')
        .order('name');

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (!name.trim()) {
        toast({
          title: "Error",
          description: "Product name is required",
          variant: "destructive",
        });
        return;
      }

      let finalImages = [...images];

      // Handle image uploads
      if (newFiles && newFiles.length > 0) {
        const uploadPromises = Array.from(newFiles).map(async (file) => {
          const uploadedImage = await uploadImage(file, 'products');
          return uploadedImage?.url;
        });

        const uploadedImageUrls = await Promise.all(uploadPromises);
        finalImages = [...finalImages, ...uploadedImageUrls].filter(Boolean) as string[];
      }

      const productData: any = {
        name: name.trim(),
        description: description.trim() || null,
        images: finalImages,
        category_id: category || null,
        available_karats: availableKarats,
        making_charge_percentage: makingChargePercentage,
        discount_percentage: discountPercentage,
        apply_same_mc: applySameMC,
        apply_same_discount: applySameDiscount,
        product_type: productType.trim() || null,
        collection_ids: collectionIds,
				type: type,
      };

      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      navigate('/admin/products');
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImagesChange = async (newImages: string[]) => {
    // Find removed images and clean up blob URLs
    const removedImages = images.filter(img => !newImages.includes(img));
    
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
    
    setImages(newImages);
  };

  const handleFileChange = (files: FileList) => {
    setNewFiles(files);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/admin/products" className="inline-flex items-center mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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
							<Label htmlFor="type">Type</Label>
							<Select value={type} onValueChange={setType}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="product">Product</SelectItem>
									<SelectItem value="variation">Variation</SelectItem>
								</SelectContent>
							</Select>
						</div>
            <div>
              <Label htmlFor="category">Category ID</Label>
              <Input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div>
              <Label>Available Karats</Label>
              <div className="flex space-x-2">
                <Switch id="karat-22" checked={availableKarats.includes('22kt')} onCheckedChange={(checked) => {
                  if (checked) {
                    setAvailableKarats([...availableKarats, '22kt']);
                  } else {
                    setAvailableKarats(availableKarats.filter(karat => karat !== '22kt'));
                  }
                }} />
                <Label htmlFor="karat-22">22kt</Label>

                <Switch id="karat-18" checked={availableKarats.includes('18kt')} onCheckedChange={(checked) => {
                  if (checked) {
                    setAvailableKarats([...availableKarats, '18kt']);
                  } else {
                    setAvailableKarats(availableKarats.filter(karat => karat !== '18kt'));
                  }
                }} />
                <Label htmlFor="karat-18">18kt</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="makingChargePercentage">Making Charge Percentage</Label>
              <Input
                type="number"
                id="makingChargePercentage"
                value={makingChargePercentage || ''}
                onChange={(e) => setMakingChargePercentage(e.target.value === '' ? undefined : parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="discountPercentage">Discount Percentage</Label>
              <Input
                type="number"
                id="discountPercentage"
                value={discountPercentage === null ? '' : discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value === '' ? null : parseFloat(e.target.value))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="applySameMC" checked={applySameMC} onCheckedChange={setApplySameMC} />
              <Label htmlFor="applySameMC">Apply Same Making Charge</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="applySameDiscount" checked={applySameDiscount} onCheckedChange={setApplySameDiscount} />
              <Label htmlFor="applySameDiscount">Apply Same Discount</Label>
            </div>
            <div>
              <Label htmlFor="productType">Product Type</Label>
              <Input
                type="text"
                id="productType"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="collections">Collections</Label>
              <Select
                multiple
                onValueChange={(values) => setCollectionIds(values)}
                defaultValue={collectionIds}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select collections" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>{collection.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ImageManager
              images={images}
              onImagesChange={handleImagesChange}
              onFileChange={handleFileChange}
              isLoading={isSaving || isUploading}
              label="Product Images"
              multiple={true}
            />

            <Button type="submit" disabled={isSaving || isUploading}>
              {isSaving ? 'Updating...' : 'Update Product'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProduct;
