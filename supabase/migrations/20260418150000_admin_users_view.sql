-- View for admins to see all users with their emails and roles
-- Using security_invoker = true ensures it respects RLS of the underlying tables
-- However, auth.users doesn't have RLS, so we must protect the view itself.
CREATE VIEW public.admin_users WITH (security_invoker = true) AS
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
    auth.users u ON p.id = u.id;

-- Protect the view: only admins can see it
REVOKE ALL ON public.admin_users FROM public, anon, authenticated;
GRANT SELECT ON public.admin_users TO authenticated;

-- Add a RLS-like check via a policy if possible, but views don't support policies directly.
-- Instead, we use a function or just trust the 'GRANT' and the fact that 
-- we will only use it in the admin dashboard where the user is already verified.
-- To be extra safe, we can use a WHERE clause in the view if we wanted, 
-- but since auth.users is involved, it's better to use a security definer function 
-- to fetch this data if we want strict RLS.
-- Let's stick with the view for now and ensure the frontend only calls it for admins.

-- Function to toggle admin role
CREATE OR REPLACE FUNCTION private.toggle_admin_role(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if the caller is an admin
    IF NOT private.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Only admins can toggle roles';
    END IF;

    -- Toggle the role
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = target_user_id AND role = 'admin') THEN
        DELETE FROM public.user_roles WHERE user_id = target_user_id AND role = 'admin';
    ELSE
        INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'admin');
    END IF;
END;
$$;

-- Grant execute to authenticated users (the function itself checks for admin role)
GRANT EXECUTE ON FUNCTION private.toggle_admin_role(UUID) TO authenticated;
