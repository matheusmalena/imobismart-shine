

# Screenshots Atualizados + Parallax na Landing Page

## 1. Gerar Screenshots Atualizados

Vou usar as ferramentas de browser para:
- Navegar para cada tela do sistema (dashboard, imóveis, documentos, configurações) no preview
- Capturar screenshots atualizados de cada tela
- Fazer upload das imagens para o storage do backend (bucket público)
- Atualizar as referências em `Index.tsx` e `TutorialModal.tsx` para usar as novas URLs

**Pré-requisito:** Será necessário estar logado no preview para acessar as telas internas. Vou pedir para você fazer login antes de capturar.

**Nota:** As imagens serão salvas no storage do backend em um bucket público `landing-assets`, garantindo carregamento rápido via CDN.

## 2. Animações de Parallax no Scroll

Adicionar efeito parallax suave usando CSS `transform: translateY()` controlado por `IntersectionObserver` + scroll listener, sem dependências extras.

**Elementos com parallax:**
- Blobs decorativos do hero (movem mais devagar que o scroll)
- Floating badges do hero (ROI e Ocupação)
- Ícones das seções "Como funciona" e "Benefícios"
- Screenshots na seção de tabs (leve efeito de elevação ao entrar na viewport)

**Implementação:** Criar um hook `useParallax` que retorna um `ref` e um `style` com `transform: translateY(offset)` baseado na posição do scroll. Aplicar nos elementos decorativos.

```text
Hook: useParallax(speed: number)
  - Attach scroll listener
  - Calculate offset = scrollY * speed (speed < 1 = slower, > 1 = faster)
  - Return { ref, style: { transform: `translateY(${offset}px)` } }
```

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/Index.tsx` | Adicionar parallax nos elementos decorativos, atualizar URLs das imagens |
| `src/components/onboarding/TutorialModal.tsx` | Atualizar URLs das imagens |
| Migration SQL | Criar bucket público `landing-assets` no storage |

## Sequência de Execução

1. Criar bucket de storage
2. Pedir para o usuário fazer login no preview
3. Navegar e capturar screenshots das 4 telas
4. Upload para o storage
5. Atualizar código com novas URLs + parallax

