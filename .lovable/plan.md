
# Padronizacao Visual da Plataforma

## Inconsistencias Encontradas

### 1. Titulos de Pagina (h1)
| Pagina | Tamanho | Estilo |
|--------|---------|--------|
| Dashboard | `text-2xl sm:text-3xl font-bold` | Com saudacao |
| Properties | `text-3xl font-bold` | Sem subtitulo `mt-1` |
| Documents | `text-3xl font-bold` | Sem subtitulo `mt-1` |
| Tenants | `text-3xl font-bold` | Sem subtitulo `mt-1` |
| Settings | `text-3xl font-bold` | Sem subtitulo `mt-1` |
| Team | `text-3xl font-bold` | Sem subtitulo `mt-1` |
| **WhatsApp** | **`text-2xl font-bold`** | **Diferente!** Sem `mt-1` no subtitulo |
| **Reports (Pro)** | **`text-2xl font-bold`** | **Diferente!** Sem subtitulo |
| **Subscription** | **`text-2xl font-bold`** | **Diferente!** Layout diferente com botao Voltar |

**Padrao correto:** `text-3xl font-bold text-foreground` para o h1, e `text-muted-foreground mt-1` para o subtitulo.

### 2. Cards do Dashboard: RevenueChart usa `div` manual
O `RevenueChart` ainda usa `div` com classes manuais (`bg-card rounded-xl p-6 shadow-card border border-border/50`) em vez do componente `Card` padrao. O `OccupancyChart` ja foi corrigido.

### 3. Cards do Dashboard: Titulos internos inconsistentes
| Card | Titulo | Classe |
|------|--------|--------|
| RevenueChart | `h3 text-lg font-semibold text-card-foreground` | Manual |
| OccupancyChart | `CardTitle text-base` | Componente padrao |
| ProFeaturesCard | `CardTitle text-base` | Componente padrao |
| PlusAICard | `CardTitle text-base` | Componente padrao |

**Padrao correto:** Usar `CardTitle` com `text-base` em todos.

### 4. Reports: Upgrade prompt nao segue o padrao
A pagina Reports (para usuarios nao-Pro) usa um design proprio de upgrade que nao usa o componente `UpgradeOverlay`. Usa `CardTitle text-2xl`, um botao `size="lg" w-full`, e badges com estilos inline em vez do `UpgradeBadge`.

### 5. Subscription: Info banner inconsistente com Dashboard upgrade banner
O banner de upgrade do Dashboard usa `border-primary/30 bg-primary/5` enquanto o info banner de Subscription usa `border-primary/20 bg-primary/5`.

### 6. Subtitulos de pagina sem consistencia de espacamento
Algumas paginas usam `mt-1` no subtitulo, outras nao tem `mt-1`. WhatsApp nao usa.

## Plano de Correcao

### Etapa 1: Padronizar titulos de pagina
Corrigir `WhatsApp.tsx`, `Reports.tsx` (versao Pro) e `Subscription.tsx` para usar `text-3xl font-bold text-foreground` no h1 e `text-muted-foreground mt-1` no subtitulo.

### Etapa 2: Migrar RevenueChart para componente Card
Substituir os `div` manuais por `Card`, `CardHeader`, `CardTitle` e `CardContent`, da mesma forma que o `OccupancyChart` ja foi corrigido.

### Etapa 3: Padronizar upgrade prompt da pagina Reports
Substituir o design custom na pagina Reports (nao-Pro) pelo padrao visual consistente, usando `UpgradeBadge` e um estilo similar ao usado nos cards de dashboard.

### Etapa 4: Alinhar info banners
Padronizar a borda dos banners informativos para `border-primary/30 bg-primary/5`.

## Arquivos Modificados

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/WhatsApp.tsx` | h1 de `text-2xl` para `text-3xl`, subtitulo com `mt-1` |
| `src/pages/Reports.tsx` | h1 Pro de `text-2xl` para `text-3xl` + subtitulo; upgrade prompt padronizado |
| `src/pages/Subscription.tsx` | h1 de `text-2xl` para `text-3xl`; info banner border alinhado |
| `src/components/dashboard/RevenueChart.tsx` | Migrar de `div` para `Card/CardHeader/CardTitle/CardContent` |
