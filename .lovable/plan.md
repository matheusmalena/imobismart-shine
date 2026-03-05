

## Plan: Fix Logo Flicker + Final Visual Audit

### Root Cause of Logo Flicker

Every dashboard page independently wraps its content in `<DashboardLayout>`. When navigating between routes, React **unmounts the entire old page** (including its DashboardLayout with sidebar/logo) and **mounts a new page** (with a new DashboardLayout). This causes the sidebar and logo to flash on every navigation.

The previous fix (moving skeletons inside the layout) reduced internal flicker per page, but the core problem remains: **DashboardLayout is not shared across routes**.

### Fix: Shared Layout via React Router Outlet

Move `DashboardLayout` to a **layout route** in `App.tsx` using React Router's `<Outlet />`. All dashboard pages become child routes, so the layout mounts only once.

### Visual Audit Results

After reviewing all card headers across Dashboard, Settings, Subscription, and PaymentHistory:
- **Settings cards**: Correctly use `p-2 rounded-lg bg-primary/10` + `CardTitle className="text-base"` + `CardDescription`
- **Subscription cards**: Correctly use same pattern
- **PaymentHistory**: Correctly uses same pattern
- **RevenueChart / OccupancyChart**: Use `CardTitle className="text-base"` (no icon container, which is fine for chart cards)
- **Dashboard upgrade card**: Uses `p-2 rounded-lg bg-primary/10` correctly

All card headers are now standardized. The only remaining issue is the layout flicker.

### Steps

**Step 1: Create a layout wrapper component**

Create `src/components/layout/DashboardLayoutRoute.tsx`:
```tsx
import DashboardLayout from './DashboardLayout';
import { Outlet } from 'react-router-dom';

export default function DashboardLayoutRoute() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
```

**Step 2: Restructure routes in `App.tsx`**

Wrap all dashboard routes under a parent route using `DashboardLayoutRoute`:
```tsx
<Route element={<DashboardLayoutRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/properties" element={<Properties />} />
  <Route path="/tenants" element={<Tenants />} />
  <Route path="/documents" element={<Documents />} />
  <Route path="/settings" element={<Settings />} />
  <Route path="/reports" element={<Reports />} />
  <Route path="/subscription" element={<Subscription />} />
  <Route path="/team" element={<Team />} />
  <Route path="/whatsapp" element={<WhatsApp />} />
  <Route path="/admin/clients" element={<AdminClients />} />
  <Route path="/admin/clients/:userId" element={<AdminClientDetails />} />
  <Route path="/admin/plans" element={<AdminPlans />} />
  <Route path="/admin/enterprise-links" element={<AdminEnterpriseLinks />} />
</Route>
```

**Step 3: Remove `<DashboardLayout>` wrapper from all 12+ page components**

Each page currently does:
```tsx
return (
  <DashboardLayout>
    <PageTransition>...</PageTransition>
  </DashboardLayout>
);
```

Change to:
```tsx
return (
  <PageTransition>...</PageTransition>
);
```

Affected files: `Dashboard.tsx`, `Properties.tsx`, `Documents.tsx`, `Settings.tsx`, `Tenants.tsx`, `Reports.tsx`, `Subscription.tsx`, `WhatsApp.tsx`, `Team.tsx`, `admin/Clients.tsx`, `admin/ClientDetails.tsx`, `admin/Plans.tsx`, `admin/EnterpriseLinks.tsx`.

### Result

The sidebar, logo, header bar, and AI copilot mount **once** and persist across all navigation. Only the page content area changes, with smooth `PageTransition` animations. No more flicker.

