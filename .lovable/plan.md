
# Automacao Enterprise: Vincular Cliente por Email

## Problema Atual
O webhook da Cakto identifica o plano pelo nome do produto (precisa conter "enterprise"). Isso e fragil — se o admin escrever o nome errado na Cakto, o plano nao e ativado corretamente. Alem disso, o campo "ID Externo" no EditSubscriptionDialog e desnecessario para a maioria dos casos.

## Solucao

### 1. Melhorar o webhook para consultar a tabela `enterprise_checkout_links`

Quando o webhook receber um pagamento e NAO conseguir determinar o plano pelo nome do produto, ele vai consultar a tabela `enterprise_checkout_links` pelo `client_email` do comprador. Se encontrar um registro ativo, ativa o plano Enterprise automaticamente.

Fluxo atualizado do webhook:

```text
Webhook recebe pagamento
  |
  v
Tenta determinar plano pelo nome do produto
  |
  +--> Nome contem "enterprise" --> plano = enterprise
  +--> Nome contem "plus" --> plano = plus
  +--> Nome contem "pro" --> plano = pro
  +--> Nome contem "starter" --> plano = starter
  +--> Nenhum match --> consulta enterprise_checkout_links pelo email
        |
        +--> Encontrou registro ativo --> plano = enterprise
        +--> Nao encontrou --> plano = free (fallback)
```

### 2. Simplificar o EditSubscriptionDialog

Remover o campo "ID Externo (Cakto / Produto)" ja que nao e necessario. Manter apenas o campo "Email do Pagador" para rastreabilidade.

### 3. Atualizar a pagina Enterprise Links

Adicionar um indicador visual de "vinculado" quando o email do link corresponde a um usuario ativo com plano enterprise no sistema.

## Arquivos Modificados

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/cakto-webhook/index.ts` | Adicionar consulta a `enterprise_checkout_links` como fallback para determinar plano |
| `src/components/admin/EditSubscriptionDialog.tsx` | Remover campo `externalId`, simplificar |

## Resultado Final

O passo a passo para o admin fica:

1. Crie o produto na Cakto (qualquer nome)
2. Cadastre o link na pagina "Links Enterprise" com o nome, email e link de checkout do cliente
3. Envie o link ao cliente
4. Cliente paga, webhook ativa Enterprise automaticamente pelo email

Nao precisa copiar ID, nao precisa editar assinatura manualmente, nao depende do nome do produto conter "enterprise".
