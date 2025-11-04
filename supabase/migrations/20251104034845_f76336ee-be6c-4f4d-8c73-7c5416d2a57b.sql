-- Remove company_name and business_card_url columns from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS company_name;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS business_card_url;

-- Update the handle_new_user function to remove company_name and business_card_url
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$;