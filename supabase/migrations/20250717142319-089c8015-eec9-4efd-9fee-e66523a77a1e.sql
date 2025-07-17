
-- Force drop all karat-related columns from products table with CASCADE to handle dependencies
ALTER TABLE public.products 
DROP COLUMN IF EXISTS karat CASCADE,
DROP COLUMN IF EXISTS gross_weight CASCADE,
DROP COLUMN IF EXISTS stone_weight CASCADE,
DROP COLUMN IF EXISTS net_weight CASCADE,
DROP COLUMN IF EXISTS karat_22kt_gross_weight CASCADE,
DROP COLUMN IF EXISTS karat_22kt_stone_weight CASCADE,
DROP COLUMN IF EXISTS karat_22kt_net_weight CASCADE,
DROP COLUMN IF EXISTS karat_18kt_gross_weight CASCADE,
DROP COLUMN IF EXISTS karat_18kt_stone_weight CASCADE,
DROP COLUMN IF EXISTS karat_18kt_net_weight CASCADE,
DROP COLUMN IF EXISTS karat_22kt_stock_quantity CASCADE,
DROP COLUMN IF EXISTS karat_18kt_stock_quantity CASCADE;

-- Force drop all karat-related columns from product_variations table with CASCADE
ALTER TABLE public.product_variations 
DROP COLUMN IF EXISTS karat CASCADE,
DROP COLUMN IF EXISTS gross_weight CASCADE,
DROP COLUMN IF EXISTS stone_weight CASCADE,
DROP COLUMN IF EXISTS net_weight CASCADE,
DROP COLUMN IF EXISTS karat_22kt_gross_weight CASCADE,
DROP COLUMN IF EXISTS karat_22kt_stone_weight CASCADE,
DROP COLUMN IF EXISTS karat_22kt_net_weight CASCADE,
DROP COLUMN IF EXISTS karat_18kt_gross_weight CASCADE,
DROP COLUMN IF EXISTS karat_18kt_stone_weight CASCADE,
DROP COLUMN IF EXISTS karat_18kt_net_weight CASCADE,
DROP COLUMN IF EXISTS karat_22kt_stock_quantity CASCADE,
DROP COLUMN IF EXISTS karat_18kt_stock_quantity CASCADE;

-- Also ensure proper foreign key relationships exist
ALTER TABLE public.karat_22kt 
DROP CONSTRAINT IF EXISTS karat_22kt_product_id_fkey,
ADD CONSTRAINT karat_22kt_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.karat_18kt 
DROP CONSTRAINT IF EXISTS karat_18kt_product_id_fkey,
ADD CONSTRAINT karat_18kt_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
