import ProdutoModel from '../models/produtoModel.js';

const GENEROS_VALIDOS = new Set(['Masculino', 'Feminino', 'Unissex', 'Infantil']);
const ORDENACOES_VALIDAS = new Set([
    'recente', 'mais_vendidos', 'preco_asc', 'preco_desc', 'nome_asc', 'antigo'
]);

class FiltroInvalidoError extends Error {}

function normalizarFiltros(query) {
    const filtros = {};
    const pagina = Number(query.pagina ?? 1);
    const limite = Number(query.limite ?? 12);

    if (!Number.isInteger(pagina) || pagina < 1) {
        throw new FiltroInvalidoError('A página deve ser um número inteiro maior que zero.');
    }

    if (!Number.isInteger(limite) || limite < 1 || limite > 100) {
        throw new FiltroInvalidoError('O limite deve ser um número inteiro entre 1 e 100.');
    }

    filtros.pagina = pagina;
    filtros.limite = limite;

    if (query.busca !== undefined && String(query.busca).trim()) {
        const busca = String(query.busca).trim();
        if (busca.length > 100) {
            throw new FiltroInvalidoError('A busca deve ter no máximo 100 caracteres.');
        }
        filtros.busca = busca;
    }

    for (const campo of ['categoria', 'tipo']) {
        if (query[campo] !== undefined && String(query[campo]).trim()) {
            const valor = String(query[campo]).trim();
            if (valor.length > 100) {
                throw new FiltroInvalidoError(`${campo} deve ter no máximo 100 caracteres.`);
            }
            filtros[campo] = valor;
        }
    }

    if (query.genero !== undefined && query.genero !== '') {
        if (!GENEROS_VALIDOS.has(query.genero)) {
            throw new FiltroInvalidoError('Gênero inválido.');
        }
        filtros.genero = query.genero;
    }

    for (const campo of [
        'idCategoria', 'idSubcategoria', 'idCor', 'idTamanho', 'idModelo'
    ]) {
        if (query[campo] !== undefined && query[campo] !== '') {
            const valor = Number(query[campo]);
            if (!Number.isInteger(valor) || valor < 1) {
                throw new FiltroInvalidoError(`${campo} deve ser um número inteiro positivo.`);
            }
            filtros[campo] = valor;
        }
    }

    for (const campo of ['precoMin', 'precoMax']) {
        if (query[campo] !== undefined && query[campo] !== '') {
            const valor = Number(query[campo]);
            if (!Number.isFinite(valor) || valor < 0) {
                throw new FiltroInvalidoError(`${campo} deve ser um valor numérico positivo.`);
            }
            filtros[campo] = valor;
        }
    }

    if (
        filtros.precoMin !== undefined &&
        filtros.precoMax !== undefined &&
        filtros.precoMin > filtros.precoMax
    ) {
        throw new FiltroInvalidoError('O preço mínimo não pode ser maior que o preço máximo.');
    }

    if (query.emEstoque !== undefined && query.emEstoque !== '') {
        if (!['true', 'false'].includes(String(query.emEstoque))) {
            throw new FiltroInvalidoError('O filtro de estoque deve ser true ou false.');
        }
        filtros.emEstoque = String(query.emEstoque);
    }

    if (query.ordenarPor !== undefined && query.ordenarPor !== '') {
        if (!ORDENACOES_VALIDAS.has(query.ordenarPor)) {
            throw new FiltroInvalidoError('Ordenação inválida.');
        }
        filtros.ordenarPor = query.ordenarPor;
    }

    return filtros;
}

const TAMANHOS_POR_TIPO = {
    roupaSuperior: new Set(['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG', 'EG', 'EGG']),
    calcado: new Set([
        '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36',
        '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48'
    ]),
    roupaNumerica: new Set([
        '32', '34', '36', '38', '40', '42', '44', '46', '48', '50', '52',
        '54', '56', '58', '60'
    ]),
    unico: new Set(['U', 'UNICO'])
};

function normalizarTexto(valor = '') {
    return String(valor)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toUpperCase();
}

function contemAlgum(texto, palavras) {
    return palavras.some((palavra) => texto.includes(palavra));
}

function identificarTipoTamanho(produto) {
    const classificacao = normalizarTexto([
        produto.categoriaNome,
        produto.subcategoriaNome,
        produto.modeloNome,
        produto.nome
    ].filter(Boolean).join(' '));

    if (contemAlgum(classificacao, [
        'TENIS', 'SAPATO', 'SANDALIA', 'CHINELO', 'BOTA', 'COTURNO',
        'MOCASSIM', 'CALCADO'
    ])) {
        return 'calcado';
    }

    if (contemAlgum(classificacao, [
        'CALCA', 'BERMUDA', 'SHORT', 'SAIA'
    ])) {
        return 'roupaNumerica';
    }

    if (contemAlgum(classificacao, [
        'CAMISETA', 'CAMISA', 'JAQUETA', 'CASACO', 'MOLETOM', 'BLUSA',
        'REGATA', 'SUETER', 'VESTIDO', 'POLO'
    ])) {
        return 'roupaSuperior';
    }

    if (contemAlgum(classificacao, [
        'BONE', 'BOLSA', 'CARTEIRA', 'OCULOS', 'RELOGIO', 'ACESSORIO'
    ])) {
        return 'unico';
    }

    // Para categorias ainda não mapeadas, preserva os tamanhos cadastrados.
    return 'generico';
}

