'use client';

import './dashboard.css'
import { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Filler,
  Legend
);

const navGroups = [
  {
    label: "PRINCIPAL",
    items: [
      ["Dashboard", "bi-grid-1x2-fill"],
      ["Pedidos", "bi-bag"],
      ["Produtos", "bi-box-seam"],
      ["Clientes", "bi-people"],
      ["Relatórios", "bi-bar-chart"],
      ["Financeiro", "bi-wallet2"],
    ],
  },
  {
    label: "GERENCIAMENTO",
    items: [
      ["Usuários", "bi-person"],
      ["Funções", "bi-shield-check"],
      ["Configurações", "bi-gear"],
      ["Integrações", "bi-link-45deg"],
    ],
  },
  {
    label: "SUPORTE",
    items: [
      ["Central de Ajuda", "bi-question-circle"],
      ["Suporte", "bi-headset"],
    ],
  },
];

const metrics = [
  {
    title: "Receita total",
    value: "R$ 84.250,00",
    delta: "12,8%",
    positive: true,
    icon: "bi-currency-dollar",
    accent: "blue",
    points: [28, 34, 31, 42, 38, 52, 48, 58],
  },
  {
    title: "Pedidos",
    value: "1.452",
    delta: "8,4%",
    positive: true,
    icon: "bi-bag",
    accent: "green",
    points: [32, 38, 35, 48, 43, 50, 46, 61],
  },
  {
    title: "Clientes",
    value: "823",
    delta: "5,7%",
    positive: true,
    icon: "bi-people",
    accent: "violet",
    points: [30, 29, 40, 37, 49, 44, 55, 61],
  },
  {
    title: "Ticket médio",
    value: "R$ 58,02",
    delta: "2,4%",
    positive: false,
    icon: "bi-graph-up-arrow",
    accent: "amber",
    points: [52, 57, 50, 68, 59, 45, 53, 48],
  },
];

const orders = [
  ["#10254", "Lucas Ferreira", "12/06/2025", "R$ 1.250,00", "Concluído", "success"],
  ["#10253", "Juliana Costa", "12/06/2025", "R$ 890,50", "Em andamento", "info"],
  ["#10252", "Rafael Almeida", "11/06/2025", "R$ 2.450,00", "Pendente", "warning"],
  ["#10251", "Mariana Santos", "11/06/2025", "R$ 560,00", "Concluído", "success"],
  ["#10250", "Gustavo Lima", "10/06/2025", "R$ 1.780,00", "Cancelado", "danger"],
];

const activities = [
  ["bi-cart-check", "Novo pedido #10254 criado", "Lucas Ferreira • há 5 min", "blue"],
  ["bi-box-seam", 'Produto "Notebook Pro" atualizado', "Bruno Silva • há 1 hora", "green"],
  ["bi-person-plus", "Novo cliente cadastrado", "Juliana Costa • há 2 horas", "violet"],
  ["bi-currency-dollar", "Pagamento recebido", "Pedido #10253 • há 3 horas", "orange"],
];

