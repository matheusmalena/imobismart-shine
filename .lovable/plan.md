

# Adicionar Status "Vendido" + Outras Comodidades como Tags

## 1. Adicionar "Vendido" ao status do imovel

O campo `status` usa um enum no banco de dados (`property_status`) com os valores atuais: `alugado`, `vago`, `em_reforma`, `a_venda`. Para adicionar "Vendido", e necessario:

### Migration SQL
```sql
ALTER TYPE property_status ADD VALUE 'vendido';
```

### Sugestoes de status adicionais
Alem de "Vendido", sugiro tambem:
- **Reservado** (`reservado`) - imovel com negociacao em andamento

Se quiser, posso adicionar esse tambem. Caso contrario, seguimos apenas com "Vendido".

### Arquivos modificados para o status

| Arquivo | Alteracao |
|---------|-----------|
| Migration SQL | `ALTER TYPE property_status ADD VALUE 'vendido'` |
| `src/types/property.ts` | Adicionar `'vendido'` ao tipo `PropertyStatus` e ao `PROPERTY_STATUS_LABELS` |
| `src/components/properties/PropertyCard.tsx` | Adicionar cor para o badge "vendido" no `getStatusColor` |

---

## 2. Outras Comodidades como tags editaveis

Atualmente o campo "Outras Comodidades" e um textarea de texto livre. A proposta e transformar em um sistema de tags:

- Um input onde o usuario digita uma comodidade e pressiona Enter (ou clica em um botao "+")
- A comodidade aparece como uma tag/badge ao lado das comodidades padrao (Piscina, Academia, etc.)
- Cada tag tem um botao "x" para remover
- Os valores continuam salvos no campo `other_amenities` como texto separado por virgula (sem mudanca no banco)

### Arquivos modificados

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/properties/PropertyForm.tsx` | Substituir o Textarea de "Outras Comodidades" por um input + lista de tags. Ao digitar e pressionar Enter, adiciona a tag. As tags ficam junto com as comodidades padrao visualmente. |

### Comportamento
- O usuario digita no input e pressiona Enter
- A tag aparece como badge junto com as comodidades existentes
- Cada tag tem "x" para remover
- Internamente, o array de tags e convertido para string separada por virgula no campo `other_amenities`
- Ao editar um imovel existente, o valor e parseado de volta para tags

## Detalhes Tecnicos

### Armazenamento das tags
O campo `other_amenities` continua como `text` no banco. As tags sao armazenadas como string separada por virgula (ex: `"Sauna, Playground, Portaria 24h"`). Nenhuma migracao adicional necessaria para isso.

### Componente de tags no formulario
Sera implementado inline no `PropertyForm.tsx`:
- Estado local `amenityTags: string[]` derivado de `formData.other_amenities.split(',')`
- Input com `onKeyDown` para capturar Enter
- Renderizar tags como badges com botao de remocao
- Sincronizar de volta para `formData.other_amenities` via `tags.join(', ')`

