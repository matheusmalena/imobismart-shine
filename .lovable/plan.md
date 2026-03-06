

## Plano: Corrigir fluxo de verificação de email no cadastro

### Problema

O `EmailConfirmationInterceptor` no `App.tsx` intercepta o link de confirmação (que contém `#access_token=...&type=signup`) e faz `navigate('/auth?verified=true')`, mas isso **descarta o hash com os tokens**. O Supabase nunca consegue trocar esses tokens por uma sessão, então o usuário chega na tela de "Email verificado" **sem sessão ativa** — o poll no `EmailVerifiedScreen` nunca encontra sessão e o redirect para o dashboard falha ou o usuário precisa fazer login novamente.

### Correção

#### 1. `src/App.tsx` — Preservar o hash no redirect

Ao navegar para `/auth?verified=true`, incluir o hash original para que o Supabase client possa processá-lo na página de destino:

```typescript
// Antes:
navigate('/auth?verified=true', { replace: true });

// Depois:
window.location.replace('/auth?verified=true' + window.location.hash);
```

Usar `window.location.replace` em vez de `navigate` porque o react-router pode não preservar o hash corretamente. O `replace` também evita entrada no histórico.

#### 2. `src/pages/Auth.tsx` — Garantir que o hash é processado

Na detecção de `?verified=true` (linha 184-188), **não** fazer `replaceState` imediatamente — deixar o hash ser processado pelo Supabase primeiro. Limpar a URL somente depois que a sessão for detectada (dentro do `EmailVerifiedScreen`).

Remover a linha 186 (`window.history.replaceState`) do bloco `verified=true` e mover para dentro do `EmailVerifiedScreen` após `sessionReady = true`.

#### 3. `src/pages/Auth.tsx` — Impedir redirect automático do useEffect Google

Na linha 230, o `useEffect` do Google OAuth verifica `authView !== 'default'` e retorna early — isso já está correto. Mas na linha 326-328, quando `user` existe e não tem `savedTab`, ele navega para `/dashboard` imediatamente, **pulando a tela de confirmação**. Adicionar check: se `authView === 'emailVerified'`, não redirecionar.

### Arquivos

| Arquivo | Mudança |
|---|---|
| `src/App.tsx` | Usar `window.location.replace` com hash preservado |
| `src/pages/Auth.tsx` | Mover `replaceState` para depois da sessão estar pronta; proteger redirect automático |

