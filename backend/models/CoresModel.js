import { create, read, update, deleteRecord, getConnection } from '../config/database.js';

// Model para operações com cores
class CoresModel {
    // Listar todas as cores (com paginação)
    static async listarTodos(limite, offset) {
        try {
            const connection = await getConnection();
            try {
                const sql = 'SELECT * FROM cores ORDER BY idCor DESC LIMIT ? OFFSET ?';

                const [cores] = await connection.query(sql, [limite, offset]);

                const [totalResult] = await connection.execute('SELECT COUNT(*) as total FROM cores');
                const total = totalResult[0].total;

                const paginaAtual = (offset / limite) + 1;
                const totalPaginas = Math.ceil(total / limite);

                return {
                    cores,
                    total,
                    pagina: paginaAtual,
                    limite,
                    totalPaginas
                };
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Erro ao listar cores:', error);
            throw error;
        }
    }

    // Buscar cores por ID
    static async buscarPorId(id) {
        try {
            const rows = await read('cores', `idCor = ${id}`);
            return rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar cores por ID:', error);
            throw error;
        }
    }

    // Criar nova cores
    static async criar(dadosCor) {
        try {
            return await create('cores', dadosCor);
        } catch (error) {
            console.error('Erro ao criar cores:', error);
            throw error;
        }
    }

    // Atualizar cores
    static async atualizar(id, dadosCor) {
        try {
            return await update('cores', dadosCor, `idCor = ${id}`);
        } catch (error) {
            console.error('Erro ao atualizar cores:', error);
            throw error;
        }
    }

    // Excluir cores
    static async excluir(id) {
        try {
            return await deleteRecord('cores', `idCor = ${id}`);
        } catch (error) {
            console.error('Erro ao excluir cores:', error);
            throw error;
        }
    }

    // Buscar cores por nome
    static async buscarPorNome(nomeCor) {
        try {
            return await read('cores', `nomeCor = '${nomeCor}'`);
        } catch (error) {
            console.error('Erro ao buscar cores por nome:', error);
            throw error;
        }
    }
}

export default CoresModel;