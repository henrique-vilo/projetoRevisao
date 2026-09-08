import express from 'express';
import ProdutoController from '../controllers/produtoController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';
import { receberImagensProduto } from '../middlewares/produtoUploadMiddleware.js';

const router = express.Router();
router.get('/', ProdutoController.listarOuFiltrar);
router.get('/filtros', ProdutoController.listarFiltros);
router.get('/:id/detalhes', ProdutoController.buscarDetalhes);
router.get('/:id', ProdutoController.buscarPorId);
router.post('/', authMiddleware, adminMiddleware, receberImagensProduto, ProdutoController.criar);
router.put('/:id', authMiddleware, adminMiddleware, receberImagensProduto, ProdutoController.atualizar);
router.delete('/:id', authMiddleware, adminMiddleware, ProdutoController.excluir);
router.options(/.*/, (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});
export default router;
