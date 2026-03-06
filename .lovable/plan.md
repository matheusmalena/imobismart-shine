

## Plan: Delete All Users + Fix Google Auth Flow

### Problem
1. All users need to be deleted from the system (including admin `matheus@yup.group` and any Google accounts)
2. The Google auth flow logic is currently **inverted**: it blocks new users from signing up via Google. The correct behavior should be:
   - First time (new user): must use **"Cadastrar"** tab with Google → account is created
   - Subsequent times (existing user): must use **"Entrar"** tab with Google → logs in
   - If existing user tries **"Cadastrar"** tab: show error "you already have an account, use Login"
   - If new user tries **"Entrar"** tab: show error "account not found, sign up first"

### Changes

**1. Delete all users (SQL migration)**
- Delete all data from all related tables (profiles, subscriptions, user_roles, properties, tenants, documents, etc.)
- Delete all users from `auth.users` using admin API via Edge Function (since we can't directly delete from auth schema in migrations)
- This includes the admin account `matheus@yup.group`

**2. Fix Google auth logic** (`src/pages/Auth.tsx`, lines 143-180)

Current logic (wrong):
- `isNewUser` + any tab → blocks signup (line 152-163)
- `savedTab === 'signup'` + existing user → blocks (line 164-175)

New logic:
- `isNewUser` + `savedTab === 'login'` → block: "Conta nao encontrada, cadastre-se primeiro"
- `!isNewUser` + `savedTab === 'signup'` → block: "Voce ja tem conta, use Entrar"
- `isNewUser` + `savedTab === 'signup'` → allow (create account via Google)
- `!isNewUser` + `savedTab === 'login'` → allow (login via Google)

### Files to edit
- `src/pages/Auth.tsx` — fix the Google redirect useEffect logic
- Edge Function or SQL — delete all users and their data

### Important note
After deleting all users (including the admin), you will need to create a new account and manually assign the admin role again.

