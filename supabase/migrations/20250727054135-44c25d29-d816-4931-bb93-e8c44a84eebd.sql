-- Add company information to globals table for invoice
INSERT INTO public.globals (variable_name, variable_value) VALUES 
('company_name', 'Sujana Jewels'),
('company_address', 'No. 123, Main Street, Jewelry District, Chennai - 600001, Tamil Nadu, India'),
('company_gst', '33AGHPG0789K1Z8'),
('company_phone', '+91 9876543210'),
('company_email', 'info@sujanajewels.com')
ON CONFLICT (variable_name) DO UPDATE SET 
  variable_value = EXCLUDED.variable_value,
  updated_at = now();