import fs from 'node:fs/promises';
import path from 'node:path';
import jwt from 'jsonwebtoken';

import { closePool, getConnection } from '../config/database.js';
import { JWT_CONFIG } from '../config/jwt.js';

const API_URL = process.env.TEST_API_URL || 'http://localhost:3001/api';
const connection = await getConnection();
let orderId = null;
let productId = null;
let productImage = null;

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

try {
    const [[admin]] = await connection.query(
        'SELECT idUsuario, email, tipo FROM usuarios WHERE tipo = ? ORDER BY idUsuario LIMIT 1',
        ['admin']
    );
    const [[sampleProduct]] = await connection.query(
        `SELECT idProduto, idCategoria, idSubcategoria, idCor, idTamanho, idModelo
         FROM produtos WHERE ativo = 1 ORDER BY idProduto LIMIT 1`
    );

    assert(admin && sampleProduct, 'A verificação precisa de um administrador e um produto ativo.');

    const token = jwt.sign(
        { id: admin.idUsuario, email: admin.email, tipo: admin.tipo },
        JWT_CONFIG.secret,
        { expiresIn: '10m' }
    );
    const authorization = { Authorization: `Bearer ${token}` };

    async function apiRequest(endpoint, options = {}) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: { ...authorization, ...(options.headers || {}) }
        });
        const data = await response.json().catch(() => null);

        if (!response.ok || data?.sucesso === false) {
            throw new Error(
                `${options.method || 'GET'} ${endpoint}: ${response.status} ${data?.mensagem || data?.erro || 'sem resposta'}`
            );
        }
        return { response, data };
    }

    const users = await apiRequest(
        `/usuarios?pagina=1&limite=10&busca=${encodeURIComponent(admin.email)}`
    );
    assert(
        users.data.dados.some((user) => user.idUsuario === admin.idUsuario) &&
        users.data.dados.every((user) => !('senha' in user)),
        'READ de usuários inválido.'
    );

    const sameUser = await apiRequest(`/usuarios/${admin.idUsuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: admin.email })
    });
    assert(sameUser.data.dados.idUsuario === admin.idUsuario, 'UPDATE de usuário falhou.');

    const createdOrder = await apiRequest('/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            idUsuario: admin.idUsuario,
            idProduto: sampleProduct.idProduto,
            status: 'carrinho'
        })
    });
    orderId = createdOrder.data.dados.idVendas;

    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    await apiRequest(`/vendas/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'processando', dataPedido: today, dataEntrega: tomorrow })
    });
    const sentOrder = await apiRequest(`/vendas/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'enviado', dataEntrega: tomorrow })
    });
    assert(
        sentOrder.data.dados.status === 'enviado' && sentOrder.data.dados.dataEnvio,
        'Status ou data de envio não foram aplicados.'
    );

    const beforeRead = await apiRequest(`/vendas/${orderId}`);
    const searchedOrders = await apiRequest(`/vendas?pagina=1&limite=10&busca=ORD-${orderId}`);
    const afterRead = await apiRequest(`/vendas/${orderId}`);
    assert(
        searchedOrders.data.dados.some((order) => (
            order.idVendas === orderId && order.nomeUsuario && order.nomeProduto
        )),
        'READ, busca ou relacionamento do pedido falhou.'
    );
    assert(
        JSON.stringify(beforeRead.data.dados) === JSON.stringify(afterRead.data.dados),
        'Uma requisição GET alterou o pedido.'
    );
    await apiRequest(`/vendas/${orderId}`, { method: 'DELETE' });
    orderId = null;

    const formData = new FormData();
    const productFields = {
        sku: `CODEX-ADMIN-${Date.now()}`,
        nome: 'Produto de verificação',
        nomeCombinacao: 'Produto de verificação U',
        descricao: 'Registro temporário do teste CRUD.',
        genero: 'Unissex',
        preco: '10.00',
        estoque: '1',
        idCategoria: String(sampleProduct.idCategoria),
        idSubcategoria: String(sampleProduct.idSubcategoria),
        idCor: String(sampleProduct.idCor),
        idTamanho: String(sampleProduct.idTamanho),
        idModelo: String(sampleProduct.idModelo)
    };
    Object.entries(productFields).forEach(([field, value]) => formData.append(field, value));
    formData.append(
        'imagem1',
        new Blob([
            Buffer.from(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
                'base64'
            )
        ], { type: 'image/png' }),
        'verificacao.png'
    );

    const createdProduct = await apiRequest('/produtos', { method: 'POST', body: formData });
    productId = createdProduct.data.dados.idProduto;
    productImage = createdProduct.data.dados.imagem1;
    assert(productImage?.startsWith('uploads/imagens/'), 'Caminho do upload inválido.');
    assert((await fetch(`${API_URL.replace(/\/api\/?$/, '')}/${productImage}`)).ok, 'Imagem indisponível.');

    const editForm = new FormData();
    editForm.append('nome', 'Produto de verificação editado');
    await apiRequest(`/produtos/${productId}`, { method: 'PUT', body: editForm });
    const updatedProduct = await apiRequest(`/produtos/${productId}`);
    assert(updatedProduct.data.dados.nome === 'Produto de verificação editado', 'UPDATE do produto falhou.');

    await apiRequest(`/produtos/${productId}`, { method: 'DELETE' });
    const deletedProduct = await fetch(`${API_URL}/produtos/${productId}`);
    assert(deletedProduct.status === 404, 'DELETE lógico do produto falhou.');

    await Promise.all([
        apiRequest('/vendas?pagina=1&limite=100'),
        apiRequest('/produtos?pagina=1&limite=100'),
        apiRequest('/usuarios?pagina=1&limite=100')
    ]);

    console.log('Admin verificado: pedidos, produtos, usuários e dashboard.');
} finally {
    if (orderId) {
        await connection.execute('DELETE FROM vendas WHERE idVendas = ?', [orderId]).catch(() => {});
    }
    if (productId) {
        await connection.execute('DELETE FROM produtos WHERE idProduto = ?', [productId]).catch(() => {});
    }
    connection.release();

    if (productImage) {
        const imagePath = path.join(process.cwd(), 'uploads', 'imagens', path.basename(productImage));
        await fs.unlink(imagePath).catch(() => {});
    }
    await closePool();
}
