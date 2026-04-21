-- Create a bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow anyone to view images
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Policy to allow admins to upload images
CREATE POLICY "Admin Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' AND 
    public.has_role(auth.uid(), 'admin')
  );

-- Policy to allow admins to update images
CREATE POLICY "Admin Update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images' AND 
    public.has_role(auth.uid(), 'admin')
  );

-- Policy to allow admins to delete images
CREATE POLICY "Admin Delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images' AND 
    public.has_role(auth.uid(), 'admin')
  );
