import express from 'express';
import SuporteController from '../controllers/SuporteController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotas exclusivas de Administradores
router.get('/', authMiddleware, adminMiddleware, SuporteController.listarTodos);
router.put('/:idSuporte/responder', authMiddleware, adminMiddleware, SuporteController.responder);

// Rotas de Usuários/Clientes
router.get('/meus', authMiddleware, SuporteController.listarMeus);
router.post('/', authMiddleware, SuporteController.criar);

export default router;