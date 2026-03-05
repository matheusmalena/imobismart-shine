

# Ajustes de Imagens e Visual da Landing Page

## Problemas Identificados

1. **Imagens PNG pesadas** — Os screenshots usam `.png` (grandes) quando existem versões `.jpg` disponíveis em `public/images/`. Isso causa carregamento lento.
2. **Imagens desatualizadas** — Os screenshots podem não refletir o estado atual do sistema; isso requer gerar novos screenshots manualmente. Por ora, otimizaremos o carregamento.
3. **Tutorial Modal com imagens apagadas** — O overlay com `bg-gradient-to-t from-background` cobre muito da imagem, e `?v=2&t=` nos URLs pode causar cache-busting desnecessário.
4. **Seção Social Proof fraca** — Texto pequeno, pouco destaque visual, sem ícones decorativos. Precisa de mais impacto.
5. **Imagens com `loading="lazy"` na seção de tabs** — Causa delay visível quando o usuário troca de tab.
6. **Responsividade** — Verificar que as seções ficam bem em mobile.

## Mudanças Planejadas

### 1. Trocar PNGs por JPGs + preload das imagens críticas (`Index.tsx`)
- Usar `.jpg` em vez de `.png` em todos os `featureTabs` e no hero (JPG é significativamente menor)
- Remover `loading="lazy"` das imagens de tabs (elas precisam estar prontas ao clicar)
- Adicionar preload de todas as 4 imagens no `useEffect` com `new Image().src` para garantir carregamento antecipado
- Hero image: `loading="eager"` já está correto, trocar para `.jpg`

### 2. Melhorar visual da seção Social Proof (`Index.tsx`)
- Adicionar ícones decorativos para cada métrica (Users, Building2, Shield, Star)
- Aumentar tamanho dos números e melhorar contraste
- Adicionar cards com fundo e borda para cada item em vez de texto solto
- Adicionar um gradiente sutil de fundo

### 3. Corrigir Tutorial Modal (`TutorialModal.tsx`)
- Trocar imagens para `.jpg`
- Remover query strings desnecessárias (`?v=2&t=`)
- Reduzir intensidade do gradiente overlay para as imagens ficarem mais visíveis
- Aumentar altura da imagem de `h-48` para `h-56`

### 4. Preload global de imagens
- No componente Index, adicionar um `useEffect` que pré-carrega todas as imagens JPG ao montar, eliminando delay ao navegar entre tabs ou abrir o tutorial

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/Index.tsx` | Trocar PNGs→JPGs, preload, melhorar Social Proof visual |
| `src/components/onboarding/TutorialModal.tsx` | Trocar PNGs→JPGs, corrigir overlay, remover query strings |

