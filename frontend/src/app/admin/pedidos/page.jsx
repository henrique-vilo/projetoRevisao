'use client';

import '../tables.css';

import { useMemo, useState } from 'react';

const initialOrders = [
  {
    id: 8492,
    customer: 'Mariana Costa',
    email: 'mariana.costa@email.com',
    product: 'Plano Enterprise',
    date: '13 Ago, 2026',
    value: 2490,
    status: 'Concluído',
  },
  {
    id: 8491,
    customer: 'Lucas Almeida',
    email: 'lucas.almeida@email.com',
    product: 'Plano Professional',
    date: '13 Ago, 2026',
    value: 890,
    status: 'Em andamento',
  },
  {
    id: 8490,
    customer: 'Ana Beatriz',
    email: 'ana.beatriz@email.com',
    product: 'Plano Starter',
    date: '12 Ago, 2026',
    value: 249,
    status: 'Pendente',
  },
  {
    id: 8489,
    customer: 'Gabriel Souza',
    email: 'gabriel.souza@email.com',
    product: 'Plano Enterprise',
    date: '12 Ago, 2026',
    value: 2490,
    status: 'Concluído',
  },
  {
    id: 8488,
    customer: 'Julia Martins',
    email: 'julia.martins@email.com',
    product: 'Plano Professional',
    date: '11 Ago, 2026',
    value: 890,
    status: 'Cancelado',
  },
  {
    id: 8487,
    customer: 'Rafael Oliveira',
    email: 'rafael.oliveira@email.com',
    product: 'Plano Starter',
    date: '10 Ago, 2026',
    value: 249,
    status: 'Concluído',
  },
  {
    id: 8486,
    customer: 'Beatriz Santos',
    email: 'beatriz.santos@email.com',
    product: 'Plano Enterprise',
    date: '09 Ago, 2026',
    value: 2490,
    status: 'Pendente',
  },
  {
    id: 8485,
    customer: 'Pedro Henrique',
    email: 'pedro.henrique@email.com',
    product: 'Plano Professional',
    date: '08 Ago, 2026',
    value: 890,
    status: 'Em andamento',
  },
];

const emptyForm = {
  customer: '',
  email: '',
  product: 'Plano Starter',
  value: '',
  status: 'Pendente',
};

