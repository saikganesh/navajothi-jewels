-- Create gold_price_log table
CREATE TABLE public.gold_price_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kt22_price NUMERIC NOT NULL,
  kt18_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gold_price_log ENABLE ROW LEVEL SECURITY;

-- Create policies for admins to manage gold price log
CREATE POLICY "Admins can manage gold price log" 
ON public.gold_price_log 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Anyone can view gold price log (for public price display)
CREATE POLICY "Anyone can view gold price log" 
ON public.gold_price_log 
FOR SELECT 
USING (true);