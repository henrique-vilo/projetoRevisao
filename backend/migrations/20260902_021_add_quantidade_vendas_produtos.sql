USE Everett;

ALTER TABLE produtos
ADD COLUMN quantidadeVendas INT UNSIGNED NOT NULL DEFAULT 0 AFTER estoque;

UPDATE produtos p
LEFT JOIN (
    SELECT idProduto, COUNT(*) AS total
    FROM vendas
    WHERE status NOT IN ('carrinho', 'cancelado')
    GROUP BY idProduto
) vendasConfirmadas ON vendasConfirmadas.idProduto = p.idProduto
SET p.quantidadeVendas = COALESCE(vendasConfirmadas.total, 0);
