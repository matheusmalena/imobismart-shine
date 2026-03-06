

## Plan: Repaginar a Landing Page do ImobiSmart

### Situação Atual
A landing page já tem uma boa estrutura (hero, social proof, como funciona, funcionalidades, público-alvo, preços, depoimentos, FAQ, CTA, footer), mas o hero exibe screenshots dentro de screenshots (dupla moldura de browser), e o visual geral pode ser mais impactante e profissional para converter visitantes.

### Mudanças Propostas

**1. Hero Section - Visual Premium** (`src/pages/Index.tsx`)
- Remover a dupla moldura de browser (há dois wrappers com dots) e usar apenas uma moldura limpa
- Adicionar um leve efeito de perspectiva/rotação 3D no screenshot para dar profundidade (CSS transform)
- Melhorar o glow/shadow ao redor da imagem para dar destaque
- Ajustar os floating badges para não sobrepor o screenshot duplicado

**2. Seção "Veja na prática" - Mais Imersiva** (`src/pages/Index.tsx`)
- Adicionar mais abas: Inquilinos, WhatsApp e Relatórios (com screenshots correspondentes)
- Remover a moldura duplicada de browser que está aparecendo
- Usar uma única moldura de browser limpa com o screenshot real

**3. Seção Benefits - Com Screenshot Real** (`src/pages/Index.tsx`)
- Substituir os 4 cards de ícones (Na nuvem, Responsivo, etc.) por um screenshot real da tela de Imóveis ou Dashboard em perspectiva, para reforçar visualmente o produto

**4. CTA Final - Mais Impactante** (`src/pages/Index.tsx`)
- Adicionar um screenshot sutil de fundo no CTA final com overlay gradient
- Reforçar o senso de urgência com texto mais direto

**5. Novas Imagens de Funcionalidades** 
- Adicionar screenshots para as abas que ainda não têm: Inquilinos, WhatsApp, Relatórios (reutilizando imagens existentes ou adicionando referências a novas que serão capturadas)
- Garantir que os `.png` existentes são usados consistentemente

**6. Melhorias Visuais Globais** (`src/pages/Index.tsx`)
- Adicionar animações sutis de scroll (fade-in nos sections ao entrar na viewport)
- Melhorar espaçamentos entre seções
- Garantir que as abas de funcionalidades tenham transição suave entre screenshots

### Arquivos Editados
- `src/pages/Index.tsx` - Hero, funcionalidades, benefits, CTA
- `src/index.css` - Animações de scroll e efeitos 3D (se necessário)

