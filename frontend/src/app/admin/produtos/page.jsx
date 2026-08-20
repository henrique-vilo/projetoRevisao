'use client';

import '../tables.css';
import'./produtos.css';

import { useEffect, useMemo, useState } from 'react';

/* =====================================================
   CONFIGURAÇÃO
===================================================== */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/*
  Caso seu backend esteja em outra porta/endereço,
  defina no .env.local:

  NEXT_PUBLIC_API_URL=http://localhost:3001
*/

/* =====================================================
   ESTADO INICIAL DO FORMULÁRIO
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
  imagem1: null,
  imagem2: null,
  imagem3: null,
  imagem4: null,
};

/* =====================================================
   HELPERS
===================================================== */

function getToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken')
  );
}

function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value) || 0);
}

function getImageUrl(filename) {
  if (!filename) {
    return null;
  }

  if (
    filename.startsWith('http://') ||
    filename.startsWith('https://')
  ) {
    return filename;
  }

  return `${API_URL}/uploads/${filename}`;
}

function getStatusClass(ativo) {
  return Number(ativo) === 1 ? 'success' : 'danger';
}

function getStockClass(stock) {
  if (Number(stock) <= 0) {
    return 'danger';
  }

  if (Number(stock) <= 10) {
    return 'warning';
  }

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
  /* ===================================================
     PRODUTOS
  =================================================== */

  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalProducts, setTotalProducts] = useState(0);

  const productsPerPage = 10;

  /* ===================================================
     FILTROS
  =================================================== */

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

  /* ===================================================
     LISTAS AUXILIARES
  =================================================== */

  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [cores, setCores] = useState([]);
  const [tamanhos, setTamanhos] = useState([]);
  const [modelos, setModelos] = useState([]);

  /* ===================================================
     UI
  =================================================== */

  const [loading, setLoading] = useState(true);

  const [loadingOptions, setLoadingOptions] =
    useState(true);

  const [error, setError] = useState('');

  const [modal, setModal] = useState(null);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [form, setForm] = useState(emptyForm);

  const [imagePreviews, setImagePreviews] =
    useState({
      imagem1: null,
      imagem2: null,
      imagem3: null,
      imagem4: null,
    });

  const [submitting, setSubmitting] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState('');

  const [showFilters, setShowFilters] =
    useState(false);

  /* ===================================================
     HEADERS
  =================================================== */

  const getHeaders = () => {
    const token = getToken();

    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  };

  /* ===================================================
     CARREGAR PRODUTOS
  =================================================== */

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();

      params.set('pagina', currentPage);
      params.set('limite', productsPerPage);

      if (search.trim()) {
        params.set('busca', search.trim());
      }

      Object.entries(filters).forEach(
        ([key, value]) => {
          if (
            value !== '' &&
            value !== null &&
            value !== undefined
          ) {
            params.set(key, value);
          }
        }
      );

      const response = await fetch(
        `${API_URL}/produtos?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            ...getHeaders(),
          },
          cache: 'no-store',
        }
      );

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(
          data.erro ||
            data.mensagem ||
            'Não foi possível carregar os produtos.'
        );
      }

      setProducts(data.dados || []);

      setTotalProducts(
        Number(data.paginacao?.total) || 0
      );

      setTotalPages(
        Math.max(
          1,
          Number(data.paginacao?.totalPaginas) || 1
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          'Não foi possível carregar os produtos.'
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================
     CARREGAR OPÇÕES DOS SELECTS
  =================================================== */

  const carregarOpcoes = async () => {
    try {
      setLoadingOptions(true);

      const endpoints = [
        {
          key: 'categorias',
          url: '/categorias',
        },
        {
          key: 'subcategorias',
          url: '/subcategorias',
        },
        {
          key: 'cores',
          url: '/cores',
        },
        {
          key: 'tamanhos',
          url: '/tamanhos',
        },
        {
          key: 'modelos',
          url: '/modelos',
        },
      ];

      const responses = await Promise.all(
        endpoints.map(async (endpoint) => {
          const response = await fetch(
            `${API_URL}${endpoint.url}?pagina=1&limite=100`,
            {
              method: 'GET',
              headers: {
                ...getHeaders(),
              },
              cache: 'no-store',
            }
          );

          if (!response.ok) {
            throw new Error(
              `Erro ao carregar ${endpoint.key}`
            );
          }

          const data = await response.json();

          return {
            key: endpoint.key,
            data: data.dados || [],
          };
        })
      );

      responses.forEach(({ key, data }) => {
        if (key === 'categorias') {
          setCategorias(data);
        }

        if (key === 'subcategorias') {
          setSubcategorias(data);
        }

        if (key === 'cores') {
          setCores(data);
        }

        if (key === 'tamanhos') {
          setTamanhos(data);
        }

        if (key === 'modelos') {
          setModelos(data);
        }
      });
    } catch (err) {
      console.error(
        'Erro ao carregar opções:',
        err
      );
    } finally {
      setLoadingOptions(false);
    }
  };

  /* ===================================================
     EFFECTS
  =================================================== */

  useEffect(() => {
    carregarOpcoes();
  }, []);

  useEffect(() => {
    carregarProdutos();
  }, [currentPage, filters]);

  /* ===================================================
     BUSCA COM DEBOUNCE
  =================================================== */

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
        return;
      }

      carregarProdutos();
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /* ===================================================
     HANDLERS
  =================================================== */

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));

    setCurrentPage(1);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const { name, files } = event.target;

    const file = files?.[0];

    if (!file) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: file,
    }));

    const preview = URL.createObjectURL(file);

    setImagePreviews((previous) => ({
      ...previous,
      [name]: preview,
    }));
  };

  /* ===================================================
     MODAIS
  =================================================== */

  const closeModal = () => {
    Object.values(imagePreviews).forEach((url) => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    });

    setModal(null);
    setSelectedProduct(null);
    setForm(emptyForm);

    setImagePreviews({
      imagem1: null,
      imagem2: null,
      imagem3: null,
      imagem4: null,
    });

    setSubmitting(false);
  };

  const openCreateModal = () => {
    setSelectedProduct(null);
    setForm(emptyForm);

    setImagePreviews({
      imagem1: null,
      imagem2: null,
      imagem3: null,
      imagem4: null,
    });

    setModal('create');
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);

    setForm({
      sku: product.sku || '',
      nome: product.nome || '',
      nomeCombinacao:
        product.nomeCombinacao || '',
      descricao: product.descricao || '',
      genero: product.genero || 'Unissex',
      preco: product.preco ?? '',
      idCategoria:
        product.idCategoria ?? '',
      idSubcategoria:
        product.idSubcategoria ?? '',
      idCor: product.idCor ?? '',
      idTamanho:
        product.idTamanho ?? '',
      idModelo:
        product.idModelo ?? '',
      estoque: product.estoque ?? '',
      imagem1: null,
      imagem2: null,
      imagem3: null,
      imagem4: null,
    });

    setImagePreviews({
      imagem1: getImageUrl(product.imagem1),
      imagem2: getImageUrl(product.imagem2),
      imagem3: getImageUrl(product.imagem3),
      imagem4: getImageUrl(product.imagem4),
    });

    setModal('edit');
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setModal('delete');
  };

  /* ===================================================
     SUBMIT
  =================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();

      formData.append(
        'sku',
        form.sku.trim()
      );

      formData.append(
        'nome',
        form.nome.trim()
      );

      formData.append(
        'nomeCombinacao',
        form.nomeCombinacao.trim()
      );

      formData.append(
        'descricao',
        form.descricao.trim()
      );

      formData.append(
        'genero',
        form.genero
      );

      formData.append(
        'preco',
        String(Number(form.preco))
      );

      formData.append(
        'idCategoria',
        String(form.idCategoria)
      );

      formData.append(
        'idSubcategoria',
        String(form.idSubcategoria)
      );

      formData.append(
        'idCor',
        String(form.idCor)
      );

      formData.append(
        'idTamanho',
        String(form.idTamanho)
      );

      formData.append(
        'idModelo',
        String(form.idModelo)
      );

      formData.append(
        'estoque',
        String(Number(form.estoque))
      );

      if (form.imagem1) {
        formData.append(
          'imagem1',
          form.imagem1
        );
      }

      if (form.imagem2) {
        formData.append(
          'imagem2',
          form.imagem2
        );
      }

      if (form.imagem3) {
        formData.append(
          'imagem3',
          form.imagem3
        );
      }

      if (form.imagem4) {
        formData.append(
          'imagem4',
          form.imagem4
        );
      }

      const isEdit = modal === 'edit';

      const url = isEdit
        ? `${API_URL}/produtos/${selectedProduct.idProduto}`
        : `${API_URL}/produtos`;

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          ...getHeaders(),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(
          data.erro ||
            data.mensagem ||
            'Não foi possível salvar o produto.'
        );
      }

      setSuccessMessage(
        isEdit
          ? 'Produto atualizado com sucesso.'
          : 'Produto cadastrado com sucesso.'
      );

      closeModal();

      await carregarProdutos();

      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          'Não foi possível salvar o produto.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ===================================================
     DELETE
  =================================================== */

  const handleDelete = async () => {
    if (!selectedProduct || submitting) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(
        `${API_URL}/produtos/${selectedProduct.idProduto}`,
        {
          method: 'DELETE',
          headers: {
            ...getHeaders(),
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(
          data.erro ||
            data.mensagem ||
            'Não foi possível desativar o produto.'
        );
      }

      closeModal();

      await carregarProdutos();

      setSuccessMessage(
        'Produto desativado com sucesso.'
      );

      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          'Não foi possível desativar o produto.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ===================================================
     RESET FILTROS
  =================================================== */

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

    setCurrentPage(1);
  };

  /* ===================================================
     SUBCATEGORIAS FILTRADAS
  =================================================== */

  const availableSubcategories = useMemo(() => {
    if (!filters.idCategoria) {
      return subcategorias;
    }

    return subcategorias.filter((item) => {
      const categoryId = getOptionId(
        item,
        [
          'idCategoria',
          'categoriaId',
        ]
      );

      return (
        String(categoryId) ===
        String(filters.idCategoria)
      );
    });
  }, [
    subcategorias,
    filters.idCategoria,
  ]);

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <>
      <main className="users-page">
        {/* =================================================
            HEADER
        ================================================= */}

        <section className="users-heading">
          <div>
            <span className="users-eyebrow">
              Catálogo
            </span>

            <h1>Produtos</h1>

            <p>
              Gerencie os produtos disponíveis no
              catálogo.
            </p>
          </div>

          <div className="users-heading-actions">
            <button
              type="button"
              className="users-btn users-btn-secondary"
              onClick={carregarProdutos}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise" />

              Atualizar
            </button>

            <button
              type="button"
              className="users-btn users-btn-primary"
              onClick={openCreateModal}
            >
              <i className="bi bi-plus-lg" />

              Novo produto
            </button>
          </div>
        </section>

        {/* =================================================
            ALERTAS
        ================================================= */}

        {error && (
          <div className="products-alert error">
            <i className="bi bi-exclamation-circle" />

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError('')}
            >
              <i className="bi bi-x" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="products-alert success">
            <i className="bi bi-check-circle" />

            <span>{successMessage}</span>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage('')
              }
            >
              <i className="bi bi-x" />
            </button>
          </div>
        )}

        {/* =================================================
            CARD
        ================================================= */}

        <section className="users-card">
          {/* HEADER */}

          <div className="users-card-header">
            <div>
              <span className="users-card-label">
                Gerenciamento
              </span>

              <h2>
                Produtos cadastrados
              </h2>
            </div>

            <div className="users-card-header-right">
              <div className="users-search">
                <i className="bi bi-search" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setSearch(
                      event.target.value
                    );
                  }}
                  placeholder="Buscar produto..."
                  aria-label="Buscar produto"
                />

                {search && (
                  <button
                    type="button"
                    className="users-search-clear"
                    onClick={() =>
                      setSearch('')
                    }
                    aria-label="Limpar busca"
                  >
                    <i className="bi bi-x" />
                  </button>
                )}
              </div>

              <button
                type="button"
                className="products-filter-toggle"
                onClick={() =>
                  setShowFilters(
                    (previous) =>
                      !previous
                  )
                }
              >
                <i className="bi bi-sliders" />

                Filtros
              </button>
            </div>
          </div>

          {/* =================================================
              FILTROS
          ================================================= */}

          {showFilters && (
            <div className="products-filters">
              <div className="products-filter-grid">
                {/* GÊNERO */}

                <div className="products-filter-field">
                  <label>Gênero</label>

                  <select
                    name="genero"
                    value={filters.genero}
                    onChange={
                      handleFilterChange
                    }
                  >
                    <option value="">
                      Todos
                    </option>

                    <option value="Masculino">
                      Masculino
                    </option>

                    <option value="Feminino">
                      Feminino
                    </option>

                    <option value="Unissex">
                      Unissex
                    </option>
                  </select>
                </div>

                {/* CATEGORIA */}

                <div className="products-filter-field">
                  <label>Categoria</label>

                  <select
                    name="idCategoria"
                    value={
                      filters.idCategoria
                    }
                    onChange={
                      handleFilterChange
                    }
                  >
                    <option value="">
                      Todas
                    </option>

                    {categorias.map(
                      (categoria) => {
                        const id =
                          getOptionId(
                            categoria,
                            [
                              'idCategoria',
                            ]
                          );

                        return (
                          <option
                            key={id}
                            value={id}
                          >
                            {
                              categoria.nomeCategoria
                            }
                          </option>
                        );
                      }
                    )}
                  </select>
                </div>

                {/* SUBCATEGORIA */}

                <div className="products-filter-field">
                  <label>
                    Subcategoria
                  </label>

                  <select
                    name="idSubcategoria"
                    value={
                      filters.idSubcategoria
                    }
                    onChange={
                      handleFilterChange
                    }
                  >
                    <option value="">
                      Todas
                    </option>

                    {availableSubcategories.map(
                      (subcategoria) => {
                        const id =
                          getOptionId(
                            subcategoria,
                            [
                              'idSubcategoria',
                            ]
                          );

                        return (
                          <option
                            key={id}
                            value={id}
                          >
                            {
                              subcategoria.nomeSubcategoria
                            }
                          </option>
                        );
                      }
                    )}
                  </select>
                </div>

                {/* COR */}

                <div className="products-filter-field">
                  <label>Cor</label>

                  <select
                    name="idCor"
                    value={filters.idCor}
                    onChange={
                      handleFilterChange
                    }
                  >
                    <option value="">
                      Todas
                    </option>

                    {cores.map((cor) => {
                      const id =
                        getOptionId(cor, [
                          'idCor',
                        ]);

                      return (
                        <option
                          key={id}
                          value={id}
                        >
                          {cor.nomeCor}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* TAMANHO */}

                <div className="products-filter-field">
                  <label>Tamanho</label>

                  <select
                    name="idTamanho"
                    value={
                      filters.idTamanho
                    }
                    onChange={
                      handleFilterChange
                    }
                  >
                    <option value="">
                      Todos
                    </option>

                    {tamanhos.map(
                      (tamanho) => {
                        const id =
                          getOptionId(
                            tamanho,
                            [
                              'idTamanho',
                            ]
                          );

                        return (
                          <option
                            key={id}
                            value={id}
                          >
                            {
                              tamanho.codigoTamanho
                            }
                          </option>
                        );
                      }
                    )}
                  </select>
                </div>

                {/* MODELO */}

                <div className="products-filter-field">
                  <label>Modelo</label>

                  <select
                    name="idModelo"
                    value={
                      filters.idModelo
                    }
                    onChange={
                      handleFilterChange
                    }
                  >
                    <option value="">
                      Todos
                    </option>

                    {modelos.map(
                      (modelo) => {
                        const id =
                          getOptionId(
                            modelo,
                            [
                              'idModelo',
                            ]
                          );

                        return (
                          <option
                            key={id}
                            value={id}
                          >
                            {
                              modelo.nomeModelo
                            }
                          </option>
                        );
                      }
                    )}
                  </select>
                </div>

                {/* PREÇO MIN */}

                <div className="products-filter-field">
                  <label>
                    Preço mínimo
                  </label>

                  <input
                    type="number"
                    name="precoMin"
                    value={
                      filters.precoMin
                    }
                    onChange={
                      handleFilterChange
                    }
                    min="0"
                    step="0.01"
                    placeholder="R$ 0,00"
                  />
                </div>

                {/* PREÇO MAX */}

                <div className="products-filter-field">
                  <label>
                    Preço máximo
                  </label>

                  <input
                    type="number"
                    name="precoMax"
                    value={
                      filters.precoMax
                    }
                    onChange={
                      handleFilterChange
                    }
                    min="0"
                    step="0.01"
                    placeholder="R$ 999,99"
                  />
                </div>

                {/* ESTOQUE */}

                <div className="products-filter-field">
                  <label>Estoque</label>

                  <select
                    name="emEstoque"
                    value={
                      filters.emEstoque
                    }
                    onChange={
                      handleFilterChange
                    }
                  >
                    <option value="">
                      Todos
                    </option>

                    <option value="true">
                      Em estoque
                    </option>
                  </select>
                </div>

                {/* ORDENAR */}

                <div className="products-filter-field">
                  <label>
                    Ordenar por
                  </label>

                  <select
                    name="ordenarPor"
                    value={
                      filters.ordenarPor
                    }
                    onChange={
                      handleFilterChange
                    }
                  >
                    <option value="recente">
                      Mais recentes
                    </option>

                    <option value="antigo">
                      Mais antigos
                    </option>

                    <option value="nome_asc">
                      Nome A-Z
                    </option>

                    <option value="preco_asc">
                      Menor preço
                    </option>

                    <option value="preco_desc">
                      Maior preço
                    </option>
                  </select>
                </div>
              </div>

              <div className="products-filter-footer">
                <button
                  type="button"
                  className="products-filter-reset"
                  onClick={resetFilters}
                >
                  <i className="bi bi-arrow-counterclockwise" />

                  Limpar filtros
                </button>
              </div>
            </div>
          )}

          {/* =================================================
              TABLE
          ================================================= */}

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
                    <td
                      colSpan="6"
                      className="products-loading"
                    >
                      <div className="products-loading-content">
                        <div className="spinner-border" />

                        <span>
                          Carregando produtos...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : products.length > 0 ? (
                  products.map((product) => {
                    const image =
                      getImageUrl(
                        product.imagem1
                      );

                    return (
                      <tr
                        key={
                          product.idProduto
                        }
                      >
                        {/* PRODUTO */}

                        <td>
                          <div className="user-cell">
                            <div className="product-table-image">
                              {image ? (
                                <img
                                  src={image}
                                  alt={
                                    product.nome
                                  }
                                />
                              ) : (
                                <i className="bi bi-box-seam" />
                              )}
                            </div>

                            <div className="user-information">
                              <span className="user-name">
                                {
                                  product.nome
                                }
                              </span>

                              <span className="user-id">
                                SKU:{' '}
                                {
                                  product.sku
                                }
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* CATEGORIA */}

                        <td>
                          <div className="product-category-cell">
                            <span className="user-type cliente">
                              {
                                product.categoriaNome ||
                                'Sem categoria'
                              }
                            </span>

                            {product.subcategoriaNome && (
                              <small>
                                {
                                  product.subcategoriaNome
                                }
                              </small>
                            )}
                          </div>
                        </td>

                        {/* PREÇO */}

                        <td>
                          <strong className="product-price">
                            {formatPrice(
                              product.preco
                            )}
                          </strong>
                        </td>

                        {/* ESTOQUE */}

                        <td>
                          <span
                            className={`user-status ${getStockClass(
                              product.estoque
                            )}`}
                          >
                            <span />

                            {Number(
                              product.estoque
                            ) <= 0
                              ? 'Sem estoque'
                              : `${product.estoque} un.`}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td>
                          <span
                            className={`user-status ${getStatusClass(
                              product.ativo
                            )}`}
                          >
                            <span />

                            {Number(
                              product.ativo
                            ) === 1
                              ? 'Ativo'
                              : 'Inativo'}
                          </span>
                        </td>

                        {/* AÇÕES */}

                        <td>
                          <div className="user-actions">
                            <button
                              type="button"
                              className="user-action edit"
                              onClick={() =>
                                openEditModal(
                                  product
                                )
                              }
                            >
                              <i className="bi bi-pencil" />

                              Editar
                            </button>

                            <button
                              type="button"
                              className="user-action delete"
                              onClick={() =>
                                openDeleteModal(
                                  product
                                )
                              }
                            >
                              <i className="bi bi-trash" />

                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="users-empty"
                    >
                      <div className="users-empty-content">
                        <div className="users-empty-icon">
                          <i className="bi bi-box-seam" />
                        </div>

                        <strong>
                          Nenhum produto encontrado
                        </strong>

                        <span>
                          Tente alterar sua busca
                          ou seus filtros.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="users-table-footer">
            <span>
              Mostrando{' '}
              <strong>
                {products.length}
              </strong>{' '}
              de{' '}
              <strong>
                {totalProducts}
              </strong>{' '}
              produtos
            </span>

            <nav aria-label="Paginação de produtos">
              <ul className="pagination users-pagination">
                <li
                  className={`page-item ${
                    currentPage === 1
                      ? 'disabled'
                      : ''
                  }`}
                >
                  <button
                    type="button"
                    className="page-link"
                    disabled={
                      currentPage === 1
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          Math.max(
                            1,
                            page - 1
                          )
                      )
                    }
                  >
                    <i className="bi bi-chevron-left" />
                  </button>
                </li>

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map((page) => (
                  <li
                    key={page}
                    className={`page-item ${
                      page === currentPage
                        ? 'active'
                        : ''
                    }`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      onClick={() =>
                        setCurrentPage(
                          page
                        )
                      }
                    >
                      {page}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${
                    currentPage ===
                    totalPages
                      ? 'disabled'
                      : ''
                  }`}
                >
                  <button
                    type="button"
                    className="page-link"
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          Math.min(
                            totalPages,
                            page + 1
                          )
                      )
                    }
                  >
                    <i className="bi bi-chevron-right" />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </section>
      </main>

      {/* ===================================================
          CREATE / EDIT MODAL
      =================================================== */}

      {(modal === 'create' ||
        modal === 'edit') && (
        <div
          className="users-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div
            className="users-modal products-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
          >
            {/* HEADER */}

            <div className="users-modal-header">
              <div>
                <span className="users-modal-label">
                  {modal === 'create'
                    ? 'Novo produto'
                    : 'Gerenciamento'}
                </span>

                <h2 id="product-modal-title">
                  {modal === 'create'
                    ? 'Criar produto'
                    : 'Editar produto'}
                </h2>
              </div>

              <button
                type="button"
                className="users-modal-close"
                onClick={closeModal}
                aria-label="Fechar modal"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="users-modal-body">
                {/* =================================================
                    IMAGENS
                ================================================= */}

                <div className="products-image-section">
                  <div className="products-image-header">
                    <div>
                      <span>
                        Galeria
                      </span>

                      <strong>
                        Imagens do produto
                      </strong>
                    </div>

                    <small>
                      Até 4 imagens
                    </small>
                  </div>

                  <div className="products-image-grid">
                    {[
                      'imagem1',
                      'imagem2',
                      'imagem3',
                      'imagem4',
                    ].map(
                      (
                        imageName,
                        index
                      ) => (
                        <label
                          key={imageName}
                          className={`product-image-upload ${
                            index === 0
                              ? 'main'
                              : ''
                          }`}
                        >
                          {imagePreviews[
                            imageName
                          ] ? (
                            <img
                              src={
                                imagePreviews[
                                  imageName
                                ]
                              }
                              alt={`Imagem ${
                                index + 1
                              }`}
                            />
                          ) : (
                            <>
                              <i className="bi bi-image" />

                              <span>
                                {index ===
                                0
                                  ? 'Principal'
                                  : `Imagem ${
                                      index + 1
                                    }`}
                              </span>
                            </>
                          )}

                          <input
                            type="file"
                            name={
                              imageName
                            }
                            accept="image/*"
                            onChange={
                              handleImageChange
                            }
                          />

                          <div className="product-image-overlay">
                            <i className="bi bi-camera" />
                          </div>
                        </label>
                      )
                    )}
                  </div>
                </div>

                {/* =================================================
                    CAMPOS
                ================================================= */}

                <div className="user-form-grid">
                  {/* SKU */}

                  <div className="user-form-field">
                    <label htmlFor="product-sku">
                      SKU
                    </label>

                    <div className="user-input-wrapper">
                      <i className="bi bi-upc-scan" />

                      <input
                        id="product-sku"
                        name="sku"
                        type="text"
                        value={
                          form.sku
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Ex.: CAM-001"
                        maxLength={100}
                        required
                      />
                    </div>
                  </div>

                  {/* NOME */}

                  <div className="user-form-field">
                    <label htmlFor="product-name">
                      Produto
                    </label>

                    <div className="user-input-wrapper">
                      <i className="bi bi-box-seam" />

                      <input
                        id="product-name"
                        name="nome"
                        type="text"
                        value={
                          form.nome
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Ex.: Essential Premium"
                        maxLength={255}
                        required
                      />
                    </div>
                  </div>

                  {/* COMBINAÇÃO */}

                  <div className="user-form-field">
                    <label htmlFor="product-combination">
                      Nome da combinação
                    </label>

                    <div className="user-input-wrapper">
                      <i className="bi bi-layers" />

                      <input
                        id="product-combination"
                        name="nomeCombinacao"
                        type="text"
                        value={
                          form.nomeCombinacao
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Ex.: Essential Premium Preto M"
                        maxLength={255}
                        required
                      />
                    </div>
                  </div>

                  {/* GÊNERO */}

                  <div className="user-form-field">
                    <label htmlFor="product-gender">
                      Gênero
                    </label>

                    <div className="user-input-wrapper">
                      <i className="bi bi-person" />

                      <select
                        id="product-gender"
                        name="genero"
                        value={
                          form.genero
                        }
                        onChange={
                          handleFormChange
                        }
                      >
                        <option value="Unissex">
                          Unissex
                        </option>

                        <option value="Masculino">
                          Masculino
                        </option>

                        <option value="Feminino">
                          Feminino
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* CATEGORIA */}

                  <div className="user-form-field">
                    <label htmlFor="product-category">
                      Categoria
                    </label>

                    <div className="user-input-wrapper">
                      <i className="bi bi-grid" />

                      <select
                        id="product-category"
                        name="idCategoria"
                        value={
                          form.idCategoria
                        }
                        onChange={
                          handleFormChange
                        }
                        required
                      >
                        <option value="">
                          Selecionar categoria
                        </option>

                        {categorias.map(
                          (
                            categoria
                          ) => {
                            const id =
                              getOptionId(
                                categoria,
                                [
                                  'idCategoria',
                                ]
                              );

                            return (
                              <option
                                key={
                                  id
                                }
                                value={
                                  id
                                }
                              >
                                {
                                  categoria.nomeCategoria
                                }
                              </option>
                            );
                          }
                        )}
                      </select>
                    </div>
                  </div>

                  {/* SUBCATEGORIA */}

                  <div className="user-form-field">
                    <label htmlFor="product-subcategory">
                      Subcategoria
                    </label>

                    <div className="user-input-wrapper">
                      <i className="bi bi-diagram-3" />

                      <select
                        id="product-subcategory"
                        name="idSubcategoria"
                        value={
                          form.idSubcategoria
                        }
                        onChange={
                          handleFormChange
                        }
                        required
                      >
                        <option value="">
                          Selecionar subcategoria
                        </option>

                        {subcategorias.map(
                          (
                            subcategoria
                          ) => {
                            const id =
                              getOptionId(
                                subcategoria,
                                [
                                  'idSubcategoria',
                                ]
                              );

                            return (
                              <option
                                key={
                                  id
                                }
                                value={
                                  id
                                }
                              >
                                {
                                  subcategoria.nomeSubcategoria
                                }
                              </option>
                            );
                          }
                        )}
                      </select>
                    </div>
                  </div>

                  {/* COR */}

                  <div className="user-form-field">
                    <label htmlFor="product-color">
                      Cor
                    </label>

                    <div className="user-input-wrapper">
                      <i className="bi bi-palette" />

                      <select
                        id="product-color"
                        name="idCor"
                        value={
                          form.idCor
                        }
                        onChange={
                          handleFormChange
                        }
                        required
                      >
                        <option value="">
                          Selecionar cor
                        </option>

                        {cores.map(
                          (cor) => {
                            const id =
                              getOptionId(
                                cor,
                                [
                                  'idCor',
                                ]
                              );

                            return (
                              <option
                                key={
                                  id
                                }
                                value={
                                  id
                                }
                              >
                                {
                                  cor.nomeCor
                                }
                              </option>
                            );
                          }
                        )}
                      </select>
                    </div>
                  </div>

                  {/* TAMANHO */}

                  <div className="user-form-field">
                    <label htmlFor="product-size">
                      Tamanho
                    </label>

                    <div className="user-input-wrapper">
                      <i className="bi bi-rulers" />

                      <select
                        id="product-size"
                        name="idTamanho"
                        value={
                          form.idTamanho
                        }
                        onChange={
                          handleFormChange
                        }
                        required
                      >
                        <option value="">
                          Selecionar tamanho
                        </option>

                        {tamanhos.map(
                          (
                            tamanho
                          ) => {
                            const id =
                              getOptionId(
                                tamanho,
                                [
                                  'idTamanho',
                                ]
                              );

                            return (
                              <option
                                key={
                                  id
                                }
                                value={
                                  id
                                }
                              >
                                {
                                  tamanho.codigoTamanho
                                }
                              </option>
                            );
                          }
                        )}
                      </select>
                    </div>
                  </div>

                  {/* MODELO */}

                  <div className="user-form-field">
                    <label htmlFor="product-model">
                      Modelo
                    </label>

                    <div className="user-input-wrapper">
                      <i className="bi bi-bounding-box" />

                      <select
                        id="product-model"
                        name="idModelo"
                        value={
                          form.idModelo
                        }
                        onChange={
                          handleFormChange
                        }
                        required
                      >
                        <option value="">
                          Selecionar modelo
                        </option>

                        {modelos.map(
                          (
                            modelo
                          ) => {
                            const id =
                              getOptionId(
                                modelo,
                                [
                                  'idModelo',
                                ]
                              );

                            return (
                              <option
                                key={
                                  id
                                }
                                value={
                                  id
                                }
                              >
                                {
                                  modelo.nomeModelo
                                }
                              </option>
                            );
                          }
                        )}
                      </select>
                    </div>
                  </div>

                  {/* PREÇO */}

                  <div className="user-form-field">
                    <label htmlFor="product-price">
                      Preço
                    </label>

                    <div className="user-input-wrapper">
                      <i className="bi bi-currency-dollar" />

                      <input
                        id="product-price"
                        name="preco"
                        type="number"
                        value={
                          form.preco
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="89.90"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  {/* ESTOQUE */}

                  <div className="user-form-field">
                    <label htmlFor="product-stock">
                      Estoque
                    </label>

                    <div className="user-input-wrapper">
                      <i className="bi bi-boxes" />

                      <input
                        id="product-stock"
                        name="estoque"
                        type="number"
                        value={
                          form.estoque
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="25"
                        min="0"
                        step="1"
                        required
                      />
                    </div>
                  </div>

                  {/* DESCRIÇÃO */}

                  <div className="user-form-field full">
                    <label htmlFor="product-description">
                      Descrição
                    </label>

                    <div className="user-input-wrapper textarea-wrapper">
                      <i className="bi bi-card-text" />

                      <textarea
                        id="product-description"
                        name="descricao"
                        value={
                          form.descricao
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Descreva este produto..."
                        rows={5}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}

              <div className="users-modal-footer">
                <button
                  type="button"
                  className="users-modal-btn secondary"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="users-modal-btn primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" />

                      Salvando...
                    </>
                  ) : (
                    <>
                      <i
                        className={
                          modal ===
                          'create'
                            ? 'bi bi-plus-lg'
                            : 'bi bi-check-lg'
                        }
                      />

                      {modal ===
                      'create'
                        ? 'Criar produto'
                        : 'Salvar alterações'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      {modal === 'delete' &&
        selectedProduct && (
          <div
            className="users-modal-backdrop"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeModal();
              }
            }}
          >
            <div
              className="users-modal users-delete-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-product-title"
            >
              <div className="users-delete-content">
                <div className="users-delete-icon">
                  <i className="bi bi-trash3" />
                </div>

                <span className="users-modal-label">
                  Atenção
                </span>

                <h2 id="delete-product-title">
                  Desativar produto?
                </h2>

                <p>
                  Você está prestes a
                  desativar o produto{' '}
                  <strong>
                    {
                      selectedProduct.nome
                    }
                  </strong>
                  . Ele deixará de aparecer
                  no catálogo ativo.
                </p>
              </div>

              <div className="users-modal-footer">
                <button
                  type="button"
                  className="users-modal-btn secondary"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="users-modal-btn danger"
                  onClick={
                    handleDelete
                  }
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" />

                      Desativando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash" />

                      Desativar produto
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