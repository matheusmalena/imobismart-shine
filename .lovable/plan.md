

## Plan: Fix OTP Flash Bug + Individual Digit Boxes

### Problems
1. **Flash bug**: `handleOTPSuccess` sets `authView` to `'default'` before `navigate('/dashboard')`, causing the login form to flash briefly.
2. **Single input field**: OTP uses one large `<Input>` instead of individual digit boxes.

### Changes

**1. `src/pages/Auth.tsx`** -- Fix flash bug
- In `handleOTPSuccess`: navigate first, then reset state (or don't reset authView at all since navigation unmounts the component)
- In `handleSignupOTPSuccess`: same pattern -- don't set authView to intermediate states that cause flashes

**2. `src/components/auth/EmailOTPVerification.tsx`** -- Individual digit boxes
- Replace the single `<Input>` with the existing `InputOTP`, `InputOTPGroup`, `InputOTPSlot` components from `src/components/ui/input-otp.tsx`
- 6 slots in one group, auto-submit when all 6 digits are filled
- Style consistently with the auth card pattern (centered, proper spacing)
- Remove the Mail icon when inline (header already shows context)
- Keep the Voltar/Verificar buttons and resend link

