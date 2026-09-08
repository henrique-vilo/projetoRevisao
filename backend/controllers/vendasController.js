import VendaModel from '../models/vendasModel.js';

const STATUS_PERMITIDOS = new Set(['carrinho', 'pendente', 'processando', 'enviado', 'entregue', 'cancelado']);
const possui = (objeto, campo) => Object.prototype.hasOwnProperty.call(objeto, campo);

function falhar(status, mensagem) {
    const error = new Error(mensagem);
    error.status = status;
    throw error;
}

function idValido(value, campo = 'ID') {
    if (!/^\d+$/.test(String(value ?? '')) || !Number.isSafeInteger(Number(value)) || Number(value) < 1) {
        falhar(400, `${campo} deve ser um inteiro positivo.`);
    }
    return Number(value);
}

function statusValido(value) {
    const status = String(value ?? '').trim().toLowerCase();
    if (!STATUS_PERMITIDOS.has(status)) falhar(400, 'Status inválido informado.');
    return status;
}

function dataSQL(value, campo) {
    if (value === null || value === '') return null;
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) falhar(400, `${campo} deve estar no formato AAAA-MM-DD.`);
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) falhar(400, `${campo} inválida.`);
    return value;
}

function formatarDataBR(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function serializar(venda) {
    return {
        ...venda,
        status: venda.status == null ? null : String(venda.status).trim().toLowerCase(),
        dataPedidoBR: formatarDataBR(venda.dataPedido),
        dataEntregaBR: formatarDataBR(venda.dataEntrega),
        ...(possui(venda, 'dataEnvio') ? { dataEnvioBR: formatarDataBR(venda.dataEnvio) } : {}),
    };
}

function identidade(req) {
    if (!req.usuario) falhar(401, 'Autenticação necessária.');
    return { id: idValido(req.usuario.id, 'ID da sessão'), admin: req.usuario.tipo === 'admin' };
}

function exigirAdmin(req) {
    if (!identidade(req).admin) falhar(403, 'Operação permitida apenas para administradores.');
}

function exigirProprietario(req, idUsuario) {
    const usuario = identidade(req);
    if (!usuario.admin && usuario.id !== Number(idUsuario)) falhar(403, 'Você não tem acesso a este pedido.');
}

async function obterVenda(id) {
    const venda = await VendaModel.buscarPorId(id);
    if (!venda) falhar(404, 'Pedido não encontrado.');
    return venda;
}

async function validarReferencias(dados) {
    if (possui(dados, 'idUsuario') && !await VendaModel.buscarUsuarioVenda(dados.idUsuario)) falhar(400, 'Usuário não encontrado.');
    if (possui(dados, 'idProduto') && !await VendaModel.buscarProdutoVenda(dados.idProduto)) falhar(400, 'Produto não encontrado.');
}

function responderErro(res, error) {
    console.error('Erro na operação de vendas:', error);
    if (error.status) return res.status(error.status).json({ sucesso: false, mensagem: error.message });
    if (error.code === 'PRODUTO_INDISPONIVEL') {
        return res.status(404).json({ sucesso: false, mensagem: error.message });
    }
    if (error.code === 'ESTOQUE_INSUFICIENTE') {
        return res.status(409).json({ sucesso: false, mensagem: error.message });
    }
    if (error.code === 'CARRINHO_VAZIO') {
        return res.status(400).json({ sucesso: false, mensagem: error.message });
    }
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
        return res.status(409).json({ sucesso: false, mensagem: 'Este pedido possui registros vinculados e não pode ser excluído.' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ sucesso: false, mensagem: 'Usuário ou produto inexistente.' });
    }
    return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao acessar pedidos. Confira o log do backend.' });
}

class VendaController {
    static async criar(req, res) {
        try {
            exigirAdmin(req);
            const body = req.body || {};
            const status = statusValido(body.status ?? 'pendente');
            const dados = {
                idUsuario: idValido(body.idUsuario, 'ID do usuário'),
                idProduto: idValido(body.idProduto, 'ID do produto'),
                status,
                dataPedido: possui(body, 'dataPedido') ? dataSQL(body.dataPedido, 'Data do pedido') : (status === 'carrinho' ? null : new Date().toISOString().slice(0, 10)),
                dataEntrega: possui(body, 'dataEntrega') ? dataSQL(body.dataEntrega, 'Data de entrega') : null,
            };
            await validarReferencias(dados);
            const id = await VendaModel.criar(dados);
            return res.status(201).json({ sucesso: true, mensagem: 'Pedido criado com sucesso.', dados: serializar(await obterVenda(id)) });
        } catch (error) { return responderErro(res, error); }
    }

    static async adicionarCarrinho(req, res) {
        try {
            const usuario = identidade(req);
            const body = req.body || {};
            const idProduto = idValido(body.idProduto, 'ID do produto');
            const id = await VendaModel.adicionarAoCarrinho(usuario.id, idProduto);
            return res.status(201).json({
                sucesso: true,
                mensagem: 'Produto adicionado ao carrinho.',
                dados: { idVendas: id, idProduto },
            });
        } catch (error) { return responderErro(res, error); }
    }

    static async listarCarrinho(req, res) {
        try {
            const usuario = identidade(req);
            let idUsuario = usuario.id;

            if (req.params.idUsuario != null) {
                idUsuario = idValido(req.params.idUsuario, 'ID do usuário');
                exigirProprietario(req, idUsuario);
            }

            const itens = await VendaModel.buscarCarrinho(idUsuario);
            return res.status(200).json({ sucesso: true, dados: itens });
        } catch (error) { return responderErro(res, error); }
    }

