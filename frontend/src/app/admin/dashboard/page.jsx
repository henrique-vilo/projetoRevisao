'use client';

import './dashboard.css';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

/* =====================================================
   CONFIGURAÇÃO DA API
===================================================== */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/* =====================================================
   HELPERS
===================================================== */

function getToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('jwt')
  );
}

function getValue(object, keys, fallback = null) {
  if (!object) return fallback;

  for (const key of keys) {
    if (
      object[key] !== undefined &&
      object[key] !== null
    ) {
      return object[key];
    }
  }

  return fallback;
}

function getArrayFromResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.dados)) {
    return response.dados;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.resultados)) {
    return response.resultados;
  }

  return [];
}

function getPaginationFromResponse(response) {
  return (
    response?.paginacao ||
    response?.pagination ||
    response?.meta ||
    {}
  );
}

function formatCurrency(value) {
  const number = Number(value) || 0;

  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('pt-BR');
}

function normalizeDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatDate(value) {
  const date = normalizeDate(value);

  if (!date) {
    return '—';
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getOrderValue(order) {
  const directValue = getValue(order, [
    'valor_total',
    'valorTotal',
    'valor',
    'total',
    'preco_total',
    'precoTotal',
    'preco_produto',
    'precoProduto',
  ]);

  if (directValue !== null) {
    return Number(directValue) || 0;
  }

  const quantity = Number(
    getValue(order, [
      'quantidade',
      'qtd',
      'quantity',
    ], 1)
  );

  const price = Number(
    getValue(order, [
      'preco',
      'preco_produto',
      'precoProduto',
      'valor_unitario',
      'valorUnitario',
    ], 0)
  );

  return quantity * price;
}

function getOrderStatus(order) {
  const status = String(
    getValue(order, [
      'status',
      'situacao',
      'estado',
      'statusPedido',
    ], 'Pendente')
  );

  const normalized = status
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (
    normalized.includes('conclu') ||
    normalized.includes('entreg') ||
    normalized.includes('finaliz') ||
    normalized.includes('pago')
  ) {
    return {
      label: 'Concluído',
      className: 'success',
    };
  }

  if (
    normalized.includes('cancel') ||
    normalized.includes('recus') ||
    normalized.includes('negad')
  ) {
    return {
      label: 'Cancelado',
      className: 'danger',
    };
  }

  if (
    normalized.includes('andamento') ||
    normalized.includes('process') ||
    normalized.includes('enviado') ||
    normalized.includes('separ')
  ) {
    return {
      label: 'Em andamento',
      className: 'info',
    };
  }

  return {
    label: 'Pendente',
    className: 'warning',
  };
}

function getOrderId(order) {
  return getValue(order, [
    'idPedido',
    'id_pedido',
    'id',
    'codigo',
    'numeroPedido',
  ], '—');
}

function getCustomerName(order) {
  return getValue(order, [
    'nomeUsuario',
    'nome_usuario',
    'nomeCliente',
    'nome_cliente',
    'clienteNome',
    'cliente',
    'usuarioNome',
    'usuario_nome',
  ], 'Cliente');
}

function getProductName(order) {
  return getValue(order, [
    'nomeProduto',
    'nome_produto',
    'produtoNome',
    'produto_nome',
    'produto',
  ], 'Produto');
}

function getOrderDate(order) {
  return getValue(order, [
    'dataPedido',
    'data_pedido',
    'dataCriacao',
    'data_criacao',
    'createdAt',
    'created_at',
    'data',
  ]);
}

function getProductCategory(product) {
  return getValue(product, [
    'nomeCategoria',
    'nome_categoria',
    'categoriaNome',
    'categoria_nome',
    'categoria',
    'categoriaProduto',
  ], 'Sem categoria');
}

/* =====================================================
   FETCH DA API
===================================================== */

async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    Accept: 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
      cache: 'no-store',
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.mensagem ||
      data?.erro ||
      data?.detalhes ||
      `Erro HTTP ${response.status}`;

    throw new Error(message);
  }

  return data;
}

/* =====================================================
   BUSCA TODOS OS REGISTROS PAGINADOS
===================================================== */

