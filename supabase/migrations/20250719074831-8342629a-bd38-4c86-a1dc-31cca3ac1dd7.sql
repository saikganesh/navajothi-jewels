
-- Add category_id column back to collections table
ALTER TABLE public.collections 
ADD COLUMN category_id uuid REFERENCES public.categories(id);

-- Update the existing collections to have a default category if needed
-- (This is optional - you can manually set categories later through the admin interface)
