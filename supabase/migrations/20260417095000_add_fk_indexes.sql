-- Add missing indexes for foreign key columns
-- Per schema-foreign-key-indexes best practice

-- Index for products.category_id FK (JOINs and category lookups)
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products (category_id);

-- Index for recipes.category_id FK (JOINs and category lookups)
CREATE INDEX IF NOT EXISTS idx_recipes_category_id ON public.recipes (category_id);

-- Index for user_roles.user_id FK (RLS policies and role lookups)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id);
