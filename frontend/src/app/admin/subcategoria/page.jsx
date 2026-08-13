'use client';

import '../tables.css';

import { useMemo, useState } from 'react';

const initialSubcategories = [
  {
    id: 1,
    name: 'Camiseta Básica',
    category: 'Camisetas',
    description: 'Camisetas básicas para uso diário.',
    status: 'Ativo',
  },
  {
    id: 2,
    name: 'Camiseta Estampada',
    category: 'Camisetas',
    description: 'Camisetas com estampas variadas.',
    status: 'Ativo',
  },
  {
    id: 3,
    name: 'Jeans',
    category: 'Calças',
    description: 'Calças confeccionadas em denim.',
    status: 'Ativo',
  },
  {
    id: 4,
    name: 'Cargo',
    category: 'Calças',
    description: 'Calças com bolsos laterais.',
    status: 'Ativo',
  },
  {
    id: 5,
    name: 'Jaqueta Jeans',
    category: 'Jaquetas',
    description: 'Jaquetas confeccionadas em denim.',
    status: 'Inativo',
  },
];

const categories = [
  'Camisetas',
  'Calças',
  'Jaquetas',
  'Vestidos',
  'Acessórios',
];

const emptyForm = {
  name: '',
  category: '',
  description: '',
  status: 'Ativo',
};

function getStatusClass(status) {
  return status === 'Ativo' ? 'success' : 'danger';
}

