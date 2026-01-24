-- Função atualizada para descriptografar API keys com a chave passada como parâmetro
CREATE OR REPLACE FUNCTION decrypt_api_key_with_key(encrypted_key text, encryption_key text)
RETURNS text AS $$
BEGIN
  IF encrypted_key IS NULL OR encrypted_key = '' THEN
    RETURN NULL;
  END IF;
  IF encryption_key IS NULL OR encryption_key = '' THEN
    RETURN NULL;
  END IF;
  RETURN pgp_sym_decrypt(
    decode(encrypted_key, 'base64'),
    encryption_key
  );
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função para criptografar API keys com a chave passada como parâmetro
CREATE OR REPLACE FUNCTION encrypt_api_key_with_key(plain_key text, encryption_key text)
RETURNS text AS $$
BEGIN
  IF plain_key IS NULL OR plain_key = '' THEN
    RETURN NULL;
  END IF;
  IF encryption_key IS NULL OR encryption_key = '' THEN
    RETURN NULL;
  END IF;
  RETURN encode(
    pgp_sym_encrypt(plain_key, encryption_key),
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;