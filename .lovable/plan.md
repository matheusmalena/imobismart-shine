

## Plan: Fix Email Verification Flow and Re-enable Login OTP

### Problems Identified

1. **Signup redirect URL** points to `/` (root), which auto-logs the user in via Supabase session. Should redirect to `/auth?verified=true` instead.
2. **No "email verified" screen** -- when user clicks the verification link, they land on the app logged in. Need to intercept this, sign them out, and show a confirmation message.
3. **Email confirmation screen style** -- the current "Verifique seu email" view is minimal and doesn't match the login/signup visual pattern.
4. **Login OTP is disabled** -- lines 181-184 in Auth.tsx bypass the OTP step. Need to re-enable it with 6-digit codes.
5. **OTP is 4-digit** -- `send-login-otp` generates 4-digit codes; `EmailOTPVerification` expects 4 digits. Both need to be updated to 6 digits.

### Changes

**1. `src/contexts/AuthContext.tsx`** -- Change `emailRedirectTo` from `window.location.origin + '/'` to `window.location.origin + '/auth?verified=true'`

**2. `src/pages/Auth.tsx`**:
- Add a new `AuthView` value: `'emailVerified'`
- On mount, detect `?verified=true` in URL params: sign the user out (to prevent auto-login), set `authView` to `'emailVerified'`
- Add `emailVerified` view in `renderRightContent()` with a success icon, "Email verificado com sucesso!" title, message saying they can now login, and a "Voltar ao login" button
- Update `getHeaderContent()` for the `emailVerified` case
- Improve `emailConfirmation` view to include a Mail icon and more descriptive text matching the existing card style
- **Re-enable OTP on login**: replace lines 181-184 with code that sends OTP via `send-login-otp` and transitions to `emailOTP` view
- Update OTP header text to reference 6-digit code

**3. `supabase/functions/send-login-otp/index.ts`** -- Change OTP generation from 4 digits (`Math.floor(1000 + Math.random() * 9000)`) to 6 digits (`Math.floor(100000 + Math.random() * 900000)`)

**4. `src/components/auth/EmailOTPVerification.tsx`** -- Change `maxLength` from 4 to 6, update validation check from `code.length !== 4` to `code.length !== 6`, update placeholder to `"000000"`

**5. `supabase/functions/verify-login-otp/index.ts`** -- Update validation check from 4-digit to 6-digit code length (if present)

