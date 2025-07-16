-- Update weight columns to have 3 decimal places precision and rename product_type to quantity_type
ALTER TABLE products 
  ALTER COLUMN gross_weight TYPE NUMERIC(10,3),
  ALTER COLUMN stone_weight TYPE NUMERIC(10,3),
  ALTER COLUMN net_weight TYPE NUMERIC(10,3),
  ALTER COLUMN karat_22kt_gross_weight TYPE NUMERIC(10,3),
  ALTER COLUMN karat_22kt_stone_weight TYPE NUMERIC(10,3),
  ALTER COLUMN karat_22kt_net_weight TYPE NUMERIC(10,3),
  ALTER COLUMN karat_18kt_gross_weight TYPE NUMERIC(10,3),
  ALTER COLUMN karat_18kt_stone_weight TYPE NUMERIC(10,3),
  ALTER COLUMN karat_18kt_net_weight TYPE NUMERIC(10,3);

ALTER TABLE products RENAME COLUMN product_type TO quantity_type;

ALTER TABLE product_variations 
  ALTER COLUMN gross_weight TYPE NUMERIC(10,3),
  ALTER COLUMN stone_weight TYPE NUMERIC(10,3),
  ALTER COLUMN net_weight TYPE NUMERIC(10,3),
  ALTER COLUMN karat_22kt_gross_weight TYPE NUMERIC(10,3),
  ALTER COLUMN karat_22kt_stone_weight TYPE NUMERIC(10,3),
  ALTER COLUMN karat_22kt_net_weight TYPE NUMERIC(10,3),
  ALTER COLUMN karat_18kt_gross_weight TYPE NUMERIC(10,3),
  ALTER COLUMN karat_18kt_stone_weight TYPE NUMERIC(10,3),
  ALTER COLUMN karat_18kt_net_weight TYPE NUMERIC(10,3);

ALTER TABLE product_variations RENAME COLUMN product_type TO quantity_type;