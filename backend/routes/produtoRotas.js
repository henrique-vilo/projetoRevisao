import express from 'express';
import ProdutoController from '../controllers/produtoController.js';
import { authMiddleware, adminMiddleware, selfMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotas públicas
router.get('/', authMiddleware, ProdutoController.listarTodos);
router.get('/:id', authMiddleware, ProdutoController.buscarPorId);
router.get('/:nome', authMiddleware, ProdutoController.buscarPorNome);
router.get('/:categoria', authMiddleware, ProdutoController.buscarPorCategoria);
router.get('/:categoria/:nome', authMiddleware, ProdutoController.buscarPorCategoria);
router.get('/:categoria/:subcategoria', authMiddleware, ProdutoController.buscaPorSubcategoria);
router.get('/:categoria/:subcategoria/:nome', authMiddleware, ProdutoController.buscaPorSubcategoria);

router.get('/:', authMiddleware, ProdutoController.buscarPorId);


// Rotas protegidas por admin
router.post('/', authMiddleware, adminMiddleware, ProdutoController.criar);
router.put('/:id', authMiddleware, adminMiddleware, ProdutoController.atualizar);
router.delete('/:id', authMiddleware, adminMiddleware, ProdutoController.excluir);

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