
-- Create product_variations table
CREATE TABLE public.product_variations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variation_name text NOT NULL,
  description text,
  gross_weight numeric,
  stone_weight numeric,
  net_weight numeric,
  carat carat_type,
  images jsonb DEFAULT '[]'::jsonb,
  in_stock boolean NOT NULL DEFAULT true,
  price numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies for product_variations
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;

-- Anyone can view product variations
CREATE POLICY "Anyone can view product variations" 
  ON public.product_variations 
  FOR SELECT 
  USING (true);

-- Only admins can manage product variations
CREATE POLICY "Only admins can manage product variations" 
  ON public.product_variations 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Create index for better performance
CREATE INDEX idx_product_variations_parent_id ON public.product_variations(parent_product_id);
