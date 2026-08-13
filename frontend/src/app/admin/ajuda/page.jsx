'use client';

import './suporte.css';

import { useMemo, useState } from 'react';

const initialTickets = [
  {
    id: 1024,
    user: {
      name: 'João Silva',
      email: 'joao.silva@email.com',
      id: 184,
    },
    subject: 'Problema com meu pedido',
    category: 'Pedido',
    priority: 'Alta',
    status: 'Aberto',
    date: 'Hoje, 13:42',
    message:
      'Meu pedido foi marcado como entregue, mas eu ainda não recebi o produto. Gostaria de verificar o que aconteceu.',
    messages: [
      {
        id: 1,
        author: 'user',
        name: 'João Silva',
        time: '13:42',
        message:
          'Meu pedido foi marcado como entregue, mas eu ainda não recebi o produto. Gostaria de verificar o que aconteceu.',
      },
    ],
  },

  {
    id: 1023,
    user: {
      name: 'Maria Souza',
      email: 'maria.souza@email.com',
      id: 205,
    },
    subject: 'Produto recebido incorretamente',
    category: 'Produto',
    priority: 'Média',
    status: 'Em atendimento',
    date: 'Hoje, 11:18',
    message:
      'Recebi um produto diferente do que havia solicitado no meu pedido.',
    messages: [
      {
        id: 1,
        author: 'user',
        name: 'Maria Souza',
        time: '11:18',
        message:
          'Recebi um produto diferente do que havia solicitado no meu pedido.',
      },
      {
        id: 2,
        author: 'admin',
        name: 'Administrador',
        time: '11:31',
        message:
          'Olá, Maria! Vamos verificar o pedido e conferir o produto enviado.',
      },
    ],
  },

  {
    id: 1022,
    user: {
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@email.com',
      id: 317,
    },
    subject: 'Dúvida sobre pagamento',
    category: 'Pagamento',
    priority: 'Baixa',
    status: 'Resolvido',
    date: 'Ontem, 16:05',
    message:
      'Gostaria de entender como funciona a confirmação do pagamento do pedido.',
    messages: [
      {
        id: 1,
        author: 'user',
        name: 'Carlos Oliveira',
        time: '16:05',
        message:
          'Gostaria de entender como funciona a confirmação do pagamento do pedido.',
      },
      {
        id: 2,
        author: 'admin',
        name: 'Administrador',
        time: '16:21',
        message:
          'Olá, Carlos! A confirmação acontece automaticamente após a aprovação do pagamento.',
      },
      {
        id: 3,
        author: 'user',
        name: 'Carlos Oliveira',
        time: '16:32',
        message:
          'Entendi. Muito obrigado pela ajuda!',
      },
    ],
  },

  {
    id: 1021,
    user: {
      name: 'Ana Martins',
      email: 'ana.martins@email.com',
      id: 421,
    },
    subject: 'Erro ao finalizar compra',
    category: 'Checkout',
    priority: 'Alta',
    status: 'Aberto',
    date: 'Ontem, 14:27',
    message:
      'Estou tentando finalizar minha compra, mas aparece uma mensagem de erro.',
    messages: [
      {
        id: 1,
        author: 'user',
        name: 'Ana Martins',
        time: '14:27',
        message:
          'Estou tentando finalizar minha compra, mas aparece uma mensagem de erro.',
      },
    ],
  },

  {
    id: 1020,
    user: {
      name: 'Pedro Santos',
      email: 'pedro.santos@email.com',
      id: 509,
    },
    subject: 'Solicitação de troca',
    category: 'Troca',
    priority: 'Média',
    status: 'Em atendimento',
    date: '12 Ago, 10:14',
    message:
      'Gostaria de solicitar a troca de um produto que comprei recentemente.',
    messages: [
      {
        id: 1,
        author: 'user',
        name: 'Pedro Santos',
        time: '10:14',
        message:
          'Gostaria de solicitar a troca de um produto que comprei recentemente.',
      },
    ],
  },
];

