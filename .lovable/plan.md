

## Plan: Visual Standardization + Eliminate Page Flicker

### Problem 1: Page Flicker / Default Content Flash

The core issue is that **every page independently renders its own loading skeleton inside `DashboardLayout`**. When navigating between tabs, the entire layout (sidebar + logo) re-renders because each page wraps its content in `<DashboardLayout>` and shows a full-page skeleton during loading. This causes the logo and sidebar to briefly disappear and reappear.

The root cause: loading states return `<DashboardLayout><Skeleton /></DashboardLayout>` which unmounts and remounts the layout component on every route change, causing the sidebar/logo to flash.

**Fix**: Move the skeleton rendering **inside** the page content, keeping `DashboardLayout` always mounted with a consistent wrapper. Pages that currently do early `return <DashboardLayout><Skeleton/></DashboardLayout>` should instead always render `DashboardLayout` once, and show skeleton only in the content area.

Affected pages:
- `Dashboard.tsx` (lines 39-54) -- early return with DashboardLayout + Skeleton
- `Properties.tsx` (lines 156-172) -- early return with DashboardLayout + Skeleton
- `Documents.tsx` (lines 76-85) -- early return with DashboardLayout + Skeleton
- `Settings.tsx` (lines 97-109) -- early return with DashboardLayout + Skeleton
- `Tenants.tsx` (lines ~88-100) -- early return with DashboardLayout + Skeleton
- `Reports.tsx` (lines 133-147) -- early return with DashboardLayout + Skeleton
- `Subscription.tsx` (lines 112-124) -- early return with DashboardLayout + Skeleton
- `WhatsApp.tsx` (lines 14-23) -- early return with DashboardLayout + Skeleton

### Problem 2: Remaining Visual Inconsistencies

After auditing all pages:

**A. MetricCard uses raw `div` instead of `Card` component**
- `MetricCard.tsx` uses `<div className="bg-card rounded-2xl ...">` instead of `<Card>`. This is the only dashboard card not using the `Card` component. While it works visually, it breaks the architectural pattern.

**B. Documents page empty state uses `rounded-full` icon container**
- Line 206: `<div className="p-6 rounded-full bg-primary/10 mb-6">` should be `rounded-lg` to match the standardized pattern.

**C. Missing `PageTransition` wrapper on several pages**
- Dashboard, Settings, Subscription, WhatsApp, Documents -- none use `PageTransition`
- Properties and Tenants already use it

**D. Dashboard upgrade card icon uses `rounded-xl` instead of `rounded-lg`**
- Line 153: `p-2.5 rounded-xl` should be `p-2 rounded-lg` to match all other icon containers.

**E. Settings `CardTitle` defaults to `text-2xl`**
- Settings card titles have no size override, rendering at `text-2xl` (the default). All other standardized cards use `text-base`. Should add `className="text-base"` to all three Settings cards.

### Steps

**Step 1: Fix page flicker -- restructure loading states (8 pages)**
For each page, change the pattern from:
```tsx
// BEFORE (causes remount)
if (isLoading) {
  return <DashboardLayout><Skeleton /></DashboardLayout>;
}
return <DashboardLayout><Content /></DashboardLayout>;
```
to:
```tsx
// AFTER (single mount)
return (
  <DashboardLayout>
    {isLoading ? <Skeleton /> : <Content />}
  </DashboardLayout>
);
```

**Step 2: Standardize Documents empty state icon container**
Change `rounded-full` to `rounded-lg` on line 206.

**Step 3: Standardize Dashboard upgrade card icon container**
Change `p-2.5 rounded-xl` to `p-2 rounded-lg` on line 153.

**Step 4: Add `text-base` to Settings card titles**
Add `className="text-base"` to all three `CardTitle` elements in Settings.tsx (Profile, Security, Subscription cards).

**Step 5: Add `PageTransition` to pages missing it**
Wrap content in `PageTransition` for: Dashboard, Settings, Documents, WhatsApp, Subscription.

