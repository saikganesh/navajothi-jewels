-- Create karat_14kt table to store 14kt gold product data
CREATE TABLE public.karat_14kt (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL,
  gross_weight numeric,
  stone_weight numeric,
  net_weight numeric,
  stock_quantity integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create karat_9kt table to store 9kt gold product data
CREATE TABLE public.karat_9kt (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL,
  gross_weight numeric,
  stone_weight numeric,
  net_weight numeric,
  stock_quantity integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.karat_14kt ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karat_9kt ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for karat_14kt
CREATE POLICY "Anyone can view 14kt records"
ON public.karat_14kt
FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage 14kt records"
ON public.karat_14kt
FOR ALL
USING (is_admin(auth.uid()));

-- Create RLS policies for karat_9kt
CREATE POLICY "Anyone can view 9kt records"
ON public.karat_9kt
FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage 9kt records"
ON public.karat_9kt
FOR ALL
USING (is_admin(auth.uid()));