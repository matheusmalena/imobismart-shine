
# Plano de Reestruturação dos Planos de Assinatura

## Resumo Executivo

A plataforma possui 4 planos definidos no banco de dados: **Gratuito (starter)**, **Pro**, **Plus** e **Enterprise**. No entanto, existem inconsistências significativas na implementação que precisam ser corrigidas para que cada plano funcione corretamente com suas funcionalidades específicas.

---

## Problemas Identificados

### 1. Inconsistência de Nomenclatura
O código usa `isEnterprise` para verificar planos **Plus E Enterprise** juntos, o que causa confusão:
- `isEnterprise = plan === 'enterprise' || plan === 'plus'`
- Isso faz com que recursos "Plus" sejam rotulados como "Enterprise" na UI

### 2. Team Management só aceita 'enterprise'
O componente `TeamManagement.tsx` verifica apenas `subscription?.plan === 'enterprise'`, excluindo usuários Plus que deveriam ter algum nível de acesso.

### 3. Falta de granularidade entre Plus e Enterprise
Atualmente Plus e Enterprise são tratados igualmente para a maioria das funcionalidades, mas Enterprise deveria ter recursos exclusivos como:
- Múltiplos usuários/equipe
- Integrações personalizadas
- Gerente de conta dedicado

### 4. Labels incorretas no Dashboard
O método `getPlanLabel()` retorna "Plus" para plano 'enterprise' em vez de "Enterprise".

---

## Matriz de Funcionalidades por Plano

| Funcionalidade | Gratuito | Pro | Plus | Enterprise |
|----------------|----------|-----|------|------------|
| **Limite de Imóveis** | 2 | 25 | 50 | Ilimitado |
| **Dashboard Básico** | ✅ | ✅ | ✅ | ✅ |
| **Métricas Avançadas (ROI, Valor Portfólio)** | ❌ | ✅ | ✅ | ✅ |
| **Insights e Alertas** | ❌ | ✅ | ✅ | ✅ |
| **Exportar CSV/JSON** | ❌ | ✅ | ✅ | ✅ |
| **Relatórios PDF** | ❌ | ❌ | ✅ | ✅ |
| **IA com Recomendações Mensais** | ❌ | ❌ | ✅ | ✅ |
| **Múltiplos Usuários/Equipe** | ❌ | ❌ | ❌ | ✅ |
| **Suporte Prioritário** | ❌ | ✅ | ✅ | ✅ |
| **Suporte 24/7** | ❌ | ❌ | ✅ | ✅ |
| **Gerente Dedicado** | ❌ | ❌ | ❌ | ✅ |

---

## Alterações Planejadas

### Etapa 1: Atualizar Hook `useUserData.ts`

Adicionar flags mais granulares para cada nível de plano:

```typescript
const plan = subscription?.plan || 'starter';
const isStarter = plan === 'starter';
const isPro = plan === 'pro' || plan === 'plus' || plan === 'enterprise';
const isPlus = plan === 'plus' || plan === 'enterprise';
const isEnterprise = plan === 'enterprise';
```

Isso permite verificações precisas:
- `isPro` - tem Pro ou superior
- `isPlus` - tem Plus ou superior
- `isEnterprise` - tem apenas Enterprise (exclusivo)

### Etapa 2: Corrigir `DashboardLayout.tsx`

- Manter `!isPro` para badge de Export
- Usar `!isPlus` para badge de Relatórios PDF
- Usar `!isEnterprise` para badge de Equipe

### Etapa 3: Atualizar `Dashboard.tsx`

- Corrigir `getPlanLabel()` para mostrar o nome correto de cada plano
- Adicionar seção exclusiva Plus para IA com recomendações
- Separar claramente recursos Pro vs Plus

### Etapa 4: Corrigir `Export.tsx`

- Atualizar para usar `useUserData` com as novas flags
- Manter acesso para Pro+

### Etapa 5: Corrigir `Reports.tsx`

- Usar `isPlus` em vez de `isEnterprise`
- Mostrar "Disponível no Plano Plus" corretamente

### Etapa 6: Atualizar `TeamManagement.tsx`

- Usar verificação `isEnterprise` (apenas enterprise verdadeiro)
- Manter exclusivo para Enterprise

### Etapa 7: Atualizar `Settings.tsx` (comparação de planos)

- Garantir que a comparação mostre corretamente as diferenças

---

## Detalhes Técnicos

### Arquivo: `src/hooks/useUserData.ts`

Adicionar novas propriedades retornadas:
- `isStarter`: boolean
- `isPlus`: boolean (novo - Plus ou Enterprise)
- Ajustar `isEnterprise` para ser exclusivo

### Arquivo: `src/components/layout/DashboardLayout.tsx`

Atualizar imports e verificações de badges:
- Export: `!isPro`
- Relatórios PDF: `!isPlus`
- Equipe: `!isEnterprise`

### Arquivo: `src/pages/Dashboard.tsx`

Atualizar `getPlanLabel()`:
```typescript
const getPlanLabel = () => {
  switch (plan) {
    case 'enterprise': return 'Enterprise';
    case 'plus': return 'Plus';
    case 'pro': return 'Pro';
    default: return 'Gratuito';
  }
};
```

Adicionar seção de recursos Plus quando aplicável.

### Arquivo: `src/pages/Export.tsx`

- Substituir hook useSubscription por useUserData
- Usar isPro para verificação

### Arquivo: `src/pages/Reports.tsx`

- Substituir hook useSubscription por useUserData
- Usar isPlus para verificação
- Atualizar texto de upgrade para "Plus"

### Arquivo: `src/components/team/TeamManagement.tsx`

- Usar useUserData com isEnterprise (exclusivo)
- Manter como recurso apenas Enterprise

---

## Testes de Verificação

Após implementação, validar:

1. **Usuário Gratuito (starter)**:
   - Vê badges de lock em Export, Relatórios, Equipe
   - Limite de 2 imóveis
   - Métricas avançadas bloqueadas

2. **Usuário Pro**:
   - Acesso a Export e Insights
   - Vê badge de lock em Relatórios e Equipe
   - Limite de 25 imóveis

3. **Usuário Plus**:
   - Acesso a Export, Insights, Relatórios PDF
   - Vê badge de lock apenas em Equipe
   - Limite de 50 imóveis

4. **Usuário Enterprise**:
   - Acesso completo a todas funcionalidades
   - Gerenciamento de equipe disponível
   - Imóveis ilimitados

---

## Resumo de Arquivos a Modificar

1. `src/hooks/useUserData.ts` - Adicionar isStarter e isPlus
2. `src/components/layout/DashboardLayout.tsx` - Ajustar verificações de badges
3. `src/pages/Dashboard.tsx` - Corrigir labels e adicionar seções Plus
4. `src/pages/Export.tsx` - Usar useUserData
5. `src/pages/Reports.tsx` - Usar isPlus em vez de isEnterprise
6. `src/components/team/TeamManagement.tsx` - Manter isEnterprise exclusivo
7. `src/pages/Settings.tsx` - Revisar comparação de planos (se necessário)
