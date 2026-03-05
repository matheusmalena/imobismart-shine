

## Plan: Full Visual Standardization Across the System

### Identified Inconsistencies

After auditing all pages and components, here are the visual inconsistencies found:

**1. Dashboard header uses `text-2xl sm:text-3xl` while all other pages use `text-3xl`**
- Dashboard h1 (line 77): `text-2xl sm:text-3xl` -- should be `text-3xl`
- Dashboard subtitle (line 85): `text-sm` without `mt-1` -- should match `text-muted-foreground mt-1`

**2. RevenueChart uses raw `div` instead of `Card` component**
- Uses `<div className="bg-card rounded-xl p-6 shadow-card border border-border/50">` (lines 28, 38)
- OccupancyChart correctly uses `<Card>` with `CardHeader`/`CardTitle`/`CardContent`
- Title uses `h3 text-lg` directly instead of `CardTitle text-base`

**3. Card title sizes inconsistent**
- OccupancyChart: `CardTitle className="text-base"` 
- ProFeaturesCard: `CardTitle className="text-base"` 
- PlusAICard: `CardTitle className="text-base"` 
- RevenueChart: `h3 text-lg font-semibold` (not using Card components)
- Subscription cards: `CardTitle` with no size override (defaults to `text-2xl`)
- PaymentHistory: `CardTitle` with no size override (defaults to `text-2xl`)
- Settings cards: `CardTitle` with no size override (defaults to `text-2xl`)

**4. Settings/Subscription cards have icon+title pattern with `p-2 rounded-lg bg-primary/10` icon containers, but Subscription page cards use inline `CardTitle` with icon -- inconsistent header patterns**

**5. Dashboard "upgrade prompt" card (lines 148-170) uses ad-hoc styling, not matching `LockedPagePlaceholder` or `UpgradeOverlay` patterns**

### Changes

**Step 1: Standardize Dashboard header**
- `src/pages/Dashboard.tsx` line 77: Change `text-2xl sm:text-3xl` to `text-3xl`
- Line 85: Add `mt-1` to subtitle paragraph, remove `text-sm` (keep `text-muted-foreground`)

**Step 2: Convert RevenueChart to use Card components**
- `src/components/dashboard/RevenueChart.tsx`: Replace raw `div` wrappers with `Card`, `CardHeader`, `CardTitle`, `CardContent`
- Use `CardTitle className="text-base"` to match OccupancyChart

**Step 3: Standardize Subscription page card headers**
- `src/pages/Subscription.tsx`: Add icon containers (`p-2 rounded-lg bg-primary/10`) and `CardDescription` to all three card headers (Usage, Plan, Payment) to match the Settings page pattern
- Override `CardTitle` to not use default `text-2xl` -- should be standard size with icon inline

**Step 4: Standardize PaymentHistory card header**
- `src/components/subscription/PaymentHistory.tsx`: Add icon container pattern (`p-2 rounded-lg bg-primary/10`) wrapping the Receipt icon, matching Settings cards

**Step 5: Standardize Subscription info banner**
- The bottom info banner (lines 374-388) uses `p-2 rounded-full bg-primary/10` for icon -- change to `p-2 rounded-lg bg-primary/10` to match all other cards

