# Grandes clientes por convite

O endereço `/fabrica` permanece, mas sai da navegação pública, do rodapé e da
seleção de catálogos. A listagem, os produtos e o checkout exigem uma sessão
exclusiva válida antes de renderizar. As APIs de checkout, frete e pedidos
também verificam essa autorização. As páginas públicas não enviam os preços
FABRICA ao navegador.

No painel **Grandes clientes**, ADMIN e GERENTE informam nome e telefone de um
cliente aprovado e clicam em **Aprovar e gerar convite**. O link só é exibido
naquela resposta e deve ser enviado diretamente ao cliente pela equipe.
Nenhuma mensagem é enviada automaticamente.

Cada link usa 32 bytes aleatórios, é armazenado apenas como SHA-256 e expira
em 72 horas. A ativação exige clique explícito e consumo atômico do token.
O token fica no fragmento da URL, que é removido ao carregar a tela; não é
colocado em parâmetros de consulta. Quem possuir o link antes da ativação
pode utilizá-lo. Ele não identifica a pessoa por si só: a equipe deve conferir
o destinatário antes de enviar.

Depois de ativar, o navegador recebe cookie HttpOnly criptografado, Secure em
produção e SameSite=Lax, válido por 7 dias. O cliente volta pelo endereço
`/fabrica` no mesmo navegador. Outro navegador exige outro convite.
Reemitir incrementa a versão e invalida sessões anteriores; revogar desativa
o registro e bloqueia novas consultas e compras. Dados já vistos ou baixados
não podem ser apagados remotamente.

Nome e telefone no cadastro público não concedem esse acesso. Cadastros
antigos de leads não são aprovados automaticamente. Pedidos FABRICA recebem
o identificador do acesso e nome/telefone do cliente aprovado, definidos no
servidor. A equipe pode gerar PDFs exclusivos, mas os novos arquivos ficam
em bucket privado e são servidos por uma rota autenticada.

Aplicar `prisma/sql/20260928_exclusive_access.sql` antes do deploy. A migração
é aditiva, mantém os dados existentes, ativa RLS na nova tabela e revoga acesso
direto de anon/authenticated. Prisma usa a conexão de servidor existente.

Validação: testes de sessão aprovada/revogada, versão antiga, expiração,
reutilização de convite, bloqueio por nome/telefone e regressão do checkout.
Nenhum cliente real é aprovado automaticamente durante implantação.
