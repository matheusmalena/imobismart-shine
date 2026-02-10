
# Adicionar Imagens aos Imoveis da conta pro@teste.com

## Situacao Atual

A conta `pro@teste.com` tem 5 imoveis com caminhos de imagem locais que nao existem:

| Imovel | Tipo | Foto Atual |
|--------|------|------------|
| Residencial Palm Beach | Apartamento | /images/property-1.jpg |
| Casa Jardim Europa | Casa | /images/property-2.jpg |
| Sala Comercial Faria Lima | Sala Comercial | /images/property-3.jpg |
| Cobertura Skyline | Apartamento (cobertura) | /images/property-4.jpg |
| Loja Centro Historico | Loja | /images/property-5.jpg |

## O que sera feito

1. Gerar 5 imagens realistas usando IA (modelo de geracao de imagens) para cada tipo de imovel
2. Fazer upload de cada imagem para o storage do projeto (bucket `property-photos`)
3. Atualizar o campo `photo_url` de cada imovel no banco com a URL publica do storage

## Imagens que serao geradas

- **Residencial Palm Beach**: Fachada de predio residencial moderno com piscina
- **Casa Jardim Europa**: Casa terrea elegante com jardim
- **Sala Comercial Faria Lima**: Escritorio moderno com vista panoramica
- **Cobertura Skyline**: Cobertura luxuosa com terraço e vista da cidade
- **Loja Centro Historico**: Fachada de loja comercial em area historica

## Detalhes Tecnicos

- Criar uma edge function temporaria `generate-property-images` que usa o modelo `google/gemini-2.5-flash-image` para gerar as imagens
- Cada imagem gerada sera convertida de base64 para arquivo e armazenada no bucket `property-photos` no caminho `{user_id}/{property_id}/cover.jpg`
- Apos upload, atualizar o campo `photo_url` de cada propriedade com a URL publica
- A edge function sera executada uma unica vez e pode ser removida depois

Alternativa mais simples: usar imagens de stock gratuitas (Unsplash) com URLs diretas, sem necessidade de edge function. Isso e mais rapido e nao consome creditos de IA.
