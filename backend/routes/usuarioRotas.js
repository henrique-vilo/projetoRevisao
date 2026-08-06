import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { authMiddleware, adminMiddleware, selfMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotas de validação própria
router.get('/perfil', authMiddleware, AuthController.obterPerfil);
router.put('/perfil/:id', authMiddleware, selfMiddleware, AuthController.atualizarUsuario);
router.delete('/perfil/:id', authMiddleware, selfMiddleware, AuthController.excluirUsuario);

// Rotas protegidas por admin
router.get('/', authMiddleware, adminMiddleware, AuthController.listarUsuarios);
router.post('/', authMiddleware, adminMiddleware, AuthController.criarUsuario);
router.put('/:id', authMiddleware, adminMiddleware, AuthController.atualizarUsuario);
router.delete('/:id', authMiddleware, adminMiddleware, AuthController.excluirUsuario);

// ==========================================
// Rotas OPTIONS para CORS (preflight requests)
// ==========================================

// Rota: /login
router.options('/login', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});

// Rota: /registrar
router.options('/registrar', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});

// Rota: /perfil (Baseada no GET /perfil)
router.options('/perfil', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

// Rota: /perfil/:id (Baseada no PUT e DELETE /perfil/:id)
router.options('/perfil/:id', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

// Rota: / raiz (Baseada no GET e POST /)
router.options('/', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

// Rota: /:id (Baseada no PUT e DELETE /:id)
router.options('/:id', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

export default router;