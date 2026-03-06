

## Plan: Fix Subscription Issues

### Problems Identified

1. **User oyangferreira@gmail.com has Pro plan instead of Free**: This happened because in a previous step, I manually inserted a Pro subscription for this user via direct database insert. The `handle_new_user_role` trigger creates `free/trial` for new users, but since the subscription record already existed (from my manual setup), it was skipped (`ON CONFLICT DO NOTHING`). I need to reset this user's subscription to `free/trial`.

2. **Payment method shows "Cakto"**: The Subscription page hardcodes "Cakto" as the payment method label. It should instead read the `payment_method` field from the subscriptions table and display user-friendly labels like "Cartão de crédito" or "Cartão de débito".

3. **Screenshots issue**: I cannot programmatically save browser screenshots as image files in the repository. Instead, I will build CSS-rendered mockup components directly in the landing page that visually replicate the real system UI (dashboard cards, property list, etc.) using Tailwind, eliminating the need for screenshot images entirely. This ensures the landing page always shows an accurate, up-to-date representation of the system.

### Changes

**1. Reset oyangferreira@gmail.com subscription** (Database)
- UPDATE subscription to `plan='free', status='trial'` for user_id `774f5caf-7dfa-48de-8759-8bed37911b6c`

**2. Fix payment method display** (`src/pages/Subscription.tsx`)
- Replace hardcoded "Cakto" with a mapping from `subscription.payment_method`:
  - `null` / `'cakto'` / `'credit_card'` → "Cartão de crédito"
  - `'debit_card'` → "Cartão de débito"  
  - `'pix'` → "PIX"
  - `'boleto'` → "Boleto"
- Remove the text "Para gerenciar detalhes do pagamento, acesse o painel da Cakto" and replace with a neutral message

**3. Build CSS mockups for landing page** (`src/pages/Index.tsx`)
- Replace the `<img>` tags pointing to `/images/tutorial-*.png` with inline React components that render simplified but realistic versions of the Dashboard, Properties, Documents, and Settings screens
- These will use Tailwind styling to look like actual screenshots with real data (metric cards, property cards, table rows, etc.)
- This eliminates dependency on static image files entirely

### Files to edit
- `src/pages/Subscription.tsx` — payment method display fix
- `src/pages/Index.tsx` — replace image-based screenshots with CSS mockups
- Database — reset subscription for oyangferreira@gmail.com