    static async removerCarrinho(req, res) {
        try {
            const usuario = identidade(req);
            const idVenda = idValido(req.params.id, 'ID do item');
            const removidos = await VendaModel.removerDoCarrinho(idVenda, usuario.id);
            if (!removidos) falhar(404, 'Item não encontrado no seu carrinho.');
            return res.status(200).json({ sucesso: true, mensagem: 'Produto removido do carrinho.' });
        } catch (error) { return responderErro(res, error); }
    }

    static async confirmarCarrinho(req, res) {
        try {
            const usuario = identidade(req);
            const cadastro = await VendaModel.buscarUsuarioVenda(usuario.id);
            const cep = String(cadastro?.cep ?? '').replace(/\D/g, '');
            if (!/^\d{8}$/.test(cep)) falhar(400, 'Cadastre um CEP válido no seu perfil antes de finalizar a compra.');

            const previsaoEntregaDias = Number(cep[0]) === 0 ? 2 : Number(cep[0]) + 2;
            const hoje = new Date();
            const entrega = new Date(hoje);
            entrega.setUTCDate(entrega.getUTCDate() + previsaoEntregaDias);
            const dataPedido = hoje.toISOString().slice(0, 10);
            const dataEntrega = entrega.toISOString().slice(0, 10);
            const resultado = await VendaModel.confirmarCarrinho(usuario.id, dataPedido, dataEntrega);

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Compra confirmada. Seu pedido está em processamento.',
                dados: {
                    ...resultado,
                    previsaoEntregaDias,
                    dataPedidoBR: formatarDataBR(dataPedido),
                    dataEntregaBR: formatarDataBR(dataEntrega),
                    status: 'processando',
                },
            });
        } catch (error) { return responderErro(res, error); }
    }

    static async confirmarCompra(req, res) {
        try {
            const id = idValido(req.params.id);
            const venda = await obterVenda(id);
            exigirProprietario(req, venda.idUsuario);
            if (statusValido(venda.status) !== 'carrinho') falhar(400, 'Esta venda já passou da fase de carrinho.');
            const usuario = await VendaModel.buscarUsuarioVenda(venda.idUsuario);
            const cep = String(usuario?.cep ?? '').replace(/\D/g, '');
            if (!/^\d{8}$/.test(cep)) falhar(400, 'Usuário sem CEP válido cadastrado.');
            const previsaoEntregaDias = Number(cep[0]) === 0 ? 2 : Number(cep[0]) + 2;
            const hoje = new Date();
            const entrega = new Date(hoje);
            entrega.setUTCDate(entrega.getUTCDate() + previsaoEntregaDias);
            await VendaModel.atualizar(id, { dataPedido: hoje.toISOString().slice(0, 10), dataEntrega: entrega.toISOString().slice(0, 10), status: 'processando' });
            return res.status(200).json({ sucesso: true, mensagem: 'Compra confirmada com sucesso.', dados: { ...serializar(await obterVenda(id)), previsaoEntregaDias } });
        } catch (error) { return responderErro(res, error); }
    }

    static async listarTodos(req, res) {
        try {
            const usuario = identidade(req);
            const pagina = idValido(req.query.pagina ?? 1, 'Página');
            const limite = Math.min(idValido(req.query.limite ?? 10, 'Limite'), 100);
            const offset = (pagina - 1) * limite;
            if (!Number.isSafeInteger(offset)) falhar(400, 'Página fora do intervalo permitido.');
            const busca = String(req.query.busca ?? '').trim().slice(0, 200);
            const resultado = await VendaModel.listarTodos(limite, offset, busca, usuario.admin ? null : usuario.id);
            const { vendas, ...paginacao } = resultado;
            return res.status(200).json({ sucesso: true, dados: vendas.map(serializar), paginacao });
        } catch (error) { return responderErro(res, error); }
    }

    static async buscarPorId(req, res) {
        try {
            const venda = await obterVenda(idValido(req.params.id));
            exigirProprietario(req, venda.idUsuario);
            return res.status(200).json({ sucesso: true, dados: serializar(venda) });
        } catch (error) { return responderErro(res, error); }
    }

    static async buscarPorUsuario(req, res) {
        try {
            const idUsuario = idValido(req.params.idUsuario, 'ID do usuário');
            exigirProprietario(req, idUsuario);
            const vendas = await VendaModel.buscarPorUsuario(idUsuario);
            return res.status(200).json({ sucesso: true, dados: vendas.map(serializar) });
        } catch (error) { return responderErro(res, error); }
    }

    static async atualizar(req, res) {
        try {
            exigirAdmin(req);
            const id = idValido(req.params.id);
            await obterVenda(id);
            const body = req.body || {};
            const dados = {};
            for (const campo of ['idUsuario', 'idProduto']) {
                if (possui(body, campo)) dados[campo] = idValido(body[campo], campo);
            }
            if (possui(body, 'status')) dados.status = statusValido(body.status);
            for (const campo of ['dataPedido', 'dataEntrega']) {
                if (possui(body, campo)) dados[campo] = dataSQL(body[campo], campo);
            }
            if (!Object.keys(dados).length) falhar(400, 'Informe pelo menos um campo válido para atualizar.');
            await validarReferencias(dados);
            await VendaModel.atualizar(id, dados);
            return res.status(200).json({ sucesso: true, mensagem: 'Pedido atualizado com sucesso.', dados: serializar(await obterVenda(id)) });
        } catch (error) { return responderErro(res, error); }
    }

    static async excluir(req, res) {
        try {
            exigirAdmin(req);
            const id = idValido(req.params.id);
            await obterVenda(id);
            const removidos = await VendaModel.excluir(id);
            if (!removidos) falhar(404, 'Pedido não encontrado.');
            return res.status(200).json({ sucesso: true, mensagem: 'Pedido excluído com sucesso.', dados: { idVendas: id } });
        } catch (error) { return responderErro(res, error); }
    }
}

export default VendaController;
