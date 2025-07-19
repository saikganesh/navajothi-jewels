
-- Create wishlist table to store user's wishlisted products
CREATE TABLE public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  karat_selected TEXT NOT NULL CHECK (karat_selected IN ('22kt', '18kt')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id, karat_selected)
);

-- Enable Row Level Security
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own wishlist items
CREATE POLICY "Users can view their own wishlist items" 
  ON public.wishlist 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to add items to their own wishlist
CREATE POLICY "Users can add items to their own wishlist" 
  ON public.wishlist 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to remove items from their own wishlist
CREATE POLICY "Users can remove items from their own wishlist" 
  ON public.wishlist 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add index for better performance
CREATE INDEX idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX idx_wishlist_product_id ON public.wishlist(product_id);
