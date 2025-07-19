
-- Remove the foreign key constraint and category_id column from collections table
ALTER TABLE public.collections 
DROP COLUMN IF EXISTS category_id;

-- Drop the index if it exists
DROP INDEX IF EXISTS idx_collections_category_id;
