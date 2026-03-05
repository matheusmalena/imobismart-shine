

## Plan: Standardize Page Headers

The standard header pattern (used by Documents, Properties, Tenants, Team) is:

```
<h1 className="text-3xl font-bold text-foreground">Title</h1>
<p className="text-muted-foreground mt-1">Subtitle</p>
```

### Changes needed:

**1. Subscription (`src/pages/Subscription.tsx`, lines 141-156)**
- Remove the "Voltar" button and its container
- Change h1 from `text-2xl` to `text-3xl`
- Add `mt-1` to subtitle
- Keep the "Ver Planos" button aligned right
- Restructure header to match: `flex-col sm:flex-row sm:items-center sm:justify-between gap-4`

**2. WhatsApp (`src/pages/WhatsApp.tsx`, lines 35-40)**
- Change h1 from `text-2xl` to `text-3xl`
- Add `text-foreground` class to h1
- Add `mt-1` to subtitle paragraph

**3. Reports (`src/pages/Reports.tsx`, lines 508-514)**
- Change h1 from `text-2xl` to `text-3xl`
- Add `text-foreground` class
- Add a subtitle: `"Exporte dados e gere relatórios do seu portfólio"`
- Restructure to standard `<div>` with h1 + p pattern (move badge inline with title)

**4. Team (`src/pages/Team.tsx`)** — Already standardized, no changes needed.

