'use client';

import '../tables.css';

import { useCallback, useEffect, useMemo, useState } from 'react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const API_ENDPOINT = `${API_URL}/subcategorias`;

const emptyForm = {
  nomeSubcategoria: '',
};

export default function SubcategoriasPage() {
  const [subcategories, setSubcategories] = useState([]);

  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [total, setTotal] = useState(0);

  const [modal, setModal] = useState(null);

  const [selectedSubcategory, setSelectedSubcategory] =
    useState(null);

  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState('');

  const subcategoriesPerPage = 5;

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
      localStorage.getItem('accessToken') ||
      localStorage.getItem('authToken')
    );
  };

  /*
   * =====================================================
   * HEADERS
   * =====================================================
   */

  const getHeaders = (includeContentType = false) => {
    const token = getToken();

    const headers = {
      Accept: 'application/json',
    };

    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  };

  /*
   * =====================================================
   * CARREGAR SUBCATEGORIAS
   * =====================================================
   */

  const loadSubcategories = useCallback(
    async (page = currentPage) => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${API_ENDPOINT}?pagina=${page}&limite=${subcategoriesPerPage}`,
          {
            method: 'GET',
            headers: getHeaders(),
            cache: 'no-store',
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.mensagem ||
              'Não foi possível carregar as subcategorias.'
          );
        }

        if (!data?.sucesso) {
          throw new Error(
            data?.mensagem ||
              'Não foi possível carregar as subcategorias.'
          );
        }

        setSubcategories(
          Array.isArray(data.dados) ? data.dados : []
        );

        setTotal(data?.paginacao?.total || 0);

        setTotalPages(
          Math.max(
            1,
            data?.paginacao?.totalPaginas || 1
          )
        );

        if (data?.paginacao?.pagina) {
          setCurrentPage(data.paginacao.pagina);
        }
      } catch (requestError) {
        console.error(
          'Erro ao carregar subcategorias:',
          requestError
        );

        setError(
          requestError.message ||
            'Erro ao carregar subcategorias.'
        );

        setSubcategories([]);
      } finally {
        setLoading(false);
      }
    },
    [currentPage]
  );

  /*
   * =====================================================
   * PRIMEIRO CARREGAMENTO
   * =====================================================
   */

  useEffect(() => {
    loadSubcategories(currentPage);
  }, [currentPage, loadSubcategories]);

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
      String(
        subcategory.nomeSubcategoria || ''
      )
        .toLowerCase()
        .includes(term)
    );
  }, [subcategories, search]);

  /*
   * =====================================================
   * MODAIS
   * =====================================================
   */

  const closeModal = () => {
    if (submitting) {
      return;
    }

    setModal(null);
    setSelectedSubcategory(null);
    setForm(emptyForm);
  };

  const openCreateModal = () => {
    setSelectedSubcategory(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
    setModal('create');
  };

  const openEditModal = (subcategory) => {
    setSelectedSubcategory(subcategory);

    setForm({
      nomeSubcategoria:
        subcategory.nomeSubcategoria || '',
    });

    setError('');
    setSuccess('');
    setModal('edit');
  };

  const openDeleteModal = (subcategory) => {
    setSelectedSubcategory(subcategory);

    setError('');
    setSuccess('');
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

    const nomeSubcategoria =
      form.nomeSubcategoria.trim();

    if (
      nomeSubcategoria.length < 2 ||
      nomeSubcategoria.length > 255
    ) {
      setError(
        'O nome da subcategoria deve ter entre 2 e 255 caracteres.'
      );

      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const isEditing =
        modal === 'edit' && selectedSubcategory;

      const url = isEditing
        ? `${API_ENDPOINT}/${selectedSubcategory.idSubcategoria}`
        : API_ENDPOINT;

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getHeaders(true),
        body: JSON.stringify({
          nomeSubcategoria,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.mensagem ||
            `Não foi possível ${
              isEditing ? 'atualizar' : 'criar'
            } a subcategoria.`
        );
      }

      if (!data?.sucesso) {
        throw new Error(
          data?.mensagem ||
            `Não foi possível ${
              isEditing ? 'atualizar' : 'criar'
            } a subcategoria.`
        );
      }

      setSuccess(
        data?.mensagem ||
          (isEditing
            ? 'Subcategoria atualizada com sucesso.'
            : 'Subcategoria criada com sucesso.')
      );

      closeModal();

      /*
       * Depois de criar/editar, voltamos para a primeira
       * página para manter o comportamento da página
       * original.
       */
      if (!isEditing) {
        setCurrentPage(1);
      } else {
        await loadSubcategories(currentPage);
      }
    } catch (requestError) {
      console.error(
        'Erro ao salvar subcategoria:',
        requestError
      );

      setError(
        requestError.message ||
          'Não foi possível salvar a subcategoria.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * =====================================================
   * EXCLUIR
   * =====================================================
   */

  const handleDelete = async () => {
    if (!selectedSubcategory) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await fetch(
        `${API_ENDPOINT}/${selectedSubcategory.idSubcategoria}`,
        {
          method: 'DELETE',
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.mensagem ||
            'Não foi possível excluir a subcategoria.'
        );
      }

      if (!data?.sucesso) {
        throw new Error(
          data?.mensagem ||
            'Não foi possível excluir a subcategoria.'
        );
      }

      setSuccess(
        data?.mensagem ||
          'Subcategoria excluída com sucesso.'
      );

      closeModal();

      /*
       * Se excluir o último registro da página atual,
       * voltamos uma página quando necessário.
       */
      const shouldGoBack =
        subcategories.length === 1 &&
        currentPage > 1;

      if (shouldGoBack) {
        setCurrentPage((page) =>
          Math.max(1, page - 1)
        );
      } else {
        await loadSubcategories(currentPage);
      }
    } catch (requestError) {
      console.error(
        'Erro ao excluir subcategoria:',
        requestError
      );

      setError(
        requestError.message ||
          'Não foi possível excluir a subcategoria.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * =====================================================
   * BUSCA
   * =====================================================
   *
   * Como seu backend não possui endpoint de busca,
   * o filtro é aplicado sobre os registros da página
   * atualmente carregada.
   */

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  /*
   * =====================================================
   * ATUALIZAR
   * =====================================================
   */

  const handleRefresh = async () => {
    setSearch('');
    setSuccess('');
    setError('');

    await loadSubcategories(currentPage);
  };

  /*
   * =====================================================
   * PAGINAÇÃO
   * =====================================================
   */

  const handlePreviousPage = () => {
    setCurrentPage((page) =>
      Math.max(1, page - 1)
    );
  };

  const handleNextPage = () => {
    setCurrentPage((page) =>
      Math.min(totalPages, page + 1)
    );
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
              disabled={loading}
            >
              <i className="bi bi-plus-lg" />

              Nova subcategoria
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
            <i className="bi bi-exclamation-triangle" />

            <span>{error}</span>

            <button
              type="button"
              className="btn-close ms-auto"
              aria-label="Fechar"
              onClick={() => setError('')}
            />
          </div>
        )}

        {success && (
          <div
            className="alert alert-success d-flex align-items-center gap-2 mb-3"
            role="alert"
          >
            <i className="bi bi-check-circle" />

            <span>{success}</span>

            <button
              type="button"
              className="btn-close ms-auto"
              aria-label="Fechar"
              onClick={() => setSuccess('')}
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
                    onClick={() =>
                      setSearch('')
                    }
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
                  <th>ID</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="users-empty"
                    >
                      <div className="users-empty-content">

                        <div className="users-empty-icon">
                          <i className="bi bi-arrow-repeat" />
                        </div>

                        <strong>
                          Carregando subcategorias...
                        </strong>

                        <span>
                          Aguarde enquanto buscamos os
                          dados.
                        </span>

                      </div>
                    </td>
                  </tr>
                ) : filteredSubcategories.length > 0 ? (
                  filteredSubcategories.map(
                    (subcategory) => (
                      <tr
                        key={
                          subcategory.idSubcategoria
                        }
                      >

                        {/* SUBCATEGORY */}

                        <td>
                          <div className="user-cell">

                            <div className="user-avatar">
                              <i className="bi bi-diagram-3" />
                            </div>

                            <div className="user-information">

                              <span className="user-name">
                                {
                                  subcategory.nomeSubcategoria
                                }
                              </span>

                              <span className="user-id">
                                Subcategoria
                              </span>

                            </div>

                          </div>
                        </td>

                        {/* ID */}

                        <td>
                          <span className="table-muted">
                            ID #
                            {
                              subcategory.idSubcategoria
                            }
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
                      colSpan="3"
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
                          {search
                            ? 'Tente buscar por outro nome.'
                            : 'Ainda não existem subcategorias cadastradas.'}
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
                {filteredSubcategories.length}
              </strong>{' '}

              de{' '}

              <strong>
                {total}
              </strong>{' '}

              subcategorias
            </span>

            <nav
              aria-label="Paginação de subcategorias"
            >
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
                      currentPage === 1 ||
                      loading
                    }
                    onClick={
                      handlePreviousPage
                    }
                    aria-label="Página anterior"
                  >
                    <i className="bi bi-chevron-left" />
                  </button>
                </li>

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) => index + 1
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
                      disabled={loading}
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
                    currentPage === totalPages
                      ? 'disabled'
                      : ''
                  }`}
                >
                  <button
                    type="button"
                    className="page-link"
                    disabled={
                      currentPage === totalPages ||
                      loading
                    }
                    onClick={handleNextPage}
                    aria-label="Próxima página"
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

            {/* HEADER */}

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
                disabled={submitting}
                aria-label="Fechar modal"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>

              <div className="users-modal-body">

                <div className="order-modal-icon">
                  <i className="bi bi-diagram-3" />
                </div>

                <div className="user-form-grid">

                  {/* NAME */}

                  <div className="user-form-field full">

                    <label htmlFor="subcategory-name">
                      Subcategoria
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-diagram-3" />

                      <input
                        id="subcategory-name"
                        name="nomeSubcategoria"
                        type="text"
                        value={
                          form.nomeSubcategoria
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Ex.: Camisetas básicas"
                        maxLength={255}
                        required
                        autoFocus
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

                  <i
                    className={
                      submitting
                        ? 'bi bi-arrow-repeat'
                        : modal === 'create'
                          ? 'bi bi-plus-lg'
                          : 'bi bi-check-lg'
                    }
                  />

                  {submitting
                    ? 'Salvando...'
                    : modal === 'create'
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
                    {
                      selectedSubcategory.nomeSubcategoria
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
                  disabled={submitting}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="users-modal-btn danger"
                  onClick={handleDelete}
                  disabled={submitting}
                >

                  <i
                    className={
                      submitting
                        ? 'bi bi-arrow-repeat'
                        : 'bi bi-trash'
                    }
                  />

                  {submitting
                    ? 'Excluindo...'
                    : 'Excluir subcategoria'}

                </button>

              </div>

            </div>
          </div>
        )}
    </>
  );
}