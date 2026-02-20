
# Verificacao de Email com Codigo OTP no Cadastro

## O que muda

Apos criar a conta, o usuario vera uma tela pedindo o codigo OTP de 6 digitos enviado ao email dele. So apos digitar o codigo correto ele sera autenticado e redirecionado ao dashboard.

## Fluxo do usuario

1. Usuario preenche o formulario de cadastro e clica "Criar conta"
2. Um email com codigo de 6 digitos e enviado automaticamente
3. A tela muda para um formulario de verificacao com 6 campos para digitar o codigo
4. Usuario digita o codigo e clica "Verificar"
5. Se valido, usuario e autenticado e redirecionado ao dashboard
6. Opcao de "Reenviar codigo" disponivel caso nao receba

## Detalhes Tecnicos

### 1. Configuracao de Auth
- Desabilitar auto-confirm de email usando a ferramenta configure-auth, para que o email precise ser verificado antes de ativar a conta

### 2. Arquivo: `src/pages/Auth.tsx`
- Adicionar estados `showEmailVerification` (boolean) e `pendingEmail` (string)
- Importar `InputOTP`, `InputOTPGroup`, `InputOTPSlot` de `@/components/ui/input-otp`
- Importar icone `ArrowLeft` de lucide-react
- No `handleSignUp`: apos sucesso, em vez de navegar ao dashboard, setar `showEmailVerification = true` e guardar o email em `pendingEmail`
- Adicionar tela condicional de verificacao OTP (similar a tela MFA existente) com:
  - Icone de email no topo
  - Titulo "Verifique seu email"
  - Texto informando que o codigo foi enviado ao email
  - 6 campos OTP usando o componente `InputOTP` ja existente no projeto
  - Botao "Verificar" que chama `supabase.auth.verifyOtp({ email, token, type: 'signup' })`
  - Botao "Reenviar codigo" que chama `supabase.auth.resend({ type: 'signup', email })`
  - Botao "Voltar" para retornar ao formulario de cadastro
- Mensagem de sucesso atualizada para informar que o codigo foi enviado

### 3. Arquivo: `src/contexts/AuthContext.tsx`
- Nenhuma alteracao necessaria - o `signUp` ja retorna o erro/sucesso e o Supabase cuida do envio do OTP quando auto-confirm esta desabilitado

## Arquivos Modificados

| Arquivo | Alteracao |
|---------|----------|
| `src/pages/Auth.tsx` | Adicionar tela de verificacao OTP apos cadastro |
| Auth config | Desabilitar auto-confirm de email |
