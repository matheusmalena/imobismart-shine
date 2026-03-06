

## Plano: Corrigir OTP que nao redireciona + outros bugs de auth

### Bug Principal: User fica `null` apos OTP

**Causa raiz:** Quando o login por email/senha acontece, o `signIn` no AuthContext seta `mfaPendingRef.current = true` diretamente. Isso bloqueia o `onAuthStateChange` de setar o `user` no contexto. Apos o OTP ser verificado, `handleOTPSuccess` chama `setMfaPending(false)` (atualiza apenas o state React), mas a ref so atualiza via `useEffect` no proximo render. O evento `onAuthStateChange` ja foi descartado e nao dispara novamente, entao `user` permanece `null`. O `navigate('/dashboard')` acontece, mas o dashboard nao tem dados do usuario.

### Bugs Secundarios

1. **Google OAuth login:** Mesmo problema — `setMfaPending(true)` no useEffect do Google bloqueia o listener, e `handleOTPSuccess` nao restaura corretamente
2. **Ref desync:** A ref so sincroniza via `useEffect` (pos-render), criando janela de inconsistencia

### Correcoes

#### 1. `src/contexts/AuthContext.tsx`

- Substituir `setMfaPending` exportado por uma funcao que atualiza **tanto o state quanto a ref** ao mesmo tempo
- Adicionar uma funcao `completeAuth()` que: seta `mfaPending = false`, `mfaPendingRef = false`, busca a sessao atual com `getSession()` e seta `user`/`session` manualmente

```typescript
const completePendingAuth = async () => {
  mfaPendingRef.current = false;
  setMfaPending(false);
  // Manually fetch and set the session that was blocked
  const { data: { session: currentSession } } = await supabase.auth.getSession();
  if (currentSession) {
    const { data: { user: verifiedUser } } = await supabase.auth.getUser();
    if (verifiedUser) {
      setSession(currentSession);
      setUser(currentSession.user);
    }
  }
};
```

- Exportar `completePendingAuth` no contexto em vez de expor `setMfaPending` diretamente

#### 2. `src/pages/Auth.tsx`

- `handleOTPSuccess`: chamar `completePendingAuth()` em vez de `setMfaPending(false)`, depois `navigate('/dashboard')`
- `handleOTPCancel` e `handleMFACancel`: tambem atualizar a ref diretamente via a nova funcao
- Google OAuth `setMfaPending(true)`: atualizar ref diretamente junto (`mfaPendingRef` nao e acessivel fora do contexto, entao usar uma funcao exportada `startPendingAuth()`)

### Arquivos

| Arquivo | Mudanca |
|---|---|
| `src/contexts/AuthContext.tsx` | Adicionar `completePendingAuth()`, atualizar ref e state juntos, fetch manual da sessao |
| `src/pages/Auth.tsx` | Usar `completePendingAuth()` no OTP success; limpar todos os handlers |

