'use client';

import '../tables.css'

import { useMemo, useState } from 'react';

const initialUsers = [
  {
    id: 1,
    name: 'Mariana Costa',
    email: 'mariana.costa@email.com',
    type: 'Cliente',
    registeredAt: '13 Ago, 2026',
    status: 'Ativo',
    initials: 'MC',
  },
  {
    id: 2,
    name: 'Lucas Almeida',
    email: 'lucas.almeida@email.com',
    type: 'Fornecedor',
    registeredAt: '13 Ago, 2026',
    status: 'Ativo',
    initials: 'LA',
  },
  {
    id: 3,
    name: 'Ana Beatriz',
    email: 'ana.beatriz@email.com',
    type: 'Cliente',
    registeredAt: '12 Ago, 2026',
    status: 'Pendente',
    initials: 'AB',
  },
  {
    id: 4,
    name: 'Gabriel Souza',
    email: 'gabriel.souza@email.com',
    type: 'Administrador',
    registeredAt: '12 Ago, 2026',
    status: 'Ativo',
    initials: 'GS',
  },
  {
    id: 5,
    name: 'Julia Martins',
    email: 'julia.martins@email.com',
    type: 'Cliente',
    registeredAt: '11 Ago, 2026',
    status: 'Inativo',
    initials: 'JM',
  },
  {
    id: 6,
    name: 'Rafael Oliveira',
    email: 'rafael.oliveira@email.com',
    type: 'Fornecedor',
    registeredAt: '10 Ago, 2026',
    status: 'Ativo',
    initials: 'RO',
  },
  {
    id: 7,
    name: 'Beatriz Santos',
    email: 'beatriz.santos@email.com',
    type: 'Cliente',
    registeredAt: '09 Ago, 2026',
    status: 'Ativo',
    initials: 'BS',
  },
  {
    id: 8,
    name: 'Pedro Henrique',
    email: 'pedro.henrique@email.com',
    type: 'Cliente',
    registeredAt: '08 Ago, 2026',
    status: 'Pendente',
    initials: 'PH',
  },
];

const emptyForm = {
  name: '',
  email: '',
  type: 'Cliente',
  status: 'Ativo',
};

