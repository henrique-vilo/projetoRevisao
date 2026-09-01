import CategoriaModel from '../models/CategoriaModel.js';

class CategoriaController {

    // GET /categorias/menu - Menu público com subcategorias relacionadas
    static async listarMenu(req, res) {
        try {
            const categorias = await CategoriaModel.listarMenu();
            return res.status(200).json({ sucesso: true, dados: categorias });
        } catch (error) {
            console.error('Erro ao montar menu de categorias:', error);
            return res.status(500).json({
                sucesso: false,
                erro: 'Erro interno',
                mensagem: 'Não foi possível carregar o menu de categorias'
            });
        }
    }

    // GET /categorias - Listar todas as categorias (com paginação)
    static async listarTodos(req, res) {
        try {
            const pagina = parseInt(req.query.pagina) || 1;
            const limite = parseInt(req.query.limite) || 10;

            if (pagina <= 0) {
                return res.status(400).json({ sucesso: false, erro: 'Página inválida', mensagem: 'A página deve ser maior que zero' });
            }
            if (limite <= 0) {
                return res.status(400).json({ sucesso: false, erro: 'Limite inválido', mensagem: 'O limite deve ser maior que zero' });
            }

            const limiteMaximo = parseInt(process.env.PAGINACAO_LIMITE_MAXIMO) || 100;
            if (limite > limiteMaximo) {
                return res.status(400).json({ sucesso: false, erro: 'Limite inválido', mensagem: `O limite deve ser entre 1 e ${limiteMaximo}` });
            }

            const offset = (pagina - 1) * limite;
            const resultado = await CategoriaModel.listarTodos(limite, offset);

            res.status(200).json({
                sucesso: true,
                dados: resultado.categorias,
                paginacao: {
                    pagina: resultado.pagina,
                    limite: resultado.limite,
                    total: resultado.total,
                    totalPaginas: resultado.totalPaginas
                }
            });
        } catch (error) {
            console.error('Erro ao listar categorias:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível listar as categorias' });
        }
    }

    // GET /categorias/:id - Buscar categoria por ID
    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({ sucesso: false, erro: 'ID inválido', mensagem: 'O ID deve ser numérico' });
            }

            const categoria = await CategoriaModel.buscarPorId(id);

            if (!categoria) {
                return res.status(404).json({ sucesso: false, erro: 'Não encontrado', mensagem: `Categoria ID ${id} não encontrada` });
            }

            res.status(200).json({ sucesso: true, dados: categoria });
        } catch (error) {
            console.error('Erro ao buscar categoria:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível buscar a categoria' });
        }
    }

    // POST /categorias - Criar nova categoria
    static async criar(req, res) {
        try {
            const { nomeCategoria } = req.body;

            // Validação de campo obrigatório
            if (!nomeCategoria || !nomeCategoria.trim()) {
                return res.status(400).json({ sucesso: false, erro: "Nome obrigatório", mensagem: "O nome da categoria é obrigatório" });
            }

            // Validação de tamanho
            if (nomeCategoria.length < 2 || nomeCategoria.length > 255) {
                return res.status(400).json({ sucesso: false, erro: 'Tamanho do Nome', mensagem: 'O nome deve ter entre 2 e 255 caracteres' });
            }

            const dadosCategoria = {
                nomeCategoria: nomeCategoria.trim()
            };

            const categoriaId = await CategoriaModel.criar(dadosCategoria);

            res.status(201).json({
                sucesso: true,
                mensagem: 'Categoria criada com sucesso',
                dados: { idCategoria: categoriaId, ...dadosCategoria }
            });
        } catch (error) {
            console.error('Erro ao criar categoria:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível criar a categoria' });
        }
    }

    // PUT /categorias/:id - Atualizar categoria
    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nomeCategoria } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({ sucesso: false, erro: 'ID inválido', mensagem: 'O ID deve ser numérico' });
            }

            const categoriaExistente = await CategoriaModel.buscarPorId(id);
            if (!categoriaExistente) {
                return res.status(404).json({ sucesso: false, erro: 'Não encontrado', mensagem: `Categoria ID ${id} não encontrada` });
            }

            const dadosAtualizacao = {};

            if (nomeCategoria !== undefined) {
                if (nomeCategoria.trim() === '' || nomeCategoria.length < 2 || nomeCategoria.length > 255) {
                    return res.status(400).json({ sucesso: false, erro: 'Nome inválido', mensagem: 'O nome deve ter entre 2 e 255 caracteres' });
                }
                dadosAtualizacao.nomeCategoria = nomeCategoria.trim();
            }

            if (Object.keys(dadosAtualizacao).length === 0) {
                return res.status(400).json({ sucesso: false, erro: 'Sem alterações', mensagem: 'Nenhum dado válido fornecido para atualização' });
            }

            const resultado = await CategoriaModel.atualizar(id, dadosAtualizacao);

            res.status(200).json({
                sucesso: true,
                mensagem: 'Categoria atualizada com sucesso',
                dados: { linhasAfetadas: resultado.affectedRows || 1 }
            });
        } catch (error) {
            console.error('Erro ao atualizar categoria:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível atualizar a categoria' });
        }
    }

    // DELETE /categorias/:id - Excluir categoria
    static async excluir(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({ sucesso: false, erro: 'ID inválido', mensagem: 'O ID deve ser numérico' });
            }

            const categoriaExistente = await CategoriaModel.buscarPorId(id);
            if (!categoriaExistente) {
                return res.status(404).json({ sucesso: false, erro: 'Não encontrado', mensagem: `Categoria ID ${id} não encontrada` });
            }

            const resultado = await CategoriaModel.excluir(id);

            res.status(200).json({
                sucesso: true,
                mensagem: 'Categoria excluída com sucesso',
                dados: { linhasAfetadas: resultado || 1 }
            });
        } catch (error) {
            console.error('Erro ao excluir categoria:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível excluir a categoria' });
        }
    }
}

export default CategoriaController;
