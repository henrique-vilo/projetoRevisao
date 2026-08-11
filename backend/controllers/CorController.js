import CorModel from '../models/CoresModel.js';

class CorController {

    // GET /cores - Listar todas as cores (com paginação)
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
            const resultado = await CorModel.listarTodos(limite, offset);

            res.status(200).json({
                sucesso: true,
                dados: resultado.cores,
                paginacao: {
                    pagina: resultado.pagina,
                    limite: resultado.limite,
                    total: resultado.total,
                    totalPaginas: resultado.totalPaginas
                }
            });
        } catch (error) {
            console.error('Erro ao listar cores:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível listar as cores' });
        }
    }

    // GET /cores/:id - Buscar cor por ID
    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({ sucesso: false, erro: 'ID inválido', mensagem: 'O ID deve ser numérico' });
            }

            const cor = await CorModel.buscarPorId(id);

            if (!cor) {
                return res.status(404).json({ sucesso: false, erro: 'Não encontrado', mensagem: `Cor ID ${id} não encontrada` });
            }

            res.status(200).json({ sucesso: true, dados: cor });
        } catch (error) {
            console.error('Erro ao buscar cor:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível buscar a cor' });
        }
    }

    // POST /cores - Criar nova cor
    static async criar(req, res) {
        try {
            const { tom, nomeCor, codigoCor } = req.body;

            // Validação de campos obrigatórios
            if (!tom || !tom.trim()) {
                return res.status(400).json({ sucesso: false, erro: "Tom obrigatório", mensagem: "O tom da cor é obrigatório" });
            }
            if (!nomeCor || !nomeCor.trim()) {
                return res.status(400).json({ sucesso: false, erro: "Nome obrigatório", mensagem: "O nome da cor é obrigatório" });
            }
            if (!codigoCor || !codigoCor.trim()) {
                return res.status(400).json({ sucesso: false, erro: "Código obrigatório", mensagem: "O código da cor é obrigatório" });
            }

            // Validações de tamanho
            if (tom.length > 100) {
                return res.status(400).json({ sucesso: false, erro: 'Tamanho do Tom', mensagem: 'O tom deve ter no máximo 100 caracteres' });
            }
            if (nomeCor.length > 100) {
                return res.status(400).json({ sucesso: false, erro: 'Tamanho do Nome', mensagem: 'O nome da cor deve ter no máximo 100 caracteres' });
            }
            if (codigoCor.length > 100) {
                return res.status(400).json({ sucesso: false, erro: 'Tamanho do Código', mensagem: 'O código da cor deve ter no máximo 100 caracteres' });
            }

            const dadosCor = {
                tom: tom.trim(),
                nomeCor: nomeCor.trim(),
                codigoCor: codigoCor.trim()
            };

            const corId = await CorModel.criar(dadosCor);

            res.status(201).json({
                sucesso: true,
                mensagem: 'Cor criada com sucesso',
                dados: { idCor: corId, ...dadosCor }
            });
        } catch (error) {
            console.error('Erro ao criar cor:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível criar a cor' });
        }
    }

    // PUT /cores/:id - Atualizar cor
    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { tom, nomeCor, codigoCor } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({ sucesso: false, erro: 'ID inválido', mensagem: 'O ID deve ser numérico' });
            }

            const corExistente = await CorModel.buscarPorId(id);
            if (!corExistente) {
                return res.status(404).json({ sucesso: false, erro: 'Não encontrado', mensagem: `Cor ID ${id} não encontrada` });
            }

            const dadosAtualizacao = {};

            if (tom !== undefined) {
                if (tom.trim() === '' || tom.length > 100) {
                    return res.status(400).json({ sucesso: false, erro: 'Tom inválido', mensagem: 'O tom deve ser informado e ter no máximo 100 caracteres' });
                }
                dadosAtualizacao.tom = tom.trim();
            }

            if (nomeCor !== undefined) {
                if (nomeCor.trim() === '' || nomeCor.length > 100) {
                    return res.status(400).json({ sucesso: false, erro: 'Nome inválido', mensagem: 'O nome da cor deve ser informado e ter no máximo 100 caracteres' });
                }
                dadosAtualizacao.nomeCor = nomeCor.trim();
            }

            if (codigoCor !== undefined) {
                if (codigoCor.trim() === '' || codigoCor.length > 100) {
                    return res.status(400).json({ sucesso: false, erro: 'Código inválido', mensagem: 'O código da cor deve ser informado e ter no máximo 100 caracteres' });
                }
                dadosAtualizacao.codigoCor = codigoCor.trim();
            }

            if (Object.keys(dadosAtualizacao).length === 0) {
                return res.status(400).json({ sucesso: false, erro: 'Sem alterações', mensagem: 'Nenhum dado válido fornecido para atualização' });
            }

            const resultado = await CorModel.atualizar(id, dadosAtualizacao);

            res.status(200).json({
                sucesso: true,
                mensagem: 'Cor atualizada com sucesso',
                dados: { linhasAfetadas: resultado.affectedRows || 1 }
            });
        } catch (error) {
            console.error('Erro ao atualizar cor:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível atualizar a cor' });
        }
    }

    // DELETE /cores/:id - Excluir cor
    static async excluir(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({ sucesso: false, erro: 'ID inválido', mensagem: 'O ID deve ser numérico' });
            }

            const corExistente = await CorModel.buscarPorId(id);
            if (!corExistente) {
                return res.status(404).json({ sucesso: false, erro: 'Não encontrado', mensagem: `Cor ID ${id} não encontrada` });
            }

            const resultado = await CorModel.excluir(id);

            res.status(200).json({
                sucesso: true,
                mensagem: 'Cor excluída com sucesso',
                dados: { linhasAfetadas: resultado || 1 }
            });
        } catch (error) {
            console.error('Erro ao excluir cor:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível excluir a cor' });
        }
    }
}

export default CorController;