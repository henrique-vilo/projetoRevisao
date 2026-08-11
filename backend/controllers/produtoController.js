import ProdutoModel from '../models/produtoModel.js';
import { fileURLToPath } from 'url';
import path from 'path';
import { removerArquivoAntigo } from '../middlewares/uploadMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definição de domínios permitidos (Ajuste conforme sua regra de negócios)
const DOMINIOS = {
    cores: ['preto', 'branco', 'azul', 'vermelho', 'verde', 'amarelo', 'cinza', 'rosa', 'marrom', 'multicor'],
    tamanhos: ['pp', 'p', 'm', 'g', 'gg', 'xg', 'unico'],
    categorias: ['camisetas', 'calcas', 'vestidos', 'blusas', 'jaquetas', 'acessorios', 'calcados'],
    subcategorias: ['casual', 'esporte', 'social', 'inverno', 'verao']
};

class ProdutoController {

    // GET /produtos - Listar todos os produtos (com paginação)
    static async listarTodos(req, res) {
        try {
            const pagina = parseInt(req.query.pagina) || 1;
            const limite = parseInt(req.query.limite) || 10;

            if (pagina <= 0) {
                return res.status(400).json({ sucesso: false, erro: 'Página inválida', mensagem: 'A página deve ser maior que zero' });
            }
            if (limite <= 0) {
                return res.status(400).json({ sucesso: false, erro: 'Limite inválido', mensagem: 'O limite deve ser maior que zero' });
            }

            const limiteMaximo = parseInt(process.env.PAGINACAO_LIMITE_MAXIMO) || 100;
            if (limite > limiteMaximo) {
                return res.status(400).json({ sucesso: false, erro: 'Limite inválido', mensagem: `O limite deve ser entre 1 e ${limiteMaximo}` });
            }

            const offset = (pagina - 1) * limite;
            const resultado = await ProdutoModel.listarTodos(limite, offset); 

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
            console.error('Erro ao listar produtos:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível listar os produtos' });
        }
    }

    // GET /produtos/:id - Buscar produto por ID
    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({ sucesso: false, erro: 'ID inválido', mensagem: 'O ID deve ser numérico' });
            }

            const produto = await ProdutoModel.buscarPorId(id);

            if (!produto) {
                return res.status(404).json({ sucesso: false, erro: 'Não encontrado', mensagem: `Produto ID ${id} não encontrado` });
            }

            res.status(200).json({ sucesso: true, dados: produto });
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível buscar o produto' });
        }
    }

    // POST /produtos - Criar novo produto
    static async criar(req, res) {
        try {
            const { nome, cores, tamanhos, descricao, preco, categoria, subcategoria, estoque } = req.body;

            // Validações de campos obrigatórios
            if (!nome || !nome.trim()) return res.status(400).json({ sucesso: false, erro: "Nome obrigatório", mensagem: "O nome é obrigatório" });
            if (!cores || !cores.trim()) return res.status(400).json({ sucesso: false, erro: "Cor obrigatória", mensagem: "A cor é obrigatória" });
            if (!tamanhos || !tamanhos.trim()) return res.status(400).json({ sucesso: false, erro: "Tamanho obrigatório", mensagem: "O tamanho é obrigatório" });
            if (!descricao || !descricao.trim()) return res.status(400).json({ sucesso: false, erro: "Descrição obrigatória", mensagem: "A descrição é obrigatória" });
            if (preco === undefined) return res.status(400).json({ sucesso: false, erro: "Preço obrigatório", mensagem: "O preço é obrigatório" });
            if (!categoria || !categoria.trim()) return res.status(400).json({ sucesso: false, erro: "Categoria obrigatória", mensagem: "A categoria é obrigatória" });
            if (!subcategoria || !subcategoria.trim()) return res.status(400).json({ sucesso: false, erro: "Subcategoria obrigatória", mensagem: "A subcategoria é obrigatória" });
            if (estoque === undefined) return res.status(400).json({ sucesso: false, erro: "Estoque obrigatório", mensagem: "O valor de estoque é obrigatório" });
            
            // Validação da Imagem (Prevenção de quebra caso req.file seja undefined)
            if (!req.file || !req.file.filename) {
                return res.status(400).json({ sucesso: false, erro: "Imagem obrigatória", mensagem: "A imagem do produto é obrigatória" });
            }
            const imagem = req.file.filename;

            // Validações de formato e regras de negócio
            if (nome.length < 2 || nome.length > 255) {
                return res.status(400).json({ sucesso: false, erro: 'Tamanho do Nome', mensagem: 'O nome deve ter entre 2 e 255 caracteres' });
            }
            if (descricao.length < 50 || descricao.length > 400) {
                return res.status(400).json({ sucesso: false, erro: 'Tamanho da Descrição', mensagem: 'A descrição deve ter entre 50 e 400 caracteres' });
            }
            if (isNaN(preco) || parseFloat(preco) <= 0) {
                return res.status(400).json({ sucesso: false, erro: 'Preço inválido', mensagem: 'O preço deve ser um valor positivo' });
            }
            if (isNaN(estoque) || parseInt(estoque) < 0) {
                return res.status(400).json({ sucesso: false, erro: 'Estoque inválido', mensagem: 'O estoque deve ser zero ou um valor positivo' });
            }

            // Validações de Domínio (usando lower case para facilitar o match)
            if (!DOMINIOS.cores.includes(cores.trim().toLowerCase())) return res.status(400).json({ sucesso: false, erro: 'Cor inválida', mensagem: 'Opção de cor indisponível' });
            if (!DOMINIOS.tamanhos.includes(tamanhos.trim().toLowerCase())) return res.status(400).json({ sucesso: false, erro: 'Tamanho inválido', mensagem: 'Opção de tamanho indisponível' });
            if (!DOMINIOS.categorias.includes(categoria.trim().toLowerCase())) return res.status(400).json({ sucesso: false, erro: 'Categoria inválida', mensagem: 'Categoria indisponível' });
            if (!DOMINIOS.subcategorias.includes(subcategoria.trim().toLowerCase())) return res.status(400).json({ sucesso: false, erro: 'Subcategoria inválida', mensagem: 'Subcategoria indisponível' });

            const dadosProduto = {
                nome: nome.trim(),
                cor: cores.trim().toLowerCase(),
                tamanho: tamanhos.trim().toLowerCase(),
                descricao: descricao.trim(),
                preco: parseFloat(preco),
                categoria: categoria.trim().toLowerCase(),
                subcategoria: subcategoria.trim().toLowerCase(),
                estoque: parseInt(estoque),
                imagem: imagem 
            };

            const produtoId = await ProdutoModel.criar(dadosProduto);

            res.status(201).json({
                sucesso: true,
                mensagem: 'Produto criado com sucesso',
                dados: { id: produtoId, ...dadosProduto }
            });
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível criar o produto' });
        }
    }

    // PUT /produtos/:id - Atualizar produto
    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome, cores, tamanhos, descricao, preco, categoria, subcategoria, estoque } = req.body;

            if (!id || isNaN(id)) return res.status(400).json({ sucesso: false, erro: 'ID inválido', mensagem: 'O ID deve ser numérico' });

            const produtoExistente = await ProdutoModel.buscarPorId(id);
            if (!produtoExistente) return res.status(404).json({ sucesso: false, erro: 'Não encontrado', mensagem: `Produto ID ${id} não encontrado` });

            const dadosAtualizacao = {};

            if (nome !== undefined) {
                if (nome.trim() === '' || nome.length < 2 || nome.length > 255) {
                    return res.status(400).json({ sucesso: false, erro: 'Nome inválido', mensagem: 'O nome deve ter entre 2 e 255 caracteres' });
                }
                dadosAtualizacao.nome = nome.trim();
            }

            if (descricao !== undefined) {
                if (descricao.length < 50 || descricao.length > 400) {
                    return res.status(400).json({ sucesso: false, erro: 'Descrição inválida', mensagem: 'A descrição deve ter entre 50 e 400 caracteres' });
                }
                dadosAtualizacao.descricao = descricao.trim();
            }

            if (cores !== undefined) {
                if (!DOMINIOS.cores.includes(cores.trim().toLowerCase())) return res.status(400).json({ sucesso: false, erro: 'Cor inválida' });
                dadosAtualizacao.cor = cores.trim().toLowerCase(); // Corrigido mapeamento (era dadosAtualizacao.cores)
            }

            if (tamanhos !== undefined) {
                if (!DOMINIOS.tamanhos.includes(tamanhos.trim().toLowerCase())) return res.status(400).json({ sucesso: false, erro: 'Tamanho inválido' });
                dadosAtualizacao.tamanho = tamanhos.trim().toLowerCase(); // Corrigido bug crítico (sobrescrevia cor)
            }

            if (preco !== undefined) {
                if (isNaN(preco) || parseFloat(preco) <= 0) return res.status(400).json({ sucesso: false, erro: 'Preço inválido' });
                dadosAtualizacao.preco = parseFloat(preco);
            }

            if (estoque !== undefined) {
                if (isNaN(estoque) || parseInt(estoque) < 0) return res.status(400).json({ sucesso: false, erro: 'Estoque inválido' });
                dadosAtualizacao.estoque = parseInt(estoque);
            }

            if (categoria !== undefined) {
                if (!DOMINIOS.categorias.includes(categoria.trim().toLowerCase())) return res.status(400).json({ sucesso: false, erro: 'Categoria inválida' });
                dadosAtualizacao.categoria = categoria.trim().toLowerCase();
            }

            if (subcategoria !== undefined) {
                if (!DOMINIOS.subcategorias.includes(subcategoria.trim().toLowerCase())) return res.status(400).json({ sucesso: false, erro: 'Subcategoria inválida' });
                dadosAtualizacao.subcategoria = subcategoria.trim().toLowerCase(); // Corrigido bug crítico (sobrescrevia categoria)
            }

            if (req.file) {
                if (produtoExistente.imagem) {
                    await removerArquivoAntigo(produtoExistente.imagem, 'imagem');
                }
                dadosAtualizacao.imagem = req.file.filename;
            }

            // Se não houver nada para atualizar, retorne logo
            if (Object.keys(dadosAtualizacao).length === 0) {
                return res.status(400).json({ sucesso: false, erro: 'Sem alterações', mensagem: 'Nenhum dado válido fornecido para atualização' });
            }

            const resultado = await ProdutoModel.atualizar(id, dadosAtualizacao);

            res.status(200).json({
                sucesso: true,
                mensagem: 'Produto atualizado com sucesso',
                dados: { linhasAfetadas: resultado.affectedRows || 1 }
            });
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível atualizar o produto' });
        }
    }

    // DELETE /produtos/:id - Excluir produto
    static async excluir(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) return res.status(400).json({ sucesso: false, erro: 'ID inválido', mensagem: 'O ID deve ser numérico' });

            const produtoExistente = await ProdutoModel.buscarPorId(id);
            if (!produtoExistente) return res.status(404).json({ sucesso: false, erro: 'Não encontrado', mensagem: `Produto ID ${id} não encontrado` });

            if (produtoExistente.imagem) {
                await removerArquivoAntigo(produtoExistente.imagem, 'imagem');
            }

            const resultado = await ProdutoModel.excluir(id);

            res.status(200).json({
                sucesso: true,
                mensagem: 'Produto excluído com sucesso',
                dados: { linhasAfetadas: resultado || 1 }
            });
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível excluir o produto' });
        }
    }

    // POST /produtos/upload - Upload isolado de imagem
    static async uploadImagem(req, res) {
        try {
            const { produto_id } = req.body;

            if (!produto_id || isNaN(produto_id)) {
                // Remove o arquivo recém-feito upload se a requisição falhar na validação do ID
                if (req.file) await removerArquivoAntigo(req.file.filename, 'imagem');
                return res.status(400).json({ sucesso: false, erro: 'ID inválido', mensagem: 'O ID do produto é obrigatório e numérico' });
            }

            if (!req.file) {
                return res.status(400).json({ sucesso: false, erro: 'Imagem ausente', mensagem: 'É necessário enviar uma imagem' });
            }

            const produtoExistente = await ProdutoModel.buscarPorId(produto_id);
            if (!produtoExistente) {
                await removerArquivoAntigo(req.file.filename, 'imagem');
                return res.status(404).json({ sucesso: false, erro: 'Não encontrado', mensagem: `Produto ID ${produto_id} não encontrado` });
            }

            if (produtoExistente.imagem) {
                await removerArquivoAntigo(produtoExistente.imagem, 'imagem');
            }

            await ProdutoModel.atualizar(produto_id, { imagem: req.file.filename });

            res.status(200).json({
                sucesso: true,
                mensagem: 'Imagem enviada com sucesso',
                dados: { nomeArquivo: req.file.filename, caminho: `/uploads/imagens/${req.file.filename}` }
            });
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            if (req.file) await removerArquivoAntigo(req.file.filename, 'imagem'); // Limpa o arquivo órfão em caso de quebra no banco
            res.status(500).json({ sucesso: false, erro: 'Erro interno', mensagem: 'Não foi possível fazer upload' });
        }
    }
}

export default ProdutoController;