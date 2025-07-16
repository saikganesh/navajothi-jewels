
-- Remove the price column from the products table
ALTER TABLE public.products DROP COLUMN IF EXISTS price;

-- Remove the price column from the product_variations table  
ALTER TABLE public.product_variations DROP COLUMN IF EXISTS price;
