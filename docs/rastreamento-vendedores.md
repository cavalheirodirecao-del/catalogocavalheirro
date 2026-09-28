# Rastreamento de vendedores e melhorias do catálogo

## Links e atribuição

O link do vendedor usa seu slug cadastrado: `/varejo?vendedor=SLUG`,
`/atacado?vendedor=SLUG` ou `/fabrica?vendedor=SLUG`. O catálogo precisa estar
habilitado para esse vendedor. Afiliados continuam usando `?ref=SLUG`.

O último link válido fica associado ao navegador por sete dias, em cookie
HttpOnly autenticado e criptografado. Navegar até um produto ou checkout não
remove o vínculo. Um novo link válido pode substituir o anterior; um slug
inexistente não apaga uma referência válida. Se ambos os parâmetros forem
enviados juntos, o vendedor tem prioridade. O servidor revalida a situação do
vendedor ou afiliado antes de criar o pedido.

O checkout fixa o vendedor identificado pelo link. Sem esse vínculo, a escolha
manual continua disponível e é registrada como uma origem diferente. O ID
enviado pelo navegador não pode substituir a referência validada pelo servidor.

## Relatório

O painel `/alcance` mostra visitas, navegadores únicos, pedidos, vendas por link,
pedidos pendentes/cancelados e valor das vendas. Há filtros por período e
catálogo. Um vendedor autenticado consulta somente seus próprios resultados
e pode copiar seus links em “Meus resultados”.

Uma visita é deduplicada por sessão de 30 minutos, catálogo e origem. Visitantes
únicos são identificadores de navegador, não uma contagem exata de pessoas:
outro aparelho, exclusão de cookies e navegação privada podem gerar outro ID.
Histórico sem esse identificador não é convertido em visitantes únicos.

Vendas são pedidos CONFIRMADO, SEPARANDO, ENVIADO ou CONCLUIDO. A confirmação
depende do processo operacional de atualização do pedido; clicar em WhatsApp
ou criar um pedido pendente não confirma pagamento. Pedidos antigos sem origem
registrada não são apresentados como vendas comprovadamente vindas de links.

## Demais alterações

- Grade do atacado: cores por linha, tamanhos por coluna, controles +/−,
  digitação de quantidades e indisponibilidade por variante.
- Varejo: fotos com mais destaque, tamanhos esgotados visíveis e seleção clara.
- Preços, descontos, frete, estoque e mínimos são validados no servidor.
- Chave de checkout impede duplicação em novas tentativas da mesma submissão.
- APIs administrativas verificam usuário ativo e perfil no próprio handler.
- Consultas de usuários relacionadas a vendedores deixam de retornar senhas.
- PDFs de catálogo são salvos no Storage, compatível com execução serverless.

## Publicação

1. Aplicar `prisma/sql/20260927_tracking.sql` no projeto Supabase correto antes
   de publicar o código. O script é aditivo e pode ser executado novamente;
   não remove tabelas, pedidos ou visitas existentes.
2. Confirmar as variáveis existentes DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET,
   SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY. A chave service role é exclusiva
   do servidor e não deve usar prefixo NEXT_PUBLIC.
3. Gerar Prisma e executar a build pelos comandos do projeto. Publicar primeiro
   uma prévia com banco separado quando disponível.
4. Validar um vendedor ativo: abrir seu link, navegar para um produto, conferir
   o vendedor fixo no checkout e a visita no painel. Para validar uma compra
   integral, usar banco de teste ou pedido de teste explicitamente identificado.

Reverter o código anterior continua compatível com as colunas adicionais.
Não é necessário apagar as colunas para fazer rollback da aplicação.

## Validação e limites

Foram executados 15 testes automatizados em `tests/commerce.test.cjs`, incluindo
cookies reais criptografados, rotas HTTP e banco simulado. Passaram também a
build do Next e a checagem de tipos. A interface foi conferida em navegador
local com dados fictícios. Não foram criados pedidos reais de teste.

Os testes não substituem integração com PostgreSQL real, Melhor Envio e
webhooks. O SQL foi aplicado no Supabase em 28/09/2026 (UTC), e a prévia da
Vercel foi validada com navegação do link `wallyson` até o checkout, que exibiu
o vendedor vinculado. A publicação em produção deve ser conferida no histórico
de deployments da Vercel. A revisão de RLS das tabelas do Supabase permanece pendente e não
deve ser considerada resolvida pelos controles das rotas Next.js.
