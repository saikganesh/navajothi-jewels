
-- Create gold_price_log table
CREATE TABLE public.gold_price_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  karat_24 INTEGER NOT NULL,
  karat_22 INTEGER NOT NULL,
  karat_18 INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.gold_price_log ENABLE ROW LEVEL SECURITY;

-- Create policy that allows admins to view all gold price logs
CREATE POLICY "Admins can view gold price logs" 
  ON public.gold_price_log 
  FOR SELECT 
  USING (is_admin(auth.uid()));

-- Create policy that allows the system to insert gold price logs (for the cron job)
CREATE POLICY "System can insert gold price logs" 
  ON public.gold_price_log 
  FOR INSERT 
  WITH CHECK (true);

-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;
