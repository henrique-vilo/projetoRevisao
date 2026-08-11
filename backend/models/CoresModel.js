import { create, read, update, deleteRecord, getConnection } from '../config/database.js';

// Model para operações com cores
class CoresModel {
    // Listar todas as cores (com paginação)
    static async listarTodos(limite, offset) {
        try {
            const connection = await getConnection();
            try {
                const sql = 'SELECT * FROM cor ORDER BY idCor DESC LIMIT ? OFFSET ?';

                const [cores] = await connection.query(sql, [limite, offset]);

                const [totalResult] = await connection.execute('SELECT COUNT(*) as total FROM cor');
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

    // Buscar cor por ID
    static async buscarPorId(id) {
        try {
            const rows = await read('cor', `idCor = ${id}`);
            return rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar cor por ID:', error);
            throw error;
        }
    }

    // Criar nova cor
    static async criar(dadosCor) {
        try {
            return await create('cor', dadosCor);
        } catch (error) {
            console.error('Erro ao criar cor:', error);
            throw error;
        }
    }

    // Atualizar cor
    static async atualizar(id, dadosCor) {
        try {
            return await update('cor', dadosCor, `idCor = ${id}`);
        } catch (error) {
            console.error('Erro ao atualizar cor:', error);
            throw error;
        }
    }

    // Excluir cor
    static async excluir(id) {
        try {
            return await deleteRecord('cor', `idCor = ${id}`);
        } catch (error) {
            console.error('Erro ao excluir cor:', error);
            throw error;
        }
    }

    // Buscar cor por nome
    static async buscarPorNome(nomeCor) {
        try {
            return await read('cor', `nomeCor = '${nomeCor}'`);
        } catch (error) {
            console.error('Erro ao buscar cor por nome:', error);
            throw error;
        }
    }
}

export default CoresModel;