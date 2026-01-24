
# Plano: Padronização de Elementos de Upgrade em Todo o Sistema

## Contexto e Análise

Após análise detalhada de todas as páginas e componentes, identifiquei **inconsistências visuais** nos elementos de upgrade em todo o app:

### Problemas Encontrados

| Local | Problema |
|-------|----------|
| **ProFeaturesCard** | Badge diz apenas "Pro", sem ícone de cadeado visível no badge do header |
| **PlusAICard** | Badge diz apenas "Plus", padrão OK mas sem "Plano" |
| **Reports (upgrade prompt)** | Badges dizem "Pro" e "Plus" sem cadeado, botão diz "Fazer Upgrade para Pro" |
| **Reports (cards funcionais)** | Badges "Pro" e "Plus" sem cadeado, PDF diz "Upgrade para Plus" |
| **TeamManagement** | Badge diz "Plano Enterprise" com Crown, mas sem Lock |
| **Dashboard upgrade card** | Texto "Ver Planos", sem indicação de plano específico |
| **Subscription** | Botões "Ver Planos" e "Fazer Upgrade" sem padronização |
| **PropertyLimitBanner** | Botão "Fazer Upgrade" genérico |

### Padrão Visual Proposto

Todos os elementos de upgrade devem seguir este padrão:

**1. Badges de Plano (indicadores de recurso bloqueado)**
```
┌─────────────────────┐
│ 🔒 Plano [Nome]     │  <- Badge outline com Lock + "Plano Pro/Plus/Enterprise"
└─────────────────────┘
```

**2. Botões de Upgrade (CTAs)**
```
┌─────────────────────────────┐
│ 👑 Upgrade para [Plano]     │  <- Button com Crown + "Upgrade para Pro/Plus"
└─────────────────────────────┘
```

**3. Cores por Plano**
- **Pro**: `text-primary` (padrão)
- **Plus**: `text-purple-600` / `bg-purple-500/10`
- **Enterprise**: `text-amber-600` / `bg-amber-500/10`

---

## Implementação Detalhada

### 1. Atualizar `LockedSection.tsx`
- Manter padrão atual (já está correto)
- Badge: `<Lock /> {planLabels[requiredPlan]}`
- Botão: `<Crown /> Upgrade`

### 2. Atualizar `ProFeaturesCard.tsx`
**Linha 84-87**: Alterar Badge
```tsx
// De:
<Badge variant="outline" className="gap-1 text-xs ml-auto">
  <Lock className="h-3 w-3" />
  Pro
</Badge>

// Para:
<Badge variant="outline" className="gap-1 text-xs ml-auto">
  <Lock className="h-3 w-3" />
  Plano Pro
</Badge>
```

**Linha 104-106**: Alterar botão de upgrade
```tsx
// De:
<Button size="sm" onClick={() => navigate('/plans')} className="gap-1.5">
  <Crown className="h-3.5 w-3.5" />
  Upgrade
</Button>

// Para:
<Button size="sm" onClick={() => navigate('/plans')} className="gap-1.5">
  <Crown className="h-3.5 w-3.5" />
  Upgrade para Pro
</Button>
```

### 3. Atualizar `PlusAICard.tsx`
**Linha 89-92**: Alterar Badge e adicionar cor roxa
```tsx
// De:
<Badge variant="outline" className="gap-1 text-xs ml-auto">
  <Lock className="h-3 w-3" />
  Plus
</Badge>

// Para:
<Badge variant="outline" className="gap-1 text-xs ml-auto bg-purple-500/10 text-purple-600 border-purple-200">
  <Lock className="h-3 w-3" />
  Plano Plus
</Badge>
```

**Linha 109-111**: Alterar botão de upgrade
```tsx
// De:
<Button size="sm" onClick={() => navigate('/plans')} className="gap-1.5">
  <Crown className="h-3.5 w-3.5" />
  Upgrade
</Button>

// Para:
<Button size="sm" onClick={() => navigate('/plans')} className="gap-1.5">
  <Crown className="h-3.5 w-3.5" />
  Upgrade para Plus
</Button>
```

### 4. Atualizar `Reports.tsx` - Prompt de Upgrade (não-Pro)
**Linha 443-445 e 453-455**: Adicionar Lock nos badges
```tsx
// De:
<Badge variant="outline" className="ml-auto">
  Pro
</Badge>

// Para:
<Badge variant="outline" className="ml-auto gap-1">
  <Lock className="h-3 w-3" />
  Plano Pro
</Badge>
```

