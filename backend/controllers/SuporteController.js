import SuporteModel from '../models/SuporteModel.js';
import NotificacaoModel from '../models/NotificacaoModel.js';
import UsuarioModel from '../models/UsuarioModel.js';

const STATUS_VALIDOS = ['aberto', 'em_atendimento', 'respondido', 'fechado'];

class SuporteController {
    static async criar(req, res) {
        try {
            const assunto = String(req.body?.assunto || req.body?.titulo || '').trim();
            const mensagem = String(req.body?.mensagem || '').trim();
            const categoria = String(req.body?.categoria || 'geral').trim().toLowerCase();

            if (assunto.length < 3 || assunto.length > 150) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Assunto inválido',
                    mensagem: 'Informe um assunto entre 3 e 150 caracteres.'
                });
            }

            if (mensagem.length < 10 || mensagem.length > 2000) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Mensagem inválida',
                    mensagem: 'Descreva a solicitação entre 10 e 2000 caracteres.'
                });
            }

            const dadosSuporte = {
                id_user: req.usuario.idUsuario,
                assunto,
                categoria: categoria.slice(0, 80),
                mensagem,
                status: 'aberto'
            };

            const idTicket = await SuporteModel.criar(dadosTicket);

            await NotificacaoModel.criar({
                idUsuario: req.usuario.idUsuario,
                idSuporte: idSuporte,
                titulo: 'Solicitação de suporte recebida',
                mensagem: `Recebemos sua solicitação: ${assunto}`,
                tipo: 'suporte'
            });

            try {
                const administradores = await UsuarioModel.listarAdministradores();
                await Promise.all(
                    administradores
                        .filter((admin) => Number(admin.idUs) !== Number(req.usuario.idUsuario))
                        .map((admin) => NotificacaoModel.criar({
                            idUsuario: admin.idUsuarior,
                            idSuporte: idPpedido,
                            titulo: 'Novo chamado de suporte',
                            mensagem: `Novo chamado aberto: ${assunto}`,
                            tipo: 'suporte'
                        }))
                );
            } catch (notificacaoError) {
                console.error('Erro ao notificar administradores sobre suporte:', notificacaoError);
            }

            res.status(201).json({
                sucesso: true,
                mensagem: 'Solicitação enviada com sucesso.',
                dados: { id_ticket: idTicket, ...dadosTicket }
            });
        } catch (error) {
            console.error('Erro ao criar ticket de suporte:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível enviar a solicitação de suporte.'
            });
        }
    }

    static async listarMeus(req, res) {
        try {
            const pagina = parseInt(req.query.pagina) || 1;
            const limite = parseInt(req.query.limite) || 10;
            const resultado = await SuporteModel.listarPorUsuario(req.usuario.idUsuario, pagina, limite);

            res.status(200).json({
                sucesso: true,
                dados: resultado.tickets,
                paginacao: {
                    pagina: resultado.pagina,
                    limite: resultado.limite,
                    total: resultado.total,
                    totalPaginas: resultado.totalPaginas
                }
            });
        } catch (error) {
            console.error('Erro ao listar tickets do usuário:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível listar suas solicitações.'
            });
        }
    }

    static async listarTodos(req, res) {
        try {
            const pagina = parseInt(req.query.pagina) || 1;
            const limite = parseInt(req.query.limite) || 10;
            const resultado = await SuporteModel.listarTodos(pagina, limite);

            res.status(200).json({
                sucesso: true,
                dados: resultado.tickets,
                paginacao: {
                    pagina: resultado.pagina,
                    limite: resultado.limite,
                    total: resultado.total,
                    totalPaginas: resultado.totalPaginas
                }
            });
        } catch (error) {
            console.error('Erro ao listar tickets de suporte:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível listar as solicitações de suporte.'
            });
        }
    }

    static async responder(req, res) {
        try {
            const { idSuporte } = req.params;
            const resposta = String(req.body?.resposta || '').trim();

            if (!idSuporte || isNaN(idSuporte)) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'ID inválido',
                    mensagem: 'O ID do ticket deve ser numérico.'
                });
            }

            if (resposta.length < 3 || resposta.length > 2000) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Resposta inválida',
                    mensagem: 'Informe uma resposta entre 3 e 2000 caracteres.'
                });
            }

            const ticket = await SuporteModel.buscarPorId(idSuporte);
            if (!ticket) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Ticket não encontrado',
                    mensagem: 'A solicitação de suporte não foi encontrada.'
                });
            }

            const resultado = await SuporteModel.atualizar(idSuporte, {
                respostaAdmin: resposta,
                idAdminResposta: req.usuario.idUsuario,
                status: 'respondido',
                dataAtualizacao: new Date()
            });

            await NotificacaoModel.criar({
                idUsuario: ticket.idSuporte,
                idSuporte: Number(idSuporte),
                titulo: 'Resposta do suporte',
                mensagem: `Sua solicitação "${ticket.assunto}" foi respondida.`,
                tipo: 'suporte'
            });

            res.status(200).json({
                sucesso: true,
                mensagem: 'Resposta enviada com sucesso.',
                dados: { linhasAfetadas: resultado || 1 }
            });
        } catch (error) {
            console.error('Erro ao responder suporte:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível responder a solicitação.'
            });
        }
    }

    static async atualizarStatus(req, res) {
        try {
            const { idSuporte } = req.params;
            const status = String(req.body?.status || '').trim().toLowerCase();

            if (!idSuporte || isNaN(idSuporte)) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'ID inválido',
                    mensagem: 'O ID do ticket deve ser numérico.'
                });
            }

            if (!STATUS_VALIDOS.includes(status)) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Status inválido',
                    mensagem: 'Escolha um status válido para a solicitação.'
                });
            }

            const ticket = await SuporteModel.buscarPorId(idSuporte);
            if (!ticket) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Ticket não encontrado',
                    mensagem: 'A solicitação de suporte não foi encontrada.'
                });
            }

            const resultado = await SuporteModel.atualizar(idSuporte, {
                status,
                dataAtualizacao: new Date()
            });

            res.status(200).json({
                sucesso: true,
                mensagem: 'Status atualizado com sucesso.',
                dados: { linhasAfetadas: resultado || 1 }
            });
        } catch (error) {
            console.error('Erro ao atualizar suporte:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível atualizar a solicitação.'
            });
        }
    }
}

export default SuporteController;
