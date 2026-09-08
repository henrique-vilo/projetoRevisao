import express from 'express';
import VendaController from '../controllers/vendasController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

router.get('/carrinho', authMiddleware, VendaController.listarCarrinho);
router.get('/carrinho/:idUsuario', authMiddleware, VendaController.listarCarrinho);
router.post('/carrinho', authMiddleware, VendaController.adicionarCarrinho);
router.post('/carrinho/confirmar', authMiddleware, VendaController.confirmarCarrinho);
router.delete('/carrinho/:id', authMiddleware, VendaController.removerCarrinho);
router.get('/meus-pedidos', authMiddleware, VendaController.listarMeusPedidos);
router.get('/meus-pedidos/:id', authMiddleware, VendaController.buscarMeuPedido);
router.post('/:id/confirmar', authMiddleware, VendaController.confirmarCompra);
router.post('/', authMiddleware, adminMiddleware, VendaController.criar);
router.get('/', authMiddleware, VendaController.listarTodos);
router.get('/usuario/:idUsuario', authMiddleware, VendaController.buscarPorUsuario);
router.get('/:id', authMiddleware, VendaController.buscarPorId);
router.put('/:id', authMiddleware, adminMiddleware, VendaController.atualizar);
router.delete('/:id', authMiddleware, adminMiddleware, VendaController.excluir);

export default router;
