
-- Remove the constraint that doesn't consider karat selection
ALTER TABLE public.cart_items 
DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;
