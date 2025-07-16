
-- Update the products table to support multiple carat types with separate weights
ALTER TABLE public.products 
ADD COLUMN carat_22kt_gross_weight numeric,
ADD COLUMN carat_22kt_stone_weight numeric,
ADD COLUMN carat_22kt_net_weight numeric,
ADD COLUMN carat_18kt_gross_weight numeric,
ADD COLUMN carat_18kt_stone_weight numeric,
ADD COLUMN carat_18kt_net_weight numeric,
ADD COLUMN available_carats jsonb DEFAULT '["22ct"]'::jsonb;

-- Update the product_variations table to support multiple carat types with separate weights
ALTER TABLE public.product_variations 
ADD COLUMN carat_22kt_gross_weight numeric,
ADD COLUMN carat_22kt_stone_weight numeric,
ADD COLUMN carat_22kt_net_weight numeric,
ADD COLUMN carat_18kt_gross_weight numeric,
ADD COLUMN carat_18kt_stone_weight numeric,
ADD COLUMN carat_18kt_net_weight numeric,
ADD COLUMN available_carats jsonb DEFAULT '["22ct"]'::jsonb;

-- Migrate existing data to the new structure
UPDATE public.products 
SET 
  carat_22kt_gross_weight = gross_weight,
  carat_22kt_stone_weight = stone_weight,
  carat_22kt_net_weight = net_weight,
  available_carats = CASE 
    WHEN carat = '22ct' THEN '["22ct"]'::jsonb
    WHEN carat = '18ct' THEN '["18ct"]'::jsonb
    ELSE '["22ct"]'::jsonb
  END
WHERE gross_weight IS NOT NULL OR stone_weight IS NOT NULL OR net_weight IS NOT NULL;

UPDATE public.product_variations 
SET 
  carat_22kt_gross_weight = gross_weight,
  carat_22kt_stone_weight = stone_weight,
  carat_22kt_net_weight = net_weight,
  available_carats = CASE 
    WHEN carat = '22ct' THEN '["22ct"]'::jsonb
    WHEN carat = '18ct' THEN '["18ct"]'::jsonb
    ELSE '["22ct"]'::jsonb
  END
WHERE gross_weight IS NOT NULL OR stone_weight IS NOT NULL OR net_weight IS NOT NULL;
