-- Remove gold price log table
DROP TABLE IF EXISTS public.gold_price_log;

-- Remove any cron jobs related to gold price fetching
SELECT cron.unschedule('fetch-gold-prices-hourly');