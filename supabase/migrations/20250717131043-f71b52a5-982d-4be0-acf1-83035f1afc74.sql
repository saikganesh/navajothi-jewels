
-- Create 22 Karat table
CREATE TABLE public.karat_22kt (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  gross_weight NUMERIC,
  stone_weight NUMERIC,
  net_weight NUMERIC,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create 18 Karat table
CREATE TABLE public.karat_18kt (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  gross_weight NUMERIC,
  stone_weight NUMERIC,
  net_weight NUMERIC,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to both tables
ALTER TABLE public.karat_22kt ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karat_18kt ENABLE ROW LEVEL SECURITY;

-- Create policies for 22kt table
CREATE POLICY "Anyone can view 22kt records" 
  ON public.karat_22kt 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can manage 22kt records" 
  ON public.karat_22kt 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Create policies for 18kt table
CREATE POLICY "Anyone can view 18kt records" 
  ON public.karat_18kt 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can manage 18kt records" 
  ON public.karat_18kt 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_karat_22kt_product_id ON public.karat_22kt(product_id);
CREATE INDEX idx_karat_18kt_product_id ON public.karat_18kt(product_id);
