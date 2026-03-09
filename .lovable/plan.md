

## Plano: WhatsApp no botao de limite + corrigir nome do plano no banner

### Mudancas

#### 1. `src/components/team/TeamManagement.tsx` (linha 325)
O botao "Aumentar Limite" precisa abrir WhatsApp com numero `13 99706-9979`:
```tsx
<a href="https://wa.me/5513997069979?text=Olá! Gostaria de aumentar o limite de membros da minha equipe no ImobiSmart." target="_blank">
  <Button size="sm" variant="outline" ...>Aumentar Limite</Button>
</a>
```

#### 2. `src/pages/Plans.tsx` (linha 218)
Atualizar o numero do WhatsApp do Enterprise de `5511999999999` para `5513997069979`.

#### 3. `src/components/properties/PropertyLimitBanner.tsx` (linha 13-17)
O `PLAN_NAMES` esta errado — `enterprise` mapeia para `'Plus'` e faltam `free` e `plus`:
```typescript
const PLAN_NAMES: Record<string, string> = {
  free: 'Gratuito',
  starter: 'Starter',
  pro: 'Pro',
  plus: 'Plus',
  enterprise: 'Enterprise',
};
```

Alem disso, para Enterprise o banner nao deve sugerir "fazer upgrade" (ja e o plano maximo). Deve mostrar "Entre em contato para aumentar seu limite" com link para WhatsApp em vez de "/plans".

| Arquivo | Mudanca |
|---|---|
| `src/components/team/TeamManagement.tsx` | Botao "Aumentar Limite" abre WhatsApp 13 99706-9979 |
| `src/pages/Plans.tsx` | Atualizar numero WhatsApp Enterprise |
| `src/components/properties/PropertyLimitBanner.tsx` | Corrigir mapeamento de nomes de planos e comportamento Enterprise |

