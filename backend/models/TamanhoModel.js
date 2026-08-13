import { create, read, update, deleteRecord, getConnection } from '../config/database.js';

// Model para operações com tamanhos
class TamanhoModel {
    // Listar todos os tamanhos (com paginação)
    static async listarTodos(limite, offset) {
        try {
            const connection = await getConnection();
            try {
                const sql = 'SELECT * FROM tamanhos ORDER BY idTamanho DESC LIMIT ? OFFSET ?';

                const [tamanhos] = await connection.query(sql, [limite, offset]);

                const [totalResult] = await connection.execute('SELECT COUNT(*) as total FROM tamanhos');
                const total = totalResult[0].total;

                const paginaAtual = (offset / limite) + 1;
                const totalPaginas = Math.ceil(total / limite);

                return {
                    tamanhos,
                    total,
                    pagina: paginaAtual,
                    limite,
                    totalPaginas
                };
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Erro ao listar tamanhos:', error);
            throw error;
        }
    }

    // Buscar tamanhos por ID
    static async buscarPorId(id) {
        try {
            const rows = await read('tamanhos', `idTamanho = ${id}`);
            return rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar tamanhos por ID:', error);
            throw error;
        }
    }

    // Criar novo tamanhos
    static async criar(dadosTamanho) {
        try {
            return await create('tamanhos', dadosTamanho);
        } catch (error) {
            console.error('Erro ao criar tamanhos:', error);
            throw error;
        }
    }

    // Atualizar tamanhos
    static async atualizar(id, dadosTamanho) {
        try {
            return await update('tamanhos', dadosTamanho, `idTamanho = ${id}`);
        } catch (error) {
            console.error('Erro ao atualizar tamanhos:', error);
            throw error;
        }
    }

    // Excluir tamanhos
    static async excluir(id) {
        try {
            return await deleteRecord('tamanhos', `idTamanho = ${id}`);
        } catch (error) {
            console.error('Erro ao excluir tamanhos:', error);
            throw error;
        }
    }

    // Buscar por código do tamanhos
    static async buscarPorCodigo(codigoTamanho) {
        try {
            return await read('tamanhos', `codigoTamanho = '${codigoTamanho}'`);
        } catch (error) {
            console.error('Erro ao buscar por código de tamanhos:', error);
            throw error;
        }
    }
}

export default TamanhoModel;