function MiniSparkline({ points }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const width = 110;
  const height = 34;
  const path = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((value - min) / Math.max(max - min, 1)) * 26 - 4;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg className="metric-sparkline" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SidebarContent({ active, setActive, mobile = false }) {
  return (
    <div className={`sidebar-content ${mobile ? "sidebar-content-mobile" : ""}`}>
      <div className="brand">
        <span className="brand-mark">
          <i className="bi bi-layers-fill" />
        </span>
        <span>SaaS<span className="brand-accent">Pro</span></span>
      </div>

      <nav className="sidebar-nav" aria-label="Navegação principal">
        {navGroups.map((group) => (
          <div className="nav-group" key={group.label}>
            <div className="nav-group-label">{group.label}</div>
            {group.items.map(([label, icon]) => {
              const selected = active === label;
              return (
                <button
                  key={label}
                  type="button"
                  className={`nav-item ${selected ? "is-active" : ""}`}
                  onClick={() => setActive(label)}
                  aria-current={selected ? "page" : undefined}
                  data-bs-dismiss={mobile ? "offcanvas" : undefined}
                >
                  <i className={`bi ${icon}`} aria-hidden="true" />
                  <span>{label}</span>
                  {label === "Pedidos" && <span className="nav-count">12</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="profile-card">
          <div className="avatar avatar-dark">BS</div>
          <div className="profile-copy">
            <strong>Bruno Silva</strong>
            <span>Administrador</span>
          </div>
          <button className="icon-button subtle" aria-label="Abrir opções do perfil">
            <i className="bi bi-chevron-down" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ metric }) {
  return (
    <article className="metric-card card h-100">
      <div className="metric-top">
        <div>
          <span className="metric-label">{metric.title}</span>
          <div className="metric-value">{metric.value}</div>
        </div>
        <div className={`metric-icon ${metric.accent}`}>
          <i className={`bi ${metric.icon}`} aria-hidden="true" />
        </div>
      </div>
      <div className="metric-bottom">
        <span className={`metric-change ${metric.positive ? "positive" : "negative"}`}>
          <i className={`bi ${metric.positive ? "bi-arrow-up-right" : "bi-arrow-down-right"}`} />
          {metric.delta}
        </span>
        <span className="metric-period">vs. mês anterior</span>
        <MiniSparkline points={metric.points} />
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const [active, setActive] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((row) => row.join(" ").toLowerCase().includes(query));
  }, [search]);

  const lineData = {
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
    datasets: [
      {
        label: "Receita",
        data: [32, 54, 61, 42, 71, 85],
        borderColor: "#1769e0",
        backgroundColor: "rgba(23,105,224,.10)",
        fill: true,
        tension: 0.38,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#fff",
        pointBorderWidth: 2,
        pointBorderColor: "#1769e0",
      },
    ],
  };

  const doughnutData = {
    labels: ["Concluído", "Em andamento", "Pendente", "Cancelado"],
    datasets: [
      {
        data: [856, 342, 154, 100],
        backgroundColor: ["#1769e0", "#42b883", "#f2b84b", "#f27878"],
        borderWidth: 0,
        hoverOffset: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#101828",
        padding: 12,
        displayColors: false,
        titleFont: { size: 12, weight: "600" },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#7a8699", font: { size: 11 } },
      },
      y: {
        grid: { color: "#edf1f6", drawTicks: false },
        border: { display: false },
        ticks: {
          color: "#7a8699",
          font: { size: 11 },
          callback: (value) => `${value}k`,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: { legend: { display: false } },
  };

  return (
    <div className="dashboard-shell">
      <aside className="sidebar-desktop">
        <SidebarContent active={active} setActive={setActive} />
      </aside>

      <div
        className="offcanvas offcanvas-start sidebar-mobile"
        tabIndex="-1"
        id="mobileSidebar"
        aria-labelledby="mobileSidebarLabel"
      >
        <div className="offcanvas-body p-0">
          <SidebarContent active={active} setActive={setActive} mobile />
        </div>
      </div>

      <main className="main-area">
        <header className="topbar navbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#mobileSidebar"
              aria-controls="mobileSidebar"
              aria-label="Abrir menu"
            >
              <i className="bi bi-list" />
            </button>
            <div className="page-heading">
              <div className="page-title-row">
                <h1>{active}</h1>
                <span className="breadcrumb-current">/ Visão geral</span>
              </div>
              <span className="page-subtitle">Acompanhe o desempenho do seu negócio.</span>
            </div>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <i className="bi bi-search" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar..."
                aria-label="Buscar no dashboard"
              />
              <kbd>Ctrl K</kbd>
            </label>
            <button className="icon-button notification" aria-label="Notificações">
              <i className="bi bi-bell" />
              <span>3</span>
            </button>
            <button className="icon-button notification" aria-label="Mensagens">
              <i className="bi bi-envelope" />
              <span>5</span>
            </button>
            <button className="user-trigger" aria-label="Abrir menu do usuário">
              <span className="avatar avatar-sm">BS</span>
              <span className="user-name">Bruno Silva</span>
              <i className="bi bi-chevron-down" />
            </button>
          </div>
        </header>

        <div className="content">
          <section className="content-intro">
            <div>
              <h2>Olá, Bruno! <span aria-hidden="true">👋</span></h2>
              <p>Aqui está o resumo do seu negócio hoje.</p>
            </div>
            <button className="btn filter-button">
              <i className="bi bi-calendar3" />
              01 Jun — 30 Jun
              <i className="bi bi-chevron-down" />
            </button>
          </section>

          <section className="row g-3 g-xl-4 mb-3 mb-xl-4" aria-label="Métricas principais">
            {metrics.map((metric) => (
              <div className="col-12 col-sm-6 col-xl-3" key={metric.title}>
                <MetricCard metric={metric} />
              </div>
            ))}
          </section>

          <section className="row g-3 g-xl-4">
            <div className="col-12 col-xl-7">
              <article className="surface-card chart-card">
                <div className="surface-header">
                  <div>
                    <h3>Receita nos últimos 6 meses</h3>
                    <p>Evolução da receita mensal</p>
                  </div>
                  <button className="btn compact-button">
                    6 meses <i className="bi bi-chevron-down" />
                  </button>
                </div>
                <div className="chart-wrap line-chart">
                  <Line data={lineData} options={chartOptions} />
                </div>
              </article>
            </div>

            <div className="col-12 col-xl-5">
              <article className="surface-card chart-card">
                <div className="surface-header">
                  <div>
                    <h3>Pedidos por status</h3>
                    <p>Distribuição do período</p>
                  </div>
                  <button className="btn compact-button">
                    Este mês <i className="bi bi-chevron-down" />
                  </button>
                </div>
                <div className="donut-layout">
                  <div className="donut-chart">
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                    <div className="donut-center">
                      <strong>1.452</strong>
                      <span>Total</span>
                    </div>
                  </div>
                  <div className="legend-list">
                    {[
                      ["Concluído", "856", "58,9%", "blue"],
                      ["Em andamento", "342", "23,6%", "green"],
                      ["Pendente", "154", "10,6%", "amber"],
                      ["Cancelado", "100", "6,9%", "red"],
                    ].map(([label, value, percent, tone]) => (
                      <div className="legend-item" key={label}>
                        <span className={`legend-dot ${tone}`} />
                        <span className="legend-label">{label}</span>
                        <span className="legend-value">{value} <small>({percent})</small></span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </div>

            <div className="col-12 col-xl-8">
              <article className="surface-card table-card">
                <div className="surface-header">
                  <div>
                    <h3>Últimos pedidos</h3>
                    <p>Pedidos mais recentes do sistema</p>
                  </div>
                  <button className="btn compact-button">Ver todos</button>
                </div>

                <div className="table-responsive">
                  <table className="table dashboard-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Pedido</th>
                        <th>Cliente</th>
                        <th>Data</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th className="text-end">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(([id, customer, date, value, status, tone]) => (
                        <tr key={id}>
                          <td><strong>{id}</strong></td>
                          <td>{customer}</td>
                          <td>{date}</td>
                          <td>{value}</td>
                          <td><span className={`status-badge ${tone}`}>{status}</span></td>
                          <td className="text-end">
                            <button className="row-action" aria-label={`Ações do pedido ${id}`}>
                              <i className="bi bi-three-dots" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!filteredOrders.length && (
                        <tr>
                          <td colSpan="6" className="empty-state">
                            Nenhum pedido encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="table-footer">
                  <span>Mostrando 1 a 5 de 20 pedidos</span>
                  <nav aria-label="Paginação">
                    <ul className="pagination pagination-sm mb-0 dashboard-pagination">
                      <li className="page-item disabled"><button className="page-link">‹</button></li>
                      {[1, 2, 3, 4].map((number) => (
                        <li className={`page-item ${page === number ? "active" : ""}`} key={number}>
                          <button className="page-link" onClick={() => setPage(number)}>{number}</button>
                        </li>
                      ))}
                      <li className="page-item"><button className="page-link">›</button></li>
                    </ul>
                  </nav>
                </div>
              </article>
            </div>

            <div className="col-12 col-xl-4">
              <div className="d-flex flex-column gap-3 gap-xl-4">
                <article className="surface-card activity-card">
                  <div className="surface-header">
                    <div>
                      <h3>Atividades recentes</h3>
                      <p>Últimas movimentações</p>
                    </div>
                    <button className="btn compact-button">Ver todas</button>
                  </div>
                  <div className="activity-list">
                    {activities.map(([icon, title, meta, tone]) => (
                      <div className="activity-item" key={title}>
                        <span className={`activity-icon ${tone}`}><i className={`bi ${icon}`} /></span>
                        <div className="activity-copy">
                          <strong>{title}</strong>
                          <span>{meta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="surface-card quick-card">
                  <div className="surface-header">
                    <div>
                      <h3>Ações rápidas</h3>
                      <p>Atalhos para tarefas frequentes</p>
                    </div>
                  </div>
                  <div className="quick-grid">
                    {[
                      ["Novo pedido", "bi-cart-plus"],
                      ["Adicionar produto", "bi-box-seam"],
                      ["Exportar relatório", "bi-file-earmark-arrow-down"],
                      ["Ver usuários", "bi-people"],
                    ].map(([label, icon]) => (
                      <button className="quick-action" key={label}>
                        <span><i className={`bi ${icon}`} /></span>
                        {label}
                      </button>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
