import VendaModel from '../models/vendasModel.js';

const STATUS_PERMITIDOS = ['carrinho', 'pendente', 'processando', 'enviado', 'entregue', 'cancelado'];

const formatarDataBR = (dataSql) => {
    if (!dataSql) return null;
    const data = new Date(dataSql);
    return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const formatarDataSQL = (data) => {
    return data.toISOString().split('T')[0];
};

const dataSqlValida = (valor) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(valor || ''))) return false;
    const data = new Date(`${valor}T00:00:00.000Z`);
    return !Number.isNaN(data.getTime()) && formatarDataSQL(data) === valor;
};

const normalizarDataOpcional = (valor) => {
    if (valor === undefined) return { fornecida: false, valor: undefined, valida: true };
    if (valor === null || valor === '') return { fornecida: true, valor: null, valida: true };
    const normalizada = String(valor).trim();
    return { fornecida: true, valor: normalizada, valida: dataSqlValida(normalizada) };
};

const obterIdPositivo = (valor) => {
    const id = Number(valor);
    return Number.isInteger(id) && id > 0 ? id : null;
};

const responderErroCarrinho = (res, error) => {
    if (error.code === 'PRODUTO_INDISPONIVEL') {
        return res.status(404).json({ sucesso: false, mensagem: error.message });
    }
    if (error.code === 'ESTOQUE_INSUFICIENTE' || error.code === 'CARRINHO_VAZIO') {
        return res.status(409).json({ sucesso: false, mensagem: error.message });
    }
    if (error.code === 'CARRINHO_INVALIDO') {
        return res.status(409).json({ sucesso: false, mensagem: error.message });
    }
    if (error.code === 'ACESSO_NEGADO') {
        return res.status(403).json({ sucesso: false, mensagem: error.message });
    }
    console.error('Erro no carrinho:', error);
    return res.status(500).json({
        sucesso: false,
        erro: 'Erro interno',
        mensagem: 'Não foi possível processar o carrinho.'
    });
};

const simularDiasEntregaCEP = (cep) => {
    const digitoRegiao = parseInt(cep.charAt(0));
    return digitoRegiao === 0 ? 2 : digitoRegiao + 2; 
};

const formatarVenda = (venda) => {
    const statusOriginal = venda.status ?? venda.STATUS;
    const statusLimpo = statusOriginal ? String(statusOriginal).trim().toLowerCase() : '';
    return {
        ...venda,
        status: statusLimpo,
        dataPedidoBR: formatarDataBR(venda.dataPedido),
        dataEnvioBR: formatarDataBR(venda.dataEnvio),
        dataEntregaBR: formatarDataBR(venda.dataEntrega)
    };
};

class VendaController {

