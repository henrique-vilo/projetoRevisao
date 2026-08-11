USE Everett;

CREATE TABLE IF NOT EXISTS produtos (
    idProduto INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    idCategoria INT NOT NULL,
    idSubcategoria INT NOT NULL,
    idCor INT NOT NULL,
    idTamanho INT NOT NULL,
    idModelo INT NOT NULL,
    imagem1 VARCHAR(255) NOT NULL,
    imagem2 VARCHAR(255) NULL,
    imagem3 VARCHAR(255) NULL,
    imagem4 VARCHAR(255) NULL,
    estoque INT NOT NULL DEFAULT 0,
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_produto_categoria FOREIGN KEY (idCategoria) REFERENCES categorias(idCategoria),
    CONSTRAINT fk_produto_subcategoria FOREIGN KEY (idSubcategoria) REFERENCES subcategorias(idSubcategoria),
    CONSTRAINT fk_produto_cor FOREIGN KEY (idCor) REFERENCES cores(idCor),
    CONSTRAINT fk_produto_tamanho FOREIGN KEY (idTamanho) REFERENCES tamanhos(idTamanho),
    CONSTRAINT fk_produto_modelo FOREIGN KEY (idModelo) REFERENCES modelos(idModelo)
);