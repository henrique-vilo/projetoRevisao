import ProdutoModel from '../models/produtoModel.js';

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
            console.error('Erro ao buscar produto:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno ao buscar o produto' });
        }
    }

    // POST /produtos (ADMIN)
    static async criar(req, res) {
        try {
            // Agora as imagens vêm diretamente do req.body (como string/caminho)
            const { sku, nome, nomeCombinacao, descricao, genero, preco, idCategoria, idSubcategoria, idCor, idTamanho, idModelo, estoque, imagem1, imagem2, imagem3, imagem4 } = req.body;

            // Validações de presença atualizadas
            if (!sku || !nome || !nomeCombinacao || !descricao || preco === undefined || !idCategoria || !idSubcategoria || !idCor || !idTamanho || !idModelo || !imagem1 || estoque === undefined) {
                return res.status(400).json({ sucesso: false, erro: 'Todos os campos obrigatórios devem ser preenchidos, incluindo a imagem principal (imagem1)' });
            }

            const dadosProduto = {
                sku: sku.trim(),
                nome: nome.trim(),
                nomeCombinacao: nomeCombinacao.trim(),
                descricao: descricao.trim(),
                genero: genero ? genero.trim() : 'Unissex',
                preco: parseFloat(preco),
                idCategoria: parseInt(idCategoria),
                idSubcategoria: parseInt(idSubcategoria),
                idCor: parseInt(idCor),
                idTamanho: parseInt(idTamanho),
                idModelo: parseInt(idModelo),
                estoque: parseInt(estoque),
                imagem1: imagem1.trim(), // Salvando apenas o texto/caminho
                imagem2: imagem2 ? imagem2.trim() : null,
                imagem3: imagem3 ? imagem3.trim() : null,
                imagem4: imagem4 ? imagem4.trim() : null
            };

            const idProduto = await ProdutoModel.criar(dadosProduto);
            res.status(201).json({ sucesso: true, mensagem: 'Produto cadastrado com sucesso', dados: { idProduto, ...dadosProduto } });
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            // Tratamento caso o SKU já exista (Violação da constraint UNIQUE)
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ sucesso: false, erro: 'Já existe um produto com este SKU cadastrado' });
            }
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

            // Adicionado campos de imagens no array de permitidos para atualização via req.body
            const camposPermitidos = [
                'sku', 'nome', 'nomeCombinacao', 'descricao', 'genero', 'preco', 
                'idCategoria', 'idSubcategoria', 'idCor', 'idTamanho', 'idModelo', 
                'estoque', 'imagem1', 'imagem2', 'imagem3', 'imagem4'
            ];
            
            const dadosAtualizacao = {};

            camposPermitidos.forEach(campo => {
                if (req.body[campo] !== undefined) {
                    // Adiciona trim() para strings, se necessário, ou apenas passa o valor
                    dadosAtualizacao[campo] = typeof req.body[campo] === 'string' ? req.body[campo].trim() : req.body[campo];
                }
            });

            if (Object.keys(dadosAtualizacao).length === 0) {
                return res.status(400).json({ sucesso: false, erro: 'Nenhum dado válido para atualização fornecido' });
            }

            await ProdutoModel.atualizar(id, dadosAtualizacao);
            res.status(200).json({ sucesso: true, mensagem: 'Produto atualizado com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ sucesso: false, erro: 'Este SKU já está em uso por outro produto' });
            }
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

            await ProdutoModel.excluirLogico(id);
            res.status(200).json({ sucesso: true, mensagem: 'Produto desativado com sucesso' });
        } catch (error) {
            console.error('Erro ao desativar produto:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno ao desativar produto' });
        }
    }
}

export default ProdutoController;