-- Fix policies for catalogues bucket and site_settings table

-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('catalogues', 'catalogues', true)
ON CONFLICT (id) DO NOTHING;

-- Drop any potentially colliding or broken policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;

-- Recreate image policies (to ensure they are correct and use private.has_role)
-- Note: These were already in 20260417100000_fix_security.sql but we ensure they exist with correct bucket_id
CREATE POLICY "Images: Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Images: Admin Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' AND 
    private.has_role((SELECT auth.uid()), 'admin')
  );

CREATE POLICY "Images: Admin Update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images' AND 
    private.has_role((SELECT auth.uid()), 'admin')
  );

CREATE POLICY "Images: Admin Delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images' AND 
    private.has_role((SELECT auth.uid()), 'admin')
  );

-- Create unique policies for catalogues bucket
CREATE POLICY "Catalogues: Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'catalogues');

CREATE POLICY "Catalogues: Admin Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'catalogues' AND 
    private.has_role((SELECT auth.uid()), 'admin')
  );

CREATE POLICY "Catalogues: Admin Update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'catalogues' AND 
    private.has_role((SELECT auth.uid()), 'admin')
  );

CREATE POLICY "Catalogues: Admin Delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'catalogues' AND 
    private.has_role((SELECT auth.uid()), 'admin')
  );

-- Fix site_settings policies
CREATE POLICY "Site Settings: Admins can manage" ON public.site_settings
  FOR ALL USING (private.has_role((SELECT auth.uid()), 'admin'))
  WITH CHECK (private.has_role((SELECT auth.uid()), 'admin'));