function getStatusClass(status) {
  if (status === 'Concluído') {
    return 'success';
  }

  if (status === 'Em andamento') {
    return 'info';
  }

  if (status === 'Pendente') {
    return 'warning';
  }

  return 'danger';
}

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(initialOrders);

  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [modal, setModal] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const ordersPerPage = 5;

  /*
   * =====================================================
   * FILTER
   * =====================================================
   */

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return orders;
    }

    return orders.filter((order) =>
      [
        `#ORD-${order.id}`,
        order.customer,
        order.email,
        order.product,
        order.date,
        String(order.value),
        formatCurrency(order.value),
        order.status,
      ].some((value) =>
        value.toLowerCase().includes(term)
      )
    );
  }, [orders, search]);

  /*
   * =====================================================
   * PAGINATION
   * =====================================================
   */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredOrders.length / ordersPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * ordersPerPage;

  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + ordersPerPage
  );

  /*
   * =====================================================
   * MODALS
   * =====================================================
   */

  const closeModal = () => {
    setModal(null);
    setSelectedOrder(null);
    setForm(emptyForm);
  };

  const openCreateModal = () => {
    setSelectedOrder(null);
    setForm(emptyForm);
    setModal('create');
  };

  const openEditModal = (order) => {
    setSelectedOrder(order);

    setForm({
      customer: order.customer,
      email: order.email,
      product: order.product,
      value: String(order.value),
      status: order.status,
    });

    setModal('edit');
  };

  const openDeleteModal = (order) => {
    setSelectedOrder(order);
    setModal('delete');
  };

  /*
   * =====================================================
   * FORM
   * =====================================================
   */

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    /*
     * O campo de valor não pode aceitar
     * números negativos.
     */

    if (name === 'value') {
      if (
        value !== '' &&
        Number(value) < 0
      ) {
        return;
      }
    }

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

    const customer = form.customer.trim();
    const email = form.email.trim();
    const value = form.value.trim();

    if (
      !customer ||
      !email ||
      !value
    ) {
      return;
    }

    const numericValue = Number(value);

    /*
     * Validação final do valor.
     *
     * Não permite:
     * - NaN
     * - valores negativos
     */

    if (
      Number.isNaN(numericValue) ||
      numericValue < 0
    ) {
      return;
    }

    /*
     * CREATE
     */

    if (modal === 'create') {
      const newOrder = {
        id:
          Math.max(
            ...orders.map(
              (order) => order.id
            ),
            0
          ) + 1,

        customer,

        email,

        product: form.product,

        value: numericValue,

        status: form.status,

        date: '13 Ago, 2026',
      };

      setOrders((previous) => [
        newOrder,
        ...previous,
      ]);

      setCurrentPage(1);
    }

    /*
     * EDIT
     */

    if (
      modal === 'edit' &&
      selectedOrder
    ) {
      setOrders((previous) =>
        previous.map((order) =>
          order.id === selectedOrder.id
            ? {
                ...order,

                customer,

                email,

                product: form.product,

                value: numericValue,

                status: form.status,
              }
            : order
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
    if (!selectedOrder) {
      return;
    }

    setOrders((previous) =>
      previous.filter(
        (order) =>
          order.id !== selectedOrder.id
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
              Operação
            </span>

            <h1>
              Pedidos
            </h1>

            <p>
              Gerencie os pedidos realizados na plataforma.
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
              Novo pedido
            </button>

          </div>

        </section>

        {/* =================================================
            ORDERS CARD
        ================================================= */}

        <section className="users-card">

          {/* CARD HEADER */}

          <div className="users-card-header">

            <div>

              <span className="users-card-label">
                Gerenciamento
              </span>

              <h2>
                Pedidos cadastrados
              </h2>

            </div>

            <div className="users-card-header-right">

              <div className="users-search">

                <i className="bi bi-search" />

                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Buscar pedido..."
                  aria-label="Buscar pedido"
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
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Produto</th>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>

              </thead>

              <tbody>

                {currentOrders.length > 0 ? (

                  currentOrders.map((order) => (

                    <tr key={order.id}>

                      {/* ORDER */}

                      <td>

                        <span className="order-table-id">
                          #ORD-{order.id}
                        </span>

                      </td>

                      {/* CUSTOMER */}

                      <td>

                        <div className="user-cell">

                          <div className="user-avatar">
                            {order.customer
                              .split(' ')
                              .slice(0, 2)
                              .map(
                                (word) =>
                                  word[0]
                              )
                              .join('')
                              .toUpperCase()}
                          </div>

                          <div className="user-information">

                            <span className="user-name">
                              {order.customer}
                            </span>

                            <span className="user-id">
                              {order.email}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* PRODUCT */}

                      <td>

                        <span className="order-product">
                          {order.product}
                        </span>

                      </td>

                      {/* DATE */}

                      <td>

                        <span className="table-muted">
                          {order.date}
                        </span>

                      </td>

                      {/* VALUE */}

                      <td>

                        <strong className="order-table-value">
                          {formatCurrency(
                            order.value
                          )}
                        </strong>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`user-status ${getStatusClass(
                            order.status
                          )}`}
                        >

                          <span />

                          {order.status}

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
                                order
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
                                order
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
                      colSpan="7"
                      className="users-empty"
                    >

                      <div className="users-empty-content">

                        <div className="users-empty-icon">
                          <i className="bi bi-receipt" />
                        </div>

                        <strong>
                          Nenhum pedido encontrado
                        </strong>

                        <span>
                          Tente buscar por outro pedido ou cliente.
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
                {currentOrders.length}
              </strong>{' '}
              de{' '}
              <strong>
                {filteredOrders.length}
              </strong>{' '}
              pedidos
            </span>

            <nav aria-label="Paginação de pedidos">

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
                        setCurrentPage(
                          page
                        )
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
            aria-labelledby="order-modal-title"
          >

            {/* HEADER */}

            <div className="users-modal-header">

              <div>

                <span className="users-modal-label">
                  {modal === 'create'
                    ? 'Novo pedido'
                    : 'Gerenciamento'}
                </span>

                <h2 id="order-modal-title">
                  {modal === 'create'
                    ? 'Criar pedido'
                    : 'Editar pedido'}
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

            <form
              onSubmit={handleSubmit}
            >

              <div className="users-modal-body">

                <div className="order-modal-icon">
                  <i className="bi bi-bag-check" />
                </div>

                <div className="user-form-grid">

                  {/* CUSTOMER */}

                  <div className="user-form-field">

                    <label htmlFor="order-customer">
                      Cliente
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-person" />

                      <input
                        id="order-customer"
                        name="customer"
                        type="text"
                        value={
                          form.customer
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Nome do cliente"
                        required
                      />

                    </div>

                  </div>

                  {/* EMAIL */}

                  <div className="user-form-field">

                    <label htmlFor="order-email">
                      E-mail
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-envelope" />

                      <input
                        id="order-email"
                        name="email"
                        type="email"
                        value={
                          form.email
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="cliente@email.com"
                        required
                      />

                    </div>

                  </div>

                  {/* PRODUCT */}

                  <div className="user-form-field">

                    <label htmlFor="order-product">
                      Produto
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-box-seam" />

                      <select
                        id="order-product"
                        name="product"
                        value={
                          form.product
                        }
                        onChange={
                          handleFormChange
                        }
                      >

                        <option value="Plano Starter">
                          Plano Starter
                        </option>

                        <option value="Plano Professional">
                          Plano Professional
                        </option>

                        <option value="Plano Enterprise">
                          Plano Enterprise
                        </option>

                      </select>

                    </div>

                  </div>

                  {/* VALUE */}

                  <div className="user-form-field">

                    <label htmlFor="order-value">
                      Valor
                    </label>

                    <div className="user-input-wrapper currency-input-wrapper">

                      <span className="input-currency">
                        R$
                      </span>

                      <input
                        id="order-value"
                        name="value"
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          form.value
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="0,00"
                        required
                      />

                    </div>

                  </div>

                  {/* STATUS */}

                  <div className="user-form-field full">

                    <label htmlFor="order-status">
                      Status
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-circle-half" />

                      <select
                        id="order-status"
                        name="status"
                        value={
                          form.status
                        }
                        onChange={
                          handleFormChange
                        }
                      >

                        <option value="Pendente">
                          Pendente
                        </option>

                        <option value="Em andamento">
                          Em andamento
                        </option>

                        <option value="Concluído">
                          Concluído
                        </option>

                        <option value="Cancelado">
                          Cancelado
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
                  onClick={
                    closeModal
                  }
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
                    ? 'Criar pedido'
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
        selectedOrder && (

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
              aria-labelledby="delete-order-title"
            >

              <div className="users-delete-content">

                <div className="users-delete-icon">
                  <i className="bi bi-trash3" />
                </div>

                <span className="users-modal-label">
                  Atenção
                </span>

                <h2 id="delete-order-title">
                  Excluir pedido?
                </h2>

                <p>
                  Você está prestes a excluir
                  o pedido{' '}
                  <strong>
                    #ORD-
                    {selectedOrder.id}
                  </strong>{' '}
                  de{' '}
                  <strong>
                    {
                      selectedOrder.customer
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
                  onClick={
                    closeModal
                  }
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="users-modal-btn danger"
                  onClick={
                    handleDelete
                  }
                >
                  <i className="bi bi-trash" />
                  Excluir pedido
                </button>

              </div>

            </div>

          </div>

        )}

    </>
  );
}