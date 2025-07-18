
-- Update foreign key constraints to reference product_variations table instead of products table
ALTER TABLE public.karat_22kt 
DROP CONSTRAINT IF EXISTS karat_22kt_product_id_fkey,
ADD CONSTRAINT karat_22kt_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.product_variations(id) ON DELETE CASCADE;

ALTER TABLE public.karat_18kt 
DROP CONSTRAINT IF EXISTS karat_18kt_product_id_fkey,
ADD CONSTRAINT karat_18kt_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.product_variations(id) ON DELETE CASCADE;
