

## Plano: Corrigir logo do mockup, visibilidade no light mode e social proof bar

### Problemas

1. **Logo no mockup do hero** — A sidebar do `DashboardMockup` usa um ícone genérico (`Building2` em quadrado colorido) em vez da logo real do ImobiSmart
2. **Texto invisível no light mode** — A social proof bar usa `text-foreground` sobre `bg-muted/30`, que no light mode resulta em texto escuro sobre fundo claro (OK), mas pelas screenshots do usuário o problema parece ser na seção com fundo escuro. Verificando: a social proof bar na image-22 aparece com fundo escuro e texto claro — isso indica que está renderizando em dark mode. No light mode, `bg-muted/30` é quase branco e `text-foreground` é escuro, então deveria funcionar. O problema real é que a **seção CTA** (`bg-[hsl(175,50%,25%)]`) com texto branco funciona, mas a **social proof bar** pode estar com contraste ruim dependendo do tema
3. **Social proof bar "centralizada embaixo" está feia** — O layout horizontal com `flex-wrap` precisa de melhor espaçamento e visual

### Mudanças

#### 1. `src/components/landing/ScreenMockups.tsx` — Corrigir logo na sidebar

Substituir o ícone genérico (L17-20) pela logo real importada de `@/assets/logo-icon.png`:

```tsx
import logoIcon from '@/assets/logo-icon.png';

// Na Sidebar, trocar:
<div className="w-5 h-5 rounded-lg bg-primary flex items-center justify-center">
  <Building2 className="h-3 w-3 text-primary-foreground" />
</div>

// Por:
<img src={logoIcon} alt="ImobiSmart" className="w-5 h-5 object-contain" />
```

#### 2. `src/pages/Index.tsx` — Melhorar social proof bar

Dar mais corpo visual à seção com fundo sólido e melhor contraste em ambos os temas:

```tsx
<section className="py-12 px-4 border-y border-border/50 bg-card scroll-reveal" ref={reveal}>
```

Usar `bg-card` em vez de `bg-muted/30` para garantir contraste consistente. Adicionar grid responsivo (`grid grid-cols-2 md:grid-cols-4`) em vez de `flex-wrap` para evitar o layout "feio" centralizado.

#### 3. `src/index.css` — Sem mudanças necessárias

| Arquivo | Mudança |
|---|---|
| `src/components/landing/ScreenMockups.tsx` | Usar logo real na sidebar do mockup |
| `src/pages/Index.tsx` | Melhorar layout e contraste da social proof bar |

