

# Reestruturar Landing Page + Unificar Auth no Layout Split-Screen

## Resumo

Duas grandes mudancas:
1. **Landing Page (Index.tsx)**: Redesign completo com screenshots reais do produto, hero mais impactante com mockup do dashboard, secao de funcionalidades com imagens reais, e layout mais moderno e profissional.
2. **Auth Page (Auth.tsx)**: Todos os estados do fluxo de autenticacao (login, cadastro, OTP email, MFA, confirmacao de email, esqueci senha) devem usar o layout split-screen (esquerda branding + direita formulario), mudando apenas o conteudo do card da direita e o titulo/subtitulo conforme o estado.

---

## 1. Landing Page - Redesign Completo

**Arquivo:** `src/pages/Index.tsx`

### Estrutura nova:
- **Hero**: Layout split com texto a esquerda e mockup/screenshot do dashboard a direita (usar imagem `public/images/tutorial-dashboard.png` que ja existe no projeto)
- **Barra de Prova Social**: Numeros animados (200+ proprietarios, 500+ imoveis, 99.9% uptime)
- **Secao "Como Funciona"**: 3 steps com icones e descricoes curtas
- **Secao de Funcionalidades**: Grid com screenshots reais das telas do produto (usar as imagens tutorial-*.png que ja existem em `public/images/`)
  - Dashboard com metricas - `tutorial-dashboard.png`
  - Gestao de Imoveis - `tutorial-properties.png`
  - Documentos - `tutorial-documents.png`
  - Configuracoes - `tutorial-settings.png`
- **Manter secoes existentes**: TargetAudienceSection, PricingSection, TestimonialsSection, FAQSection
- **Secao de Beneficios**: Manter com melhorias visuais
- **CTA Final + Footer**: Manter

### Secao nova "Veja na pratica" com tabs interativas:
Cada tab mostra uma screenshot real com descricao ao lado, alternando entre Dashboard, Imoveis, Documentos e Relatorios.

---

## 2. Auth Page - Layout Unificado Split-Screen

**Arquivo:** `src/pages/Auth.tsx`

Atualmente, os estados `showEmailOTP`, `showMFA`, `showEmailConfirmation` renderizam telas separadas (fullscreen centralizadas). A mudanca e fazer todos usarem o mesmo layout split-screen.

### Abordagem:
- Manter o layout split (`lg:w-1/2` esquerda branding + direita formulario) como wrapper para TODOS os estados
- Extrair o conteudo da direita como renderizacao condicional dentro do mesmo layout
- Mudar o titulo/subtitulo do card conforme o estado:
  - **Login**: "Acesse sua conta" / "Entre ou crie uma nova conta para continuar"
  - **Cadastro**: (mesma tela, outra tab)
  - **OTP Email (4 digitos)**: "Verificacao por Email" / "Digite o codigo de 4 digitos enviado para {email}"
  - **MFA (6 digitos)**: "Verificacao em Duas Etapas" / "Digite o codigo do seu app autenticador"
  - **Confirmar Email**: "Verifique seu email" / "Enviamos um link de confirmacao para {email}"
  - **Esqueci Senha**: "Recuperar senha" / "Digite seu email para recuperacao"

### Mudancas tecnicas:
- Remover os `return` antecipados (early returns) para `showEmailOTP`, `showMFA`, `showEmailConfirmation`
- Incorporar o conteudo desses componentes dentro do card da direita do layout split
- `EmailOTPVerification` e `MFAVerification` passam a ser renderizados inline (sem Card proprio) ou adaptados para receber uma prop que remove o Card wrapper

**Arquivos modificados:**
- `src/components/auth/EmailOTPVerification.tsx` — adicionar prop `inline` para renderizar sem Card wrapper
- `src/components/auth/MFAVerification.tsx` — adicionar prop `inline` para renderizar sem Card wrapper

---

## 3. Resumo de Arquivos

| Arquivo | Acao |
|---------|------|
| `src/pages/Index.tsx` | Redesign completo da landing page com screenshots reais |
| `src/pages/Auth.tsx` | Unificar todos os estados no layout split-screen |
| `src/components/auth/EmailOTPVerification.tsx` | Adicionar modo inline (sem Card) |
| `src/components/auth/MFAVerification.tsx` | Adicionar modo inline (sem Card) |

Nenhuma mudanca de banco de dados ou edge functions necessaria.

