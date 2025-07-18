
-- First, migrate existing variation data to the products table
INSERT INTO public.products (
  id,
  name,
  description,
  category_id,
  available_karats,
  images,
  making_charge_percentage,
  discount_percentage,
  apply_same_mc,
  apply_same_discount,
  product_type,
  collection_ids,
  created_at,
  updated_at
)
SELECT 
  pv.id,
  pv.variation_name as name,
  pv.description,
  p.category_id,
  pv.available_karats,
  pv.images,
  pv.making_charge_percentage,
  pv.discount_percentage,
  p.apply_same_mc,
  p.apply_same_discount,
  pv.product_type,
  p.collection_ids,
  pv.created_at,
  pv.updated_at
FROM public.product_variations pv
JOIN public.products p ON pv.parent_product_id = p.id;

-- Add the new 'type' column to products table
ALTER TABLE public.products 
ADD COLUMN type TEXT NOT NULL DEFAULT 'product';

-- Add parent_product_id column to products table for variations
ALTER TABLE public.products 
ADD COLUMN parent_product_id UUID;

-- Update existing products to have type 'product'
UPDATE public.products 
SET type = 'product' 
WHERE parent_product_id IS NULL;

-- Update migrated variations to have type 'variation' and set their parent_product_id
UPDATE public.products 
SET type = 'variation',
    parent_product_id = pv.parent_product_id
FROM public.product_variations pv 
WHERE public.products.id = pv.id;

-- Add foreign key constraint for parent_product_id
ALTER TABLE public.products 
ADD CONSTRAINT products_parent_product_id_fkey 
FOREIGN KEY (parent_product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Add check constraint to ensure variations have a parent_product_id
ALTER TABLE public.products 
ADD CONSTRAINT products_variation_parent_check 
CHECK ((type = 'product' AND parent_product_id IS NULL) OR (type = 'variation' AND parent_product_id IS NOT NULL));

-- Drop the product_variations table
DROP TABLE IF EXISTS public.product_variations CASCADE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(type);
CREATE INDEX IF NOT EXISTS idx_products_parent_product_id ON public.products(parent_product_id);

-- Update RLS policies to handle the new structure
DROP POLICY IF EXISTS "Anyone can view product variations" ON public.products;
DROP POLICY IF EXISTS "Only admins can manage product variations" ON public.products;

-- The existing RLS policies on products table should already cover both products and variations
