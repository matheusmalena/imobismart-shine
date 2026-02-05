
## Objetivo
Impedir que um imóvel seja criado “só com nome”, adicionando validações antes de salvar/criar, de acordo com o que você escolheu:
- Endereço mínimo obrigatório
- Valor do imóvel obrigatório
- Receita mensal obrigatória quando o status for “alugado”

## O que será considerado “válido”
### 1) Endereço mínimo (obrigatório)
O usuário deverá preencher **pelo menos uma das opções**:
- **CEP válido** (8 dígitos), ou
- **Rua + Número + Cidade + UF** (UF com 2 letras)

### 2) Valor do imóvel (obrigatório)
- `property_value` deve ser **maior que 0**

### 3) Receita se alugado (obrigatório condicional)
- Se `status === 'alugado'`, então `monthly_revenue` deve ser **maior que 0**

## Estratégia (cliente + “servidor”)
Para ficar robusto e seguro, vamos validar em dois pontos:

1) **Na UI (antes de clicar em “Criar/Salvar”)**
- Evita que o usuário perca tempo e dá feedback imediato.
- Mostra quais campos faltam e já leva o usuário para a aba correta.

2) **Na camada de persistência (hook `useProperties`)**
- Mesmo que algo escape pela UI (ou futuras telas), ainda bloqueia salvar dados inválidos no banco.
- Mantém regras centralizadas.

## Mudanças planejadas (arquivos)
### A) `src/components/properties/PropertyForm.tsx`
1. **Transformar o Tabs em “controlado”**
   - Hoje está `defaultValue="basic"`. Vamos criar um estado `activeTab` e passar `value={activeTab}` + `onValueChange={setActiveTab}`.
   - Isso permite: quando houver erro no endereço, por exemplo, automaticamente abrir a aba “Endereço”.

2. **Adicionar estado de erros do formulário**
   - Ex.: `const [errors, setErrors] = useState<Partial<Record<keyof PropertyFormData, string>>>({});`
   - E (se necessário) um erro “geral” para o endereço quando for regra composta (CEP OU Rua+Número+Cidade+UF).

3. **Validar no `handleSubmit` antes de fazer upload/salvar**
   - Validar:
     - `name.trim()` (já tem required, mas vamos reforçar com mensagem clara)
     - Endereço mínimo
     - `property_value > 0`
     - Se `status === 'alugado'` então `monthly_revenue > 0`
   - Se falhar:
     - `setErrors(...)`
     - Abrir a aba certa (`setActiveTab('financial')` para valor/receita, `setActiveTab('address')` para endereço)
     - Mostrar mensagem (toast + mensagem abaixo do campo) e **não** chamar `onSubmit`.

4. **Exibir mensagens de erro abaixo dos inputs relevantes**
   - Exibir texto em vermelho usando padrões já existentes (ex.: classes `text-destructive text-sm`).
   - Marcar inputs com `aria-invalid` quando houver erro.

5. **Limpar erro ao editar campos**
   - Ao mudar um campo, remover o erro daquele campo para UX melhor.

### B) `src/hooks/useProperties.ts`
1. **Adicionar validação “server-side” antes de inserir/atualizar**
   - Criar uma função utilitária (no próprio arquivo ou importada) que valide as mesmas regras e lance `Error` com mensagens claras.
   - Assim, mesmo que alguém chame `createProperty.mutate()` com dados incompletos, o backend não será chamado com dados inválidos.

2. **Normalização adicional**
   - `name: formData.name.trim()`
   - `address_state`: salvar em uppercase e trim (ex.: “sp” vira “SP”), quando vier preenchido
   - Garantir que valores numéricos não sejam negativos (já existe clamp para occupancy; vamos aplicar para `property_value` e `monthly_revenue` também, no mínimo `>= 0`)

## Regras de UX (como ficará na prática)
- Se tentar criar sem endereço: abre a aba **Endereço** e mostra exatamente o que falta.
- Se tentar criar sem valor: abre a aba **Financeiro** e mostra “Valor do imóvel é obrigatório”.
- Se marcar “Alugado” e não preencher receita: abre **Financeiro** e mostra “Receita mensal é obrigatória quando o imóvel está alugado”.
- Ainda permite cadastro enxuto, mas não “vazio”.

## Testes que eu vou fazer após implementar
1. Criar imóvel apenas com nome → deve bloquear e mostrar erro (Endereço + Valor).
2. Informar CEP válido + valor > 0 → deve permitir criar (sem rua/número/cidade/UF).
3. Informar Rua+Número+Cidade+UF + valor > 0 (sem CEP) → deve permitir criar.
4. Definir status “alugado” sem receita → deve bloquear (aba Financeiro).
5. Status “vago” com receita 0 → deve permitir (desde que valor e endereço estejam ok).
6. Editar imóvel existente: salvar sem mexer no endereço/valor → deve continuar funcionando se já estiver válido.

## Observações (sem mudanças no banco agora)
- Essas validações serão aplicadas no app sem exigir migração de banco.
- Se você quiser no futuro “forçar” isso também no banco (por exemplo, impedir qualquer inserção inválida via SQL), aí sim podemos discutir regras no backend (mas é uma etapa separada para não quebrar dados antigos).
