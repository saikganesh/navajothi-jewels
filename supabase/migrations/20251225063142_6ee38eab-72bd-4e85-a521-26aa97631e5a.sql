-- Create a table to store karat visibility settings
CREATE TABLE public.karat_visibility (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  karat_type text NOT NULL UNIQUE,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.karat_visibility ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view karat visibility" 
ON public.karat_visibility 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage karat visibility" 
ON public.karat_visibility 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Insert default visibility settings for all karats
INSERT INTO public.karat_visibility (karat_type, is_visible) VALUES
  ('22kt', true),
  ('18kt', true),
  ('14kt', true),
  ('9kt', true);