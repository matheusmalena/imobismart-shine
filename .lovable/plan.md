

## Plan: Fix Pricing Cards, FAQ Content, and Social Proof Cards

### 1. Pricing Section — Ensure features match real system

The plan features come from the database. Current DB features have some inaccuracies (e.g., Starter says "Até 15 imóveis" but limit is 10). I'll update the database records to reflect the actual system capabilities per plan:

- **Free (2 imóveis)**: Dashboard básico, Até 2 imóveis, Gestão de inquilinos, Upload de documentos
- **Starter (10 imóveis)**: Até 10 imóveis, Dashboard completo, Gestão de inquilinos, Contratos de locação, Suporte por email
- **Pro (25 imóveis)**: Até 25 imóveis, Exportação CSV/Excel/JSON, Relatórios detalhados, Dashboard completo, Suporte por email
- **Plus (50 imóveis)**: Até 50 imóveis, Relatórios PDF, Copiloto IA, WhatsApp integrado, Suporte prioritário
- **Enterprise (-1/ilimitado)**: Imóveis ilimitados, Gestão de equipes, Limites personalizados, Suporte dedicado

This will be done via a database migration updating the `features` JSON array on each plan row.

### 2. FAQ Section — Rewrite with real system info

Replace the current generic FAQ answers with accurate descriptions matching what the system actually does:

- **Gratuito?** → Free plan with 2 imóveis, dashboard básico, upgrade when needed
- **Migrar de plano?** → Upgrade via página de Assinatura, downgrade via contato
- **Dados seguros?** → Autenticação 2FA, dados criptografados, backups automáticos
- **Qualquer dispositivo?** → Plataforma web responsiva
- **Controle de documentos?** → Upload por imóvel, categorias, busca na nuvem
- **Cancelar assinatura?** → Sem fidelidade, cancela quando quiser
- **ROI automático?** → Cálculo automático no dashboard com receita, custos, lucro líquido

Update `src/components/landing/FAQSection.tsx` with corrected answers.

### 3. Social Proof Cards — Restyle and fix numbers

In `src/pages/Index.tsx`, social proof section (lines 278-302):

- Change "100+" imóveis gerenciados → "1.000+" (value: 1000)
- Restyle the cards to look more polished and match the system's design language:
  - Use `bg-card` with subtle `shadow-sm` and `border border-border/40`
  - Cleaner spacing, slightly larger icons
  - More refined typography hierarchy

### Files to modify:
- **Database migration**: Update `plans.features` for all 5 plans
- **`src/components/landing/FAQSection.tsx`**: Rewrite FAQ answers
- **`src/pages/Index.tsx`**: Restyle social proof cards, change 100→1000 for imóveis

