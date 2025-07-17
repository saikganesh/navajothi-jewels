
-- Remove stock_quantity column from products table with CASCADE
ALTER TABLE public.products 
DROP COLUMN stock_quantity CASCADE;
