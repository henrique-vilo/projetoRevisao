'use client';

import '../tables.css';
import './produtos.css';

import { useEffect, useState, useCallback } from 'react';

/* =====================================================
   CONFIGURAÇÃO
===================================================== */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/* =====================================================
   ESTADO INICIAL DO FORMULÁRIO
   OBS: o backend (ProdutoController) espera imagem1..4
   como STRINGS (URL ou nome de arquivo) dentro de um
   corpo JSON — não existe rota/middleware de upload de
   arquivo (multer) no backend. Por isso os campos de
   imagem aqui são texto, não File.
===================================================== */
const emptyForm = {
  sku: '',
  nome: '',
  nomeCombinacao: '',
  descricao: '',
  genero: 'Unissex',
  preco: '',
  idCategoria: '',
  idSubcategoria: '',
  idCor: '',
  idTamanho: '',
  idModelo: '',
  estoque: '',
  imagem1: '',
  imagem2: '',
  imagem3: '',
  imagem4: '',
};

/* =====================================================
   HELPERS
===================================================== */
function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || localStorage.getItem('accessToken');
}

function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value) || 0);
}

function getImageUrl(filename) {
  if (!filename) return null;
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  return `${API_URL}/uploads/${filename}`;
}

function getStatusClass(ativo) {
  return Number(ativo) === 1 ? 'success' : 'danger';
}

function getStockClass(stock) {
  if (Number(stock) <= 0) return 'danger';
  if (Number(stock) <= 10) return 'warning';
  return 'success';
}

function getOptionId(item, possibleKeys = []) {
  for (const key of possibleKeys) {
    if (item?.[key] !== undefined && item?.[key] !== null) {
      return item[key];
    }
  }
  return '';
}

