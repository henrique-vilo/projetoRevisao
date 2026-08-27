import { getConnection } from '../config/database.js';

class ProdutoModel {
    static async buscarComFiltros(params) {
        const {
            pagina = 1,
            limite = 10,
            busca,
            genero,
            idCategoria,
            idSubcategoria,
            idCor,
            idTamanho,
            idModelo,
            precoMin,
            precoMax,
            emEstoque,
            ordenarPor = 'recente'
        } = params;

        const connection = await getConnection();

        try {
            const paginaNumero = Math.max(1, parseInt(pagina, 10) || 1);
            const limiteNumero = Math.min(100, Math.max(1, parseInt(limite, 10) || 10));
            const offset = (paginaNumero - 1) * limiteNumero;
            const conditions = ['p.ativo = 1'];
            const queryParams = [];

            if (busca) {
                conditions.push(
                    '(p.nome LIKE ? OR p.nomeCombinacao LIKE ? OR p.descricao LIKE ? OR p.sku LIKE ?)'
                );
                queryParams.push(
                    `%${busca}%`,
                    `%${busca}%`,
                    `%${busca}%`,
                    `%${busca}%`
                );
            }

            if (genero) {
                conditions.push('p.genero = ?');
                queryParams.push(genero);
            }

            const filtrosId = {
                idCategoria: 'p.idCategoria',
                idSubcategoria: 'p.idSubcategoria',
                idCor: 'p.idCor',
                idTamanho: 'p.idTamanho',
                idModelo: 'p.idModelo'
            };

            for (const [campo, coluna] of Object.entries(filtrosId)) {
                if (params[campo] !== undefined && params[campo] !== '') {
                    conditions.push(`${coluna} = ?`);
                    queryParams.push(parseInt(params[campo], 10));
                }
            }

            if (precoMin !== undefined && precoMin !== '') {
                conditions.push('p.preco >= ?');
                queryParams.push(parseFloat(precoMin));
            }

            if (precoMax !== undefined && precoMax !== '') {
                conditions.push('p.preco <= ?');
                queryParams.push(parseFloat(precoMax));
            }

            if (emEstoque === 'true' || emEstoque === true) {
                conditions.push('p.estoque > 0');
            }

            const whereClause = conditions.join(' AND ');
            const ordenacoes = {
                recente: 'p.idProduto DESC',
                preco_asc: 'p.preco ASC',
                preco_desc: 'p.preco DESC',
                nome_asc: 'p.nome ASC',
                antigo: 'p.idProduto ASC'
            };
            const orderClause = ordenacoes[ordenarPor] || ordenacoes.recente;

            const sql = `
                SELECT
                    p.*,
                    c.nomeCategoria AS categoriaNome,
                    s.nomeSubcategoria AS subcategoriaNome,
                    cr.nomeCor AS corNome,
                    cr.codigoCor,
                    cr.tom AS corTom,
                    t.codigoTamanho AS tamanhoNome,
                    m.nomeModelo AS modeloNome
                FROM produtos p
                LEFT JOIN categorias c ON p.idCategoria = c.idCategoria
                LEFT JOIN subCategorias s ON p.idSubcategoria = s.idSubcategoria
                LEFT JOIN cores cr ON p.idCor = cr.idCor
                LEFT JOIN tamanhos t ON p.idTamanho = t.idTamanho
                LEFT JOIN modelos m ON p.idModelo = m.idModelo
                WHERE ${whereClause}
                ORDER BY ${orderClause}
                LIMIT ? OFFSET ?
            `;

            const [produtos] = await connection.query(sql, [
                ...queryParams,
                limiteNumero,
                offset
            ]);

            const countSql = `
                SELECT COUNT(*) AS total
                FROM produtos p
                WHERE ${whereClause}
            `;
            const [totalResult] = await connection.query(countSql, queryParams);
            const total = totalResult[0].total;

            return {
                produtos,
                total,
                pagina: paginaNumero,
                limite: limiteNumero,
                totalPaginas: Math.ceil(total / limiteNumero)
            };
        } finally {
            connection.release();
        }
    }

