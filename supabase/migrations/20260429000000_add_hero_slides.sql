CREATE TABLE public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  image_url TEXT NOT NULL,
  icon_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  order_index INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public: View hero slides" ON public.hero_slides
  FOR SELECT USING (true);

CREATE POLICY "Admin: Manage hero slides" ON public.hero_slides
  FOR ALL USING (private.has_role((SELECT auth.uid()), 'admin'))
  WITH CHECK (private.has_role((SELECT auth.uid()), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_hero_slides_updated_at
  BEFORE UPDATE ON public.hero_slides
  FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column();
