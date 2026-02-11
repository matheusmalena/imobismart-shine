

# Corrigir Layout dos Cards e Padronizar CTAs de Upgrade

## Problemas Identificados

### 1. Card "Status dos Imoveis" (OccupancyChart)
- Usa `div` manual em vez do componente `Card` padrao, causando inconsistencia visual
- Conteudo colado no topo (sem espacamento adequado)
- Grafico donut centralizado verticalmente mas sem preenchimento inferior

### 2. Card "Recomendacoes IA" (PlusAICard)
- O overlay de upgrade fica flutuando no topo porque o conteudo borrado por tras e pequeno
- O `CardContent` nao tem altura minima, entao o overlay fica comprimido

### 3. Falta de padrao visual nos CTAs de Upgrade
Atualmente existem **4 implementacoes diferentes** do overlay/banner de upgrade:
- `LockedSection.tsx` -- overlay com blur, icone Lock, botao com Crown
- `PlusAICard.tsx` -- overlay com blur, icone Sparkles, botao com Crown (cor diferente do badge)
- `ProFeaturesCard.tsx` -- overlay com blur, icone Lock, botao com Crown
- `PropertyLimitBanner.tsx` -- banner horizontal, sem blur
- `UnarchiveBlockedDialog.tsx` -- dialog modal

Cada um usa cores, tamanhos e estilos ligeiramente diferentes.

## Solucao

### Etapa 1: Criar componente `UpgradeOverlay` reutilizavel
Novo componente em `src/components/common/UpgradeOverlay.tsx` que padroniza:
- Fundo com `backdrop-blur-md` e `bg-card/80`
- Icone centralizado no topo (customizavel)
- Titulo + descricao
- Botao seguindo o padrao: `<Crown /> Upgrade para [Plano]`
- Badge no header seguindo: `<Lock /> Plano [Nome]`
- Cores por plano: Pro (primary), Plus (purple), Enterprise (amber)

### Etapa 2: Corrigir OccupancyChart
- Substituir `div` wrapper por componentes `Card`, `CardHeader`, `CardContent`
- Manter o layout horizontal (donut + legenda lado a lado, conforme memoria do projeto)
- Garantir espacamento consistente com os demais cards

### Etapa 3: Corrigir PlusAICard
- Adicionar `min-h-[220px]` no `CardContent` para que o overlay tenha espaco suficiente
- Substituir overlay inline pelo novo `UpgradeOverlay`
- Manter badge purple para Plus

### Etapa 4: Atualizar ProFeaturesCard
- Substituir overlay inline pelo `UpgradeOverlay`

### Etapa 5: Atualizar LockedSection
- Substituir overlay inline pelo `UpgradeOverlay`

## Arquivos Modificados

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/common/UpgradeOverlay.tsx` | **Novo** -- componente reutilizavel |
| `src/components/dashboard/OccupancyChart.tsx` | Migrar para Card, ajustar espacamento |
| `src/components/dashboard/PlusAICard.tsx` | Usar UpgradeOverlay, min-height |
| `src/components/dashboard/ProFeaturesCard.tsx` | Usar UpgradeOverlay |
| `src/components/dashboard/LockedSection.tsx` | Usar UpgradeOverlay |

Nota: `PropertyLimitBanner` e `UnarchiveBlockedDialog` nao serao alterados pois sao formatos diferentes (banner e dialog) que fazem sentido no contexto onde aparecem.
