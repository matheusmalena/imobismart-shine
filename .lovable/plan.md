
# Padronizacao Visual Completa

## Problemas Encontrados

### 1. Subscription.tsx - Multiplas inconsistencias

| Problema | Estado Atual | Padrao Correto |
|----------|-------------|----------------|
| Botao "Voltar" | Presente no header | Nenhuma outra pagina interna tem botao voltar |
| Animacoes | `framer-motion` com variants | `animate-fade-in` (CSS class usada em todas as paginas) |
| Layout do header | Botao Voltar + titulo + botao Ver Planos em linha | `flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4` com titulo/subtitulo a esquerda e acao a direita |
| Nome do plano no card | `text-2xl font-bold` (muito grande) | `text-lg font-semibold` (proporcional ao card) |
| Container | `pb-8` (padding extra) | Sem padding extra (igual outras paginas) |
| Wrapper | `motion.div` | `div className="space-y-6 animate-fade-in"` |

### 2. Plans.tsx - Inconsistencias

| Problema | Estado Atual | Padrao Correto |
|----------|-------------|----------------|
| Botao "Voltar" | Presente | Remover (nenhuma pagina interna tem) |
| Titulo h1 | `text-3xl md:text-5xl` | `text-3xl font-bold text-foreground` (padrao) |
| Subtitulo | `text-lg` | `text-muted-foreground mt-1` sem tamanho extra |

### 3. Reports.tsx - Upgrade prompt (nao-Pro)

| Problema | Estado Atual | Padrao Correto |
|----------|-------------|----------------|
| Titulo do upgrade | `CardTitle text-2xl` (dentro do card) | Tamanho menor, consistente com UpgradeOverlay |
| Layout | Card centralizado com `max-w-2xl mx-auto py-12` | Usar layout padrao da pagina com header normal |

### 4. Settings.tsx - CardTitle sem override de tamanho

O componente `CardTitle` por padrao renderiza com `text-2xl`. Em Settings, os titulos "Informacoes Pessoais", "Seguranca", "Assinatura" ficam com `text-2xl` (padrao do componente), o que e consistente. Nenhuma mudanca necessaria aqui.

## Plano de Correcao

### Etapa 1: Reescrever header e remover animacoes do Subscription.tsx
- Remover botao "Voltar"
- Remover `framer-motion` (imports, variants, `motion.div`)
- Usar wrapper `div className="space-y-6 animate-fade-in"` padrao
- Header no padrao: titulo "Minha Assinatura" + subtitulo a esquerda, botao "Ver Planos" a direita
- Reduzir nome do plano de `text-2xl font-bold` para `text-lg font-semibold`
- Remover `pb-8` do container

### Etapa 2: Remover botao Voltar e ajustar titulo do Plans.tsx
- Remover botao "Voltar" da navegacao
- Manter botao "Minha Assinatura" mas mover para o header padrao como acao secundaria
- Reduzir h1 de `text-3xl md:text-5xl` para `text-3xl font-bold text-foreground`
- Ajustar subtitulo para `text-muted-foreground mt-1`

### Etapa 3: Ajustar upgrade prompt do Reports.tsx (nao-Pro)
- Reduzir `CardTitle` do prompt de upgrade para tamanho proporcional
- Manter centralizado mas com estilo visual alinhado ao padrao de banners de upgrade usado no Dashboard

## Arquivos Modificados

| Arquivo | Alteracao Principal |
|---------|-------------------|
| `src/pages/Subscription.tsx` | Remover framer-motion, botao voltar, padronizar header e tamanhos de texto |
| `src/pages/Plans.tsx` | Remover botao voltar, reduzir h1, padronizar header |
| `src/pages/Reports.tsx` | Ajustar tamanho do titulo no upgrade prompt |
