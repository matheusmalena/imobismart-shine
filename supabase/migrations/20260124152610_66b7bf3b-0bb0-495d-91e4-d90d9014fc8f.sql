-- Habilitar pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Função para criptografar API keys
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função para descriptografar API keys
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Adicionar coluna para API key criptografada
ALTER TABLE whatsapp_settings 
ADD COLUMN IF NOT EXISTS evolution_api_key_encrypted text;

-- Função para migrar dados existentes (criptografar)
-- Será executada uma vez manualmente se houver dados existentes