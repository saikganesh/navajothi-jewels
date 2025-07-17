
-- Remove redundant karat-related columns from products table
ALTER TABLE public.products 
DROP COLUMN IF EXISTS karat,
DROP COLUMN IF EXISTS gross_weight,
DROP COLUMN IF EXISTS stone_weight,
DROP COLUMN IF EXISTS net_weight,
DROP COLUMN IF EXISTS karat_22kt_gross_weight,
DROP COLUMN IF EXISTS karat_22kt_stone_weight,
DROP COLUMN IF EXISTS karat_22kt_net_weight,
DROP COLUMN IF EXISTS karat_18kt_gross_weight,
DROP COLUMN IF EXISTS karat_18kt_stone_weight,
DROP COLUMN IF EXISTS karat_18kt_net_weight,
DROP COLUMN IF EXISTS karat_22kt_stock_quantity,
DROP COLUMN IF EXISTS karat_18kt_stock_quantity;

-- Remove redundant karat-related columns from product_variations table
ALTER TABLE public.product_variations 
DROP COLUMN IF EXISTS karat,
DROP COLUMN IF EXISTS gross_weight,
DROP COLUMN IF EXISTS stone_weight,
DROP COLUMN IF EXISTS net_weight,
DROP COLUMN IF EXISTS karat_22kt_gross_weight,
DROP COLUMN IF EXISTS karat_22kt_stone_weight,
DROP COLUMN IF EXISTS karat_22kt_net_weight,
DROP COLUMN IF EXISTS karat_18kt_gross_weight,
DROP COLUMN IF EXISTS karat_18kt_stone_weight,
DROP COLUMN IF EXISTS karat_18kt_net_weight,
DROP COLUMN IF EXISTS karat_22kt_stock_quantity,
DROP COLUMN IF EXISTS karat_18kt_stock_quantity;