async function fetchPaginated(endpoint, limit = 100) {
  const firstResponse = await apiFetch(
    `${endpoint}?pagina=1&limite=${limit}`
  );

  const firstData = getArrayFromResponse(firstResponse);

  const pagination = getPaginationFromResponse(
    firstResponse
  );

  const total = Number(
    pagination.total ||
    pagination.totalRegistros ||
    pagination.totalItens ||
    firstData.length
  );

  const currentPage = Number(
    pagination.pagina ||
    pagination.page ||
    1
  );

  const totalPages = Number(
    pagination.totalPaginas ||
    pagination.total_pages ||
    Math.ceil(total / limit)
  );

  if (totalPages <= currentPage) {
    return {
      data: firstData,
      total,
    };
  }

  const remainingRequests = [];

  for (
    let page = currentPage + 1;
    page <= totalPages;
    page++
  ) {
    remainingRequests.push(
      apiFetch(
        `${endpoint}?pagina=${page}&limite=${limit}`
      )
    );
  }

  const responses = await Promise.all(
    remainingRequests
  );

  const remainingData = responses.flatMap(
    getArrayFromResponse
  );

  return {
    data: [
      ...firstData,
      ...remainingData,
    ],
    total,
  };
}

/* =====================================================
   COMPONENT
===================================================== */

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    pedidos: [],
    produtos: [],
    usuarios: [],
    totalPedidos: 0,
    totalProdutos: 0,
    totalUsuarios: 0,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  /* ===================================================
     CARREGAR DASHBOARD
  =================================================== */

  const carregarDashboard = useCallback(
    async () => {
      try {
        setLoading(true);
        setError('');

        const [
          pedidosResponse,
          produtosResponse,
          usuariosResponse,
        ] = await Promise.all([
          fetchPaginated('/api/pedidos', 100),
          fetchPaginated('/api/produtos', 100),
          fetchPaginated('/api/usuarios', 100),
        ]);

        setDashboardData({
          pedidos: pedidosResponse.data,
          produtos: produtosResponse.data,
          usuarios: usuariosResponse.data,

          totalPedidos:
            pedidosResponse.total,

          totalProdutos:
            produtosResponse.total,

          totalUsuarios:
            usuariosResponse.total,
        });
      } catch (err) {
        console.error(
          'Erro ao carregar dashboard:',
          err
        );

        setError(
          err?.message ||
          'Não foi possível carregar os dados do dashboard.'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    carregarDashboard();
  }, [carregarDashboard]);

  /* ===================================================
     PEDIDOS NORMALIZADOS
  =================================================== */

  const normalizedOrders = useMemo(() => {
    return dashboardData.pedidos
      .map((order) => {
        const status = getOrderStatus(order);

        return {
          original: order,

          id: `#PED-${getOrderId(order)}`,

          customer:
            getCustomerName(order),

          product:
            getProductName(order),

          date:
            formatDate(
              getOrderDate(order)
            ),

          rawDate:
            normalizeDate(
              getOrderDate(order)
            ),

          value:
            getOrderValue(order),

          status:
            status.label,

          statusClass:
            status.className,
        };
      })
      .sort((a, b) => {
        if (!a.rawDate) return 1;
        if (!b.rawDate) return -1;

        return (
          b.rawDate.getTime() -
          a.rawDate.getTime()
        );
      });
  }, [dashboardData.pedidos]);

  /* ===================================================
     RECEITA TOTAL
  =================================================== */

  const totalRevenue = useMemo(() => {
    return dashboardData.pedidos.reduce(
      (total, order) =>
        total + getOrderValue(order),
      0
    );
  }, [dashboardData.pedidos]);

  /* ===================================================
     PEDIDOS POR MÊS
  =================================================== */

  const monthlyOrders = useMemo(() => {
    const result = new Array(12).fill(0);

    dashboardData.pedidos.forEach((order) => {
      const date = normalizeDate(
        getOrderDate(order)
      );

      if (!date) return;

      const month = date.getMonth();

      result[month] += 1;
    });

    return result;
  }, [dashboardData.pedidos]);

  /* ===================================================
     RECEITA POR MÊS
  =================================================== */

  const monthlyRevenue = useMemo(() => {
    const result = new Array(12).fill(0);

    dashboardData.pedidos.forEach((order) => {
      const date = normalizeDate(
        getOrderDate(order)
      );

      if (!date) return;

      const month = date.getMonth();

      result[month] += getOrderValue(order);
    });

    return result;
  }, [dashboardData.pedidos]);

  /* ===================================================
     CATEGORIAS
  =================================================== */

  const categoryDistribution = useMemo(() => {
    const categories = {};

    dashboardData.produtos.forEach(
      (product) => {
        const category =
          getProductCategory(product);

        categories[category] =
          (categories[category] || 0) + 1;
      }
    );

    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [dashboardData.produtos]);

  /* ===================================================
     DATA DO GRÁFICO DE RECEITA
  =================================================== */

  const revenueData = useMemo(
    () => ({
      labels: [
        'Jan',
        'Fev',
        'Mar',
        'Abr',
        'Mai',
        'Jun',
        'Jul',
        'Ago',
        'Set',
        'Out',
        'Nov',
        'Dez',
      ],

      datasets: [
        {
          label: 'Receita',

          data: monthlyRevenue,

          borderColor: '#2563eb',

          backgroundColor:
            'rgba(37, 99, 235, 0.08)',

          borderWidth: 2,

          pointRadius: 0,

          pointHoverRadius: 5,

          tension: 0.4,

          fill: true,
        },
      ],
    }),
    [monthlyRevenue]
  );

  /* ===================================================
     OPÇÕES RECEITA
  =================================================== */

  const revenueOptions = useMemo(
    () => ({
      responsive: true,

      maintainAspectRatio: false,

      interaction: {
        intersect: false,
        mode: 'index',
      },

      plugins: {
        legend: {
          display: false,
        },

        tooltip: {
          backgroundColor: '#172033',

          padding: 12,

          cornerRadius: 8,

          displayColors: false,

          callbacks: {
            label: (context) =>
              ` ${formatCurrency(
                context.raw
              )}`,
          },
        },
      },

      scales: {
        x: {
          border: {
            display: false,
          },

          grid: {
            display: false,
          },

          ticks: {
            color: '#94a3b8',

            font: {
              size: 11,
            },
          },
        },

        y: {
          border: {
            display: false,
          },

          grid: {
            color: '#eef2f6',
          },

          ticks: {
            color: '#94a3b8',

            font: {
              size: 11,
            },

            callback: (value) =>
              `R$ ${(value / 1000).toFixed(
                0
              )}k`,
          },
        },
      },
    }),
    []
  );

  /* ===================================================
     DATA PEDIDOS
  =================================================== */

  const ordersData = useMemo(
    () => ({
      labels: [
        'Jan',
        'Fev',
        'Mar',
        'Abr',
        'Mai',
        'Jun',
        'Jul',
        'Ago',
        'Set',
        'Out',
        'Nov',
        'Dez',
      ],

      datasets: [
        {
          label: 'Pedidos',

          data: monthlyOrders,

          backgroundColor: '#dbeafe',

          hoverBackgroundColor: '#2563eb',

          borderRadius: 6,

          borderSkipped: false,

          barThickness: 18,
        },
      ],
    }),
    [monthlyOrders]
  );

  /* ===================================================
     OPÇÕES PEDIDOS
  =================================================== */

  const ordersOptions = useMemo(
    () => ({
      responsive: true,

      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false,
        },

        tooltip: {
          backgroundColor: '#172033',

          padding: 10,

          cornerRadius: 8,
        },
      },

      scales: {
        x: {
          border: {
            display: false,
          },

          grid: {
            display: false,
          },

          ticks: {
            color: '#94a3b8',

            font: {
              size: 11,
            },
          },
        },

        y: {
          border: {
            display: false,
          },

          grid: {
            color: '#eef2f6',
          },

          ticks: {
            color: '#94a3b8',

            font: {
              size: 11,
            },
          },
        },
      },
    }),
    []
  );

  /* ===================================================
     DONUT
  =================================================== */

  const categoryData = useMemo(() => {
    const colors = [
      '#2563eb',
      '#60a5fa',
      '#93c5fd',
      '#dbeafe',
      '#bfdbfe',
    ];

    return {
      labels: categoryDistribution.map(
        ([category]) => category
      ),

      datasets: [
        {
          data: categoryDistribution.map(
            ([, total]) => total
          ),

          backgroundColor:
            colors.slice(
              0,
              categoryDistribution.length
            ),

          borderWidth: 0,

          hoverOffset: 4,
        },
      ],
    };
  }, [categoryDistribution]);

  const categoryOptions = useMemo(
    () => ({
      responsive: true,

      maintainAspectRatio: false,

      cutout: '72%',

      plugins: {
        legend: {
          display: false,
        },

        tooltip: {
          backgroundColor: '#172033',

          padding: 10,

          cornerRadius: 8,
        },
      },
    }),
    []
  );

  /* ===================================================
     ATIVIDADES
  =================================================== */

  const activities = useMemo(() => {
    return normalizedOrders
      .slice(0, 4)
      .map((order) => ({
        initials:
          order.customer
            ?.split(' ')
            .slice(0, 2)
            .map(
              (name) =>
                name[0]
            )
            .join('')
            .toUpperCase() || 'CL',

        name:
          order.customer,

        action:
          'realizou um novo pedido',

        context:
          order.id,

        time:
          order.date,
      }));
  }, [normalizedOrders]);

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {
    return (
      <main className="dashboard-page">

        <div className="d-flex justify-content-center align-items-center py-5">

          <div
            className="spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">
              Carregando...
            </span>
          </div>

          <span className="ms-3 text-secondary">
            Carregando dashboard...
          </span>

        </div>

      </main>
    );
  }

  /* ===================================================
     ERROR
  =================================================== */

  if (error) {
    return (
      <main className="dashboard-page">

        <div
          className="alert alert-danger d-flex align-items-center justify-content-between"
          role="alert"
        >

          <div>
            <i className="bi bi-exclamation-triangle me-2" />

            <strong>
              Não foi possível carregar o dashboard.
            </strong>

            <div className="small mt-1">
              {error}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={carregarDashboard}
          >
            <i className="bi bi-arrow-clockwise me-1" />
            Tentar novamente
          </button>

        </div>

      </main>
    );
  }

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <main className="dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="dashboard-heading">

        <div>

          <span className="dashboard-eyebrow">
            Visão geral
          </span>

          <h1 className="h2 fw-semibold mb-2">
            Dashboard
          </h1>

          <p className="text-secondary mb-0">
            Acompanhe o desempenho da sua operação
            em tempo real.
          </p>

        </div>

        <div className="d-flex flex-wrap gap-2">

          <button
            type="button"
            className="btn btn-light border"
          >
            <i className="bi bi-calendar3 me-2" />

            Últimos 30 dias

            <i className="bi bi-chevron-down ms-2" />
          </button>

          <button
            type="button"
            className="btn btn-primary"
          >
            <i className="bi bi-download me-2" />

            Exportar
          </button>

        </div>

      </section>

      {/* =================================================
          MÉTRICAS
      ================================================= */}

      <section
        className="row g-3 mb-4"
        aria-label="Principais métricas"
      >

        {/* RECEITA */}

        <div className="col-12 col-sm-6 col-xl-3">

          <article className="dashboard-card metric-card h-100">

            <div className="d-flex justify-content-between align-items-start">

              <div className="metric-icon">
                <i className="bi bi-currency-dollar" />
              </div>

              <button
                type="button"
                className="btn btn-sm btn-light border-0"
                aria-label="Mais opções para receita"
              >
                <i className="bi bi-three-dots" />
              </button>

            </div>

            <div className="mt-3">

              <span className="d-block text-secondary small mb-1">
                Receita total
              </span>

              <strong className="metric-value">
                {formatCurrency(totalRevenue)}
              </strong>

            </div>

            <div className="mt-3">

              <span className="text-secondary small">
                Valor calculado a partir dos pedidos
              </span>

            </div>

          </article>

        </div>

        {/* PEDIDOS */}

        <div className="col-12 col-sm-6 col-xl-3">

          <article className="dashboard-card metric-card h-100">

            <div className="d-flex justify-content-between align-items-start">

              <div className="metric-icon">
                <i className="bi bi-bag-check" />
              </div>

              <button
                type="button"
                className="btn btn-sm btn-light border-0"
                aria-label="Mais opções para pedidos"
              >
                <i className="bi bi-three-dots" />
              </button>

            </div>

            <div className="mt-3">

              <span className="d-block text-secondary small mb-1">
                Pedidos
              </span>

              <strong className="metric-value">
                {formatNumber(
                  dashboardData.totalPedidos
                )}
              </strong>

            </div>

            <div className="mt-3">

              <span className="text-secondary small">
                pedidos cadastrados
              </span>

            </div>

          </article>

        </div>

        {/* PRODUTOS */}

        <div className="col-12 col-sm-6 col-xl-3">

          <article className="dashboard-card metric-card h-100">

            <div className="d-flex justify-content-between align-items-start">

              <div className="metric-icon">
                <i className="bi bi-box-seam" />
              </div>

              <button
                type="button"
                className="btn btn-sm btn-light border-0"
                aria-label="Mais opções para produtos"
              >
                <i className="bi bi-three-dots" />
              </button>

            </div>

            <div className="mt-3">

              <span className="d-block text-secondary small mb-1">
                Produtos
              </span>

              <strong className="metric-value">
                {formatNumber(
                  dashboardData.totalProdutos
                )}
              </strong>

            </div>

            <div className="mt-3">

              <span className="text-secondary small">
                produtos cadastrados
              </span>

            </div>

          </article>

        </div>

        {/* USUÁRIOS */}

        <div className="col-12 col-sm-6 col-xl-3">

          <article className="dashboard-card metric-card h-100">

            <div className="d-flex justify-content-between align-items-start">

              <div className="metric-icon">
                <i className="bi bi-people" />
              </div>

              <button
                type="button"
                className="btn btn-sm btn-light border-0"
                aria-label="Mais opções para usuários"
              >
                <i className="bi bi-three-dots" />
              </button>

            </div>

            <div className="mt-3">

              <span className="d-block text-secondary small mb-1">
                Usuários
              </span>

              <strong className="metric-value">
                {formatNumber(
                  dashboardData.totalUsuarios
                )}
              </strong>

            </div>

            <div className="mt-3">

              <span className="text-secondary small">
                clientes cadastrados
              </span>

            </div>

          </article>

        </div>

      </section>

      {/* =================================================
          GRÁFICOS
      ================================================= */}

      <section className="row g-3 mb-4">

        {/* RECEITA */}

        <div className="col-12 col-xl-8">

          <article className="dashboard-card h-100">

            <div className="dashboard-card-header">

              <div>

                <span className="dashboard-card-label">
                  Desempenho financeiro
                </span>

                <h2 className="h5 fw-semibold mb-0">
                  Receita
                </h2>

              </div>

              <button
                type="button"
                className="btn btn-sm btn-light border"
              >
                Mensal
                <i className="bi bi-chevron-down ms-2" />
              </button>

            </div>

            <div className="d-flex align-items-center gap-2 mt-3">

              <strong className="chart-summary-value">
                {formatCurrency(totalRevenue)}
              </strong>

            </div>

            <div className="chart-container chart-large mt-3">

              <Line
                data={revenueData}
                options={revenueOptions}
              />

            </div>

          </article>

        </div>

        {/* CATEGORIAS */}

        <div className="col-12 col-xl-4">

          <article className="dashboard-card h-100">

            <div className="dashboard-card-header">

              <div>

                <span className="dashboard-card-label">
                  Distribuição
                </span>

                <h2 className="h5 fw-semibold mb-0">
                  Produtos
                </h2>

              </div>

              <button
                type="button"
                className="btn btn-sm btn-light border"
              >
                <i className="bi bi-three-dots" />
              </button>

            </div>

            <div className="donut-wrapper mt-3">

              <div className="donut-chart">

                <Doughnut
                  data={categoryData}
                  options={categoryOptions}
                />

                <div className="donut-center">

                  <strong>
                    {formatNumber(
                      dashboardData.totalProdutos
                    )}
                  </strong>

                  <span>
                    produtos
                  </span>

                </div>

              </div>

            </div>

            <div className="distribution-legend mt-3">

              {categoryDistribution.map(
                ([category, total], index) => {

                  const percentage =
                    dashboardData.produtos.length
                      ? Math.round(
                          (total /
                            dashboardData.produtos.length) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      className="legend-item"
                      key={category}
                    >

                      <span>

                        <i
                          className={`legend-dot category-${index}`}
                        />

                        {category}

                      </span>

                      <strong>
                        {percentage}%
                      </strong>

                    </div>
                  );
                }
              )}

              {categoryDistribution.length === 0 && (
                <div className="text-secondary small text-center py-3">
                  Nenhuma categoria encontrada.
                </div>
              )}

            </div>

          </article>

        </div>

        {/* PEDIDOS */}

        <div className="col-12 col-xl-8">

          <article className="dashboard-card h-100">

            <div className="dashboard-card-header">

              <div>

                <span className="dashboard-card-label">
                  Volume operacional
                </span>

                <h2 className="h5 fw-semibold mb-0">
                  Pedidos
                </h2>

              </div>

              <span className="text-secondary small">
                {formatNumber(
                  dashboardData.totalPedidos
                )}{' '}
                pedidos
              </span>

            </div>

            <div className="chart-container chart-medium mt-3">

              <Bar
                data={ordersData}
                options={ordersOptions}
              />

            </div>

          </article>

        </div>

        {/* AÇÕES */}

        <div className="col-12 col-xl-4">

          <article className="dashboard-card h-100">

            <div className="dashboard-card-header">

              <div>

                <span className="dashboard-card-label">
                  Atalhos
                </span>

                <h2 className="h5 fw-semibold mb-0">
                  Ações rápidas
                </h2>

              </div>

            </div>

            <div className="list-group list-group-flush mt-2">

              <button
                type="button"
                className="list-group-item list-group-item-action px-0 quick-action"
              >

                <span className="quick-action-icon blue">
                  <i className="bi bi-plus-lg" />
                </span>

                <span>
                  <strong>
                    Novo pedido
                  </strong>

                  <small>
                    Criar uma nova venda
                  </small>
                </span>

                <i className="bi bi-chevron-right ms-auto" />

              </button>

              <button
                type="button"
                className="list-group-item list-group-item-action px-0 quick-action"
              >

                <span className="quick-action-icon purple">
                  <i className="bi bi-box-seam" />
                </span>

                <span>
                  <strong>
                    Adicionar produto
                  </strong>

                  <small>
                    Cadastrar novo produto
                  </small>
                </span>

                <i className="bi bi-chevron-right ms-auto" />

              </button>

              <button
                type="button"
                className="list-group-item list-group-item-action px-0 quick-action"
              >

                <span className="quick-action-icon green">
                  <i className="bi bi-file-earmark-arrow-down" />
                </span>

                <span>
                  <strong>
                    Exportar relatório
                  </strong>

                  <small>
                    Baixar dados do período
                  </small>
                </span>

                <i className="bi bi-chevron-right ms-auto" />

              </button>

              <button
                type="button"
                className="list-group-item list-group-item-action px-0 quick-action"
              >

                <span className="quick-action-icon orange">
                  <i className="bi bi-person-plus" />
                </span>

                <span>
                  <strong>
                    Ver usuários
                  </strong>

                  <small>
                    Gerenciar clientes
                  </small>
                </span>

                <i className="bi bi-chevron-right ms-auto" />

              </button>

            </div>

          </article>

        </div>

      </section>

      {/* =================================================
          PEDIDOS + ATIVIDADES
      ================================================= */}

      <section className="row g-3">

        {/* PEDIDOS */}

        <div className="col-12 col-xl-8">

          <article className="dashboard-card">

            <div className="dashboard-card-header">

              <div>

                <span className="dashboard-card-label">
                  Operação
                </span>

                <h2 className="h5 fw-semibold mb-0">
                  Pedidos recentes
                </h2>

              </div>

              <button
                type="button"
                className="btn btn-link btn-sm text-decoration-none"
              >
                Ver todos
                <i className="bi bi-arrow-right ms-1" />
              </button>

            </div>

            <div className="table-responsive mt-3">

              <table className="table table-hover align-middle mb-0 dashboard-table">

                <thead>

                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Produto</th>
                    <th>Data</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th />
                  </tr>

                </thead>

                <tbody>

                  {normalizedOrders
                    .slice(0, 5)
                    .map((order) => (

                      <tr key={order.id}>

                        <td>
                          <span className="order-id">
                            {order.id}
                          </span>
                        </td>

                        <td>
                          <span className="customer-name">
                            {order.customer}
                          </span>
                        </td>

                        <td>
                          <span className="product-name">
                            {order.product}
                          </span>
                        </td>

                        <td>
                          <span className="table-muted">
                            {order.date}
                          </span>
                        </td>

                        <td>
                          <strong className="order-value">
                            {formatCurrency(
                              order.value
                            )}
                          </strong>
                        </td>

                        <td>

                          <span
                            className={`status-badge ${order.statusClass}`}
                          >
                            <span />
                            {order.status}
                          </span>

                        </td>

                        <td>

                          <div className="dropdown">

                            <button
                              className="btn btn-sm btn-light border-0"
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                              aria-label={`Ações do pedido ${order.id}`}
                            >
                              <i className="bi bi-three-dots" />
                            </button>

                            <ul className="dropdown-menu dropdown-menu-end shadow-sm">

                              <li>

                                <button className="dropdown-item">

                                  <i className="bi bi-eye me-2" />

                                  Visualizar

                                </button>

                              </li>

                              <li>

                                <button className="dropdown-item">

                                  <i className="bi bi-pencil me-2" />

                                  Editar

                                </button>

                              </li>

                              <li>

                                <hr className="dropdown-divider" />

                              </li>

                              <li>

                                <button className="dropdown-item text-danger">

                                  <i className="bi bi-trash me-2" />

                                  Excluir

                                </button>

                              </li>

                            </ul>

                          </div>

                        </td>

                      </tr>

                    ))}

                  {normalizedOrders.length === 0 && (

                    <tr>

                      <td
                        colSpan="7"
                        className="text-center py-5 text-secondary"
                      >
                        <i className="bi bi-inbox fs-3 d-block mb-2" />

                        Nenhum pedido encontrado.

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 pt-3 mt-2 border-top">

              <span className="text-secondary small">

                Mostrando{' '}

                <strong>
                  {Math.min(
                    5,
                    normalizedOrders.length
                  )}
                </strong>{' '}

                de{' '}

                <strong>
                  {formatNumber(
                    dashboardData.totalPedidos
                  )}
                </strong>{' '}

                pedidos

              </span>

              <nav aria-label="Paginação de pedidos">

                <ul className="pagination pagination-sm mb-0">

                  <li className="page-item disabled">

                    <button className="page-link">
                      <i className="bi bi-chevron-left" />
                    </button>

                  </li>

                  <li className="page-item active">

                    <button className="page-link">
                      1
                    </button>

                  </li>

                  <li className="page-item">

                    <button className="page-link">
                      2
                    </button>

                  </li>

                  <li className="page-item">

                    <button className="page-link">
                      3
                    </button>

                  </li>

                  <li className="page-item">

                    <button className="page-link">
                      <i className="bi bi-chevron-right" />
                    </button>

                  </li>

                </ul>

              </nav>

            </div>

          </article>

        </div>

        {/* ATIVIDADES */}

        <div className="col-12 col-xl-4">

          <article className="dashboard-card h-100">

            <div className="dashboard-card-header">

              <div>

                <span className="dashboard-card-label">
                  Timeline
                </span>

                <h2 className="h5 fw-semibold mb-0">
                  Atividades recentes
                </h2>

              </div>

              <button
                type="button"
                className="btn btn-sm btn-light border"
                aria-label="Mais opções"
              >
                <i className="bi bi-three-dots" />
              </button>

            </div>

            <div className="activity-list mt-3">

              {activities.map(
                (activity) => (

                  <div
                    className="activity-item"
                    key={`${activity.name}-${activity.context}`}
                  >

                    <div className="activity-avatar">
                      {activity.initials}
                    </div>

                    <div className="activity-content">

                      <p>

                        <strong>
                          {activity.name}
                        </strong>{' '}

                        {activity.action}

                      </p>

                      <span>
                        {activity.context}
                      </span>

                      <small>
                        {activity.time}
                      </small>

                    </div>

                  </div>

                )
              )}

              {activities.length === 0 && (

                <div className="text-center text-secondary py-4">

                  <i className="bi bi-clock-history fs-3 d-block mb-2" />

                  Nenhuma atividade recente.

                </div>

              )}

            </div>

            <button
              type="button"
              className="btn btn-link text-decoration-none px-0 mt-3"
            >
              Ver todas as atividades

              <i className="bi bi-arrow-right ms-1" />

            </button>

          </article>

        </div>

      </section>

    </main>
  );
}