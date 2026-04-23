-- Site Settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Site settings viewable by everyone" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Site Settings: Admins can manage" ON public.site_settings
  FOR ALL USING (private.has_role((SELECT auth.uid()), 'admin'))
  WITH CHECK (private.has_role((SELECT auth.uid()), 'admin'));

-- Create a bucket for catalogues
INSERT INTO storage.buckets (id, name, public) 
VALUES ('catalogues', 'catalogues', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow anyone to view catalogues
CREATE POLICY "Catalogues: Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'catalogues');

-- Policy to allow admins to upload catalogues
CREATE POLICY "Catalogues: Admin Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'catalogues' AND 
    private.has_role((SELECT auth.uid()), 'admin')
  );

-- Policy to allow admins to update catalogues
CREATE POLICY "Catalogues: Admin Update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'catalogues' AND 
    private.has_role((SELECT auth.uid()), 'admin')
  );

-- Policy to allow admins to delete catalogues
CREATE POLICY "Catalogues: Admin Delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'catalogues' AND 
    private.has_role((SELECT auth.uid()), 'admin')
  );

-- Insert default catalogue entry if it doesn't exist
INSERT INTO public.site_settings (key, value)
VALUES ('catalogue_url', NULL)
ON CONFLICT (key) DO NOTHING;
