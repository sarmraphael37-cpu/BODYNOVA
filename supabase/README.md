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

## Email (Brevo SMTP)

BodyNova sends emails through **Brevo SMTP**:

- **Welcome email** — sent by the Next.js app from `lib/email.ts` right after a
  user signs up. Credentials live in `.env.local` under the `Brevo SMTP`
  section (`BREVO_SMTP_*`). Grab them at
  https://app.brevo.com/settings/keys/smtp.
- **Verification & password-reset emails** — sent by Supabase Auth's own
  servers, so they must be configured in the **Supabase Dashboard**, not in the
  app. Use the same Brevo credentials:

  1. Dashboard → your project → **Authentication → Providers** (or
     **Authentication → Emails** depending on dashboard version).
  2. Under **SMTP Settings**, enable custom SMTP and enter:

     ```text
     SMTP Host:     smtp-relay.brevo.com
     SMTP Port:     587
     SMTP Username: <your Brevo SMTP login>        (BREVO_SMTP_USER)
     SMTP Password: <your Brevo SMTP master key>   (BREVO_SMTP_KEY)
     Sender email:  <verified sender address>      (BREVO_SMTP_FROM)
     Sender name:   BodyNova
     ```

  3. Set **Confirm email** (Email confirmations) to *On* if you want users to
     verify their address before signing in.
  4. Save, then run a test signup from the app — the confirmation email will
     arrive from your Brevo sender.

> The `BREVO_SMTP_FROM` address must be a sender **verified in Brevo**
> (Settings → Senders & IPs). Brevo's free plan allows sending to any inbox,
> including Gmail.
