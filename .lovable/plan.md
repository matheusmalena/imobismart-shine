
## Objetivo
Impedir que você cadastre o mesmo inquilino mais de uma vez **na mesma conta**, garantindo:
- **CPF não pode repetir** dentro da mesma conta
- **Email não pode repetir** dentro da mesma conta
- Em **contas diferentes** (ex.: você e seu amigo), pode repetir normalmente

Além disso, vou corrigir um detalhe de UX comum: quando abrir "Novo Inquilino" novamente, o formulário deve vir limpo (para não facilitar duplicação acidental).

---

## Diagnóstico do que está acontecendo hoje
- O app atualmente **não tem nenhuma trava de unicidade** (nem no frontend, nem no banco) para CPF/Email em `tenants`.
- Isso permite cadastrar múltiplos inquilinos com o mesmo CPF/email na mesma conta.
- Como o CPF pode estar salvo com máscara (ex.: `000.000.000-00`), mesmo que você tente "comparar", formatos diferentes podem passar. Então precisamos **normalizar**.

---

## Solução (em 2 camadas: app + banco)
### Camada 1) Banco de dados (a garantia de verdade)
Vamos criar regras de unicidade por conta (user_id) no banco:

1) **Normalização dos dados existentes (migração)**
- Atualizar `tenants.email` para `lower(email)` (quando não for null).
- Atualizar `tenants.cpf` removendo tudo que não for número (quando não for null).
  - Ex.: `123.456.789-09` vira `12345678909`

2) **Criar índices únicos parciais**
- CPF único por `user_id` quando CPF estiver preenchido:
  - `UNIQUE (user_id, cpf) WHERE cpf IS NOT NULL AND cpf <> ''`
- Email único por `user_id` quando email estiver preenchido:
  - `UNIQUE (user_id, email) WHERE email IS NOT NULL AND email <> ''`

Isso garante:
- Você não consegue duplicar dentro da sua conta.
- Outra conta (outro user_id) pode ter o mesmo CPF/email, sem problema.

Observação importante: como a tabela também tem `organization_id`, eu vou manter a regra "por conta" como você pediu (por `user_id`). Se no futuro você quiser que o bloqueio seja por organização (todos os membros), a gente muda o índice para usar `organization_id` em vez de `user_id`.

---

### Camada 2) App (mensagem amigável + normalização antes de salvar)
#### A) Normalizar CPF/Email antes de inserir/atualizar (no `useTenants`)
- Antes do `insert/update`, normalizar:
  - `email = email.trim().toLowerCase()` ou null
  - `cpf = cpf.replace(/\D/g,'')` ou null
- Isso evita que:
  - "Mesma pessoa" passe por formato diferente de CPF
  - Email com letras maiúsculas duplique

#### B) Tratamento de erro amigável (quando bater no índice único)
Quando o banco rejeitar por duplicidade, o app vai mostrar uma mensagem clara, por exemplo:
- "Já existe um inquilino cadastrado com este CPF."
- "Já existe um inquilino cadastrado com este email."

(Em vez de só "Erro ao cadastrar inquilino".)

#### C) UX: limpar o formulário ao abrir "Novo Inquilino"
No `TenantFormDialog`, hoje o reset depende de mudar `tenant`. Quando você abre novamente e `tenant` continua `null`, o formulário pode manter o que foi digitado antes.
Vou ajustar para:
- Sempre que `open` virar `true` e `tenant` for `null`, resetar para valores vazios.
Isso reduz muito a chance de duplicação acidental.

---

## Arquivos que serão alterados
1) **Banco (migração)**
- `supabase/migrations/...sql`
  - Normalizar dados existentes (cpf/email)
  - Criar índices únicos parciais

2) **Frontend**
- `src/hooks/useTenants.ts`
  - Normalizar CPF/Email antes de salvar
  - Melhorar mensagens de erro para duplicidade

- `src/components/tenants/TenantFormDialog.tsx`
  - Garantir reset do formulário ao abrir "Novo Inquilino" (open=true, tenant=null)

Opcional (se fizer sentido depois):
- Ajustar exibição do CPF no formulário para continuar aparecendo mascarado mesmo estando salvo "limpo".
  - Isso pode ser feito formatando no `reset` e/ou no card/lista.

---

## Casos de teste (o que você poderá validar no final)
1) Cadastrar um inquilino com CPF X e email Y → OK
2) Tentar cadastrar outro inquilino com **mesmo CPF X** → deve bloquear e avisar "CPF já cadastrado"
3) Tentar cadastrar outro inquilino com **mesmo email Y** (mesmo com letras maiúsculas) → deve bloquear e avisar "Email já cadastrado"
4) Abrir "Novo Inquilino" depois de salvar um → formulário deve abrir limpo
5) Em outra conta (seu amigo), cadastrar o mesmo CPF/email → deve permitir

---

## Riscos e como vou evitar
- **Migração falhar por duplicados já existentes**: antes de criar o índice único, vou normalizar e (se necessário) detectar duplicidades. Se o banco encontrar duplicados pós-normalização, vou te informar quais são para você decidir (mesclar/remover) antes de aplicar o índice.
- **CPF salvo com máscara hoje**: ao normalizar, ele ficará só números. Vou manter o input com máscara, mas salvando "limpo" e exibindo mascarado no form.

---

## Entrega final
- Você não conseguirá mais duplicar CPF/email na mesma conta.
- O formulário não "carrega" os dados do último cadastro ao abrir um novo.
- Mensagens de erro ficam claras e objetivas para o usuário final.
