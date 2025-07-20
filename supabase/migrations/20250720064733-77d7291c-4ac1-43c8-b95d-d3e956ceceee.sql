
-- Add karat_selected column to cart_items table
ALTER TABLE public.cart_items 
ADD COLUMN karat_selected text NOT NULL DEFAULT '22kt';

-- Add a check constraint to ensure only valid karat values
ALTER TABLE public.cart_items 
ADD CONSTRAINT check_karat_selected 
CHECK (karat_selected IN ('22kt', '18kt'));

-- Create a unique constraint to prevent duplicate entries of same product with same karat for same user
ALTER TABLE public.cart_items 
ADD CONSTRAINT unique_user_product_karat 
UNIQUE (user_id, product_id, karat_selected);
