
-- Update the carat_type enum to use KT instead of CT
ALTER TYPE carat_type RENAME TO carat_type_old;

CREATE TYPE carat_type AS ENUM ('22kt', '18kt');

-- Update products table
ALTER TABLE products 
ALTER COLUMN carat TYPE carat_type USING 
  CASE 
    WHEN carat::text = '22ct' THEN '22kt'::carat_type
    WHEN carat::text = '18ct' THEN '18kt'::carat_type
    ELSE '22kt'::carat_type
  END;

-- Update product_variations table  
ALTER TABLE product_variations 
ALTER COLUMN carat TYPE carat_type USING 
  CASE 
    WHEN carat::text = '22ct' THEN '22kt'::carat_type
    WHEN carat::text = '18ct' THEN '18kt'::carat_type
    ELSE '22kt'::carat_type
  END;

-- Update available_carats JSON fields in products
UPDATE products 
SET available_carats = 
  CASE 
    WHEN available_carats::text LIKE '%22ct%' AND available_carats::text LIKE '%18ct%' 
    THEN '["22kt", "18kt"]'::jsonb
    WHEN available_carats::text LIKE '%22ct%' 
    THEN '["22kt"]'::jsonb
    WHEN available_carats::text LIKE '%18ct%' 
    THEN '["18kt"]'::jsonb
    ELSE '["22kt"]'::jsonb
  END;

-- Update available_carats JSON fields in product_variations
UPDATE product_variations 
SET available_carats = 
  CASE 
    WHEN available_carats::text LIKE '%22ct%' AND available_carats::text LIKE '%18ct%' 
    THEN '["22kt", "18kt"]'::jsonb
    WHEN available_carats::text LIKE '%22ct%' 
    THEN '["22kt"]'::jsonb
    WHEN available_carats::text LIKE '%18ct%' 
    THEN '["18kt"]'::jsonb
    ELSE '["22kt"]'::jsonb
  END;

-- Drop the old enum type
DROP TYPE carat_type_old;

-- Update the default values
ALTER TABLE products ALTER COLUMN available_carats SET DEFAULT '["22kt"]'::jsonb;
ALTER TABLE product_variations ALTER COLUMN available_carats SET DEFAULT '["22kt"]'::jsonb;
