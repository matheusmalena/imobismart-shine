

## Plano: Bloquear assinatura e planos para membros não-proprietários Enterprise

### Mudanças

#### 1. `src/pages/Settings.tsx` — Esconder seção "Assinatura"
Importar `useOrganization` e verificar se o usuário é membro de organização mas não é owner. Se sim, esconder completamente o card de Assinatura (linhas 269-381) e ajustar o subtítulo do header para não mencionar "assinatura".

#### 2. `src/pages/Plans.tsx` — Bloquear página inteira
Importar `useOrganization` e `LockedPagePlaceholder`. Se o usuário for membro não-owner, renderizar placeholder com mensagem "Apenas o proprietário da conta pode gerenciar planos e assinatura" em vez do conteúdo normal.

### Arquivos

| Arquivo | Mudança |
|---|---|
| `src/pages/Settings.tsx` | Esconder card de Assinatura para membros não-owner |
| `src/pages/Plans.tsx` | Bloquear página com `LockedPagePlaceholder` para não-owners |

