'use client';

import '../tables.css';
import { useEffect, useMemo, useState } from 'react';

// Configure a URL base da sua API aqui
const API_BASE_URL = 'http://localhost:3001/api/tamanhos'; 

const emptyForm = {
  name: '',
  description: '',
  status: 'Ativo',
};

function getStatusClass(status) {
  return status === 'Ativo' ? 'success' : 'danger';
}

export default function TamanhosPage() {
  const [sizes, setSizes] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [modal, setModal] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(false);

  const sizesPerPage = 5;

  /*
   * =====================================================
   * BUSCA DE DADOS (GET)
   * =====================================================
   */
  const fetchTamanhos = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}?pagina=${page}&limite=${sizesPerPage}`);
      const data = await response.json();

      if (data.sucesso) {
        // Mapeando as propriedades do banco (idTamanho, codigoTamanho) para o formato do Frontend
        const mappedSizes = data.dados.map((sz) => ({
          id: sz.idTamanho,
          name: sz.codigoTamanho,
          description: sz.descricao || '', // Fallback caso não exista na DB
          status: sz.status || 'Ativo',   // Fallback caso não exista na DB
        }));

        setSizes(mappedSizes);
        setTotalPages(data.paginacao.totalPaginas);
        setTotalItems(data.paginacao.total);
      }
    } catch (error) {
      console.error('Erro ao buscar tamanhos:', error);
      alert('Erro ao carregar os dados. Verifique a conexão com a API.');
    } finally {
      setIsLoading(false);
    }
  };

  // Dispara a busca sempre que a página atual mudar
  useEffect(() => {
    fetchTamanhos(currentPage);
  }, [currentPage]);

  /*
   * =====================================================
   * FILTRO LOCAL (Para a página atual)
   * =====================================================
   */
  const filteredSizes = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sizes;

    return sizes.filter((size) =>
      [size.name, size.description, size.status].some((value) =>
        value.toLowerCase().includes(term)
      )
    );
  }, [sizes, search]);

  /*
   * =====================================================
   * MODAIS E FORMULÁRIO
   * =====================================================
   */
  const closeModal = () => {
    setModal(null);
    setSelectedSize(null);
    setForm(emptyForm);
  };

  const openCreateModal = () => {
    setSelectedSize(null);
    setForm(emptyForm);
    setModal('create');
  };

  const openEditModal = (size) => {
    setSelectedSize(size);
    setForm({
      name: size.name,
      description: size.description,
      status: size.status,
    });
    setModal('edit');
  };

  const openDeleteModal = (size) => {
    setSelectedSize(size);
    setModal('delete');
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  /*
   * =====================================================
   * CRIAR (POST) / EDITAR (PUT)
   * =====================================================
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    const name = form.name.trim();

    if (!name) return;

    // Recuperando token de autenticação (caso use JWT localmente)
    const token = localStorage.getItem('token') || ''; 
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    };

    // Objeto enviado ao backend (O Controller espera codigoTamanho)
    const payload = { codigoTamanho: name };

    try {
      if (modal === 'create') {
        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        
        const data = await response.json();
        if (data.sucesso) {
          fetchTamanhos(1); // Volta para a primeira página após criar
          setCurrentPage(1);
        } else {
          alert(data.mensagem || 'Erro ao criar tamanho');
        }
      } 
      
      if (modal === 'edit' && selectedSize) {
        const response = await fetch(`${API_BASE_URL}/${selectedSize.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (data.sucesso) {
          fetchTamanhos(currentPage); // Atualiza a lista atual
        } else {
          alert(data.mensagem || 'Erro ao atualizar tamanho');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Falha na comunicação com o servidor.');
    }

    closeModal();
  };

  /*
   * =====================================================
   * EXCLUIR (DELETE)
   * =====================================================
   */
  const handleDelete = async () => {
    if (!selectedSize) return;

    const token = localStorage.getItem('token') || '';
    
    try {
      const response = await fetch(`${API_BASE_URL}/${selectedSize.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.sucesso) {
        // Se a página ficar vazia e não for a primeira, volta uma página
        if (sizes.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchTamanhos(currentPage);
        }
      } else {
        alert(data.mensagem || 'Erro ao excluir tamanho');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Falha na comunicação com o servidor.');
    }

    closeModal();
  };

  /*
   * =====================================================
   * BUSCA FRONTEND (Apenas visual)
   * =====================================================
   */
  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  return (
    <>
      <main className="users-page">
        <section className="users-heading">
          <div>
            <span className="users-eyebrow">Catálogo</span>
            <h1>Tamanhos</h1>
            <p>Gerencie os tamanhos disponíveis no catálogo.</p>
          </div>
          <div className="users-heading-actions">
            <button
              type="button"
              className="users-btn users-btn-secondary"
              onClick={() => {
                setSearch('');
                fetchTamanhos(currentPage);
              }}
              disabled={isLoading}
            >
              <i className="bi bi-arrow-clockwise" />
              {isLoading ? 'Atualizando...' : 'Atualizar'}
            </button>
            <button type="button" className="users-btn users-btn-primary" onClick={openCreateModal}>
              <i className="bi bi-plus-lg" /> Novo tamanho
            </button>
          </div>
        </section>

        <section className="users-card">
          <div className="users-card-header">
            <div>
              <span className="users-card-label">Gerenciamento</span>
              <h2>Tamanhos cadastrados</h2>
            </div>
            <div className="users-card-header-right">
              <div className="users-search">
                <i className="bi bi-search" />
                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Buscar na página atual..."
                  aria-label="Buscar tamanho"
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
            <table className="table users-table align-middle">
              <thead>
                <tr>
                  <th>Tamanho</th>
                  <th>Descrição</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSizes.length > 0 ? (
                  filteredSizes.map((size) => (
                    <tr key={size.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {size.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="user-information">
                            <span className="user-name">{size.name}</span>
                            <span className="user-id">ID #{size.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="table-muted">
                          {size.description || 'Sem descrição'}
                        </span>
                      </td>
                      <td>
                        <span className={`user-status ${getStatusClass(size.status)}`}>
                          <span />
                          {size.status}
                        </span>
                      </td>
                      <td>
                        <div className="user-actions">
                          <button type="button" className="user-action edit" onClick={() => openEditModal(size)}>
                            <i className="bi bi-pencil" /> Editar
                          </button>
                          <button type="button" className="user-action delete" onClick={() => openDeleteModal(size)}>
                            <i className="bi bi-trash" /> Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="users-empty">
                      <div className="users-empty-content">
                        <div className="users-empty-icon">
                          <i className="bi bi-rulers" />
                        </div>
                        <strong>Nenhum tamanho encontrado</strong>
                        <span>{isLoading ? 'Carregando dados...' : 'Tente buscar por outro tamanho.'}</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="users-table-footer">
            <span>
              Mostrando <strong>{filteredSizes.length}</strong> itens nesta página (Total: <strong>{totalItems}</strong>)
            </span>
            <nav aria-label="Paginação de tamanhos">
              <ul className="pagination users-pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <i className="bi bi-chevron-left" />
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                    <button type="button" className="page-link" onClick={() => setCurrentPage(page)}>
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <i className="bi bi-chevron-right" />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </section>
      </main>

      {/* MODAL: CRIAR / EDITAR */}
      {(modal === 'create' || modal === 'edit') && (
        <div
          className="users-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="users-modal" role="dialog" aria-modal="true" aria-labelledby="size-modal-title">
            <div className="users-modal-header">
              <div>
                <span className="users-modal-label">
                  {modal === 'create' ? 'Novo tamanho' : 'Gerenciamento'}
                </span>
                <h2 id="size-modal-title">
                  {modal === 'create' ? 'Criar tamanho' : 'Editar tamanho'}
                </h2>
              </div>
              <button type="button" className="users-modal-close" onClick={closeModal} aria-label="Fechar modal">
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="users-modal-body">
                <div className="order-modal-icon">
                  <i className="bi bi-rulers" />
                </div>
                <div className="user-form-grid">
                  <div className="user-form-field">
                    <label htmlFor="size-name">Tamanho</label>
                    <div className="user-input-wrapper">
                      <i className="bi bi-rulers" />
                      <input
                        id="size-name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleFormChange}
                        placeholder="Ex.: M"
                        maxLength={20}
                        required
                      />
                    </div>
                  </div>
                  <div className="user-form-field">
                    <label htmlFor="size-status">Status (Visual)</label>
                    <div className="user-input-wrapper">
                      <i className="bi bi-circle-half" />
                      <select id="size-status" name="status" value={form.status} onChange={handleFormChange}>
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                      </select>
                    </div>
                  </div>
                  <div className="user-form-field full">
                    <label htmlFor="size-description">Descrição (Visual)</label>
                    <div className="user-input-wrapper textarea-wrapper">
                      <i className="bi bi-card-text" />
                      <textarea
                        id="size-description"
                        name="description"
                        value={form.description}
                        onChange={handleFormChange}
                        placeholder="Descreva este tamanho..."
                        rows={4}
                        maxLength={255}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="users-modal-footer">
                <button type="button" className="users-modal-btn secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="users-modal-btn primary">
                  <i className={modal === 'create' ? 'bi bi-plus-lg' : 'bi bi-check-lg'} />
                  {modal === 'create' ? 'Criar tamanho' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXCLUIR */}
      {modal === 'delete' && selectedSize && (
        <div
          className="users-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="users-modal users-delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-size-title">
            <div className="users-delete-content">
              <div className="users-delete-icon">
                <i className="bi bi-trash3" />
              </div>
              <span className="users-modal-label">Atenção</span>
              <h2 id="delete-size-title">Excluir tamanho?</h2>
              <p>
                Você está prestes a excluir o tamanho <strong>{selectedSize.name}</strong>. Essa ação não poderá ser desfeita.
              </p>
            </div>
            <div className="users-modal-footer">
              <button type="button" className="users-modal-btn secondary" onClick={closeModal}>
                Cancelar
              </button>
              <button type="button" className="users-modal-btn danger" onClick={handleDelete}>
                <i className="bi bi-trash" /> Excluir tamanho
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}