function tamanhoCompativel(codigoTamanho, tipo) {
    const codigo = normalizarTexto(codigoTamanho);

    if (!codigo) {
        return false;
    }

    if (tipo === 'generico') {
        return true;
    }

    return TAMANHOS_POR_TIPO[tipo]?.has(codigo) || false;
}

function montarOpcoes(variacoes) {
    const cores = new Map();
    const tamanhos = new Map();

    for (const variacao of variacoes) {
        const disponivel = Number(variacao.estoque) > 0;

        if (variacao.idCor !== null && variacao.idCor !== undefined) {
            const chaveCor = String(variacao.idCor);
            const corExistente = cores.get(chaveCor);

            cores.set(chaveCor, {
                idCor: variacao.idCor,
                nomeCor: variacao.corNome,
                codigoCor: variacao.codigoCor,
                tom: variacao.corTom,
                disponivel: Boolean(corExistente?.disponivel || disponivel)
            });
        }

        if (variacao.idTamanho !== null && variacao.idTamanho !== undefined) {
            const chaveTamanho = String(variacao.idTamanho);
            const tamanhoExistente = tamanhos.get(chaveTamanho);

            tamanhos.set(chaveTamanho, {
                idTamanho: variacao.idTamanho,
                codigoTamanho: variacao.tamanhoNome,
                disponivel: Boolean(tamanhoExistente?.disponivel || disponivel)
            });
        }
    }

    return {
        coresDisponiveis: Array.from(cores.values()),
        tamanhosDisponiveis: Array.from(tamanhos.values())
    };
}

class ProdutoController {
    // GET /produtos
    static async listarOuFiltrar(req, res) {
        try {
            const filtros = normalizarFiltros(req.query);
            const resultado = await ProdutoModel.buscarComFiltros(filtros);

            res.status(200).json({
                sucesso: true,
                dados: resultado.produtos,
                paginacao: {
                    pagina: resultado.pagina,
                    limite: resultado.limite,
                    total: resultado.total,
                    totalPaginas: resultado.totalPaginas
                }
            });
        } catch (error) {
            if (error instanceof FiltroInvalidoError) {
                return res.status(400).json({
                    sucesso: false,
                    erro: error.message
                });
            }

            console.error('Erro ao buscar produtos:', error);
            return res.status(500).json({
                sucesso: false,
                erro: 'Erro interno ao processar a busca'
            });
        }
    }

    // GET /produtos/filtros
    static async listarFiltros(req, res) {
        try {
            const filtros = await ProdutoModel.buscarOpcoesFiltros();
            return res.status(200).json({ sucesso: true, dados: filtros });
        } catch (error) {
            console.error('Erro ao buscar filtros de produtos:', error);
            return res.status(500).json({
                sucesso: false,
                erro: 'Erro interno ao carregar os filtros'
            });
        }
    }

