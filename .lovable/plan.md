

## Auditoria Completa do ImobiSmart

### 1. Código "TEMPORÁRIO" esquecido em produção (Prioridade Alta)

**Problema:** Há código de debug/screenshots que nunca foi revertido, criando vulnerabilidades e comportamento incorreto.

| Arquivo | Problema |
|---|---|
| `src/pages/Properties.tsx` (L58-63) | Redirect de auth comentado — usuários não-logados podem ver a página |
| `src/pages/Documents.tsx` (L36-41) | Mesmo problema — redirect de auth comentado |
| `src/pages/Settings.tsx` (L97-105) | Dados mock (`mockUser`, `mockProfile`, `mockSubscription`) exibidos quando dados reais são `null`, mascarando erros e mostrando info falsa ("João da Silva", plano "Pro") |

**Correção:** Reativar redirects de auth em Properties e Documents. Remover mock data de Settings e usar dados reais com fallback adequado.

---

### 2. Página Plans com DashboardLayout duplicado (Prioridade Média)

**Problema:** `Plans.tsx` (L254) renderiza `<DashboardLayout>` manualmente, mas a rota `/plans` em `App.tsx` (L60) está **fora** do `DashboardLayoutRoute`. Isso significa que a página Plans não tem sidebar/layout quando acessada normalmente. No entanto, o loading state (L163) também wrapa com `<DashboardLayout>`, criando inconsistência.

A página deveria estar dentro do `DashboardLayoutRoute` **ou** usar o layout manualmente de forma consistente (inclusive nos early returns para non-owner e loading).

**Correção:** Mover `/plans` para dentro do bloco `<Route element={<DashboardLayoutRoute />}>` e remover o `<DashboardLayout>` manual de Plans.tsx. Ajustar os early returns (isOrgMemberNotOwner, loading) para não wrapparem com DashboardLayout.

---

### 3. Falta de proteção de rota centralizada (Prioridade Alta)

**Problema:** A verificação de autenticação é feita manualmente em cada página com `useEffect` + `navigate('/auth')`, e algumas páginas (Properties, Documents) têm essa verificação **comentada**. Outras páginas (WhatsApp, Team) não têm nenhuma verificação.

**Correção:** Criar um componente `ProtectedRoute` no `DashboardLayoutRoute` que verifica autenticação uma vez, centralizando a lógica e eliminando a necessidade de verificar em cada página.

---

### 4. Inconsistências de estilo entre páginas

| Página | Problema |
|---|---|
| `Subscription.tsx` | Não usa `<PageTransition>`, usa `<>` fragment como wrapper |
| `Plans.tsx` | Usa `<DashboardLayout>` diretamente, sem `<PageTransition>` |
| `Dashboard.tsx` | Usa `animate-fade-in` + `<PageTransition>` (redundante) |
| `Settings.tsx` | Usa `animate-fade-in` + `<PageTransition>` (redundante) |
| `Documents.tsx` | Usa `animate-fade-in` + `<PageTransition>` (redundante) |

**Correção:** Padronizar: todas as páginas dentro do dashboard devem usar `<PageTransition>` e remover `animate-fade-in` duplicado.

---

### 5. Settings.tsx cancelar assinatura duplicado

**Problema:** A página Settings tem um botão "Cancelar Assinatura" (L337-368) que chama `cancelSubscription.mutateAsync()` do hook `useSubscription`. A página Subscription.tsx **também** tem um botão de cancelamento que chama a edge function `cancel-cakto-subscription`. São dois mecanismos diferentes de cancelamento, potencialmente com comportamentos distintos.

**Correção:** Remover a seção de cancelamento de Settings (a gestão completa de assinatura já está em `/subscription`) ou unificar a lógica usando a mesma edge function em ambos.

---

### 6. Subscription.tsx — import vazio (Prioridade Baixa)

**Problema:** L30 tem um import vazio: `  \n  CreditCard,` — provavelmente sobrou de uma remoção de ícone.

**Correção:** Limpar o import.

---

### 7. Responsividade — Filtros em Properties e Documents

**Problema:** Os `SelectTrigger` têm larguras fixas (`w-[140px]`, `w-[160px]`, `w-[200px]`) que podem cortar texto em telas pequenas e não se adaptam bem ao mobile.

**Correção:** Usar `w-full sm:w-[160px]` para que os selects ocupem 100% no mobile.

---

### 8. Segurança — Rate limiting apenas client-side no Auth

**Problema:** `Auth.tsx` (L19-48) implementa rate limiting com um `Map` em memória do browser. Isso é facilmente burlável — basta recarregar a página. O rate limit server-side (`check_rate_limit` RPC) existe no banco mas não é visível sendo usado no Auth.

**Correção:** Verificar se o `check_rate_limit` RPC está sendo chamado no fluxo de login/signup. Caso contrário, adicionar chamada ao RPC antes de `signInWithPassword`.

---

### 9. AcceptInvite — Role "financial" sem uso

**Problema:** `AcceptInvite.tsx` (L22-26) define `ROLE_LABELS` com um papel "financial" que não existe no enum `org_member_role` do banco (que tem owner, admin, operator).

**Correção:** Remover "financial" e manter apenas os papéis válidos.

---

### Resumo de Ações

| # | Ação | Arquivos | Prioridade |
|---|---|---|---|
| 1 | Reativar auth redirects e remover mocks | Properties, Documents, Settings | Alta |
| 2 | Corrigir layout duplicado de Plans | Plans.tsx, App.tsx | Média |
| 3 | Centralizar proteção de rota | DashboardLayoutRoute | Alta |
| 4 | Padronizar PageTransition | Subscription, Plans, Dashboard, Settings, Documents | Baixa |
| 5 | Remover cancelamento duplicado de Settings | Settings.tsx | Média |
| 6 | Limpar import vazio | Subscription.tsx | Baixa |
| 7 | Responsividade dos filtros | Properties, Documents | Média |
| 8 | Validar rate limit server-side no auth | Auth.tsx | Alta |
| 9 | Remover role "financial" inválido | AcceptInvite.tsx | Baixa |

