'use client';

import '../tables.css';

import { useCallback, useEffect, useMemo, useState } from 'react';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '');

const CATEGORIAS_ENDPOINT = `${API_URL}/api/categorias`;

const emptyForm = {
  nomeCategoria: '',
};

export default function CategoriasPage() {
  /*
   * =====================================================
   * STATES
   * =====================================================
   */

  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [modal, setModal] = useState(null);

  const [selectedCategory, setSelectedCategory] =
    useState(null);

  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState('');

  const [successMessage, setSuccessMessage] =
    useState('');

  const categoriesPerPage = 5;

  /*
   * =====================================================
   * TOKEN
   * =====================================================
   */

  const getToken = () => {
    if (typeof window === 'undefined') {
      return null;
    }

    return (
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('jwt')
    );
  };

  /*
   * =====================================================
   * HEADERS
   * =====================================================
   */

  const getAuthHeaders = () => {
    const token = getToken();

    return {
      'Content-Type': 'application/json',
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  /*
   * =====================================================
   * TRATAMENTO DE ERROS
   * =====================================================
   */

  const getApiErrorMessage = async (response) => {
    try {
      const data = await response.json();

      return (
        data?.mensagem ||
        data?.erro ||
        'Ocorreu um erro ao processar a solicitação.'
      );
    } catch {
      return 'Ocorreu um erro ao processar a solicitação.';
    }
  };

  /*
   * =====================================================
   * CARREGAR CATEGORIAS
   * =====================================================
   */

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      /*
       * O controller recebe:
       *
       * ?pagina=1&limite=100
       *
       * Como o backend não possui busca por nome
       * exposta no controller, carregamos as categorias
       * e fazemos o filtro localmente.
       */

      const response = await fetch(
        `${CATEGORIAS_ENDPOINT}?pagina=1&limite=100`,
        {
          method: 'GET',
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        const message =
          await getApiErrorMessage(response);

        throw new Error(message);
      }

      const data = await response.json();

      if (!data?.sucesso) {
        throw new Error(
          data?.mensagem ||
            'Não foi possível carregar as categorias.'
        );
      }

      setCategories(
        Array.isArray(data.dados) ? data.dados : []
      );
    } catch (requestError) {
      console.error(
        'Erro ao carregar categorias:',
        requestError
      );

      setError(
        requestError.message ||
          'Não foi possível carregar as categorias.'
      );

      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * =====================================================
   * INITIAL LOAD
   * =====================================================
   */

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

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
      String(category.nomeCategoria || '')
        .toLowerCase()
        .includes(term)
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
      filteredCategories.length / categoriesPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * categoriesPerPage;

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
    setError('');
    setModal('create');
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);

    setForm({
      nomeCategoria: category.nomeCategoria || '',
    });

    setError('');
    setModal('edit');
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setError('');
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nomeCategoria =
      form.nomeCategoria.trim();

    if (!nomeCategoria) {
      setError(
        'O nome da categoria é obrigatório.'
      );

      return;
    }

    if (
      nomeCategoria.length < 2 ||
      nomeCategoria.length > 255
    ) {
      setError(
        'O nome da categoria deve ter entre 2 e 255 caracteres.'
      );

      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        'É necessário estar autenticado para realizar esta operação.'
      );

      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      /*
       * =================================================
       * CREATE
       * POST /api/categorias
       * =================================================
       */

      if (modal === 'create') {
        const response = await fetch(
          CATEGORIAS_ENDPOINT,
          {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              nomeCategoria,
            }),
          }
        );

        if (!response.ok) {
          const message =
            await getApiErrorMessage(response);

          throw new Error(message);
        }

        const data = await response.json();

        if (!data?.sucesso) {
          throw new Error(
            data?.mensagem ||
              'Não foi possível criar a categoria.'
          );
        }

        closeModal();

        setSearch('');
        setCurrentPage(1);

        setSuccessMessage(
          'Categoria criada com sucesso.'
        );

        await loadCategories();

        return;
      }

      /*
       * =================================================
       * EDIT
       * PUT /api/categorias/:id
       * =================================================
       */

      if (
        modal === 'edit' &&
        selectedCategory
      ) {
        const response = await fetch(
          `${CATEGORIAS_ENDPOINT}/${selectedCategory.idCategoria}`,
          {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              nomeCategoria,
            }),
          }
        );

        if (!response.ok) {
          const message =
            await getApiErrorMessage(response);

          throw new Error(message);
        }

        const data = await response.json();

        if (!data?.sucesso) {
          throw new Error(
            data?.mensagem ||
              'Não foi possível atualizar a categoria.'
          );
        }

        closeModal();

        setSuccessMessage(
          'Categoria atualizada com sucesso.'
        );

        await loadCategories();
      }
    } catch (requestError) {
      console.error(
        'Erro ao salvar categoria:',
        requestError
      );

      setError(
        requestError.message ||
          'Não foi possível salvar a categoria.'
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * =====================================================
   * EXCLUIR
   * =====================================================
   */

  const handleDelete = async () => {
    if (!selectedCategory) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        'É necessário estar autenticado para excluir uma categoria.'
      );

      return;
    }

    try {
      setDeleting(true);
      setError('');
      setSuccessMessage('');

      const response = await fetch(
        `${CATEGORIAS_ENDPOINT}/${selectedCategory.idCategoria}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const message =
          await getApiErrorMessage(response);

        throw new Error(message);
      }

      const data = await response.json();

      if (!data?.sucesso) {
        throw new Error(
          data?.mensagem ||
            'Não foi possível excluir a categoria.'
        );
      }

      closeModal();

      setSuccessMessage(
        'Categoria excluída com sucesso.'
      );

      /*
       * Se a exclusão deixar a página atual
       * sem registros, voltamos para a anterior.
       */

      setCurrentPage((page) =>
        page > 1 &&
        currentCategories.length === 1
          ? page - 1
          : page
      );

      await loadCategories();
    } catch (requestError) {
      console.error(
        'Erro ao excluir categoria:',
        requestError
      );

      setError(
        requestError.message ||
          'Não foi possível excluir a categoria.'
      );
    } finally {
      setDeleting(false);
    }
  };

  /*
   * =====================================================
   * BUSCA
   * =====================================================
   */

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
    setError('');
  };

  /*
   * =====================================================
   * ATUALIZAR
   * =====================================================
   */

  const handleRefresh = async () => {
    setSearch('');
    setCurrentPage(1);
    setError('');
    setSuccessMessage('');

    await loadCategories();
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

            <h1>Categorias</h1>

            <p>
              Gerencie as categorias disponíveis
              no catálogo.
            </p>
          </div>

          <div className="users-heading-actions">
            <button
              type="button"
              className="users-btn users-btn-secondary"
              onClick={handleRefresh}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise" />

              {loading
                ? 'Atualizando...'
                : 'Atualizar'}
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
            ALERTS
        ================================================= */}

        {error && (
          <div
            className="alert alert-danger d-flex align-items-center gap-2 mb-3"
            role="alert"
          >
            <i className="bi bi-exclamation-triangle-fill" />

            <span>{error}</span>

            <button
              type="button"
              className="btn-close ms-auto"
              aria-label="Fechar"
              onClick={() => setError('')}
            />
          </div>
        )}

        {successMessage && (
          <div
            className="alert alert-success d-flex align-items-center gap-2 mb-3"
            role="alert"
          >
            <i className="bi bi-check-circle-fill" />

            <span>{successMessage}</span>

            <button
              type="button"
              className="btn-close ms-auto"
              aria-label="Fechar"
              onClick={() =>
                setSuccessMessage('')
              }
            />
          </div>
        )}

        {/* =================================================
            TABLE CARD
        ================================================= */}

        <section className="users-card">
          <div className="users-card-header">
            <div>
              <span className="users-card-label">
                Gerenciamento
              </span>

              <h2>Categorias cadastradas</h2>
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
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="2"
                      className="users-empty"
                    >
                      <div className="users-empty-content">
                        <div className="users-empty-icon">
                          <i className="bi bi-arrow-repeat" />
                        </div>

                        <strong>
                          Carregando categorias...
                        </strong>

                        <span>
                          Aguarde enquanto buscamos os
                          dados.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : currentCategories.length > 0 ? (
                  currentCategories.map(
                    (category) => (
                      <tr
                        key={
                          category.idCategoria
                        }
                      >
                        {/* CATEGORY */}

                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">
                              <i className="bi bi-grid" />
                            </div>

                            <div className="user-information">
                              <span className="user-name">
                                {
                                  category.nomeCategoria
                                }
                              </span>

                              <span className="user-id">
                                ID #
                                {
                                  category.idCategoria
                                }
                              </span>
                            </div>
                          </div>
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
                      colSpan="2"
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
                          {search
                            ? 'Tente buscar por outra categoria.'
                            : 'Ainda não existem categorias cadastradas.'}
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

            <nav
              aria-label="Paginação de categorias"
            >
              <ul className="pagination users-pagination">
                {/* PREVIOUS */}

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

                {/* PAGES */}

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) => index + 1
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

                {/* NEXT */}

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
            {/* HEADER */}

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
                disabled={saving}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>
              <div className="users-modal-body">
                <div className="order-modal-icon">
                  <i className="bi bi-grid" />
                </div>

                <div className="user-form-grid">
                  {/* NAME */}

                  <div className="user-form-field full">
                    <label htmlFor="category-name">
                      Categoria
                    </label>

                    <div className="user-input-wrapper">
                      <i className="bi bi-grid" />

                      <input
                        id="category-name"
                        name="nomeCategoria"
                        type="text"
                        value={
                          form.nomeCategoria
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Ex.: Camisetas"
                        maxLength={255}
                        required
                        autoFocus
                        disabled={saving}
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
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="users-modal-btn primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        aria-hidden="true"
                      />

                      {modal === 'create'
                        ? 'Criando...'
                        : 'Salvando...'}
                    </>
                  ) : (
                    <>
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
                    {
                      selectedCategory.nomeCategoria
                    }
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
                  disabled={deleting}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="users-modal-btn danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        aria-hidden="true"
                      />

                      Excluindo...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash" />

                      Excluir categoria
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