# Criar Conta Pro de Teste com Dados Mockados

## Resumo

Criar uma conta de teste completa com plano Pro, 10 imoveis com fotos e informacoes detalhadas, e inquilinos vinculados.

## Dados a serem criados

### 1. Conta de usuario

- Nome: Matheus
- Email: [pro@teste.com](mailto:pro@teste.com)
- Senha: 123456
- Plano: Pro (status: active)

### 2. 10 Imoveis com fotos e dados completos


| #   | Nome                        | Tipo        | Status     | Cidade            | Valor       | Receita |
| --- | --------------------------- | ----------- | ---------- | ----------------- | ----------- | ------- |
| 1   | Apartamento Centro SP       | Apartamento | Alugado    | Sao Paulo/SP      | R$450.000   | R$2.800 |
| 2   | Casa Alphaville             | Casa        | Alugado    | Barueri/SP        | R$1.200.000 | R$5.500 |
| 3   | Sala Comercial Faria Lima   | Sala        | Alugado    | Sao Paulo/SP      | R$380.000   | R$3.200 |
| 4   | Loja Shopping Morumbi       | Loja        | Alugado    | Sao Paulo/SP      | R$520.000   | R$4.000 |
| 5   | Apartamento Copacabana      | Apartamento | Vago       | Rio de Janeiro/RJ | R$780.000   | R$0     |
| 6   | Casa Jardins                | Casa        | Alugado    | Sao Paulo/SP      | R$950.000   | R$4.200 |
| 7   | Galpao Industrial Guarulhos | Galpao      | Alugado    | Guarulhos/SP      | R$1.500.000 | R$8.000 |
| 8   | Terreno Campinas            | Terreno     | A Venda    | Campinas/SP       | R$350.000   | R$0     |
| 9   | Apartamento Vila Mariana    | Apartamento | Em Reforma | Sao Paulo/SP      | R$620.000   | R$0     |
| 10  | Comercial Paulista          | Comercial   | Alugado    | Sao Paulo/SP      | R$890.000   | R$6.500 |


Cada imovel tera: endereco completo, taxas (condominio, IPTU, manutencao), caracteristicas fisicas (quartos, banheiros, vagas), comodidades e fotos geradas por IA.

### 3. Inquilinos (para imoveis alugados)


| Nome            | Email                                           | Telefone        | CPF            |
| --------------- | ----------------------------------------------- | --------------- | -------------- |
| Carlos Silva    | [carlos@email.com](mailto:carlos@email.com)     | (11) 99111-2233 | 123.456.789-00 |
| Ana Oliveira    | [ana@email.com](mailto:ana@email.com)           | (11) 99222-3344 | 234.567.890-11 |
| Roberto Santos  | [roberto@email.com](mailto:roberto@email.com)   | (11) 99333-4455 | 345.678.901-22 |
| Fernanda Lima   | [fernanda@email.com](mailto:fernanda@email.com) | (21) 99444-5566 | 456.789.012-33 |
| Pedro Costa     | [pedro@email.com](mailto:pedro@email.com)       | (11) 99555-6677 | 567.890.123-44 |
| Juliana Martins | [juliana@email.com](mailto:juliana@email.com)   | (11) 99666-7788 | 678.901.234-55 |
| Lucas Pereira   | [lucas@email.com](mailto:lucas@email.com)       | (11) 99777-8899 | 789.012.345-66 |


## Detalhes Tecnicos

### Passo 1 - Criar usuario

- Registrar via Supabase Auth com email `pro@teste.com` e senha de teste
- A Edge Function de verificacao sera ignorada pois vamos confirmar o email diretamente via admin

### Passo 2 - Configurar subscription

- Atualizar o registro na tabela `subscriptions` para `plan = 'pro'` e `status = 'active'`

### Passo 3 - Gerar fotos dos imoveis

- Usar a API de geracao de imagens (Nano banana) para criar fotos realistas de cada imovel
- Upload das imagens para o bucket `property-photos` no storage

### Passo 4 - Inserir imoveis

- Inserir os 10 registros na tabela `properties` com todos os campos preenchidos (endereco, valores, caracteristicas, foto_url)

### Passo 5 - Inserir inquilinos

- Inserir 7 inquilinos na tabela `tenants` com dados completos

### Passo 6 - Criar contratos

- Vincular inquilinos aos imoveis alugados na tabela `lease_contracts`

## Arquivos Modificados

Nenhum arquivo de codigo sera modificado. Todas as operacoes sao de insercao de dados via SQL e API.