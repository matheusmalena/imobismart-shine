
# Migrar Mercado Pago para Cakto + Painel Enterprise

## Resumo

Substituir toda a integracao de pagamento Mercado Pago pela Cakto, usando **checkout via link direto** (configurado pelo admin na tabela de planos) + **webhook** para ativar assinaturas automaticamente. Para Enterprise, o admin gerencia links personalizados por cliente numa pagina dedicada.

## Pre-requisitos (o que voce precisa fazer antes)

1. Criar conta na Cakto (https://app.cakto.com.br)
2. Criar produtos "ImobiSmart Pro" e "ImobiSmart Plus" como ofertas recorrentes (subscription)
3. Copiar os **links de checkout** de cada oferta
4. Gerar **Client ID** e **Client Secret** em Integracoes > Cakto API (se quiser usar API para consultas)
5. Configurar webhook no painel Cakto apontando para a URL que sera fornecida apos deploy

## Etapas

### 1. Banco de dados

- Adicionar coluna `checkout_url` (text, nullable) na tabela `plans` -- o admin cola o link de checkout da Cakto para Pro e Plus
- Criar tabela `enterprise_checkout_links` para links Enterprise personalizados por cliente:
  - `id`, `client_name`, `client_email`, `checkout_url`, `plan_label`, `price`, `is_active`, `notes`, `created_by`, `created_at`, `updated_at`
  - RLS: somente admins podem ler/escrever
- Adicionar colunas na tabela `subscriptions`:
  - `external_subscription_id` (text, nullable) -- substitui `mp_subscription_id`
  - `payer_email` (text, nullable) -- substitui `mp_payer_email`
  - Manter as colunas antigas por seguranca (nao apagar dados existentes)

### 2. Configurar segredos

- `CAKTO_WEBHOOK_SECRET` -- para validar webhooks recebidos da Cakto

### 3. Criar edge function `cakto-webhook`

Recebe notificacoes da Cakto quando um pagamento e aprovado ou cancelado:
- Valida o secret do webhook
- Extrai email do comprador e identifica o produto/oferta
- Busca o usuario pelo email no banco (tabela profiles)
- Determina o plano (pro/plus/enterprise) pelo produto da Cakto
- Atualiza a subscription do usuario (status = active, plan = correspondente)
- Para cancelamentos, reverte para starter

### 4. Criar edge function `cancel-cakto-subscription`

- Autentica o usuario via token
- Atualiza status local para `cancelled` e plan para `starter`
- Nota: cancelamento efetivo na Cakto e feito manualmente pelo admin no painel Cakto

### 5. Atualizar frontend

**Plans.tsx:**
- Remover chamada a `create-mp-subscription`
- Pro/Plus: buscar `checkout_url` do plano na tabela `plans` e redirecionar via `window.location.href`
- Enterprise: manter "Falar com Vendas" via WhatsApp

**Subscription.tsx:**
- Trocar "Mercado Pago" por "Cakto"
- Cancelamento chama `cancel-cakto-subscription`
- Remover link "Gerenciar no Mercado Pago"

**PaymentHistory.tsx:**
- Simplificar para mostrar dados locais do banco (historico de mudancas de status da subscription)
- Remover dependencia da API do Mercado Pago

**PlanFormDialog.tsx:**
- Adicionar campo `checkout_url` para o admin colar o link de checkout da Cakto

### 6. Criar pagina admin `/admin/enterprise-links`

Nova pagina no painel admin com:
- Tabela listando todos os links Enterprise criados
- Botao "Novo Link Enterprise" com formulario: nome do cliente, email, link de checkout, descricao do plano, valor, observacoes
- Acoes: editar, desativar, copiar link, deletar
- Adicionar item "Links Enterprise" na navegacao admin do DashboardLayout

### 7. Remover codigo do Mercado Pago

- Deletar edge functions: `create-mp-subscription`, `mercadopago-webhook`, `cancel-mp-subscription`, `get-mp-payments`
- Remover do config.toml
- Limpar referencias no frontend

### 8. Atualizar config.toml

Adicionar:
- `cakto-webhook` (verify_jwt = false)
- `cancel-cakto-subscription` (verify_jwt = false)

## Fluxo do usuario (Pro/Plus)

```text
Usuario clica "Fazer Upgrade"
  -> Frontend busca checkout_url do plano na tabela plans
  -> Redireciona para checkout Cakto (link externo)
  -> Usuario paga
  -> Cakto envia webhook -> edge function ativa subscription
```

## Fluxo Enterprise

```text
Cliente entra em contato via WhatsApp
  -> Admin cria produto na Cakto com valor personalizado
  -> Admin cadastra o link em /admin/enterprise-links
  -> Admin envia o link para o cliente
  -> Cliente paga -> webhook ativa como Enterprise
```
