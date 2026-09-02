import { create, update, deleteRecord, getConnection } from '../config/database.js';

class VendaModel {
    // Listar todas as vendas (com paginação)
    static async listarTodos(limite, offset) {
        try {
            const connection = await getConnection();
            try {
                const sql = 'SELECT * FROM vendas ORDER BY idVendas DESC LIMIT ? OFFSET ?';
                const [vendas] = await connection.query(sql, [limite, offset]);
                const [totalResult] = await connection.execute('SELECT COUNT(*) as total FROM vendas');
                
                return {
                    vendas,
                    total: totalResult[0].total,
                    pagina: (offset / limite) + 1,
                    limite,
                    totalPaginas: Math.ceil(totalResult[0].total / limite)
                };
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Erro ao listar vendas:', error);
            throw error;
        }
    }

    // Buscar venda por ID
    static async buscarPorId(id) {
        const connection = await getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM vendas WHERE idVendas = ?',
                [id]
            );
            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    // Buscar vendas por ID do usuário
    static async buscarPorUsuario(idUsuario) {
        const connection = await getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM vendas WHERE idUsuario = ?',
                [idUsuario]
            );
            return rows;
        } finally {
            connection.release();
        }
    }

    // Busca rápida de usuário para cálculo de CEP
    static async buscarUsuarioVenda(idUsuario) {
        const connection = await getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT idUsuario, cep FROM usuarios WHERE idUsuario = ?',
                [idUsuario]
            );
            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    static async buscarCarrinho(idUsuario) {
        const connection = await getConnection();
        try {
            const [rows] = await connection.execute(
                `SELECT
                    v.idProduto,
                    GROUP_CONCAT(v.idVendas ORDER BY v.idVendas) AS idsVendas,
                    COUNT(*) AS quantidade,
                    p.nome,
                    p.nomeCombinacao,
                    p.preco,
                    p.imagem1,
                    p.estoque
                FROM vendas v
                INNER JOIN produtos p ON p.idProduto = v.idProduto
                WHERE v.idUsuario = ? AND v.status = 'carrinho'
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
                    .filter(Number.isInteger),
                quantidade: Number(item.quantidade),
                preco: Number(item.preco),
                estoque: Number(item.estoque)
            }));
        } finally {
            connection.release();
        }
    }

    static async buscarEntregasPorUsuario(idUsuario) {
        const connection = await getConnection();
        try {
            const [rows] = await connection.execute(
                `SELECT
                    v.idVendas,
                    v.idUsuario,
                    v.idProduto,
                    v.dataPedido,
                    v.dataEntrega,
                    v.status,
                    p.nome,
                    p.nomeCombinacao,
                    p.preco,
                    p.imagem1,
                    u.cep
                FROM vendas v
                INNER JOIN produtos p ON p.idProduto = v.idProduto
                INNER JOIN usuarios u ON u.idUsuario = v.idUsuario
                WHERE v.idUsuario = ? AND v.status <> 'carrinho'
                ORDER BY v.dataPedido DESC, v.idVendas DESC`,
                [idUsuario]
            );
            return rows.map((item) => ({
                ...item,
                preco: Number(item.preco)
            }));
        } finally {
            connection.release();
        }
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
                 WHERE idUsuario = ? AND idProduto = ? AND status = 'carrinho'`,
                [idUsuario, idProduto]
            );

            if (Number(quantidades[0].quantidade) >= Number(produto.estoque)) {
                const error = new Error('Não há mais unidades disponíveis deste produto.');
                error.code = 'ESTOQUE_INSUFICIENTE';
                throw error;
            }

            const [resultado] = await connection.execute(
                `INSERT INTO vendas (idUsuario, idProduto, dataPedido, dataEntrega, status)
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
        const connection = await getConnection();
        try {
            const [resultado] = await connection.execute(
                `DELETE FROM vendas
                 WHERE idVendas = ? AND idUsuario = ? AND status = 'carrinho'`,
                [idVenda, idUsuario]
            );
            return resultado.affectedRows;
        } finally {
            connection.release();
        }
    }

    static async confirmarCarrinho(idUsuario, dataPedido, dataEntrega) {
        const connection = await getConnection();
        try {
            await connection.beginTransaction();

            const [itens] = await connection.execute(
                `SELECT v.idVendas, v.idProduto, p.nome, p.estoque, p.ativo
                 FROM vendas v
                 INNER JOIN produtos p ON p.idProduto = v.idProduto
                 WHERE v.idUsuario = ? AND v.status = 'carrinho'
                 ORDER BY v.idVendas
                 FOR UPDATE`,
                [idUsuario]
            );

            if (itens.length === 0) {
                const error = new Error('Seu carrinho está vazio.');
                error.code = 'CARRINHO_VAZIO';
                throw error;
            }

            const quantidades = new Map();
            for (const item of itens) {
                quantidades.set(item.idProduto, {
                    nome: item.nome,
                    estoque: Number(item.estoque),
                    ativo: Number(item.ativo),
                    quantidade: (quantidades.get(item.idProduto)?.quantidade || 0) + 1
                });
            }

            for (const [idProduto, item] of quantidades) {
                if (!item.ativo || item.estoque < item.quantidade) {
                    const error = new Error(
                        `Estoque insuficiente para ${item.nome || `produto ${idProduto}`}.`
                    );
                    error.code = 'ESTOQUE_INSUFICIENTE';
                    throw error;
                }

                await connection.execute(
                    `UPDATE produtos
                     SET estoque = estoque - ?,
                         quantidadeVendas = quantidadeVendas + ?
                     WHERE idProduto = ?`,
                    [item.quantidade, item.quantidade, idProduto]
                );
            }

            const [resultado] = await connection.execute(
                `UPDATE vendas
                 SET dataPedido = ?, dataEntrega = ?, status = 'processando'
                 WHERE idUsuario = ? AND status = 'carrinho'`,
                [dataPedido, dataEntrega, idUsuario]
            );

            await connection.commit();
            return {
                idsVendas: itens.map((item) => item.idVendas),
                quantidadeItens: resultado.affectedRows
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async confirmarVenda(idVenda, idUsuario, dataPedido, dataEntrega, permitirAdmin = false) {
        const connection = await getConnection();
        try {
            await connection.beginTransaction();
            const [rows] = await connection.execute(
                `SELECT v.idVendas, v.idUsuario, v.status, v.idProduto,
                        p.nome, p.estoque, p.ativo
                 FROM vendas v
                 INNER JOIN produtos p ON p.idProduto = v.idProduto
                 WHERE v.idVendas = ?
                 FOR UPDATE`,
                [idVenda]
            );
            const venda = rows[0];

            if (!venda || venda.status !== 'carrinho') {
                const error = new Error('Esta venda não está disponível no carrinho.');
                error.code = 'CARRINHO_INVALIDO';
                throw error;
            }
            if (!permitirAdmin && Number(venda.idUsuario) !== Number(idUsuario)) {
                const error = new Error('Você não pode confirmar uma venda de outro usuário.');
                error.code = 'ACESSO_NEGADO';
                throw error;
            }
            if (!Number(venda.ativo) || Number(venda.estoque) < 1) {
                const error = new Error(`Estoque insuficiente para ${venda.nome || 'o produto'}.`);
                error.code = 'ESTOQUE_INSUFICIENTE';
                throw error;
            }

            await connection.execute(
                `UPDATE produtos
                 SET estoque = estoque - 1,
                     quantidadeVendas = quantidadeVendas + 1
                 WHERE idProduto = ?`,
                [venda.idProduto]
            );
            await connection.execute(
                `UPDATE vendas
                 SET dataPedido = ?, dataEntrega = ?, status = 'processando'
                 WHERE idVendas = ?`,
                [dataPedido, dataEntrega, idVenda]
            );

            await connection.commit();
            return venda;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Criar nova venda (Usado para o Carrinho)
    static async criar(dadosVenda) {
        try {
            return await create('vendas', dadosVenda);
        } catch (error) {
            console.error('Erro ao criar venda:', error);
            throw error;
        }
    }

    // Atualizar dados gerais da venda
    static async atualizar(id, dadosVenda) {
        try {
            return await update('vendas', dadosVenda, `idVendas = ${id}`);
        } catch (error) {
            console.error('Erro ao atualizar venda:', error);
            throw error;
        }
    }

    // Excluir venda
    static async excluir(id) {
        try {
            return await deleteRecord('vendas', `idVendas = ${id}`);
        } catch (error) {
            console.error('Erro ao excluir venda:', error);
            throw error;
        }
    }
}

export default VendaModel;
