
-- Set up cron job to fetch gold prices every hour
SELECT cron.schedule(
  'fetch-gold-prices-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://nauojezdlsfagudtqpcg.supabase.co/functions/v1/fetch-gold-prices',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hdW9qZXpkbHNmYWd1ZHRxcGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNjg2NTksImV4cCI6MjA2NDk0NDY1OX0.EPMzRKK1ql34reXvoAZF49QU4FxcJOCWqnxDC83kyFA"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
