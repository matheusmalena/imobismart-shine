

# Criar 3 Contas de Teste (Plano Free)

## Objetivo

Criar 3 contas de teste no plano **free** (padrao), para que voce possa testar o fluxo completo de pagamento: enviar o link de checkout da Cakto, simular o pagamento, e verificar se o webhook ativa o plano correto automaticamente.

## Contas a serem criadas

| Email | Nome | Senha | Plano Inicial |
|-------|------|-------|---------------|
| starter@teste.com | Starter Teste | 123456 | free |
| plus@teste.com | Plus Teste | 123456 | free |
| enterprise@teste.com | Enterprise Teste | 123456 | free |

## Como sera feito

1. Criar uma Edge Function temporaria (`create-test-users`) que usa a Admin API para criar os 3 usuarios com email ja confirmado (sem OTP)
2. Os triggers automaticos do banco criam perfil, role e subscription no plano `free`
3. Nenhuma alteracao de plano sera feita -- ficam no free
4. Executar a function uma vez para criar as contas
5. Deletar a function apos confirmar que as contas existem

## Fluxo de teste esperado

```text
1. Logar como starter@teste.com (plano free)
2. Enviar link de checkout do plano Starter na Cakto
3. Simular/completar pagamento
4. Webhook recebe evento --> ativa plano "starter"
5. Verificar no app que o plano mudou
```

O mesmo vale para plus@teste.com e enterprise@teste.com com seus respectivos links.

## Arquivo temporario

| Arquivo | Descricao |
|---------|-----------|
| `supabase/functions/create-test-users/index.ts` | Edge Function temporaria para criar as 3 contas |

Sera deletada imediatamente apos a criacao das contas.

