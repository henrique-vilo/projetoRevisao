import express from 'express';
import ProdutoController from '../controllers/produtoController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';
import { upload, handleUploadError } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Rotas públicas
router.get('/', ProdutoController.listarOuFiltrar);
router.get('/filtros', ProdutoController.listarFiltros);
router.get(
    '/tamanhos-compativeis/:idSubcategoria',
    ProdutoController.listarTamanhosCompativeis
);
router.get('/:id/detalhes', ProdutoController.buscarDetalhes);
router.get('/:id', ProdutoController.buscarPorId);

// Rotas administrativas
const uploadImagensProduto = upload.fields([
    { name: 'imagem1', maxCount: 1 },
    { name: 'imagem2', maxCount: 1 },
    { name: 'imagem3', maxCount: 1 },
    { name: 'imagem4', maxCount: 1 }
]);

router.post('/', authMiddleware, adminMiddleware, uploadImagensProduto, handleUploadError, ProdutoController.criar);
router.put('/:id', authMiddleware, adminMiddleware, uploadImagensProduto, handleUploadError, ProdutoController.atualizar);
router.delete('/:id', authMiddleware, adminMiddleware, ProdutoController.excluir);

// CORS preflight. A expressão regular funciona no Express 4 e no Express 5.
router.options(/.*/, (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

export default router;
