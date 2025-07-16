
-- First, let's rename the enum type from carat_type to karat_type
ALTER TYPE carat_type RENAME TO karat_type;

-- Update the products table to rename carat column to karat
ALTER TABLE products RENAME COLUMN carat TO karat;

-- Update the product_variations table to rename carat column to karat  
ALTER TABLE product_variations RENAME COLUMN carat TO karat;

-- Update all the carat_* columns to karat_* in products table
ALTER TABLE products RENAME COLUMN carat_22kt_gross_weight TO karat_22kt_gross_weight;
ALTER TABLE products RENAME COLUMN carat_22kt_stone_weight TO karat_22kt_stone_weight;
ALTER TABLE products RENAME COLUMN carat_22kt_net_weight TO karat_22kt_net_weight;
ALTER TABLE products RENAME COLUMN carat_18kt_gross_weight TO karat_18kt_gross_weight;
ALTER TABLE products RENAME COLUMN carat_18kt_stone_weight TO karat_18kt_stone_weight;
ALTER TABLE products RENAME COLUMN carat_18kt_net_weight TO karat_18kt_net_weight;
ALTER TABLE products RENAME COLUMN available_carats TO available_karats;

-- Update all the carat_* columns to karat_* in product_variations table
ALTER TABLE product_variations RENAME COLUMN carat_22kt_gross_weight TO karat_22kt_gross_weight;
ALTER TABLE product_variations RENAME COLUMN carat_22kt_stone_weight TO karat_22kt_stone_weight;
ALTER TABLE product_variations RENAME COLUMN carat_22kt_net_weight TO karat_22kt_net_weight;
ALTER TABLE product_variations RENAME COLUMN carat_18kt_gross_weight TO karat_18kt_gross_weight;
ALTER TABLE product_variations RENAME COLUMN carat_18kt_stone_weight TO karat_18kt_stone_weight;
ALTER TABLE product_variations RENAME COLUMN carat_18kt_net_weight TO karat_18kt_net_weight;
ALTER TABLE product_variations RENAME COLUMN available_carats TO available_karats;
