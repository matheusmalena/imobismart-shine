

# Auditoria e Correção do ImobiSmart

## Analise: Promessas vs Realidade

Apos revisar todo o codigo, encontrei estas discrepancias:

### Funcionalidades PROMETIDAS na landing page que NAO existem:
1. **CRM Imobiliario** - Pipeline de leads, gestao de contatos, automacoes de follow-up -- nao existe
2. **Site Imobiliario** - Geracao automatica de site com SEO -- nao existe
3. **Integracoes com Portais** - ZAP, VivaReal, OLX -- nao existe
4. **Marketing** - Landing pages, campanhas, funil de conversao -- nao existe

### Funcionalidades que EXISTEM e funcionam:
- Gestao de Imoveis (CRUD, filtros, galeria, arquivamento)
- Gestao de Inquilinos + Contratos
- Documentos (upload, categorias, visualizacao)
- WhatsApp (envio de lembretes via Evolution API)
- Relatorios/Exportacao (CSV, XLSX, JSON, PDF) - Pro+
- Equipe/Organizacoes - Enterprise
- Dashboard com metricas reais
- AI Copilot (Copiloto IA)
- Sistema de planos e assinatura via Cakto

### Problemas encontrados no codigo:
1. **Dashboard**: Atividade Recente e hardcoded/fake (sempre mostra os mesmos textos estaticos)
2. **Settings**: `PLAN_LABELS` desatualizados (chama "starter" de "Gratuito" e "enterprise" de "Plus")
3. **Landing page**: Promete CRM, Site Builder, Integracoes e Marketing que nao existem
4. **Pricing**: Estrutura simples -- precisa seguir o padrao do Jetimob (features categorizadas)

---

## Plano de Implementacao

### 1. Corrigir a Landing Page (FeaturesSection)
Substituir as 5 categorias fake por funcionalidades REAIS do sistema:
- **Gestao de Imoveis** - cadastro, fotos, status, financeiro, ranking
- **Inquilinos e Contratos** - cadastro, contratos de locacao, alertas de vencimento
- **Documentos** - upload, categorias, organizacao por imovel
- **WhatsApp Business** - lembretes automaticos, templates personalizados
- **Relatorios e Exportacao** - CSV, XLSX, JSON, PDF, filtros avancados

Remover mencoes a CRM pipeline, site builder, integracoes com portais e marketing automation.

### 2. Reestruturar a Pricing Section (Landing + Plans page)
Seguir o padrao do Jetimob (imagem de referencia):
- Features organizadas em **categorias com headers** (nao lista simples)
- Categorias: Geral, Gestao, Ferramentas, Integracoes, Suporte
- Cada plano mostra check/X para cada feature dentro da categoria
- Cards mais altos com scroll interno ou accordion para features longas
- Nota de rodape sobre recursos adicionais

### 3. Dashboard - Atividade Recente com dados reais
Substituir os 4 itens hardcoded por dados reais:
- Buscar os ultimos imoveis criados/atualizados (properties.updated_at)
- Buscar os ultimos inquilinos cadastrados (tenants.created_at)
- Buscar os ultimos documentos adicionados (documents.created_at)
- Mostrar timestamp real formatado ("ha 2 horas", "ha 1 dia")

### 4. Corrigir inconsistencias no Settings
- Atualizar PLAN_LABELS para refletir os 5 planos reais (free, starter, pro, plus, enterprise)
- Corrigir PLAN_DESCRIPTIONS para cada nivel

### 5. Atualizar BenefitsSection
Alinhar os 4 beneficios com funcionalidades reais:
- "Controle financeiro completo" (ROI, lucro, custos por imovel)
- "Documentos sempre organizados" (upload, categorias)
- "Contratos sob controle" (alertas, vencimentos)
- "Comunicacao automatizada" (WhatsApp lembretes)

---

## Arquivos a modificar

| Arquivo | Acao |
|---------|------|
| `src/components/landing/FeaturesSection.tsx` | Reescrever com funcionalidades reais |
| `src/components/landing/PricingSection.tsx` | Reestruturar com features categorizadas (padrao Jetimob) |
| `src/components/landing/BenefitsSection.tsx` | Alinhar com features reais |
| `src/components/landing/HeroSection.tsx` | Ajustar subtitulo para refletir funcionalidades reais |
| `src/pages/Plans.tsx` | Reestruturar comparativo com categorias |
| `src/pages/Dashboard.tsx` | Atividade recente com dados reais do banco |
| `src/pages/Settings.tsx` | Corrigir PLAN_LABELS e PLAN_DESCRIPTIONS |

Nao serao criadas tabelas novas. Todas as queries usam tabelas existentes (properties, tenants, documents).

