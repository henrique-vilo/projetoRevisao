import express from 'express';
import VendaController from '../controllers/vendasController.js';
import { authMiddleware, adminMiddleware, selfMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

//rotas de negócios
router.post('/carrinho', authMiddleware, VendaController.adicionarCarrinho);
router.post('/:id/confirmar', authMiddleware, VendaController.confirmarCompra);

//rotas de informação
router.get('/', authMiddleware, VendaController.listarTodos);
router.get('/:id', authMiddleware, VendaController.buscarPorId);
router.get('/usuario/:idUsuario', authMiddleware, VendaController.buscarPorUsuario);

//rotas admin
router.put('/:id', authMiddleware, adminMiddleware, VendaController.atualizar);
router.delete('/:id', authMiddleware, adminMiddleware, VendaController.excluir);

// ==========================================
// Rotas OPTIONS para CORS (preflight requests)
// ==========================================
router.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

export default router;