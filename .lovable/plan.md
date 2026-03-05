

# Redesign Completo do ImobiSmart — Landing Page + Dashboard

Este e um projeto grande. Recomendo dividir a implementacao em **3 fases** para manter qualidade e evitar regressoes.

---

## FASE 1: Landing Page (Conversao)

### Estrutura proposta (de cima para baixo):

```text
┌──────────────────────────────────────────┐
│  HEADER (sticky, glassmorphism)          │
│  Logo | Solucoes | Recursos | Planos |   │
│        Login | [Teste Gratis →]          │
├──────────────────────────────────────────┤
│  HERO (split layout)                     │
│  Left: headline + subtitle + 2 CTAs     │
│  Right: dashboard screenshot mockup      │
│  "Comece Gratis" + "Agendar Demo"       │
├──────────────────────────────────────────┤
│  SOCIAL PROOF BAR                        │
│  logos/numeros: "500+ imobiliarias"      │
│  "10.000+ imoveis gerenciados"           │
├──────────────────────────────────────────┤
│  FEATURES (tabbed/sectioned)             │
│  CRM | Gestao de Imoveis | Site |        │
│  Integracoes | Marketing                 │
│  Each tab: icon + text + screenshot      │
├──────────────────────────────────────────┤
│  PLATFORM DEMO (interactive preview)     │
│  Tabs showing dashboard/CRM/pipeline     │
├──────────────────────────────────────────┤
│  BENEFITS (2-col: text + visual)         │
│  "Economize tempo" / "Centralize leads"  │
│  "Automatize anuncios" / "Venda mais"    │
├──────────────────────────────────────────┤
│  TESTIMONIALS (carousel or grid)         │
├──────────────────────────────────────────┤
│  PRICING (3-4 cards)                     │
├──────────────────────────────────────────┤
│  FAQ (accordion)                         │
├──────────────────────────────────────────┤
│  FINAL CTA (gradient hero)              │
│  "Comece a gerenciar de forma mais       │
│   inteligente" + 2 buttons              │
├──────────────────────────────────────────┤
│  FOOTER (multi-column)                   │
│  Produto | Recursos | Empresa | Legal    │
└──────────────────────────────────────────┘
```

### Mudancas chave na Landing Page:

**1. Hero Section** — Trocar de layout centralizado para split (texto esquerda, screenshot direita). Adicionar botao "Agendar Demo". Mostrar um mockup do dashboard real.

**2. Nova secao: Social Proof Bar** — Numeros grandes em linha (ex: "500+ imobiliarias", "50.000+ imoveis", "98% satisfacao"). Substituir os badges atuais.

**3. Features refatoradas** — Agrupar em 5 categorias (CRM, Gestao de Imoveis, Site Imobiliario, Integracoes com Portais, Marketing). Usar tabs ou secoes alternadas (texto esquerda/direita) com screenshots mockup. Substituir os 4 cards genericos atuais.

**4. Nova secao: Platform Demo** — Cards com tabs mostrando diferentes telas do produto (dashboard, pipeline de leads, painel de imoveis).

**5. Benefits refatorada** — Layout alternado (zig-zag) com icones/ilustracoes ao lado do texto. 4 beneficios: economizar tempo, centralizar leads, automatizar anuncios, aumentar vendas.

**6. Footer multi-coluna** — Colunas: Produto, Recursos, Empresa, Legal. Links para features, pricing, blog, termos, privacidade.

**7. Header com navegacao** — Adicionar dropdown "Solucoes" e "Recursos" no header. Manter sticky glassmorphism.

### Paleta de cores:
- Manter o teal atual (ja funciona bem para proptech)
- Alternativa: mudar primary para deep blue (`220 70% 45%`) se o usuario preferir

### Arquivos a criar/modificar:

| Arquivo | Acao |
|---------|------|
| `src/pages/Index.tsx` | Reescrever com nova estrutura de secoes |
| `src/components/landing/HeroSection.tsx` | Criar - hero split layout |
| `src/components/landing/SocialProofBar.tsx` | Criar - numeros/logos |
| `src/components/landing/FeaturesSection.tsx` | Criar - 5 categorias com tabs |
| `src/components/landing/PlatformDemo.tsx` | Criar - preview interativo |
| `src/components/landing/BenefitsSection.tsx` | Criar - layout zig-zag |
| `src/components/landing/FinalCTA.tsx` | Criar - CTA final |
| `src/components/landing/Footer.tsx` | Criar - footer multi-coluna |
| `src/components/landing/TargetAudienceSection.tsx` | Remover ou integrar em Features |
| `src/components/landing/TestimonialsSection.tsx` | Atualizar para formato carrossel |
| `src/components/landing/PricingSection.tsx` | Simplificar para 3-4 colunas |
| `src/components/landing/FAQSection.tsx` | Atualizar perguntas para foco em agencias/corretores |

---

## FASE 2: Dashboard Layout (proposta)

Melhorias no layout interno do produto:

**Sidebar** — Reorganizar navegacao:
- Overview (Dashboard)
- Imoveis
- Leads / CRM (futuro)
- Inquilinos
- Documentos
- Marketing (futuro)
- Integracoes (WhatsApp, portais)
- Relatorios
- Configuracoes

**Dashboard Overview** — Manter os 4 KPIs atuais + adicionar:
- Card "Leads recentes" (placeholder para CRM futuro)
- Card "Atividade recente" (timeline de acoes)
- Quick actions mais robustos

Isso sera implementado em uma fase posterior.

---

## FASE 3: Cor e Design System (opcional)

Se o usuario quiser mudar de teal para deep blue:
- Atualizar `src/index.css` com nova paleta
- Ajustar sidebar, gradients, shadows

---

## Recomendacao

Comecar pela **Fase 1 (Landing Page)** pois e o ponto de conversao. Sugiro implementar em 2-3 mensagens:
1. Hero + Social Proof + Features
2. Platform Demo + Benefits + Testimonials
3. Pricing + FAQ + CTA + Footer

Quer que eu implemente a Fase 1 completa de uma vez, ou prefere dividir?

