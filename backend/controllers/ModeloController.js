import ModeloModel from '../models/ModeloModel.js';

class ModeloController {

    // GET /modelos - Listar todos os modelos (com paginação)
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
            const resultado = await ModeloModel.listarTodos(limite, offset);

            res.status(200).json({
                sucesso: true,
                dados: resultado.modelos,
                paginacao: {
                    pagina: resultado.pagina,
                    limite: resultado.limite,
                    total: resultado.total,
                    totalPaginas: resultado.totalPaginas
                }
            });
        } catch (error) {
            console.error('Erro ao listar modelos:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível listar os modelos' });
        }
    }

    // GET /modelos/:id - Buscar modelo por ID
    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({ sucesso: false, erro: 'ID inválido', mensagem: 'O ID deve ser numérico' });
            }

            const modelo = await ModeloModel.buscarPorId(id);

            if (!modelo) {
                return res.status(404).json({ sucesso: false, erro: 'Não encontrado', mensagem: `Modelo ID ${id} não encontrado` });
            }

            res.status(200).json({ sucesso: true, dados: modelo });
        } catch (error) {
            console.error('Erro ao buscar modelo:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível buscar o modelo' });
        }
    }

    // POST /modelos - Criar novo modelo
    static async criar(req, res) {
        try {
            const { nomeModelo } = req.body;

            // Validação de campo obrigatório
            if (!nomeModelo || !nomeModelo.trim()) {
                return res.status(400).json({ sucesso: false, erro: "Nome obrigatório", mensagem: "O nome do modelo é obrigatório" });
            }

            // Validação de tamanho
            if (nomeModelo.length < 2 || nomeModelo.length > 100) {
                return res.status(400).json({ sucesso: false, erro: 'Tamanho do Nome', mensagem: 'O nome do modelo deve ter entre 2 e 100 caracteres' });
            }

            const dadosModelo = {
                nomeModelo: nomeModelo.trim()
            };

            const modeloId = await ModeloModel.criar(dadosModelo);

            res.status(201).json({
                sucesso: true,
                mensagem: 'Modelo criado com sucesso',
                dados: { idModelo: modeloId, ...dadosModelo }
            });
        } catch (error) {
            console.error('Erro ao criar modelo:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível criar o modelo' });
        }
    }

    // PUT /modelos/:id - Atualizar modelo
    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nomeModelo } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({ sucesso: false, erro: 'ID inválido', mensagem: 'O ID deve ser numérico' });
            }

            const modeloExistente = await ModeloModel.buscarPorId(id);
            if (!modeloExistente) {
                return res.status(404).json({ sucesso: false, erro: 'Não encontrado', mensagem: `Modelo ID ${id} não encontrado` });
            }

            const dadosAtualizacao = {};

            if (nomeModelo !== undefined) {
                if (nomeModelo.trim() === '' || nomeModelo.length < 2 || nomeModelo.length > 100) {
                    return res.status(400).json({ sucesso: false, erro: 'Nome inválido', mensagem: 'O nome do modelo deve ter entre 2 e 100 caracteres' });
                }
                dadosAtualizacao.nomeModelo = nomeModelo.trim();
            }

            if (Object.keys(dadosAtualizacao).length === 0) {
                return res.status(400).json({ sucesso: false, erro: 'Sem alterações', mensagem: 'Nenhum dado válido fornecido para atualização' });
            }

            const resultado = await ModeloModel.atualizar(id, dadosAtualizacao);

            res.status(200).json({
                sucesso: true,
                mensagem: 'Modelo atualizado com sucesso',
                dados: { linhasAfetadas: resultado.affectedRows || 1 }
            });
        } catch (error) {
            console.error('Erro ao atualizar modelo:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível atualizar o modelo' });
        }
    }

    // DELETE /modelos/:id - Excluir modelo
    static async excluir(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({ sucesso: false, erro: 'ID inválido', mensagem: 'O ID deve ser numérico' });
            }

            const modeloExistente = await ModeloModel.buscarPorId(id);
            if (!modeloExistente) {
                return res.status(404).json({ sucesso: false, erro: 'Não encontrado', mensagem: `Modelo ID ${id} não encontrado` });
            }

            const resultado = await ModeloModel.excluir(id);

            res.status(200).json({
                sucesso: true,
                mensagem: 'Modelo excluído com sucesso',
                dados: { linhasAfetadas: resultado || 1 }
            });
        } catch (error) {
            console.error('Erro ao excluir modelo:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível excluir o modelo' });
        }
    }
}

export default ModeloController;