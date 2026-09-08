# Progresso - Meus pedidos

Atualizado em 08/09/2026, na branch local `vilao`.

## Concluído

- Backend autenticado `GET /api/vendas/meus-pedidos`, usando exclusivamente `req.usuario.id`.
- Backend autenticado `GET /api/vendas/meus-pedidos/:id`, limitado ao proprietário do pedido.
- Consultas excluem registros com status `carrinho` e retornam dados reais do produto e CEP cadastrado.
- Página `/meus-pedidos` com estados de carregamento, sessão ausente, erro, lista vazia e pedidos reais.
- Página dinâmica `/meus-pedidos/[slug]`, usando `idVendas` como slug e reaproveitando o visual de `/entrega`.
- `/entrega` redireciona para `/meus-pedidos` para manter compatibilidade.
- Ícone de Meus pedidos adicionado ao Header.
- Páginas de sucesso agora apontam para `/meus-pedidos` e não exibem número fictício.
- `node --check` nos três arquivos alterados do backend e `git diff --check` passaram.
- `npm run build` do frontend passou; o Next reconheceu `/meus-pedidos` e `/meus-pedidos/[slug]`.

## Próximas verificações

1. Com banco e API disponíveis, autenticar um cliente e validar os dois endpoints com pedido próprio, pedido de outro usuário e item em carrinho.
2. Validar no navegador desktop e mobile: Header, lista, pedido inexistente, sessão ausente e timeline de cada status.

## Observações

- O schema atual não possui agrupador de compra: cada linha de `vendas` representa um item e recebe seu próprio slug (`idVendas`).
- O schema de `usuarios` guarda apenas CEP; por isso o detalhe não inventa rua, número ou cidade.
- `origin/promax` existe, mas o checkout recebido estava na branch `vilao`; nenhum checkout de branch foi feito automaticamente.
