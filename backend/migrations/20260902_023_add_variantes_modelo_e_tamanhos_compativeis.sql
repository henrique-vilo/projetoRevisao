USE Everett;

-- Identifica a família comercial do produto. Variantes do mesmo modelo
-- compartilham o slug, mas continuam com SKU, cor, tamanho e estoque próprios.
ALTER TABLE produtos
ADD COLUMN slugModelo VARCHAR(180) NULL AFTER nome;

UPDATE produtos
SET slugModelo = CONCAT(
    TRIM(BOTH '-' FROM REGEXP_REPLACE(
        REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
            LOWER(nome),
            'á', 'a'), 'à', 'a'), 'â', 'a'), 'ã', 'a'),
            'é', 'e'), 'ê', 'e'),
            'í', 'i'),
            'ó', 'o'), 'ô', 'o'), 'õ', 'o'),
            'ú', 'u'), 'ü', 'u'), 'ç', 'c'),
        '[^a-z0-9]+',
        '-'
    )),
    '-',
    idModelo
)
WHERE slugModelo IS NULL OR slugModelo = '';

ALTER TABLE produtos
MODIFY COLUMN slugModelo VARCHAR(180) NOT NULL;

CREATE INDEX idx_produtos_slug_modelo ON produtos(slugModelo);

-- Uma subcategoria pode aceitar vários tamanhos e um mesmo tamanho pode ser
-- usado por diferentes tipos de produto (por exemplo, 38 em calça e calçado).
CREATE TABLE subcategoria_tamanhos (
    idSubcategoria INT NOT NULL,
    idTamanho INT NOT NULL,
    PRIMARY KEY (idSubcategoria, idTamanho),
    CONSTRAINT fk_subcategoria_tamanhos_subcategoria
        FOREIGN KEY (idSubcategoria)
        REFERENCES subcategorias(idSubcategoria)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_subcategoria_tamanhos_tamanho
        FOREIGN KEY (idTamanho)
        REFERENCES tamanhos(idTamanho)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- Vestuário com grade por letras: PP, P, M, G, GG e XG.
INSERT INTO subcategoria_tamanhos (idSubcategoria, idTamanho)
SELECT s.idSubcategoria, t.idTamanho
FROM subcategorias s
JOIN tamanhos t ON UPPER(t.codigoTamanho) IN ('PP', 'P', 'M', 'G', 'GG', 'XG')
WHERE LOWER(s.nomeSubcategoria) IN (
    'camisetas', 'pijamas', 'jaquetas e casacos', 'vestidos',
    'bermudas e shorts', 'bonés e chapéus', 'moletons', 'saias',
    'camisas sociais', 'leggings'
);

-- Calças usam a grade numérica de vestuário existente.
INSERT INTO subcategoria_tamanhos (idSubcategoria, idTamanho)
SELECT s.idSubcategoria, t.idTamanho
FROM subcategorias s
JOIN tamanhos t ON t.codigoTamanho IN ('36', '38', '40', '42', '44', '46', '48')
WHERE LOWER(s.nomeSubcategoria) = 'calças jeans';

-- A integridade também é garantida para inclusões feitas fora da API.
ALTER TABLE produtos
ADD CONSTRAINT fk_produto_subcategoria_tamanho
FOREIGN KEY (idSubcategoria, idTamanho)
REFERENCES subcategoria_tamanhos(idSubcategoria, idTamanho)
ON UPDATE CASCADE;
