'use client';

import '../tables.css';

import { useCallback, useEffect, useMemo, useState } from 'react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const ITEMS_PER_PAGE = 10;

const STATUS_CONFIG = {
  carrinho: {
    label: 'Carrinho',
    className: 'warning',
  },

  pendente: {
    label: 'Pendente',
    className: 'warning',
  },

  processando: {
    label: 'Processando',
    className: 'info',
  },

  enviado: {
    label: 'Enviado',
    className: 'info',
  },

  entregue: {
    label: 'Entregue',
    className: 'success',
  },

  cancelado: {
    label: 'Cancelado',
    className: 'danger',
  },
};

const emptyForm = {
  idUsuario: '',
  idProduto: '',
  status: 'carrinho',
};

function getToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('authToken')
  );
}

function getStatusConfig(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status || 'Desconhecido',
      className: 'danger',
    }
  );
}

function formatDate(date) {
  if (!date) {
    return '—';
  }

  if (typeof date === 'string' && date.includes('/')) {
    return date;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '—';
  }

  return parsedDate.toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
  });
}

function formatCurrency(value) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '—';
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return '—';
  }

  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalOrders, setTotalOrders] = useState(0);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState('');

  const [modal, setModal] = useState(null);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);

  /*
   * =====================================================
   * API REQUEST
   * =====================================================
   */

  const apiRequest = useCallback(
    async (endpoint, options = {}) => {
      const token = getToken();

      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          ...options,
          headers,
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.mensagem ||
            data?.erro ||
            'Não foi possível realizar a operação.'
        );
      }

      return data;
    },
    []
  );

  /*
   * =====================================================
   * LOAD ORDERS
   * =====================================================
   */

  const loadOrders = useCallback(
    async (page = 1, showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        const response = await apiRequest(
          `/vendas?pagina=${page}&limite=${ITEMS_PER_PAGE}`
        );

        const vendas = Array.isArray(response?.dados)
          ? response.dados
          : [];

        setOrders(vendas);

        setTotalOrders(
          Number(response?.paginacao?.total) || 0
        );

        setTotalPages(
          Math.max(
            1,
            Number(
              response?.paginacao?.totalPaginas
            ) || 1
          )
        );

        setCurrentPage(
          Number(
            response?.paginacao?.pagina
          ) || page
        );
      } catch (requestError) {
        console.error(
          'Erro ao carregar pedidos:',
          requestError
        );

        setOrders([]);

        setError(
          requestError.message ||
            'Não foi possível carregar os pedidos.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
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
    loadOrders(1);
  }, [loadOrders]);

  /*
   * =====================================================
   * FILTER
   * =====================================================
   */

  const filteredOrders = useMemo(() => {
    const term = search
      .trim()
      .toLowerCase();

    if (!term) {
      return orders;
    }

    return orders.filter((order) => {
      const status =
        getStatusConfig(order.status).label;

      const values = [
        order.idVendas,
        order.idUsuario,
        order.idProduto,
        order.status,
        status,
        order.dataPedido,
        order.dataPedidoBR,
        order.dataEntrega,
        order.dataEntregaBR,
        order.valor,
        order.preco,
        order.total,
      ];

      return values.some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(term)
      );
    });
  }, [orders, search]);

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
   * PAGINATION
   * =====================================================
   */

  const goToPage = (page) => {
    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    loadOrders(page);
  };

  /*
   * =====================================================
   * MODALS
   * =====================================================
   */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModal(null);
    setSelectedOrder(null);
    setForm(emptyForm);
  };

  const openCreateModal = () => {
    setSelectedOrder(null);

    setForm({
      ...emptyForm,
    });

    setModal('create');
  };

  const openEditModal = (order) => {
    setSelectedOrder(order);

    setForm({
      idUsuario:
        order.idUsuario?.toString() || '',

      idProduto:
        order.idProduto?.toString() || '',

      status:
        order.status || 'carrinho',
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

  const createOrder = async () => {
    const idUsuario = Number(form.idUsuario);

    const idProduto = Number(form.idProduto);

    if (
      !Number.isInteger(idUsuario) ||
      idUsuario <= 0
    ) {
      setError(
        'Informe um ID de usuário válido.'
      );

      return;
    }

    if (
      !Number.isInteger(idProduto) ||
      idProduto <= 0
    ) {
      setError(
        'Informe um ID de produto válido.'
      );

      return;
    }

    try {
      setSaving(true);
      setError('');

      await apiRequest('/vendas/carrinho', {
        method: 'POST',

        body: JSON.stringify({
          idUsuario,
          idProduto,
        }),
      });

      closeModal();

      await loadOrders(currentPage, true);
    } catch (requestError) {
      console.error(
        'Erro ao criar pedido:',
        requestError
      );

      setError(
        requestError.message ||
          'Não foi possível criar o pedido.'
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * =====================================================
   * EDIT
   * =====================================================
   */

  const updateOrder = async () => {
    if (!selectedOrder) {
      return;
    }

    const idUsuario = Number(form.idUsuario);

    const idProduto = Number(form.idProduto);

    if (
      !Number.isInteger(idUsuario) ||
      idUsuario <= 0
    ) {
      setError(
        'Informe um ID de usuário válido.'
      );

      return;
    }

    if (
      !Number.isInteger(idProduto) ||
      idProduto <= 0
    ) {
      setError(
        'Informe um ID de produto válido.'
      );

      return;
    }

    try {
      setSaving(true);
      setError('');

      await apiRequest(
        `/vendas/${selectedOrder.idVendas}`,
        {
          method: 'PUT',

          body: JSON.stringify({
            idUsuario,
            idProduto,
            status: form.status,
          }),
        }
      );

      closeModal();

      await loadOrders(currentPage, true);
    } catch (requestError) {
      console.error(
        'Erro ao atualizar pedido:',
        requestError
      );

      setError(
        requestError.message ||
          'Não foi possível atualizar o pedido.'
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * =====================================================
   * SUBMIT
   * =====================================================
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (modal === 'create') {
      await createOrder();
      return;
    }

    if (modal === 'edit') {
      await updateOrder();
    }
  };

  /*
   * =====================================================
   * DELETE
   * =====================================================
   */

  const handleDelete = async () => {
    if (!selectedOrder) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      await apiRequest(
        `/vendas/${selectedOrder.idVendas}`,
        {
          method: 'DELETE',
        }
      );

      closeModal();

      const pageAfterDelete =
        orders.length === 1 &&
        currentPage > 1
          ? currentPage - 1
          : currentPage;

      await loadOrders(
        pageAfterDelete,
        true
      );
    } catch (requestError) {
      console.error(
        'Erro ao excluir pedido:',
        requestError
      );

      setError(
        requestError.message ||
          'Não foi possível excluir o pedido.'
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * =====================================================
   * REFRESH
   * =====================================================
   */

  const handleRefresh = () => {
    setSearch('');
    loadOrders(currentPage, true);
  };

  /*
   * =====================================================
   * PAGE
   * =====================================================
   */

  return (
    <>
      <main className="users-page">
        {/*
         * =================================================
         * PAGE HEADER
         * =================================================
         */}

        <section className="users-heading">
          <div>
            <span className="users-eyebrow">
              Operação
            </span>

            <h1>
              Pedidos
            </h1>

            <p>
              Gerencie os pedidos realizados na
              plataforma.
            </p>
          </div>

          <div className="users-heading-actions">
            <button
              type="button"
              className="users-btn users-btn-secondary"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <i
                className={`bi ${
                  refreshing
                    ? 'bi-arrow-repeat'
                    : 'bi-arrow-clockwise'
                }`}
              />

              {refreshing
                ? 'Atualizando...'
                : 'Atualizar'}
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

        {/*
         * =================================================
         * ERROR
         * =================================================
         */}

        {error && (
          <div
            className="alert alert-danger d-flex align-items-center justify-content-between"
            role="alert"
          >
            <div>
              <i className="bi bi-exclamation-triangle me-2" />

              {error}
            </div>

            <button
              type="button"
              className="btn-close"
              aria-label="Fechar"
              onClick={() => setError('')}
            />
          </div>
        )}

        {/*
         * =================================================
         * ORDERS CARD
         * =================================================
         */}

        <section className="users-card">
          {/*
           * CARD HEADER
           */}

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

          {/*
           * TABLE
           */}

          <div className="table-responsive users-table-wrapper">
            <table className="table users-table align-middle">
              <thead>
                <tr>
                  <th>Pedido</th>

                  <th>Usuário</th>

                  <th>Produto</th>

                  <th>Data do pedido</th>

                  <th>Entrega</th>

                  <th>Status</th>

                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="users-empty"
                    >
                      <div className="users-empty-content">
                        <div className="users-empty-icon">
                          <i className="bi bi-arrow-repeat" />
                        </div>

                        <strong>
                          Carregando pedidos...
                        </strong>

                        <span>
                          Buscando os dados no servidor.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const status =
                      getStatusConfig(
                        order.status
                      );

                    return (
                      <tr
                        key={order.idVendas}
                      >
                        {/*
                         * ORDER
                         */}

                        <td>
                          <span className="order-table-id">
                            #ORD-{order.idVendas}
                          </span>
                        </td>

                        {/*
                         * USER
                         */}

                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">
                              U
                            </div>

                            <div className="user-information">
                              <span className="user-name">
                                Usuário #{order.idUsuario}
                              </span>

                              <span className="user-id">
                                ID {order.idUsuario}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/*
                         * PRODUCT
                         */}

                        <td>
                          <span className="order-product">
                            Produto #{order.idProduto}
                          </span>
                        </td>

                        {/*
                         * ORDER DATE
                         */}

                        <td>
                          <span className="table-muted">
                            {formatDate(
                              order.dataPedidoBR ||
                                order.dataPedido
                            )}
                          </span>
                        </td>

                        {/*
                         * DELIVERY DATE
                         */}

                        <td>
                          <span className="table-muted">
                            {formatDate(
                              order.dataEntregaBR ||
                                order.dataEntrega
                            )}
                          </span>
                        </td>

                        {/*
                         * STATUS
                         */}

                        <td>
                          <span
                            className={`user-status ${status.className}`}
                          >
                            <span />

                            {status.label}
                          </span>
                        </td>

                        {/*
                         * ACTIONS
                         */}

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
                    );
                  })
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
                          {search
                            ? 'Tente buscar por outro pedido ou usuário.'
                            : 'Não existem pedidos cadastrados.'}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/*
           * =================================================
           * TABLE FOOTER
           * =================================================
           */}

          <div className="users-table-footer">
            <span>
              Mostrando{' '}
              <strong>
                {filteredOrders.length}
              </strong>{' '}
              de{' '}
              <strong>
                {totalOrders}
              </strong>{' '}
              pedidos
            </span>

            <nav aria-label="Paginação de pedidos">
              <ul className="pagination users-pagination">
                <li
                  className={`page-item ${
                    currentPage === 1 ||
                    loading
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
                    currentPage ===
                      totalPages ||
                    loading
                      ? 'disabled'
                      : ''
                  }`}
                >
                  <button
                    type="button"
                    className="page-link"
                    disabled={
                      currentPage ===
                        totalPages ||
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

      {/*
       * ===================================================
       * CREATE / EDIT MODAL
       * ===================================================
       */}

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
            {/*
             * HEADER
             */}

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
                disabled={saving}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {/*
             * FORM
             */}

            <form onSubmit={handleSubmit}>
              <div className="users-modal-body">
                <div className="order-modal-icon">
                  <i className="bi bi-bag-check" />
                </div>

                <div className="user-form-grid">
                  {/*
                   * USER
                   */}

                  <div className="user-form-field">
                    <label htmlFor="order-user">
                      ID do usuário
                    </label>

                    <div className="user-input-wrapper">
                      <i className="bi bi-person" />

                      <input
                        id="order-user"
                        name="idUsuario"
                        type="number"
                        min="1"
                        value={
                          form.idUsuario
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Ex.: 15"
                        required
                      />
                    </div>
                  </div>

                  {/*
                   * PRODUCT
                   */}

                  <div className="user-form-field">
                    <label htmlFor="order-product">
                      ID do produto
                    </label>

                    <div className="user-input-wrapper">
                      <i className="bi bi-box-seam" />

                      <input
                        id="order-product"
                        name="idProduto"
                        type="number"
                        min="1"
                        value={
                          form.idProduto
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Ex.: 42"
                        required
                      />
                    </div>
                  </div>

                  {/*
                   * STATUS
                   */}

                  {modal === 'edit' && (
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
                          <option value="carrinho">
                            Carrinho
                          </option>

                          <option value="pendente">
                            Pendente
                          </option>

                          <option value="processando">
                            Processando
                          </option>

                          <option value="enviado">
                            Enviado
                          </option>

                          <option value="entregue">
                            Entregue
                          </option>

                          <option value="cancelado">
                            Cancelado
                          </option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/*
               * FOOTER
               */}

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
                    ? 'Criar pedido'
                    : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/*
       * ===================================================
       * DELETE MODAL
       * ===================================================
       */}

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
                    {
                      selectedOrder.idVendas
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
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="users-modal-btn danger"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  <i
                    className={
                      saving
                        ? 'bi bi-arrow-repeat'
                        : 'bi bi-trash'
                    }
                  />

                  {saving
                    ? 'Excluindo...'
                    : 'Excluir pedido'}
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}