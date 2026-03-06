

## Plan: Fix Payment Sync and Dashboard Name Flash

### Problems Identified

1. **Payment not syncing**: The Cakto webhook logs show it processed `yang.ferreira2023@gmail.com` successfully (activated Plus plan for user `3cbc285d`). The webhook works correctly. However, two issues prevent the user from seeing the updated plan:
   - **Frontend cache**: `useUserData` has `staleTime: 5 * 60 * 1000` (5 minutes). When the user returns from payment, the cached "free" data persists.
   - **PaymentSuccess page doesn't invalidate cache**: It just navigates to dashboard without refreshing user data.

2. **Payment method shows wrong label**: The webhook hardcodes `payment_method: "cakto"` instead of reading the actual method from the Cakto payload (`data.paymentMethod` = "pix", "credit_card", etc.). This means the Subscription page can never display the real payment method.

3. **"Olá, Investidor" flash**: The Dashboard renders content before profile data loads. Line 32 sets `firstName = profile?.full_name?.split(' ')[0] || 'Investidor'` but the loading skeleton only covers `authLoading || isLoading` (properties loading), not `useUserData` loading state.

### Changes

**1. Fix PaymentSuccess to invalidate user data cache** (`src/pages/PaymentSuccess.tsx`)
- Import `useQueryClient` from tanstack and invalidate `user-data` query on mount so that when the user navigates to dashboard, fresh data is fetched

**2. Reduce staleTime for user data** (`src/hooks/useUserData.ts`)
- Reduce `staleTime` from 5 minutes to 30 seconds so the plan updates are picked up faster after payment

**3. Fix webhook to capture actual payment method** (`supabase/functions/cakto-webhook/index.ts`)
- Read `data.paymentMethod` from the Cakto payload (e.g. "pix", "credit_card", "boleto") instead of hardcoding "cakto"
- Add "cakto" to the method labels mapping in Subscription.tsx as fallback for existing records

**4. Fix "Olá, Investidor" flash** (`src/pages/Dashboard.tsx`)
- Include `useUserData`'s `isLoading` state in the loading condition so the skeleton shows until profile data is ready

**5. Add "cakto" fallback to payment method labels** (`src/pages/Subscription.tsx`)
- Map "cakto" to a generic label for existing records that already have "cakto" stored

### Files to edit
- `src/pages/PaymentSuccess.tsx` — invalidate cache on mount
- `src/hooks/useUserData.ts` — reduce staleTime
- `supabase/functions/cakto-webhook/index.ts` — capture real payment method
- `src/pages/Dashboard.tsx` — fix loading condition
- `src/pages/Subscription.tsx` — add "cakto" fallback label

