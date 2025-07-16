
-- Add new fields to products table
ALTER TABLE public.products 
ADD COLUMN making_charge_percentage integer NOT NULL DEFAULT 0,
ADD COLUMN discount_percentage integer DEFAULT NULL,
ADD COLUMN apply_same_mc boolean NOT NULL DEFAULT false,
ADD COLUMN apply_same_discount boolean NOT NULL DEFAULT false,
ADD COLUMN product_type text NOT NULL DEFAULT 'pieces' CHECK (product_type IN ('pieces', 'pairs'));

-- Add new fields to product_variations table
ALTER TABLE public.product_variations 
ADD COLUMN making_charge_percentage integer NOT NULL DEFAULT 0,
ADD COLUMN discount_percentage integer DEFAULT NULL,
ADD COLUMN product_type text NOT NULL DEFAULT 'pieces' CHECK (product_type IN ('pieces', 'pairs'));
