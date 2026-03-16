

## Plano: Corrigir mockups, responsividade e CTA da landing page

### Problemas identificados

1. **Mockups CSS quebrados no mobile** — Os componentes `DashboardMockup`, `PropertiesMockup`, etc. renderizam sidebar+conteudo em ~375px, ficando ilegíveis com texto sobreposto
2. **CTA "Comece agora" invisível** — `gradient-hero` usa cores escuras (`hsl(175,50%,25%)`) mas o texto é `text-white`, e no light mode o fundo quase desaparece
3. **Mockups não representam o sistema real** — São componentes CSS estáticos com dados fictícios, não screenshots reais

### Solução

Substituir todos os mockups CSS por imagens reais que já existem no projeto (`/images/tutorial-dashboard.jpg`, `/images/tutorial-properties.jpg`, `/images/tutorial-documents.jpg`, `/images/tutorial-settings.jpg`).

---

### Mudanças

#### 1. `src/pages/Index.tsx`

**Hero (L262-266):** Substituir `<DashboardMockup />` por `<img>` com screenshot real:
```tsx
<img src="/images/tutorial-dashboard.jpg" alt="Dashboard ImobiSmart" className="w-full h-auto" />
```

**Feature Tabs (L374-378):** Substituir `MOCKUP_COMPONENTS[activeFeature.mockup]` por imagens reais. Mapear cada tab para sua imagem:
```tsx
const MOCKUP_IMAGES: Record<string, string> = {
  dashboard: "/images/tutorial-dashboard.jpg",
  properties: "/images/tutorial-properties.jpg",
  documents: "/images/tutorial-documents.jpg",
  settings: "/images/tutorial-settings.jpg",
};
// Render:
<img src={MOCKUP_IMAGES[activeFeature.mockup]} alt={activeFeature.title} className="w-full h-auto" />
```

**Benefits section (L444-447):** Substituir `<PropertiesMockup />` por imagem real.

**CTA section (L452-476):** Corrigir visibilidade — o `gradient-hero` é quase invisível em light mode. Trocar para classes Tailwind com contraste garantido:
```tsx
<section className="py-24 px-4 relative overflow-hidden bg-gradient-to-br from-[hsl(175,50%,25%)] via-[hsl(190,60%,20%)] to-[hsl(200,50%,18%)]">
```
Remover os divs com `gradient-hero` class e usar o gradiente diretamente no section.

**Remover imports** de `DashboardMockup`, `PropertiesMockup`, `DocumentsMockup`, `SettingsMockup` e a constante `MOCKUP_COMPONENTS`.

#### 2. `src/index.css` (L258-265)

No mobile, desativar o efeito 3D que distorce as imagens:
```css
@media (max-width: 768px) {
  .hero-screenshot-3d {
    transform: none;
  }
  .hero-screenshot-3d:hover {
    transform: none;
  }
  .benefits-screenshot {
    transform: none;
  }
  .benefits-screenshot:hover {
    transform: none;
  }
}
```

| Arquivo | Mudança |
|---|---|
| `src/pages/Index.tsx` | Trocar mockups CSS por imagens reais; corrigir CTA gradient |
| `src/index.css` | Desativar 3D transforms no mobile |

