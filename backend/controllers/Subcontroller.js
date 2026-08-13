import subModel from '../models/subModel.js';

class SubController {

    // GET /subcategorias - Listar todas as subcategorias (com paginação)
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
            const resultado = await subModel.listarTodos(limite, offset);

            res.status(200).json({
                sucesso: true,
                dados: resultado.subcategorias,
                paginacao: {
                    pagina: resultado.pagina,
                    limite: resultado.limite,
                    total: resultado.total,
                    totalPaginas: resultado.totalPaginas
                }
            });
        } catch (error) {
            console.error('Erro ao listar subcategorias:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível listar as subcategorias' });
        }
    }

    // GET /subcategorias/:id - Buscar subcategoria por ID
    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({ sucesso: false, erro: 'ID inválido', mensagem: 'O ID deve ser numérico' });
            }

            const subcategoria = await subModel.buscarPorId(id);

            if (!subcategoria) {
                return res.status(404).json({ sucesso: false, erro: 'Não encontrado', mensagem: `Subcategoria ID ${id} não encontrada` });
            }

            res.status(200).json({ sucesso: true, dados: subcategoria });
        } catch (error) {
            console.error('Erro ao buscar subcategoria:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível buscar a subcategoria' });
        }
    }

    // POST /subcategorias - Criar nova subcategoria
    static async criar(req, res) {
        try {
            const { nomeSubcategoria } = req.body;

            // Validação de campo obrigatório
            if (!nomeSubcategoria || !nomeSubcategoria.trim()) {
                return res.status(400).json({ sucesso: false, erro: "Nome obrigatório", mensagem: "O nome da subcategoria é obrigatório" });
            }

            // Validação de tamanho
            if (nomeSubcategoria.length < 2 || nomeSubcategoria.length > 255) {
                return res.status(400).json({ sucesso: false, erro: 'Tamanho do Nome', mensagem: 'O nome deve ter entre 2 e 255 caracteres' });
            }

            const dadosSubcategoria = {
                nomeSubcategoria: nomeSubcategoria.trim()
            };

            const subcategoriaId = await subModel.criar(dadosSubcategoria);

            res.status(201).json({
                sucesso: true,
                mensagem: 'Subcategoria criada com sucesso',
                dados: { idSubcategorias: subcategoriaId, ...dadosSubcategoria }
            });
        } catch (error) {
            console.error('Erro ao criar subcategoria:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível criar a subcategoria' });
        }
    }

    // PUT /subcategorias/:id - Atualizar subcategoria
    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nomeSubcategoria } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({ sucesso: false, erro: 'ID inválido', mensagem: 'O ID deve ser numérico' });
            }

            const subcategoriaExistente = await subModel.buscarPorId(id);
            if (!subcategoriaExistente) {
                return res.status(404).json({ sucesso: false, erro: 'Não encontrado', mensagem: `Subcategoria ID ${id} não encontrada` });
            }

            const dadosAtualizacao = {};

            if (nomeSubcategoria !== undefined) {
                if (nomeSubcategoria.trim() === '' || nomeSubcategoria.length < 2 || nomeSubcategoria.length > 255) {
                    return res.status(400).json({ sucesso: false, erro: 'Nome inválido', mensagem: 'O nome deve ter entre 2 e 255 caracteres' });
                }
                dadosAtualizacao.nomeSubcategoria = nomeSubcategoria.trim();
            }

            if (Object.keys(dadosAtualizacao).length === 0) {
                return res.status(400).json({ sucesso: false, erro: 'Sem alterações', mensagem: 'Nenhum dado válido fornecido para atualização' });
            }

            const resultado = await subModel.atualizar(id, dadosAtualizacao);

            res.status(200).json({
                sucesso: true,
                mensagem: 'Subcategoria atualizada com sucesso',
                dados: { linhasAfetadas: resultado.affectedRows || 1 }
            });
        } catch (error) {
            console.error('Erro ao atualizar subcategoria:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível atualizar a subcategoria' });
        }
    }

    // DELETE /subcategorias/:id - Excluir subcategoria
    static async excluir(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({ sucesso: false, erro: 'ID inválido', mensagem: 'O ID deve ser numérico' });
            }

            const subcategoriaExistente = await subModel.buscarPorId(id);
            if (!subcategoriaExistente) {
                return res.status(404).json({ sucesso: false, erro: 'Não encontrado', mensagem: `Subcategoria ID ${id} não encontrada` });
            }

            const resultado = await subModel.excluir(id);

            res.status(200).json({
                sucesso: true,
                mensagem: 'Subcategoria excluída com sucesso',
                dados: { linhasAfetadas: resultado || 1 }
            });
        } catch (error) {
            console.error('Erro ao excluir subcategoria:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível excluir a subcategoria' });
        }
    }
}

export default SubController;