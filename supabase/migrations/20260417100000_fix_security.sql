-- Fix security issues: move security definer functions to private schema

-- Create private schema for privileged functions
CREATE SCHEMA IF NOT EXISTS private;

-- Create private functions FIRST (before triggers/policies reference them)
CREATE FUNCTION private.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE FUNCTION private.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE FUNCTION private.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Drop old public functions (no CASCADE - we'll recreate policies after)
DROP FUNCTION IF EXISTS public.has_role(UUID, public.app_role);
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Drop admin policies that referenced old public.has_role
DROP POLICY IF EXISTS "Admin: Full access" ON public.user_roles;
DROP POLICY IF EXISTS "Admin: Manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin: Manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admin: Manage products" ON public.products;
DROP POLICY IF EXISTS "Admin: Manage recipes" ON public.recipes;
DROP POLICY IF EXISTS "Admin: Manage contacts" ON public.contact_submissions;

-- Recreate policies using private.has_role with (select auth.uid()) pattern
CREATE POLICY "Admin: Full access" ON public.user_roles
  FOR ALL USING (private.has_role((SELECT auth.uid()), 'admin'))
  WITH CHECK (private.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY "Admin: Manage profiles" ON public.profiles
  FOR ALL USING (private.has_role((SELECT auth.uid()), 'admin'))
  WITH CHECK (private.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY "Admin: Manage categories" ON public.categories
  FOR ALL USING (private.has_role((SELECT auth.uid()), 'admin'))
  WITH CHECK (private.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY "Admin: Manage products" ON public.products
  FOR ALL USING (private.has_role((SELECT auth.uid()), 'admin'))
  WITH CHECK (private.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY "Admin: Manage recipes" ON public.recipes
  FOR ALL USING (private.has_role((SELECT auth.uid()), 'admin'))
  WITH CHECK (private.has_role((SELECT auth.uid()), 'admin'));

-- Handle contact_submissions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_submissions') THEN
    EXECUTE 'CREATE POLICY "Admin: Manage contacts" ON public.contact_submissions
      FOR ALL USING (private.has_role((SELECT auth.uid()), ''admin''))
      WITH CHECK (private.has_role((SELECT auth.uid()), ''admin''))';
  END IF;
END $$;

-- Add DELETE policy on profiles
CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Update triggers to use private functions
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipes_updated_at ON public.recipes;
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();

-- Recreate storage policies
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

CREATE POLICY "Admin Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' AND 
    private.has_role((SELECT auth.uid()), 'admin')
  );

CREATE POLICY "Admin Update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images' AND 
    private.has_role((SELECT auth.uid()), 'admin')
  );

CREATE POLICY "Admin Delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images' AND 
    private.has_role((SELECT auth.uid()), 'admin')
  );