    static async buscarRegistroDetalhado(connection, id) {
        const sql = `
            SELECT
                p.*,
                c.nomeCategoria AS categoriaNome,
                s.nomeSubcategoria AS subcategoriaNome,
                cr.nomeCor AS corNome,
                cr.codigoCor,
                cr.tom AS corTom,
                t.codigoTamanho AS tamanhoNome,
                m.nomeModelo AS modeloNome
            FROM produtos p
            LEFT JOIN categorias c ON p.idCategoria = c.idCategoria
            LEFT JOIN subCategorias s ON p.idSubcategoria = s.idSubcategoria
            LEFT JOIN cores cr ON p.idCor = cr.idCor
            LEFT JOIN tamanhos t ON p.idTamanho = t.idTamanho
            LEFT JOIN modelos m ON p.idModelo = m.idModelo
            WHERE p.idProduto = ? AND p.ativo = 1
            LIMIT 1
        `;

        const [rows] = await connection.execute(sql, [id]);
        return rows[0] || null;
    }

    static async buscarPorId(id) {
        const connection = await getConnection();

        try {
            return await this.buscarRegistroDetalhado(connection, id);
        } finally {
            connection.release();
        }
    }

    /**
     * Considera como variações os registros com o mesmo nome,
     * nomeCombinacao, categoria, subcategoria e modelo.
     */
    static async buscarDetalhesPorId(id) {
        const connection = await getConnection();

        try {
            const produto = await this.buscarRegistroDetalhado(connection, id);

            if (!produto) {
                return null;
            }

            const sqlVariacoes = `
                SELECT
                    p.idProduto,
                    p.sku,
                    p.preco,
                    p.estoque,
                    p.idCor,
                    p.idTamanho,
                    p.idModelo,
                    p.imagem1,
                    p.imagem2,
                    p.imagem3,
                    p.imagem4,
                    cr.nomeCor AS corNome,
                    cr.codigoCor,
                    cr.tom AS corTom,
                    t.codigoTamanho AS tamanhoNome,
                    m.nomeModelo AS modeloNome
                FROM produtos p
                LEFT JOIN cores cr ON p.idCor = cr.idCor
                LEFT JOIN tamanhos t ON p.idTamanho = t.idTamanho
                LEFT JOIN modelos m ON p.idModelo = m.idModelo
                WHERE p.ativo = 1
                  AND p.nome = ?
                  AND p.nomeCombinacao = ?
                  AND p.idCategoria <=> ?
                  AND p.idSubcategoria <=> ?
                  AND p.idModelo <=> ?
                ORDER BY cr.nomeCor ASC, t.codigoTamanho ASC, p.idProduto ASC
            `;

            const [variacoes] = await connection.execute(sqlVariacoes, [
                produto.nome,
                produto.nomeCombinacao,
                produto.idCategoria,
                produto.idSubcategoria,
                produto.idModelo
            ]);

            return {
                produto,
                variacoes
            };
        } finally {
            connection.release();
        }
    }

    static async criar(dados) {
        const connection = await getConnection();

        try {
            const sql = `
                INSERT INTO produtos
                (
                    sku, nome, nomeCombinacao, descricao, genero, preco,
                    idCategoria, idSubcategoria, idCor, idTamanho, idModelo,
                    imagem1, imagem2, imagem3, imagem4, estoque
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const valores = [
                dados.sku,
                dados.nome,
                dados.nomeCombinacao,
                dados.descricao,
                dados.genero || 'Unissex',
                dados.preco,
                dados.idCategoria,
                dados.idSubcategoria,
                dados.idCor,
                dados.idTamanho,
                dados.idModelo,
                dados.imagem1,
                dados.imagem2 || null,
                dados.imagem3 || null,
                dados.imagem4 || null,
                dados.estoque
            ];

            const [result] = await connection.execute(sql, valores);
            return result.insertId;
        } finally {
            connection.release();
        }
    }

    static async atualizar(id, dados) {
        const connection = await getConnection();

        try {
            const campos = [];
            const valores = [];

            for (const [chave, valor] of Object.entries(dados)) {
                campos.push(`${chave} = ?`);
                valores.push(valor);
            }

            if (campos.length === 0) {
                return { affectedRows: 0 };
            }

            valores.push(id);
            const sql = `UPDATE produtos SET ${campos.join(', ')} WHERE idProduto = ?`;
            const [result] = await connection.execute(sql, valores);
            return result;
        } finally {
            connection.release();
        }
    }

    static async excluirLogico(id) {
        const connection = await getConnection();

        try {
            const [result] = await connection.execute(
                'UPDATE produtos SET ativo = 0 WHERE idProduto = ?',
                [id]
            );
            return result.affectedRows;
        } finally {
            connection.release();
        }
    }
}

export default ProdutoModel;
