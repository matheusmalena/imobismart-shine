

## Problema

Quando um usuario convidado aceita o convite e cria a conta, o convite nao e removido da tabela `organization_invitations` porque o novo usuario (operador) nao tem permissao RLS para deletar convites -- apenas admins/owners da organizacao podem fazer isso.

Isso faz com que o convite continue aparecendo na lista de "Convites Pendentes" na pagina de Equipe.

## Solucao

### 1. Criar uma funcao SECURITY DEFINER para aceitar convites (Migracao SQL)

Criar uma funcao `accept_invitation(_token text, _user_id uuid)` que:
- Valida que o token existe e nao expirou
- Insere o usuario como membro da organizacao (se ainda nao estiver)
- Deleta o convite da tabela
- Roda como SECURITY DEFINER para ter permissao de deletar o convite independente do role do usuario

### 2. Atualizar `AcceptInvite.tsx`

Substituir as chamadas separadas de INSERT em `organization_members` e DELETE em `organization_invitations` por uma unica chamada RPC `accept_invitation`, garantindo que tudo acontece de forma atomica e com as permissoes corretas.

### 3. Limpeza dos convites existentes (Correcao de dados)

Deletar os 2 convites que ja foram aceitos mas ainda estao na tabela:
- `oyangferreira@gmail.com`
- `matheusmalena28@gmail.com`

## Detalhes Tecnicos

```text
Fluxo atual (com bug):
  Usuario aceita convite
  -> INSERT organization_members (funciona via RLS "org admins can insert")
  -> DELETE organization_invitations (FALHA - usuario nao e admin)
  -> Convite permanece na lista

Fluxo corrigido:
  Usuario aceita convite
  -> RPC accept_invitation (SECURITY DEFINER)
     -> INSERT organization_members
     -> DELETE organization_invitations
     -> Tudo funciona com permissoes elevadas
```

**SQL da funcao:**
```sql
CREATE OR REPLACE FUNCTION public.accept_invitation(_token text, _user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _inv RECORD;
BEGIN
  SELECT * INTO _inv FROM organization_invitations
  WHERE token = _token AND expires_at > now();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite invalido ou expirado';
  END IF;

  INSERT INTO organization_members (organization_id, user_id, role, status, accepted_at)
  VALUES (_inv.organization_id, _user_id, _inv.role, 'active', now())
  ON CONFLICT DO NOTHING;

  DELETE FROM organization_invitations WHERE id = _inv.id;
END;
$$;
```

**Alteracao no AcceptInvite.tsx:**
Substituir as linhas do INSERT + DELETE por:
```typescript
await supabase.rpc('accept_invitation', { _token: token, _user_id: authData.user.id });
```

