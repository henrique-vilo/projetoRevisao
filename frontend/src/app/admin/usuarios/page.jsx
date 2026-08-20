'use client';

import '../tables.css';

import { useCallback, useEffect, useMemo, useState } from 'react';

const API_URL = 'http://localhost:3001/api/usuarios';

const TOKEN_STORAGE_KEYS = [
  'token',
  'accessToken',
  'jwt',
];

const emptyForm = {
  nome: '',
  cpf: '',
  email: '',
  telefone: '',
  cep: '',
  senha: '',
  tipo: 'comum',
};

const TYPE_LABELS = {
  comum: 'Cliente',
  cliente: 'Cliente',
  fornecedor: 'Fornecedor',
  admin: 'Administrador',
  administrador: 'Administrador',
};

const TYPE_VALUES = {
  Cliente: 'comum',
  Fornecedor: 'fornecedor',
  Administrador: 'admin',
};

function getToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  for (const key of TOKEN_STORAGE_KEYS) {
    const token = localStorage.getItem(key);

    if (token) {
      return token;
    }
  }

  return null;
}

function getInitials(name) {
  if (!name) {
    return '--';
  }

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function getTypeLabel(type) {
  if (!type) {
    return 'Não informado';
  }

  return (
    TYPE_LABELS[String(type).toLowerCase()] ||
    String(type)
  );
}

function getTypeClass(type) {
  const normalized = String(type || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');

  return `user-type ${normalized}`;
}

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(date)
    .replace('.', '');
}

function getUserDate(user) {
  return (
    user.dataCadastro ||
    user.dataCriacao ||
    user.createdAt ||
    user.created_at ||
    user.dataCriacaoUsuario ||
    null
  );
}

function getApiErrorMessage(data, fallback) {
  return (
    data?.mensagem ||
    data?.erro ||
    fallback
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    pagina: 1,
    limite: 10,
    total: 0,
    totalPaginas: 1,
  });

  const [modal, setModal] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');

  const [successMessage, setSuccessMessage] = useState('');

  const [tokenError, setTokenError] = useState(false);

  const usersPerPage = 10;

  /*
   * =====================================================
   * API REQUEST
   * =====================================================
   */

  const apiRequest = useCallback(
    async (url, options = {}) => {
      const token = getToken();

      if (!token) {
        setTokenError(true);

        throw new Error(
          'Token de autenticação não encontrado.'
        );
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        if (response.status === 401) {
          setTokenError(true);
        }

        throw new Error(
          getApiErrorMessage(
            data,
            `Erro HTTP ${response.status}`
          )
        );
      }

      return data;
    },
    []
  );

  /*
   * =====================================================
   * LOAD USERS
   * =====================================================
   */

  const loadUsers = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError('');
        setTokenError(false);

        const data = await apiRequest(
          `${API_URL}?pagina=${page}&limite=${usersPerPage}`
        );

        const apiUsers = Array.isArray(data?.dados)
          ? data.dados
          : [];

        setUsers(apiUsers);

        setPagination({
          pagina: data?.paginacao?.pagina || page,
          limite:
            data?.paginacao?.limite ||
            usersPerPage,
          total:
            data?.paginacao?.total ||
            0,
          totalPaginas:
            data?.paginacao?.totalPaginas ||
            1,
        });
      } catch (requestError) {
        console.error(
          'Erro ao carregar usuários:',
          requestError
        );

        setUsers([]);

        if (
          requestError?.message !==
          'Token de autenticação não encontrado.'
        ) {
          setError(
            requestError?.message ||
              'Não foi possível carregar os usuários.'
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [apiRequest]
  );

  /*
   * =====================================================
   * INITIAL LOAD
   * =====================================================
   */

  useEffect(() => {
    loadUsers(1);
  }, [loadUsers]);

  /*
   * =====================================================
   * FILTER
   *
   * IMPORTANTE:
   * A API atual não possui endpoint de pesquisa.
   * Portanto, o filtro abaixo pesquisa somente
   * os usuários carregados na página atual.
   * =====================================================
   */

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return users;
    }

    return users.filter((user) => {
      const name = String(
        user.nome || ''
      ).toLowerCase();

      const email = String(
        user.email || ''
      ).toLowerCase();

      const cpf = String(
        user.cpf || ''
      ).toLowerCase();

      const telefone = String(
        user.telefone || ''
      ).toLowerCase();

      const tipo = getTypeLabel(
        user.tipo
      ).toLowerCase();

      return [
        name,
        email,
        cpf,
        telefone,
        tipo,
      ].some((value) =>
        value.includes(term)
      );
    });
  }, [users, search]);

  /*
   * =====================================================
   * PAGINATION
   * =====================================================
   */

  const totalPages = Math.max(
    1,
    pagination.totalPaginas
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  /*
   * =====================================================
   * MODAL
   * =====================================================
   */

  const closeModal = () => {
    if (submitting) {
      return;
    }

    setModal(null);
    setSelectedUser(null);
    setForm(emptyForm);
  };

  const openCreateModal = () => {
    setError('');
    setSuccessMessage('');
    setSelectedUser(null);

    setForm({
      ...emptyForm,
    });

    setModal('create');
  };

  const openEditModal = (user) => {
    setError('');
    setSuccessMessage('');
    setSelectedUser(user);

    setForm({
      nome: user.nome || '',
      cpf: user.cpf || '',
      email: user.email || '',
      telefone: user.telefone || '',
      cep: user.cep || '',
      senha: '',
      tipo: user.tipo || 'comum',
    });

    setModal('edit');
  };

  const openDeleteModal = (user) => {
    setError('');
    setSuccessMessage('');
    setSelectedUser(user);
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
   * CREATE
   * =====================================================
   */

  const createUser = async () => {
    const payload = {
      nome: form.nome.trim(),
      cpf: form.cpf.trim(),
      email: form.email.trim().toLowerCase(),
      telefone: form.telefone.trim(),
      cep: form.cep.trim(),
      senha: form.senha,
      tipo: form.tipo,
    };

    const data = await apiRequest(
      API_URL,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );

    return data;
  };

  /*
   * =====================================================
   * UPDATE
   * =====================================================
   */

  const updateUser = async () => {
    if (!selectedUser?.idUsuario) {
      throw new Error(
        'ID do usuário não encontrado.'
      );
    }

    const payload = {
      nome: form.nome.trim(),
      cpf: form.cpf.trim(),
      email: form.email.trim().toLowerCase(),
      telefone: form.telefone.trim(),
      cep: form.cep.trim(),
      tipo: form.tipo,
    };

    /*
     * A senha é opcional na edição.
     * Só enviamos caso tenha sido preenchida.
     */

    if (form.senha.trim()) {
      payload.senha = form.senha;
    }

    const data = await apiRequest(
      `${API_URL}/${selectedUser.idUsuario}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );

    return data;
  };

  /*
   * =====================================================
   * CREATE / EDIT SUBMIT
   * =====================================================
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError('');
    setSuccessMessage('');

    const nome = form.nome.trim();
    const cpf = form.cpf.trim();
    const email = form.email.trim();
    const telefone = form.telefone.trim();
    const cep = form.cep.trim();

    if (!nome) {
      setError('Informe o nome do usuário.');
      return;
    }

    if (!cpf) {
      setError('Informe o CPF do usuário.');
      return;
    }

    if (!email) {
      setError('Informe o e-mail do usuário.');
      return;
    }

    if (!telefone) {
      setError('Informe o telefone do usuário.');
      return;
    }

    if (!cep) {
      setError('Informe o CEP do usuário.');
      return;
    }

    if (
      modal === 'create' &&
      !form.senha.trim()
    ) {
      setError('Informe a senha do usuário.');
      return;
    }

    try {
      setSubmitting(true);

      let data;

      if (modal === 'create') {
        data = await createUser();
      }

      if (modal === 'edit') {
        data = await updateUser();
      }

      setSuccessMessage(
        data?.mensagem ||
          (
            modal === 'create'
              ? 'Usuário criado com sucesso.'
              : 'Usuário atualizado com sucesso.'
          )
      );

      closeModal();

      await loadUsers(
        modal === 'create'
          ? 1
          : safeCurrentPage
      );

      if (modal === 'create') {
        setCurrentPage(1);
      }
    } catch (requestError) {
      console.error(
        'Erro ao salvar usuário:',
        requestError
      );

      setError(
        requestError?.message ||
          'Não foi possível salvar o usuário.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * =====================================================
   * DELETE
   * =====================================================
   */

  const handleDelete = async () => {
    if (
      !selectedUser?.idUsuario ||
      submitting
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccessMessage('');

      const data = await apiRequest(
        `${API_URL}/${selectedUser.idUsuario}`,
        {
          method: 'DELETE',
        }
      );

      const deletedUserName =
        selectedUser.nome;

      closeModal();

      let pageToLoad = safeCurrentPage;

      /*
       * Se a última pessoa da última página
       * for removida, voltamos uma página.
       */

      if (
        users.length === 1 &&
        safeCurrentPage > 1
      ) {
        pageToLoad =
          safeCurrentPage - 1;

        setCurrentPage(pageToLoad);
      }

      await loadUsers(pageToLoad);

      setSuccessMessage(
        data?.mensagem ||
          `Usuário ${deletedUserName} excluído com sucesso.`
      );
    } catch (requestError) {
      console.error(
        'Erro ao excluir usuário:',
        requestError
      );

      setError(
        requestError?.message ||
          'Não foi possível excluir o usuário.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * =====================================================
   * SEARCH
   * =====================================================
   */

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  /*
   * =====================================================
   * PAGE CHANGE
   * =====================================================
   */

  const changePage = (page) => {
    if (
      page < 1 ||
      page > totalPages ||
      page === safeCurrentPage ||
      loading
    ) {
      return;
    }

    setSearch('');
    setCurrentPage(page);
    loadUsers(page);
  };

  /*
   * =====================================================
   * REFRESH
   * =====================================================
   */

  const handleRefresh = () => {
    setSearch('');
    setError('');
    setSuccessMessage('');
    loadUsers(safeCurrentPage);
  };

  /*
   * =====================================================
   * RENDER
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
              Administração
            </span>

            <h1>
              Usuários
            </h1>

            <p>
              Gerencie os usuários cadastrados na plataforma.
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

              Novo usuário
            </button>

          </div>

        </section>

        {/* =================================================
            FEEDBACK
        ================================================= */}

        {tokenError && (
          <div className="alert alert-danger">
            <i className="bi bi-shield-lock me-2" />

            Sessão de administrador não encontrada
            ou expirada. Faça login novamente.
          </div>
        )}

        {!tokenError && error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2" />

            {error}
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <i className="bi bi-check-circle me-2" />

            {successMessage}
          </div>
        )}

        {/* =================================================
            USERS CARD
        ================================================= */}

        <section className="users-card">

          {/* CARD HEADER */}

          <div className="users-card-header">

            <div>
              <span className="users-card-label">
                Gerenciamento
              </span>

              <h2>
                Usuários cadastrados
              </h2>
            </div>

            <div className="users-card-header-right">

              <div className="users-search">

                <i className="bi bi-search" />

                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Buscar usuário..."
                  aria-label="Buscar usuário"
                  disabled={loading}
                />

                {search && (
                  <button
                    type="button"
                    className="users-search-clear"
                    onClick={() => {
                      setSearch('');
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
                  <th>Usuário</th>
                  <th>E-mail</th>
                  <th>Tipo</th>
                  <th>Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>

                {loading ? (

                  <tr>
                    <td
                      colSpan="5"
                      className="users-empty"
                    >
                      <div className="users-empty-content">

                        <div className="users-empty-icon">
                          <i className="bi bi-arrow-repeat" />
                        </div>

                        <strong>
                          Carregando usuários...
                        </strong>

                        <span>
                          Buscando os dados na API.
                        </span>

                      </div>
                    </td>
                  </tr>

                ) : filteredUsers.length > 0 ? (

                  filteredUsers.map((user) => (

                    <tr
                      key={user.idUsuario}
                    >

                      {/* USER */}

                      <td>

                        <div className="user-cell">

                          <div className="user-avatar">
                            {getInitials(user.nome)}
                          </div>

                          <div className="user-information">

                            <span className="user-name">
                              {user.nome || 'Sem nome'}
                            </span>

                            <span className="user-id">
                              ID #
                              {String(
                                user.idUsuario
                              ).padStart(4, '0')}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* EMAIL */}

                      <td>

                        <span className="user-email">
                          {user.email || '—'}
                        </span>

                      </td>

                      {/* TYPE */}

                      <td>

                        <span
                          className={getTypeClass(
                            user.tipo
                          )}
                        >
                          {getTypeLabel(
                            user.tipo
                          )}
                        </span>

                      </td>

                      {/* DATE */}

                      <td>

                        <span className="table-muted">
                          {formatDate(
                            getUserDate(user)
                          )}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="user-actions">

                          <button
                            type="button"
                            className="user-action edit"
                            onClick={() =>
                              openEditModal(user)
                            }
                            disabled={submitting}
                          >
                            <i className="bi bi-pencil" />

                            Editar
                          </button>

                          <button
                            type="button"
                            className="user-action delete"
                            onClick={() =>
                              openDeleteModal(user)
                            }
                            disabled={submitting}
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
                      colSpan="5"
                      className="users-empty"
                    >

                      <div className="users-empty-content">

                        <div className="users-empty-icon">
                          <i className="bi bi-person-x" />
                        </div>

                        <strong>
                          {search
                            ? 'Nenhum usuário encontrado'
                            : 'Nenhum usuário cadastrado'}
                        </strong>

                        <span>
                          {search
                            ? 'Tente buscar por outro nome, e-mail ou CPF.'
                            : 'Ainda não existem usuários para exibir.'}
                        </span>

                      </div>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              TABLE FOOTER
          ================================================= */}

          <div className="users-table-footer">

            <span>

              Mostrando{' '}

              <strong>
                {filteredUsers.length}
              </strong>{' '}

              de{' '}

              <strong>
                {pagination.total}
              </strong>{' '}

              usuários

            </span>

            <nav
              aria-label="Paginação de usuários"
            >

              <ul className="pagination users-pagination">

                {/* PREVIOUS */}

                <li
                  className={`page-item ${
                    safeCurrentPage === 1 ||
                    loading
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
                      changePage(
                        safeCurrentPage - 1
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
                      page === safeCurrentPage
                        ? 'active'
                        : ''
                    }`}
                  >

                    <button
                      type="button"
                      className="page-link"
                      disabled={loading}
                      onClick={() =>
                        changePage(page)
                      }
                    >
                      {page}
                    </button>

                  </li>

                ))}

                {/* NEXT */}

                <li
                  className={`page-item ${
                    safeCurrentPage === totalPages ||
                    loading
                      ? 'disabled'
                      : ''
                  }`}
                >

                  <button
                    type="button"
                    className="page-link"
                    disabled={
                      safeCurrentPage === totalPages ||
                      loading
                    }
                    onClick={() =>
                      changePage(
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

      {/* ===================================================
          CREATE / EDIT MODAL
      =================================================== */}

      {(modal === 'create' ||
        modal === 'edit') && (

        <div
          className="users-modal-backdrop"
          onMouseDown={(event) => {

            if (
              event.target === event.currentTarget
            ) {
              closeModal();
            }

          }}
        >

          <div
            className="users-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-modal-title"
          >

            {/* HEADER */}

            <div className="users-modal-header">

              <div>

                <span className="users-modal-label">

                  {modal === 'create'
                    ? 'Novo cadastro'
                    : 'Gerenciamento'}

                </span>

                <h2 id="user-modal-title">

                  {modal === 'create'
                    ? 'Criar usuário'
                    : 'Editar usuário'}

                </h2>

              </div>

              <button
                type="button"
                className="users-modal-close"
                onClick={closeModal}
                aria-label="Fechar modal"
                disabled={submitting}
              >
                <i className="bi bi-x-lg" />
              </button>

            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>

              <div className="users-modal-body">

                <div className="user-form-avatar">
                  {getInitials(form.nome)}
                </div>

                <div className="user-form-grid">

                  {/* NAME */}

                  <div className="user-form-field full">

                    <label htmlFor="user-name">
                      Nome completo
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-person" />

                      <input
                        id="user-name"
                        name="nome"
                        type="text"
                        value={form.nome}
                        onChange={handleFormChange}
                        placeholder="Digite o nome completo"
                        required
                        disabled={submitting}
                      />

                    </div>

                  </div>

                  {/* CPF */}

                  <div className="user-form-field">

                    <label htmlFor="user-cpf">
                      CPF
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-person-vcard" />

                      <input
                        id="user-cpf"
                        name="cpf"
                        type="text"
                        value={form.cpf}
                        onChange={handleFormChange}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        required
                        disabled={submitting}
                      />

                    </div>

                  </div>

                  {/* EMAIL */}

                  <div className="user-form-field">

                    <label htmlFor="user-email">
                      E-mail
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-envelope" />

                      <input
                        id="user-email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleFormChange}
                        placeholder="usuario@email.com"
                        required
                        disabled={submitting}
                      />

                    </div>

                  </div>

                  {/* TELEFONE */}

                  <div className="user-form-field">

                    <label htmlFor="user-telefone">
                      Telefone
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-telephone" />

                      <input
                        id="user-telefone"
                        name="telefone"
                        type="text"
                        value={form.telefone}
                        onChange={handleFormChange}
                        placeholder="(11) 99999-9999"
                        maxLength={15}
                        required
                        disabled={submitting}
                      />

                    </div>

                  </div>

                  {/* CEP */}

                  <div className="user-form-field">

                    <label htmlFor="user-cep">
                      CEP
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-geo-alt" />

                      <input
                        id="user-cep"
                        name="cep"
                        type="text"
                        value={form.cep}
                        onChange={handleFormChange}
                        placeholder="00000-000"
                        maxLength={9}
                        required
                        disabled={submitting}
                      />

                    </div>

                  </div>

                  {/* TYPE */}

                  <div className="user-form-field">

                    <label htmlFor="user-type">
                      Tipo de usuário
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-person-badge" />

                      <select
                        id="user-type"
                        name="tipo"
                        value={getTypeLabel(form.tipo)}
                        onChange={(event) => {
                          setForm(
                            (previous) => ({
                              ...previous,
                              tipo:
                                TYPE_VALUES[
                                  event.target.value
                                ],
                            })
                          );
                        }}
                        disabled={submitting}
                      >

                        <option value="Cliente">
                          Cliente
                        </option>

                        <option value="Fornecedor">
                          Fornecedor
                        </option>

                        <option value="Administrador">
                          Administrador
                        </option>

                      </select>

                    </div>

                  </div>

                  {/* PASSWORD */}

                  <div className="user-form-field full">

                    <label htmlFor="user-password">

                      {modal === 'create'
                        ? 'Senha'
                        : 'Nova senha'}

                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-lock" />

                      <input
                        id="user-password"
                        name="senha"
                        type="password"
                        value={form.senha}
                        onChange={handleFormChange}
                        placeholder={
                          modal === 'create'
                            ? 'Digite a senha'
                            : 'Deixe vazio para manter a senha atual'
                        }
                        minLength={6}
                        required={
                          modal === 'create'
                        }
                        disabled={submitting}
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
                        ? 'Criar usuário'
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
        selectedUser && (

          <div
            className="users-modal-backdrop"
            onMouseDown={(event) => {

              if (
                event.target === event.currentTarget
              ) {
                closeModal();
              }

            }}
          >

            <div
              className="users-modal users-delete-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-user-title"
            >

              <div className="users-delete-content">

                <div className="users-delete-icon">
                  <i className="bi bi-trash3" />
                </div>

                <span className="users-modal-label">
                  Atenção
                </span>

                <h2 id="delete-user-title">
                  Excluir usuário?
                </h2>

                <p>

                  Você está prestes a excluir o usuário{' '}

                  <strong>
                    {selectedUser.nome}
                  </strong>

                  . Essa ação não poderá ser desfeita.

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

                  {submitting ? (
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

                      Excluir usuário
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