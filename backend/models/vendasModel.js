import { create, read, update, deleteRecord, getConnection } from '../config/database.js';

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

    // Busca itens do carrinho já com dados do produto (nome, preço, imagem, variação)
static async buscarCarrinhoComProdutos(idUsuario) {
    try {
        const connection = await getConnection();
        try {
            const sql = `
                SELECT v.idVendas, v.idUsuario, v.idProduto, v.status,
                       p.nome, p.nomeCombinacao, p.preco, p.imagem1
                FROM vendas v
                INNER JOIN produtos p ON p.idProduto = v.idProduto
                WHERE v.idUsuario = ? AND v.status = 'carrinho'
                ORDER BY v.idVendas ASC
            `;
            const [linhas] = await connection.query(sql, [idUsuario]);
            return linhas;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Erro ao buscar carrinho com produtos:', error);
        throw error;
    }
}

    // Buscar venda por ID
    static async buscarPorId(id) {
        try {
            const rows = await read('vendas', `idVendas = ${id}`);
            return rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar venda por ID:', error);
            throw error;
        }
    }

    // Buscar vendas por ID do usuário
    static async buscarPorUsuario(idUsuario) {
        try {
            return await read('vendas', `idUsuario = ${idUsuario}`);
        } catch (error) {
            console.error('Erro ao buscar vendas por usuário:', error);
            throw error;
        }
    }

    // Busca rápida de usuário para cálculo de CEP
    static async buscarUsuarioVenda(idUsuario) {
        try {
            const rows = await read('usuarios', `idUsuario = ${idUsuario}`);
            return rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar usuário da venda:', error);
            throw error;
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