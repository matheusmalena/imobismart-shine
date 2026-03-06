

## Plan: Custom Signup Verification via Resend + Full-Screen Verified Page

### Problem
1. Signup uses Supabase's native email confirmation, which sends from `no-reply@auth.lovable.cloud` instead of `@imobismart.com`
2. The "Email Verificado" screen uses the split-screen auth layout instead of a full-screen centered page

### Approach

Replace the link-based email verification with a **custom OTP-based verification** using the existing Resend infrastructure (same pattern as login OTP). This eliminates Supabase's native confirmation email entirely.

### Changes

**1. Enable auto-confirm email signups** (database config)
- Use `configure-auth` to enable auto-confirm, so Supabase stops sending its own confirmation emails
- Email verification will be handled by our custom OTP flow instead

**2. `src/pages/Auth.tsx`** -- Signup flow changes
- After successful `signUp`, instead of showing `emailConfirmation` view with "check your email for a link", send an OTP via `send-login-otp` and show the OTP verification screen (`emailOTP` view) with a signup-specific success handler
- Add a `signupOTP` auth view that uses `EmailOTPVerification` but on success shows the full-screen verified page
- On OTP success after signup: show `emailVerified` view
- On OTP success after login: navigate to dashboard (existing behavior)

**3. `src/pages/Auth.tsx`** -- Full-screen "Email Verificado" page
- When `authView === 'emailVerified'`, return early (before the split-screen layout) with a full-screen white-background centered page containing:
  - Large green CheckCircle icon
  - "Email verificado com sucesso!" title
  - "Você já pode fazer login na plataforma" subtitle
  - "Ir para o login" button
- Remove the `emailVerified` case from `renderRightContent()` and `getHeaderContent()`

**4. Remove `?verified=true` detection**
- Since we no longer use link-based verification, remove the `useEffect` that detects `?verified=true` and signs the user out
- Remove `emailRedirectTo` from `signUp` in `AuthContext.tsx` (no longer needed)

### Flow Summary

```text
Signup: Form → signUp (auto-confirmed) → send OTP via Resend/@imobismart → OTP screen → verified full-screen → login
Login:  Form → signIn → send OTP via Resend/@imobismart → OTP screen → dashboard
```

