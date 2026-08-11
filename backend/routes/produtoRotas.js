import express from 'express';
import ProdutoController from '../controllers/produtoController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js'; 

const router = express.Router();

// Configuração para múltiplos arquivos de imagens do produto
const cpUpload = upload.fields([
    { name: 'imagem1', maxCount: 1 },
    { name: 'imagem2', maxCount: 1 },
    { name: 'imagem3', maxCount: 1 },
    { name: 'imagem4', maxCount: 1 }
]);

// ------------------------------------------
// Rotas Públicas (Naves/Filtro sem exigência de Login)
// Exemplo: GET /produtos?idCategoria=1&idCor=2&precoMin=50&busca=camisa
// ------------------------------------------
router.get('/', ProdutoController.listarOuFiltrar);
router.get('/:id', ProdutoController.buscarPorId);

// ------------------------------------------
// Rotas de Administração (Protegidas)
// ------------------------------------------
router.post('/', authMiddleware, adminMiddleware, cpUpload, ProdutoController.criar);
router.put('/:id', authMiddleware, adminMiddleware, cpUpload, ProdutoController.atualizar);
router.delete('/:id', authMiddleware, adminMiddleware, ProdutoController.excluir);

// ------------------------------------------
// CORS Preflight Handler para a Rota de Produtos
// ------------------------------------------
router.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

export default router;