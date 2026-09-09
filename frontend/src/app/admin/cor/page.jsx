'use client';

import '../tables.css';

import { useCallback, useEffect, useState } from 'react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const LIMITE_POR_PAGINA = 10;

const emptyForm = {
  tom: '',
  nomeCor: '',
  codigoCor: '#2563EB',
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

export default function CoresPage() {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    pagina: 1,
    limite: LIMITE_POR_PAGINA,
    total: 0,
    totalPaginas: 1,
  });

  const [modal, setModal] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchColors = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        pagina: String(currentPage),
        limite: String(LIMITE_POR_PAGINA),
      });

      const response = await fetch(
        `${API_URL}/cores?${params.toString()}`,
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
          result.mensagem ||
            result.erro ||
            'Não foi possível carregar as cores.'
        );
      }

      setColors(
        Array.isArray(result.dados)
          ? result.dados
          : []
      );

      setPagination({
        pagina:
          result.paginacao?.pagina || currentPage,
        limite:
          result.paginacao?.limite ||
          LIMITE_POR_PAGINA,
        total:
          result.paginacao?.total || 0,
        totalPaginas:
          result.paginacao?.totalPaginas || 1,
      });
    } catch (err) {
      console.error(
        'Erro ao carregar cores:',
        err
      );

      setColors([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setModal(null);
    setSelectedColor(null);
    setForm({
      ...emptyForm,
    });
  };

  const openCreateModal = () => {
    clearMessages();

    setSelectedColor(null);

    setForm({
      ...emptyForm,
    });

    setModal('create');
  };

  const openEditModal = (color) => {
    clearMessages();

    setSelectedColor(color);

    setForm({
      tom: color.tom || '',
      nomeCor: color.nomeCor || '',
      codigoCor:
        color.codigoCor || '#2563EB',
    });

    setModal('edit');
  };

  const openDeleteModal = (color) => {
    clearMessages();

    setSelectedColor(color);
    setModal('delete');
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleColorChange = (event) => {
    const { value } = event.target;

    setForm((previous) => ({
      ...previous,
      codigoCor: value.toUpperCase(),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearMessages();

    const tom = form.tom.trim();
    const nomeCor = form.nomeCor.trim();
    const codigoCor = form.codigoCor
      .trim()
      .toUpperCase();

    if (!tom) {
      setError('Informe o tom da cor.');
      return;
    }

    if (!nomeCor) {
      setError('Informe o nome da cor.');
      return;
    }

    if (!codigoCor) {
      setError('Informe o código HEX da cor.');
      return;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(codigoCor)) {
      setError(
        'O código HEX deve estar no formato #000000.'
      );
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        'Sua sessão expirou. Faça login novamente.'
      );
      return;
    }

    setSubmitting(true);

    try {
      const isEditing =
        modal === 'edit' && selectedColor;

      const url = isEditing
        ? `${API_URL}/cores/${selectedColor.idCor}`
        : `${API_URL}/cores`;

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tom,
          nomeCor,
          codigoCor,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.sucesso) {
        throw new Error(
          result.mensagem ||
            result.erro ||
            `Não foi possível ${
              isEditing ? 'atualizar' : 'criar'
            } a cor.`
        );
      }

      closeModal();

      setSuccess(
        isEditing
          ? 'Cor atualizada com sucesso.'
          : 'Cor criada com sucesso.'
      );

      await fetchColors();
    } catch (err) {
      console.error(
        'Erro ao salvar cor:',
        err
      );

      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedColor) {
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
        `${API_URL}/cores/${selectedColor.idCor}`,
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
            result.erro ||
            'Não foi possível excluir a cor.'
        );
      }

      closeModal();

      setSuccess('Cor excluída com sucesso.');

      if (
        colors.length === 1 &&
        currentPage > 1
      ) {
        setCurrentPage((page) => page - 1);
      } else {
        await fetchColors();
      }
    } catch (err) {
      console.error(
        'Erro ao excluir cor:',
        err
      );

      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const normalizedSearch =
    search.trim().toLowerCase();

  const filteredColors = colors.filter(
    (color) => {
      if (!normalizedSearch) {
        return true;
      }

      return [
        color.idCor?.toString(),
        color.tom,
        color.nomeCor,
        color.codigoCor,
      ].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(normalizedSearch)
      );
    }
  );

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

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearch(value);

    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const clearSearch = () => {
    setSearch('');

    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleRefresh = async () => {
    clearMessages();
    await fetchColors();
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
              Cores
            </h1>

            <p>
              Gerencie as cores disponíveis no catálogo.
            </p>
          </div>

          <div className="users-heading-actions">
            <button
              type="button"
              className="users-btn users-btn-secondary"
              onClick={handleRefresh}
              disabled={loading}
            >
              <i
                className={`bi ${
                  loading
                    ? 'bi-arrow-repeat'
                    : 'bi-arrow-clockwise'
                }`}
              />

              {loading
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
              Nova cor
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
                Cores cadastradas
              </h2>
            </div>

            <div className="users-card-header-right">
              <div className="users-search">
                <i className="bi bi-search" />

                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Buscar cor..."
                  aria-label="Buscar cor"
                />

                {search && (
                  <button
                    type="button"
                    className="users-search-clear"
                    onClick={clearSearch}
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
                  <th>Cor</th>
                  <th>HEX</th>
                  <th>Tom</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="users-empty"
                    >
                      <div className="users-empty-content">
                        <div className="users-empty-icon">
                          <i className="bi bi-arrow-repeat" />
                        </div>

                        <strong>
                          Carregando cores...
                        </strong>

                        <span>
                          Buscando dados do servidor.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredColors.length > 0 ? (
                  filteredColors.map((color) => (
                    <tr key={color.idCor}>
                      <td>
                        <div className="user-cell">
                          <div
                            className="color-preview"
                            style={{
                              backgroundColor:
                                color.codigoCor,
                            }}
                            title={
                              color.codigoCor
                            }
                          />

                          <div className="user-information">
                            <span className="user-name">
                              {color.nomeCor}
                            </span>

                            <span className="user-id">
                              ID #{color.idCor}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="color-hex">
                          {color.codigoCor}
                        </span>
                      </td>

                      <td>
                        <span className="table-muted">
                          {color.tom ||
                            'Sem tom informado'}
                        </span>
                      </td>

                      <td>
                        <div className="user-actions">
                          <button
                            type="button"
                            className="user-action edit"
                            onClick={() =>
                              openEditModal(color)
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
                                color
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
                      colSpan="4"
                      className="users-empty"
                    >
                      <div className="users-empty-content">
                        <div className="users-empty-icon">
                          <i className="bi bi-palette" />
                        </div>

                        <strong>
                          Nenhuma cor encontrada
                        </strong>

                        <span>
                          {search
                            ? 'Tente buscar por outro termo.'
                            : 'Ainda não existem cores cadastradas.'}
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
                {filteredColors.length}
              </strong>{' '}

              de{' '}

              <strong>
                {pagination.total}
              </strong>{' '}

              cores
            </span>

            <nav aria-label="Paginação de cores">
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
                      loading
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
                        goToPage(page)
                      }
                      disabled={loading}
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
                      loading
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
            aria-labelledby="color-modal-title"
          >
            <div className="users-modal-header">
              <div>
                <span className="users-modal-label">
                  {modal === 'create'
                    ? 'Nova cor'
                    : 'Gerenciamento'}
                </span>

                <h2 id="color-modal-title">
                  {modal === 'create'
                    ? 'Criar cor'
                    : 'Editar cor'}
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
                  <i className="bi bi-palette" />
                </div>

                <div className="user-form-grid">
                  <div className="user-form-field">
                    <label htmlFor="color-tom">
                      Tom
                    </label>

                    <div className="user-input-wrapper">
                      <i className="bi bi-palette" />

                      <input
                        id="color-tom"
                        name="tom"
                        type="text"
                        value={form.tom}
                        onChange={
                          handleFormChange
                        }
                        placeholder="Ex.: Azul"
                        maxLength={100}
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="user-form-field">
                    <label htmlFor="color-name">
                      Nome da cor
                    </label>

                    <div className="user-input-wrapper">
                      <i className="bi bi-type" />

                      <input
                        id="color-name"
                        name="nomeCor"
                        type="text"
                        value={form.nomeCor}
                        onChange={
                          handleFormChange
                        }
                        placeholder="Ex.: Azul Royal"
                        maxLength={100}
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="user-form-field full">
                    <label htmlFor="color-hex">
                      Código HEX
                    </label>

                    <div className="color-input-wrapper">
                      <input
                        id="color-hex"
                        name="codigoCor"
                        type="color"
                        value={
                          /^#[0-9A-Fa-f]{6}$/.test(
                            form.codigoCor
                          )
                            ? form.codigoCor
                            : '#2563EB'
                        }
                        onChange={
                          handleColorChange
                        }
                        aria-label="Selecionar cor"
                        disabled={submitting}
                      />

                      <input
                        type="text"
                        value={
                          form.codigoCor
                        }
                        onChange={(event) => {
                          let value =
                            event.target.value
                              .toUpperCase();

                          if (
                            value &&
                            !value.startsWith('#')
                          ) {
                            value = `#${value}`;
                          }

                          setForm(
                            (previous) => ({
                              ...previous,
                              codigoCor:
                                value,
                            })
                          );
                        }}
                        placeholder="#2563EB"
                        maxLength={7}
                        pattern="^#[0-9A-Fa-f]{6}$"
                        required
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
                        ? 'Criar cor'
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
        selectedColor && (
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
              aria-labelledby="delete-color-title"
            >
              <div className="users-delete-content">
                <div className="users-delete-icon">
                  <i className="bi bi-trash3" />
                </div>

                <span className="users-modal-label">
                  Atenção
                </span>

                <h2 id="delete-color-title">
                  Excluir cor?
                </h2>

                <p>
                  Você está prestes a excluir a
                  cor{' '}

                  <strong>
                    {selectedColor.nomeCor}
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
                      Excluir cor
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