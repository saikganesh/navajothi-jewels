-- Remove SKU from products table
ALTER TABLE public.products DROP COLUMN IF EXISTS sku;
DROP INDEX IF EXISTS idx_products_sku;

-- Add SKU to all karat tables with UNIQUE constraint
ALTER TABLE public.karat_22kt ADD COLUMN IF NOT EXISTS sku text UNIQUE;
ALTER TABLE public.karat_18kt ADD COLUMN IF NOT EXISTS sku text UNIQUE;
ALTER TABLE public.karat_14kt ADD COLUMN IF NOT EXISTS sku text UNIQUE;
ALTER TABLE public.karat_9kt ADD COLUMN IF NOT EXISTS sku text UNIQUE;

-- Create indexes for faster SKU lookups
CREATE INDEX IF NOT EXISTS idx_karat_22kt_sku ON public.karat_22kt(sku);
CREATE INDEX IF NOT EXISTS idx_karat_18kt_sku ON public.karat_18kt(sku);
CREATE INDEX IF NOT EXISTS idx_karat_14kt_sku ON public.karat_14kt(sku);
CREATE INDEX IF NOT EXISTS idx_karat_9kt_sku ON public.karat_9kt(sku);