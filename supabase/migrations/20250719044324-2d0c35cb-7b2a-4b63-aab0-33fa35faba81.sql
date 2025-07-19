
-- Add category_id column back to collections table
ALTER TABLE public.collections 
ADD COLUMN category_id uuid REFERENCES public.categories(id);

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_collections_category_id ON public.collections(category_id);
