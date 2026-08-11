import VendaModel from '../models/vendaModel.js';

const STATUS_PERMITIDOS = ['carrinho', 'pendente', 'processando', 'enviado', 'entregue', 'cancelado'];

// --- UTILITÁRIOS INTERNOS ---

// Formatação para Padrão Brasileiro (DD/MM/YYYY)
const formatarDataBR = (dataSql) => {
    if (!dataSql) return null;
    const data = new Date(dataSql);
    return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

// Gera Data no formato YYYY-MM-DD para o MySQL
const formatarDataSQL = (data) => {
    return data.toISOString().split('T')[0];
};

// Cálculo fictício de tempo de entrega usando o 1º dígito do CEP
const simularDiasEntregaCEP = (cep) => {
    const digitoRegiao = parseInt(cep.charAt(0));
    // Ex: Se começar com 0 (SP Capital) = 2 dias. Outros = digito + 2 dias (Máximo 11 dias)
    return digitoRegiao === 0 ? 2 : digitoRegiao + 2; 
};

// Lógica Principal de Progresso da Venda (Avaliação Dinâmica)
const sincronizarProgressoVenda = async (venda) => {
    if (venda.status === 'carrinho' || venda.status === 'entregue' || venda.status === 'cancelado') {
        return venda; // Estados estáticos não mudam sozinhos
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera as horas para comparar apenas os dias
    
    let novoStatus = venda.status;
    let atualizou = false;
    let dadosAtualizacao = {};

    const dataPedidoObj = venda.dataPedido ? new Date(venda.dataPedido) : null;
    const dataEntregaObj = venda.dataEntrega ? new Date(venda.dataEntrega) : null;

    // Regra 1: Pendente -> Processando (Se tem data de entrega definida, já começa a processar)
    if (novoStatus === 'pendente' && venda.dataEntrega) {
        novoStatus = 'processando';
        atualizou = true;
    }

    // Regra 2: Processando -> Enviado (Simularemos que leva metade do tempo de entrega para enviar)
    if (novoStatus === 'processando' && dataPedidoObj && dataEntregaObj) {
        const diasTotais = (dataEntregaObj - dataPedidoObj) / (1000 * 60 * 60 * 24);
        const diasPassados = (hoje - dataPedidoObj) / (1000 * 60 * 60 * 24);

        if (diasPassados >= (diasTotais / 2)) {
            novoStatus = 'enviado';
            atualizou = true;
        }
    }

    // Regra 3: Qualquer etapa em transporte -> Entregue (Se a data de hoje passou ou chegou na data de entrega)
    if ((novoStatus === 'processando' || novoStatus === 'enviado') && dataEntregaObj) {
        if (hoje >= dataEntregaObj) {
            novoStatus = 'entregue';
            atualizou = true;
        }
    }

    // Se houve mudança nas regras de simulação temporal, salva no BD
    if (atualizou) {
        dadosAtualizacao.status = novoStatus;
        await VendaModel.atualizar(venda.idVendas, dadosAtualizacao);
        venda.status = novoStatus; 
    }

    // Formata as datas para o Frontend (BR)
    venda.dataPedidoBR = formatarDataBR(venda.dataPedido);
    venda.dataEntregaBR = formatarDataBR(venda.dataEntrega);

    return venda;
};

class VendaController {

    // POST /vendas/carrinho - Adicionar ao carrinho (Sem datas)
    static async adicionarCarrinho(req, res) {
        try {
            const { idUsuario, idProduto } = req.body;

            if (!idUsuario || !idProduto) {
                return res.status(400).json({ sucesso: false, erro: 'Dados incompletos', mensagem: 'ID de Usuário e Produto são obrigatórios' });
            }

            const dadosVenda = {
                idUsuario: parseInt(idUsuario),
                idProduto: parseInt(idProduto),
                dataPedido: null, // Fica nulo pois está no carrinho
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

    // POST /vendas/:id/confirmar - Confirmação de Compra
    static async confirmarCompra(req, res) {
        try {
            const { id } = req.params;
            const venda = await VendaModel.buscarPorId(id);

            if (!venda) return res.status(404).json({ sucesso: false, mensagem: 'Venda não encontrada' });
            if (venda.status !== 'carrinho') return res.status(400).json({ sucesso: false, mensagem: 'Esta venda já passou da fase de carrinho' });

            const usuario = await VendaModel.buscarUsuarioVenda(venda.idUsuario);
            if (!usuario || !usuario.cep) return res.status(400).json({ sucesso: false, mensagem: 'Usuário sem CEP cadastrado' });

            // Cálculos de datas
            const hoje = new Date();
            const diasParaEntrega = simularDiasEntregaCEP(usuario.cep);
            
            const dataEntrega = new Date(hoje);
            dataEntrega.setDate(hoje.getDate() + diasParaEntrega);

            // Ao definir a data de entrega, a regra do sistema já joga o status para 'processando'
            const dadosAtualizacao = {
                dataPedido: formatarDataSQL(hoje),
                dataEntrega: formatarDataSQL(dataEntrega),
                status: 'processando' // O sistema salta 'pendente' por já ter a estimativa feita automaticamente
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

    // GET /vendas - Listar todas (Com atualização dinâmica de status)
    static async listarTodos(req, res) {
        try {
            const pagina = parseInt(req.query.pagina) || 1;
            const limite = parseInt(req.query.limite) || 10;
            const offset = (pagina - 1) * limite;

            const resultado = await VendaModel.listarTodos(limite, offset);

            // Aplica a regra de avaliação de tempo em todas as vendas retornadas
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

    // GET /vendas/:id - Buscar venda por ID
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

    // GET /vendas/usuario/:idUsuario
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

    // Métodos PADRÃO: Atualizar e Excluir
    static async atualizar(req, res) {
        // ... (Mesma lógica da resposta anterior, mantida para atualizações manuais por Admins)
    }

    static async excluir(req, res) {
         // ... (Mesma lógica da resposta anterior)
    }
}

export default VendaController;