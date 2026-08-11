import ProdutoModel from '../models/produtoModel.js';
import { removerArquivoAntigo } from '../middlewares/uploadMiddleware.js';

class ProdutoController {

    // GET /produtos - Filtro Universal de Roupas
    static async listarOuFiltrar(req, res) {
        try {
            const resultado = await ProdutoModel.buscarComFiltros(req.query);

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
            console.error('Erro ao buscar produtos:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno ao processar a busca' });
        }
    }

    // GET /produtos/:id
    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            if (isNaN(id)) return res.status(400).json({ sucesso: false, erro: 'ID inválido' });

            const produto = await ProdutoModel.buscarPorId(id);
            if (!produto) return res.status(404).json({ sucesso: false, erro: 'Produto não encontrado' });

            res.status(200).json({ sucesso: true, dados: produto });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: 'Erro interno ao buscar o produto' });
        }
    }

    // POST /produtos (ADMIN)
    static async criar(req, res) {
        try {
            const { nome, descricao, preco, idCategoria, idSubcategoria, idCor, idTamanho, idModelo, estoque } = req.body;

            // Validações de presença
            if (!nome || !descricao || preco === undefined || !idCategoria || !idSubcategoria || !idCor || !idTamanho || !idModelo || estoque === undefined) {
                return res.status(400).json({ sucesso: false, erro: 'Todos os campos obrigatórios devem ser preenchidos' });
            }

            // Trata upload de arquivos (req.files do multer para múltiplos arquivos)
            const imagens = req.files || {};
            if (!imagens.imagem1 || !imagens.imagem1[0]) {
                return res.status(400).json({ sucesso: false, erro: 'A imagem1 principal é obrigatória' });
            }

            const dadosProduto = {
                nome: nome.trim(),
                descricao: descricao.trim(),
                preco: parseFloat(preco),
                idCategoria: parseInt(idCategoria),
                idSubcategoria: parseInt(idSubcategoria),
                idCor: parseInt(idCor),
                idTamanho: parseInt(idTamanho),
                idModelo: parseInt(idModelo),
                estoque: parseInt(estoque),
                imagem1: imagens.imagem1[0].filename,
                imagem2: imagens.imagem2?.[0]?.filename || null,
                imagem3: imagens.imagem3?.[0]?.filename || null,
                imagem4: imagens.imagem4?.[0]?.filename || null
            };

            const idProduto = await ProdutoModel.criar(dadosProduto);
            res.status(201).json({ sucesso: true, mensagem: 'Produto cadastrado com sucesso', dados: { idProduto, ...dadosProduto } });
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno ao salvar produto' });
        }
    }

    // PUT /produtos/:id (ADMIN)
    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            if (isNaN(id)) return res.status(400).json({ sucesso: false, erro: 'ID inválido' });

            const produtoExistente = await ProdutoModel.buscarPorId(id);
            if (!produtoExistente) return res.status(404).json({ sucesso: false, erro: 'Produto não encontrado' });

            const camposPermitidos = ['nome', 'descricao', 'preco', 'idCategoria', 'idSubcategoria', 'idCor', 'idTamanho', 'idModelo', 'estoque'];
            const dadosAtualizacao = {};

            camposPermitidos.forEach(campo => {
                if (req.body[campo] !== undefined) {
                    dadosAtualizacao[campo] = req.body[campo];
                }
            });

            // Tratamento de atualização de imagem
            if (req.files) {
                ['imagem1', 'imagem2', 'imagem3', 'imagem4'].forEach(imgKey => {
                    if (req.files[imgKey]?.[0]) {
                        if (produtoExistente[imgKey]) removerArquivoAntigo(produtoExistente[imgKey], 'imagem');
                        dadosAtualizacao[imgKey] = req.files[imgKey][0].filename;
                    }
                });
            }

            if (Object.keys(dadosAtualizacao).length === 0) {
                return res.status(400).json({ sucesso: false, erro: 'Nenhum dado válido para atualização fornecido' });
            }

            await ProdutoModel.atualizar(id, dadosAtualizacao);
            res.status(200).json({ sucesso: true, mensagem: 'Produto atualizado com sucesso' });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: 'Erro interno ao atualizar produto' });
        }
    }

    // DELETE /produtos/:id (ADMIN)
    static async excluir(req, res) {
        try {
            const { id } = req.params;
            if (isNaN(id)) return res.status(400).json({ sucesso: false, erro: 'ID inválido' });

            const produtoExistente = await ProdutoModel.buscarPorId(id);
            if (!produtoExistente) return res.status(404).json({ sucesso: false, erro: 'Produto não encontrado' });

            // Aplica Soft Delete para preservar integridade relacional
            await ProdutoModel.excluirLogico(id);
            res.status(200).json({ sucesso: true, mensagem: 'Produto desativado com sucesso' });
        } catch (error) {
            res.status(500).json({ sucesso: false, erro: 'Erro interno ao desativar produto' });
        }
    }
}

export default ProdutoController;