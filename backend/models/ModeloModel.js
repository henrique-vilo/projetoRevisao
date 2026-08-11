import { create, read, update, deleteRecord, getConnection } from '../config/database.js';

// Model para operações com modelos de produtos
class ModeloModel {
    // Listar todos os modelos (com paginação)
    static async listarTodos(limite, offset) {
        try {
            const connection = await getConnection();
            try {
                const sql = 'SELECT * FROM modelo ORDER BY idModelo DESC LIMIT ? OFFSET ?';

                const [modelos] = await connection.query(sql, [limite, offset]);

                const [totalResult] = await connection.execute('SELECT COUNT(*) as total FROM modelo');
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

    // Buscar modelo por ID
    static async buscarPorId(id) {
        try {
            const rows = await read('modelo', `idModelo = ${id}`);
            return rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar modelo por ID:', error);
            throw error;
        }
    }

    // Criar novo modelo
    static async criar(dadosModelo) {
        try {
            return await create('modelo', dadosModelo);
        } catch (error) {
            console.error('Erro ao criar modelo:', error);
            throw error;
        }
    }

    // Atualizar modelo
    static async atualizar(id, dadosModelo) {
        try {
            return await update('modelo', dadosModelo, `idModelo = ${id}`);
        } catch (error) {
            console.error('Erro ao atualizar modelo:', error);
            throw error;
        }
    }

    // Excluir modelo
    static async excluir(id) {
        try {
            return await deleteRecord('modelo', `idModelo = ${id}`);
        } catch (error) {
            console.error('Erro ao excluir modelo:', error);
            throw error;
        }
    }

    // Buscar modelo por nome
    static async buscarPorNome(nomeModelo) {
        try {
            return await read('modelo', `nomeModelo = '${nomeModelo}'`);
        } catch (error) {
            console.error('Erro ao buscar modelo por nome:', error);
            throw error;
        }
    }
}

export default ModeloModel;