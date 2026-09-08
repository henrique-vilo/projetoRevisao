'use client';

import '../tables.css';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getPaginationItems } from '../adminPagination';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/+$/, '');

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
  status: 'pendente',
  dataEntrega: '',
};

function getToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('jwt')
  );
}

function getHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getStatusConfig(status) {
  // Remove espaços em branco do início/fim da string antes de comparar
  const normalizedStatus = status ? String(status).trim().toLowerCase() : '';
  return (
    STATUS_CONFIG[normalizedStatus] || {
      label: normalizedStatus ? String(status) : 'Status não informado pela API',
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

function toDateInputValue(date) {
  if (!date) return '';
  if (typeof date === 'string') {
    const match = date.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime()) ? '' : parsedDate.toISOString().slice(0, 10);
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '');
}

function getOrderId(order) {
  const id = firstValue(order?.idVendas, order?.idVenda, order?.id);
  return /^\d+$/.test(String(id)) && Number.isSafeInteger(Number(id)) && Number(id) > 0 ? String(id) : null;
}

function getOrderStatus(order) {
  return String(firstValue(order?.status, order?.STATUS, order?.statusVenda, order?.statusVendas, order?.statusPedido, order?.statusEnvio) ?? '').trim().toLowerCase();
}

function normalizeOrder(order) {
  if (!order || typeof order !== 'object' || Array.isArray(order)) {
    throw new Error('A API retornou um pedido em formato inválido.');
  }
  return {
    ...order,
    status: getOrderStatus(order),
    idUsuario: firstValue(order.idUsuario, order.usuario?.idUsuario, order.usuario?.id),
    idProduto: firstValue(order.idProduto, order.produto?.idProduto, order.produto?.id),
    nomeUsuario: firstValue(order.nomeUsuario, order.usuario?.nome),
    nomeProduto: firstValue(order.nomeProduto, order.produto?.nome),
  };
}

function readOrders(response) {
  const rows = Array.isArray(response) ? response : response?.dados;
  if (!Array.isArray(rows)) {
    throw new Error('A API deve retornar uma lista em dados e os totais em paginacao. Confira o controller de vendas.');
  }
  return rows.map(normalizeOrder);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const requestSequence = useRef(0);
  const mutationLock = useRef(false);
  const [modalError, setModalError] = useState('');
  const [success, setSuccess] = useState('');

  const apiRequest = useCallback(
    async (endpoint, options = {}) => {
      const headers = {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...getHeaders(),
        ...(options.headers || {}),
      };

      let response;

      try {
        response = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          cache: 'no-store',
          headers,
        });
      } catch (networkError) {
        console.error('Falha de rede ao chamar', endpoint, networkError);
        throw new Error(
          'Não foi possível conectar ao servidor. Verifique se a API está no ar e se NEXT_PUBLIC_API_URL está correto.'
        );
      }

      let rawText = '';
      let data = null;

      try {
        rawText = await response.text();
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!response.ok || (data && data.sucesso === false)) {
        console.error(
          `Erro em ${options.method || 'GET'} ${endpoint}:`,
          response.status,
          rawText || '(sem corpo)'
        );

        throw new Error(
          data?.mensagem ||
            data?.erro ||
            `Não foi possível realizar a operação (HTTP ${response.status}).`
        );
      }

      if (rawText && data === null) {
        throw new Error('A API retornou conteúdo inválido; era esperado JSON. Confira a URL e as rotas de vendas.');
      }
      return data;
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const loadOrders = useCallback(
    async (page = 1, showRefresh = false) => {
      const sequence = ++requestSequence.current;
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        const params = new URLSearchParams();
        params.set('pagina', page);
        params.set('limite', ITEMS_PER_PAGE);

        if (debouncedSearch.trim()) {
          params.set('busca', debouncedSearch.trim());
        }

        const response = await apiRequest(
          `/vendas?${params.toString()}`
        );

        if (sequence !== requestSequence.current) return;
        const vendas = readOrders(response);
        const pagination = response?.paginacao;
        const total = Number(pagination?.total ?? vendas.length);
        const pages = Number(pagination?.totalPaginas ?? Math.ceil(total / ITEMS_PER_PAGE));
        if (!Number.isSafeInteger(total) || total < 0 || !Number.isSafeInteger(pages) || pages < 0) {
          throw new Error('A API retornou totais de paginação inválidos.');
        }
        const lastPage = Math.max(1, pages);
        if (page > lastPage) {
          setCurrentPage(lastPage);
          return;
        }
        setOrders(vendas);
        setTotalOrders(total);
        setTotalPages(lastPage);
      } catch (requestError) {
        if (sequence !== requestSequence.current) return;
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
        if (sequence === requestSequence.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [apiRequest, debouncedSearch]
  );

  useEffect(() => {
    loadOrders(currentPage);
    return () => { requestSequence.current += 1; };
  }, [currentPage, loadOrders]);

  const goToPage = (page) => {
    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage ||
      loading
    ) {
      return;
    }

    setCurrentPage(page);
  };

  const closeModal = (force = false) => {
    if (saving && force !== true) {
      return;
    }

    setModalError('');
    setModal(null);
    setSelectedOrder(null);
    setForm(emptyForm);
  };

  const openCreateModal = () => {
    setModalError('');
    setSuccess('');
    setSelectedOrder(null);
    setForm({ ...emptyForm });
    setModal('create');
  };

  const openEditModal = async (order) => {
    if (!getOrderId(order) || mutationLock.current) return;
    mutationLock.current = true;
    setSaving(true);
    setModalError('');
    setSuccess('');
    try {
      const response = await apiRequest(`/vendas/${getOrderId(order)}`);
      const detail = normalizeOrder(response?.dados ?? response);
      if (getOrderId(detail) !== getOrderId(order)) throw new Error('A API retornou um pedido com ID diferente do solicitado.');
      order = detail;
    } catch (requestError) {
      setError(requestError.message);
      return;
    } finally {
      mutationLock.current = false;
      setSaving(false);
    }
    setSelectedOrder(order);
    
    const rawStatus = getOrderStatus(order);

    setForm({
      idUsuario: order.idUsuario?.toString() || '',
      idProduto: order.idProduto?.toString() || '',
      status: rawStatus,
      dataEntrega: toDateInputValue(order.dataEntrega),
    });

    setModal('edit');
  };

  const openDeleteModal = (order) => {
    if (!getOrderId(order)) return;
    setModalError('');
    setSuccess('');
    setSelectedOrder(order);
    setModal('delete');
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const idUsuario = Number(form.idUsuario);
    const idProduto = Number(form.idProduto);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      setModalError('Informe um ID de usuário válido.');
      return null;
    }

    if (!Number.isInteger(idProduto) || idProduto <= 0) {
      setModalError('Informe um ID de produto válido.');
      return null;
    }

    if (!Object.hasOwn(STATUS_CONFIG, form.status)) {
      setModalError('Selecione um status válido antes de salvar.');
      return null;
    }
    return { idUsuario, idProduto };
  };

  const createOrder = async () => {
    const values = validateForm();

    if (!values) {
      return;
    }

    if (mutationLock.current) return;
    mutationLock.current = true;
    try {
      setSaving(true);
      setModalError('');

      await apiRequest('/vendas', {
        method: 'POST',
        body: JSON.stringify({ ...values, status: form.status, dataEntrega: form.dataEntrega || null }),
      });

      closeModal(true);
      setSuccess('Operação realizada com sucesso.');
      await loadOrders(currentPage, true);
    } catch (requestError) {
      console.error('Erro ao criar pedido:', requestError);
      setModalError(
        requestError.message ||
          'Não foi possível criar o pedido.'
      );
    } finally {
      mutationLock.current = false;
      setSaving(false);
    }
  };

  const updateOrder = async () => {
    if (!selectedOrder) {
      return;
    }

    const values = validateForm();

    if (!values) {
      return;
    }

    if (mutationLock.current) return;
    mutationLock.current = true;
    try {
      setSaving(true);
      setModalError('');

      const orderId = getOrderId(selectedOrder);
      if (!orderId) throw new Error('Pedido sem ID válido. Confira o retorno da API.');

      await apiRequest(
        `/vendas/${orderId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            ...values,
            status: form.status,
            dataEntrega: form.dataEntrega || null,
          }),
        }
      );

      closeModal(true);
      setSuccess('Operação realizada com sucesso.');
      await loadOrders(currentPage, true);
    } catch (requestError) {
      console.error('Erro ao atualizar pedido:', requestError);
      setModalError(
        requestError.message ||
          'Não foi possível atualizar o pedido.'
      );
    } finally {
      mutationLock.current = false;
      setSaving(false);
    }
  };

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

  const handleDelete = async () => {
    if (!selectedOrder) {
      return;
    }

    if (mutationLock.current) return;
    mutationLock.current = true;
    try {
      setSaving(true);
      setModalError('');

      const orderId = getOrderId(selectedOrder);
      if (!orderId) throw new Error('Pedido sem ID válido. Confira o retorno da API.');

      await apiRequest(
        `/vendas/${orderId}`,
        {
          method: 'DELETE',
        }
      );

      closeModal(true);
      setSuccess('Operação realizada com sucesso.');

      const pageAfterDelete =
        orders.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;

      if (pageAfterDelete !== currentPage) setCurrentPage(pageAfterDelete);
      else await loadOrders(currentPage, true);
    } catch (requestError) {
      console.error('Erro ao excluir pedido:', requestError);
      setModalError(
        requestError.message ||
          'Não foi possível excluir o pedido.'
      );
    } finally {
      mutationLock.current = false;
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    loadOrders(currentPage, true);
  };

  const paginationRange = useMemo(
    () => getPaginationItems(currentPage, totalPages),
    [currentPage, totalPages]
  );

  return (
    <>
      <main className="users-page">
        <section className="users-heading">
          <div>
            <span className="users-eyebrow">
              Operação
            </span>
            <h1>Pedidos</h1>
            <p>Gerencie os pedidos realizados na plataforma.</p>
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
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </button>

            <button
              type="button"
              className="users-btn users-btn-primary"
              disabled={saving}
              onClick={openCreateModal}
            >
              <i className="bi bi-plus-lg" />
              Novo pedido
            </button>
          </div>
        </section>

        {success && <div className="alert alert-success" role="status">{success}</div>}
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

        <section className="users-card">
          <div className="users-card-header">
            <div>
              <span className="users-card-label">
                Gerenciamento
              </span>
              <h2>Pedidos cadastrados</h2>
            </div>

            <div className="users-card-header-right">
              <div className="users-search">
                <i className="bi bi-search" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por usuário, produto ou status..."
                  aria-label="Buscar pedido"
                />

                {search && (
                  <button
                    type="button"
                    className="users-search-clear"
                    onClick={() => setSearch('')}
                    aria-label="Limpar busca"
                  >
                    <i className="bi bi-x" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="table-responsive users-table-wrapper">
            <table className="table users-table orders-table admin-responsive-table align-middle">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Usuário</th>
                  <th>Produto</th>
                  <th>Data do pedido</th>
                  <th>Data de envio</th>
                  <th>Data de entrega</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="users-empty">
                      <div className="users-empty-content">
                        <div className="users-empty-icon">
                          <i className="bi bi-arrow-repeat" />
                        </div>
                        <strong>Carregando pedidos...</strong>
                        <span>Buscando os dados no servidor.</span>
                      </div>
                    </td>
                  </tr>
                ) : orders.length > 0 ? (
                  orders.map((order, index) => {
                    const rawStatus = getOrderStatus(order);
                    const status = getStatusConfig(rawStatus);
                    const orderId = getOrderId(order);

                    return (
                      <tr key={orderId || `invalid-${index}`}>
                        <td data-label="Pedido">
                          <span className="order-table-id">
                            {orderId ? `#ORD-${orderId}` : 'ID não informado'}
                          </span>
                        </td>

                        <td data-label="Usuário">
                          <div className="user-cell">
                            <div className="user-avatar">U</div>
                            <div className="user-information">
                              <span className="user-name">
                                {order.nomeUsuario || (order.idUsuario ? `Usuário #${order.idUsuario}` : 'Usuário não informado')}
                              </span>
                              <span className="user-id">
                                ID {order.idUsuario ?? '—'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td data-label="Produto">
                          <span className="order-product">
                            {order.nomeProduto || (order.idProduto ? `Produto #${order.idProduto}` : 'Produto não informado')}
                          </span>
                        </td>

                        <td data-label="Data do pedido">
                          <span className="table-muted">
                            {formatDate(order.dataPedidoBR || order.dataPedido)}
                          </span>
                        </td>

                        <td data-label="Data de envio">
                          <span className="table-muted admin-date-cell">
                            {formatDate(order.dataEnvioBR || order.dataEnvio)}
                          </span>
                        </td>

                        <td data-label="Data de entrega">
                          <span className="table-muted">
                            {formatDate(order.dataEntregaBR || order.dataEntrega)}
                          </span>
                        </td>

                        <td data-label="Status">
                          <span className={`user-status ${status.className}`}>
                            <span />
                            {status.label}
                          </span>
                        </td>

                        <td data-label="Ações">
                          <div className="user-actions">
                            <button
                              type="button"
                              className="user-action edit"
                              disabled={!orderId || saving}
                              onClick={() => openEditModal(order)}
                            >
                              <i className="bi bi-pencil" />
                              Editar
                            </button>

                            <button
                              type="button"
                              className="user-action delete"
                              disabled={!orderId || saving}
                              onClick={() => openDeleteModal(order)}
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
                    <td colSpan="8" className="users-empty">
                      <div className="users-empty-content">
                        <div className="users-empty-icon">
                          <i className="bi bi-receipt" />
                        </div>
                        <strong>Nenhum pedido encontrado</strong>
                        <span>
                          {search
                            ? 'Tente buscar por outro pedido, usuário ou status.'
                            : 'Não existem pedidos cadastrados.'}
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
              Mostrando <strong>{orders.length}</strong> de{' '}
              <strong>{totalOrders}</strong> pedidos
            </span>

            <nav aria-label="Paginação de pedidos">
              <ul className="pagination users-pagination">
                <li
                  className={`page-item ${
                    currentPage === 1 || loading ? 'disabled' : ''
                  }`}
                >
                  <button
                    type="button"
                    className="page-link"
                    disabled={currentPage === 1 || loading}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    <i className="bi bi-chevron-left" />
                  </button>
                </li>

                {paginationRange.map((item) => (
                  typeof item === 'number' ? (
                    <li key={item} className={`page-item ${item === currentPage ? 'active' : ''}`}>
                      <button type="button" className="page-link" onClick={() => goToPage(item)} disabled={loading}>
                        {item}
                      </button>
                    </li>
                  ) : (
                    <li key={item} className="page-item disabled" aria-hidden="true">
                      <span className="page-link">…</span>
                    </li>
                  )
                ))}

                <li
                  className={`page-item ${
                    currentPage === totalPages || loading ? 'disabled' : ''
                  }`}
                >
                  <button
                    type="button"
                    className="page-link"
                    disabled={currentPage === totalPages || loading}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    <i className="bi bi-chevron-right" />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </section>
      </main>

      {(modal === 'create' || modal === 'edit') && (
        <div
          className="users-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
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
            <div className="users-modal-header">
              <div>
                <span className="users-modal-label">
                  {modal === 'create' ? 'Novo pedido' : 'Gerenciamento'}
                </span>
                <h2 id="order-modal-title">
                  {modal === 'create' ? 'Criar pedido' : 'Editar pedido'}
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

            <form onSubmit={handleSubmit}>
              <div className="users-modal-body">
                {modalError && <div className="alert alert-danger" role="alert">{modalError}</div>}
                <div className="order-modal-icon">
                  <i className="bi bi-bag-check" />
                </div>

                <div className="user-form-grid">
                  <div className="user-form-field">
                    <label htmlFor="order-user">ID do usuário</label>
                    <div className="user-input-wrapper">
                      <i className="bi bi-person" />
                      <input
                        id="order-user"
                        name="idUsuario"
                        type="number"
                        min="1"
                        value={form.idUsuario}
                        onChange={handleFormChange}
                        placeholder="Ex.: 15"
                        disabled={saving}
                        required
                      />
                    </div>
                  </div>

                  <div className="user-form-field">
                    <label htmlFor="order-product">ID do produto</label>
                    <div className="user-input-wrapper">
                      <i className="bi bi-box-seam" />
                      <input
                        id="order-product"
                        name="idProduto"
                        type="number"
                        min="1"
                        value={form.idProduto}
                        onChange={handleFormChange}
                        placeholder="Ex.: 42"
                        disabled={saving}
                        required
                      />
                    </div>
                  </div>

                  {(modal === 'create' || modal === 'edit') && (
                    <>
                      <div className="user-form-field">
                        <label htmlFor="order-status">Status do envio</label>
                        <div className="user-input-wrapper">
                          <i className="bi bi-truck" />
                          <select id="order-status" name="status" value={form.status} disabled={saving} required onChange={handleFormChange}>
                            <option value="" disabled>Selecione um status</option>
                            {form.status && !Object.hasOwn(STATUS_CONFIG, form.status) && <option value={form.status} disabled>{form.status} (não suportado)</option>}
                            <option value="carrinho">Carrinho</option>
                            <option value="pendente">Pendente</option>
                            <option value="processando">Processando</option>
                            <option value="enviado">Enviado</option>
                            <option value="entregue">Entregue</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </div>
                      </div>

                      <div className="user-form-field">
                        <label htmlFor="order-delivery-date">Data de entrega</label>
                        <div className="user-input-wrapper">
                          <i className="bi bi-calendar-check" />
                          <input
                            id="order-delivery-date"
                            name="dataEntrega"
                            type="date"
                            value={form.dataEntrega}
                            disabled={saving}
                            onChange={handleFormChange}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
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

      {modal === 'delete' && selectedOrder && (
        <div
          className="users-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
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
              {modalError && <div className="alert alert-danger" role="alert">{modalError}</div>}
              <div className="users-delete-icon">
                <i className="bi bi-trash3" />
              </div>
              <span className="users-modal-label">Atenção</span>
              <h2 id="delete-order-title">Excluir pedido?</h2>
              <p>
                Você está prestes a excluir o pedido{' '}
                <strong>
                  #ORD-{getOrderId(selectedOrder)}
                </strong>
                . Essa ação não poderá ser desfeita.
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
                    saving ? 'bi bi-arrow-repeat' : 'bi bi-trash'
                  }
                />
                {saving ? 'Excluindo...' : 'Excluir pedido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}