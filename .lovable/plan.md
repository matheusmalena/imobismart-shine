
# Plano: Melhorias de Segurança e UX

## Resumo das Implementações

Este plano aborda 4 áreas críticas identificadas na auditoria:

1. **Proteção contra senhas vazadas** - Configuração do Auth
2. **Criptografia de API Keys do WhatsApp** - Backend seguro
3. **Correção de warnings de console** - AlertDialog/forwardRef
4. **Feedback visual para operações assíncronas** - UX aprimorado

---

## 1. Proteção de Senha Vazada no Auth

### Problema
O sistema de autenticação não verifica se as senhas usadas foram comprometidas em vazamentos de dados conhecidos.

### Solução
Habilitar a proteção HaveIBeenPwned no Supabase Auth para verificar senhas durante signup e login.

### Implementação
- Usar a ferramenta `configure-auth` para habilitar `leaked_password_protection`
- Esta configuração é feita via API do Supabase, sem necessidade de código

---

## 2. Criptografia de API Keys do WhatsApp

### Problema Atual
As credenciais da Evolution API (URL, API Key, Instance Name) são armazenadas em texto plano na tabela `whatsapp_settings`:
```text
┌─────────────────────────────────────────────┐
│ whatsapp_settings                          │
├─────────────────────────────────────────────┤
│ evolution_api_url: text (PLAIN)            │
│ evolution_api_key: text (PLAIN) ⚠️          │
│ evolution_instance_name: text (PLAIN)      │
└─────────────────────────────────────────────┘
```

### Solução
Usar **pgcrypto** para criptografar API keys sensíveis com uma chave armazenada nos secrets do Supabase.

### Implementação

**Passo 1: Adicionar extensão e criar funções de criptografia**
```sql
-- Habilitar pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Função para criptografar
CREATE OR REPLACE FUNCTION encrypt_api_key(plain_key text)
RETURNS text AS $$
BEGIN
  IF plain_key IS NULL OR plain_key = '' THEN
    RETURN NULL;
  END IF;
  RETURN encode(
    pgp_sym_encrypt(plain_key, current_setting('app.encryption_key', true)),
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para descriptografar
CREATE OR REPLACE FUNCTION decrypt_api_key(encrypted_key text)
RETURNS text AS $$
BEGIN
  IF encrypted_key IS NULL OR encrypted_key = '' THEN
    RETURN NULL;
  END IF;
  RETURN pgp_sym_decrypt(
    decode(encrypted_key, 'base64'),
    current_setting('app.encryption_key', true)
  );
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Passo 2: Adicionar colunas criptografadas**
```sql
ALTER TABLE whatsapp_settings 
ADD COLUMN IF NOT EXISTS evolution_api_key_encrypted text;
```

**Passo 3: Atualizar edge function para usar descriptografia**
A edge function `whatsapp-send` será atualizada para:
- Descriptografar a API key antes de usar
- Usar o service role key para acessar as funções de descriptografia

**Arquivos afetados:**
- Migração SQL
- `supabase/functions/whatsapp-send/index.ts`
- `src/hooks/useWhatsAppSettings.ts` (para salvar criptografado)

---

## 3. Correção de Warnings de Console (forwardRef)

### Problema
Os componentes `AlertDialogHeader` e `AlertDialogFooter` não usam `forwardRef`, causando warnings no console quando usados com algumas bibliotecas.

### Análise
Verificando o arquivo `src/components/ui/alert-dialog.tsx`, os componentes problemáticos são:
```tsx
// Atual - sem forwardRef
const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={...} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";
```

### Solução
Converter para usar `React.forwardRef`:
```tsx
// Corrigido - com forwardRef
const AlertDialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={...} {...props} />
));
AlertDialogHeader.displayName = "AlertDialogHeader";
```

### Arquivos afetados:
- `src/components/ui/alert-dialog.tsx` (linhas 46-54)

---

## 4. Feedback Visual para Operações Assíncronas

### Problema
Algumas operações assíncronas não têm feedback visual adequado durante o processamento.

### Áreas Identificadas

| Componente | Operação | Status Atual |
|------------|----------|--------------|
| `admin/Plans.tsx` | Save/Delete/Toggle | Sem loader nos botões |
| `LockedSection.tsx` | Botão upgrade | Sem indicação de plano específico |
| `Settings.tsx` | Cancel subscription | Com feedback (OK) |
| `WhatsAppSettingsPanel.tsx` | Save template | ✅ Já tem loader |

### Implementação

**4.1 LockedSection - Padronizar botão**
```tsx
// De:
<Button size="sm" onClick={() => navigate('/plans')} className="gap-1.5">
  <Crown className="h-3.5 w-3.5" />
  Upgrade
</Button>

// Para:
<Button size="sm" onClick={() => navigate('/plans')} className="gap-1.5">
  <Crown className="h-3.5 w-3.5" />
  Upgrade para {planLabels[requiredPlan]}
</Button>
```

**4.2 admin/Plans.tsx - Adicionar estados de loading**
```tsx
// Adicionar loading state aos botões de ação
<Button 
  onClick={() => handleToggleActive(plan)}
  disabled={updatePlan.isPending}
>
  {updatePlan.isPending && updatePlan.variables?.id === plan.id ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    plan.is_active ? <EyeOff /> : <Eye />
  )}
</Button>
```

---

## Resumo de Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| Auth Config | Habilitar leaked password protection |
| Migração SQL | Funções encrypt/decrypt + coluna encrypted |
| `whatsapp-send/index.ts` | Usar descriptografia |
| `useWhatsAppSettings.ts` | Salvar criptografado |
| `alert-dialog.tsx` | Adicionar forwardRef a Header/Footer |
| `LockedSection.tsx` | Padronizar texto do botão |
| `admin/Plans.tsx` | Adicionar loaders nos botões |

---

## Considerações de Segurança

1. **Encryption Key**: Será armazenada como secret do Supabase (`WHATSAPP_ENCRYPTION_KEY`)
2. **RLS já configurado**: As políticas RLS para `whatsapp_settings` já estão corretas (usuário só vê seus dados)
3. **Edge Function**: Usa service role, então tem acesso às funções de descriptografia

---

## Ordem de Implementação

1. Habilitar proteção de senha vazada (configure-auth)
2. Criar migração SQL para criptografia
3. Atualizar edge function `whatsapp-send`
4. Atualizar hook `useWhatsAppSettings`
5. Corrigir `alert-dialog.tsx` (forwardRef)
6. Padronizar `LockedSection.tsx`
7. Adicionar loaders em `admin/Plans.tsx`

