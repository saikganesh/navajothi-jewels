-- Fix: Add search_path protection to security definer functions
-- This prevents search_path manipulation attacks

-- Update is_user_enabled function to include SET search_path
CREATE OR REPLACE FUNCTION public.is_user_enabled(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT NOT COALESCE(is_disabled, false) 
  FROM public.profiles 
  WHERE id = user_id;
$function$;

-- Update update_last_login function to include SET search_path
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles 
  SET last_login_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$function$;