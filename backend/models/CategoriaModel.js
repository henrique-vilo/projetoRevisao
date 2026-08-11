import { create, read, update, deleteRecord, getConnection } from '../config/database.js';

// Model para operações com categorias
class CategoriaModel {
    // Listar todas as categorias (com paginação)
    static async listarTodos(limite, offset) {
        try {
            const connection = await getConnection();
            try {
                const sql = 'SELECT * FROM categorias ORDER BY idCategoria DESC LIMIT ? OFFSET ?';

                const [categorias] = await connection.query(sql, [limite, offset]);

                const [totalResult] = await connection.execute('SELECT COUNT(*) as total FROM categorias');
                const total = totalResult[0].total;

                const paginaAtual = (offset / limite) + 1;
                const totalPaginas = Math.ceil(total / limite);

                return {
                    categorias,
                    total,
                    pagina: paginaAtual,
                    limite,
                    totalPaginas
                };
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Erro ao listar categorias:', error);
            throw error;
        }
    }

    // Buscar categoria por ID
    static async buscarPorId(id) {
        try {
            const rows = await read('categorias', `idCategoria = ${id}`);
            return rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar categoria por ID:', error);
            throw error;
        }
    }

    // Criar nova categoria
    static async criar(dadosCategoria) {
        try {
            return await create('categorias', dadosCategoria);
        } catch (error) {
            console.error('Erro ao criar categoria:', error);
            throw error;
        }
    }

    // Atualizar categoria
    static async atualizar(id, dadosCategoria) {
        try {
            return await update('categorias', dadosCategoria, `idCategoria = ${id}`);
        } catch (error) {
            console.error('Erro ao atualizar categoria:', error);
            throw error;
        }
    }

    // Excluir categoria
    static async excluir(id) {
        try {
            return await deleteRecord('categorias', `idCategoria = ${id}`);
        } catch (error) {
            console.error('Erro ao excluir categoria:', error);
            throw error;
        }
    }

    // Buscar categoria por nome
    static async buscarPorNome(nomeCategoria) {
        try {
            return await read('categorias', `nomeCategoria = '${nomeCategoria}'`);
        } catch (error) {
            console.error('Erro ao buscar categoria por nome:', error);
            throw error;
        }
    }
}

export default CategoriaModel;