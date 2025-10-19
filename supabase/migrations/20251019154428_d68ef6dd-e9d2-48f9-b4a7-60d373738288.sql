-- Add 14kt and 9kt price columns to gold_price_log table
ALTER TABLE public.gold_price_log 
ADD COLUMN kt14_price numeric NOT NULL DEFAULT 0,
ADD COLUMN kt9_price numeric NOT NULL DEFAULT 0;