function getInitials(name) {
  if (!name) return '--';

  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers);

  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [modal, setModal] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const usersPerPage = 5;

  /*
   * =====================================================
   * FILTER
   * =====================================================
   */

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return users;
    }

    return users.filter((user) =>
      [
        user.name,
        user.email,
        user.type,
        user.status,
      ].some((value) =>
        value.toLowerCase().includes(term)
      )
    );
  }, [users, search]);

  /*
   * =====================================================
   * PAGINATION
   * =====================================================
   */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / usersPerPage)
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * usersPerPage;

  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + usersPerPage
  );

  /*
   * =====================================================
   * MODAL
   * =====================================================
   */

  const closeModal = () => {
    setModal(null);
    setSelectedUser(null);
    setForm(emptyForm);
  };

  const openCreateModal = () => {
    setSelectedUser(null);
    setForm(emptyForm);
    setModal('create');
  };

  const openEditModal = (user) => {
    setSelectedUser(user);

    setForm({
      name: user.name,
      email: user.email,
      type: user.type,
      status: user.status,
    });

    setModal('edit');
  };

  const openDeleteModal = (user) => {
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
   * CREATE / EDIT
   * =====================================================
   */

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();

    if (!name || !email) {
      return;
    }

    if (modal === 'create') {
      const newUser = {
        id: Date.now(),
        name,
        email,
        type: form.type,
        status: form.status,
        registeredAt: '13 Ago, 2026',
        initials: getInitials(name),
      };

      setUsers((previous) => [
        newUser,
        ...previous,
      ]);

      setCurrentPage(1);
    }

    if (modal === 'edit' && selectedUser) {
      setUsers((previous) =>
        previous.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                name,
                email,
                type: form.type,
                status: form.status,
                initials: getInitials(name),
              }
            : user
        )
      );
    }

    closeModal();
  };

  /*
   * =====================================================
   * DELETE
   * =====================================================
   */

  const handleDelete = () => {
    if (!selectedUser) {
      return;
    }

    setUsers((previous) =>
      previous.filter(
        (user) => user.id !== selectedUser.id
      )
    );

    closeModal();
  };

  /*
   * =====================================================
   * SEARCH
   * =====================================================
   */

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
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
              Novo usuário
            </button>

          </div>

        </section>

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
                  <th>Usuário</th>
                  <th>E-mail</th>
                  <th>Tipo</th>
                  <th>Cadastro</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>

                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (

                    <tr key={user.id}>

                      {/* USER */}

                      <td>
                        <div className="user-cell">

                          <div className="user-avatar">
                            {user.initials}
                          </div>

                          <div className="user-information">

                            <span className="user-name">
                              {user.name}
                            </span>

                            <span className="user-id">
                              ID #
                              {String(user.id).padStart(4, '0')}
                            </span>

                          </div>

                        </div>
                      </td>

                      {/* EMAIL */}

                      <td>
                        <span className="user-email">
                          {user.email}
                        </span>
                      </td>

                      {/* TYPE */}

                      <td>
                        <span
                          className={`user-type ${user.type
                            .toLowerCase()
                            .replace('ã', 'a')
                            .replace(' ', '-')}`}
                        >
                          {user.type}
                        </span>
                      </td>

                      {/* DATE */}

                      <td>
                        <span className="table-muted">
                          {user.registeredAt}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`user-status ${
                            user.status === 'Ativo'
                              ? 'success'
                              : user.status === 'Pendente'
                              ? 'warning'
                              : 'danger'
                          }`}
                        >
                          <span />
                          {user.status}
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
                      colSpan="6"
                      className="users-empty"
                    >

                      <div className="users-empty-content">

                        <div className="users-empty-icon">
                          <i className="bi bi-person-x" />
                        </div>

                        <strong>
                          Nenhum usuário encontrado
                        </strong>

                        <span>
                          Tente buscar por outro nome ou e-mail.
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
                {currentUsers.length}
              </strong>{' '}
              de{' '}
              <strong>
                {filteredUsers.length}
              </strong>{' '}
              usuários
            </span>

            <nav aria-label="Paginação de usuários">

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
                    disabled={safeCurrentPage === 1}
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          Math.max(1, page - 1)
                      )
                    }
                  >
                    <i className="bi bi-chevron-left" />
                  </button>

                </li>

                {Array.from(
                  { length: totalPages },
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
                        setCurrentPage(page)
                      }
                    >
                      {page}
                    </button>

                  </li>

                ))}

                <li
                  className={`page-item ${
                    safeCurrentPage === totalPages
                      ? 'disabled'
                      : ''
                  }`}
                >

                  <button
                    type="button"
                    className="page-link"
                    disabled={
                      safeCurrentPage === totalPages
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

      {(modal === 'create' || modal === 'edit') && (

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
              >
                <i className="bi bi-x-lg" />
              </button>

            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>

              <div className="users-modal-body">

                <div className="user-form-avatar">
                  {getInitials(form.name)}
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
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleFormChange}
                        placeholder="Digite o nome completo"
                        required
                      />

                    </div>

                  </div>

                  {/* EMAIL */}

                  <div className="user-form-field full">

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
                        name="type"
                        value={form.type}
                        onChange={handleFormChange}
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

                  {/* STATUS */}

                  <div className="user-form-field">

                    <label htmlFor="user-status">
                      Status
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-toggle-on" />

                      <select
                        id="user-status"
                        name="status"
                        value={form.status}
                        onChange={handleFormChange}
                      >
                        <option value="Ativo">
                          Ativo
                        </option>

                        <option value="Pendente">
                          Pendente
                        </option>

                        <option value="Inativo">
                          Inativo
                        </option>
                      </select>

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
                    ? 'Criar usuário'
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

      {modal === 'delete' && selectedUser && (

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
                  {selectedUser.name}
                </strong>
                . Essa ação não poderá ser desfeita.
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
                Excluir usuário
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}