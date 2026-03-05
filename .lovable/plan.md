

# Google OAuth: Restringir a contas existentes + Branding customizado

## Problema 1: Google cria conta automaticamente
Atualmente, o login com Google cria automaticamente um novo usuario se ele nao existir. O usuario quer que apenas contas ja existentes possam usar o Google Sign-In.

**Solucao:** Apos o retorno do OAuth do Google, verificar se o usuario ja existia antes. Se for um usuario novo (recem-criado pelo trigger `handle_new_user`), deletar a conta e mostrar um aviso para se cadastrar primeiro.

**Implementacao:**
- Em `src/pages/Auth.tsx`, no `useEffect` que detecta o usuario autenticado, verificar o campo `created_at` do usuario. Se foi criado nos ultimos 10 segundos E veio de provider Google, significa que eh um cadastro novo via Google. Nesse caso:
  1. Deletar o usuario recem-criado (signOut + chamar edge function ou simplesmente signOut e deixar os dados orfaos serem limpos)
  2. Mostrar toast avisando "Voce precisa criar uma conta primeiro. Cadastre-se na aba Cadastrar."
  
- Alternativa mais robusta: criar uma edge function `check-user-exists` que recebe um email e retorna se existe um usuario com esse email. Chamar ANTES do OAuth. Porem, isso nao eh possivel porque o OAuth redireciona para o Google antes de termos o email.

- **Melhor abordagem**: Usar um listener no `onAuthStateChange` para detectar o evento. Quando o usuario volta do Google OAuth, checar se o perfil foi criado ha menos de 10 segundos. Se sim, fazer signOut e mostrar aviso.

**Arquivo:** `src/pages/Auth.tsx` — adicionar logica no useEffect de redirecionamento

## Problema 2: Tela do Lovable no OAuth
A tela de consentimento mostra "Lovable" porque o projeto usa o Google OAuth gerenciado pelo Lovable Cloud. Para mostrar "ImobiSmart", eh necessario usar credenciais proprias do Google OAuth (BYOC - Bring Your Own Credentials).

**Isso requer:**
1. Criar um projeto no Google Cloud Console
2. Configurar a tela de consentimento OAuth com o nome "ImobiSmart"
3. Criar credenciais OAuth (Client ID + Secret)
4. Configurar no backend do Lovable Cloud (Authentication Settings > Google > usar credenciais proprias)

Essa configuracao eh feita fora do codigo, no painel do Lovable Cloud e no Google Cloud Console. Vou fornecer instrucoes e o link para o painel.

---

## Arquivos a Modificar

| Arquivo | Acao |
|---------|------|
| `src/pages/Auth.tsx` | Detectar usuario novo via Google e bloquear, mostrando aviso |

## Nota sobre Branding
Para a tela mostrar "ImobiSmart" em vez de "Lovable", sera necessario configurar credenciais proprias do Google OAuth no painel do backend. Fornecerei instrucoes apos implementar a parte do codigo.

