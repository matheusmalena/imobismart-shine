

# Adicionar Fotos aos Imoveis de Teste

## Problema
A edge function `seed-test-data` cria os 10 imoveis sem definir o campo `photo_url`, fazendo com que os cards e a pagina de detalhes mostrem apenas o icone placeholder em vez de uma foto real.

## Solucao

Atualizar a edge function `seed-test-data` para:

1. Apos inserir os imoveis, buscar as 10 imagens ja existentes no repositorio (`public/images/prop-*.jpg`) a partir da URL publica do app
2. Fazer upload de cada imagem para o bucket `property-photos` no storage
3. Atualizar o campo `photo_url` de cada imovel com a URL publica do storage
4. Inserir registros na tabela `property_gallery` para que cada imovel tenha pelo menos 1 foto na galeria

## Mapeamento de Imagens

| Imovel | Arquivo |
|--------|---------|
| Apartamento Centro SP | prop-1-apto-centro-sp.jpg |
| Casa Alphaville | prop-2-casa-alphaville.jpg |
| Sala Comercial Faria Lima | prop-3-sala-faria-lima.jpg |
| Loja Shopping Morumbi | prop-4-loja-morumbi.jpg |
| Apartamento Copacabana | prop-5-apto-copacabana.jpg |
| Casa Jardins | prop-6-casa-jardins.jpg |
| Galpao Industrial Guarulhos | prop-7-galpao-guarulhos.jpg |
| Terreno Campinas | prop-8-terreno-campinas.jpg |
| Apartamento Vila Mariana | prop-9-apto-vila-mariana.jpg |
| Comercial Paulista | prop-10-comercial-paulista.jpg |

## Detalhes Tecnicos

### Arquivo modificado
- `supabase/functions/seed-test-data/index.ts`

### Logica adicionada (apos Step 6 existente)
1. Definir array com mapeamento `nome do imovel -> nome do arquivo`
2. Para cada imovel inserido:
   - Fazer `fetch()` da imagem usando a URL publica do app (`https://imobismart-shine.lovable.app/images/prop-X.jpg`)
   - Converter para `Uint8Array`
   - Upload via `supabase.storage.from('property-photos').upload()`
   - Obter URL publica via `getPublicUrl()`
   - Atualizar `properties.photo_url` com a URL do storage
   - Inserir registro em `property_gallery` com a mesma URL

### Redeployar a function e executa-la novamente
- Apos a modificacao, a function sera redeployada e executada para popular as fotos

