# Supabase

Local-first setup for BodyNova. Migrations live in `supabase/migrations/`.

## Getting started

1. Install the CLI:

   ```powershell
   npm i -g supabase
   supabase --version
   ```

2. Start a local stack:

   ```powershell
   supabase start
   ```

   This boots Postgres, the Auth API, and Studio (http://localhost:54323).

3. Run migrations:

   ```powershell
   supabase db push
   ```

   Or, when local dev server is running:

   ```powershell
   supabase migration up
   ```

4. Capture the local connection strings from `supabase status` and put them in `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase status>
   ```

## Linking a remote project

```powershell
supabase login
supabase link --project-ref <ref>
supabase db push
```

## RLS model

- All user-owned tables are scoped by `user_id` and enable RLS.
- The `auth` schema is owned by Supabase; we never modify it except via the
  `handle_new_user()` trigger that provisions `profiles` + `user_preferences`.
- Admin-only tables (exercises, foods, achievements, audit_logs) rely on the
  `public.is_admin()` helper which checks `profiles.role = 'admin'`.

## Local reset

```powershell
supabase db reset
```

Drops everything and re-applies migrations + seeds.
