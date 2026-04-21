-- Fix permission denied on admin_users view
-- The previous view used security_invoker = true, which failed because 
-- authenticated users do not have direct SELECT access to auth.users.

DROP VIEW IF EXISTS public.admin_users;

CREATE VIEW public.admin_users AS
SELECT 
    p.id,
    p.display_name,
    p.avatar_url,
    u.email,
    u.created_at as joined_at,
    EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = p.id AND ur.role = 'admin'
    ) as is_admin
FROM 
    public.profiles p
JOIN 
    auth.users u ON p.id = u.id
WHERE 
    -- Only allow admins to see any rows in this view
    -- This is the "manual RLS" for the view since it runs as owner (postgres)
    private.has_role(auth.uid(), 'admin');

-- Re-grant access
REVOKE ALL ON public.admin_users FROM public, anon, authenticated;
GRANT SELECT ON public.admin_users TO authenticated;

-- Ensure usage on private schema is granted (already done in hardening, but making sure)
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA private TO authenticated;
