

## Problema
Hoje, a validacao de duplicidade depende apenas do banco de dados (indice unico). Porem, quando voce coloca **apenas o CPF repetido** (sem email), o sistema permite criar. Ja quando coloca **CPF + email repetidos juntos**, ele bloqueia. Isso acontece porque a mensagem de erro do banco pode nao estar sendo capturada corretamente em todos os casos.

## Solucao
Adicionar uma **validacao no frontend antes de enviar pro banco**, usando a lista de inquilinos que ja esta carregada na memoria. Assim o bloqueio e imediato e nao depende do formato da mensagem de erro do banco.

### O que vai mudar

**Arquivo: `src/hooks/useTenants.ts`**

Antes de fazer o `insert` ou `update`, o codigo vai:
1. Normalizar o CPF digitado (so numeros) e o email (lowercase)
2. Comparar com todos os inquilinos ja carregados na lista
3. Se encontrar outro inquilino com o mesmo CPF -> bloquear com mensagem "Ja existe um inquilino cadastrado com este CPF."
4. Se encontrar outro inquilino com o mesmo email -> bloquear com mensagem "Ja existe um inquilino cadastrado com este email."
5. No caso de edicao, ignora o proprio inquilino na comparacao (para nao bloquear a si mesmo)

Isso garante que:
- Colocar **apenas CPF repetido** -> bloqueia
- Colocar **apenas email repetido** -> bloqueia
- Colocar **CPF + email repetidos** -> bloqueia
- O indice unico no banco continua como camada extra de seguranca

### Detalhes tecnicos

No `createTenant.mutationFn`, antes do `supabase.from('tenants').insert(...)`:
- Verifica se `normalizedCpf` ja existe em algum tenant da lista `tenants` (comparando com `tenant.cpf`)
- Verifica se `normalizedEmail` ja existe em algum tenant da lista `tenants` (comparando com `tenant.email?.toLowerCase()`)
- Se encontrar, faz `throw new Error('tenants_user_cpf_uniq')` ou `throw new Error('tenants_user_email_uniq')` para que o `onError` existente ja trate corretamente

No `updateTenant.mutationFn`, mesma logica porem filtrando o inquilino atual (`tenant.id !== id`).

Nenhum outro arquivo precisa ser alterado.
