

# Login com Google + Confirmacao de Email + OTP Obrigatorio no Login

## Resumo

Tres mudancas no fluxo de autenticacao:
1. Botao "Entrar com Google" / "Cadastrar com Google"
2. Apos cadastro por email, tela de "confirme seu email" (sem login automatico)
3. Todo login (email/senha) exige codigo de 4 digitos enviado por email

---

## 1. Google OAuth

Usar o Lovable Cloud managed Google OAuth (ja disponivel automaticamente).

**Arquivos:**
- Chamar a ferramenta `Configure Social Login` para gerar o modulo lovable
- `src/pages/Auth.tsx` — adicionar botao "Entrar com Google" em ambas as abas (login e cadastro), usando `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`
- Separador visual "ou" entre o botao Google e o formulario tradicional

---

## 2. Tela de Confirmacao de Email apos Cadastro

Atualmente, apos signup, o usuario e redirecionado ao dashboard. Mudar para:

- Apos `signUp()` com sucesso, mostrar uma tela com icone de email dizendo "Verifique seu email para ativar sua conta"
- Nao redirecionar para o dashboard
- Apos o usuario clicar no link de confirmacao, ele deve voltar para `/auth` na aba "Entrar"

**Arquivos:**
- `src/pages/Auth.tsx` — novo estado `showEmailConfirmation` que exibe a tela de confirmacao em vez do formulario
- `src/contexts/AuthContext.tsx` — garantir que signup nao faz login automatico (ja e o comportamento com email confirmation ativado)

---

## 3. OTP de 4 Digitos por Email Obrigatorio em Todo Login

Fluxo:
1. Usuario faz login com email/senha
2. Se credenciais corretas, backend gera um codigo de 4 digitos, salva na tabela `email_verifications` e envia por email via Resend
3. Frontend exibe tela de input do codigo
4. Usuario digita o codigo, frontend chama edge function para verificar
5. Se correto, login e concluido

**Database:** Reutilizar a tabela `email_verifications` existente (ja tem `email`, `otp_code`, `expires_at`, `verified`).

**Edge Functions (novas):**
- `supabase/functions/send-login-otp/index.ts` — recebe o email do usuario autenticado, gera codigo de 4 digitos, salva em `email_verifications`, envia via Resend
- `supabase/functions/verify-login-otp/index.ts` — recebe email + codigo, valida contra `email_verifications`, retorna sucesso/falha

**Config:** Adicionar ao `supabase/config.toml`:
```toml
[functions.send-login-otp]
verify_jwt = false

[functions.verify-login-otp]
verify_jwt = false
```

**Frontend:**
- `src/pages/Auth.tsx` — apos login com senha bem-sucedido:
  1. Chamar `send-login-otp` para enviar o codigo
  2. Mostrar tela de input de 4 digitos (similar ao MFAVerification mas com 4 digitos)
  3. Ao verificar com sucesso, permitir acesso ao dashboard
- `src/components/auth/EmailOTPVerification.tsx` — novo componente para input de 4 digitos com botao "Reenviar codigo"
- `src/contexts/AuthContext.tsx` — ajustar o fluxo de login para suportar o passo de OTP antes de liberar o usuario

**Nota:** O login via Google NAO exige OTP (Google ja tem sua propria verificacao). O OTP e apenas para login com email/senha.

---

## Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| Configure Social Login tool | Gerar modulo lovable para Google OAuth |
| `src/pages/Auth.tsx` | Botao Google, tela confirmacao email, fluxo OTP |
| `src/components/auth/EmailOTPVerification.tsx` | Novo componente de input OTP 4 digitos |
| `src/contexts/AuthContext.tsx` | Ajustar fluxo login para OTP |
| `supabase/functions/send-login-otp/index.ts` | Gerar e enviar OTP por email |
| `supabase/functions/verify-login-otp/index.ts` | Verificar OTP |
| `supabase/config.toml` | Registrar novas functions |

