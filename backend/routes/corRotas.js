import express from 'express';
import CorController from '../controllers/CorController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotas públicas / autenticadas
router.get('/', authMiddleware, CorController.listarTodos);
router.get('/:id', authMiddleware, CorController.buscarPorId);

// Rotas protegidas por admin
router.post('/', authMiddleware, adminMiddleware, CorController.criar);
router.put('/:id', authMiddleware, adminMiddleware, CorController.atualizar);
router.delete('/:id', authMiddleware, adminMiddleware, CorController.excluir);

// ==========================================
// Rotas OPTIONS para CORS (preflight requests)
// ==========================================

// Rota: / raiz (Baseada no GET e POST /)
router.options('/', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

// Rota: /:id (Baseada no GET, PUT e DELETE /:id)
router.options('/:id', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

export default router;