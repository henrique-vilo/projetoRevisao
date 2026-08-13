import express from 'express';
import SubController from '../controllers/SubController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotas públicas / autenticadas
router.get('/', authMiddleware, SubController.listarTodos);
router.get('/:id', authMiddleware, SubController.buscarPorId);

// Rotas protegidas por admin
router.post('/', authMiddleware, adminMiddleware, SubController.criar);
router.put('/:id', authMiddleware, adminMiddleware, SubController.atualizar);
router.delete('/:id', authMiddleware, adminMiddleware, SubController.excluir);

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