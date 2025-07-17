
-- Add separate stock quantity columns for different karat types
ALTER TABLE public.products 
ADD COLUMN karat_22kt_stock_quantity integer DEFAULT 0,
ADD COLUMN karat_18kt_stock_quantity integer DEFAULT 0;

-- Also add the same columns to product_variations table for consistency
ALTER TABLE public.product_variations 
ADD COLUMN karat_22kt_stock_quantity integer DEFAULT 0,
ADD COLUMN karat_18kt_stock_quantity integer DEFAULT 0;

-- Update existing products to distribute current stock_quantity to 22kt by default
UPDATE public.products 
SET karat_22kt_stock_quantity = stock_quantity
WHERE stock_quantity > 0;
