

# Historico de Pagamentos + Corrigir Webhook Cakto

## Diagnostico do Webhook

O webhook `cakto-webhook` **nunca recebeu nenhuma chamada** — zero logs no historico. Isso indica que:
- A URL do webhook nao esta configurada corretamente no painel da Cakto, **OU**
- A Cakto nao esta enviando o header de autenticacao correto

A URL correta que deve estar configurada na Cakto e:

```text
https://wwgmfrtiexjfhjoaifnr.supabase.co/functions/v1/cakto-webhook
```

E o header de autenticacao deve ser:
- Header: `x-webhook-secret` ou `Authorization`
- Valor: o mesmo valor configurado no secret `CAKTO_WEBHOOK_SECRET`

**Acao necessaria do usuario:** Verificar no painel da Cakto se a URL e o secret estao corretos.

---

## Plano de Implementacao

### 1. Criar tabela `payment_history` (Migration SQL)

Nova tabela para registrar todos os eventos recebidos pelo webhook:

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | PK |
| user_id | uuid | Usuario associado |
| event | text | Tipo do evento (purchase_approved, etc) |
| plan | text | Plano identificado |
| status | text | approved, cancelled, refunded |
| amount | numeric | Valor (se enviado pela Cakto) |
| transaction_id | text | ID da transacao na Cakto |
| payer_email | text | Email do pagador |
| raw_payload | jsonb | Payload completo para debug |
| created_at | timestamptz | Data do evento |

RLS: usuarios veem apenas seus proprios registros. Service role (webhook) insere via service key.

### 2. Atualizar `cakto-webhook` Edge Function

- Apos processar o evento, inserir um registro na tabela `payment_history` com os dados do pagamento
- Registrar tanto eventos de ativacao quanto cancelamento

### 3. Atualizar componente `PaymentHistory.tsx`

Substituir o conteudo atual (que so mostra info estatica) por uma tabela real com:
- Data do evento
- Tipo (Ativacao, Cancelamento, Reembolso)
- Plano
- Status (badge colorido)
- Email do pagador

Buscar dados da nova tabela `payment_history` filtrando pelo `user_id`.

### 4. Criar hook `usePaymentHistory.ts`

Hook simples para buscar o historico de pagamentos do usuario logado.

---

## Arquivos Modificados

| Arquivo | Alteracao |
|---------|-----------|
| Migration SQL | Criar tabela `payment_history` com RLS |
| `supabase/functions/cakto-webhook/index.ts` | Inserir registro no `payment_history` apos processar evento |
| `src/hooks/usePaymentHistory.ts` | Novo hook para buscar historico |
| `src/components/subscription/PaymentHistory.tsx` | Tabela real com dados do banco |

## Detalhes Tecnicos

### Migration SQL

```sql
CREATE TABLE public.payment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event text NOT NULL,
  plan text,
  status text NOT NULL DEFAULT 'approved',
  amount numeric DEFAULT 0,
  transaction_id text,
  payer_email text,
  raw_payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment history"
  ON public.payment_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert payment history"
  ON public.payment_history FOR INSERT
  WITH CHECK (true);
```

A policy de INSERT com `true` funciona porque o webhook usa a service role key (nao passa por RLS). Usuarios autenticados nao conseguem inserir pois a policy e restrictive e nao ha policy permissive de INSERT para authenticated.

