'use client';

import '../tables.css';

import { useMemo, useState } from 'react';

const initialCategories = [
  {
    id: 1,
    name: 'Camisetas',
    description: 'Camisetas e peças similares.',
    status: 'Ativo',
  },
  {
    id: 2,
    name: 'Calças',
    description: 'Calças, jeans e peças inferiores.',
    status: 'Ativo',
  },
  {
    id: 3,
    name: 'Jaquetas',
    description: 'Jaquetas e peças para sobreposição.',
    status: 'Ativo',
  },
  {
    id: 4,
    name: 'Vestidos',
    description: 'Vestidos casuais e sociais.',
    status: 'Ativo',
  },
  {
    id: 5,
    name: 'Acessórios',
    description: 'Bolsas, bonés e outros acessórios.',
    status: 'Inativo',
  },
];

const emptyForm = {
  name: '',
  description: '',
  status: 'Ativo',
};

function getStatusClass(status) {
  return status === 'Ativo' ? 'success' : 'danger';
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState(
    initialCategories
  );

  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [modal, setModal] = useState(null);

  const [selectedCategory, setSelectedCategory] =
    useState(null);

  const [form, setForm] = useState(emptyForm);

  const categoriesPerPage = 5;

  /*
   * =====================================================
   * FILTRO
   * =====================================================
   */

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return categories;
    }

    return categories.filter((category) =>
      [
        category.name,
        category.description,
        category.status,
      ].some((value) =>
        value.toLowerCase().includes(term)
      )
    );
  }, [categories, search]);

  /*
   * =====================================================
   * PAGINAÇÃO
   * =====================================================
   */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredCategories.length /
        categoriesPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) *
    categoriesPerPage;

  const currentCategories =
    filteredCategories.slice(
      startIndex,
      startIndex + categoriesPerPage
    );

  /*
   * =====================================================
   * MODAIS
   * =====================================================
   */

  const closeModal = () => {
    setModal(null);
    setSelectedCategory(null);
    setForm(emptyForm);
  };

  const openCreateModal = () => {
    setSelectedCategory(null);
    setForm(emptyForm);
    setModal('create');
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);

    setForm({
      name: category.name,
      description: category.description,
      status: category.status,
    });

    setModal('edit');
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
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
    const description =
      form.description.trim();

    if (!name) {
      return;
    }

    if (modal === 'create') {
      const newCategory = {
        id:
          Math.max(
            ...categories.map(
              (category) => category.id
            ),
            0
          ) + 1,

        name,

        description,

        status: form.status,
      };

      setCategories((previous) => [
        ...previous,
        newCategory,
      ]);

      setCurrentPage(1);
    }

    if (
      modal === 'edit' &&
      selectedCategory
    ) {
      setCategories((previous) =>
        previous.map((category) =>
          category.id ===
          selectedCategory.id
            ? {
                ...category,
                name,
                description,
                status: form.status,
              }
            : category
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
    if (!selectedCategory) {
      return;
    }

    setCategories((previous) =>
      previous.filter(
        (category) =>
          category.id !==
          selectedCategory.id
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
              Categorias
            </h1>

            <p>
              Gerencie as categorias disponíveis
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
              Nova categoria
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
                Categorias cadastradas
              </h2>

            </div>

            <div className="users-card-header-right">

              <div className="users-search">

                <i className="bi bi-search" />

                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Buscar categoria..."
                  aria-label="Buscar categoria"
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
                  <th>Categoria</th>
                  <th>Descrição</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>

              </thead>

              <tbody>

                {currentCategories.length > 0 ? (

                  currentCategories.map(
                    (category) => (

                      <tr key={category.id}>

                        {/* CATEGORY */}

                        <td>

                          <div className="user-cell">

                            <div className="user-avatar">
                              <i className="bi bi-grid" />
                            </div>

                            <div className="user-information">

                              <span className="user-name">
                                {category.name}
                              </span>

                              <span className="user-id">
                                ID #{category.id}
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* DESCRIPTION */}

                        <td>

                          <span className="table-muted">
                            {category.description ||
                              'Sem descrição'}
                          </span>

                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={`user-status ${getStatusClass(
                              category.status
                            )}`}
                          >

                            <span />

                            {category.status}

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
                                  category
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
                                  category
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
                      colSpan="4"
                      className="users-empty"
                    >

                      <div className="users-empty-content">

                        <div className="users-empty-icon">
                          <i className="bi bi-grid" />
                        </div>

                        <strong>
                          Nenhuma categoria encontrada
                        </strong>

                        <span>
                          Tente buscar por outra
                          categoria.
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
                {currentCategories.length}
              </strong>{' '}
              de{' '}
              <strong>
                {filteredCategories.length}
              </strong>{' '}
              categorias
            </span>

            <nav aria-label="Paginação de categorias">

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
            aria-labelledby="category-modal-title"
          >

            <div className="users-modal-header">

              <div>

                <span className="users-modal-label">
                  {modal === 'create'
                    ? 'Nova categoria'
                    : 'Gerenciamento'}
                </span>

                <h2 id="category-modal-title">
                  {modal === 'create'
                    ? 'Criar categoria'
                    : 'Editar categoria'}
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
                  <i className="bi bi-grid" />
                </div>

                <div className="user-form-grid">

                  {/* NAME */}

                  <div className="user-form-field">

                    <label htmlFor="category-name">
                      Categoria
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-grid" />

                      <input
                        id="category-name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={
                          handleFormChange
                        }
                        placeholder="Ex.: Camisetas"
                        maxLength={80}
                        required
                      />

                    </div>

                  </div>

                  {/* STATUS */}

                  <div className="user-form-field">

                    <label htmlFor="category-status">
                      Status
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-circle-half" />

                      <select
                        id="category-status"
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

                    <label htmlFor="category-description">
                      Descrição
                    </label>

                    <div className="user-input-wrapper textarea-wrapper">

                      <i className="bi bi-card-text" />

                      <textarea
                        id="category-description"
                        name="description"
                        value={
                          form.description
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Descreva esta categoria..."
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
                    ? 'Criar categoria'
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
        selectedCategory && (

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
              aria-labelledby="delete-category-title"
            >

              <div className="users-delete-content">

                <div className="users-delete-icon">
                  <i className="bi bi-trash3" />
                </div>

                <span className="users-modal-label">
                  Atenção
                </span>

                <h2 id="delete-category-title">
                  Excluir categoria?
                </h2>

                <p>
                  Você está prestes a excluir a
                  categoria{' '}
                  <strong>
                    {selectedCategory.name}
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
                  Excluir categoria
                </button>

              </div>

            </div>

          </div>

        )}

    </>
  );
}