

# Corrigir Envio de Emails: Usar Dominio Verificado imobismart.com.br

## Problema
O remetente de emails esta configurado como `onboarding@resend.dev` (dominio de teste do Resend). Este dominio so permite enviar emails para o endereco cadastrado na propria conta do Resend - por isso nenhum convite chega para outras pessoas.

## Solucao
Alterar o remetente no edge function `send-team-invite` para usar o dominio verificado `imobismart.com.br`.

## Pre-requisito (acao do usuario)
Antes de funcionar, o dominio `imobismart.com.br` precisa estar **verificado** no Resend:
1. Acesse [resend.com/domains](https://resend.com/domains)
2. Adicione o dominio `imobismart.com.br` (se ainda nao adicionou)
3. Configure os registros DNS que o Resend solicitar (MX, SPF, DKIM) no seu provedor de dominio
4. Aguarde a verificacao ficar com status "Verified"

## Alteracao Tecnica

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/send-team-invite/index.ts` | Linha 155: trocar `from: "ImobiSmart <onboarding@resend.dev>"` para `from: "ImobiSmart <noreply@imobismart.com.br>"` |

Essa e a unica alteracao necessaria - uma linha de codigo.

