
# Plano: Upload de Documento PDF no Contrato de Locação

## Resumo
Adicionar a funcionalidade para fazer upload de um documento PDF (contrato assinado) junto ao cadastro/edição de contratos de inquilinos. O documento ficará armazenado de forma segura e poderá ser visualizado ou baixado posteriormente.

## O que será implementado

### 1. Interface do Formulário de Contrato
- Adicionar campo para upload de arquivo PDF no formulário de contrato
- Mostrar preview/nome do arquivo selecionado
- Botão para remover o arquivo anexado
- Indicador visual de upload em andamento

### 2. Lista de Contratos
- Adicionar ícone/botão para visualizar o documento quando existir
- Opção de download do documento no menu de ações
- Indicador visual de que o contrato possui documento anexado

### 3. Funcionalidades
- Upload do PDF para o storage existente (`property-documents`)
- Geração de URLs assinadas para acesso seguro ao documento
- Validação de tipo de arquivo (apenas PDF)
- Limite de tamanho de arquivo (10MB)
- Suporte a atualização do documento em contratos existentes

## Arquivos que serão modificados

| Arquivo | Alteração |
|---------|-----------|
| `src/types/tenant.ts` | Adicionar `contract_file_url` ao `LeaseContractFormData` |
| `src/components/tenants/ContractFormDialog.tsx` | Adicionar campo de upload de PDF |
| `src/hooks/useLeaseContracts.ts` | Implementar lógica de upload do arquivo |
| `src/components/tenants/ContractsList.tsx` | Adicionar botões para ver/baixar documento |

## Detalhes Técnicos

### Fluxo de Upload
```text
1. Usuário seleciona arquivo PDF
2. Arquivo é validado (tipo e tamanho)
3. Preview do nome do arquivo é exibido
4. Ao salvar o contrato:
   - Arquivo é enviado para o bucket 'property-documents'
   - URL é salva no campo 'contract_file_url' da tabela 'lease_contracts'
5. Arquivo pode ser visualizado/baixado usando URL assinada
```

### Segurança
- Arquivos armazenados no bucket privado `property-documents`
- Acesso via URLs assinadas com expiração de 1 hora
- RLS existente protege os contratos por usuário/organização

### Estrutura de Armazenamento
- Caminho: `{user_id}/contracts/{contract_id}/{timestamp}.pdf`
- Separação clara dos documentos de contrato
