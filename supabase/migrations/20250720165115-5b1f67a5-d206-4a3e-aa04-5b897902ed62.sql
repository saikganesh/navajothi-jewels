
-- Add email column to user_addresses table
ALTER TABLE public.user_addresses 
ADD COLUMN email TEXT NOT NULL DEFAULT '';

-- Update the column to remove the default after adding it
ALTER TABLE public.user_addresses 
ALTER COLUMN email DROP DEFAULT;
