/*
  # Sync Auth Users to Database

  1. Database Function
    - Create function to sync auth.users to public.users
    - Handle user creation and updates
    
  2. Database Trigger
    - Trigger on auth.users insert/update
    - Automatically sync to public.users table
    
  3. Manual Sync
    - Sync existing auth users to public.users
    - Handle any missing users
*/

-- Create function to sync auth users to public users table
CREATE OR REPLACE FUNCTION public.handle_auth_user_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT (new user registration)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.users (
      id,
      email,
      first_name,
      surname,
      phone,
      created_at,
      updated_at,
      last_sign_in_at,
      email_confirmed_at,
      is_active
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'surname', ''),
      COALESCE(NEW.phone, ''),
      NEW.created_at,
      NEW.updated_at,
      NEW.last_sign_in_at,
      NEW.email_confirmed_at,
      true
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      surname = EXCLUDED.surname,
      phone = EXCLUDED.phone,
      updated_at = EXCLUDED.updated_at,
      last_sign_in_at = EXCLUDED.last_sign_in_at,
      email_confirmed_at = EXCLUDED.email_confirmed_at;
    
    RETURN NEW;
  END IF;

  -- Handle UPDATE (user profile updates, sign-ins, etc.)
  IF TG_OP = 'UPDATE' THEN
    UPDATE public.users SET
      email = NEW.email,
      first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', first_name),
      surname = COALESCE(NEW.raw_user_meta_data->>'surname', surname),
      phone = COALESCE(NEW.phone, phone),
      updated_at = NEW.updated_at,
      last_sign_in_at = NEW.last_sign_in_at,
      email_confirmed_at = NEW.email_confirmed_at
    WHERE id = NEW.id;
    
    RETURN NEW;
  END IF;

  -- Handle DELETE (user deletion)
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.users WHERE id = OLD.id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OR DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_sync();

-- Sync existing auth users to public users table
INSERT INTO public.users (
  id,
  email,
  first_name,
  surname,
  phone,
  created_at,
  updated_at,
  last_sign_in_at,
  email_confirmed_at,
  is_active
)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', ''),
  COALESCE(au.raw_user_meta_data->>'surname', ''),
  COALESCE(au.phone, ''),
  au.created_at,
  au.updated_at,
  au.last_sign_in_at,
  au.email_confirmed_at,
  true
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  surname = EXCLUDED.surname,
  phone = EXCLUDED.phone,
  updated_at = EXCLUDED.updated_at,
  last_sign_in_at = EXCLUDED.last_sign_in_at,
  email_confirmed_at = EXCLUDED.email_confirmed_at;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, service_role;
GRANT SELECT ON public.users TO anon, authenticated;