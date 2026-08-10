# Central de Resultados Operacionais — login Google

Versão do `qap18` com autenticação Google, gestão de usuários e trilha de auditoria, sem Firebase Functions e compatível com o plano gratuito Spark.

## Funcionamento

- A autenticação e os perfis utilizam o projeto Firebase `qap2cia-bd58b`.
- Os lançamentos continuam sendo gravados nos bancos originais `qap18-ac50d` e `resultados-1c75f`.
- Não há migração nem exclusão dos dados já existentes.
- Cada novo lançamento recebe UID, nome e Gmail do responsável.
- Cada correção guarda o último responsável e um histórico de até 50 edições.
- A auditoria central registra criação e edição com os dados anteriores e novos.
- `rpfenille@gmail.com` e `18bpmip3@gmail.com` são administradores permanentes.

## Configuração no Firebase

1. Em **Authentication > Método de login**, mantenha o provedor **Google** ativado.
2. Em **Authentication > Configurações > Domínios autorizados**, adicione `fenille.github.io` se ainda não estiver na lista.
3. No projeto `qap2cia-bd58b`, abra **Realtime Database > Regras**.
4. Substitua as regras pelo conteúdo de `database.rules.json` e clique em **Publicar**.

## Publicação

Envie todos os arquivos desta pasta para a raiz do repositório usado pelo GitHub Pages. Aguarde a publicação e atualize a página com `Ctrl + F5`.

No primeiro acesso, entre com `rpfenille@gmail.com` ou `18bpmip3@gmail.com`. As duas contas são criadas automaticamente como administradores permanentes e exibem o botão **Administração**. Os demais usuários entram com suas contas Google e podem ser ativados, desativados ou promovidos no painel.

## Segurança

- Nenhuma senha é armazenada no código.
- A senha e a recuperação da conta ficam sob responsabilidade do Google.
- Um usuário desativado permanece identificado no histórico, mas não consegue entrar novamente.
