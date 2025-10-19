-- Fix is_user_enabled function to include search_path
CREATE OR REPLACE FUNCTION public.is_user_enabled(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT NOT COALESCE(is_disabled, false) 
  FROM public.profiles 
  WHERE id = user_id;
$function$;

-- Fix update_last_login function to include search_path
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.profiles 
  SET last_login_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$function$;