import { getConnection } from '../config/database.js';

const CAMPOS = new Set(['idUsuario', 'idProduto', 'dataPedido', 'dataEntrega', 'status']);
const SELECT_VENDAS = `SELECT v.*, v.STATUS AS status, u.nome AS nomeUsuario, p.nome AS nomeProduto
    FROM vendas v
    LEFT JOIN usuarios u ON u.idUsuario = v.idUsuario
    LEFT JOIN produtos p ON p.idProduto = v.idProduto`;

async function consultar(sql, params = []) {
    const connection = await getConnection();
    try {
        const [result] = await connection.query(sql, params);
        return result;
    } finally {
        connection.release();
    }
}

function camposValidos(dados) {
    const entries = Object.entries(dados).filter(([key, value]) => CAMPOS.has(key) && value !== undefined);
    if (!entries.length) throw new Error('Nenhum campo válido para salvar.');
    return entries.map(([key, value]) => [key === 'status' ? 'STATUS' : key, value]);
}

class VendaModel {
    static async listarTodos(limite, offset, busca = '', idUsuario = null) {
        const conditions = [];
        const params = [];
        if (idUsuario !== null) {
            conditions.push('v.idUsuario = ?');
            params.push(idUsuario);
        }
        if (busca) {
            conditions.push(`(CAST(v.idVendas AS CHAR) LIKE ? OR CAST(v.idUsuario AS CHAR) LIKE ?
                OR CAST(v.idProduto AS CHAR) LIKE ? OR u.nome LIKE ? OR p.nome LIKE ? OR v.STATUS LIKE ?)`);
            params.push(...Array(6).fill(`%${busca}%`));
        }
        const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
        const connection = await getConnection();
        try {
            const [vendas] = await connection.query(`${SELECT_VENDAS}${where} ORDER BY v.idVendas DESC LIMIT ? OFFSET ?`, [...params, limite, offset]);
            const [totais] = await connection.query(`SELECT COUNT(*) AS total FROM vendas v
                LEFT JOIN usuarios u ON u.idUsuario = v.idUsuario
                LEFT JOIN produtos p ON p.idProduto = v.idProduto${where}`, params);
            const total = Number(totais[0].total);
            return { vendas, total, pagina: offset / limite + 1, limite, totalPaginas: Math.ceil(total / limite) };
        } finally {
            connection.release();
        }
    }

    static async buscarPorId(id) {
        const rows = await consultar(`${SELECT_VENDAS} WHERE v.idVendas = ?`, [id]);
        return rows[0] || null;
    }

    static async buscarPorUsuario(idUsuario) {
        return consultar(`${SELECT_VENDAS} WHERE v.idUsuario = ? ORDER BY v.idVendas DESC`, [idUsuario]);
    }

    static async buscarCarrinho(idUsuario) {
        const rows = await consultar(
            `SELECT
                v.idProduto,
                GROUP_CONCAT(v.idVendas ORDER BY v.idVendas) AS idsVendas,
                COUNT(*) AS quantidade,
                p.nome,
                p.nomeCombinacao AS variacao,
                p.preco,
                p.imagem1 AS imagem,
                p.estoque
             FROM vendas v
             INNER JOIN produtos p ON p.idProduto = v.idProduto
             WHERE v.idUsuario = ? AND v.STATUS = 'carrinho'
             GROUP BY
                v.idProduto, p.nome, p.nomeCombinacao, p.preco,
                p.imagem1, p.estoque
             ORDER BY MIN(v.idVendas) DESC`,
            [idUsuario]
        );

        return rows.map((item) => ({
            ...item,
            idsVendas: String(item.idsVendas)
                .split(',')
                .map(Number)
                .filter(Number.isSafeInteger),
            quantidade: Number(item.quantidade),
            preco: Number(item.preco),
            estoque: Number(item.estoque),
        }));
    }

    static async buscarUsuarioVenda(idUsuario) {
        const rows = await consultar('SELECT idUsuario, cep FROM usuarios WHERE idUsuario = ?', [idUsuario]);
        return rows[0] || null;
    }

    static async buscarProdutoVenda(idProduto) {
        const rows = await consultar('SELECT idProduto FROM produtos WHERE idProduto = ?', [idProduto]);
        return rows[0] || null;
    }

    static async criar(dadosVenda) {
        const entries = camposValidos(dadosVenda);
        const result = await consultar(`INSERT INTO vendas (${entries.map(([key]) => key).join(', ')}) VALUES (${entries.map(() => '?').join(', ')})`, entries.map(([, value]) => value));
        return result.insertId;
    }

