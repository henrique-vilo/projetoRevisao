ALTER TABLE produtos ADD FULLTEXT idx_busca_texto (nome, nomeCombinacao, descricao, sku);

CREATE INDEX idx_ativo ON produtos(ativo);
CREATE INDEX idx_genero ON produtos(genero);
CREATE INDEX idx_categoria ON produtos(idCategoria);
CREATE INDEX idx_subcategoria ON produtos(idSubcategoria);
CREATE INDEX idx_cor ON produtos(idCor);
CREATE INDEX idx_tamanho ON produtos(idTamanho);
CREATE INDEX idx_modelo ON produtos(idModelo);
CREATE INDEX idx_preco ON produtos(preco);