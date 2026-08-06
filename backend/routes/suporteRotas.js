import express from 'express';
import SuporteController from '../controllers/SuporteController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, SuporteController.listarTodos);
router.get('/meus', authMiddleware, SuporteController.listarMeus);
router.post('/', authMiddleware, SuporteController.criar);
router.put('/:idSuporte/responder', authMiddleware, adminMiddleware, SuporteController.responder);
router.put('/:idSuporte/status', authMiddleware, adminMiddleware, SuporteController.atualizarStatus);

export default router;