function getStatusClass(status) {
  if (status === 'Aberto') {
    return 'open';
  }

  if (status === 'Em atendimento') {
    return 'warning';
  }

  return 'success';
}

function getPriorityClass(priority) {
  if (priority === 'Alta') {
    return 'high';
  }

  if (priority === 'Média') {
    return 'medium';
  }

  return 'low';
}

function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

export default function SuportePage() {
  const [tickets, setTickets] = useState(initialTickets);

  const [search, setSearch] = useState('');

  const [statusFilter, setStatusFilter] =
    useState('Todos');

  const [priorityFilter, setPriorityFilter] =
    useState('Todas');

  const [selectedTicket, setSelectedTicket] =
    useState(null);

  const [response, setResponse] = useState('');

  const [activeTab, setActiveTab] =
    useState('todos');

  const filteredTickets = useMemo(() => {
    const term = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesSearch =
        !term ||
        [
          ticket.id.toString(),
          ticket.subject,
          ticket.category,
          ticket.user.name,
          ticket.user.email,
        ].some((value) =>
          value.toLowerCase().includes(term)
        );

      const matchesStatus =
        statusFilter === 'Todos' ||
        ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === 'Todas' ||
        ticket.priority === priorityFilter;

      const matchesTab =
        activeTab === 'todos' ||
        (activeTab === 'abertos' &&
          ticket.status === 'Aberto') ||
        (activeTab === 'atendimento' &&
          ticket.status === 'Em atendimento') ||
        (activeTab === 'resolvidos' &&
          ticket.status === 'Resolvido');

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesTab
      );
    });
  }, [
    tickets,
    search,
    statusFilter,
    priorityFilter,
    activeTab,
  ]);

  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) => ticket.status === 'Aberto'
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === 'Em atendimento'
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === 'Resolvido'
  ).length;

  const highPriorityTickets = tickets.filter(
    (ticket) => ticket.priority === 'Alta'
  ).length;

  const openTicket = (ticket) => {
    setSelectedTicket(ticket);
    setResponse('');
  };

  const closeTicket = () => {
    setSelectedTicket(null);
    setResponse('');
  };

  const sendResponse = () => {
    const message = response.trim();

    if (!message || !selectedTicket) {
      return;
    }

    const newMessage = {
      id: Date.now(),
      author: 'admin',
      name: 'Administrador',
      time: 'Agora',
      message,
    };

    const updatedTicket = {
      ...selectedTicket,
      status: 'Em atendimento',
      messages: [
        ...selectedTicket.messages,
        newMessage,
      ],
    };

    setTickets((previous) =>
      previous.map((ticket) =>
        ticket.id === selectedTicket.id
          ? updatedTicket
          : ticket
      )
    );

    setSelectedTicket(updatedTicket);
    setResponse('');
  };

  const changeTicketStatus = (status) => {
    if (!selectedTicket) {
      return;
    }

    const updatedTicket = {
      ...selectedTicket,
      status,
    };

    setTickets((previous) =>
      previous.map((ticket) =>
        ticket.id === selectedTicket.id
          ? updatedTicket
          : ticket
      )
    );

    setSelectedTicket(updatedTicket);
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('Todos');
    setPriorityFilter('Todas');
    setActiveTab('todos');
  };

  return (
    <>
      <main className="support-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="support-heading">

          <div>
            <span className="support-eyebrow">
              Atendimento
            </span>

            <h1>
              Central de suporte
            </h1>

            <p>
              Gerencie reclamações, dúvidas e solicitações
              enviadas pelos usuários.
            </p>
          </div>

          <div className="support-heading-actions">

            <button
              type="button"
              className="support-btn support-btn-secondary"
              onClick={resetFilters}
            >
              <i className="bi bi-arrow-clockwise" />
              Atualizar
            </button>

          </div>

        </section>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="support-stats">

          <div className="support-stat-card">

            <div className="support-stat-icon blue">
              <i className="bi bi-headset" />
            </div>

            <div className="support-stat-content">
              <span>Total de chamados</span>
              <strong>{totalTickets}</strong>
            </div>

          </div>

          <div className="support-stat-card">

            <div className="support-stat-icon red">
              <i className="bi bi-exclamation-circle" />
            </div>

            <div className="support-stat-content">
              <span>Abertos</span>
              <strong>{openTickets}</strong>
            </div>

          </div>

          <div className="support-stat-card">

            <div className="support-stat-icon orange">
              <i className="bi bi-chat-dots" />
            </div>

            <div className="support-stat-content">
              <span>Em atendimento</span>
              <strong>{inProgressTickets}</strong>
            </div>

          </div>

          <div className="support-stat-card">

            <div className="support-stat-icon green">
              <i className="bi bi-check-circle" />
            </div>

            <div className="support-stat-content">
              <span>Resolvidos</span>
              <strong>{resolvedTickets}</strong>
            </div>

          </div>

          <div className="support-stat-card">

            <div className="support-stat-icon purple">
              <i className="bi bi-lightning-charge" />
            </div>

            <div className="support-stat-content">
              <span>Alta prioridade</span>
              <strong>{highPriorityTickets}</strong>
            </div>

          </div>

        </section>

        {/* =================================================
            MAIN CARD
        ================================================= */}

        <section className="support-card">

          {/* CARD HEADER */}

          <div className="support-card-header">

            <div>
              <span className="support-card-label">
                Gerenciamento
              </span>

              <h2>
                Chamados de suporte
              </h2>
            </div>

            <div className="support-header-tools">

              <div className="support-search">

                <i className="bi bi-search" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Buscar chamado..."
                  aria-label="Buscar chamado"
                />

                {search && (
                  <button
                    type="button"
                    className="support-search-clear"
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

          {/* =================================================
              TABS
          ================================================= */}

          <div className="support-tabs">

            <button
              type="button"
              className={
                activeTab === 'todos'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setActiveTab('todos')
              }
            >
              Todos
              <span>{totalTickets}</span>
            </button>

            <button
              type="button"
              className={
                activeTab === 'abertos'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setActiveTab('abertos')
              }
            >
              Abertos
              <span>{openTickets}</span>
            </button>

            <button
              type="button"
              className={
                activeTab === 'atendimento'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setActiveTab('atendimento')
              }
            >
              Em atendimento
              <span>{inProgressTickets}</span>
            </button>

            <button
              type="button"
              className={
                activeTab === 'resolvidos'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setActiveTab('resolvidos')
              }
            >
              Resolvidos
              <span>{resolvedTickets}</span>
            </button>

          </div>

          {/* =================================================
              FILTERS
          ================================================= */}

          <div className="support-filters">

            <div className="support-filter">

              <label htmlFor="support-status">
                Status
              </label>

              <select
                id="support-status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >
                <option value="Todos">
                  Todos
                </option>

                <option value="Aberto">
                  Aberto
                </option>

                <option value="Em atendimento">
                  Em atendimento
                </option>

                <option value="Resolvido">
                  Resolvido
                </option>
              </select>

            </div>

            <div className="support-filter">

              <label htmlFor="support-priority">
                Prioridade
              </label>

              <select
                id="support-priority"
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(
                    event.target.value
                  )
                }
              >
                <option value="Todas">
                  Todas
                </option>

                <option value="Alta">
                  Alta
                </option>

                <option value="Média">
                  Média
                </option>

                <option value="Baixa">
                  Baixa
                </option>
              </select>

            </div>

          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="table-responsive support-table-wrapper">

            <table className="table support-table align-middle">

              <thead>

                <tr>
                  <th>Chamado</th>
                  <th>Usuário</th>
                  <th>Assunto</th>
                  <th>Prioridade</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Ação</th>
                </tr>

              </thead>

              <tbody>

                {filteredTickets.length > 0 ? (

                  filteredTickets.map((ticket) => (

                    <tr key={ticket.id}>

                      {/* TICKET */}

                      <td>

                        <div className="support-ticket-id">
                          <span>
                            #{ticket.id}
                          </span>

                          <small>
                            {ticket.category}
                          </small>
                        </div>

                      </td>

                      {/* USER */}

                      <td>

                        <div className="support-user-cell">

                          <div className="support-user-avatar">
                            {getInitials(
                              ticket.user.name
                            )}
                          </div>

                          <div className="support-user-info">

                            <span>
                              {ticket.user.name}
                            </span>

                            <small>
                              {ticket.user.email}
                            </small>

                          </div>

                        </div>

                      </td>

                      {/* SUBJECT */}

                      <td>

                        <div className="support-subject">

                          <strong>
                            {ticket.subject}
                          </strong>

                          <span>
                            {ticket.message}
                          </span>

                        </div>

                      </td>

                      {/* PRIORITY */}

                      <td>

                        <span
                          className={`support-priority ${getPriorityClass(
                            ticket.priority
                          )}`}
                        >
                          <span />
                          {ticket.priority}
                        </span>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`support-status ${getStatusClass(
                            ticket.status
                          )}`}
                        >
                          <span />
                          {ticket.status}
                        </span>

                      </td>

                      {/* DATE */}

                      <td>

                        <span className="support-date">
                          {ticket.date}
                        </span>

                      </td>

                      {/* ACTION */}

                      <td>

                        <button
                          type="button"
                          className="support-view-btn"
                          onClick={() =>
                            openTicket(ticket)
                          }
                        >
                          <i className="bi bi-chat-square-text" />
                          Ver chamado
                        </button>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="7"
                      className="support-empty"
                    >

                      <div className="support-empty-content">

                        <div className="support-empty-icon">
                          <i className="bi bi-inbox" />
                        </div>

                        <strong>
                          Nenhum chamado encontrado
                        </strong>

                        <span>
                          Tente alterar os filtros ou
                          realizar outra busca.
                        </span>

                      </div>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="support-table-footer">

            <span>
              Mostrando{' '}
              <strong>
                {filteredTickets.length}
              </strong>{' '}
              de{' '}
              <strong>
                {tickets.length}
              </strong>{' '}
              chamados
            </span>

            <span className="support-footer-status">
              <i className="bi bi-shield-check" />
              Central administrativa
            </span>

          </div>

        </section>

      </main>

      {/* =====================================================
          TICKET MODAL
      ===================================================== */}

      {selectedTicket && (

        <div
          className="support-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeTicket();
            }
          }}
        >

          <div
            className="support-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-modal-title"
          >

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="support-modal-header">

              <div className="support-modal-heading">

                <div className="support-modal-ticket-icon">
                  <i className="bi bi-headset" />
                </div>

                <div>

                  <span>
                    Chamado #{selectedTicket.id}
                  </span>

                  <h2 id="support-modal-title">
                    {selectedTicket.subject}
                  </h2>

                </div>

              </div>

              <button
                type="button"
                className="support-modal-close"
                onClick={closeTicket}
                aria-label="Fechar chamado"
              >
                <i className="bi bi-x-lg" />
              </button>

            </div>

            {/* =================================================
                MODAL CONTENT
            ================================================= */}

            <div className="support-modal-content">

              {/* USER INFO */}

              <aside className="support-ticket-sidebar">

                <div className="support-profile">

                  <div className="support-profile-avatar">
                    {getInitials(
                      selectedTicket.user.name
                    )}
                  </div>

                  <strong>
                    {selectedTicket.user.name}
                  </strong>

                  <span>
                    {selectedTicket.user.email}
                  </span>

                  <small>
                    ID #{selectedTicket.user.id}
                  </small>

                </div>

                <div className="support-ticket-details">

                  <div>
                    <span>Categoria</span>
                    <strong>
                      {selectedTicket.category}
                    </strong>
                  </div>

                  <div>
                    <span>Prioridade</span>

                    <span
                      className={`support-priority ${getPriorityClass(
                        selectedTicket.priority
                      )}`}
                    >
                      <span />
                      {selectedTicket.priority}
                    </span>

                  </div>

                  <div>
                    <span>Status</span>

                    <span
                      className={`support-status ${getStatusClass(
                        selectedTicket.status
                      )}`}
                    >
                      <span />
                      {selectedTicket.status}
                    </span>

                  </div>

                  <div>
                    <span>Enviado</span>
                    <strong>
                      {selectedTicket.date}
                    </strong>
                  </div>

                </div>

                <div className="support-status-actions">

                  <span>
                    Alterar status
                  </span>

                  <button
                    type="button"
                    className={
                      selectedTicket.status ===
                      'Aberto'
                        ? 'active'
                        : ''
                    }
                    onClick={() =>
                      changeTicketStatus(
                        'Aberto'
                      )
                    }
                  >
                    <i className="bi bi-circle" />
                    Aberto
                  </button>

                  <button
                    type="button"
                    className={
                      selectedTicket.status ===
                      'Em atendimento'
                        ? 'active'
                        : ''
                    }
                    onClick={() =>
                      changeTicketStatus(
                        'Em atendimento'
                      )
                    }
                  >
                    <i className="bi bi-chat-dots" />
                    Em atendimento
                  </button>

                  <button
                    type="button"
                    className={
                      selectedTicket.status ===
                      'Resolvido'
                        ? 'active success'
                        : ''
                    }
                    onClick={() =>
                      changeTicketStatus(
                        'Resolvido'
                      )
                    }
                  >
                    <i className="bi bi-check-circle" />
                    Resolvido
                  </button>

                </div>

              </aside>

              {/* =================================================
                  CONVERSATION
              ================================================= */}

              <section className="support-conversation">

                <div className="support-conversation-header">

                  <div>
                    <span className="support-modal-label">
                      Atendimento
                    </span>

                    <h3>
                      Conversa
                    </h3>
                  </div>

                  <span className="support-conversation-count">
                    {selectedTicket.messages.length}{' '}
                    mensagens
                  </span>

                </div>

                <div className="support-messages">

                  {selectedTicket.messages.map(
                    (message) => (

                      <div
                        key={message.id}
                        className={`support-message ${
                          message.author ===
                          'admin'
                            ? 'admin'
                            : 'user'
                        }`}
                      >

                        <div className="support-message-avatar">

                          {message.author ===
                          'admin' ? (
                            <i className="bi bi-shield-check" />
                          ) : (
                            getInitials(
                              message.name
                            )
                          )}

                        </div>

                        <div className="support-message-content">

                          <div className="support-message-meta">

                            <strong>
                              {message.name}
                            </strong>

                            <span>
                              {message.time}
                            </span>

                          </div>

                          <div className="support-message-bubble">
                            {message.message}
                          </div>

                        </div>

                      </div>

                    )
                  )}

                </div>

                {/* =================================================
                    RESPONSE
                ================================================= */}

                <div className="support-response">

                  <div className="support-response-header">

                    <div>

                      <i className="bi bi-reply" />

                      <strong>
                        Responder ao usuário
                      </strong>

                    </div>

                    <span>
                      Sua resposta será enviada ao
                      usuário.
                    </span>

                  </div>

                  <textarea
                    value={response}
                    onChange={(event) =>
                      setResponse(
                        event.target.value
                      )
                    }
                    placeholder="Escreva uma resposta para o usuário..."
                    rows={4}
                    maxLength={1000}
                  />

                  <div className="support-response-footer">

                    <span>
                      {response.length}/1000
                    </span>

                    <button
                      type="button"
                      className="support-send-btn"
                      disabled={
                        !response.trim()
                      }
                      onClick={sendResponse}
                    >
                      <i className="bi bi-send" />
                      Enviar resposta
                    </button>

                  </div>

                </div>

              </section>

            </div>

          </div>

        </div>

      )}

    </>
  );
}