import express from 'express';
import VendaController from '../controllers/vendasController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

//rotas de negócios
router.get('/carrinho', authMiddleware, VendaController.listarCarrinho);
router.post('/carrinho', authMiddleware, VendaController.adicionarCarrinho);
router.post('/carrinho/confirmar', authMiddleware, VendaController.confirmarCarrinho);
router.delete('/carrinho/:id', authMiddleware, VendaController.removerCarrinho);
router.get('/minhas-entregas', authMiddleware, VendaController.listarMinhasEntregas);
router.post('/:id/confirmar', authMiddleware, VendaController.confirmarCompra);

//rotas de informação
router.get('/', authMiddleware, adminMiddleware, VendaController.listarTodos);
router.get('/usuario/:idUsuario', authMiddleware, VendaController.buscarPorUsuario);
router.get('/:id', authMiddleware, VendaController.buscarPorId);

//rotas admin
router.post('/', authMiddleware, adminMiddleware, VendaController.criar);
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
