import jwt from 'jsonwebtoken';
import UsuarioModel from '../models/UsuarioModel.js';
import { JWT_CONFIG } from '../config/jwt.js';

// Controller para operações de autenticação
class AuthController {
    
    // POST /auth/login - Fazer login
    static async login(req, res) {
        try {
            const { email, senha } = req.body;
            
            // Validações básicas
            if (!email || email.trim() === '') {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Email obrigatório',
                    mensagem: 'O email é obrigatório'
                });
            }

            if (!senha || senha.trim() === '') {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Senha obrigatória',
                    mensagem: 'A senha é obrigatória'
                });
            }

            // Verificar credenciais
            const usuario = await UsuarioModel.verificarCredenciais(email.trim(), senha);
            
            if (!usuario) {
                return res.status(401).json({
                    sucesso: false,
                    erro: 'Credenciais inválidas',
                    mensagem: 'Email ou senha incorretos'
                });
            }
            const idDoUsuario = usuario.idUsuario || usuario.id;

            // Gerar token JWT
            const token = jwt.sign(
                { 
                    id: idDoUsuario, // Agora o token terá o ID corretamente
                    email: usuario.email,
                    tipo: usuario.tipo 
                },
                JWT_CONFIG.secret,
                { expiresIn: JWT_CONFIG.expiresIn }
            );

            res.status(200).json({
                sucesso: true,
                mensagem: 'Login realizado com sucesso',
                dados: {
                    token,
                    usuario: {
                        id: idDoUsuario, // O Frontend agora recebe o ID de forma correta
                        nome: usuario.nome,
                        email: usuario.email,
                        tipo: usuario.tipo
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível processar o login'
            });
        }
    }

    // POST /auth/registrar - Registrar novo usuário
    static async registrar(req, res) {
        try {
            const { nome, cpf, email, telefone, cep, senha, tipo } = req.body;
            
            // Validações básicas
            if (!nome || nome.trim() === '') {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Nome obrigatório',
                    mensagem: 'O nome é obrigatório'
                });
            }

            if(!cpf || cpf.trim() === ''){
                return res.status(400).json({
                    sucesso: false,
                    erro: 'CPF obrigatório',
                    mensagem: 'O CPF é obrigatório'
                });
            }

            if (!email || email.trim() === '') {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Email obrigatório',
                    mensagem: 'O email é obrigatório'
                });
            }

            if (!telefone || telefone === ''){
                return res.status(400).json({
                    sucesso: false,
                    erro: 'telefone obrigatório',
                    mensagem: 'O telefone é obrigatório'
                })
            }

            if (!cep || cep === ''){
                return res.status(400).json({
                    sucesso: false,
                    erro: 'CEP obrigatório',
                    mesnagem: 'O CEP é obrigatório'
                })
            }

            if (!senha || senha === '') {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Senha obrigatória',
                    mensagem: 'A senha é obrigatória'
                });
            }

            // Validações de formato
            if (nome.length < 2) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Nome muito curto',
                    mensagem: 'O nome deve ter pelo menos 2 caracteres'
                });
            }

            if (nome.length > 255) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Nome muito longo',
                    mensagem: 'O nome deve ter no máximo 255 caracteres'
                });
            }

            if (cpf.length != 14){
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Caracteres CPF inválido',
                    mensagem: 'Número de caractéres inválido'
                })
            }

            const cpfRegex = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;

            if (!cpfRegex.test(cpf)) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Formato CPF inválido',
                    mensagem: 'Formato de cpf incorreto'
                })
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Email inválido',
                    mensagem: 'Formato de email inválido'
                });
            }

            if(telefone.length != 15){
                return res.status(400).json({
                    sucesso: false,
                    erro: 'caracteres telefone inválidos',
                    mensagem: 'Número de caractéres do telefone inválido'
                })
            }

            const telRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/;

            if (!telRegex.test(telefone)) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'telefone inválido',
                    mensagem: 'formato de telefone inválido'
                })
            }

            if(cep.length != 9){
                return res.status(400).json({
                    sucesso: false,
                    erro: 'caracteres cep inválidos',
                    mensagem: 'Número de caractéres do CEP inválidos'
                })
            }

            const cepRegex = /^\d{5}-\d{3}$/;

            if(!cepRegex.test(cep)){
                return res.status(400).json({
                    sucesso: false,
                    erro: 'CEP inválido',
                    mensagem: 'Formatação de CEP incorreta'
                })
            }

            if (senha.length < 6) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Senha muito curta',
                    mensagem: 'A senha deve ter pelo menos 6 caracteres'
                });
            }

            // Verificar se dados únicos já existem
            const usuarioEmailExistente = await UsuarioModel.buscarPorEmail(email);
            if (usuarioEmailExistente) {
                return res.status(409).json({
                    sucesso: false,
                    erro: 'Email já cadastrado',
                    mensagem: 'Este email já está sendo usado por outro usuário'
                });
            }

            const usuarioCpfExistente = await UsuarioModel.buscarPorCpf(cpf);
            if (usuarioCpfExistente) {
                return res.status(409).json({
                    sucesso: false,
                    erro: 'CPF já cadastrado',
                    mensagem: 'Este cpf já está sendo usado por outro usuário'
                });
            }

            const usuarioTelefoneExistente = await UsuarioModel.buscarPorTelefone(telefone);
            if (usuarioTelefoneExistente) {
                return res.status(409).json({
                    sucesso: false,
                    erro: 'Telefone já cadastrado',
                    mensagem: 'Este telefone já está sendo usado por outro usuário'
                });
            }

            // Preparar dados do usuário
            const dadosUsuario = {
                nome: nome.trim(),
                cpf: cpf.trim(),
                email: email.trim().toLowerCase(),
                telefone: telefone.trim(),
                cep: cep.trim(),
                senha: senha.toString().trim(),
                tipo: 'cliente'
            };

            // Criar usuário
            const usuarioId = await UsuarioModel.criar(dadosUsuario);
            
            res.status(201).json({
                sucesso: true,
                mensagem: 'Usuário criado com sucesso',
                dados: {
                    id: usuarioId,
                    nome: dadosUsuario.nome,
                    cpf: dadosUsuario.cpf,
                    email: dadosUsuario.email,
                    telefone: dadosUsuario.telefone,
                    cep: dadosUsuario.cep,
                    tipo: dadosUsuario.tipo
                }
            });
        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível registrar o usuário'
            });
        }
    }

    // GET /auth/perfil - Obter perfil do usuário logado
    static async obterPerfil(req, res) {
        try {
            const usuario = await UsuarioModel.buscarPorId(req.usuario.id); 
            
            if (!usuario) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Usuário não encontrado',
                    mensagem: 'Usuário não foi encontrado'
                });
            }

            // Remover senha dos dados retornados
            const { senha, ...usuarioSemSenha } = usuario;

            res.status(200).json({
                sucesso: true,
                dados: usuarioSemSenha
            });
        } catch (error) {
            console.error('Erro ao obter perfil:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível obter o perfil'
            });
        }
    }

    // GET /usuarios - Listar todos os usuários (apenas admin, com paginação)
    static async listarUsuarios(req, res) {
        try {
            // Obter parâmetros de paginação da query string
            const pagina = parseInt(req.query.pagina) || 1;
            const limite = parseInt(req.query.limite) || 10;
            
            // Validações
            if (pagina < 1) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Página inválida',
                    mensagem: 'A página deve ser um número maior que zero'
                });
            }
            
            const limiteMaximo = parseInt(process.env.PAGINACAO_LIMITE_MAXIMO) || 100;
            if (limite < 1 || limite > limiteMaximo) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Limite inválido',
                    mensagem: `O limite deve ser um número entre 1 e ${limiteMaximo}`
                });
            }
            
            const resultado = await UsuarioModel.listarTodos(pagina, limite);
            
            // Remover senha de todos os usuários
            const usuariosSemSenha = resultado.usuarios.map(({ senha, ...usuario }) => usuario);

            res.status(200).json({
                sucesso: true,
                dados: usuariosSemSenha,
                paginacao: {
                    pagina: resultado.pagina,
                    limite: resultado.limite,
                    total: resultado.total,
                    totalPaginas: resultado.totalPaginas
                }
            });
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível listar os usuários'
            });
        }
    }

    static async buscarUsuario(req, res) {
        try {
            const { id } = req.params;
            
            const resultado = await UsuarioModel.buscarPorId(id);
            
            if (!resultado) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Usuário não encontrado'
                });
            }
            
            const { senha, ...usuarioSemSenha } = resultado;

            res.status(200).json({
                sucesso: true,
                dados: usuarioSemSenha,
            });
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível buscar o usuário'
            });
        }
    }

    // POST /usuarios - Criar novo usuário (apenas admin)
    static async criarUsuario(req, res) {
        try {
            const { nome, cpf, email, telefone, cep, senha, tipo } = req.body;
            
            // Validações básicas
            if (!nome || nome.trim() === '') {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Nome obrigatório',
                    mensagem: 'O nome é obrigatório'
                });
            }

            if(!cpf || cpf.trim() === ''){
                return res.status(400).json({
                    sucesso: false,
                    erro: 'CPF obrigatório',
                    mensagem: 'O CPF é obrigatório'
                });
            }

            if (!email || email.trim() === '') {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Email obrigatório',
                    mensagem: 'O email é obrigatório'
                });
            }

            if (!telefone || telefone === ''){
                return res.status(400).json({
                    sucesso: false,
                    erro: 'telefone obrigatório',
                    mensagem: 'O telefone é obrigatório'
                })
            }

            if (!cep || cep === ''){
                return res.status(400).json({
                    sucesso: false,
                    erro: 'CEP obrigatório',
                    mesnagem: 'O CEP é obrigatório'
                })
            }

            if (!senha || senha === '') {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Senha obrigatória',
                    mensagem: 'A senha é obrigatória'
                });
            }

            // Validações de formato
            if (nome.length < 2) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Nome muito curto',
                    mensagem: 'O nome deve ter pelo menos 2 caracteres'
                });
            }

            if (nome.length > 255) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Nome muito longo',
                    mensagem: 'O nome deve ter no máximo 255 caracteres'
                });
            }

            if (cpf.length != 14){
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Caracteres CPF inválido',
                    mensagem: 'Número de caractéres inválido'
                })
            }

            const cpfRegex = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;

            if (!cpfRegex.test(cpf)) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Formato CPF inválido',
                    mensagem: 'Formato de cpf incorreto'
                })
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Email inválido',
                    mensagem: 'Formato de email inválido'
                });
            }

            if(telefone.length != 15){
                return res.status(400).json({
                    sucesso: false,
                    erro: 'caracteres telefone inválidos',
                    mensagem: 'Número de caractéres do telefone inválido'
                })
            }

            const telRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/;

            if (!telRegex.test(telefone)) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'telefone inválido',
                    mensagem: 'formato de telefone inválido'
                })
            }

            if(cep.length != 9){
                return res.status(400).json({
                    sucesso: false,
                    erro: 'caracteres cep inválidos',
                    mensagem: 'Número de caractéres do CEP inválidos'
                })
            }

            const cepRegex = /^\d{5}-\d{3}$/;

            if(!cepRegex.test(cep)){
                return res.status(400).json({
                    sucesso: false,
                    erro: 'CEP inválido',
                    mensagem: 'Formatação de CEP incorreta'
                })
            }

            if (senha.length < 6) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Senha muito curta',
                    mensagem: 'A senha deve ter pelo menos 6 caracteres'
                });
            }

            // Verificar se dados únicos já existem
            const usuarioEmailExistente = await UsuarioModel.buscarPorEmail(email);
            if (usuarioEmailExistente) {
                return res.status(409).json({
                    sucesso: false,
                    erro: 'Email já cadastrado',
                    mensagem: 'Este email já está sendo usado por outro usuário'
                });
            }

            const usuarioCpfExistente = await UsuarioModel.buscarPorCpf(cpf);
            if (usuarioCpfExistente) {
                return res.status(409).json({
                    sucesso: false,
                    erro: 'CPF já cadastrado',
                    mensagem: 'Este cpf já está sendo usado por outro usuário'
                });
            }

            const usuarioTelefoneExistente = await UsuarioModel.buscarPorTelefone(telefone);
            if (usuarioTelefoneExistente) {
                return res.status(409).json({
                    sucesso: false,
                    erro: 'Telefone já cadastrado',
                    mensagem: 'Este telefone já está sendo usado por outro usuário'
                });
            }

            // Preparar dados do usuário
            const dadosUsuario = {
                nome: nome.trim(),
                cpf: cpf.trim(),
                email: email.trim().toLowerCase(),
                telefone: telefone.trim(),
                cep: cep.trim(),
                senha: senha,
                tipo: tipo || 'cliente'
            };

            // Criar usuário
            const usuarioId = await UsuarioModel.criar(dadosUsuario);
            
            res.status(201).json({
                sucesso: true,
                mensagem: 'Usuário criado com sucesso',
                dados: {
                    id: usuarioId,
                    nome: dadosUsuario.nome,
                    cpf: dadosUsuario.cpf,
                    email: dadosUsuario.email,
                    telefone: dadosUsuario.telefone,
                    cep: dadosUsuario.cep,
                    tipo: dadosUsuario.tipo
                }
            });
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível criar o usuário'
            });
        }
    }

    // PUT /usuarios/:id - Atualizar usuário (apenas admin)
    static async atualizarUsuario(req, res) {
        try {
            // CORREÇÃO: Alterado de { idUsuario } para { id } para bater com o req.params e as validações
            const { id } = req.params; 
            const { nome, cpf, email, telefone, cep, senha, tipo } = req.body;
            
            // Validação do ID
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'ID inválido',
                    mensagem: 'O ID deve ser um número válido'
                });
            }

            // Verificar se o usuário existe
            const usuarioExistente = await UsuarioModel.buscarPorId(id);
            if (!usuarioExistente) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Usuário não encontrado',
                    mensagem: `Usuário com ID ${id} não foi encontrado`
                });
            }

            // Preparar dados para atualização
            const dadosAtualizacao = {};
            
            if (nome !== undefined) {
                if (nome.trim() === '') {
                    return res.status(400).json({
                        sucesso: false,
                        erro: 'Nome inválido',
                        mensagem: 'O nome não pode estar vazio'
                    });
                }
                if (nome.length < 2) {
                    return res.status(400).json({
                        sucesso: false,
                        erro: 'Nome muito curto',
                        mensagem: 'O nome deve ter pelo menos 2 caracteres'
                    });
                }
                dadosAtualizacao.nome = nome.trim();
            }

            if(cpf != undefined){
                if (cpf.length != 14){
                    return res.status(400).json({
                        sucesso: false,
                        erro: 'Caracteres CPF inválido',
                        mensagem: 'Número de caractéres inválido'
                    })
                }

                const cpfRegex = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;

                if (!cpfRegex.test(cpf)) {
                        return res.status(400).json({
                            sucesso: false,
                            erro: 'Formato CPF inválido',
                            mensagem: 'Formato de cpf incorreto'
                        })
                }

                const usuarioCpfExistente = await UsuarioModel.buscarPorCpf(cpf);
                if (usuarioCpfExistente) {
                    return res.status(409).json({
                        sucesso: false,
                        erro: 'CPF já cadastrado',
                        mensagem: 'Este cpf já está sendo usado por outro usuário'
                    });
                }
                dadosAtualizacao.cpf = cpf.trim();
            }

            if (email !== undefined) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return res.status(400).json({
                        sucesso: false,
                        erro: 'Email inválido',
                        mensagem: 'Formato de email inválido'
                    });
                }
                
                // Verificar se o email já está em uso por outro usuário
                const usuarioComEmail = await UsuarioModel.buscarPorEmail(email);
                if (usuarioComEmail && usuarioComEmail.id !== parseInt(id)) {
                    return res.status(409).json({
                        sucesso: false,
                        erro: 'Email já cadastrado',
                        mensagem: 'Este email já está sendo usado por outro usuário'
                    });
                }
                
                dadosAtualizacao.email = email.trim().toLowerCase();
            }

            if(telefone !== undefined){
                if(telefone.length != 15){
                    return res.status(400).json({
                        sucesso: false,
                        erro: 'caracteres telefone inválidos',
                        mensagem: 'Número de caractéres do telefone inválido'
                    })
                }

                const telRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/;

                if (!telRegex.test(telefone)) {
                    return res.status(400).json({
                        sucesso: false,
                        erro: 'telefone inválido',
                        mensagem: 'formato de telefone inválido'
                    })
                }

                dadosAtualizacao.telefone = telefone.trim();
            }

            if(cep !== undefined){
                
                if(cep.length != 9){
                    return res.status(400).json({
                        sucesso: false,
                        erro: 'caracteres cep inválidos',
                        mensagem: 'Número de caractéres do CEP inválidos'
                    })
                }

                const cepRegex = /^\d{5}-\d{3}$/;

                if(!cepRegex.test(cep)){
                    return res.status(400).json({
                        sucesso: false,
                        erro: 'CEP inválido',
                        mensagem: 'Formatação de CEP incorreta'
                    })
                }

                dadosAtualizacao.cep = cep.trim();
            }

            if (senha !== undefined) {
                if (senha.length < 6) {
                    return res.status(400).json({
                        sucesso: false,
                        erro: 'Senha muito curta',
                        mensagem: 'A senha deve ter pelo menos 6 caracteres'
                    });
                }
                dadosAtualizacao.senha = senha;
            }

            if (tipo !== undefined) {
                const tiposPermitidos = ['cliente', 'admin'];
                const tipoFormatado = tipo.toLowerCase();
                
                if (!tiposPermitidos.includes(tipoFormatado)) {
                    return res.status(400).json({
                        sucesso: false,
                        erro: 'Tipo inválido',
                        mensagem: `O tipo deve ser: ${tiposPermitidos.join(', ')}`
                    });
                }
                dadosAtualizacao.tipo = tipoFormatado;
            }

            // Verificar se há dados para atualizar
            if (Object.keys(dadosAtualizacao).length === 0) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Nenhum dado para atualizar',
                    mensagem: 'Forneça pelo menos um campo para atualizar'
                });
            }

            // Atualizar usuário
            const resultado = await UsuarioModel.atualizar(id, dadosAtualizacao);
            
            res.status(200).json({
                sucesso: true,
                mensagem: 'Usuário atualizado com sucesso',
                dados: {
                    linhasAfetadas: resultado || 1
                }
            });
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível atualizar o usuário'
            });
        }
    }

    // DELETE /usuarios/:id - Excluir usuário (apenas admin)
    static async excluirUsuario(req, res) {
        try {
            const { id } = req.params;
            
            // Validação do ID
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'ID inválido',
                    mensagem: 'O ID deve ser um número válido'
                });
            }

            const usuarioExistente = await UsuarioModel.buscarPorId(id); 
            if (!usuarioExistente) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Usuário não encontrado',
                    mensagem: `Usuário com ID ${id} não foi encontrado`
                });
            }

            // Excluir usuário
            const resultado = await UsuarioModel.excluir(id);
            
            res.status(200).json({
                sucesso: true,
                mensagem: 'Usuário excluído com sucesso',
                dados: {
                    linhasAfetadas: resultado || 1
                }
            });
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno do servidor',
                mensagem: 'Não foi possível excluir o usuário'
            });
        }
    }
}

export default AuthController;