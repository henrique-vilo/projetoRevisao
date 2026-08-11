import { create, read, update, deleteRecord, getConnection } from '../config/database.js';

// Model para operações com tamanhos
class TamanhoModel {
    // Listar todos os tamanhos (com paginação)
    static async listarTodos(limite, offset) {
        try {
            const connection = await getConnection();
            try {
                const sql = 'SELECT * FROM tamanho ORDER BY idTamanho DESC LIMIT ? OFFSET ?';

                const [tamanhos] = await connection.query(sql, [limite, offset]);

                const [totalResult] = await connection.execute('SELECT COUNT(*) as total FROM tamanho');
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

    // Buscar tamanho por ID
    static async buscarPorId(id) {
        try {
            const rows = await read('tamanho', `idTamanho = ${id}`);
            return rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar tamanho por ID:', error);
            throw error;
        }
    }

    // Criar novo tamanho
    static async criar(dadosTamanho) {
        try {
            return await create('tamanho', dadosTamanho);
        } catch (error) {
            console.error('Erro ao criar tamanho:', error);
            throw error;
        }
    }

    // Atualizar tamanho
    static async atualizar(id, dadosTamanho) {
        try {
            return await update('tamanho', dadosTamanho, `idTamanho = ${id}`);
        } catch (error) {
            console.error('Erro ao atualizar tamanho:', error);
            throw error;
        }
    }

    // Excluir tamanho
    static async excluir(id) {
        try {
            return await deleteRecord('tamanho', `idTamanho = ${id}`);
        } catch (error) {
            console.error('Erro ao excluir tamanho:', error);
            throw error;
        }
    }

    // Buscar por código do tamanho
    static async buscarPorCodigo(codigoTamanho) {
        try {
            return await read('tamanho', `codigoTamanho = '${codigoTamanho}'`);
        } catch (error) {
            console.error('Erro ao buscar por código de tamanho:', error);
            throw error;
        }
    }
}

export default TamanhoModel;