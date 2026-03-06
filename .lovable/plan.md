

## Plano: Email verificado → Confirmação → Dashboard (sem OTP no cadastro)

### Problema Atual
Quando o usuário clica no link de confirmação de email, o `EmailConfirmationInterceptor` no `App.tsx` faz `signOut` e redireciona para uma tela estática de "email verificado" que pede para fazer login manualmente. O OTP não deveria ser exigido no primeiro acesso após verificação.

### Mudanças

#### 1. `src/App.tsx` — `EmailConfirmationInterceptor`
Em vez de fazer `signOut` e redirecionar para `?verified=true`, **manter a sessão ativa** e redirecionar para `/auth?verified=true` sem sign out. O Supabase já autentica o usuário automaticamente ao clicar no link de confirmação.

```text
Antes: signOut → /auth?verified=true → tela estática → login manual → OTP
Depois: mantém sessão → /auth?verified=true → tela de sucesso (3s) → /dashboard
```

#### 2. `src/pages/Auth.tsx` — Tela `emailVerified`
- Ao detectar `?verified=true`, mostrar a tela de confirmação de sucesso como hoje (ícone verde, "E-mail verificado com sucesso!")
- Adicionar um `useEffect` que após 3 segundos redireciona automaticamente para `/dashboard`
- Manter o botão "Ir para o dashboard" como ação imediata
- **Não exigir OTP** — o usuário acabou de verificar o email, isso já é prova de identidade

#### 3. `src/pages/Auth.tsx` — Detectar verificação no `useEffect` do Google/user
- Quando `authView === 'emailVerified'` e o `user` está autenticado, não redirecionar para dashboard imediatamente (deixar a tela de sucesso aparecer por 3s)
- Ajustar a condição na linha 150 para ignorar quando `authView === 'emailVerified'` (já está feito)

#### 4. `src/contexts/AuthContext.tsx` — Sem bloqueio no signup redirect
- O `onAuthStateChange` já usa `mfaPendingRef` para não bloquear. No caso de email verification, `mfaPending` é `false`, então a sessão será setada normalmente. Sem mudanças necessárias.

### Fluxo Final

```text
Cadastro email/senha:
  1. Preenche formulário → clica "Criar conta"
  2. Tela "Confirme seu e-mail" (já existe)
  3. Clica link no email → Supabase confirma e autentica
  4. Redirect para /auth?verified=true
  5. Tela de sucesso "E-mail verificado!" (3s)
  6. Redirecionamento automático para /dashboard

Login email/senha:
  1. Email + senha → OTP obrigatório (sem mudança)

Login Google:
  1. Sem mudança (OTP no login, direto no signup)
```

### Arquivos a Modificar

| Arquivo | Mudança |
|---|---|
| `src/App.tsx` | Remover `signOut` do interceptor; apenas redirecionar para `/auth?verified=true` mantendo sessão |
| `src/pages/Auth.tsx` | Tela `emailVerified`: auto-redirect para `/dashboard` após 3s; detectar que user está logado e não exigir OTP |

