'use client';

import './suporte.css';
import { useMemo, useState, useEffect } from 'react';

// Funções utilitárias
function getStatusClass(status) {
  if (status === 'Aberto') return 'open';
  if (status === 'Em atendimento') return 'warning';
  return 'success';
}

function getPriorityClass(priority) {
  if (priority === 'Alta') return 'high';
  if (priority === 'Média') return 'medium';
  return 'low';
}

function getInitials(name) {
  if (!name) return 'US';
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

export default function SuportePage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [priorityFilter, setPriorityFilter] = useState('Todas');
  
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [response, setResponse] = useState('');
  const [activeTab, setActiveTab] = useState('todos');

  // Conexão exclusiva com a API
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); 

      const res = await fetch(`${API_URL}/suporte`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!res.ok) {
        throw new Error('Falha de rede ou backend inacessível.');
      }

      const data = await res.json();

      if (data.sucesso) {
        const mappedTickets = data.dados.map((dbTicket) => {
          const hasResponse = Boolean(dbTicket.respostaAdmin);
          
          return {
            id: dbTicket.idSuporte,
            user: { 
              name: dbTicket.nome || 'Usuário', 
              email: dbTicket.email || 'Sem e-mail', 
              id: dbTicket.idUsuario 
            },
            subject: dbTicket.titulo,
            category: dbTicket.assunto || 'Geral',
            priority: 'Média', // Estático, pois DB não tem coluna prioridade
            status: hasResponse ? 'Resolvido' : 'Aberto',
            date: dbTicket.criadoEm ? new Date(dbTicket.criadoEm).toLocaleDateString() : 'Recente', 
            message: dbTicket.texto,
            adminResponse: dbTicket.respostaAdmin || null
          };
        });
        
        setTickets(mappedTickets);
      }
    } catch (error) {
      console.error('Erro ao buscar chamados do banco de dados:', error);
      setTickets([]); // Garante que a lista fique limpa e não quebre a interface
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesSearch = !term || [ticket.id.toString(), ticket.subject, ticket.category, ticket.user.name, ticket.user.email].some((value) => value.toLowerCase().includes(term));
      const matchesStatus = statusFilter === 'Todos' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'Todas' || ticket.priority === priorityFilter;
      const matchesTab = activeTab === 'todos' || 
        (activeTab === 'abertos' && ticket.status === 'Aberto') ||
        (activeTab === 'resolvidos' && ticket.status === 'Resolvido');

      return matchesSearch && matchesStatus && matchesPriority && matchesTab;
    });
  }, [tickets, search, statusFilter, priorityFilter, activeTab]);

  const totalTickets = tickets.length;
  const openTickets = tickets.filter((ticket) => ticket.status === 'Aberto').length;
  const resolvedTickets = tickets.filter((ticket) => ticket.status === 'Resolvido').length;

  const openTicket = (ticket) => {
    setSelectedTicket(ticket);
    setResponse('');
  };

  const closeTicket = () => {
    setSelectedTicket(null);
    setResponse('');
  };

  // Envia e vincula 100% com o Backend
  const sendResponse = async () => {
    const message = response.trim();
    if (!message || !selectedTicket) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/suporte/${selectedTicket.id}/responder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ resposta: message })
      });

      if (res.ok) {
        // Apenas atualiza a UI se o banco de dados confirmou a inserção (Sem mudanças temporárias ilusórias)
        const updatedTicket = {
          ...selectedTicket,
          status: 'Resolvido',
          adminResponse: message
        };

        setTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? updatedTicket : t)));
        setSelectedTicket(updatedTicket);
        setResponse('');
      } else {
        const errorData = await res.json();
        alert(`Falha ao registrar resposta: ${errorData.mensagem || 'Erro interno.'}`);
      }
    } catch (error) {
      alert('Erro de comunicação. O backend pode estar offline.');
      console.error(error);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('Todos');
    setPriorityFilter('Todas');
    setActiveTab('todos');
    fetchTickets();
  };

  if (loading) {
    return <div className="support-loading">Carregando chamados...</div>;
  }

  return (
    <>
      <main className="support-page">
        {/* =================================================
            HEADER
        ================================================= */}
        <section className="support-heading">
          <div>
            <span className="support-eyebrow">Atendimento</span>
            <h1>Central de suporte</h1>
            <p>Gerencie reclamações, dúvidas e solicitações enviadas pelos usuários.</p>
          </div>
          <div className="support-heading-actions">
            <button
              type="button"
              className="support-btn support-btn-secondary"
              onClick={resetFilters}
            >
              <i className="bi bi-arrow-clockwise" /> Atualizar
            </button>
          </div>
        </section>

        {/* =================================================
            STATISTICS
        ================================================= */}
        <section className="support-stats">
          <div className="support-stat-card">
            <div className="support-stat-icon blue"><i className="bi bi-headset" /></div>
            <div className="support-stat-content">
              <span>Total de chamados</span>
              <strong>{totalTickets}</strong>
            </div>
          </div>
          <div className="support-stat-card">
            <div className="support-stat-icon red"><i className="bi bi-exclamation-circle" /></div>
            <div className="support-stat-content">
              <span>Abertos</span>
              <strong>{openTickets}</strong>
            </div>
          </div>
          <div className="support-stat-card">
            <div className="support-stat-icon green"><i className="bi bi-check-circle" /></div>
            <div className="support-stat-content">
              <span>Resolvidos</span>
              <strong>{resolvedTickets}</strong>
            </div>
          </div>
        </section>

        {/* =================================================
            MAIN CARD
        ================================================= */}
        <section className="support-card">
          <div className="support-card-header">
            <div>
              <span className="support-card-label">Gerenciamento</span>
              <h2>Chamados de suporte</h2>
            </div>
            <div className="support-header-tools">
              <div className="support-search">
                <i className="bi bi-search" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar chamado..."
                />
                {search && (
                  <button type="button" className="support-search-clear" onClick={() => setSearch('')}>
                    <i className="bi bi-x" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="support-tabs">
            <button type="button" className={activeTab === 'todos' ? 'active' : ''} onClick={() => setActiveTab('todos')}>Todos <span>{totalTickets}</span></button>
            <button type="button" className={activeTab === 'abertos' ? 'active' : ''} onClick={() => setActiveTab('abertos')}>Abertos <span>{openTickets}</span></button>
            <button type="button" className={activeTab === 'resolvidos' ? 'active' : ''} onClick={() => setActiveTab('resolvidos')}>Resolvidos <span>{resolvedTickets}</span></button>
          </div>

          <div className="support-filters">
            <div className="support-filter">
              <label htmlFor="support-status">Status</label>
              <select id="support-status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="Todos">Todos</option>
                <option value="Aberto">Aberto</option>
                <option value="Resolvido">Resolvido</option>
              </select>
            </div>
          </div>

          <div className="table-responsive support-table-wrapper">
            <table className="table support-table align-middle">
              <thead>
                <tr>
                  <th>Chamado</th>
                  <th>Usuário</th>
                  <th>Assunto</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <div className="support-ticket-id">
                          <span>#{ticket.id}</span>
                          <small>{ticket.category}</small>
                        </div>
                      </td>
                      <td>
                        <div className="support-user-cell">
                          <div className="support-user-avatar">{getInitials(ticket.user.name)}</div>
                          <div className="support-user-info">
                            <span>{ticket.user.name}</span>
                            <small>{ticket.user.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="support-subject">
                          <strong>{ticket.subject}</strong>
                          <span className="text-truncate d-inline-block" style={{maxWidth: "200px"}}>
                            {ticket.message}
                          </span>
                        </div>
                      </td>
                      <td><span className={`support-status ${getStatusClass(ticket.status)}`}><span />{ticket.status}</span></td>
                      <td><span className="support-date">{ticket.date}</span></td>
                      <td>
                        <button type="button" className="support-view-btn" onClick={() => openTicket(ticket)}>
                          <i className="bi bi-file-text" /> Analisar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="support-empty">
                      <div className="support-empty-content">
                        <div className="support-empty-icon"><i className="bi bi-inbox" /></div>
                        <strong>Nenhum chamado encontrado</strong>
                        <span>O banco de dados não retornou nenhum registro.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* =====================================================
          TICKET MODAL (Resposta Única)
      ===================================================== */}
      {selectedTicket && (
        <div className="support-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeTicket(); }}>
          <div className="support-modal">
            <div className="support-modal-header">
              <div className="support-modal-heading">
                <div className="support-modal-ticket-icon"><i className="bi bi-headset" /></div>
                <div>
                  <span>Chamado #{selectedTicket.id}</span>
                  <h2>{selectedTicket.subject}</h2>
                </div>
              </div>
              <button type="button" className="support-modal-close" onClick={closeTicket}><i className="bi bi-x-lg" /></button>
            </div>

            <div className="support-modal-content">
              <aside className="support-ticket-sidebar">
                <div className="support-profile">
                  <div className="support-profile-avatar">{getInitials(selectedTicket.user.name)}</div>
                  <strong>{selectedTicket.user.name}</strong>
                  <span>{selectedTicket.user.email}</span>
                </div>
                <div className="support-ticket-details">
                  <div><span>Categoria</span><strong>{selectedTicket.category}</strong></div>
                  <div><span>Data de Abertura</span><strong>{selectedTicket.date}</strong></div>
                  <div><span>Status Atual</span><span className={`support-status ${getStatusClass(selectedTicket.status)}`}><span />{selectedTicket.status}</span></div>
                </div>
              </aside>

              <section className="support-conversation">
                <div className="support-messages">
                  
                  {/* Mensagem de Origem do Usuário */}
                  <div className="support-message user">
                    <div className="support-message-avatar">{getInitials(selectedTicket.user.name)}</div>
                    <div className="support-message-content">
                      <div className="support-message-meta"><strong>{selectedTicket.user.name}</strong><span>Recebido</span></div>
                      <div className="support-message-bubble">{selectedTicket.message}</div>
                    </div>
                  </div>

                  {/* Resposta do Administrador (Caso o banco já possua) */}
                  {selectedTicket.adminResponse && (
                    <div className="support-message admin">
                      <div className="support-message-avatar"><i className="bi bi-shield-check" /></div>
                      <div className="support-message-content">
                        <div className="support-message-meta"><strong>Resposta Administrativa</strong><span>Resolvido</span></div>
                        <div className="support-message-bubble">{selectedTicket.adminResponse}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Exibe o formulário de reposta APENAS se ainda não estiver respondido */}
                {!selectedTicket.adminResponse && (
                  <div className="support-response">
                    <textarea 
                      value={response} 
                      onChange={(event) => setResponse(event.target.value)} 
                      placeholder="Escreva a resposta final para o usuário..." 
                      rows={5} 
                      maxLength={1000} 
                    />
                    <div className="support-response-footer">
                      <span>{response.length}/1000</span>
                      <button type="button" className="support-send-btn" disabled={!response.trim()} onClick={sendResponse}>
                        <i className="bi bi-check2-all" /> Concluir Chamado
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}