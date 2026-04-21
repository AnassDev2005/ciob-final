-- Migration to add relation between recipes and products
-- We use SET NULL on delete to maintain recipes if a product is removed

-- Update invalid product_refs to NULL before adding constraint
UPDATE public.recipes
SET product_ref = NULL
WHERE product_ref NOT IN (SELECT ref FROM public.products);

ALTER TABLE public.recipes
ADD CONSTRAINT recipes_product_ref_fkey
FOREIGN KEY (product_ref)
REFERENCES public.products(ref)
ON DELETE SET NULL
ON UPDATE CASCADE;
