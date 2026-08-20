'use client';

import '../tables.css';

import { useCallback, useEffect, useMemo, useState } from 'react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const MODELOS_ENDPOINT = `${API_URL}/modelos`;

const emptyForm = {
  nomeModelo: '',
};

export default function ModelosPage() {
  const [models, setModels] = useState([]);

  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalModels, setTotalModels] = useState(0);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState('');

  const [modal, setModal] = useState(null);

  const [selectedModel, setSelectedModel] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const modelsPerPage = 10;

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
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('accessToken')
    );
  };

  /*
   * =====================================================
   * BUSCAR MODELOS
   * =====================================================
   */

  const fetchModels = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        pagina: String(currentPage),
        limite: String(modelsPerPage),
      });

      const response = await fetch(
        `${MODELOS_ENDPOINT}?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          cache: 'no-store',
        }
      );

      const result = await response.json();

      if (!response.ok || !result.sucesso) {
        throw new Error(
          result.mensagem || 'Não foi possível carregar os modelos.'
        );
      }

      setModels(Array.isArray(result.dados) ? result.dados : []);

      setTotalModels(result.paginacao?.total || 0);

      setTotalPages(
        Math.max(1, result.paginacao?.totalPaginas || 1)
      );
    } catch (requestError) {
      console.error('Erro ao carregar modelos:', requestError);

      setModels([]);
      setTotalModels(0);
      setTotalPages(1);

      setError(
        requestError.message ||
          'Não foi possível carregar os modelos.'
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  /*
   * =====================================================
   * CARREGAR AO ABRIR / TROCAR PÁGINA
   * =====================================================
   */

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  /*
   * =====================================================
   * FILTRO
   * =====================================================
   *
   * A API atualmente não possui endpoint de busca por nome
   * integrado ao listarTodos, então a busca é feita sobre
   * os modelos carregados na página atual.
   */

  const filteredModels = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return models;
    }

    return models.filter((model) =>
      String(model.nomeModelo || '')
        .toLowerCase()
        .includes(term)
    );
  }, [models, search]);

  /*
   * =====================================================
   * MODAIS
   * =====================================================
   */

  const closeModal = () => {
    setModal(null);
    setSelectedModel(null);
    setForm(emptyForm);
    setError('');
  };

  const openCreateModal = () => {
    setSelectedModel(null);
    setForm(emptyForm);
    setError('');
    setModal('create');
  };

  const openEditModal = (model) => {
    setSelectedModel(model);

    setForm({
      nomeModelo: model.nomeModelo || '',
    });

    setError('');
    setModal('edit');
  };

  const openDeleteModal = (model) => {
    setSelectedModel(model);
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

    const nomeModelo = form.nomeModelo.trim();

    if (!nomeModelo) {
      setError('O nome do modelo é obrigatório.');
      return;
    }

    if (nomeModelo.length < 2 || nomeModelo.length > 100) {
      setError(
        'O nome do modelo deve ter entre 2 e 100 caracteres.'
      );
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        'Não foi possível encontrar o token de autenticação. Faça login novamente.'
      );
      return;
    }

    try {
      setSaving(true);
      setError('');

      const isEditing =
        modal === 'edit' && selectedModel;

      const url = isEditing
        ? `${MODELOS_ENDPOINT}/${selectedModel.idModelo}`
        : MODELOS_ENDPOINT;

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nomeModelo,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.sucesso) {
        throw new Error(
          result.mensagem ||
            `Não foi possível ${
              isEditing ? 'atualizar' : 'criar'
            } o modelo.`
        );
      }

      closeModal();

      await fetchModels();
    } catch (requestError) {
      console.error(
        'Erro ao salvar modelo:',
        requestError
      );

      setError(
        requestError.message ||
          'Não foi possível salvar o modelo.'
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
    if (!selectedModel) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        'Não foi possível encontrar o token de autenticação. Faça login novamente.'
      );
      return;
    }

    try {
      setDeleting(true);
      setError('');

      const response = await fetch(
        `${MODELOS_ENDPOINT}/${selectedModel.idModelo}`,
        {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.sucesso) {
        throw new Error(
          result.mensagem ||
            'Não foi possível excluir o modelo.'
        );
      }

      closeModal();

      /*
       * Se apagarmos o último item da página atual,
       * voltamos uma página quando necessário.
       */
      if (
        models.length === 1 &&
        currentPage > 1
      ) {
        setCurrentPage((page) =>
          Math.max(1, page - 1)
        );
      } else {
        await fetchModels();
      }
    } catch (requestError) {
      console.error(
        'Erro ao excluir modelo:',
        requestError
      );

      setError(
        requestError.message ||
          'Não foi possível excluir o modelo.'
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
  };

  /*
   * =====================================================
   * ATUALIZAR
   * =====================================================
   */

  const handleRefresh = async () => {
    setSearch('');
    await fetchModels();
  };

  /*
   * =====================================================
   * PAGINAÇÃO
   * =====================================================
   */

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);
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

            <h1>Modelos</h1>

            <p>
              Gerencie os modelos disponíveis no catálogo.
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

              Novo modelo
            </button>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && !modal && (
          <div
            className="alert alert-danger d-flex align-items-center gap-2 mb-4"
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

        {/* =================================================
            TABLE CARD
        ================================================= */}

        <section className="users-card">

          <div className="users-card-header">
            <div>
              <span className="users-card-label">
                Gerenciamento
              </span>

              <h2>Modelos cadastrados</h2>
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
                  <th>Modelo</th>
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
                          Carregando modelos...
                        </strong>

                        <span>
                          Aguarde enquanto buscamos os
                          modelos cadastrados.
                        </span>

                      </div>
                    </td>
                  </tr>
                ) : filteredModels.length > 0 ? (
                  filteredModels.map((model) => (
                    <tr
                      key={model.idModelo}
                    >

                      {/* MODEL */}

                      <td>
                        <div className="user-cell">

                          <div className="user-avatar">
                            <i className="bi bi-box-seam" />
                          </div>

                          <div className="user-information">

                            <span className="user-name">
                              {model.nomeModelo}
                            </span>

                            <span className="user-id">
                              Modelo cadastrado
                            </span>

                          </div>

                        </div>
                      </td>

                      {/* ID */}

                      <td>
                        <span className="table-muted">
                          #{model.idModelo}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td>
                        <div className="user-actions">

                          <button
                            type="button"
                            className="user-action edit"
                            onClick={() =>
                              openEditModal(model)
                            }
                          >
                            <i className="bi bi-pencil" />

                            Editar
                          </button>

                          <button
                            type="button"
                            className="user-action delete"
                            onClick={() =>
                              openDeleteModal(model)
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
                      colSpan="3"
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
                          {search
                            ? 'Tente buscar por outro modelo.'
                            : 'Ainda não existem modelos cadastrados.'}
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
                {filteredModels.length}
              </strong>{' '}

              de{' '}

              <strong>
                {totalModels}
              </strong>{' '}

              modelos
            </span>

            <nav aria-label="Paginação de modelos">

              <ul className="pagination users-pagination">

                {/* PREVIOUS */}

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
                    onClick={() =>
                      goToPage(
                        currentPage - 1
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
                      disabled={loading}
                      onClick={() =>
                        goToPage(page)
                      }
                    >
                      {page}
                    </button>
                  </li>
                ))}

                {/* NEXT */}

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
                    onClick={() =>
                      goToPage(
                        currentPage + 1
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

            {/* HEADER */}

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
                disabled={saving}
              >
                <i className="bi bi-x-lg" />
              </button>

            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>

              <div className="users-modal-body">

                {error && (
                  <div
                    className="alert alert-danger d-flex align-items-center gap-2"
                    role="alert"
                  >
                    <i className="bi bi-exclamation-triangle" />

                    <span>{error}</span>
                  </div>
                )}

                <div className="order-modal-icon">
                  <i className="bi bi-box-seam" />
                </div>

                <div className="user-form-grid">

                  {/* NAME */}

                  <div className="user-form-field full">

                    <label htmlFor="model-name">
                      Nome do modelo
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-box-seam" />

                      <input
                        id="model-name"
                        name="nomeModelo"
                        type="text"
                        value={
                          form.nomeModelo
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Ex.: Slim"
                        maxLength={100}
                        required
                        disabled={saving}
                      />

                    </div>

                    <small className="text-muted mt-2 d-block">
                      Informe um nome entre 2 e
                      100 caracteres.
                    </small>

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

                  <i
                    className={
                      saving
                        ? 'bi bi-arrow-repeat'
                        : modal === 'create'
                        ? 'bi bi-plus-lg'
                        : 'bi bi-check-lg'
                    }
                  />

                  {saving
                    ? 'Salvando...'
                    : modal === 'create'
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
                    {selectedModel.nomeModelo}
                  </strong>

                  . Essa ação não poderá ser
                  desfeita.
                </p>

                {error && (
                  <div
                    className="alert alert-danger mt-3"
                    role="alert"
                  >
                    <i className="bi bi-exclamation-triangle me-2" />
                    {error}
                  </div>
                )}

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

                  <i
                    className={
                      deleting
                        ? 'bi bi-arrow-repeat'
                        : 'bi bi-trash'
                    }
                  />

                  {deleting
                    ? 'Excluindo...'
                    : 'Excluir modelo'}

                </button>

              </div>

            </div>

          </div>
        )}

    </>
  );
}