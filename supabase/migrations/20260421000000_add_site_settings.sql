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

CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create a bucket for catalogues
INSERT INTO storage.buckets (id, name, public) 
VALUES ('catalogues', 'catalogues', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow anyone to view catalogues
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'catalogues');

-- Policy to allow admins to upload catalogues
CREATE POLICY "Admin Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'catalogues' AND 
    public.has_role(auth.uid(), 'admin')
  );

-- Policy to allow admins to update catalogues
CREATE POLICY "Admin Update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'catalogues' AND 
    public.has_role(auth.uid(), 'admin')
  );

-- Policy to allow admins to delete catalogues
CREATE POLICY "Admin Delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'catalogues' AND 
    public.has_role(auth.uid(), 'admin')
  );

-- Insert default catalogue entry if it doesn't exist
INSERT INTO public.site_settings (key, value)
VALUES ('catalogue_url', NULL)
ON CONFLICT (key) DO NOTHING;
