USE Everett;

CREATE TABLE produtos(
idProduto INT AUTO_INCREMENT PRIMARY KEY,
idCategoria INT NOT NULL,
idSubcategoria INT NOT NULL,
idCor INT NOT NULL,
idTamanho INT NOT NULL,
idModelo INT NOT NULL,
imagem1 TEXT NOT NULL,
imagem2 TEXT NULL,
imagem3 TEXT NULL,
imagem4 TEXT NULL,
estoque INT NOT NULL,

    CONSTRAINT fk_produto_categoria FOREIGN KEY (idCategoria) REFERENCES categorias(idCategoria),
    CONSTRAINT fk_produto_subcategoria FOREIGN KEY (idSubcategoria) REFERENCES subcategoias(idSubcategorias),
    CONSTRAINT fk_produto_cor FOREIGN KEY (idCor) REFERENCES cor(idCor),
    CONSTRAINT fk_produto_tamanho FOREIGN KEY (idTamanho) REFERENCES tamanho(idTamanho),
    CONSTRAINT fk_produto_modelo FOREIGN KEY (idModelo) REFERENCES modelo(idModelo)
);