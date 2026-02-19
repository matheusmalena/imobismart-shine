
# Remover Cabecalho Superior e Adicionar Modo Noturno nas Configuracoes

## O que muda

1. **Remover o header/top bar** do `DashboardLayout.tsx` - a barra fixa no topo com o botao de tema e o botao de menu mobile
2. **Mover o botao de menu mobile** para dentro do conteudo (ou sidebar) para que continue funcional em telas pequenas
3. **Adicionar secao "Aparencia"** na pagina de Configuracoes com toggle de modo claro/escuro

## Detalhes Tecnicos

### Arquivo 1: `src/components/layout/DashboardLayout.tsx`
- Remover o bloco `<header>` (linhas 237-249) que contem o top bar sticky com ThemeToggle
- Mover o botao hamburguer (Menu) para um botao fixo/flutuante visivel apenas em mobile (`lg:hidden`), posicionado no topo do conteudo principal
- Remover import do `ThemeToggle`
- Ajustar o padding do conteudo principal removendo a compensacao do header (`sticky top-0 z-30 h-16`)

### Arquivo 2: `src/pages/Settings.tsx`
- Adicionar nova secao "Aparencia" entre "Seguranca" e "Assinatura"
- Card com icone de paleta/sol/lua
- Toggle switch entre modo Claro e Escuro usando o hook `useTheme` do ThemeProvider
- Importar `useTheme` de `@/components/ThemeProvider`
- Importar `Switch` de `@/components/ui/switch`
- Importar icones `Sun`, `Moon` ou `Palette` de lucide-react

### Layout do botao mobile
O botao hamburguer sera posicionado como um botao fixo no canto superior esquerdo, visivel apenas em mobile (`lg:hidden fixed top-4 left-4 z-30`), com fundo semi-transparente para manter visibilidade sobre o conteudo.

## Arquivos Modificados

| Arquivo | Alteracao |
|---------|----------|
| `src/components/layout/DashboardLayout.tsx` | Remover header, mover botao mobile para posicao fixa |
| `src/pages/Settings.tsx` | Adicionar card de Aparencia com toggle de tema |
