'use client';

import '../tables.css';

import { useCallback, useEffect, useMemo, useState } from 'react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const LIMITE_POR_PAGINA = 5;

const emptyForm = {
  name: '',
  description: '',
};

function getToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    localStorage.getItem('token') ||
    sessionStorage.getItem('token')
  );
}

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocorreu um erro inesperado.';
}

export default function TamanhosPage() {
  const [sizes, setSizes] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    pagina: 1,
    limite: LIMITE_POR_PAGINA,
    total: 0,
    totalPaginas: 1,
  });

  const [modal, setModal] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [form, setForm] = useState({
    ...emptyForm,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTamanhos = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        pagina: String(currentPage),
        limite: String(LIMITE_POR_PAGINA),
      });

      const response = await fetch(
        `${API_URL}/tamanhos?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          cache: 'no-store',
        }
      );

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(
          data.mensagem ||
            data.erro ||
            'Não foi possível carregar os tamanhos.'
        );
      }

      const mappedSizes = Array.isArray(data.dados)
        ? data.dados.map((size) => ({
            id: size.idTamanho,
            name: size.codigoTamanho || '',
            description: size.descricao || '',
          }))
        : [];

      setSizes(mappedSizes);

      setPagination({
        pagina: data.paginacao?.pagina || currentPage,
        limite:
          data.paginacao?.limite ||
          LIMITE_POR_PAGINA,
        total: data.paginacao?.total || 0,
        totalPaginas:
          data.paginacao?.totalPaginas || 1,
      });
    } catch (err) {
      console.error(
        'Erro ao carregar tamanhos:',
        err
      );

      setSizes([]);
      setPagination((previous) => ({
        ...previous,
        total: 0,
        totalPaginas: 1,
      }));

      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchTamanhos();
  }, [fetchTamanhos]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setModal(null);
    setSelectedSize(null);
    setForm({
      ...emptyForm,
    });
  };

  const openCreateModal = () => {
    clearMessages();

    setSelectedSize(null);
    setForm({
      ...emptyForm,
    });

    setModal('create');
  };

  const openEditModal = (size) => {
    clearMessages();

    setSelectedSize(size);

    setForm({
      name: size.name || '',
      description: size.description || '',
    });

    setModal('edit');
  };

  const openDeleteModal = (size) => {
    clearMessages();

    setSelectedSize(size);
    setModal('delete');
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearMessages();

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      setError('Informe o tamanho.');
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        'Sua sessão expirou. Faça login novamente.'
      );
      return;
    }

    const isEditing =
      modal === 'edit' && selectedSize;

    const url = isEditing
      ? `${API_URL}/tamanhos/${selectedSize.id}`
      : `${API_URL}/tamanhos`;

    const method = isEditing ? 'PUT' : 'POST';

    setSubmitting(true);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          codigoTamanho: name,
          descricao: description,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(
          data.mensagem ||
            data.erro ||
            `Não foi possível ${
              isEditing
                ? 'atualizar'
                : 'criar'
            } o tamanho.`
        );
      }

      closeModal();

      setSuccess(
        isEditing
          ? 'Tamanho atualizado com sucesso.'
          : 'Tamanho criado com sucesso.'
      );

      if (!isEditing) {
        if (currentPage !== 1) {
          setCurrentPage(1);
        } else {
          await fetchTamanhos();
        }
      } else {
        await fetchTamanhos();
      }
    } catch (err) {
      console.error(
        'Erro ao salvar tamanho:',
        err
      );

      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSize) {
      return;
    }

    clearMessages();

    const token = getToken();

    if (!token) {
      setError(
        'Sua sessão expirou. Faça login novamente.'
      );
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(
        `${API_URL}/tamanhos/${selectedSize.id}`,
        {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(
          data.mensagem ||
            data.erro ||
            'Não foi possível excluir o tamanho.'
        );
      }

      closeModal();

      setSuccess(
        'Tamanho excluído com sucesso.'
      );

      if (
        sizes.length === 1 &&
        currentPage > 1
      ) {
        setCurrentPage((page) => page - 1);
      } else {
        await fetchTamanhos();
      }
    } catch (err) {
      console.error(
        'Erro ao excluir tamanho:',
        err
      );

      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const normalizedSearch =
    search.trim().toLowerCase();

  const filteredSizes = useMemo(() => {
    if (!normalizedSearch) {
      return sizes;
    }

    return sizes.filter((size) =>
      [
        size.id?.toString(),
        size.name,
        size.description,
      ].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(normalizedSearch)
      )
    );
  }, [sizes, normalizedSearch]);

  const totalPages = Math.max(
    1,
    pagination.totalPaginas || 1
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const goToPage = (page) => {
    const nextPage = Math.min(
      Math.max(page, 1),
      totalPages
    );

    if (nextPage !== currentPage) {
      setCurrentPage(nextPage);
    }
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  const handleRefresh = async () => {
    clearMessages();
    await fetchTamanhos();
    setSuccess('Dados atualizados.');
  };

  return (
    <>
      <main className="users-page">
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
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <i
                className={`bi ${
                  isLoading
                    ? 'bi-arrow-repeat'
                    : 'bi-arrow-clockwise'
                }`}
              />

              {isLoading
                ? 'Atualizando...'
                : 'Atualizar'}
            </button>

            <button
              type="button"
              className="users-btn users-btn-primary"
              onClick={openCreateModal}
              disabled={submitting}
            >
              <i className="bi bi-plus-lg" />
              Novo tamanho
            </button>
          </div>
        </section>

        {error && (
          <div
            className="alert alert-danger d-flex align-items-center justify-content-between"
            role="alert"
          >
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-circle" />
              <span>{error}</span>
            </div>

            <button
              type="button"
              className="btn-close"
              aria-label="Fechar"
              onClick={() => setError('')}
            />
          </div>
        )}

        {success && (
          <div
            className="alert alert-success d-flex align-items-center justify-content-between"
            role="alert"
          >
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-check-circle" />
              <span>{success}</span>
            </div>

            <button
              type="button"
              className="btn-close"
              aria-label="Fechar"
              onClick={() => setSuccess('')}
            />
          </div>
        )}

        <section className="users-card">
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
                  placeholder="Buscar na página atual..."
                  aria-label="Buscar tamanho"
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

          <div className="table-responsive users-table-wrapper">
            <table className="table users-table align-middle">
              <thead>
                <tr>
                  <th>Tamanho</th>
                  <th>Descrição</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
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
                          Carregando tamanhos...
                        </strong>

                        <span>
                          Buscando dados do servidor.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSizes.length > 0 ? (
                  filteredSizes.map((size) => (
                    <tr key={size.id}>
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

                      <td>
                        <span className="table-muted">
                          {size.description ||
                            'Sem descrição'}
                        </span>
                      </td>

                      <td>
                        <div className="user-actions">
                          <button
                            type="button"
                            className="user-action edit"
                            onClick={() =>
                              openEditModal(size)
                            }
                            disabled={
                              submitting ||
                              deleting
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
                            disabled={
                              submitting ||
                              deleting
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
                          <i className="bi bi-rulers" />
                        </div>

                        <strong>
                          Nenhum tamanho encontrado
                        </strong>

                        <span>
                          {search
                            ? 'Tente buscar por outro termo.'
                            : 'Ainda não existem tamanhos cadastrados.'}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="users-table-footer">
            <span>
              Mostrando{' '}
              <strong>
                {filteredSizes.length}
              </strong>{' '}
              de{' '}
              <strong>
                {pagination.total}
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
                      safeCurrentPage === 1 ||
                      isLoading
                    }
                    onClick={() =>
                      goToPage(
                        safeCurrentPage - 1
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
                  (_, index) => index + 1
                ).map((page) => (
                  <li
                    key={page}
                    className={`page-item ${
                      page === safeCurrentPage
                        ? 'active'
                        : ''
                    }`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      onClick={() =>
                        goToPage(page)
                      }
                      disabled={isLoading}
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
                        totalPages ||
                      isLoading
                    }
                    onClick={() =>
                      goToPage(
                        safeCurrentPage + 1
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
                disabled={submitting}
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
                        disabled={submitting}
                      />
                    </div>
                  </div>

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
                        disabled={submitting}
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
                      <span
                        className="spinner-border spinner-border-sm"
                        aria-hidden="true"
                      />
                      Salvando...
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
                        ? 'Criar tamanho'
                        : 'Salvar alterações'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                      Excluir tamanho
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