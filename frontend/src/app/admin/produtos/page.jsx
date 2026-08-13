'use client';

import '../tables.css';

import { useMemo, useState } from 'react';

/* =====================================================
   PRODUTOS FICTÍCIOS
===================================================== */

const initialProducts = [
  {
    id: 1,
    name: 'Essencial Premium',
    description:
      'Camiseta básica de algodão com modelagem regular.',
    category: 'Camisetas',
    price: 89.9,
    stock: 42,
    status: 'Ativo',
    image: null,
  },
  {
    id: 2,
    name: 'Urban Classic',
    description:
      'Camisa masculina casual para uso diário.',
    category: 'Camisas',
    price: 129.9,
    stock: 27,
    status: 'Ativo',
    image: null,
  },
  {
    id: 3,
    name: 'Denim Blue',
    description:
      'Jeans azul de corte tradicional e acabamento moderno.',
    category: 'Calças',
    price: 189.9,
    stock: 18,
    status: 'Ativo',
    image: null,
  },
  {
    id: 4,
    name: 'Street Hoodie',
    description:
      'Moletom confortável com estética urbana.',
    category: 'Moletons',
    price: 219.9,
    stock: 9,
    status: 'Ativo',
    image: null,
  },
  {
    id: 5,
    name: 'Minimal White',
    description:
      'Peça minimalista para composições casuais.',
    category: 'Camisetas',
    price: 79.9,
    stock: 0,
    status: 'Inativo',
    image: null,
  },
  {
    id: 6,
    name: 'Classic Fit',
    description:
      'Modelagem clássica com acabamento premium.',
    category: 'Camisas',
    price: 149.9,
    stock: 31,
    status: 'Ativo',
    image: null,
  },
  {
    id: 7,
    name: 'Basic Denim',
    description:
      'Calça jeans versátil para diferentes ocasiões.',
    category: 'Calças',
    price: 169.9,
    stock: 14,
    status: 'Ativo',
    image: null,
  },
  {
    id: 8,
    name: 'Essential Hoodie',
    description:
      'Moletom básico com visual clean.',
    category: 'Moletons',
    price: 199.9,
    stock: 6,
    status: 'Ativo',
    image: null,
  },
];

/* =====================================================
   FORMULÁRIO
===================================================== */

const emptyForm = {
  name: '',
  description: '',
  category: 'Camisetas',
  price: '',
  stock: '',
  status: 'Ativo',
  image: null,
};

/* =====================================================
   STATUS
===================================================== */

function getStatusClass(status) {
  return status === 'Ativo'
    ? 'success'
    : 'danger';
}

/* =====================================================
   PREÇO
===================================================== */

function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/* =====================================================
   PAGE
===================================================== */

