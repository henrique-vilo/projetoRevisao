'use client';

import './dashboard.css';

import Link from 'next/link';
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
   Mesmo contrato usado nas páginas de Pedidos e Produtos:
   { sucesso, dados: [...], paginacao: { total, totalPaginas, pagina } }
===================================================== */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const MONTH_LABELS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

const STATUS_CONFIG = {
  carrinho: { label: 'Carrinho', className: 'warning' },
  pendente: { label: 'Pendente', className: 'warning' },
  processando: { label: 'Processando', className: 'info' },
  enviado: { label: 'Enviado', className: 'info' },
  entregue: { label: 'Entregue', className: 'success' },
  cancelado: { label: 'Cancelado', className: 'danger' },
};

/* =====================================================
   HELPERS
===================================================== */

function getToken() {
  if (typeof window === 'undefined') return null;

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
  const normalizedStatus = String(status || '').trim().toLowerCase();
  return (
    STATUS_CONFIG[normalizedStatus] || {
      label: status || 'Desconhecido',
      className: 'warning',
    }
  );
}

function getUserName(user) {
  if (!user) return null;
  return user.nome || user.nomeUsuario || user.nomeCompleto || user.name || null;
}

function formatCurrency(value) {
  return (Number(value) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('pt-BR');
}

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return '—';

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getInitials(name) {
  const clean = String(name || '').replace(/^Usuário\s*#?/i, 'Usuário ');
  const parts = clean.trim().split(' ').filter(Boolean);

  if (parts.length === 0) return 'US';

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

/* =====================================================
   FETCH DA API (somente dados reais do backend)
===================================================== */

async function apiFetch(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'GET',
    headers: { ...getHeaders() },
    cache: 'no-store',
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || (data && data.sucesso === false)) {
    const message =
      data?.erro ||
      data?.mensagem ||
      `Erro HTTP ${response.status}`;

    throw new Error(message);
  }

  return data;
}

async function fetchAllPages(endpoint, limit = 100) {
  const first = await apiFetch(`${endpoint}?pagina=1&limite=${limit}`);

  const firstData = Array.isArray(first?.dados) ? first.dados : [];

  const total = Number(first?.paginacao?.total) || firstData.length;

  const totalPaginas = Math.max(
    1,
    Number(first?.paginacao?.totalPaginas) || 1
  );

  if (totalPaginas <= 1) {
    return { data: firstData, total };
  }

  const requests = [];

  for (let page = 2; page <= totalPaginas; page += 1) {
    requests.push(apiFetch(`${endpoint}?pagina=${page}&limite=${limit}`));
  }

  const rest = await Promise.all(requests);

  const restData = rest.flatMap((response) =>
    Array.isArray(response?.dados) ? response.dados : []
  );

  return { data: [...firstData, ...restData], total };
}

/* =====================================================
   COMPONENT
===================================================== */

export default function DashboardPage() {
  const [vendas, setVendas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [totals, setTotals] = useState({
    vendas: 0,
    produtos: 0,
    usuarios: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);

  /* ===================================================
     CARREGAR DASHBOARD
  =================================================== */

  const carregarDashboard = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const [vendasResult, produtosResult, usuariosResult] = await Promise.all([
        fetchAllPages('/vendas', 100),
        fetchAllPages('/produtos', 100),
        fetchAllPages('/usuarios', 100),
      ]);

      setVendas(vendasResult.data);
      setProdutos(produtosResult.data);
      setUsuarios(usuariosResult.data);

      setTotals({
        vendas: vendasResult.total,
        produtos: produtosResult.total,
        usuarios: usuariosResult.total,
      });

      setUpdatedAt(new Date());
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);

      setError(
        err?.message || 'Não foi possível carregar os dados do dashboard.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarDashboard();
  }, [carregarDashboard]);

  /* ===================================================
     MAPAS DE APOIO (produto e usuário por id)
  =================================================== */

  const produtosMap = useMemo(() => {
    const map = new Map();
    produtos.forEach((produto) => map.set(String(produto.idProduto), produto));
    return map;
  }, [produtos]);

  const usuariosMap = useMemo(() => {
    const map = new Map();
    usuarios.forEach((usuario) => map.set(String(usuario.idUsuario), usuario));
    return map;
  }, [usuarios]);

  /* ===================================================
     VENDAS NORMALIZADAS (join com produto e usuário reais)
  =================================================== */

  const normalizedSales = useMemo(() => {
    return vendas
      .map((sale) => {
        const produto = produtosMap.get(String(sale.idProduto));
        const usuario = usuariosMap.get(String(sale.idUsuario));
        const status = getStatusConfig(sale.status);
        const rawDate = parseDate(sale.dataPedido);

        return {
          id: `#ORD-${sale.idVendas}`,
          idVendas: sale.idVendas,
          customer: sale.nomeUsuario || getUserName(usuario) || `Usuário #${sale.idUsuario}`,
          product: sale.nomeProduto || produto?.nome || `Produto #${sale.idProduto}`,
          date: formatDate(sale.dataPedido),
          rawDate,
          value: Number(sale.precoProduto ?? produto?.preco) || 0,
          statusKey: String(sale.status || '').trim().toLowerCase(),
          status: status.label,
          statusClass: status.className,
        };
      })
      .sort((a, b) => {
        if (!a.rawDate) return 1;
        if (!b.rawDate) return -1;
        return b.rawDate.getTime() - a.rawDate.getTime();
      });
  }, [vendas, produtosMap, usuariosMap]);

  const orderSales = useMemo(
    () => normalizedSales.filter((sale) => sale.statusKey !== 'carrinho'),
    [normalizedSales]
  );

  const revenueSales = useMemo(
    () => orderSales.filter((sale) => sale.statusKey !== 'cancelado'),
    [orderSales]
  );

  /* ===================================================
     RECEITA
  =================================================== */

  const totalRevenue = useMemo(
    () => revenueSales.reduce((sum, sale) => sum + sale.value, 0),
    [revenueSales]
  );

  const averageTicket = useMemo(() => {
    if (revenueSales.length === 0) return 0;
    return totalRevenue / revenueSales.length;
  }, [totalRevenue, revenueSales.length]);

  /* ===================================================
     SÉRIES MENSAIS (ano corrente, dados reais das vendas)
  =================================================== */

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;

  const monthlyOrders = useMemo(() => {
    const result = new Array(12).fill(0);

    orderSales.forEach((sale) => {
      if (!sale.rawDate || sale.rawDate.getFullYear() !== currentYear) return;
      result[sale.rawDate.getMonth()] += 1;
    });

    return result;
  }, [orderSales, currentYear]);

  const monthlyRevenue = useMemo(() => {
    const result = new Array(12).fill(0);

    revenueSales.forEach((sale) => {
      if (!sale.rawDate || sale.rawDate.getFullYear() !== currentYear) return;
      result[sale.rawDate.getMonth()] += sale.value;
    });

    return result;
  }, [revenueSales, currentYear]);

  const revenueGrowth = useMemo(() => {
    const current = monthlyRevenue[currentMonth];
    const previous = monthlyRevenue[previousMonth];

    if (!previous) return null;

    return ((current - previous) / previous) * 100;
  }, [monthlyRevenue, currentMonth, previousMonth]);

  const ordersGrowth = useMemo(() => {
    const current = monthlyOrders[currentMonth];
    const previous = monthlyOrders[previousMonth];

    if (!previous) return null;

    return ((current - previous) / previous) * 100;
  }, [monthlyOrders, currentMonth, previousMonth]);

  /* ===================================================
     CATEGORIAS (dados reais dos produtos)
  =================================================== */

  const categoryDistribution = useMemo(() => {
    const categories = {};

    produtos.forEach((produto) => {
      const category = produto.categoriaNome || 'Sem categoria';
      categories[category] = (categories[category] || 0) + 1;
    });

    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [produtos]);

  const lowStockCount = useMemo(
    () =>
      produtos.filter(
        (produto) => Number(produto.ativo) === 1 && Number(produto.estoque) <= 10
      ).length,
    [produtos]
  );

  /* ===================================================
     STATUS DOS PEDIDOS (dados reais)
  =================================================== */

  const statusBreakdown = useMemo(() => {
    const counts = {};

    orderSales.forEach((sale) => {
      counts[sale.status] = (counts[sale.status] || 0) + 1;
    });

    return Object.entries(STATUS_CONFIG)
      .map(([key, config]) => ({
        label: config.label,
        className: config.className,
        total: counts[config.label] || 0,
      }))
      .filter((item) => item.total > 0);
  }, [orderSales]);

  /* ===================================================
     GRÁFICO DE RECEITA
  =================================================== */

  const revenueData = useMemo(
    () => ({
      labels: MONTH_LABELS,
      datasets: [
        {
          label: 'Receita',
          data: monthlyRevenue,
          borderColor: '#00a9d4',
          backgroundColor: 'rgba(0, 169, 212, 0.10)',
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

  const revenueOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e1b3a',
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: (context) => ` ${formatCurrency(context.raw)}`,
          },
        },
      },
      scales: {
        x: {
          border: { display: false },
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { size: 11 } },
        },
        y: {
          border: { display: false },
          grid: { color: '#eef2f6' },
          ticks: {
            color: '#94a3b8',
            font: { size: 11 },
            callback: (value) => `R$ ${(value / 1000).toFixed(0)}k`,
          },
        },
      },
    }),
    []
  );

  /* ===================================================
     GRÁFICO DE PEDIDOS
  =================================================== */

  const ordersData = useMemo(
    () => ({
      labels: MONTH_LABELS,
      datasets: [
        {
          label: 'Pedidos',
          data: monthlyOrders,
          backgroundColor: 'rgba(0, 169, 212, 0.22)',
          hoverBackgroundColor: '#00a9d4',
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 18,
        },
      ],
    }),
    [monthlyOrders]
  );

  const ordersOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e1b3a',
          padding: 10,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          border: { display: false },
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { size: 11 } },
        },
        y: {
          border: { display: false },
          grid: { color: '#eef2f6' },
          ticks: { color: '#94a3b8', font: { size: 11 } },
        },
      },
    }),
    []
  );

  /* ===================================================
     DONUT DE CATEGORIAS
  =================================================== */

  const categoryData = useMemo(() => {
    const colors = ['#00a9d4', '#40ffdc', '#1c3166', '#240047', '#9eeaf6'];

    return {
      labels: categoryDistribution.map(([category]) => category),
      datasets: [
        {
          data: categoryDistribution.map(([, total]) => total),
          backgroundColor: colors.slice(0, categoryDistribution.length),
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
        legend: { display: false },
        tooltip: { backgroundColor: '#1e1b3a', padding: 10, cornerRadius: 8 },
      },
    }),
    []
  );

  /* ===================================================
     ATIVIDADES RECENTES (últimas vendas reais)
  =================================================== */

  const activities = useMemo(() => {
    return orderSales.slice(0, 4).map((sale) => ({
      key: sale.id,
      initials: getInitials(sale.customer),
      name: sale.customer,
      context: `${sale.id} · ${sale.product}`,
      time: sale.date,
      statusClass: sale.statusClass,
      statusLabel: sale.status,
    }));
  }, [orderSales]);

  /* ===================================================
     EXPORTAR RELATÓRIO (CSV com os dados reais carregados)
  =================================================== */

  const handleExport = useCallback(() => {
    const header = ['Pedido', 'Cliente', 'Produto', 'Data', 'Valor', 'Status'];

    const rows = orderSales.map((sale) => [
      sale.id,
      sale.customer,
      sale.product,
      sale.date,
      sale.value.toFixed(2).replace('.', ','),
      sale.status,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')
      )
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `relatorio-pedidos-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }, [orderSales]);

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-spinner" />
          <span>Carregando dashboard...</span>
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
        <div className="dashboard-error" role="alert">
          <div>
            <i className="bi bi-exclamation-triangle" />
            <div>
              <strong>Não foi possível carregar o dashboard.</strong>
              <p>{error}</p>
            </div>
          </div>

          <button
            type="button"
            className="dashboard-btn dashboard-btn-outline"
            onClick={() => carregarDashboard()}
          >
            <i className="bi bi-arrow-clockwise" />
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
      {/* HEADER */}
      <section className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">
            <i className="bi bi-graph-up-arrow" />
            Visão geral
          </span>

          <h1>Dashboard</h1>

          <p>
            {updatedAt
              ? `Atualizado às ${updatedAt.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}`
              : 'Acompanhe o desempenho da sua operação em tempo real.'}
          </p>
        </div>

        <div className="dashboard-actions">
          <button
            type="button"
            className="dashboard-btn dashboard-btn-outline"
            onClick={() => carregarDashboard(true)}
            disabled={refreshing}
          >
            <i className={`bi ${refreshing ? 'bi-arrow-repeat spin' : 'bi-arrow-clockwise'}`} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </button>

          <button
            type="button"
            className="dashboard-btn dashboard-btn-primary"
            onClick={handleExport}
            disabled={orderSales.length === 0}
          >
            <i className="bi bi-download" />
            Exportar
          </button>
        </div>
      </section>

      {/* MÉTRICAS */}
      <section className="dashboard-metrics" aria-label="Principais métricas">
        <article className="dashboard-card metric-card">
          <div className="metric-icon revenue">
            <i className="bi bi-currency-dollar" />
          </div>

          <span className="metric-label">Receita total</span>
          <strong className="metric-value">{formatCurrency(totalRevenue)}</strong>

          <div className="metric-footer">
            {revenueGrowth === null ? (
              <span className="metric-trend neutral">Sem histórico do mês anterior</span>
            ) : (
              <span className={`metric-trend ${revenueGrowth >= 0 ? 'up' : 'down'}`}>
                <i className={`bi ${revenueGrowth >= 0 ? 'bi-arrow-up-right' : 'bi-arrow-down-right'}`} />
                {Math.abs(revenueGrowth).toFixed(1)}% vs mês anterior
              </span>
            )}
          </div>
        </article>

        <article className="dashboard-card metric-card">
          <div className="metric-icon orders">
            <i className="bi bi-bag-check" />
          </div>

          <span className="metric-label">Pedidos</span>
          <strong className="metric-value">{formatNumber(orderSales.length)}</strong>

          <div className="metric-footer">
            {ordersGrowth === null ? (
              <span className="metric-trend neutral">Sem histórico do mês anterior</span>
            ) : (
              <span className={`metric-trend ${ordersGrowth >= 0 ? 'up' : 'down'}`}>
                <i className={`bi ${ordersGrowth >= 0 ? 'bi-arrow-up-right' : 'bi-arrow-down-right'}`} />
                {Math.abs(ordersGrowth).toFixed(1)}% vs mês anterior
              </span>
            )}
          </div>
        </article>

        <article className="dashboard-card metric-card">
          <div className="metric-icon products">
            <i className="bi bi-box-seam" />
          </div>

          <span className="metric-label">Produtos</span>
          <strong className="metric-value">{formatNumber(totals.produtos)}</strong>

          <div className="metric-footer">
            {lowStockCount > 0 ? (
              <span className="metric-trend down">
                <i className="bi bi-exclamation-triangle" />
                {lowStockCount} com estoque baixo
              </span>
            ) : (
              <span className="metric-trend neutral">Estoque saudável</span>
            )}
          </div>
        </article>

        <article className="dashboard-card metric-card">
          <div className="metric-icon users">
            <i className="bi bi-people" />
          </div>

          <span className="metric-label">Usuários</span>
          <strong className="metric-value">{formatNumber(totals.usuarios)}</strong>

          <div className="metric-footer">
            <span className="metric-trend neutral">
              Ticket médio {formatCurrency(averageTicket)}
            </span>
          </div>
        </article>
      </section>

      {/* GRÁFICOS */}
      <section className="dashboard-grid">
        <article className="dashboard-card span-8">
          <div className="dashboard-card-header">
            <div>
              <span className="dashboard-card-label">Desempenho financeiro</span>
              <h2>Receita em {currentYear}</h2>
            </div>

            <span className="chart-summary-pill">
              {MONTH_LABELS[currentMonth]}: {formatCurrency(monthlyRevenue[currentMonth])}
            </span>
          </div>

          <div className="chart-container chart-large">
            <Line data={revenueData} options={revenueOptions} />
          </div>
        </article>

        <article className="dashboard-card span-4">
          <div className="dashboard-card-header">
            <div>
              <span className="dashboard-card-label">Distribuição</span>
              <h2>Produtos por categoria</h2>
            </div>
          </div>

          <div className="donut-wrapper">
            <div className="donut-chart">
              <Doughnut data={categoryData} options={categoryOptions} />
              <div className="donut-center">
                <strong>{formatNumber(totals.produtos)}</strong>
                <span>produtos</span>
              </div>
            </div>
          </div>

          <div className="distribution-legend">
            {categoryDistribution.map(([category, total], index) => {
              const percentage = produtos.length
                ? Math.round((total / produtos.length) * 100)
                : 0;

              return (
                <div className="legend-item" key={category}>
                  <span>
                    <i className={`legend-dot category-${index}`} />
                    {category}
                  </span>
                  <strong>{percentage}%</strong>
                </div>
              );
            })}

            {categoryDistribution.length === 0 && (
              <div className="dashboard-empty-inline">Nenhuma categoria encontrada.</div>
            )}
          </div>
        </article>

        <article className="dashboard-card span-8">
          <div className="dashboard-card-header">
            <div>
              <span className="dashboard-card-label">Volume operacional</span>
              <h2>Pedidos em {currentYear}</h2>
            </div>

            <span className="chart-summary-pill">{formatNumber(orderSales.length)} pedidos</span>
          </div>

          <div className="chart-container chart-medium">
            <Bar data={ordersData} options={ordersOptions} />
          </div>
        </article>

        <article className="dashboard-card span-4">
          <div className="dashboard-card-header">
            <div>
              <span className="dashboard-card-label">Atalhos</span>
              <h2>Ações rápidas</h2>
            </div>
          </div>

          <div className="quick-actions">
            <Link href="/admin/pedidos" className="quick-action">
              <span className="quick-action-icon blue">
                <i className="bi bi-plus-lg" />
              </span>
              <span>
                <strong>Novo pedido</strong>
                <small>Criar uma nova venda</small>
              </span>
              <i className="bi bi-chevron-right" />
            </Link>

            <Link href="/admin/produtos" className="quick-action">
              <span className="quick-action-icon purple">
                <i className="bi bi-box-seam" />
              </span>
              <span>
                <strong>Adicionar produto</strong>
                <small>Cadastrar novo produto</small>
              </span>
              <i className="bi bi-chevron-right" />
            </Link>

            <button type="button" className="quick-action" onClick={handleExport}>
              <span className="quick-action-icon green">
                <i className="bi bi-file-earmark-arrow-down" />
              </span>
              <span>
                <strong>Exportar relatório</strong>
                <small>Baixar pedidos em CSV</small>
              </span>
              <i className="bi bi-chevron-right" />
            </button>

            <Link href="/admin/usuarios" className="quick-action">
              <span className="quick-action-icon orange">
                <i className="bi bi-person-plus" />
              </span>
              <span>
                <strong>Ver usuários</strong>
                <small>Gerenciar clientes</small>
              </span>
              <i className="bi bi-chevron-right" />
            </Link>
          </div>

          {statusBreakdown.length > 0 && (
            <div className="status-breakdown">
              {statusBreakdown.map((item) => (
                <div className="status-breakdown-item" key={item.label}>
                  <span className={`status-badge ${item.className}`}>
                    <span />
                    {item.label}
                  </span>
                  <strong>{item.total}</strong>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      {/* PEDIDOS + ATIVIDADES */}
      <section className="dashboard-grid">
        <article className="dashboard-card span-8">
          <div className="dashboard-card-header">
            <div>
              <span className="dashboard-card-label">Operação</span>
              <h2>Pedidos recentes</h2>
            </div>

            <Link href="/admin/pedidos" className="dashboard-link">
              Ver todos
              <i className="bi bi-arrow-right" />
            </Link>
          </div>

          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Produto</th>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {orderSales.slice(0, 5).map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <span className="order-id">{sale.id}</span>
                    </td>
                    <td>{sale.customer}</td>
                    <td>{sale.product}</td>
                    <td className="table-muted">{sale.date}</td>
                    <td>
                      <strong className="order-value">{formatCurrency(sale.value)}</strong>
                    </td>
                    <td>
                      <span className={`status-badge ${sale.statusClass}`}>
                        <span />
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {orderSales.length === 0 && (
                  <tr>
                    <td colSpan="6" className="dashboard-empty">
                      <i className="bi bi-inbox" />
                      Nenhum pedido encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="dashboard-card span-4">
          <div className="dashboard-card-header">
            <div>
              <span className="dashboard-card-label">Timeline</span>
              <h2>Atividades recentes</h2>
            </div>
          </div>

          <div className="activity-list">
            {activities.map((activity) => (
              <div className="activity-item" key={activity.key}>
                <div className="activity-avatar">{activity.initials}</div>

                <div className="activity-content">
                  <p>
                    <strong>{activity.name}</strong> realizou um novo pedido
                  </p>
                  <span>{activity.context}</span>
                  <div className="activity-meta">
                    <small>{activity.time}</small>
                    <span className={`status-badge sm ${activity.statusClass}`}>
                      {activity.statusLabel}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {activities.length === 0 && (
              <div className="dashboard-empty">
                <i className="bi bi-clock-history" />
                Nenhuma atividade recente.
              </div>
            )}
          </div>

          <Link href="/admin/pedidos" className="dashboard-link block">
            Ver todas as atividades
            <i className="bi bi-arrow-right" />
          </Link>
        </article>
      </section>
    </main>
  );
}
