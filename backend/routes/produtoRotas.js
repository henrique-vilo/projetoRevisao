import express from 'express';
import ProdutoController from '../controllers/produtoController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotas públicas
router.get('/', ProdutoController.listarOuFiltrar);
router.get('/:id/detalhes', ProdutoController.buscarDetalhes);
router.get('/:id', ProdutoController.buscarPorId);

// Rotas administrativas
router.post('/', authMiddleware, adminMiddleware, ProdutoController.criar);
router.put('/:id', authMiddleware, adminMiddleware, ProdutoController.atualizar);
router.delete('/:id', authMiddleware, adminMiddleware, ProdutoController.excluir);

// CORS preflight. A expressão regular funciona no Express 4 e no Express 5.
router.options(/.*/, (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

export default router;
