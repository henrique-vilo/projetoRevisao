import { create, read, update, deleteRecord, getConnection } from '../config/database.js';

// Model para operações com modelos de produtos
class ModeloModel {
    // Listar todos os modelos (com paginação)
    static async listarTodos(limite, offset) {
        try {
            const connection = await getConnection();
            try {
                const sql = 'SELECT * FROM modelos ORDER BY idModelo DESC LIMIT ? OFFSET ?';

                const [modelos] = await connection.query(sql, [limite, offset]);

                const [totalResult] = await connection.execute('SELECT COUNT(*) as total FROM modelos');
                const total = totalResult[0].total;

                const paginaAtual = (offset / limite) + 1;
                const totalPaginas = Math.ceil(total / limite);

                return {
                    modelos,
                    total,
                    pagina: paginaAtual,
                    limite,
                    totalPaginas
                };
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Erro ao listar modelos:', error);
            throw error;
        }
    }

    // Buscar modelos por ID
    static async buscarPorId(id) {
        try {
            const rows = await read('modelos', `idModelo = ${id}`);
            return rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar modelos por ID:', error);
            throw error;
        }
    }

    // Criar novo modelos
    static async criar(dadosModelo) {
        try {
            return await create('modelos', dadosModelo);
        } catch (error) {
            console.error('Erro ao criar modelos:', error);
            throw error;
        }
    }

    // Atualizar modelos
    static async atualizar(id, dadosModelo) {
        try {
            return await update('modelos', dadosModelo, `idModelo = ${id}`);
        } catch (error) {
            console.error('Erro ao atualizar modelos:', error);
            throw error;
        }
    }

    // Excluir modelos
    static async excluir(id) {
        try {
            return await deleteRecord('modelos', `idModelo = ${id}`);
        } catch (error) {
            console.error('Erro ao excluir modelos:', error);
            throw error;
        }
    }

    // Buscar modelos por nome
    static async buscarPorNome(nomeModelo) {
        try {
            return await read('modelos', `nomeModelo = '${nomeModelo}'`);
        } catch (error) {
            console.error('Erro ao buscar modelos por nome:', error);
            throw error;
        }
    }
}

export default ModeloModel;