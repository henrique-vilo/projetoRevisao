'use client';

import './dashboard.css';

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

const metrics = [
  {
    title: 'Receita total',
    value: 'R$ 84.250',
    change: '+12,8%',
    description: 'vs. mês anterior',
    icon: 'bi-currency-dollar',
    type: 'positive',
  },
  {
    title: 'Pedidos',
    value: '1.284',
    change: '+8,4%',
    description: 'vs. mês anterior',
    icon: 'bi-bag-check',
    type: 'positive',
  },
  {
    title: 'Clientes',
    value: '8.492',
    change: '+5,2%',
    description: 'vs. mês anterior',
    icon: 'bi-people',
    type: 'positive',
  },
  {
    title: 'Taxa de conversão',
    value: '4,82%',
    change: '-1,4%',
    description: 'vs. mês anterior',
    icon: 'bi-graph-up-arrow',
    type: 'negative',
  },
];

const orders = [
  {
    id: '#ORD-8492',
    customer: 'Mariana Costa',
    product: 'Plano Enterprise',
    date: '13 Ago, 2026',
    value: 'R$ 2.490,00',
    status: 'Concluído',
    statusClass: 'success',
  },
  {
    id: '#ORD-8491',
    customer: 'Lucas Almeida',
    product: 'Plano Professional',
    date: '13 Ago, 2026',
    value: 'R$ 890,00',
    status: 'Em andamento',
    statusClass: 'info',
  },
  {
    id: '#ORD-8490',
    customer: 'Ana Beatriz',
    product: 'Plano Starter',
    date: '12 Ago, 2026',
    value: 'R$ 249,00',
    status: 'Pendente',
    statusClass: 'warning',
  },
  {
    id: '#ORD-8489',
    customer: 'Gabriel Souza',
    product: 'Plano Enterprise',
    date: '12 Ago, 2026',
    value: 'R$ 2.490,00',
    status: 'Concluído',
    statusClass: 'success',
  },
  {
    id: '#ORD-8488',
    customer: 'Julia Martins',
    product: 'Plano Professional',
    date: '11 Ago, 2026',
    value: 'R$ 890,00',
    status: 'Cancelado',
    statusClass: 'danger',
  },
];

const activities = [
  {
    initials: 'MC',
    name: 'Mariana Costa',
    action: 'realizou um novo pedido',
    context: '#ORD-8492',
    time: 'há 8 minutos',
  },
  {
    initials: 'LA',
    name: 'Lucas Almeida',
    action: 'atualizou seu plano',
    context: 'Professional',
    time: 'há 24 minutos',
  },
  {
    initials: 'AB',
    name: 'Ana Beatriz',
    action: 'criou uma conta',
    context: 'Novo cliente',
    time: 'há 42 minutos',
  },
  {
    initials: 'GS',
    name: 'Gabriel Souza',
    action: 'realizou um pagamento',
    context: 'R$ 2.490,00',
    time: 'há 1 hora',
  },
];

const revenueData = {
  labels: [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
  ],
  datasets: [
    {
      label: 'Receita',
      data: [
        42000,
        48000,
        45500,
        59000,
        61000,
        68500,
        74200,
        84250,
      ],
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.08)',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5,
      tension: 0.4,
      fill: true,
    },
  ],
};

const revenueOptions = {
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
          ` R$ ${context.raw.toLocaleString('pt-BR')}`,
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
          `R$ ${(value / 1000).toFixed(0)}k`,
      },
    },
  },
};

const ordersData = {
  labels: [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
  ],
  datasets: [
    {
      label: 'Pedidos',
      data: [820, 910, 870, 1040, 1120, 1190, 1240, 1284],
      backgroundColor: '#dbeafe',
      hoverBackgroundColor: '#2563eb',
      borderRadius: 5,
      borderSkipped: false,
      barThickness: 18,
    },
  ],
};

const ordersOptions = {
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
};

const distributionData = {
  labels: [
    'Enterprise',
    'Professional',
    'Starter',
  ],
  datasets: [
    {
      data: [42, 36, 22],
      backgroundColor: [
        '#2563eb',
        '#93c5fd',
        '#dbeafe',
      ],
      borderWidth: 0,
      hoverOffset: 4,
    },
  ],
};

const distributionOptions = {
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
};

