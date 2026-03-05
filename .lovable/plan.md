

## Plan: Plans Layout, Payment History Filter, and Dashboard Badge Fix

### 1. Plans page -- all cards in one row

The grid is `lg:grid-cols-4` but there are 5 plans (Free, Starter, Pro, Plus, Enterprise). Change to `lg:grid-cols-5` and increase `max-w` to `[1500px]` to match the landing page pattern.

Also, the FAQ card uses `max-w-3xl` and the Comparison card uses `max-w-4xl` -- standardize both to the same full width (`max-w-[1500px]`) so they match the plans grid width.

The Plans page still wraps in `<DashboardLayout>` (lines 131, 218, 546) instead of using the shared layout route. Remove those wrappers.

**File**: `src/pages/Plans.tsx`
- Line 256: Change `lg:grid-cols-4` to `lg:grid-cols-5`, change `max-w-[1400px]` to `max-w-[1500px]`
- Line 349: Change `max-w-4xl` to `max-w-[1500px]` on Feature Comparison wrapper
- Line 469: Change `max-w-3xl` to `max-w-[1500px]` on FAQ wrapper
- Lines 131, 218, 546: Remove `<DashboardLayout>` wrappers (use shared layout route)

### 2. Payment History -- show only "Ativação" events

Filter the history array to only include activation events before rendering.

**File**: `src/components/subscription/PaymentHistory.tsx`
- After fetching `history`, filter to only show entries where the event maps to "Ativação" (i.e., `purchase_approved`, `PURCHASE_APPROVED`, `subscription_active`, `SUBSCRIPTION_ACTIVE`).

### 3. Dashboard badge not synced

The `getPlanLabel()` function is missing the `'starter'` case -- it falls through to `'Gratuito'`. So users on Starter see "Gratuito" badge.

**File**: `src/pages/Dashboard.tsx`
- Line 47: Add `case 'starter': return 'Starter';` to `getPlanLabel()`

