import { getConnection } from '../config/database.js';

class ProdutoModel {
    /**
     * Busca avançada e universal com múltiplos filtros para Moda/E-commerce
     */
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
            const offset = (pagina - 1) * limite;
            const conditions = ['p.ativo = 1'];
            const queryParams = [];

            // Filtro por texto (SKU, Nome, Nome Combinação ou Descrição)
            if (busca) {
                conditions.push('(p.nome LIKE ? OR p.nomeCombinacao LIKE ? OR p.descricao LIKE ? OR p.sku LIKE ?)');
                queryParams.push(`%${busca}%`, `%${busca}%`, `%${busca}%`, `%${busca}%`);
            }

            // Filtro por Gênero
            if (genero) {
                conditions.push('p.genero = ?');
                queryParams.push(genero);
            }

            // Filtros por IDs de tabelas relacionais
            if (idCategoria) {
                conditions.push('p.idCategoria = ?');
                queryParams.push(parseInt(idCategoria));
            }
            if (idSubcategoria) {
                conditions.push('p.idSubcategoria = ?');
                queryParams.push(parseInt(idSubcategoria));
            }
            if (idCor) {
                conditions.push('p.idCor = ?');
                queryParams.push(parseInt(idCor));
            }
            if (idTamanho) {
                conditions.push('p.idTamanho = ?');
                queryParams.push(parseInt(idTamanho));
            }
            if (idModelo) {
                conditions.push('p.idModelo = ?');
                queryParams.push(parseInt(idModelo));
            }

            // Filtro por faixa de preço
            if (precoMin) {
                conditions.push('p.preco >= ?');
                queryParams.push(parseFloat(precoMin));
            }
            if (precoMax) {
                conditions.push('p.preco <= ?');
                queryParams.push(parseFloat(precoMax));
            }

            // Apenas itens em estoque
            if (emEstoque === 'true' || emEstoque === true) {
                conditions.push('p.estoque > 0');
            }

            const whereClause = conditions.join(' AND ');

            // Ordenação segura
            let orderClause = 'p.idProduto DESC';
            switch (ordenarPor) {
                case 'preco_asc': orderClause = 'p.preco ASC'; break;
                case 'preco_desc': orderClause = 'p.preco DESC'; break;
                case 'nome_asc': orderClause = 'p.nome ASC'; break;
                case 'antigo': orderClause = 'p.idProduto ASC'; break;
            }

            // Consulta principal trazendo nomes legíveis das chaves estrangeiras
            const sql = `
                SELECT 
                    p.*,
                    c.nome AS categoriaNome,
                    s.nome AS subcategoriaNome,
                    cr.nome AS corNome,
                    t.nome AS tamanhoNome,
                    m.nome AS modeloNome
                FROM produtos p
                LEFT JOIN categorias c ON p.idCategoria = c.idCategoria
                LEFT JOIN subcategorias s ON p.idSubcategoria = s.idSubcategoria
                LEFT JOIN cores cr ON p.idCor = cr.idCor
                LEFT JOIN tamanhos t ON p.idTamanho = t.idTamanho
                LEFT JOIN modelos m ON p.idModelo = m.idModelo
                WHERE ${whereClause}
                ORDER BY ${orderClause}
                LIMIT ? OFFSET ?
            `;

            const [produtos] = await connection.query(sql, [...queryParams, parseInt(limite), parseInt(offset)]);

            // Contagem total para paginação
            const countSql = `SELECT COUNT(*) as total FROM produtos p WHERE ${whereClause}`;
            const [totalResult] = await connection.query(countSql, queryParams);
            const total = totalResult[0].total;

            return {
                produtos,
                total,
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                totalPaginas: Math.ceil(total / limite)
            };
        } finally {
            connection.release();
        }
    }

    static async buscarPorId(id) {
        const connection = await getConnection();
        try {
            const sql = `
                SELECT p.*, c.nome AS categoriaNome, s.nome AS subcategoriaNome, 
                       cr.nome AS corNome, t.nome AS tamanhoNome, m.nome AS modeloNome
                FROM produtos p
                LEFT JOIN categorias c ON p.idCategoria = c.idCategoria
                LEFT JOIN subcategorias s ON p.idSubcategoria = s.idSubcategoria
                LEFT JOIN cores cr ON p.idCor = cr.idCor
                LEFT JOIN tamanhos t ON p.idTamanho = t.idTamanho
                LEFT JOIN modelos m ON p.idModelo = m.idModelo
                WHERE p.idProduto = ? AND p.ativo = 1
            `;
            const [rows] = await connection.execute(sql, [id]);
            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    static async criar(dados) {
        const connection = await getConnection();
        try {
            const sql = `
                INSERT INTO produtos 
                (sku, nome, nomeCombinacao, descricao, genero, preco, idCategoria, idSubcategoria, idCor, idTamanho, idModelo, imagem1, imagem2, imagem3, imagem4, estoque)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const valores = [
                dados.sku, dados.nome, dados.nomeCombinacao, dados.descricao, dados.genero || 'Unissex', 
                dados.preco, dados.idCategoria, dados.idSubcategoria, dados.idCor, 
                dados.idTamanho, dados.idModelo, dados.imagem1, dados.imagem2 || null, 
                dados.imagem3 || null, dados.imagem4 || null, dados.estoque
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

            if (campos.length === 0) return { affectedRows: 0 };

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
            const [result] = await connection.execute('UPDATE produtos SET ativo = 0 WHERE idProduto = ?', [id]);
            return result.affectedRows;
        } finally {
            connection.release();
        }
    }
}

export default ProdutoModel;