

## Plan: Fix Complete Payment Flow

### Root Cause Analysis

I traced the entire payment flow and found **3 critical issues**:

**Issue 1: User never sees `/payment-success` page**
When the user clicks "Fazer Upgrade" on Plans page, `window.location.href = checkoutUrl` redirects them to Cakto's external checkout (e.g. `pay.cakto.com.br`). After paying, Cakto does NOT redirect back to `/payment-success`. The user manually navigates back to the app, where the cached "free" data is still showing. The cache invalidation on `/payment-success` never fires because the user never visits that page.

**Issue 2: No tab-visibility refresh**
When the user returns to the app tab after completing payment on another tab/page, there's no mechanism to detect this and refresh subscription data.

**Issue 3: Webhook cancellation bypasses grace period**
The `cakto-webhook` Edge Function (lines 163-170) still sets `plan: "free"` immediately on `subscription_cancelled` events. This contradicts the grace period logic in `cancel-cakto-subscription` which keeps the plan and sets `expires_at`. If Cakto sends a cancellation webhook, it will nuke the plan instantly.

### Changes

**1. Add visibility-based cache refresh** (`src/hooks/useUserData.ts`)
- Use `refetchOnWindowFocus: true` in React Query config so when user switches back to the app tab, subscription data is automatically re-fetched
- This covers the scenario where user pays on Cakto and returns to the app

**2. Force refresh on Plans page return** (`src/pages/Plans.tsx`)
- Add a `visibilitychange` event listener that invalidates `user-data` query when the page becomes visible again
- This ensures that after paying on Cakto checkout (which opens in same tab or new tab), the data refreshes

**3. Fix webhook cancellation to respect grace period** (`supabase/functions/cakto-webhook/index.ts`)
- On cancellation events: set `status: "cancelled"` but **keep the current plan** (don't set `plan: "free"`)
- Calculate and set `expires_at` based on `subscription.next_payment_date` from the Cakto payload, or 30 days from now as fallback
- Remove the immediate `plan: "free"` assignment

**4. Set `started_at` on activation** (`supabase/functions/cakto-webhook/index.ts`)
- Add `started_at: new Date().toISOString()` to the activation payload so billing cycle calculations work correctly

**5. Add checkout redirect URL** (`src/pages/Plans.tsx`)
- Append `?redirect_url=` parameter to checkout URLs when redirecting to Cakto, so after payment the user lands on `/payment-success`
- Format: `${checkoutUrl}?redirect_url=${encodeURIComponent(window.location.origin + '/payment-success')}`

### Files to edit
- `src/hooks/useUserData.ts` — add `refetchOnWindowFocus: true`
- `src/pages/Plans.tsx` — add visibility listener + redirect URL param
- `supabase/functions/cakto-webhook/index.ts` — fix cancellation to keep plan, add `started_at` on activation

