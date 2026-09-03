import ProdutoModel from '../models/produtoModel.js';
import { removerArquivoAntigo } from '../middlewares/uploadMiddleware.js';

const GENEROS_VALIDOS = new Set(['Masculino', 'Feminino', 'Unissex', 'Infantil']);
const ORDENACOES_VALIDAS = new Set([
    'recente', 'mais_vendidos', 'preco_asc', 'preco_desc', 'nome_asc', 'antigo'
]);

class FiltroInvalidoError extends Error {}
class ProdutoInvalidoError extends Error {}

const CAMPOS_IMAGEM = ['imagem1', 'imagem2', 'imagem3', 'imagem4'];
const CAMPOS_INTEIROS = ['idCategoria', 'idSubcategoria', 'idCor', 'idTamanho', 'idModelo', 'estoque'];

function obterImagensEnviadas(req) {
    return Object.fromEntries(
        CAMPOS_IMAGEM
            .filter((campo) => req.files?.[campo]?.[0])
            .map((campo) => [campo, `uploads/imagens/${req.files[campo][0].filename}`])
    );
}

async function limparImagens(imagens) {
    await Promise.all(Object.values(imagens).map((imagem) => removerArquivoAntigo(imagem)));
}

function validarNumero(valor, campo, { inteiro = false, minimo = 0 } = {}) {
    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero < minimo || (inteiro && !Number.isInteger(numero))) {
        throw new ProdutoInvalidoError(`${campo} deve ser um número válido maior ou igual a ${minimo}.`);
    }
    return numero;
}

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

    if (query.agruparModelos !== undefined && query.agruparModelos !== '') {
        if (!['true', 'false'].includes(String(query.agruparModelos))) {
            throw new FiltroInvalidoError('O agrupamento por modelos deve ser true ou false.');
        }
        filtros.agruparModelos = String(query.agruparModelos) !== 'false';
    }

    return filtros;
}

