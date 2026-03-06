

## Plano: Reestruturar Sistema de Autenticação

### Problemas Identificados

1. **Google OAuth com lógica quebrada**: O check de 60 segundos (`Date.now() - createdAt > 60000`) falha porque o tempo do redirect OAuth varia. Além disso, o Supabase sempre faz upsert no OAuth -- não existe "só login" vs "só cadastro" a nível de API.

2. **Google pula verificação OTP**: Usuários Google vão direto ao dashboard sem OTP, enquanto login por email exige OTP.

3. **Sessões fantasmas**: Usuários deletados continuam logados (parcialmente corrigido, mas o `onAuthStateChange` não valida).

4. **AuthContext com mfaPending frágil**: O estado `mfaPending` bloqueia `onAuthStateChange` mas pode dessincronizar.

---

### Solução Proposta (Abordagem Profissional)

#### 1. Google Auth: Usar check no banco (profiles) em vez de timestamp

Ao retornar do Google OAuth, verificar se já existe um registro na tabela `profiles` com aquele `user_id`. Isso é determinístico:

- **Aba "Cadastrar" + profile já existe** → Bloquear: "Você já tem conta, use Entrar"
- **Aba "Entrar" + profile NÃO existe** → Bloquear: "Conta não encontrada, use Cadastrar"
- **Aba "Cadastrar" + profile NÃO existe** → Novo usuário, prosseguir (o trigger `handle_new_user` cria o profile)
- **Aba "Entrar" + profile existe** → Usuário existente, prosseguir

O problema é que o trigger `handle_new_user` cria o profile automaticamente no signup. Para contornar, salvar timestamp pré-redirect e comparar `profiles.created_at` (criado pelo trigger) contra ele.

**Solução definitiva**: Armazenar `Date.now()` em localStorage ANTES do redirect. No retorno, consultar `profiles` e comparar `profiles.created_at` com o timestamp salvo:
- `profiles.created_at < timestamp_salvo` → usuário existente
- `profiles.created_at >= timestamp_salvo` → recém criado

#### 2. Google Auth com OTP para login (opcional mas consistente)

Para manter paridade com email/senha, após Google OAuth na aba "Entrar", enviar OTP para o email do Google e exigir verificação. Na aba "Cadastrar" (primeira vez), pular OTP pois é o primeiro acesso.

#### 3. Refatorar `AuthContext.tsx`

- Remover dependência de `mfaPending` no `useEffect` do `onAuthStateChange` (causa re-subscrição)
- Usar `useRef` para `mfaPending` em vez de re-registrar o listener
- Adicionar validação `getUser()` no `onAuthStateChange` para sessões de usuários deletados

#### 4. Refatorar `Auth.tsx`

- Limpar o `useEffect` que monitora `user` para Google OAuth
- Separar fluxo Google em função dedicada com lógica clara
- Adicionar tratamento para quando o usuário Google precisa ser bloqueado (deletar conta recém-criada indevida via edge function)

---

### Arquivos a Modificar

| Arquivo | Mudança |
|---|---|
| `src/contexts/AuthContext.tsx` | Usar `useRef` para mfaPending no listener; validar sessão no `onAuthStateChange` |
| `src/pages/Auth.tsx` | Substituir check 60s por query `profiles` + timestamp pré-redirect; adicionar OTP para Google login; função `handleGoogleReturn` dedicada |
| `supabase/functions/send-login-otp/index.ts` | Sem mudanças (já funcional) |

### Fluxo Final

```text
┌─────────────────────────────────────────────┐
│              GOOGLE AUTH                     │
│                                             │
│  1. Salva tab + timestamp em localStorage   │
│  2. Redirect para Google                    │
│  3. Retorno: query profiles WHERE user_id   │
│  4. Compara profiles.created_at vs timestamp│
│     ├─ Novo + tab="signup" → Dashboard      │
│     ├─ Existente + tab="login" → OTP → Dash │
│     ├─ Novo + tab="login" → Erro + signOut  │
│     └─ Existente + tab="signup" → Erro + SO │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│           EMAIL/SENHA AUTH                   │
│                                             │
│  Cadastro → Email confirmação → Login manual│
│  Login → Senha OK → OTP email → Dashboard   │
│  Login + MFA → TOTP → OTP email → Dashboard │
└─────────────────────────────────────────────┘
```