    static async adicionarCarrinho(req, res) {
        try {
            const idUsuario = obterIdPositivo(req.usuario?.id);
            const idProduto = obterIdPositivo(req.body?.idProduto);

            if (!idUsuario || !idProduto) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Dados inválidos',
                    mensagem: 'Informe um produto válido.'
                });
            }

            const vendaId = await VendaModel.adicionarAoCarrinho(idUsuario, idProduto);
            res.status(201).json({
                sucesso: true,
                mensagem: 'Produto adicionado ao carrinho.',
                dados: { idVendas: vendaId, idProduto }
            });
        } catch (error) {
            return responderErroCarrinho(res, error);
        }
    }

    static async listarCarrinho(req, res) {
        try {
            const idUsuario = obterIdPositivo(req.usuario?.id);
            const itens = await VendaModel.buscarCarrinho(idUsuario);
            return res.status(200).json({ sucesso: true, dados: itens });
        } catch (error) {
            return responderErroCarrinho(res, error);
        }
    }

    static async removerCarrinho(req, res) {
        try {
            const idUsuario = obterIdPositivo(req.usuario?.id);
            const idVenda = obterIdPositivo(req.params.id);

            if (!idVenda) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Item do carrinho inválido.'
                });
            }

            const removidos = await VendaModel.removerDoCarrinho(idVenda, idUsuario);
            if (!removidos) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Item não encontrado no seu carrinho.'
                });
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Produto removido do carrinho.'
            });
        } catch (error) {
            return responderErroCarrinho(res, error);
        }
    }

    static async confirmarCarrinho(req, res) {
        try {
            const idUsuario = obterIdPositivo(req.usuario?.id);
            const usuario = await VendaModel.buscarUsuarioVenda(idUsuario);

            if (!usuario?.cep) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Cadastre um CEP válido no seu perfil antes de finalizar a compra.'
                });
            }

            const hoje = new Date();
            const diasParaEntrega = simularDiasEntregaCEP(String(usuario.cep).replace(/\D/g, ''));
            const dataEntrega = new Date(hoje);
            dataEntrega.setDate(hoje.getDate() + diasParaEntrega);

            const resultado = await VendaModel.confirmarCarrinho(
                idUsuario,
                formatarDataSQL(hoje),
                formatarDataSQL(dataEntrega)
            );

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Compra confirmada. Seu pedido está em processamento.',
                dados: {
                    ...resultado,
                    previsaoEntregaDias: diasParaEntrega,
                    dataPedidoBR: formatarDataBR(formatarDataSQL(hoje)),
                    dataEntregaBR: formatarDataBR(formatarDataSQL(dataEntrega)),
                    status: 'processando'
                }
            });
        } catch (error) {
            return responderErroCarrinho(res, error);
        }
    }

    static async listarMinhasEntregas(req, res) {
        try {
            const idUsuario = obterIdPositivo(req.usuario?.id);
            const vendas = await VendaModel.buscarEntregasPorUsuario(idUsuario);
            const entregas = vendas.map(formatarVenda);
            return res.status(200).json({ sucesso: true, dados: entregas });
        } catch (error) {
            console.error('Erro ao listar entregas do usuário:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Não foi possível carregar suas entregas.'
            });
        }
    }

    static async confirmarCompra(req, res) {
        try {
            const { id } = req.params;
            const venda = await VendaModel.buscarPorId(id);

            if (!venda) return res.status(404).json({ sucesso: false, mensagem: 'Venda não encontrada' });

            const podeConfirmar =
                Number(venda.idUsuario) === Number(req.usuario?.id) ||
                req.usuario?.tipo === 'admin';
            if (!podeConfirmar) {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: 'Você não pode confirmar uma venda de outro usuário.'
                });
            }
            
            const statusAtual = String(venda.status).trim().toLowerCase();
            if (statusAtual !== 'carrinho') return res.status(400).json({ sucesso: false, mensagem: 'Esta venda já passou da fase de carrinho' });

            const usuario = await VendaModel.buscarUsuarioVenda(venda.idUsuario);
            if (!usuario || !usuario.cep) return res.status(400).json({ sucesso: false, mensagem: 'Usuário sem CEP cadastrado' });

            const hoje = new Date();
            const diasParaEntrega = simularDiasEntregaCEP(usuario.cep);
            
            const dataEntrega = new Date(hoje);
            dataEntrega.setDate(hoje.getDate() + diasParaEntrega);

            const dadosAtualizacao = {
                dataPedido: formatarDataSQL(hoje),
                dataEntrega: formatarDataSQL(dataEntrega),
                status: 'processando'
            };

            await VendaModel.confirmarVenda(
                id,
                req.usuario.id,
                dadosAtualizacao.dataPedido,
                dadosAtualizacao.dataEntrega,
                req.usuario?.tipo === 'admin'
            );

            res.status(200).json({
                sucesso: true,
                mensagem: 'Compra confirmada com sucesso! Pedido em processamento.',
                dados: {
                    idVendas: id,
                    previsaoEntregaDias: diasParaEntrega,
                    dataPedidoBR: formatarDataBR(dadosAtualizacao.dataPedido),
                    dataEntregaBR: formatarDataBR(dadosAtualizacao.dataEntrega),
                    status: dadosAtualizacao.status
                }
            });
        } catch (error) {
            return responderErroCarrinho(res, error);
        }
    }

    static async listarTodos(req, res) {
        try {
            const pagina = parseInt(req.query.pagina, 10) || 1;
            const limite = parseInt(req.query.limite, 10) || 10;
            const busca = String(req.query.busca || '').trim().slice(0, 100);

            if (pagina < 1 || limite < 1 || limite > 100) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Página e limite devem ser válidos; o limite máximo é 100.'
                });
            }

            const offset = (pagina - 1) * limite;
            const resultado = await VendaModel.listarTodos({ limite, offset, busca });

            res.status(200).json({
                sucesso: true,
                dados: resultado.vendas.map(formatarVenda),
                paginacao: {
                    pagina: resultado.pagina,
                    limite: resultado.limite,
                    total: resultado.total,
                    totalPaginas: resultado.totalPaginas
                }
            });
        } catch (error) {
            console.error('Erro ao listar vendas:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno' });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const id = obterIdPositivo(req.params.id);
            if (!id) {
                return res.status(400).json({ sucesso: false, mensagem: 'ID de pedido inválido.' });
            }
            let venda = await VendaModel.buscarPorId(id);

            if (!venda) return res.status(404).json({ sucesso: false, mensagem: `Venda ID ${id} não encontrada` });

            if (
                req.usuario?.tipo !== 'admin' &&
                Number(venda.idUsuario) !== Number(req.usuario?.id)
            ) {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: 'Você não pode consultar uma venda de outro usuário.'
                });
            }

            venda = formatarVenda(venda);

            res.status(200).json({ sucesso: true, dados: venda });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: 'Erro interno' });
        }
    }

    static async buscarPorUsuario(req, res) {
        try {
            const idUsuario = obterIdPositivo(req.params.idUsuario);
            if (!idUsuario) {
                return res.status(400).json({ sucesso: false, mensagem: 'ID de usuário inválido.' });
            }

            if (
                req.usuario?.tipo !== 'admin' &&
                Number(idUsuario) !== Number(req.usuario?.id)
            ) {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: 'Você não pode consultar as vendas de outro usuário.'
                });
            }

            const vendas = await VendaModel.buscarPorUsuario(idUsuario);

            res.status(200).json({ sucesso: true, dados: vendas.map(formatarVenda) });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: 'Erro interno' });
        }
    }

    // CRIAR PEDIDO (ADMIN)
    static async criar(req, res) {
        try {
            const idUsuario = obterIdPositivo(req.body?.idUsuario);
            const idProduto = obterIdPositivo(req.body?.idProduto);
            const status = String(req.body?.status || 'carrinho').trim().toLowerCase();
            const dataPedido = normalizarDataOpcional(req.body?.dataPedido);
            const dataEnvio = normalizarDataOpcional(req.body?.dataEnvio);
            const dataEntrega = normalizarDataOpcional(req.body?.dataEntrega);

            if (!idUsuario || !idProduto) {
                return res.status(400).json({ sucesso: false, mensagem: 'Informe usuário e produto válidos.' });
            }
            if (!STATUS_PERMITIDOS.includes(status)) {
                return res.status(400).json({ sucesso: false, mensagem: 'Status inválido informado.' });
            }
            if (![dataPedido, dataEnvio, dataEntrega].every((data) => data.valida)) {
                return res.status(400).json({ sucesso: false, mensagem: 'As datas devem usar o formato AAAA-MM-DD.' });
            }

            const hoje = formatarDataSQL(new Date());
            const idVendas = await VendaModel.criar({
                idUsuario,
                idProduto,
                dataPedido: dataPedido.fornecida ? dataPedido.valor : (status === 'carrinho' ? null : hoje),
                dataEnvio: dataEnvio.fornecida
                    ? dataEnvio.valor
                    : (['enviado', 'entregue'].includes(status) ? hoje : null),
                dataEntrega: dataEntrega.fornecida ? dataEntrega.valor : null,
                status
            });
            const venda = await VendaModel.buscarPorId(idVendas);

            return res.status(201).json({
                sucesso: true,
                mensagem: 'Pedido criado com sucesso.',
                dados: formatarVenda(venda)
            });
        } catch (error) {
            console.error('Erro ao criar pedido:', error);
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(409).json({ sucesso: false, mensagem: 'Usuário ou produto não encontrado.' });
            }
            return res.status(500).json({ sucesso: false, erro: 'Erro interno ao criar pedido.' });
        }
    }

    // ATUALIZAR PEDIDO (ADMIN)
    static async atualizar(req, res) {
        try {
            const id = obterIdPositivo(req.params.id);
            if (!id) {
                return res.status(400).json({ sucesso: false, mensagem: 'ID de pedido inválido.' });
            }

            const { idUsuario, idProduto, status } = req.body || {};

            const vendaExistente = await VendaModel.buscarPorId(id);
            if (!vendaExistente) {
                return res.status(404).json({ sucesso: false, mensagem: 'Pedido não encontrado.' });
            }

            const statusFormatado = status
                ? String(status).trim().toLowerCase()
                : String(vendaExistente.status).trim().toLowerCase();

            if (status && !STATUS_PERMITIDOS.includes(statusFormatado)) {
                return res.status(400).json({ sucesso: false, mensagem: 'Status inválido informado.' });
            }

            const dadosAtualizacao = {};
            if (idUsuario !== undefined) {
                const usuarioId = obterIdPositivo(idUsuario);
                if (!usuarioId) return res.status(400).json({ sucesso: false, mensagem: 'Usuário inválido.' });
                dadosAtualizacao.idUsuario = usuarioId;
            }
            if (idProduto !== undefined) {
                const produtoId = obterIdPositivo(idProduto);
                if (!produtoId) return res.status(400).json({ sucesso: false, mensagem: 'Produto inválido.' });
                dadosAtualizacao.idProduto = produtoId;
            }
            if (status !== undefined) dadosAtualizacao.status = statusFormatado;

            const camposData = ['dataPedido', 'dataEnvio', 'dataEntrega'];
            for (const campo of camposData) {
                const data = normalizarDataOpcional(req.body?.[campo]);
                if (!data.valida) {
                    return res.status(400).json({ sucesso: false, mensagem: `${campo} deve usar o formato AAAA-MM-DD.` });
                }
                if (data.fornecida) dadosAtualizacao[campo] = data.valor;
            }

            if (['enviado', 'entregue'].includes(statusFormatado) && !(dadosAtualizacao.dataEnvio || vendaExistente.dataEnvio)) {
                dadosAtualizacao.dataEnvio = formatarDataSQL(new Date());
            } else if (status !== undefined && ['carrinho', 'pendente', 'processando'].includes(statusFormatado)) {
                dadosAtualizacao.dataEnvio = null;
            }

            const valorFinal = (campo) => Object.prototype.hasOwnProperty.call(dadosAtualizacao, campo)
                ? dadosAtualizacao[campo]
                : vendaExistente[campo];
            const dataPedidoFinal = valorFinal('dataPedido');
            const dataEnvioFinal = valorFinal('dataEnvio');
            const dataEntregaFinal = valorFinal('dataEntrega');
            if (dataPedidoFinal && dataEntregaFinal && new Date(dataEntregaFinal) < new Date(dataPedidoFinal)) {
                return res.status(400).json({ sucesso: false, mensagem: 'A data de entrega não pode ser anterior à data do pedido.' });
            }
            if (dataEnvioFinal && dataEntregaFinal && new Date(dataEntregaFinal) < new Date(dataEnvioFinal)) {
                return res.status(400).json({ sucesso: false, mensagem: 'A data de entrega não pode ser anterior à data de envio.' });
            }

            if (Object.keys(dadosAtualizacao).length === 0) {
                return res.status(400).json({ sucesso: false, mensagem: 'Nenhum dado foi informado para atualização.' });
            }

            await VendaModel.atualizar(id, dadosAtualizacao);
            const vendaAtualizada = await VendaModel.buscarPorId(id);

            res.status(200).json({
                sucesso: true,
                mensagem: 'Pedido atualizado com sucesso.',
                dados: formatarVenda(vendaAtualizada)
            });
        } catch (error) {
            console.error('Erro ao atualizar pedido:', error);
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(409).json({ sucesso: false, mensagem: 'Usuário ou produto não encontrado.' });
            }
            res.status(500).json({ sucesso: false, erro: 'Erro interno ao atualizar pedido.' });
        }
    }

    // EXCLUIR PEDIDO (ADMIN)
    static async excluir(req, res) {
        try {
            const id = obterIdPositivo(req.params.id);
            if (!id) {
                return res.status(400).json({ sucesso: false, mensagem: 'ID de pedido inválido.' });
            }

            const vendaExistente = await VendaModel.buscarPorId(id);
            if (!vendaExistente) {
                return res.status(404).json({ sucesso: false, mensagem: 'Pedido não encontrado.' });
            }

            await VendaModel.excluir(id);

            res.status(200).json({
                sucesso: true,
                mensagem: 'Pedido excluído com sucesso.'
            });
        } catch (error) {
            console.error('Erro ao excluir pedido:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno ao excluir pedido.' });
        }
    }
}

export default VendaController;