function criarSlugModelo(nome, idModelo) {
    const slugNome = String(nome)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    return `${slugNome || 'modelo'}-${Number(idModelo)}`;
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

            if (!id || String(id).length > 180) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Referência de modelo inválida'
                });
            }

            const detalhes = await ProdutoModel.buscarDetalhesPorId(id);

            if (!detalhes) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Produto não encontrado'
                });
            }

            const variacoes = detalhes.variacoes
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

    // GET /produtos/tamanhos-compativeis/:idSubcategoria
    static async listarTamanhosCompativeis(req, res) {
        try {
            const idSubcategoria = Number(req.params.idSubcategoria);
            if (!Number.isInteger(idSubcategoria) || idSubcategoria < 1) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Subcategoria inválida'
                });
            }

            const tamanhos = await ProdutoModel.buscarTamanhosCompativeis(idSubcategoria);
            return res.status(200).json({ sucesso: true, dados: tamanhos });
        } catch (error) {
            console.error('Erro ao buscar tamanhos compatíveis:', error);
            return res.status(500).json({
                sucesso: false,
                erro: 'Erro interno ao buscar tamanhos compatíveis'
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
        const imagensEnviadas = obterImagensEnviadas(req);
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
                imagem1, imagem2, imagem3, imagem4
            } = req.body || {};

            const imagens = {
                imagem1: imagensEnviadas.imagem1 || imagem1,
                imagem2: imagensEnviadas.imagem2 || imagem2 || null,
                imagem3: imagensEnviadas.imagem3 || imagem3 || null,
                imagem4: imagensEnviadas.imagem4 || imagem4 || null
            };

            if (
                !sku || !nome || !nomeCombinacao || !descricao ||
                preco === undefined || !idCategoria || !idSubcategoria ||
                !idCor || !idTamanho || !idModelo || !imagens.imagem1 ||
                estoque === undefined
            ) {
                throw new ProdutoInvalidoError('Todos os campos obrigatórios devem ser preenchidos, incluindo a imagem principal.');
            }

            const generoNormalizado = genero ? genero.trim() : 'Unissex';
            if (!GENEROS_VALIDOS.has(generoNormalizado)) {
                throw new ProdutoInvalidoError('Gênero inválido.');
            }

            const dadosProduto = {
                sku: sku.trim(),
                nome: nome.trim(),
                slugModelo: criarSlugModelo(nome, idModelo),
                nomeCombinacao: nomeCombinacao.trim(),
                descricao: descricao.trim(),
                genero: generoNormalizado,
                preco: validarNumero(preco, 'Preço'),
                idCategoria: validarNumero(idCategoria, 'Categoria', { inteiro: true, minimo: 1 }),
                idSubcategoria: validarNumero(idSubcategoria, 'Subcategoria', { inteiro: true, minimo: 1 }),
                idCor: validarNumero(idCor, 'Cor', { inteiro: true, minimo: 1 }),
                idTamanho: validarNumero(idTamanho, 'Tamanho', { inteiro: true, minimo: 1 }),
                idModelo: validarNumero(idModelo, 'Modelo', { inteiro: true, minimo: 1 }),
                estoque: validarNumero(estoque, 'Estoque', { inteiro: true }),
                ...imagens
            };

            if (!await ProdutoModel.tamanhoCompativel(
                dadosProduto.idSubcategoria,
                dadosProduto.idTamanho
            )) {
                throw new ProdutoInvalidoError(
                    'O tamanho selecionado não é compatível com a subcategoria do produto.'
                );
            }

            const idProduto = await ProdutoModel.criar(dadosProduto);

            return res.status(201).json({
                sucesso: true,
                mensagem: 'Produto cadastrado com sucesso',
                dados: { idProduto, ...dadosProduto }
            });
        } catch (error) {
            await limparImagens(imagensEnviadas);
            console.error('Erro ao criar produto:', error);

            if (error instanceof ProdutoInvalidoError) {
                return res.status(400).json({ sucesso: false, erro: error.message });
            }

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
        const imagensEnviadas = obterImagensEnviadas(req);
        try {
            const { id } = req.params;

            if (!id || Number.isNaN(Number(id))) {
                await limparImagens(imagensEnviadas);
                return res.status(400).json({ sucesso: false, erro: 'ID inválido' });
            }

            const produtoExistente = await ProdutoModel.buscarPorId(id);

            if (!produtoExistente) {
                await limparImagens(imagensEnviadas);
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Produto não encontrado'
                });
            }

            const camposPermitidos = [
                'sku', 'nome', 'nomeCombinacao', 'descricao', 'genero', 'preco',
                ...CAMPOS_INTEIROS
            ];
            const dadosAtualizacao = {};

            camposPermitidos.forEach((campo) => {
                if (req.body?.[campo] !== undefined) {
                    dadosAtualizacao[campo] = typeof req.body[campo] === 'string'
                        ? req.body[campo].trim()
                        : req.body[campo];
                }
            });

            Object.assign(dadosAtualizacao, imagensEnviadas);

            if (dadosAtualizacao.genero !== undefined && !GENEROS_VALIDOS.has(dadosAtualizacao.genero)) {
                throw new ProdutoInvalidoError('Gênero inválido.');
            }
            if (dadosAtualizacao.preco !== undefined) {
                dadosAtualizacao.preco = validarNumero(dadosAtualizacao.preco, 'Preço');
            }
            CAMPOS_INTEIROS.forEach((campo) => {
                if (dadosAtualizacao[campo] !== undefined) {
                    dadosAtualizacao[campo] = validarNumero(
                        dadosAtualizacao[campo],
                        campo,
                        { inteiro: true, minimo: campo === 'estoque' ? 0 : 1 }
                    );
                }
            });

            const idSubcategoriaFinal = dadosAtualizacao.idSubcategoria
                ?? produtoExistente.idSubcategoria;
            const idTamanhoFinal = dadosAtualizacao.idTamanho
                ?? produtoExistente.idTamanho;

            if (!await ProdutoModel.tamanhoCompativel(idSubcategoriaFinal, idTamanhoFinal)) {
                throw new ProdutoInvalidoError(
                    'O tamanho selecionado não é compatível com a subcategoria do produto.'
                );
            }

            if (dadosAtualizacao.nome !== undefined || dadosAtualizacao.idModelo !== undefined) {
                dadosAtualizacao.slugModelo = criarSlugModelo(
                    dadosAtualizacao.nome ?? produtoExistente.nome,
                    dadosAtualizacao.idModelo ?? produtoExistente.idModelo
                );
            }

            if (Object.keys(dadosAtualizacao).length === 0) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Nenhum dado válido para atualização fornecido'
                });
            }

            await ProdutoModel.atualizar(id, dadosAtualizacao);

            const imagensSubstituidas = CAMPOS_IMAGEM
                .filter((campo) => imagensEnviadas[campo] && produtoExistente[campo])
                .map((campo) => produtoExistente[campo]);
            await Promise.all(imagensSubstituidas.map((imagem) => removerArquivoAntigo(imagem)));

            const produtoAtualizado = await ProdutoModel.buscarPorId(id);

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Produto atualizado com sucesso',
                dados: produtoAtualizado
            });
        } catch (error) {
            await limparImagens(imagensEnviadas);
            console.error('Erro ao atualizar produto:', error);

            if (error instanceof ProdutoInvalidoError) {
                return res.status(400).json({ sucesso: false, erro: error.message });
            }

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
