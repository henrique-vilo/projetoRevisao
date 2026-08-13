import { create, read, update, deleteRecord, getConnection } from '../config/database.js';

// Model para operações com subcategorias
class SubModel {
    // Listar todas as subcategorias (com paginação)
    static async listarTodos(limite, offset) {
        try {
            const connection = await getConnection();
            try {
                // Utilizando o nome da tabela exatamente como foi criado: subCategorias
                const sql = 'SELECT * FROM subCategorias ORDER BY idSubcategoria DESC LIMIT ? OFFSET ?';

                const [subcategorias] = await connection.query(sql, [limite, offset]);

                const [totalResult] = await connection.execute('SELECT COUNT(*) as total FROM subCategorias');
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
            const rows = await read('subCategorias', `idSubcategoria = ${id}`);
            return rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar subcategoria por ID:', error);
            throw error;
        }
    }

    // Criar nova subcategoria
    static async criar(dadosSubcategoria) {
        try {
            return await create('subCategorias', dadosSubcategoria);
        } catch (error) {
            console.error('Erro ao criar subcategoria:', error);
            throw error;
        }
    }

    // Atualizar subcategoria
    static async atualizar(id, dadosSubcategoria) {
        try {
            return await update('subCategorias', dadosSubcategoria, `idSubcategoria = ${id}`);
        } catch (error) {
            console.error('Erro ao atualizar subcategoria:', error);
            throw error;
        }
    }

    // Excluir subcategoria
    static async excluir(id) {
        try {
            return await deleteRecord('subCategorias', `idSubcategoria = ${id}`);
        } catch (error) {
            console.error('Erro ao excluir subcategoria:', error);
            throw error;
        }
    }

    // Buscar subcategoria por nome
    static async buscarPorNome(nomeSubcategoria) {
        try {
            return await read('subCategorias', `nomeSubcategoria = '${nomeSubcategoria}'`);
        } catch (error) {
            console.error('Erro ao buscar subcategoria por nome:', error);
            throw error;
        }
    }
}

export default SubModel;