-- 0013_bootstrap_admin.sql — create/ensure the default admin account.
--
-- Default login after this migration:
--   email: admin@gmail.com
--   password: Admin1234
--
-- This is intentionally idempotent so `supabase db push` can be retried.

create extension if not exists pgcrypto with schema extensions;

do $$
declare
  v_admin_email text := 'admin@gmail.com';
  v_admin_password text := 'Admin1234';
  v_user_id uuid;
  v_identity_id_type text;
begin
  select id
    into v_user_id
    from auth.users
   where email = v_admin_email
   limit 1;

  if v_user_id is null then
    v_user_id := gen_random_uuid();

    insert into auth.users (
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
      recovery_token,
      email_change_token_new,
      email_change
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_admin_email,
      extensions.crypt(v_admin_password, extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"],"role":"admin","status":"active"}'::jsonb,
      '{"full_name":"Default Admin"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  else
    update auth.users
       set encrypted_password = extensions.crypt(v_admin_password, extensions.gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
             || '{"provider":"email","providers":["email"],"role":"admin","status":"active"}'::jsonb,
           raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
             || '{"full_name":"Default Admin"}'::jsonb,
           updated_at = now()
     where id = v_user_id;
  end if;

  -- The profiles trigger blocks role/status updates unless this app setting is present.
  perform set_config('app.is_admin_via_app', 'true', true);

  insert into public.profiles (id, email, full_name, role, status, approved_at)
  select
    u.id,
    u.email,
    coalesce(nullif(u.raw_user_meta_data->>'full_name', ''), split_part(u.email, '@', 1)),
    'admin',
    'active',
    now()
  from auth.users u
  where u.id = v_user_id
  on conflict (id) do update
    set role = 'admin',
        status = 'active',
        approved_at = coalesce(public.profiles.approved_at, now()),
        updated_at = now();

  if exists (
    select 1
      from information_schema.columns
     where table_schema = 'auth'
       and table_name = 'identities'
       and column_name = 'provider_id'
  ) then
    select data_type
      into v_identity_id_type
      from information_schema.columns
     where table_schema = 'auth'
       and table_name = 'identities'
       and column_name = 'id';

    if v_identity_id_type = 'uuid' then
      execute $sql$
        insert into auth.identities (
          id,
          user_id,
          provider_id,
          identity_data,
          provider,
          last_sign_in_at,
          created_at,
          updated_at
        )
        values (
          gen_random_uuid(),
          $1,
          $2,
          jsonb_build_object('sub', $1::text, 'email', $2),
          'email',
          now(),
          now(),
          now()
        )
        on conflict (provider, provider_id) do update
          set identity_data = excluded.identity_data,
              updated_at = now()
      $sql$ using v_user_id, v_admin_email;
    else
      execute $sql$
        insert into auth.identities (
          id,
          user_id,
          provider_id,
          identity_data,
          provider,
          last_sign_in_at,
          created_at,
          updated_at
        )
        values (
          $1::text,
          $1,
          $2,
          jsonb_build_object('sub', $1::text, 'email', $2),
          'email',
          now(),
          now(),
          now()
        )
        on conflict (provider, provider_id) do update
          set identity_data = excluded.identity_data,
              updated_at = now()
      $sql$ using v_user_id, v_admin_email;
    end if;
  else
    execute $sql$
      insert into auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
      )
      values (
        $1,
        $1,
        jsonb_build_object('sub', $1::text, 'email', $2),
        'email',
        now(),
        now(),
        now()
      )
      on conflict (id) do update
        set identity_data = excluded.identity_data,
            updated_at = now()
    $sql$ using v_user_id, v_admin_email;
  end if;
end $$;
