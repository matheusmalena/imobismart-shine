

## Plan: Delete All Non-Admin Accounts and Verify Auth Flow

### Current State

**Accounts in the system:**
- `matheus@yup.group` (admin - keep)
- `malenatechoficial@gmail.com` (delete)
- `yang.ferreira2023@gmail.com` (delete)

**Auth flow already implemented:**
- Signup: creates account → sends 6-digit OTP via Resend → user verifies → "Email verified" screen → redirects to login
- Login: email/password → sends 6-digit OTP → user verifies → enters dashboard

Both flows already exist in the code. The OTP is sent via the `send-login-otp` edge function and verified via `verify-login-otp`.

### Changes

**1. Delete non-admin accounts** (via `delete-user-admin` edge function)
- Call the edge function for each user to delete: `malenatechoficial@gmail.com` and `yang.ferreira2023@gmail.com`
- This will cascade-delete all associated data (properties, tenants, contracts, documents, messages, storage files)

**2. Clean up orphaned data** (SQL)
- Delete any remaining records in `email_verifications`, `payment_history`, `ai_chat_messages` for the deleted users
- Clean up any lingering data that might not have been caught by the cascade

No code changes needed — the signup email confirmation and login OTP are already fully implemented and working.