export default function SubcategoriasPage() {
  const [subcategories, setSubcategories] = useState(
    initialSubcategories
  );

  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [modal, setModal] = useState(null);

  const [selectedSubcategory, setSelectedSubcategory] =
    useState(null);

  const [form, setForm] = useState(emptyForm);

  const subcategoriesPerPage = 5;

  /*
   * =====================================================
   * FILTRO
   * =====================================================
   */

  const filteredSubcategories = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return subcategories;
    }

    return subcategories.filter((subcategory) =>
      [
        subcategory.name,
        subcategory.category,
        subcategory.description,
        subcategory.status,
      ].some((value) =>
        value.toLowerCase().includes(term)
      )
    );
  }, [subcategories, search]);

  /*
   * =====================================================
   * PAGINAÇÃO
   * =====================================================
   */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredSubcategories.length /
        subcategoriesPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) *
    subcategoriesPerPage;

  const currentSubcategories =
    filteredSubcategories.slice(
      startIndex,
      startIndex + subcategoriesPerPage
    );

  /*
   * =====================================================
   * MODAIS
   * =====================================================
   */

  const closeModal = () => {
    setModal(null);
    setSelectedSubcategory(null);
    setForm(emptyForm);
  };

  const openCreateModal = () => {
    setSelectedSubcategory(null);

    setForm({
      ...emptyForm,
      category: categories[0],
    });

    setModal('create');
  };

  const openEditModal = (subcategory) => {
    setSelectedSubcategory(subcategory);

    setForm({
      name: subcategory.name,
      category: subcategory.category,
      description: subcategory.description,
      status: subcategory.status,
    });

    setModal('edit');
  };

  const openDeleteModal = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setModal('delete');
  };

  /*
   * =====================================================
   * FORM
   * =====================================================
   */

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * =====================================================
   * CRIAR / EDITAR
   * =====================================================
   */

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name || !form.category) {
      return;
    }

    /*
     * CREATE
     */

    if (modal === 'create') {
      const newSubcategory = {
        id:
          Math.max(
            ...subcategories.map(
              (subcategory) => subcategory.id
            ),
            0
          ) + 1,

        name,

        category: form.category,

        description,

        status: form.status,
      };

      setSubcategories((previous) => [
        ...previous,
        newSubcategory,
      ]);

      setCurrentPage(1);
    }

    /*
     * EDIT
     */

    if (
      modal === 'edit' &&
      selectedSubcategory
    ) {
      setSubcategories((previous) =>
        previous.map((subcategory) =>
          subcategory.id ===
          selectedSubcategory.id
            ? {
                ...subcategory,
                name,
                category: form.category,
                description,
                status: form.status,
              }
            : subcategory
        )
      );
    }

    closeModal();
  };

  /*
   * =====================================================
   * EXCLUIR
   * =====================================================
   */

  const handleDelete = () => {
    if (!selectedSubcategory) {
      return;
    }

    setSubcategories((previous) =>
      previous.filter(
        (subcategory) =>
          subcategory.id !==
          selectedSubcategory.id
      )
    );

    closeModal();
  };

  /*
   * =====================================================
   * BUSCA
   * =====================================================
   */

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  /*
   * =====================================================
   * PAGE
   * =====================================================
   */

  return (
    <>
      <main className="users-page">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section className="users-heading">

          <div>

            <span className="users-eyebrow">
              Catálogo
            </span>

            <h1>
              Subcategorias
            </h1>

            <p>
              Gerencie as subcategorias disponíveis
              no catálogo.
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
              Nova subcategoria
            </button>

          </div>

        </section>

        {/* =================================================
            TABLE CARD
        ================================================= */}

        <section className="users-card">

          <div className="users-card-header">

            <div>

              <span className="users-card-label">
                Gerenciamento
              </span>

              <h2>
                Subcategorias cadastradas
              </h2>

            </div>

            <div className="users-card-header-right">

              <div className="users-search">

                <i className="bi bi-search" />

                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Buscar subcategoria..."
                  aria-label="Buscar subcategoria"
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
                  <th>Subcategoria</th>
                  <th>Categoria</th>
                  <th>Descrição</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>

              </thead>

              <tbody>

                {currentSubcategories.length > 0 ? (

                  currentSubcategories.map(
                    (subcategory) => (

                      <tr key={subcategory.id}>

                        {/* SUBCATEGORY */}

                        <td>

                          <div className="user-cell">

                            <div className="user-avatar">
                              <i className="bi bi-diagram-3" />
                            </div>

                            <div className="user-information">

                              <span className="user-name">
                                {subcategory.name}
                              </span>

                              <span className="user-id">
                                ID #{subcategory.id}
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* CATEGORY */}

                        <td>

                          <span className="user-role">
                            {subcategory.category}
                          </span>

                        </td>

                        {/* DESCRIPTION */}

                        <td>

                          <span className="table-muted">
                            {subcategory.description ||
                              'Sem descrição'}
                          </span>

                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={`user-status ${getStatusClass(
                              subcategory.status
                            )}`}
                          >

                            <span />

                            {subcategory.status}

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
                                  subcategory
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
                                  subcategory
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
                      colSpan="5"
                      className="users-empty"
                    >

                      <div className="users-empty-content">

                        <div className="users-empty-icon">
                          <i className="bi bi-diagram-3" />
                        </div>

                        <strong>
                          Nenhuma subcategoria encontrada
                        </strong>

                        <span>
                          Tente buscar por outra
                          subcategoria.
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
                {currentSubcategories.length}
              </strong>{' '}
              de{' '}
              <strong>
                {filteredSubcategories.length}
              </strong>{' '}
              subcategorias
            </span>

            <nav aria-label="Paginação de subcategorias">

              <ul className="pagination users-pagination">

                <li
                  className={`page-item ${
                    safeCurrentPage === 1
                      ? 'disabled'
                      : ''
                  }`}
                >

                  <button
                    type="button"
                    className="page-link"
                    disabled={
                      safeCurrentPage === 1
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
                        setCurrentPage(page)
                      }
                    >
                      {page}
                    </button>

                  </li>

                ))}

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
            aria-labelledby="subcategory-modal-title"
          >

            <div className="users-modal-header">

              <div>

                <span className="users-modal-label">
                  {modal === 'create'
                    ? 'Nova subcategoria'
                    : 'Gerenciamento'}
                </span>

                <h2 id="subcategory-modal-title">
                  {modal === 'create'
                    ? 'Criar subcategoria'
                    : 'Editar subcategoria'}
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

                <div className="order-modal-icon">
                  <i className="bi bi-diagram-3" />
                </div>

                <div className="user-form-grid">

                  {/* NAME */}

                  <div className="user-form-field">

                    <label htmlFor="subcategory-name">
                      Subcategoria
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-diagram-3" />

                      <input
                        id="subcategory-name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={
                          handleFormChange
                        }
                        placeholder="Ex.: Camiseta Básica"
                        maxLength={80}
                        required
                      />

                    </div>

                  </div>

                  {/* CATEGORY */}

                  <div className="user-form-field">

                    <label htmlFor="subcategory-category">
                      Categoria
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-grid" />

                      <select
                        id="subcategory-category"
                        name="category"
                        value={
                          form.category
                        }
                        onChange={
                          handleFormChange
                        }
                        required
                      >

                        <option value="">
                          Selecione uma categoria
                        </option>

                        {categories.map(
                          (category) => (

                            <option
                              key={category}
                              value={category}
                            >
                              {category}
                            </option>

                          )
                        )}

                      </select>

                    </div>

                  </div>

                  {/* STATUS */}

                  <div className="user-form-field">

                    <label htmlFor="subcategory-status">
                      Status
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-circle-half" />

                      <select
                        id="subcategory-status"
                        name="status"
                        value={form.status}
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

                  {/* DESCRIPTION */}

                  <div className="user-form-field full">

                    <label htmlFor="subcategory-description">
                      Descrição
                    </label>

                    <div className="user-input-wrapper textarea-wrapper">

                      <i className="bi bi-card-text" />

                      <textarea
                        id="subcategory-description"
                        name="description"
                        value={
                          form.description
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Descreva esta subcategoria..."
                        rows={4}
                        maxLength={255}
                      />

                    </div>

                  </div>

                </div>

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
                    ? 'Criar subcategoria'
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
        selectedSubcategory && (

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
              aria-labelledby="delete-subcategory-title"
            >

              <div className="users-delete-content">

                <div className="users-delete-icon">
                  <i className="bi bi-trash3" />
                </div>

                <span className="users-modal-label">
                  Atenção
                </span>

                <h2 id="delete-subcategory-title">
                  Excluir subcategoria?
                </h2>

                <p>
                  Você está prestes a excluir a
                  subcategoria{' '}
                  <strong>
                    {selectedSubcategory.name}
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
                  Excluir subcategoria
                </button>

              </div>

            </div>

          </div>

        )}

    </>
  );
}