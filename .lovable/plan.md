

## Plan: Fix Google Auth on Signup Tab + Add Loading on Landing Page

### Problem 1: Google Sign-In on Signup Tab
Currently, `handleGoogleSignIn` is the same for both Login and Signup tabs. When an existing user clicks "Cadastrar com Google", they get logged in without any warning. The existing check (lines 146-161) only blocks **new** users (created < 15s ago) from signing up via Google, but lets existing users through on the signup tab.

**Fix in `src/pages/Auth.tsx`:**
- Track which tab is active (login vs signup) using state
- In the `useEffect` that handles Google redirect (lines 143-162), check if the user came from the signup tab AND is an existing user (not new). If so, sign them out and show a toast: "Você já possui uma conta. Faça login na aba Entrar."
- Store the active tab in `localStorage` before the Google OAuth redirect so it persists across the page reload

### Problem 2: Landing Page Flash Before Dashboard
In `src/pages/Index.tsx`, while `loading` is true or while the redirect to `/dashboard` is happening, the full landing page renders, causing a visual flash.

**Fix in `src/pages/Index.tsx`:**
- Return a full-screen loading spinner when `loading` is true OR when `user` exists (redirect in progress), instead of rendering the landing page content

### Files to edit
- `src/pages/Auth.tsx` — track active tab, store in localStorage before Google redirect, check on return
- `src/pages/Index.tsx` — add loading state guard

