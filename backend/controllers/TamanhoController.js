import TamanhoModel from '../models/TamanhoModel.js';

class TamanhoController {

    // GET /tamanhos - Listar todos os tamanhos (com paginação)
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
            const resultado = await TamanhoModel.listarTodos(limite, offset);

            res.status(200).json({
                sucesso: true,
                dados: resultado.tamanhos,
                paginacao: {
                    pagina: resultado.pagina,
                    limite: resultado.limite,
                    total: resultado.total,
                    totalPaginas: resultado.totalPaginas
                }
            });
        } catch (error) {
            console.error('Erro ao listar tamanhos:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível listar os tamanhos' });
        }
    }

    // GET /tamanhos/:id - Buscar tamanho por ID
    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({ sucesso: false, erro: 'ID inválido', mensagem: 'O ID deve ser numérico' });
            }

            const tamanho = await TamanhoModel.buscarPorId(id);

            if (!tamanho) {
                return res.status(404).json({ sucesso: false, erro: 'Não encontrado', mensagem: `Tamanho ID ${id} não encontrado` });
            }

            res.status(200).json({ sucesso: true, dados: tamanho });
        } catch (error) {
            console.error('Erro ao buscar tamanho:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível buscar o tamanho' });
        }
    }

    // POST /tamanhos - Criar novo tamanho
    static async criar(req, res) {
        try {
            const { codigoTamanho } = req.body;

            // Validação de campo obrigatório
            if (!codigoTamanho || !codigoTamanho.trim()) {
                return res.status(400).json({ sucesso: false, erro: "Código obrigatório", mensagem: "O código do tamanho é obrigatório" });
            }

            // Validação de tamanho
            if (codigoTamanho.length > 100) {
                return res.status(400).json({ sucesso: false, erro: 'Tamanho do Código', mensagem: 'O código do tamanho deve ter no máximo 100 caracteres' });
            }

            const dadosTamanho = {
                codigoTamanho: codigoTamanho.trim()
            };

            const tamanhoId = await TamanhoModel.criar(dadosTamanho);

            res.status(201).json({
                sucesso: true,
                mensagem: 'Tamanho criado com sucesso',
                dados: { idTamanho: tamanhoId, ...dadosTamanho }
            });
        } catch (error) {
            console.error('Erro ao criar tamanho:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível criar o tamanho' });
        }
    }

    // PUT /tamanhos/:id - Atualizar tamanho
    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { codigoTamanho } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({ sucesso: false, erro: 'ID inválido', mensagem: 'O ID deve ser numérico' });
            }

            const tamanhoExistente = await TamanhoModel.buscarPorId(id);
            if (!tamanhoExistente) {
                return res.status(404).json({ sucesso: false, erro: 'Não encontrado', mensagem: `Tamanho ID ${id} não encontrado` });
            }

            const dadosAtualizacao = {};

            if (codigoTamanho !== undefined) {
                if (codigoTamanho.trim() === '' || codigoTamanho.length > 100) {
                    return res.status(400).json({ sucesso: false, erro: 'Código inválido', mensagem: 'O código do tamanho deve ser informado e ter no máximo 100 caracteres' });
                }
                dadosAtualizacao.codigoTamanho = codigoTamanho.trim();
            }

            if (Object.keys(dadosAtualizacao).length === 0) {
                return res.status(400).json({ sucesso: false, erro: 'Sem alterações', mensagem: 'Nenhum dado válido fornecido para atualização' });
            }

            const resultado = await TamanhoModel.atualizar(id, dadosAtualizacao);

            res.status(200).json({
                sucesso: true,
                mensagem: 'Tamanho atualizado com sucesso',
                dados: { linhasAfetadas: resultado.affectedRows || 1 }
            });
        } catch (error) {
            console.error('Erro ao atualizar tamanho:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível atualizar o tamanho' });
        }
    }

    // DELETE /tamanhos/:id - Excluir tamanho
    static async excluir(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({ sucesso: false, erro: 'ID inválido', mensagem: 'O ID deve ser numérico' });
            }

            const tamanhoExistente = await TamanhoModel.buscarPorId(id);
            if (!tamanhoExistente) {
                return res.status(404).json({ sucesso: false, erro: 'Não encontrado', mensagem: `Tamanho ID ${id} não encontrado` });
            }

            const resultado = await TamanhoModel.excluir(id);

            res.status(200).json({
                sucesso: true,
                mensagem: 'Tamanho excluído com sucesso',
                dados: { linhasAfetadas: resultado || 1 }
            });
        } catch (error) {
            console.error('Erro ao excluir tamanho:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível excluir o tamanho' });
        }
    }
}

export default TamanhoController;