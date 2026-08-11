import { create, read, update, deleteRecord, getConnection } from '../config/database.js';

// Model para operações com subcategorias
class SubcategoriaModel {
    // Listar todas as subcategorias (com paginação)
    static async listarTodos(limite, offset) {
        try {
            const connection = await getConnection();
            try {
                // Utilizando o nome da tabela exatamente como foi criado: subcategoias
                const sql = 'SELECT * FROM subcategoias ORDER BY idSubcategorias DESC LIMIT ? OFFSET ?';

                const [subcategorias] = await connection.query(sql, [limite, offset]);

                const [totalResult] = await connection.execute('SELECT COUNT(*) as total FROM subcategoias');
                const total = totalResult[0].total;

                const paginaAtual = (offset / limite) + 1;
                const totalPaginas = Math.ceil(total / limite);

                return {
                    subcategorias,
                    total,
                    pagina: paginaAtual,
                    limite,
                    totalPaginas
                };
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Erro ao listar subcategorias:', error);
            throw error;
        }
    }

    // Buscar subcategoria por ID
    static async buscarPorId(id) {
        try {
            const rows = await read('subcategoias', `idSubcategorias = ${id}`);
            return rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar subcategoria por ID:', error);
            throw error;
        }
    }

    // Criar nova subcategoria
    static async criar(dadosSubcategoria) {
        try {
            return await create('subcategoias', dadosSubcategoria);
        } catch (error) {
            console.error('Erro ao criar subcategoria:', error);
            throw error;
        }
    }

    // Atualizar subcategoria
    static async atualizar(id, dadosSubcategoria) {
        try {
            return await update('subcategoias', dadosSubcategoria, `idSubcategorias = ${id}`);
        } catch (error) {
            console.error('Erro ao atualizar subcategoria:', error);
            throw error;
        }
    }

    // Excluir subcategoria
    static async excluir(id) {
        try {
            return await deleteRecord('subcategoias', `idSubcategorias = ${id}`);
        } catch (error) {
            console.error('Erro ao excluir subcategoria:', error);
            throw error;
        }
    }

    // Buscar subcategoria por nome
    static async buscarPorNome(nomeSubcategoria) {
        try {
            return await read('subcategoias', `nomeSubcategoria = '${nomeSubcategoria}'`);
        } catch (error) {
            console.error('Erro ao buscar subcategoria por nome:', error);
            throw error;
        }
    }
}

export default SubcategoriaModel;