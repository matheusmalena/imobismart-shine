

## Plan: Standardize Upgrade/Locked Cards Across Reports and Team

### Problem
The **Reports** (free plan) and **Team** (non-Enterprise) pages have completely custom upgrade prompts with different layouts, spacing, icon sizes, and button styles. They don't use the existing `UpgradeOverlay` or `LockedSection` components that the Dashboard already uses.

### Current inconsistencies:
1. **Reports free-plan view** (lines 421-468): Custom centered card with `max-w-2xl mx-auto py-12`, `h-16 w-16` icon, `text-2xl` title, feature list with individual plan badges, full-width button
2. **Team non-Enterprise view** (TeamManagement lines 123-158): Card with header icon+title pattern, `h-8 w-8` lock icon, `text-lg` title, separate badge + button, uses `window.location.href` instead of `navigate`
3. Both differ from the `UpgradeOverlay` component (backdrop-blur, centered lock icon, consistent sizing)

### Solution
Create a single reusable `LockedPagePlaceholder` component and use it in both pages, ensuring consistent:
- Icon size and background
- Title size (`text-xl`)
- Description text styling
- Feature list layout (optional)
- Button style and navigation
- Plan badge colors (matching `UpgradeOverlay` PLAN_CONFIG)

### Steps

**Step 1: Create `src/components/common/LockedPagePlaceholder.tsx`**
A reusable full-page upgrade prompt component with props:
- `icon` (React element)
- `title` (string)
- `description` (string)
- `features` (optional array of `{ icon, label, description, plan }`)
- `requiredPlan` ('pro' | 'plus' | 'enterprise')
- `buttonLabel` (string)

Uses the same color tokens as `UpgradeOverlay` (PLAN_CONFIG). Layout: centered card, consistent icon container (p-4 rounded-full bg-muted), `text-xl font-semibold` title, feature grid with matching badge styles, single CTA button using `navigate('/plans')`.

**Step 2: Refactor Reports free-plan view (lines 421-468)**
Replace the custom upgrade card with `<LockedPagePlaceholder>`, passing the report-specific features list and `requiredPlan="pro"`.

**Step 3: Refactor TeamManagement non-Enterprise view (lines 123-158)**
Replace the custom upgrade card with `<LockedPagePlaceholder>`, passing team-specific description and `requiredPlan="enterprise"`. Remove `window.location.href` in favor of proper navigation.

**Step 4: Ensure page headers remain standardized**
Both pages already have standardized `text-3xl` headers from the previous fix. The locked placeholder renders inside the content area below the header, keeping the header visible and consistent.

