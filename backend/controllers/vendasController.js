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

const simularDiasEntregaCEP = (cep) => {
    const digitoRegiao = parseInt(cep.charAt(0));
    return digitoRegiao === 0 ? 2 : digitoRegiao + 2; 
};

const sincronizarProgressoVenda = async (venda) => {
    // Normaliza a string do status removendo espaços
    const statusLimpo = venda.status ? String(venda.status).trim().toLowerCase() : '';
    venda.status = statusLimpo;

    if (statusLimpo === 'carrinho' || statusLimpo === 'entregue' || statusLimpo === 'cancelado') {
        venda.dataPedidoBR = formatarDataBR(venda.dataPedido);
        venda.dataEntregaBR = formatarDataBR(venda.dataEntrega);
        return venda;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    let novoStatus = statusLimpo;
    let atualizou = false;
    let dadosAtualizacao = {};

    const dataPedidoObj = venda.dataPedido ? new Date(venda.dataPedido) : null;
    const dataEntregaObj = venda.dataEntrega ? new Date(venda.dataEntrega) : null;

    if (novoStatus === 'pendente' && venda.dataEntrega) {
        novoStatus = 'processando';
        atualizou = true;
    }

    if (novoStatus === 'processando' && dataPedidoObj && dataEntregaObj) {
        const diasTotais = (dataEntregaObj - dataPedidoObj) / (1000 * 60 * 60 * 24);
        const diasPassados = (hoje - dataPedidoObj) / (1000 * 60 * 60 * 24);

        if (diasPassados >= (diasTotais / 2)) {
            novoStatus = 'enviado';
            atualizou = true;
        }
    }

    if ((novoStatus === 'processando' || novoStatus === 'enviado') && dataEntregaObj) {
        if (hoje >= dataEntregaObj) {
            novoStatus = 'entregue';
            atualizou = true;
        }
    }

    if (atualizou) {
        dadosAtualizacao.status = novoStatus;
        await VendaModel.atualizar(venda.idVendas, dadosAtualizacao);
        venda.status = novoStatus; 
    }

    venda.dataPedidoBR = formatarDataBR(venda.dataPedido);
    venda.dataEntregaBR = formatarDataBR(venda.dataEntrega);

    return venda;
};

class VendaController {

    static async adicionarCarrinho(req, res) {
        try {
            const { idUsuario, idProduto } = req.body;

            if (!idUsuario || !idProduto) {
                return res.status(400).json({ sucesso: false, erro: 'Dados incompletos', mensagem: 'ID de Usuário e Produto são obrigatórios' });
            }

            const dadosVenda = {
                idUsuario: parseInt(idUsuario),
                idProduto: parseInt(idProduto),
                dataPedido: null,
                dataEntrega: null,
                status: 'carrinho'
            };

            const vendaId = await VendaModel.criar(dadosVenda);
            res.status(201).json({ sucesso: true, mensagem: 'Adicionado ao carrinho', dados: { idVendas: vendaId, ...dadosVenda } });
        } catch (error) {
            console.error('Erro ao adicionar ao carrinho:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno' });
        }
    }

    static async confirmarCompra(req, res) {
        try {
            const { id } = req.params;
            const venda = await VendaModel.buscarPorId(id);

            if (!venda) return res.status(404).json({ sucesso: false, mensagem: 'Venda não encontrada' });
            
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

            await VendaModel.atualizar(id, dadosAtualizacao);

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
            console.error('Erro ao confirmar compra:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno' });
        }
    }

    static async listarTodos(req, res) {
        try {
            const pagina = parseInt(req.query.pagina) || 1;
            const limite = parseInt(req.query.limite) || 10;
            const offset = (pagina - 1) * limite;

            const resultado = await VendaModel.listarTodos(limite, offset);

            const vendasAtualizadas = await Promise.all(
                resultado.vendas.map(v => sincronizarProgressoVenda(v))
            );

            res.status(200).json({
                sucesso: true,
                dados: vendasAtualizadas,
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
            const { id } = req.params;
            let venda = await VendaModel.buscarPorId(id);

            if (!venda) return res.status(404).json({ sucesso: false, mensagem: `Venda ID ${id} não encontrada` });

            venda = await sincronizarProgressoVenda(venda);

            res.status(200).json({ sucesso: true, dados: venda });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: 'Erro interno' });
        }
    }

    static async buscarPorUsuario(req, res) {
        try {
            const { idUsuario } = req.params;
            const vendas = await VendaModel.buscarPorUsuario(idUsuario);

            const vendasAtualizadas = await Promise.all(
                vendas.map(v => sincronizarProgressoVenda(v))
            );

            res.status(200).json({ sucesso: true, dados: vendasAtualizadas });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: 'Erro interno' });
        }
    }

    // ATUALIZAR PEDIDO (ADMIN)
    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { idUsuario, idProduto, status } = req.body;

            const vendaExistente = await VendaModel.buscarPorId(id);
            if (!vendaExistente) {
                return res.status(404).json({ sucesso: false, mensagem: 'Pedido não encontrado.' });
            }

            const statusFormatado = status ? String(status).trim().toLowerCase() : vendaExistente.status;

            if (status && !STATUS_PERMITIDOS.includes(statusFormatado)) {
                return res.status(400).json({ sucesso: false, mensagem: 'Status inválido informado.' });
            }

            const dadosAtualizacao = {
                idUsuario: parseInt(idUsuario),
                idProduto: parseInt(idProduto),
                status: statusFormatado
            };

            await VendaModel.atualizar(id, dadosAtualizacao);

            res.status(200).json({
                sucesso: true,
                mensagem: 'Pedido atualizado com sucesso.'
            });
        } catch (error) {
            console.error('Erro ao atualizar pedido:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno ao atualizar pedido.' });
        }
    }

    // EXCLUIR PEDIDO (ADMIN)
    static async excluir(req, res) {
        try {
            const { id } = req.params;

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