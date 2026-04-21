-- Move toggle_admin_role to public schema and ensure correct type casting
-- Some environments have trouble calling functions in private schemas via RPC 
-- if permissions aren't perfectly aligned, and explicitly casting to public.app_role 
-- ensures the enum matches correctly.

DROP FUNCTION IF EXISTS private.toggle_admin_role(UUID);

CREATE OR REPLACE FUNCTION public.toggle_admin_role(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if the caller is an admin
    IF NOT private.has_role(auth.uid(), 'admin'::public.app_role) THEN
        RAISE EXCEPTION 'Only admins can toggle roles';
    END IF;

    -- Toggle the role
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = target_user_id AND role = 'admin'::public.app_role) THEN
        DELETE FROM public.user_roles WHERE user_id = target_user_id AND role = 'admin'::public.app_role;
    ELSE
        INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'admin'::public.app_role);
    END IF;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.toggle_admin_role(UUID) TO authenticated;
