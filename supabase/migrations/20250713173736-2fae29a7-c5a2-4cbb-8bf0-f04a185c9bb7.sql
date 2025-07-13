-- Add payment tracking columns to orders table
ALTER TABLE public.orders 
ADD COLUMN razorpay_order_id TEXT,
ADD COLUMN razorpay_payment_id TEXT,
ADD COLUMN payment_status TEXT DEFAULT 'pending',
ADD COLUMN payment_method TEXT,
ADD COLUMN shipping_address JSONB;