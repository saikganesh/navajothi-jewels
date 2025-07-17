
-- Add category_id and stock_quantity columns to products table
ALTER TABLE public.products 
ADD COLUMN category_id uuid REFERENCES public.categories(id),
ADD COLUMN stock_quantity integer NOT NULL DEFAULT 0;

-- Add collection_ids column to store array of collection IDs
ALTER TABLE public.products 
ADD COLUMN collection_ids jsonb DEFAULT '[]'::jsonb;

-- Remove the old collection_id column since we're now using collection_ids array
ALTER TABLE public.products 
DROP COLUMN collection_id;

-- Update existing products to have default stock_quantity based on in_stock status
UPDATE public.products 
SET stock_quantity = CASE WHEN in_stock THEN 1 ELSE 0 END;

-- Drop the old in_stock column
ALTER TABLE public.products 
DROP COLUMN in_stock;