export default function ProdutosPage() {
  const [products, setProducts] =
    useState(initialProducts);

  const [search, setSearch] =
    useState('');

  const [currentPage, setCurrentPage] =
    useState(1);

  const [modal, setModal] =
    useState(null);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [form, setForm] =
    useState(emptyForm);

  const productsPerPage = 5;

  /* ===================================================
     FILTRO
  =================================================== */

  const filteredProducts = useMemo(() => {
    const term = search
      .trim()
      .toLowerCase();

    if (!term) {
      return products;
    }

    return products.filter((product) =>
      [
        product.name,
        product.description,
        product.category,
        product.status,
        String(product.id),
      ].some((value) =>
        String(value)
          .toLowerCase()
          .includes(term)
      )
    );
  }, [products, search]);

  /* ===================================================
     PAGINAÇÃO
  =================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length /
        productsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) *
    productsPerPage;

  const currentProducts =
    filteredProducts.slice(
      startIndex,
      startIndex + productsPerPage
    );

  /* ===================================================
     MODAIS
  =================================================== */

  const closeModal = () => {
    setModal(null);
    setSelectedProduct(null);
    setForm(emptyForm);
  };

  const openCreateModal = () => {
    setSelectedProduct(null);
    setForm(emptyForm);
    setModal('create');
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);

    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      status: product.status,
      image: product.image,
    });

    setModal('edit');
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setModal('delete');
  };

  /* ===================================================
     FORM
  =================================================== */

  const handleFormChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ===================================================
     CRIAR / EDITAR
  =================================================== */

  const handleSubmit = (event) => {
    event.preventDefault();

    const name =
      form.name.trim();

    const description =
      form.description.trim();

    const category =
      form.category.trim();

    const price =
      Number(form.price);

    const stock =
      Number(form.stock);

    if (!name) {
      return;
    }

    if (!category) {
      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      return;
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return;
    }

    /* ================================================
       CREATE
    ================================================ */

    if (modal === 'create') {
      const newProduct = {
        id:
          Math.max(
            ...products.map(
              (product) =>
                product.id
            ),
            0
          ) + 1,

        name,

        description,

        category,

        price,

        stock,

        status:
          form.status,

        image: null,
      };

      setProducts(
        (previous) => [
          ...previous,
          newProduct,
        ]
      );

      setCurrentPage(1);
    }

    /* ================================================
       EDIT
    ================================================ */

    if (
      modal === 'edit' &&
      selectedProduct
    ) {
      setProducts(
        (previous) =>
          previous.map(
            (product) =>
              product.id ===
              selectedProduct.id
                ? {
                    ...product,
                    name,
                    description,
                    category,
                    price,
                    stock,
                    status:
                      form.status,
                    image: null,
                  }
                : product
          )
      );
    }

    closeModal();
  };

  /* ===================================================
     EXCLUIR
  =================================================== */

  const handleDelete = () => {
    if (!selectedProduct) {
      return;
    }

    setProducts(
      (previous) =>
        previous.filter(
          (product) =>
            product.id !==
            selectedProduct.id
        )
    );

    closeModal();
  };

  /* ===================================================
     BUSCA
  =================================================== */

  const handleSearch = (event) => {
    setSearch(
      event.target.value
    );

    setCurrentPage(1);
  };

  /* ===================================================
     PAGE
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

            <h1>
              Produtos
            </h1>

            <p>
              Gerencie os produtos disponíveis no catálogo.
            </p>

          </div>

          <div className="users-heading-actions">

            <button
              type="button"
              className="users-btn users-btn-secondary"
              onClick={() => {
                setSearch('');
                setCurrentPage(1);
              }}
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
            CARD
        ================================================= */}

        <section className="users-card">

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
                  onChange={handleSearch}
                  placeholder="Buscar produto..."
                  aria-label="Buscar produto"
                />

                {search && (
                  <button
                    type="button"
                    className="users-search-clear"
                    onClick={() => {
                      setSearch('');
                      setCurrentPage(1);
                    }}
                    aria-label="Limpar busca"
                  >
                    <i className="bi bi-x" />
                  </button>
                )}

              </div>

            </div>

          </div>

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

                {currentProducts.length > 0 ? (

                  currentProducts.map(
                    (product) => (

                      <tr
                        key={product.id}
                      >

                        {/* PRODUCT */}

                        <td>

                          <div className="user-cell">

                            <div className="user-avatar">
                              <i className="bi bi-box-seam" />
                            </div>

                            <div className="user-information">

                              <span className="user-name">
                                {product.name}
                              </span>

                              <span className="user-id">
                                ID #{product.id}
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* CATEGORY */}

                        <td>

                          <span className="user-type cliente">
                            {product.category}
                          </span>

                        </td>

                        {/* PRICE */}

                        <td>

                          <strong
                            style={{
                              color:
                                'var(--text-primary, #172033)',
                              fontSize:
                                '11px',
                              fontWeight:
                                600,
                            }}
                          >
                            {formatPrice(
                              product.price
                            )}
                          </strong>

                        </td>

                        {/* STOCK */}

                        <td>

                          <span
                            className={
                              product.stock ===
                              0
                                ? 'user-status danger'
                                : product.stock <=
                                  10
                                ? 'user-status warning'
                                : 'user-status success'
                            }
                          >

                            <span />

                            {product.stock ===
                            0
                              ? 'Sem estoque'
                              : `${product.stock} un.`}

                          </span>

                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={`user-status ${getStatusClass(
                              product.status
                            )}`}
                          >

                            <span />

                            {product.status}

                          </span>

                        </td>

                        {/* ACTIONS */}

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

                    )
                  )

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
                          Tente buscar por outro produto.
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
                {currentProducts.length}
              </strong>{' '}

              de{' '}

              <strong>
                {filteredProducts.length}
              </strong>{' '}

              produtos

            </span>

            <nav aria-label="Paginação de produtos">

              <ul className="pagination users-pagination">

                <li
                  className={`page-item ${
                    safeCurrentPage ===
                    1
                      ? 'disabled'
                      : ''
                  }`}
                >

                  <button
                    type="button"
                    className="page-link"
                    disabled={
                      safeCurrentPage ===
                      1
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
                    length:
                      totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map(
                  (page) => (

                    <li
                      key={page}
                      className={`page-item ${
                        page ===
                        safeCurrentPage
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

                  )
                )}

                <li
                  className={`page-item ${
                    safeCurrentPage ===
                    totalPages
                      ? 'disabled'
                      : ''
                  }`}
                >

                  <button
                    type="button"
                    className="page-link"
                    disabled={
                      safeCurrentPage ===
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
            className="users-modal"
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

            <form
              onSubmit={handleSubmit}
            >

              <div className="users-modal-body">

                {/* =================================================
                    IMAGE PLACEHOLDER
                ================================================= */}

                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '18px',
                    borderRadius: '12px',
                    background: '#eef4ff',
                    color:
                      'var(--primary-blue, #2563eb)',
                    fontSize: '22px',
                  }}
                >
                  <i className="bi bi-box-seam" />
                </div>

                <div className="user-form-grid">

                  {/* NAME */}

                  <div className="user-form-field">

                    <label htmlFor="product-name">
                      Produto
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-box-seam" />

                      <input
                        id="product-name"
                        name="name"
                        type="text"
                        value={
                          form.name
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Ex.: Essential Premium"
                        maxLength={100}
                        required
                      />

                    </div>

                  </div>

                  {/* CATEGORY */}

                  <div className="user-form-field">

                    <label htmlFor="product-category">
                      Categoria
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-grid" />

                      <select
                        id="product-category"
                        name="category"
                        value={
                          form.category
                        }
                        onChange={
                          handleFormChange
                        }
                      >

                        <option value="Camisetas">
                          Camisetas
                        </option>

                        <option value="Camisas">
                          Camisas
                        </option>

                        <option value="Calças">
                          Calças
                        </option>

                        <option value="Moletons">
                          Moletons
                        </option>

                        <option value="Acessórios">
                          Acessórios
                        </option>

                      </select>

                    </div>

                  </div>

                  {/* PRICE */}

                  <div className="user-form-field">

                    <label htmlFor="product-price">
                      Preço
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-currency-dollar" />

                      <input
                        id="product-price"
                        name="price"
                        type="number"
                        value={
                          form.price
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

                  {/* STOCK */}

                  <div className="user-form-field">

                    <label htmlFor="product-stock">
                      Estoque
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-boxes" />

                      <input
                        id="product-stock"
                        name="stock"
                        type="number"
                        value={
                          form.stock
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

                  {/* STATUS */}

                  <div className="user-form-field">

                    <label htmlFor="product-status">
                      Status
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-circle-half" />

                      <select
                        id="product-status"
                        name="status"
                        value={
                          form.status
                        }
                        onChange={
                          handleFormChange
                        }
                      >

                        <option value="Ativo">
                          Ativo
                        </option>

                        <option value="Inativo">
                          Inativo
                        </option>

                      </select>

                    </div>

                  </div>

                  {/* IMAGE */}

                  <div className="user-form-field">

                    <label htmlFor="product-image">
                      Imagem
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-image" />

                      <input
                        id="product-image"
                        name="image"
                        type="text"
                        value=""
                        placeholder="Adicionar imagem depois"
                        disabled
                        readOnly
                      />

                    </div>

                  </div>

                  {/* DESCRIPTION */}

                  <div className="user-form-field full">

                    <label htmlFor="product-description">
                      Descrição
                    </label>

                    <div className="user-input-wrapper textarea-wrapper">

                      <i className="bi bi-card-text" />

                      <textarea
                        id="product-description"
                        name="description"
                        value={
                          form.description
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Descreva este produto..."
                        rows={4}
                        maxLength={255}
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
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="users-modal-btn primary"
                >

                  <i
                    className={
                      modal === 'create'
                        ? 'bi bi-plus-lg'
                        : 'bi bi-check-lg'
                    }
                  />

                  {modal === 'create'
                    ? 'Criar produto'
                    : 'Salvar alterações'}

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
                  Excluir produto?
                </h2>

                <p>

                  Você está prestes a excluir o
                  produto{' '}

                  <strong>
                    {selectedProduct.name}
                  </strong>

                  . Essa ação não poderá ser
                  desfeita.

                </p>

              </div>

              <div className="users-modal-footer">

                <button
                  type="button"
                  className="users-modal-btn secondary"
                  onClick={closeModal}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="users-modal-btn danger"
                  onClick={handleDelete}
                >
                  <i className="bi bi-trash" />
                  Excluir produto
                </button>

              </div>

            </div>

          </div>

        )}

    </>
  );
}   