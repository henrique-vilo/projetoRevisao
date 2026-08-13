'use client';

import '../tables.css';

import { useMemo, useState } from 'react';

const initialModels = [
  {
    id: 1,
    name: 'Slim',
    description: 'Modelagem ajustada ao corpo.',
    status: 'Ativo',
  },
  {
    id: 2,
    name: 'Regular',
    description: 'Modelagem tradicional.',
    status: 'Ativo',
  },
  {
    id: 3,
    name: 'Oversized',
    description: 'Modelagem ampla e confortável.',
    status: 'Ativo',
  },
  {
    id: 4,
    name: 'Cropped',
    description: 'Modelo com comprimento reduzido.',
    status: 'Ativo',
  },
  {
    id: 5,
    name: 'Long',
    description: 'Modelo com comprimento alongado.',
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

export default function ModelosPage() {
  const [models, setModels] = useState(initialModels);

  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [modal, setModal] = useState(null);

  const [selectedModel, setSelectedModel] =
    useState(null);

  const [form, setForm] = useState(emptyForm);

  const modelsPerPage = 5;

  /*
   * =====================================================
   * FILTRO
   * =====================================================
   */

  const filteredModels = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return models;
    }

    return models.filter((model) =>
      [
        model.name,
        model.description,
        model.status,
      ].some((value) =>
        value.toLowerCase().includes(term)
      )
    );
  }, [models, search]);

  /*
   * =====================================================
   * PAGINAÇÃO
   * =====================================================
   */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredModels.length / modelsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * modelsPerPage;

  const currentModels = filteredModels.slice(
    startIndex,
    startIndex + modelsPerPage
  );

  /*
   * =====================================================
   * MODAIS
   * =====================================================
   */

  const closeModal = () => {
    setModal(null);
    setSelectedModel(null);
    setForm(emptyForm);
  };

  const openCreateModal = () => {
    setSelectedModel(null);
    setForm(emptyForm);
    setModal('create');
  };

  const openEditModal = (model) => {
    setSelectedModel(model);

    setForm({
      name: model.name,
      description: model.description,
      status: model.status,
    });

    setModal('edit');
  };

  const openDeleteModal = (model) => {
    setSelectedModel(model);
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

    /*
     * CREATE
     */

    if (modal === 'create') {
      const newModel = {
        id:
          Math.max(
            ...models.map(
              (model) => model.id
            ),
            0
          ) + 1,

        name,

        description,

        status: form.status,
      };

      setModels((previous) => [
        ...previous,
        newModel,
      ]);

      setCurrentPage(1);
    }

    /*
     * EDIT
     */

    if (
      modal === 'edit' &&
      selectedModel
    ) {
      setModels((previous) =>
        previous.map((model) =>
          model.id === selectedModel.id
            ? {
                ...model,
                name,
                description,
                status: form.status,
              }
            : model
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
    if (!selectedModel) {
      return;
    }

    setModels((previous) =>
      previous.filter(
        (model) =>
          model.id !== selectedModel.id
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
              Modelos
            </h1>

            <p>
              Gerencie os modelos disponíveis no catálogo.
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
              Novo modelo
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
                Modelos cadastrados
              </h2>

            </div>

            <div className="users-card-header-right">

              <div className="users-search">

                <i className="bi bi-search" />

                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Buscar modelo..."
                  aria-label="Buscar modelo"
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
                  <th>Modelo</th>
                  <th>Descrição</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>

              </thead>

              <tbody>

                {currentModels.length > 0 ? (

                  currentModels.map((model) => (

                    <tr key={model.id}>

                      {/* MODEL */}

                      <td>

                        <div className="user-cell">

                          <div className="user-avatar">
                            <i className="bi bi-box-seam" />
                          </div>

                          <div className="user-information">

                            <span className="user-name">
                              {model.name}
                            </span>

                            <span className="user-id">
                              ID #{model.id}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* DESCRIPTION */}

                      <td>

                        <span className="table-muted">
                          {model.description ||
                            'Sem descrição'}
                        </span>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`user-status ${getStatusClass(
                            model.status
                          )}`}
                        >

                          <span />

                          {model.status}

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
                                model
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
                                model
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
                          <i className="bi bi-box-seam" />
                        </div>

                        <strong>
                          Nenhum modelo encontrado
                        </strong>

                        <span>
                          Tente buscar por outro modelo.
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
                {currentModels.length}
              </strong>{' '}
              de{' '}
              <strong>
                {filteredModels.length}
              </strong>{' '}
              modelos
            </span>

            <nav aria-label="Paginação de modelos">

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
            aria-labelledby="model-modal-title"
          >

            <div className="users-modal-header">

              <div>

                <span className="users-modal-label">
                  {modal === 'create'
                    ? 'Novo modelo'
                    : 'Gerenciamento'}
                </span>

                <h2 id="model-modal-title">
                  {modal === 'create'
                    ? 'Criar modelo'
                    : 'Editar modelo'}
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
                  <i className="bi bi-box-seam" />
                </div>

                <div className="user-form-grid">

                  {/* NAME */}

                  <div className="user-form-field">

                    <label htmlFor="model-name">
                      Modelo
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-box-seam" />

                      <input
                        id="model-name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={
                          handleFormChange
                        }
                        placeholder="Ex.: Slim"
                        maxLength={80}
                        required
                      />

                    </div>

                  </div>

                  {/* STATUS */}

                  <div className="user-form-field">

                    <label htmlFor="model-status">
                      Status
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-circle-half" />

                      <select
                        id="model-status"
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

                    <label htmlFor="model-description">
                      Descrição
                    </label>

                    <div className="user-input-wrapper textarea-wrapper">

                      <i className="bi bi-card-text" />

                      <textarea
                        id="model-description"
                        name="description"
                        value={
                          form.description
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Descreva este modelo..."
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
                    ? 'Criar modelo'
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
        selectedModel && (

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
              aria-labelledby="delete-model-title"
            >

              <div className="users-delete-content">

                <div className="users-delete-icon">
                  <i className="bi bi-trash3" />
                </div>

                <span className="users-modal-label">
                  Atenção
                </span>

                <h2 id="delete-model-title">
                  Excluir modelo?
                </h2>

                <p>
                  Você está prestes a excluir o
                  modelo{' '}
                  <strong>
                    {selectedModel.name}
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
                  Excluir modelo
                </button>

              </div>

            </div>

          </div>

        )}

    </>
  );
}