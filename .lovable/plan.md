

## Plan: Fix 4 Critical Issues

### Problem Analysis

1. **Google signup allows existing users through**: The `isNewUser` check uses a 15-second time window (`now - createdAt < 15000`), which is unreliable after the OAuth redirect (can take longer than 15s). When it fails, the user bypasses the guard and gets logged in even from the "Cadastrar" tab.

2. **Cakto checkout shows product page before redirect**: The `redirect_url` parameter is appended to the checkout URL, but Cakto shows a "view product" page after payment before redirecting. This is Cakto's default behavior. We can't control Cakto's intermediate page, but we can handle the transition better on our side.

3. **Email confirmation auto-logs the user**: The current hash detection (`type=signup`) works but the confirmation link may redirect to `/?` or a different path than `/auth`, meaning the `useEffect` in Auth.tsx never fires. Need to also handle this in `Index.tsx` and ensure global interception.

4. **Payment not updating plan**: The webhook received `matheusmalena04@gmail.com` as buyer email but the user (`yang@yup.group`) paid from a different email in Cakto. The webhook looks up the profile by `buyerEmail` and fails. The fix should also match by the Cakto checkout email passed in the URL or allow the user's email to be sent to Cakto.

---

### Changes

#### Fix 1: Google Auth — Reliable existing-user detection
**File: `src/pages/Auth.tsx`** (lines 143-180)

The 15-second `isNewUser` heuristic is flawed. Instead, check the `profiles` table for an existing profile *before* the redirect to determine if the user already exists. Since we can't do that mid-OAuth, use a more reliable approach:

- After Google OAuth returns, query `profiles` table to check if user has a profile `created_at` older than the current session timestamp stored before redirect
- Store `Date.now()` in localStorage as `imobismart-auth-ts` before the Google redirect
- On return, compare `profiles.created_at` with the stored timestamp: if profile existed before the redirect timestamp, user is existing
- This eliminates the unreliable 15-second window

#### Fix 2: Cakto redirect — Show loading on PaymentSuccess
**File: `src/pages/PaymentSuccess.tsx`**

Since Cakto may show an intermediate page, the real fix is making `/payment-success` show a loading state while waiting for the webhook to process, then reveal the success message once the subscription is confirmed.

- Add a polling mechanism that checks subscription status every 3 seconds (up to 30s)
- Show a spinner with "Processando seu pagamento..." until subscription updates or timeout
- On timeout, show the success page anyway (webhook may be delayed)

#### Fix 3: Email confirmation — Global hash interception  
**File: `src/App.tsx`** or **`src/pages/Auth.tsx`**

The confirmation link may land on `/` (Index page) or `/auth`. Currently only `/auth` handles the hash.

- Add a global `useEffect` in `App.tsx` (or a wrapper component) that checks for `type=signup` in the URL hash on any route
- If detected, sign out locally and redirect to `/auth?verified=true`
- In `Auth.tsx`, check for `?verified=true` query param to show the emailVerified view

#### Fix 4: Webhook email mismatch — Pass user email to checkout
**File: `src/pages/Plans.tsx`** (line 223) + **`supabase/functions/cakto-webhook/index.ts`**

The buyer email in Cakto (`matheusmalena04@gmail.com`) doesn't match the platform email (`yang@yup.group`). Two-pronged fix:

- **Frontend**: Append the user's platform email as a query param to the checkout URL: `&email=${encodeURIComponent(userEmail)}`. Cakto may or may not use it, but we also append a custom param like `&src_email=...`
- **Webhook**: If profile lookup by `buyerEmail` fails, fall back to checking the `checkoutUrl` in the payload for a `src_email` param and look up by that. Also check `data.checkoutUrl` which Cakto includes in the payload (visible in logs: `"checkoutUrl": "https://pay.cakto.com.br/3f3r2ee?redirect_url=..."`)

Additionally, a simpler fallback: the webhook should also try to match by checking `data.subscription.customer.email` and `data.customer.email` (already done), but also look up in `auth.users` via service role if profiles lookup fails.

### Error messages in Portuguese
Ensure all toast error messages are in Portuguese (already mostly done, verify any English ones).

### Files to edit
1. `src/pages/Auth.tsx` — Fix Google auth timing, store pre-redirect timestamp, improve existing-user detection
2. `src/pages/PaymentSuccess.tsx` — Add polling/loading state while waiting for subscription
3. `src/App.tsx` — Add global email confirmation hash interceptor
4. `src/pages/Plans.tsx` — Append user email to Cakto checkout URL
5. `supabase/functions/cakto-webhook/index.ts` — Add fallback email lookup from checkoutUrl param

