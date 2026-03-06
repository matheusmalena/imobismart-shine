

## Plan: Fix Cancellation Grace Period and Enforce Strong Passwords

### Problem 1: Cancellation removes plan immediately
Currently, `cancel-cakto-subscription` sets `plan='free'` and `status='cancelled'` instantly, and archives excess properties right away. The correct behavior: when a user cancels, they should keep access to their paid plan until `expires_at` (end of billing period). The downgrade to free and property archiving should only happen when the period expires.

### Problem 2: Weak password allowed on signup
The signup schema only requires `min(6)` characters. Need to enforce strong passwords: minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character. Show real-time password strength feedback in the UI.

### Changes

**1. Fix cancellation flow** (`supabase/functions/cancel-cakto-subscription/index.ts`)
- Change behavior: set `status='cancelled'` but **keep the current plan** (don't set `plan='free'`)
- Set `expires_at` to the next billing cycle date (30 days from `started_at` or current `expires_at`)
- Do NOT archive properties immediately — that should happen only when the period ends
- Remove the property archiving logic from this function

**2. Handle expired subscriptions in frontend** (`src/hooks/useUserData.ts`)
- After fetching subscription, check if `status === 'cancelled'` and `expires_at < now()`:
  - If expired: treat plan as `free` on the client side
- If `status === 'cancelled'` but `expires_at` is in the future: keep the paid plan active

**3. Create a scheduled downgrade function** (`supabase/functions/downgrade-to-free/index.ts`)
- Update this existing function to also handle expired cancelled subscriptions
- When `expires_at` has passed and status is `cancelled`, set `plan='free'` and archive excess properties
- This function can be called via a cron or on user login

**4. Add expiry check on login/page load** (`src/hooks/useUserData.ts`)
- When fetching user data, if subscription is `cancelled` and `expires_at` is past, call `downgrade-to-free` edge function to finalize the downgrade

**5. Enforce strong passwords** (`src/pages/Auth.tsx`)
- Update `signupSchema` password validation:
  - Min 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character
- Add a real-time password strength indicator below the password field showing which requirements are met/unmet
- Update the UI with colored checkmarks for each requirement

### Files to edit
- `supabase/functions/cancel-cakto-subscription/index.ts` — keep plan, set expires_at, remove archiving
- `src/hooks/useUserData.ts` — check expiry client-side, trigger downgrade if expired
- `src/pages/Auth.tsx` — strong password validation + strength indicator UI
- `src/pages/Subscription.tsx` — show "active until {date}" when status is cancelled but not yet expired