/* =====================================================
   PAGE
===================================================== */
export default function ProdutosPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 10;

  const [filters, setFilters] = useState({
    genero: '',
    idCategoria: '',
    idSubcategoria: '',
    idCor: '',
    idTamanho: '',
    idModelo: '',
    precoMin: '',
    precoMax: '',
    emEstoque: '',
    ordenarPor: 'recente',
  });

  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [cores, setCores] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);
  const [modelos, setModelos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  // Pré-visualização local (blob) de imagens escolhidas no computador.
  // Existe só no navegador — nunca é enviada ao backend.
  const [localPreviews, setLocalPreviews] = useState({
    imagem1: null,
    imagem2: null,
    imagem3: null,
    imagem4: null,
  });

  const getHeaders = useCallback(() => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  /* ===================================================
     CARREGAR PRODUTOS
  =================================================== */
  const carregarProdutos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      params.set('pagina', currentPage);
      params.set('limite', productsPerPage);

      if (debouncedSearch.trim()) {
        params.set('busca', debouncedSearch.trim());
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.set(key, value);
        }
      });

      const response = await fetch(`${API_URL}/produtos?${params.toString()}`, {
        method: 'GET',
        headers: { ...getHeaders() },
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(data.erro || data.mensagem || 'Não foi possível carregar os produtos.');
      }

      setProducts(data.dados || []);
      setTotalProducts(Number(data.paginacao?.total) || 0);
      setTotalPages(Math.max(1, Number(data.paginacao?.totalPaginas) || 1));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Não foi possível carregar os produtos.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, debouncedSearch, getHeaders]);

  /* ===================================================
     CARREGAR OPÇÕES
  =================================================== */
  const carregarOpcoes = useCallback(async () => {
    try {
      setLoadingOptions(true);
      const endpoints = [
        { key: 'categorias', url: '/categorias' },
        { key: 'subcategorias', url: '/subcategorias' },
        { key: 'cores', url: '/cores' },
        { key: 'tamanhos', url: '/tamanhos' },
        { key: 'modelos', url: '/modelos' },
      ];

      const responses = await Promise.all(
        endpoints.map(async (endpoint) => {
          const response = await fetch(`${API_URL}${endpoint.url}?pagina=1&limite=100`, {
            method: 'GET',
            headers: { ...getHeaders() },
            cache: 'no-store',
          });
          if (!response.ok) throw new Error(`Erro ao carregar ${endpoint.key}`);
          const data = await response.json();
          return { key: endpoint.key, data: data.dados || [] };
        })
      );

      responses.forEach(({ key, data }) => {
        if (key === 'categorias') setCategorias(data);
        if (key === 'subcategorias') setSubcategorias(data);
        if (key === 'cores') setCores(data);
        if (key === 'tamanhos') setTamanhos(data);
        if (key === 'modelos') setModelos(data);
      });
    } catch (err) {
      console.error('Erro ao carregar opções:', err);
    } finally {
      setLoadingOptions(false);
    }
  }, [getHeaders]);

  /* ===================================================
     EFFECTS
  =================================================== */
  useEffect(() => {
    carregarOpcoes();
  }, [carregarOpcoes]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filters]);

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  /* ===================================================
     HANDLERS
  =================================================== */
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));

    // Se o usuário editar a URL manualmente, a pré-visualização passa
    // a seguir o que foi digitado (não mais o arquivo local escolhido).
    if (name.startsWith('imagem') && localPreviews[name]) {
      URL.revokeObjectURL(localPreviews[name]);
      setLocalPreviews((previous) => ({ ...previous, [name]: null }));
    }
  };

  /**
   * Usuário clicou na caixa da imagem e escolheu um arquivo do computador.
   * Apenas o NOME do arquivo é enviado ao backend (texto leve, igual a
   * digitar a URL manualmente) — os bytes da imagem nunca saem do
   * navegador. A pré-visualização usa um blob local só para exibição.
   */
  const handleImageFileChange = (event, name) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (localPreviews[name]) {
      URL.revokeObjectURL(localPreviews[name]);
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalPreviews((previous) => ({ ...previous, [name]: previewUrl }));
    setForm((previous) => ({ ...previous, [name]: file.name }));

    event.target.value = '';
  };

  const revokeAllLocalPreviews = () => {
    Object.values(localPreviews).forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
  };

  /* ===================================================
     MODAIS
  =================================================== */
  const closeModal = () => {
    revokeAllLocalPreviews();
    setLocalPreviews({ imagem1: null, imagem2: null, imagem3: null, imagem4: null });
    setModal(null);
    setSelectedProduct(null);
    setForm(emptyForm);
    setSubmitting(false);
  };

  const openCreateModal = () => {
    revokeAllLocalPreviews();
    setLocalPreviews({ imagem1: null, imagem2: null, imagem3: null, imagem4: null });
    setSelectedProduct(null);
    setForm(emptyForm);
    setModal('create');
  };

  const openEditModal = (product) => {
    revokeAllLocalPreviews();
    setLocalPreviews({ imagem1: null, imagem2: null, imagem3: null, imagem4: null });
    setSelectedProduct(product);
    setForm({
      sku: product.sku || '',
      nome: product.nome || '',
      nomeCombinacao: product.nomeCombinacao || '',
      descricao: product.descricao || '',
      genero: product.genero || 'Unissex',
      preco: product.preco != null ? Number(product.preco).toFixed(2) : '',
      idCategoria: product.idCategoria ?? '',
      idSubcategoria: product.idSubcategoria ?? '',
      idCor: product.idCor ?? '',
      idTamanho: product.idTamanho ?? '',
      idModelo: product.idModelo ?? '',
      estoque: product.estoque ?? '',
      imagem1: product.imagem1 || '',
      imagem2: product.imagem2 || '',
      imagem3: product.imagem3 || '',
      imagem4: product.imagem4 || '',
    });

    setModal('edit');
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setModal('delete');
  };

  /* ===================================================
     SUBMIT
     O backend (ProdutoController.criar / .atualizar) lê
     os campos direto de req.body como JSON (sku.trim(),
     imagem1.trim(), etc). Não existe multer nas rotas,
     então o corpo precisa ser JSON — nunca multipart/
     FormData, ou req.body chegaria vazio no backend.
  =================================================== */
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    const isEdit = modal === 'edit';

    try {
      if (!isEdit && !form.imagem1.trim()) {
        throw new Error('A imagem principal (imagem1) é obrigatória.');
      }

      const payload = {
        sku: form.sku.trim(),
        nome: form.nome.trim(),
        nomeCombinacao: form.nomeCombinacao.trim(),
        descricao: form.descricao.trim(),
        genero: form.genero,
        preco: Number(form.preco),
        idCategoria: Number(form.idCategoria),
        idSubcategoria: Number(form.idSubcategoria),
        idCor: Number(form.idCor),
        idTamanho: Number(form.idTamanho),
        idModelo: Number(form.idModelo),
        estoque: Number(form.estoque),
        imagem1: form.imagem1.trim(),
        imagem2: form.imagem2.trim() || null,
        imagem3: form.imagem3.trim() || null,
        imagem4: form.imagem4.trim() || null,
      };

      const url = isEdit
        ? `${API_URL}/produtos/${selectedProduct.idProduto}`
        : `${API_URL}/produtos`;

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getHeaders(),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(data.erro || data.mensagem || 'Não foi possível salvar o produto.');
      }

      setSuccessMessage(isEdit ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.');
      closeModal();
      await carregarProdutos();

      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Não foi possível salvar o produto.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ===================================================
     DELETE
  =================================================== */
  const handleDelete = async () => {
    if (!selectedProduct || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/produtos/${selectedProduct.idProduto}`, {
        method: 'DELETE',
        headers: { ...getHeaders() },
      });

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(data.erro || data.mensagem || 'Não foi possível desativar o produto.');
      }

      closeModal();
      await carregarProdutos();

      setSuccessMessage('Produto desativado com sucesso.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Não foi possível desativar o produto.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setFilters({
      genero: '',
      idCategoria: '',
      idSubcategoria: '',
      idCor: '',
      idTamanho: '',
      idModelo: '',
      precoMin: '',
      precoMax: '',
      emEstoque: '',
      ordenarPor: 'recente',
    });
  };

  /* ===================================================
     RENDER
  =================================================== */
  return (
    <>
      <main className="users-page">
        <section className="users-heading">
          <div>
            <span className="users-eyebrow">Catálogo</span>
            <h1>Produtos</h1>
            <p>Gerencie os produtos disponíveis no catálogo.</p>
          </div>
          <div className="users-heading-actions">
            <button
              type="button"
              className="users-btn users-btn-secondary"
              onClick={carregarProdutos}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise" /> Atualizar
            </button>
            <button type="button" className="users-btn users-btn-primary" onClick={openCreateModal}>
              <i className="bi bi-plus-lg" /> Novo produto
            </button>
          </div>
        </section>

        {error && (
          <div className="products-alert error">
            <i className="bi bi-exclamation-circle" />
            <span>{error}</span>
            <button type="button" onClick={() => setError('')}>
              <i className="bi bi-x" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="products-alert success">
            <i className="bi bi-check-circle" />
            <span>{successMessage}</span>
            <button type="button" onClick={() => setSuccessMessage('')}>
              <i className="bi bi-x" />
            </button>
          </div>
        )}

        <section className="users-card">
          <div className="users-card-header">
            <div>
              <span className="users-card-label">Gerenciamento</span>
              <h2>Produtos cadastrados</h2>
            </div>
            <div className="users-card-header-right">
              <div className="users-search">
                <i className="bi bi-search" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar produto..."
                  aria-label="Buscar produto"
                />
                {search && (
                  <button
                    type="button"
                    className="users-search-clear"
                    onClick={() => setSearch('')}
                    aria-label="Limpar busca"
                  >
                    <i className="bi bi-x" />
                  </button>
                )}
              </div>
              <button
                type="button"
                className="products-filter-toggle"
                onClick={() => setShowFilters((prev) => !prev)}
              >
                <i className="bi bi-sliders" /> Filtros
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="products-filters">
              <div className="products-filter-grid">
                <div className="products-filter-field">
                  <label>Gênero</label>
                  <select name="genero" value={filters.genero} onChange={handleFilterChange}>
                    <option value="">Todos</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Unissex">Unissex</option>
                  </select>
                </div>
                <div className="products-filter-field">
                  <label>Categoria</label>
                  <select name="idCategoria" value={filters.idCategoria} onChange={handleFilterChange}>
                    <option value="">Todas</option>
                    {categorias.map((cat) => (
                      <option key={getOptionId(cat, ['idCategoria'])} value={getOptionId(cat, ['idCategoria'])}>
                        {cat.nomeCategoria}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="products-filter-field">
                  <label>Subcategoria</label>
                  <select name="idSubcategoria" value={filters.idSubcategoria} onChange={handleFilterChange}>
                    <option value="">Todas</option>
                    {subcategorias.map((sub) => (
                      <option key={getOptionId(sub, ['idSubcategoria'])} value={getOptionId(sub, ['idSubcategoria'])}>
                        {sub.nomeSubcategoria}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="products-filter-field">
                  <label>Cor</label>
                  <select name="idCor" value={filters.idCor} onChange={handleFilterChange}>
                    <option value="">Todas</option>
                    {cores.map((cor) => (
                      <option key={getOptionId(cor, ['idCor'])} value={getOptionId(cor, ['idCor'])}>
                        {cor.nomeCor}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="products-filter-field">
                  <label>Tamanho</label>
                  <select name="idTamanho" value={filters.idTamanho} onChange={handleFilterChange}>
                    <option value="">Todos</option>
                    {tamanhos.map((tam) => (
                      <option key={getOptionId(tam, ['idTamanho'])} value={getOptionId(tam, ['idTamanho'])}>
                        {tam.codigoTamanho}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="products-filter-field">
                  <label>Modelo</label>
                  <select name="idModelo" value={filters.idModelo} onChange={handleFilterChange}>
                    <option value="">Todos</option>
                    {modelos.map((mod) => (
                      <option key={getOptionId(mod, ['idModelo'])} value={getOptionId(mod, ['idModelo'])}>
                        {mod.nomeModelo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="products-filter-field">
                  <label>Preço mínimo</label>
                  <input
                    type="number"
                    name="precoMin"
                    value={filters.precoMin}
                    onChange={handleFilterChange}
                    min="0"
                    step="0.01"
                    placeholder="R$ 0,00"
                  />
                </div>
                <div className="products-filter-field">
                  <label>Preço máximo</label>
                  <input
                    type="number"
                    name="precoMax"
                    value={filters.precoMax}
                    onChange={handleFilterChange}
                    min="0"
                    step="0.01"
                    placeholder="R$ 999,99"
                  />
                </div>
                <div className="products-filter-field">
                  <label>Estoque</label>
                  <select name="emEstoque" value={filters.emEstoque} onChange={handleFilterChange}>
                    <option value="">Todos</option>
                    <option value="true">Em estoque</option>
                  </select>
                </div>
                <div className="products-filter-field">
                  <label>Ordenar por</label>
                  <select name="ordenarPor" value={filters.ordenarPor} onChange={handleFilterChange}>
                    <option value="recente">Mais recentes</option>
                    <option value="antigo">Mais antigos</option>
                    <option value="nome_asc">Nome A-Z</option>
                    <option value="preco_asc">Menor preço</option>
                    <option value="preco_desc">Maior preço</option>
                  </select>
                </div>
              </div>
              <div className="products-filter-footer">
                <button type="button" className="products-filter-reset" onClick={resetFilters}>
                  <i className="bi bi-arrow-counterclockwise" /> Limpar filtros
                </button>
              </div>
            </div>
          )}

          <div className="table-responsive users-table-wrapper">
            <table className="table users-table align-middle">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="products-loading">
                      <div className="products-loading-content">
                        <div className="spinner-border" />
                        <span>Carregando produtos...</span>
                      </div>
                    </td>
                  </tr>
                ) : products.length > 0 ? (
                  products.map((product) => {
                    const image = getImageUrl(product.imagem1);
                    return (
                      <tr key={product.idProduto}>
                        <td>
                          <div className="user-cell">
                            <div className="product-table-image">
                              {image ? <img src={image} alt={product.nome} /> : <i className="bi bi-box-seam" />}
                            </div>
                            <div className="user-information">
                              <span className="user-name">{product.nome}</span>
                              <span className="user-id">SKU: {product.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="product-category-cell">
                            <span className="user-type cliente">{product.categoriaNome || 'Sem categoria'}</span>
                            {product.subcategoriaNome && <small>{product.subcategoriaNome}</small>}
                          </div>
                        </td>
                        <td>
                          <strong className="product-price">{formatPrice(product.preco)}</strong>
                        </td>
                        <td>
                          <span className={`user-status ${getStockClass(product.estoque)}`}>
                            <span />
                            {Number(product.estoque) <= 0 ? 'Sem estoque' : `${product.estoque} un.`}
                          </span>
                        </td>
                        <td>
                          <span className={`user-status ${getStatusClass(product.ativo)}`}>
                            <span />
                            {Number(product.ativo) === 1 ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td>
                          <div className="user-actions">
                            <button type="button" className="user-action edit" onClick={() => openEditModal(product)}>
                              <i className="bi bi-pencil" /> Editar
                            </button>
                            <button type="button" className="user-action delete" onClick={() => openDeleteModal(product)}>
                              <i className="bi bi-trash" /> Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="users-empty">
                      <div className="users-empty-content">
                        <div className="users-empty-icon">
                          <i className="bi bi-box-seam" />
                        </div>
                        <strong>Nenhum produto encontrado</strong>
                        <span>Tente alterar sua busca ou seus filtros.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="users-table-footer">
            <span>
              Mostrando <strong>{products.length}</strong> de <strong>{totalProducts}</strong> produtos
            </span>
            <nav aria-label="Paginação de produtos">
              <ul className="pagination users-pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  >
                    <i className="bi bi-chevron-left" />
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                    <button type="button" className="page-link" onClick={() => setCurrentPage(page)}>
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  >
                    <i className="bi bi-chevron-right" />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </section>
      </main>

      {(modal === 'create' || modal === 'edit') && (
        <div
          className="users-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="users-modal products-modal" role="dialog" aria-modal="true">
            <div className="users-modal-header">
              <div>
                <span className="users-modal-label">{modal === 'create' ? 'Novo produto' : 'Gerenciamento'}</span>
                <h2>{modal === 'create' ? 'Criar produto' : 'Editar produto'}</h2>
              </div>
              <button type="button" className="users-modal-close" onClick={closeModal}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="users-modal-body">
                <div className="products-image-section">
                  <div className="products-image-header">
                    <div>
                      <span>Galeria</span>
                      <strong>Imagens do produto</strong>
                    </div>
                    <small>Clique na imagem para escolher um arquivo do computador (até 4 imagens)</small>
                  </div>
                  <div className="products-image-grid">
                    {['imagem1', 'imagem2', 'imagem3', 'imagem4'].map((imageName, index) => {
                      const preview = localPreviews[imageName] || getImageUrl(form[imageName]);
                      const inputId = `product-image-file-${imageName}`;
                      return (
                        <div
                          key={imageName}
                          className={`product-image-upload ${index === 0 ? 'main' : ''}`}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            position: 'static',
                          }}
                        >
                          <label
                            htmlFor={inputId}
                            style={{
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minHeight: '96px',
                              border: '1px dashed var(--border-color, #d0d5dd)',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              background: 'var(--surface-muted, #f7f7f8)',
                              cursor: 'pointer',
                            }}
                          >
                            {preview ? (
                              <img
                                src={preview}
                                alt={`Imagem ${index + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '12px' }}>
                                <i className="bi bi-image" />
                                <span>{index === 0 ? 'Principal' : `Imagem ${index + 1}`}</span>
                              </div>
                            )}
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                background: 'rgba(0,0,0,0.55)',
                                color: '#fff',
                                borderRadius: '6px 0 0 0',
                                padding: '3px 6px',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <i className="bi bi-camera" />
                            </div>
                            <input
                              id={inputId}
                              type="file"
                              accept="image/*"
                              onChange={(event) => handleImageFileChange(event, imageName)}
                              style={{
                                position: 'absolute',
                                width: 0,
                                height: 0,
                                opacity: 0,
                                overflow: 'hidden',
                              }}
                            />
                          </label>
                          <input
                            type="text"
                            name={imageName}
                            value={form[imageName]}
                            onChange={handleFormChange}
                            placeholder={index === 0 ? 'URL da imagem principal' : 'URL da imagem (opcional)'}
                            required={index === 0}
                            style={{
                              position: 'static',
                              opacity: 1,
                              width: '100%',
                              boxSizing: 'border-box',
                              padding: '6px 8px',
                              fontSize: '0.85rem',
                              border: '1px solid var(--border-color, #d0d5dd)',
                              borderRadius: '6px',
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="user-form-grid">
                  <div className="user-form-field">
                    <label htmlFor="product-sku">SKU</label>
                    <div className="user-input-wrapper">
                      <i className="bi bi-upc-scan" />
                      <input id="product-sku" name="sku" type="text" value={form.sku} onChange={handleFormChange} placeholder="Ex.: CAM-001" maxLength={100} required />
                    </div>
                  </div>

                  <div className="user-form-field">
                    <label htmlFor="product-name">Produto</label>
                    <div className="user-input-wrapper">
                      <i className="bi bi-box-seam" />
                      <input id="product-name" name="nome" type="text" value={form.nome} onChange={handleFormChange} placeholder="Ex.: Essential Premium" maxLength={255} required />
                    </div>
                  </div>

                  <div className="user-form-field">
                    <label htmlFor="product-combination">Nome da combinação</label>
                    <div className="user-input-wrapper">
                      <i className="bi bi-layers" />
                      <input id="product-combination" name="nomeCombinacao" type="text" value={form.nomeCombinacao} onChange={handleFormChange} placeholder="Ex.: Essential Premium Preto M" maxLength={255} required />
                    </div>
                  </div>

                  <div className="user-form-field">
                    <label htmlFor="product-gender">Gênero</label>
                    <div className="user-input-wrapper">
                      <i className="bi bi-person" />
                      <select id="product-gender" name="genero" value={form.genero} onChange={handleFormChange}>
                        <option value="Unissex">Unissex</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                      </select>
                    </div>
                  </div>

                  <div className="user-form-field">
                    <label htmlFor="product-category">Categoria</label>
                    <div className="user-input-wrapper">
                      <i className="bi bi-grid" />
                      <select id="product-category" name="idCategoria" value={form.idCategoria} onChange={handleFormChange} required>
                        <option value="">Selecionar categoria</option>
                        {categorias.map((cat) => (
                          <option key={getOptionId(cat, ['idCategoria'])} value={getOptionId(cat, ['idCategoria'])}>
                            {cat.nomeCategoria}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="user-form-field">
                    <label htmlFor="product-subcategory">Subcategoria</label>
                    <div className="user-input-wrapper">
                      <i className="bi bi-diagram-3" />
                      <select id="product-subcategory" name="idSubcategoria" value={form.idSubcategoria} onChange={handleFormChange} required>
                        <option value="">Selecionar subcategoria</option>
                        {subcategorias.map((sub) => (
                          <option key={getOptionId(sub, ['idSubcategoria'])} value={getOptionId(sub, ['idSubcategoria'])}>
                            {sub.nomeSubcategoria}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="user-form-field">
                    <label htmlFor="product-color">Cor</label>
                    <div className="user-input-wrapper">
                      <i className="bi bi-palette" />
                      <select id="product-color" name="idCor" value={form.idCor} onChange={handleFormChange} required>
                        <option value="">Selecionar cor</option>
                        {cores.map((cor) => (
                          <option key={getOptionId(cor, ['idCor'])} value={getOptionId(cor, ['idCor'])}>
                            {cor.nomeCor}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="user-form-field">
                    <label htmlFor="product-size">Tamanho</label>
                    <div className="user-input-wrapper">
                      <i className="bi bi-rulers" />
                      <select id="product-size" name="idTamanho" value={form.idTamanho} onChange={handleFormChange} required>
                        <option value="">Selecionar tamanho</option>
                        {tamanhos.map((tam) => (
                          <option key={getOptionId(tam, ['idTamanho'])} value={getOptionId(tam, ['idTamanho'])}>
                            {tam.codigoTamanho}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="user-form-field">
                    <label htmlFor="product-model">Modelo</label>
                    <div className="user-input-wrapper">
                      <i className="bi bi-bounding-box" />
                      <select id="product-model" name="idModelo" value={form.idModelo} onChange={handleFormChange} required>
                        <option value="">Selecionar modelo</option>
                        {modelos.map((mod) => (
                          <option key={getOptionId(mod, ['idModelo'])} value={getOptionId(mod, ['idModelo'])}>
                            {mod.nomeModelo}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="user-form-field">
                    <label htmlFor="product-price">Preço</label>
                    <div className="user-input-wrapper">
                      <i className="bi bi-currency-dollar" />
                      <input id="product-price" name="preco" type="number" value={form.preco} onChange={handleFormChange} placeholder="89.90" min="0" step="0.01" required />
                    </div>
                  </div>

                  <div className="user-form-field">
                    <label htmlFor="product-stock">Estoque</label>
                    <div className="user-input-wrapper">
                      <i className="bi bi-boxes" />
                      <input id="product-stock" name="estoque" type="number" value={form.estoque} onChange={handleFormChange} placeholder="25" min="0" step="1" required />
                    </div>
                  </div>

                  <div className="user-form-field full">
                    <label htmlFor="product-description">Descrição</label>
                    <div className="user-input-wrapper textarea-wrapper">
                      <i className="bi bi-card-text" />
                      <textarea id="product-description" name="descricao" value={form.descricao} onChange={handleFormChange} placeholder="Descreva este produto..." rows={5} required />
                    </div>
                  </div>
                </div>
              </div>

              <div className="users-modal-footer">
                <button type="button" className="users-modal-btn secondary" onClick={closeModal} disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="users-modal-btn primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" /> Salvando...
                    </>
                  ) : (
                    <>
                      <i className={modal === 'create' ? 'bi bi-plus-lg' : 'bi bi-check-lg'} />
                      {modal === 'create' ? 'Criar produto' : 'Salvar alterações'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'delete' && selectedProduct && (
        <div
          className="users-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="users-modal users-delete-modal" role="dialog" aria-modal="true">
            <div className="users-delete-content">
              <div className="users-delete-icon">
                <i className="bi bi-trash3" />
              </div>
              <span className="users-modal-label">Atenção</span>
              <h2>Desativar produto?</h2>
              <p>
                Você está prestes a desativar o produto <strong>{selectedProduct.nome}</strong>. Ele deixará de aparecer no catálogo ativo.
              </p>
            </div>
            <div className="users-modal-footer">
              <button type="button" className="users-modal-btn secondary" onClick={closeModal} disabled={submitting}>
                Cancelar
              </button>
              <button type="button" className="users-modal-btn danger" onClick={handleDelete} disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" /> Desativando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash" /> Desativar produto
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}