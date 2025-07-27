-- Update the categories table policy to allow anonymous users to view categories
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;

CREATE POLICY "Anyone can view categories" 
ON categories 
FOR SELECT 
USING (true);