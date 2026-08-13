'use client';

import '../tables.css';

import { useMemo, useState } from 'react';

const initialSizes = [
  {
    id: 1,
    name: 'PP',
    description: 'Extra pequeno',
    status: 'Ativo',
  },
  {
    id: 2,
    name: 'P',
    description: 'Pequeno',
    status: 'Ativo',
  },
  {
    id: 3,
    name: 'M',
    description: 'Médio',
    status: 'Ativo',
  },
  {
    id: 4,
    name: 'G',
    description: 'Grande',
    status: 'Ativo',
  },
  {
    id: 5,
    name: 'GG',
    description: 'Extra grande',
    status: 'Ativo',
  },
  {
    id: 6,
    name: 'XGG',
    description: 'Extra extra grande',
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

export default function TamanhosPage() {
  const [sizes, setSizes] = useState(initialSizes);

  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [modal, setModal] = useState(null);

  const [selectedSize, setSelectedSize] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const sizesPerPage = 5;

  /*
   * =====================================================
   * FILTRO
   * =====================================================
   */

  const filteredSizes = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return sizes;
    }

    return sizes.filter((size) =>
      [
        size.name,
        size.description,
        size.status,
      ].some((value) =>
        value.toLowerCase().includes(term)
      )
    );
  }, [sizes, search]);

  /*
   * =====================================================
   * PAGINAÇÃO
   * =====================================================
   */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredSizes.length / sizesPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * sizesPerPage;

  const currentSizes = filteredSizes.slice(
    startIndex,
    startIndex + sizesPerPage
  );

  /*
   * =====================================================
   * MODAIS
   * =====================================================
   */

  const closeModal = () => {
    setModal(null);
    setSelectedSize(null);
    setForm(emptyForm);
  };

  const openCreateModal = () => {
    setSelectedSize(null);
    setForm(emptyForm);
    setModal('create');
  };

  const openEditModal = (size) => {
    setSelectedSize(size);

    setForm({
      name: size.name,
      description: size.description,
      status: size.status,
    });

    setModal('edit');
  };

  const openDeleteModal = (size) => {
    setSelectedSize(size);
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

    if (!name) {
      return;
    }

    /*
     * CREATE
     */

    if (modal === 'create') {
      const newSize = {
        id:
          Math.max(
            ...sizes.map(
              (size) => size.id
            ),
            0
          ) + 1,

        name,

        description,

        status: form.status,
      };

      setSizes((previous) => [
        ...previous,
        newSize,
      ]);

      setCurrentPage(1);
    }

    /*
     * EDIT
     */

    if (
      modal === 'edit' &&
      selectedSize
    ) {
      setSizes((previous) =>
        previous.map((size) =>
          size.id === selectedSize.id
            ? {
                ...size,
                name,
                description,
                status: form.status,
              }
            : size
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
    if (!selectedSize) {
      return;
    }

    setSizes((previous) =>
      previous.filter(
        (size) =>
          size.id !== selectedSize.id
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
              Tamanhos
            </h1>

            <p>
              Gerencie os tamanhos disponíveis no catálogo.
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
              Novo tamanho
            </button>

          </div>

        </section>

        {/* =================================================
            TABLE CARD
        ================================================= */}

        <section className="users-card">

          {/* HEADER */}

          <div className="users-card-header">

            <div>

              <span className="users-card-label">
                Gerenciamento
              </span>

              <h2>
                Tamanhos cadastrados
              </h2>

            </div>

            <div className="users-card-header-right">

              <div className="users-search">

                <i className="bi bi-search" />

                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Buscar tamanho..."
                  aria-label="Buscar tamanho"
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
                  <th>Tamanho</th>
                  <th>Descrição</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>

              </thead>

              <tbody>

                {currentSizes.length > 0 ? (

                  currentSizes.map((size) => (

                    <tr key={size.id}>

                      {/* NAME */}

                      <td>

                        <div className="user-cell">

                          <div className="user-avatar">
                            {size.name
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <div className="user-information">

                            <span className="user-name">
                              {size.name}
                            </span>

                            <span className="user-id">
                              ID #{size.id}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* DESCRIPTION */}

                      <td>

                        <span className="table-muted">
                          {size.description ||
                            'Sem descrição'}
                        </span>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`user-status ${getStatusClass(
                            size.status
                          )}`}
                        >

                          <span />

                          {size.status}

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
                                size
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
                                size
                              )
                            }
                          >
                            <i className="bi bi-trash" />
                            Excluir
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="4"
                      className="users-empty"
                    >

                      <div className="users-empty-content">

                        <div className="users-empty-icon">
                          <i className="bi bi-rulers" />
                        </div>

                        <strong>
                          Nenhum tamanho encontrado
                        </strong>

                        <span>
                          Tente buscar por outro tamanho.
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
                {currentSizes.length}
              </strong>{' '}
              de{' '}
              <strong>
                {filteredSizes.length}
              </strong>{' '}
              tamanhos
            </span>

            <nav aria-label="Paginação de tamanhos">

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
            aria-labelledby="size-modal-title"
          >

            <div className="users-modal-header">

              <div>

                <span className="users-modal-label">
                  {modal === 'create'
                    ? 'Novo tamanho'
                    : 'Gerenciamento'}
                </span>

                <h2 id="size-modal-title">
                  {modal === 'create'
                    ? 'Criar tamanho'
                    : 'Editar tamanho'}
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
                  <i className="bi bi-rulers" />
                </div>

                <div className="user-form-grid">

                  {/* NAME */}

                  <div className="user-form-field">

                    <label htmlFor="size-name">
                      Tamanho
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-rulers" />

                      <input
                        id="size-name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={
                          handleFormChange
                        }
                        placeholder="Ex.: M"
                        maxLength={20}
                        required
                      />

                    </div>

                  </div>

                  {/* STATUS */}

                  <div className="user-form-field">

                    <label htmlFor="size-status">
                      Status
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-circle-half" />

                      <select
                        id="size-status"
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

                    <label htmlFor="size-description">
                      Descrição
                    </label>

                    <div className="user-input-wrapper textarea-wrapper">

                      <i className="bi bi-card-text" />

                      <textarea
                        id="size-description"
                        name="description"
                        value={
                          form.description
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Descreva este tamanho..."
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
                    ? 'Criar tamanho'
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
        selectedSize && (

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
              aria-labelledby="delete-size-title"
            >

              <div className="users-delete-content">

                <div className="users-delete-icon">
                  <i className="bi bi-trash3" />
                </div>

                <span className="users-modal-label">
                  Atenção
                </span>

                <h2 id="delete-size-title">
                  Excluir tamanho?
                </h2>

                <p>
                  Você está prestes a excluir o
                  tamanho{' '}
                  <strong>
                    {selectedSize.name}
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
                  Excluir tamanho
                </button>

              </div>

            </div>

          </div>

        )}

    </>
  );
}