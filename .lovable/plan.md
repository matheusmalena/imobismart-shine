

## Plano: Bloquear página de Assinatura para membros não-proprietários da organização Enterprise

### Problema
Qualquer membro da equipe Enterprise pode acessar `/subscription` e potencialmente cancelar o plano. Apenas o **owner** da organização deveria ter acesso.

### Solução

#### 1. `src/pages/Subscription.tsx` — Bloquear acesso para membros não-owner
No topo do componente, usar `useOrgPermissions` e `useOrganization` para verificar se o usuário pertence a uma organização e **não é o owner**. Se for o caso, renderizar o `LockedPagePlaceholder` com mensagem explicando que apenas o proprietário pode gerenciar a assinatura.

```tsx
import { useOrganization } from '@/hooks/useOrganization';

// No início do componente:
const { organization, userRole } = useOrganization();
const isOrgMemberNotOwner = !!organization && userRole !== 'owner';

if (isOrgMemberNotOwner) {
  return <LockedPagePlaceholder ... />;
}
```

#### 2. `src/components/layout/DashboardLayout.tsx` — Esconder link "Assinatura" no menu
Filtrar o item `Assinatura` da navegação lateral quando o usuário for membro de organização mas não for owner. Usar o mesmo hook `useOrganization` já disponível ou importá-lo.

```tsx
const filteredNavigation = navigation.filter(item => {
  if (item.href === '/subscription' && organization && userRole !== 'owner') {
    return false;
  }
  return true;
});
```

### Arquivos

| Arquivo | Mudança |
|---|---|
| `src/pages/Subscription.tsx` | Adicionar guard com `LockedPagePlaceholder` para não-owners |
| `src/components/layout/DashboardLayout.tsx` | Filtrar item "Assinatura" do menu para não-owners |

