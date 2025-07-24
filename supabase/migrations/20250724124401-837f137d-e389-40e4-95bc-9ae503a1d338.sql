-- Remove gold price log table only (cron job might not exist)
DROP TABLE IF EXISTS public.gold_price_log;