-- Limpa duplicados: mantém mais antigo por (user_id, cpf/email), remove CPF/Email dos demais

-- 1) Normaliza email/cpf existentes
UPDATE public.tenants
SET
  email = NULLIF(LOWER(TRIM(email)), ''),
  cpf   = NULLIF(REGEXP_REPLACE(cpf, '\\D', '', 'g'), '')
WHERE email IS NOT NULL OR cpf IS NOT NULL;

-- 2) Limpa CPF de duplicados (mantém apenas o registro mais antigo)
WITH oldest_by_cpf AS (
  SELECT DISTINCT ON (user_id, cpf)
    id
  FROM public.tenants
  WHERE cpf IS NOT NULL AND cpf <> ''
  ORDER BY user_id, cpf, created_at ASC
)
UPDATE public.tenants
SET cpf = NULL
WHERE cpf IS NOT NULL
  AND cpf <> ''
  AND id NOT IN (SELECT id FROM oldest_by_cpf);

-- 3) Limpa Email de duplicados (mantém apenas o registro mais antigo)
WITH oldest_by_email AS (
  SELECT DISTINCT ON (user_id, email)
    id
  FROM public.tenants
  WHERE email IS NOT NULL AND email <> ''
  ORDER BY user_id, email, created_at ASC
)
UPDATE public.tenants
SET email = NULL
WHERE email IS NOT NULL
  AND email <> ''
  AND id NOT IN (SELECT id FROM oldest_by_email);

-- 4) Cria índices únicos parciais por conta (user_id)
CREATE UNIQUE INDEX IF NOT EXISTS tenants_user_cpf_uniq
  ON public.tenants (user_id, cpf)
  WHERE cpf IS NOT NULL AND cpf <> '';

CREATE UNIQUE INDEX IF NOT EXISTS tenants_user_email_uniq
  ON public.tenants (user_id, email)
  WHERE email IS NOT NULL AND email <> '';
