-- Create custom admin user
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
  user_email text := 'anassessalmany@gmail.com';
  user_password text := 'Anass2005';
BEGIN
  -- Check if user already exists to avoid duplicates if migration is re-run
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      user_email,
      crypt(user_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Anass"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- Insert identity record
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', user_email, 'email_verified', true),
      'email',
      new_user_id::text,
      now(),
      now(),
      now()
    );

    -- Grant admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'admin');

    -- Ensure profile exists
    INSERT INTO public.profiles (id, display_name)
    VALUES (new_user_id, 'Anass')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
