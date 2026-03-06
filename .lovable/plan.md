

## Plan: Fix Auth Flow -- Email Confirmation on Signup, OTP on Login

### Problem
Currently, signup sends a 6-digit OTP code (same as login) and auto-confirms the email, letting the user log in immediately without email verification. The user wants:
- **Signup**: Confirm email via link (Supabase native confirmation email)
- **Login**: 6-digit OTP code verification (already working)

### Root Cause
`auto_confirm_email` is enabled, so accounts are confirmed instantly. The signup handler sends an OTP code instead of relying on Supabase's native confirmation email.

### Changes

**1. Disable auto-confirm email** (configure-auth tool)
- Set `auto_confirm_email = false` so Supabase sends a native confirmation link on signup
- Users must click the link before they can log in

**2. Update signup flow** (`src/pages/Auth.tsx`)
- Remove OTP sending from `handleSignUp` (lines 279-289)
- After successful `signUp()`, show a "check your email for the confirmation link" screen (`emailConfirmation` view) instead of OTP
- Keep the `emailVerified` view for when user returns after clicking the link
- Add URL parameter detection (`?confirmed=true` or hash fragment) to show the "email verified" screen when user returns from the confirmation link

**3. Keep login OTP flow unchanged**
- `handleLogin` → password check → send 6-digit OTP → verify → dashboard (no changes needed)

**4. Fix AuthContext to prevent auto-login on signup** (`src/contexts/AuthContext.tsx`)
- The `signIn` function already sets `mfaPending` to block `onAuthStateChange`. But after signup with auto_confirm disabled, the user won't have a session anyway, so no change needed here.

### Files to edit
- `src/pages/Auth.tsx` — remove OTP on signup, show confirmation message, detect email confirmed return
- Configure auth settings — disable auto_confirm_email