    // GET /produtos/:id/detalhes
    static async buscarDetalhes(req, res) {
        try {
            const { id } = req.params;

            if (!id || Number.isNaN(Number(id))) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'ID inválido'
                });
            }

            const detalhes = await ProdutoModel.buscarDetalhesPorId(id);

            if (!detalhes) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Produto não encontrado'
                });
            }

            const tipoTamanho = identificarTipoTamanho(detalhes.produto);
            const variacoes = detalhes.variacoes
                .filter((variacao) => tamanhoCompativel(variacao.tamanhoNome, tipoTamanho))
                .map((variacao) => ({
                    ...variacao,
                    preco: Number(variacao.preco),
                    estoque: Number(variacao.estoque),
                    disponivel: Number(variacao.estoque) > 0
                }));

            const opcoes = montarOpcoes(variacoes);

            return res.status(200).json({
                sucesso: true,
                dados: {
                    produto: {
                        ...detalhes.produto,
                        preco: Number(detalhes.produto.preco),
                        estoque: Number(detalhes.produto.estoque)
                    },
                    tipoTamanho,
                    variacoes,
                    ...opcoes
                }
            });
        } catch (error) {
            console.error('Erro ao buscar detalhes do produto:', error);
            return res.status(500).json({
                sucesso: false,
                erro: 'Erro interno ao buscar os detalhes do produto'
            });
        }
    }

    // GET /produtos/:id
    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;

            if (!id || Number.isNaN(Number(id))) {
                return res.status(400).json({ sucesso: false, erro: 'ID inválido' });
            }

            const produto = await ProdutoModel.buscarPorId(id);

            if (!produto) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Produto não encontrado'
                });
            }

            return res.status(200).json({ sucesso: true, dados: produto });
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            return res.status(500).json({
                sucesso: false,
                erro: 'Erro interno ao buscar o produto'
            });
        }
    }

    // POST /produtos (ADMIN)
    static async criar(req, res) {
        try {
            const {
                sku,
                nome,
                nomeCombinacao,
                descricao,
                genero,
                preco,
                idCategoria,
                idSubcategoria,
                idCor,
                idTamanho,
                idModelo,
                estoque,
                imagem1,
                imagem2,
                imagem3,
                imagem4
            } = req.body;

            if (
                !sku || !nome || !nomeCombinacao || !descricao ||
                preco === undefined || !idCategoria || !idSubcategoria ||
                !idCor || !idTamanho || !idModelo || !imagem1 ||
                estoque === undefined
            ) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Todos os campos obrigatórios devem ser preenchidos, incluindo imagem1'
                });
            }

            const dadosProduto = {
                sku: sku.trim(),
                nome: nome.trim(),
                nomeCombinacao: nomeCombinacao.trim(),
                descricao: descricao.trim(),
                genero: genero ? genero.trim() : 'Unissex',
                preco: parseFloat(preco),
                idCategoria: parseInt(idCategoria, 10),
                idSubcategoria: parseInt(idSubcategoria, 10),
                idCor: parseInt(idCor, 10),
                idTamanho: parseInt(idTamanho, 10),
                idModelo: parseInt(idModelo, 10),
                estoque: parseInt(estoque, 10),
                imagem1: imagem1.trim(),
                imagem2: imagem2 ? imagem2.trim() : null,
                imagem3: imagem3 ? imagem3.trim() : null,
                imagem4: imagem4 ? imagem4.trim() : null
            };

            const idProduto = await ProdutoModel.criar(dadosProduto);

            return res.status(201).json({
                sucesso: true,
                mensagem: 'Produto cadastrado com sucesso',
                dados: { idProduto, ...dadosProduto }
            });
        } catch (error) {
            console.error('Erro ao criar produto:', error);

            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    sucesso: false,
                    erro: 'Já existe um produto com este SKU cadastrado'
                });
            }

            return res.status(500).json({
                sucesso: false,
                erro: 'Erro interno ao salvar produto'
            });
        }
    }

    // PUT /produtos/:id (ADMIN)
    static async atualizar(req, res) {
        try {
            const { id } = req.params;

            if (!id || Number.isNaN(Number(id))) {
                return res.status(400).json({ sucesso: false, erro: 'ID inválido' });
            }

            const produtoExistente = await ProdutoModel.buscarPorId(id);

            if (!produtoExistente) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Produto não encontrado'
                });
            }

            const camposPermitidos = [
                'sku', 'nome', 'nomeCombinacao', 'descricao', 'genero', 'preco',
                'idCategoria', 'idSubcategoria', 'idCor', 'idTamanho', 'idModelo',
                'estoque', 'imagem1', 'imagem2', 'imagem3', 'imagem4'
            ];
            const dadosAtualizacao = {};

            camposPermitidos.forEach((campo) => {
                if (req.body[campo] !== undefined) {
                    dadosAtualizacao[campo] = typeof req.body[campo] === 'string'
                        ? req.body[campo].trim()
                        : req.body[campo];
                }
            });

            if (Object.keys(dadosAtualizacao).length === 0) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Nenhum dado válido para atualização fornecido'
                });
            }

            await ProdutoModel.atualizar(id, dadosAtualizacao);

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Produto atualizado com sucesso'
            });
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);

            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    sucesso: false,
                    erro: 'Este SKU já está em uso por outro produto'
                });
            }

            return res.status(500).json({
                sucesso: false,
                erro: 'Erro interno ao atualizar produto'
            });
        }
    }

    // DELETE /produtos/:id (ADMIN)
    static async excluir(req, res) {
        try {
            const { id } = req.params;

            if (!id || Number.isNaN(Number(id))) {
                return res.status(400).json({ sucesso: false, erro: 'ID inválido' });
            }

            const produtoExistente = await ProdutoModel.buscarPorId(id);

            if (!produtoExistente) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Produto não encontrado'
                });
            }

            await ProdutoModel.excluirLogico(id);

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Produto desativado com sucesso'
            });
        } catch (error) {
            console.error('Erro ao desativar produto:', error);
            return res.status(500).json({
                sucesso: false,
                erro: 'Erro interno ao desativar produto'
            });
        }
    }
}

export default ProdutoController;
