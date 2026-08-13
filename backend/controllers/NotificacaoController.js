import NotificacaoModel from '../models/NotificacaoModel.js';

class NotificacaoController {
    static async listarMinhas(req, res) {
        try {
            const pagina = parseInt(req.query.pagina) || 1;
            const limite = parseInt(req.query.limite) || 10;

            if (pagina < 1 || limite < 1) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Paginação inválida',
                    mensagem: 'Página e limite devem ser maiores que zero.'
                });
            }

            const limiteMaximo = parseInt(process.env.PAGINACAO_LIMITE_MAXIMO) || 100;
            if (limite > limiteMaximo) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Limite inválido',
                    mensagem: `O limite deve ser um número entre 1 e ${limiteMaximo}`
                });
            }

            // Ajustado para req.usuario.idUsuario
            const resultado = await NotificacaoModel.listarPorUsuario(req.usuario.idUsuario, pagina, limite);

            res.status(200).json({
                sucesso: true,
                dados: resultado.notificacoes,
                paginacao: {
                    pagina: resultado.pagina,
                    limite: resultado.limite,
                    total: resultado.total,
                    totalPaginas: resultado.totalPaginas
                }
            });
        } catch (error) {
            console.error('Erro ao listar notificações:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível listar suas notificações.'
            });
        }
    }

    static async marcarLida(req, res) {
        try {
            // Ajustado de id_notificacao para idNotificacao
            const { idNotificacao } = req.params;

            if (!idNotificacao || isNaN(idNotificacao)) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'ID inválido',
                    mensagem: 'O ID da notificação deve ser numérico.'
                });
            }

            const notificacao = await NotificacaoModel.buscarPorId(idNotificacao);
            if (!notificacao) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Notificação não encontrada',
                    mensagem: 'A notificação informada não foi encontrada.'
                });
            }

            // Ajustado para idUsuario em ambos os lados
            if (Number(notificacao.idUsuario) !== Number(req.usuario.idUsuario)) {
                return res.status(403).json({
                    sucesso: false,
                    erro: 'Acesso negado',
                    mensagem: 'Você não tem permissão para alterar esta notificação.'
                });
            }

            const resultado = await NotificacaoModel.marcarComoLida(idNotificacao);

            res.status(200).json({
                sucesso: true,
                mensagem: 'Notificação marcada como lida.',
                dados: { linhasAfetadas: resultado || 1 }
            });
        } catch (error) {
            console.error('Erro ao marcar notificação:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível atualizar a notificação.'
            });
        }
    }

    static async marcarTodasLidas(req, res) {
        try {
            // Ajustado para req.usuario.idUsuario
            const resultado = await NotificacaoModel.marcarTodasComoLidas(req.usuario.idUsuario);

            res.status(200).json({
                sucesso: true,
                mensagem: 'Notificações marcadas como lidas.',
                dados: { linhasAfetadas: resultado || 0 }
            });
        } catch (error) {
            console.error('Erro ao marcar notificações:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível atualizar suas notificações.'
            });
        }
    }
}

export default NotificacaoController;