

## Plan: Fix Email Confirmation Flow and Delete Non-Admin Users

### Problem
When a user clicks the email confirmation link, Supabase automatically creates a session (logs them in). The current code detects `type=signup` in the URL hash and shows the "email verified" screen, but the user ends up logged in. The user wants: confirmation link → "email verified" screen only (no login) → user manually goes to login → enters credentials → gets OTP → enters dashboard.

### Changes

**1. Sign out on email confirmation redirect** (`src/pages/Auth.tsx`)
- In the `useEffect` that detects `type=signup` hash (lines 98-106), add `supabase.auth.signOut()` call to immediately destroy the session created by the confirmation link
- This ensures the user sees the "email verified" screen but is NOT logged in

**2. Delete all non-admin users** (SQL migration)
- Delete 4 accounts: `mayaxdigital@hotmail.com`, `yang@yup.group`, `matheusmalenadev@gmail.com`, `yang.ferreira2023@gmail.com`
- Clean cascade data from all related tables (profiles, subscriptions, user_roles, etc.)
- Delete from `auth.users`

### Files to edit
- `src/pages/Auth.tsx` — add `signOut()` in the confirmation detection useEffect
- SQL migration — delete non-admin users from auth.users and related tables

