import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  in_stock: boolean;
  weight: string;
  purity: string;
}

const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [databaseSetup, setDatabaseSetup] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    in_stock: true,
    weight: '',
    purity: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Products table not accessible:', error);
        setDatabaseSetup(false);
        setIsLoading(false);
        return;
      }
      
      setDatabaseSetup(true);
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setDatabaseSetup(false);
      toast({
        title: "Error",
        description: "Failed to fetch products. Database setup may be required.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!databaseSetup) {
      toast({
        title: "Database Setup Required",
        description: "Please set up the database tables first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products' as any)
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        const { error } = await supabase
          .from('products' as any)
          .insert([productData]);

        if (error) throw error;
        toast({ title: "Success", description: "Product created successfully" });
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      image_url: product.image_url || '',
      category: product.category,
      in_stock: product.in_stock,
      weight: product.weight || '',
      purity: product.purity || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!databaseSetup) {
      toast({
        title: "Database Setup Required",
        description: "Please set up the database tables first.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products' as any)
        .delete()
        .eq('id', productId);

      if (error) throw error;
      toast({ title: "Success", description: "Product deleted successfully" });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category: '',
      in_stock: true,
      weight: '',
      purity: '',
    });
  };

  const categories = ['nosepins', 'studs', 'earrings', 'rings'];

  if (isLoading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  if (!databaseSetup) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products Management</h2>
          <p className="text-muted-foreground">
            Set up your database to manage products
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Database Setup Required</CardTitle>
            <CardDescription>
              Please run the SQL migration commands to set up your database tables.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The products table needs to be created before you can manage your jewelry collection.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products Management</h2>
          <p className="text-muted-foreground">
            Manage your jewelry collection
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingProduct(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="e.g., 2.5g"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="purity">Purity</Label>
                  <Input
                    id="purity"
                    value={formData.purity}
                    onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                    placeholder="e.g., 22K"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="in_stock"
                  checked={formData.in_stock}
                  onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
                />
                <Label htmlFor="in_stock">In Stock</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.category}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {product.image_url && (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-md mb-4"
                />
              )}
              <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
              <div className="space-y-1 text-sm">
                <p><strong>Price:</strong> ₹{product.price}</p>
                {product.weight && <p><strong>Weight:</strong> {product.weight}</p>}
                {product.purity && <p><strong>Purity:</strong> {product.purity}</p>}
                <p><strong>Status:</strong> {product.in_stock ? 'In Stock' : 'Out of Stock'}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground">No products found</h3>
          <p className="text-sm text-muted-foreground">Get started by adding your first product.</p>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;
