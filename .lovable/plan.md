

# Auditoria Final: Landing Page vs Funcionalidades Reais + Dashboard

## Problemas Identificados

### Landing Page
1. **HeroSection mockup mostra "Leads: 156"** (linha 84) -- CRM/Leads NAO existe. Deve mostrar "Inquilinos" com dados coerentes.
2. **BenefitsSection** -- Os 4 beneficios estao corretos, MAS as imagens de ilustracao sao apenas icones gigantes (linha 70-71). Precisa de mockups visuais reais (mini-interfaces) como na FeaturesSection.
3. **TargetAudienceSection** -- Componente existe mas NAO esta sendo usado no Index.tsx. Deveria estar na landing page.
4. **FinalCTA** -- Texto "centenas de imobiliarias e corretores" e exagerado para uma startup. Ajustar para algo mais realista.
5. **SocialProofBar** -- "500+ Imobiliarias ativas", "50.000+ Imoveis gerenciados" sao numeros falsos. Ajustar para algo honesto ou remover.
6. **PlatformDemo** -- Referencia imagens em `/images/tutorial-*.png` que podem nao existir ou estar desatualizadas. Substituir por mockups em codigo (como FeaturesSection faz).
7. **FAQSection** -- O FAQ menciona "plano Starter e completamente gratuito" (linha 13) mas o plano Starter NAO e gratuito -- o plano Free e gratuito. Corrigir.

### Dashboard
1. **Dashboard esta funcional** -- Metricas, RevenueChart, OccupancyChart, Quick Actions, Recent Activity (dados reais), ProFeaturesCard e PlusAICard estao todos implementados e funcionando.
2. **Nenhuma imagem faltante no dashboard** -- Os componentes usam icones e graficos programaticos, nao dependem de imagens externas.

## Plano de Implementacao

### 1. Corrigir HeroSection mockup
- Trocar "Leads: 156" por "Inquilinos: 12" (funcionalidade real)
- Manter Imoveis e Contratos

### 2. Melhorar BenefitsSection com mockups visuais
- Substituir os icones gigantes por mini-interfaces ilustrativas (similar ao padrao da FeaturesSection)
- Cada beneficio tera um mockup visual representando a funcionalidade real

### 3. Adicionar TargetAudienceSection ao Index.tsx
- Inserir entre BenefitsSection e TestimonialsSection

### 4. Corrigir textos enganosos
- **SocialProofBar**: Mudar para metricas mais honestas ou genericas ("Investidores ativos", "Imoveis cadastrados", etc.) sem numeros inflados
- **FinalCTA**: Ajustar texto para algo mais realista
- **FAQSection**: Corrigir referencia ao plano Free (nao Starter)

### 5. Substituir PlatformDemo por mockups em codigo
- Remover dependencia de imagens `/images/tutorial-*.png`
- Criar mockups programaticos para cada tela (Dashboard, Imoveis, Documentos, Configuracoes)

## Arquivos a modificar

| Arquivo | Acao |
|---------|------|
| `src/components/landing/HeroSection.tsx` | Corrigir "Leads" para "Inquilinos" |
| `src/components/landing/BenefitsSection.tsx` | Adicionar mockups visuais nos beneficios |
| `src/components/landing/SocialProofBar.tsx` | Ajustar numeros para algo honesto |
| `src/components/landing/FinalCTA.tsx` | Ajustar texto |
| `src/components/landing/FAQSection.tsx` | Corrigir referencia ao plano Free |
| `src/components/landing/PlatformDemo.tsx` | Substituir imagens por mockups em codigo |
| `src/pages/Index.tsx` | Adicionar TargetAudienceSection |

Nenhuma alteracao no banco de dados. Nenhum arquivo novo necessario. Dashboard esta completo e funcional.

