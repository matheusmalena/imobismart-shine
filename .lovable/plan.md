

## Plan: Fix All System Issues

### Issues Identified

**1. OTP Edge Function Crash (500 Error)**
In `Auth.tsx` line 200-205, `handleMFASuccess` still calls `send-login-otp` which fails because the Resend domain is not verified. After MFA, it should navigate directly to the dashboard instead of triggering OTP.

**2. Landing Page Images Are AI-Generated, Not Real**
The `/images/tutorial-*.jpg` files were replaced with AI-generated images in a previous step. They need to be real screenshots from the actual system. Since I cannot log in to capture them (domain verification issue), I will use the browser tools to navigate to the preview, log in, and capture actual screenshots.

**3. useParallax Scroll Listeners Still Active**
The `useParallax` hook in `src/hooks/useParallax.ts` fires `setState` on every scroll event, causing constant re-renders. The session replay confirms rapid transform updates. Although Index.tsx no longer imports it directly, other components may still use it, and the hook itself should be cleaned up or removed.

**4. Console Warning: UpgradeBadge ref issue**
`UpgradeOverlay.tsx` line 130 exports `UpgradeBadge` as a function component that receives a ref without `forwardRef`. Minor but should be fixed.

---

### Steps

**Step 1: Fix handleMFASuccess to skip OTP**
- In `Auth.tsx` lines 200-205, remove the `send-login-otp` call
- Navigate directly to dashboard after MFA success (same pattern as `handleLogin` on line 182-184)

**Step 2: Capture real screenshots**
- Use browser tools to navigate to the preview app
- Log in with `yang@yup.group` / `Demo@2025`
- Navigate to Dashboard, Properties, Documents, Settings
- Take screenshots and save as `/images/tutorial-dashboard.jpg`, etc.

**Step 3: Fix UpgradeBadge ref warning**
- Wrap `UpgradeBadge` component with `React.forwardRef` in `UpgradeOverlay.tsx`

**Step 4: Remove unused useParallax hook**
- Search for any remaining imports of `useParallax`
- If unused, delete `src/hooks/useParallax.ts`

