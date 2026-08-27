import SuporteModel from '../models/SuporteModel.js';
import NotificacaoModel from '../models/NotificacaoModel.js';
import UsuarioModel from '../models/UsuarioModel.js';

class SuporteController {
    static async criar(req, res) {
        try {
            const idUsuario = req.usuario?.idUsuario || req.usuario?.id;

            if (!idUsuario) {
                return res.status(401).json({
                    sucesso: false,
                    erro: 'Não autorizado',
                    mensagem: 'Usuário não identificado na requisição.'
                });
            }

            let titulo = String(req.body?.titulo || '').trim();
            let assunto = String(req.body?.assunto || '').trim();
            const texto = String(req.body?.texto || req.body?.mensagem || '').trim();

            if (!titulo && assunto) titulo = assunto;
            if (!assunto && titulo) assunto = titulo;

            if (titulo.length < 3 || titulo.length > 250) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Título inválido',
                    mensagem: 'Informe um título entre 3 e 250 caracteres.'
                });
            }

            if (assunto.length < 3 || assunto.length > 250) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Assunto inválido',
                    mensagem: 'Informe um assunto entre 3 e 250 caracteres.'
                });
            }

            if (texto.length < 10 || texto.length > 2000) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Texto inválido',
                    mensagem: 'Descreva a solicitação no campo "texto" entre 10 e 2000 caracteres.'
                });
            }

            // Apenas colunas existentes na tabela 'suporte'
            const dadosSuporte = {
                idUsuario,
                titulo: titulo.slice(0, 250),
                assunto: assunto.slice(0, 250),
                texto
            };

            const retornoBanco = await SuporteModel.criar(dadosSuporte);
            const idSuporte = typeof retornoBanco === 'object' && retornoBanco?.insertId 
                ? retornoBanco.insertId 
                : retornoBanco;

            if (!idSuporte) {
                throw new Error('Falha ao obter o ID do suporte criado.');
            }

            // 1. Notifica o próprio cliente sobre a criação
            await NotificacaoModel.criar({
                idUsuario: idUsuario,
                idSuporte: idSuporte,
                titulo: 'Solicitação de suporte enviada',
                mensagem: `Recebemos sua solicitação: "${titulo}". Em breve responderemos.`,
                tipo: 'suporte'
            });

            // 2. Notifica administradores do sistema
            try {
                const administradores = await UsuarioModel.listarAdministradores();
                if (Array.isArray(administradores)) {
                    await Promise.all(
                        administradores
                            .filter((admin) => {
                                const adminId = admin.idUsuario || admin.id;
                                return adminId && Number(adminId) !== Number(idUsuario);
                            })
                            .map((admin) => NotificacaoModel.criar({
                                idUsuario: admin.idUsuario || admin.id,
                                idSuporte: idSuporte,
                                titulo: 'Novo chamado de suporte',
                                mensagem: `Novo chamado #${idSuporte} aberto: "${titulo}"`,
                                tipo: 'suporte'
                            }))
                    );
                }
            } catch (notificacaoError) {
                console.error('Erro ao notificar administradores:', notificacaoError);
            }

            return res.status(201).json({
                sucesso: true,
                mensagem: 'Solicitação enviada com sucesso.',
                dados: { idSuporte, ...dadosSuporte }
            });
        } catch (error) {
            console.error('Erro ao criar ticket de suporte:', error);
            return res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível enviar a solicitação de suporte.'
            });
        }
    }

    static async listarMeus(req, res) {
        try {
            const idUsuario = req.usuario?.idUsuario || req.usuario?.id;
            const pagina = parseInt(req.query.pagina) || 1;
            const limite = parseInt(req.query.limite) || 10;
            const resultado = await SuporteModel.listarPorUsuario(idUsuario, pagina, limite);

            return res.status(200).json({
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
            return res.status(500).json({
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

            return res.status(200).json({
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
            return res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível listar as solicitações de suporte.'
            });
        }
    }

    static async responder(req, res) {
        try {
            const { idSuporte } = req.params;
            const idAdmin = req.usuario?.idUsuario || req.usuario?.id;
            const resposta = String(req.body?.resposta || req.body?.respostaAdmin || '').trim();

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

            await SuporteModel.atualizar(idSuporte, {
                respostaAdmin: resposta,
                idAdminResposta: idAdmin
            });

            // Notifica o cliente autor do chamado
            await NotificacaoModel.criar({
                idUsuario: ticket.idUsuario,
                idSuporte: Number(idSuporte),
                titulo: 'Resposta do suporte recebida',
                mensagem: `Sua solicitação "${ticket.titulo || ticket.assunto}" foi respondida pelo suporte.`,
                tipo: 'suporte'
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Resposta enviada com sucesso.',
                dados: {
                    idSuporte: Number(idSuporte),
                    respostaAdmin: resposta,
                    idAdminResposta: idAdmin
                }
            });
        } catch (error) {
            console.error('Erro ao responder suporte:', error);
            return res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível responder a solicitação.'
            });
        }
    }
}

export default SuporteController;