```tsx
// Badge Plus:
<Badge variant="outline" className="ml-auto gap-1 bg-purple-500/10 text-purple-600 border-purple-200">
  <Lock className="h-3 w-3" />
  Plano Plus
</Badge>
```

**Linha 458-460**: Manter botão como está (já está bom)

### 5. Atualizar `Reports.tsx` - Cards de Exportação
**Linhas 624-626, 663-665, 702-704**: Adicionar Lock aos badges Pro
```tsx
// De:
<Badge variant="outline" className="text-xs">
  Pro
</Badge>

// Para:
<Badge variant="outline" className="text-xs gap-1">
  <Lock className="h-3 w-3" />
  Plano Pro
</Badge>
```

**Linha 741-743**: Badge Plus com cor
```tsx
// De:
<Badge variant="secondary" className="text-xs">
  Plus
</Badge>

// Para:
<Badge variant="outline" className="text-xs gap-1 bg-purple-500/10 text-purple-600 border-purple-200">
  <Lock className="h-3 w-3" />
  Plano Plus
</Badge>
```

**Linha 769-772**: Botão PDF upgrade
```tsx
// De:
<Button onClick={() => navigate('/plans')} className="w-full mt-4" variant="outline">
  <Lock className="mr-2 h-4 w-4" />
  Upgrade para Plus
</Button>

// Para (manter Lock no botão para consistência visual):
<Button onClick={() => navigate('/plans')} className="w-full mt-4" variant="outline">
  <Crown className="mr-2 h-4 w-4" />
  Upgrade para Plus
</Button>
```

### 6. Atualizar `TeamManagement.tsx`
**Linha 147-150**: Alterar badge para incluir Lock
```tsx
// De:
<Badge variant="outline" className="gap-1">
  <Crown className="h-3 w-3" />
  Plano Enterprise
</Badge>

// Para:
<Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-200">
  <Lock className="h-3 w-3" />
  Plano Enterprise
</Badge>
```

**Adicionar botão de upgrade** após o badge (linha ~150):
```tsx
<Button size="sm" onClick={() => navigate('/plans')} className="gap-1.5 mt-4">
  <Crown className="h-3.5 w-3.5" />
  Upgrade para Enterprise
</Button>
```

### 7. Atualizar `Dashboard.tsx` - Upgrade Prompt
**Linha 163-166**: Especificar plano no botão
```tsx
// De:
<Button onClick={() => navigate('/plans')} className="gap-2 shrink-0">
  <Crown className="h-4 w-4" />
  Ver Planos
</Button>

// Manter como "Ver Planos" pois é genérico e pode ir para Pro, Plus ou Enterprise
// O botão está OK
```

### 8. Atualizar `Subscription.tsx`
**Linha 249-252**: Botão de upgrade para starter
```tsx
// Manter como está - já está bom:
<Button onClick={() => navigate('/plans')} className="w-full gap-2">
  <Crown className="h-4 w-4" />
  Fazer Upgrade
</Button>
```

### 9. Atualizar `PropertyLimitBanner.tsx`
**Linha 58-60**: Mantido como genérico (OK)

---

## Resumo das Alterações

| Arquivo | Alteração |
|---------|-----------|
| `ProFeaturesCard.tsx` | Badge: "Plano Pro", Botão: "Upgrade para Pro" |
| `PlusAICard.tsx` | Badge: roxo + "Plano Plus", Botão: "Upgrade para Plus" |
| `Reports.tsx` | Badges com Lock + "Plano X", cores por tier |
| `TeamManagement.tsx` | Badge: âmbar + Lock + "Plano Enterprise", Adicionar botão upgrade |
| `LockedSection.tsx` | Já está correto - nenhuma mudança |

---

## Benefícios

1. **Consistência Visual**: Todos os badges de plano seguem o mesmo padrão `<Lock /> Plano [Nome]`
2. **Hierarquia de Cores**: Pro (primary), Plus (roxo), Enterprise (âmbar)
3. **CTAs Claros**: Botões sempre dizem "Upgrade para [Plano]" com ícone Crown
4. **Responsividade**: Todas as alterações mantêm o layout responsivo existente

---

## Detalhes Técnicos

### Imports Necessários
Verificar que `Lock` está importado em todos os arquivos que serão modificados:
- `Reports.tsx` - ✅ já importado
- `ProFeaturesCard.tsx` - ✅ já importado  
- `PlusAICard.tsx` - ✅ já importado
- `TeamManagement.tsx` - ✅ já importado

### Navegação para Upgrade
Todos os botões de upgrade navegam para `/plans` usando `useNavigate()` do react-router-dom.