    static async adicionarAoCarrinho(idUsuario, idProduto) {
        const connection = await getConnection();
        try {
            await connection.beginTransaction();

            const [produtos] = await connection.execute(
                `SELECT idProduto, estoque, ativo
                 FROM produtos
                 WHERE idProduto = ?
                 FOR UPDATE`,
                [idProduto]
            );
            const produto = produtos[0];

            if (!produto || !Number(produto.ativo)) {
                const error = new Error('Produto não encontrado ou indisponível.');
                error.code = 'PRODUTO_INDISPONIVEL';
                throw error;
            }

            const [quantidades] = await connection.execute(
                `SELECT COUNT(*) AS quantidade
                 FROM vendas
                 WHERE idUsuario = ? AND idProduto = ? AND STATUS = 'carrinho'`,
                [idUsuario, idProduto]
            );

            if (Number(quantidades[0].quantidade) >= Number(produto.estoque)) {
                const error = new Error('Não há mais unidades disponíveis deste produto.');
                error.code = 'ESTOQUE_INSUFICIENTE';
                throw error;
            }

            const [resultado] = await connection.execute(
                `INSERT INTO vendas (idUsuario, idProduto, dataPedido, dataEntrega, STATUS)
                 VALUES (?, ?, NULL, NULL, 'carrinho')`,
                [idUsuario, idProduto]
            );

            await connection.commit();
            return resultado.insertId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async removerDoCarrinho(idVenda, idUsuario) {
        const result = await consultar(
            `DELETE FROM vendas
             WHERE idVendas = ? AND idUsuario = ? AND STATUS = 'carrinho'`,
            [idVenda, idUsuario]
        );
        return result.affectedRows;
    }

    static async confirmarCarrinho(idUsuario, dataPedido, dataEntrega) {
        const connection = await getConnection();
        try {
            await connection.beginTransaction();

            const [itens] = await connection.execute(
                `SELECT v.idVendas, v.idProduto, p.nome, p.estoque, p.ativo
                 FROM vendas v
                 INNER JOIN produtos p ON p.idProduto = v.idProduto
                 WHERE v.idUsuario = ? AND v.STATUS = 'carrinho'
                 ORDER BY v.idVendas
                 FOR UPDATE`,
                [idUsuario]
            );

            if (!itens.length) {
                const error = new Error('Seu carrinho está vazio.');
                error.code = 'CARRINHO_VAZIO';
                throw error;
            }

            const produtos = new Map();
            for (const item of itens) {
                const atual = produtos.get(item.idProduto);
                produtos.set(item.idProduto, {
                    nome: item.nome,
                    estoque: Number(item.estoque),
                    ativo: Number(item.ativo),
                    quantidade: (atual?.quantidade || 0) + 1,
                });
            }

            for (const [idProduto, produto] of produtos) {
                if (!produto.ativo || produto.estoque < produto.quantidade) {
                    const error = new Error(`Estoque insuficiente para ${produto.nome || `produto ${idProduto}`}.`);
                    error.code = 'ESTOQUE_INSUFICIENTE';
                    throw error;
                }

                const [resultadoEstoque] = await connection.execute(
                    `UPDATE produtos
                     SET estoque = estoque - ?
                     WHERE idProduto = ? AND ativo = 1 AND estoque >= ?`,
                    [produto.quantidade, idProduto, produto.quantidade]
                );

                if (!resultadoEstoque.affectedRows) {
                    const error = new Error(`Estoque insuficiente para ${produto.nome || `produto ${idProduto}`}.`);
                    error.code = 'ESTOQUE_INSUFICIENTE';
                    throw error;
                }
            }

            const [resultado] = await connection.execute(
                `UPDATE vendas
                 SET dataPedido = ?, dataEntrega = ?, STATUS = 'processando'
                 WHERE idUsuario = ? AND STATUS = 'carrinho'`,
                [dataPedido, dataEntrega, idUsuario]
            );

            await connection.commit();
            return {
                idsVendas: itens.map((item) => item.idVendas),
                quantidadeItens: resultado.affectedRows,
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async atualizar(id, dadosVenda) {
        const entries = camposValidos(dadosVenda);
        const result = await consultar(`UPDATE vendas SET ${entries.map(([key]) => `${key} = ?`).join(', ')} WHERE idVendas = ?`, [...entries.map(([, value]) => value), id]);
        return result.affectedRows;
    }

    static async excluir(id) {
        const result = await consultar('DELETE FROM vendas WHERE idVendas = ?', [id]);
        return result.affectedRows;
    }
}

export default VendaModel;