export default function DashboardPage() {
  return (
    <main className="dashboard-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">
            Visão geral
          </span>

          <h1>
            Dashboard
          </h1>

          <p>
            Acompanhe o desempenho da sua operação em tempo real.
          </p>
        </div>

        <div className="dashboard-heading-actions">
          <button
            type="button"
            className="dashboard-btn dashboard-btn-secondary"
          >
            <i className="bi bi-calendar3" />
            Últimos 30 dias
            <i className="bi bi-chevron-down" />
          </button>

          <button
            type="button"
            className="dashboard-btn dashboard-btn-primary"
          >
            <i className="bi bi-download" />
            Exportar
          </button>
        </div>
      </section>

      {/* =====================================================
          METRICS
      ===================================================== */}

      <section
        className="row g-3 dashboard-metrics"
        aria-label="Principais métricas"
      >
        {metrics.map((metric) => (
          <div
            className="col-12 col-sm-6 col-xl-3"
            key={metric.title}
          >
            <article className="metric-card">

              <div className="metric-card-top">
                <div className="metric-icon">
                  <i className={`bi ${metric.icon}`} />
                </div>

                <button
                  type="button"
                  className="metric-more"
                  aria-label={`Mais opções para ${metric.title}`}
                >
                  <i className="bi bi-three-dots" />
                </button>
              </div>

              <div className="metric-content">
                <span className="metric-title">
                  {metric.title}
                </span>

                <strong className="metric-value">
                  {metric.value}
                </strong>
              </div>

              <div className="metric-footer">
                <span
                  className={`metric-change ${metric.type}`}
                >
                  <i
                    className={
                      metric.type === 'positive'
                        ? 'bi bi-arrow-up-right'
                        : 'bi bi-arrow-down-right'
                    }
                  />

                  {metric.change}
                </span>

                <span className="metric-description">
                  {metric.description}
                </span>
              </div>

            </article>
          </div>
        ))}
      </section>

      {/* =====================================================
          CHARTS
      ===================================================== */}

      <section className="row g-3 dashboard-charts">

        {/* Revenue */}
        <div className="col-12 col-xl-8">
          <article className="dashboard-card chart-card">

            <div className="dashboard-card-header">
              <div>
                <span className="dashboard-card-label">
                  Desempenho financeiro
                </span>

                <h2>
                  Receita
                </h2>
              </div>

              <button
                type="button"
                className="chart-period"
              >
                Mensal
                <i className="bi bi-chevron-down" />
              </button>
            </div>

            <div className="chart-summary">
              <strong>
                R$ 84.250
              </strong>

              <span className="summary-positive">
                +12,8%
              </span>
            </div>

            <div className="chart-container chart-large">
              <Line
                data={revenueData}
                options={revenueOptions}
              />
            </div>

          </article>
        </div>

        {/* Distribution */}
        <div className="col-12 col-xl-4">
          <article className="dashboard-card distribution-card">

            <div className="dashboard-card-header">
              <div>
                <span className="dashboard-card-label">
                  Distribuição
                </span>

                <h2>
                  Planos
                </h2>
              </div>

              <button
                type="button"
                className="card-icon-button"
                aria-label="Mais informações"
              >
                <i className="bi bi-three-dots" />
              </button>
            </div>

            <div className="donut-wrapper">
              <div className="donut-chart">
                <Doughnut
                  data={distributionData}
                  options={distributionOptions}
                />

                <div className="donut-center">
                  <strong>8.492</strong>
                  <span>clientes</span>
                </div>
              </div>
            </div>

            <div className="distribution-legend">

              <div className="legend-item">
                <span>
                  <i className="legend-dot enterprise" />
                  Enterprise
                </span>

                <strong>42%</strong>
              </div>

              <div className="legend-item">
                <span>
                  <i className="legend-dot professional" />
                  Professional
                </span>

                <strong>36%</strong>
              </div>

              <div className="legend-item">
                <span>
                  <i className="legend-dot starter" />
                  Starter
                </span>

                <strong>22%</strong>
              </div>

            </div>

          </article>
        </div>

        {/* Orders */}
        <div className="col-12 col-xl-8">
          <article className="dashboard-card chart-card">

            <div className="dashboard-card-header">
              <div>
                <span className="dashboard-card-label">
                  Volume operacional
                </span>

                <h2>
                  Pedidos
                </h2>
              </div>

              <span className="chart-header-value">
                1.284 pedidos
              </span>
            </div>

            <div className="chart-container chart-medium">
              <Bar
                data={ordersData}
                options={ordersOptions}
              />
            </div>

          </article>
        </div>

        {/* Quick Actions */}
        <div className="col-12 col-xl-4">
          <article className="dashboard-card quick-actions-card">

            <div className="dashboard-card-header">
              <div>
                <span className="dashboard-card-label">
                  Atalhos
                </span>

                <h2>
                  Ações rápidas
                </h2>
              </div>
            </div>

            <div className="quick-actions">

              <button className="quick-action">
                <span className="quick-action-icon blue">
                  <i className="bi bi-plus-lg" />
                </span>

                <span>
                  <strong>Novo pedido</strong>
                  <small>Criar uma nova venda</small>
                </span>

                <i className="bi bi-chevron-right" />
              </button>

              <button className="quick-action">
                <span className="quick-action-icon purple">
                  <i className="bi bi-box-seam" />
                </span>

                <span>
                  <strong>Adicionar produto</strong>
                  <small>Cadastrar novo produto</small>
                </span>

                <i className="bi bi-chevron-right" />
              </button>

              <button className="quick-action">
                <span className="quick-action-icon green">
                  <i className="bi bi-file-earmark-arrow-down" />
                </span>

                <span>
                  <strong>Exportar relatório</strong>
                  <small>Baixar dados do período</small>
                </span>

                <i className="bi bi-chevron-right" />
              </button>

              <button className="quick-action">
                <span className="quick-action-icon orange">
                  <i className="bi bi-person-plus" />
                </span>

                <span>
                  <strong>Ver usuários</strong>
                  <small>Gerenciar clientes</small>
                </span>

                <i className="bi bi-chevron-right" />
              </button>

            </div>

          </article>
        </div>

      </section>

      {/* =====================================================
          ORDERS + ACTIVITY
      ===================================================== */}

      <section className="row g-3 dashboard-bottom">

        {/* Orders table */}
        <div className="col-12 col-xl-8">
          <article className="dashboard-card orders-card">

            <div className="dashboard-card-header">

              <div>
                <span className="dashboard-card-label">
                  Operação
                </span>

                <h2>
                  Pedidos recentes
                </h2>
              </div>

              <button className="view-all-button">
                Ver todos
                <i className="bi bi-arrow-right" />
              </button>

            </div>

            <div className="table-responsive dashboard-table-wrapper">
              <table className="table dashboard-table align-middle">

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
                  {orders.map((order) => (
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
                          {order.value}
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
                            className="table-action"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            aria-label={`Ações do pedido ${order.id}`}
                          >
                            <i className="bi bi-three-dots" />
                          </button>

                          <ul className="dropdown-menu dropdown-menu-end dashboard-dropdown">
                            <li>
                              <button className="dropdown-item">
                                <i className="bi bi-eye" />
                                Visualizar
                              </button>
                            </li>

                            <li>
                              <button className="dropdown-item">
                                <i className="bi bi-pencil" />
                                Editar
                              </button>
                            </li>

                            <li>
                              <hr className="dropdown-divider" />
                            </li>

                            <li>
                              <button className="dropdown-item danger">
                                <i className="bi bi-trash" />
                                Excluir
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            <div className="table-footer">

              <span>
                Mostrando <strong>5</strong> de <strong>1284</strong> pedidos
              </span>

              <nav aria-label="Paginação de pedidos">
                <ul className="pagination dashboard-pagination">

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

        {/* Activity */}
        <div className="col-12 col-xl-4">
          <article className="dashboard-card activity-card">

            <div className="dashboard-card-header">

              <div>
                <span className="dashboard-card-label">
                  Timeline
                </span>

                <h2>
                  Atividades recentes
                </h2>
              </div>

              <button
                className="card-icon-button"
                aria-label="Mais opções"
              >
                <i className="bi bi-three-dots" />
              </button>

            </div>

            <div className="activity-list">

              {activities.map((activity) => (
                <div
                  className="activity-item"
                  key={`${activity.name}-${activity.time}`}
                >
                  <div className="activity-avatar">
                    {activity.initials}
                  </div>

                  <div className="activity-content">
                    <p>
                      <strong>{activity.name}</strong>{' '}
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
              ))}

            </div>

            <button className="activity-footer-button">
              Ver todas as atividades
              <i className="bi bi-arrow-right" />
            </button>

          </article>
        </div>

      </section>

    </main>
  );
}