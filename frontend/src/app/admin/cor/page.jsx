'use client';

import '../tables.css';

import { useMemo, useState } from 'react';

const initialColors = [
  {
    id: 1,
    name: 'Azul',
    hex: '#2563EB',
    description: 'Azul padrão',
    status: 'Ativo',
  },
  {
    id: 2,
    name: 'Vermelho',
    hex: '#DC2626',
    description: 'Vermelho padrão',
    status: 'Ativo',
  },
  {
    id: 3,
    name: 'Verde',
    hex: '#16A34A',
    description: 'Verde padrão',
    status: 'Ativo',
  },
  {
    id: 4,
    name: 'Amarelo',
    hex: '#EAB308',
    description: 'Amarelo padrão',
    status: 'Ativo',
  },
  {
    id: 5,
    name: 'Preto',
    hex: '#171717',
    description: 'Preto padrão',
    status: 'Ativo',
  },
  {
    id: 6,
    name: 'Branco',
    hex: '#FFFFFF',
    description: 'Branco padrão',
    status: 'Inativo',
  },
];

const emptyForm = {
  name: '',
  hex: '#2563EB',
  description: '',
  status: 'Ativo',
};

function getStatusClass(status) {
  return status === 'Ativo' ? 'success' : 'danger';
}

export default function CoresPage() {
  const [colors, setColors] = useState(initialColors);

  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [modal, setModal] = useState(null);

  const [selectedColor, setSelectedColor] =
    useState(null);

  const [form, setForm] = useState(emptyForm);

  const colorsPerPage = 5;

  /*
   * =====================================================
   * FILTRO
   * =====================================================
   */

  const filteredColors = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return colors;
    }

    return colors.filter((color) =>
      [
        color.name,
        color.hex,
        color.description,
        color.status,
      ].some((value) =>
        value
          .toLowerCase()
          .includes(term)
      )
    );
  }, [colors, search]);

  /*
   * =====================================================
   * PAGINAÇÃO
   * =====================================================
   */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredColors.length / colorsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) *
    colorsPerPage;

  const currentColors =
    filteredColors.slice(
      startIndex,
      startIndex + colorsPerPage
    );

  /*
   * =====================================================
   * MODAIS
   * =====================================================
   */

  const closeModal = () => {
    setModal(null);
    setSelectedColor(null);
    setForm(emptyForm);
  };

  const openCreateModal = () => {
    setSelectedColor(null);
    setForm(emptyForm);
    setModal('create');
  };

  const openEditModal = (color) => {
    setSelectedColor(color);

    setForm({
      name: color.name,
      hex: color.hex,
      description: color.description,
      status: color.status,
    });

    setModal('edit');
  };

  const openDeleteModal = (color) => {
    setSelectedColor(color);
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

  const handleColorChange = (event) => {
    const { value } = event.target;

    setForm((previous) => ({
      ...previous,
      hex: value.toUpperCase(),
    }));
  };

  /*
   * =====================================================
   * CRIAR / EDITAR
   * =====================================================
   */

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = form.name.trim();

    const description =
      form.description.trim();

    const hex =
      form.hex.trim().toUpperCase();

    if (!name) {
      return;
    }

    /*
     * CREATE
     */

    if (modal === 'create') {
      const newColor = {
        id:
          Math.max(
            ...colors.map(
              (color) => color.id
            ),
            0
          ) + 1,

        name,

        hex,

        description,

        status: form.status,
      };

      setColors((previous) => [
        ...previous,
        newColor,
      ]);

      setCurrentPage(1);
    }

    /*
     * EDIT
     */

    if (
      modal === 'edit' &&
      selectedColor
    ) {
      setColors((previous) =>
        previous.map((color) =>
          color.id === selectedColor.id
            ? {
                ...color,
                name,
                hex,
                description,
                status:
                  form.status,
              }
            : color
        )
      );
    }

    closeModal();
  };

  /*
   * =====================================================
   * EXCLUIR
   * =====================================================
   */

  const handleDelete = () => {
    if (!selectedColor) {
      return;
    }

    setColors((previous) =>
      previous.filter(
        (color) =>
          color.id !==
          selectedColor.id
      )
    );

    closeModal();
  };

  /*
   * =====================================================
   * BUSCA
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
              Catálogo
            </span>

            <h1>
              Cores
            </h1>

            <p>
              Gerencie as cores disponíveis no catálogo.
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
              Nova cor
            </button>

          </div>

        </section>

        {/* =================================================
            TABLE CARD
        ================================================= */}

        <section className="users-card">

          <div className="users-card-header">

            <div>

              <span className="users-card-label">
                Gerenciamento
              </span>

              <h2>
                Cores cadastradas
              </h2>

            </div>

            <div className="users-card-header-right">

              <div className="users-search">

                <i className="bi bi-search" />

                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Buscar cor..."
                  aria-label="Buscar cor"
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
                  <th>Cor</th>
                  <th>HEX</th>
                  <th>Descrição</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>

              </thead>

              <tbody>

                {currentColors.length > 0 ? (

                  currentColors.map((color) => (

                    <tr key={color.id}>

                      {/* COLOR */}

                      <td>

                        <div className="user-cell">

                          <div
                            className="color-preview"
                            style={{
                              backgroundColor:
                                color.hex,
                            }}
                            title={color.hex}
                          />

                          <div className="user-information">

                            <span className="user-name">
                              {color.name}
                            </span>

                            <span className="user-id">
                              ID #{color.id}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* HEX */}

                      <td>

                        <span className="color-hex">
                          {color.hex}
                        </span>

                      </td>

                      {/* DESCRIPTION */}

                      <td>

                        <span className="table-muted">
                          {color.description ||
                            'Sem descrição'}
                        </span>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`user-status ${getStatusClass(
                            color.status
                          )}`}
                        >

                          <span />

                          {color.status}

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
                                color
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
                                color
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
                      colSpan="5"
                      className="users-empty"
                    >

                      <div className="users-empty-content">

                        <div className="users-empty-icon">
                          <i className="bi bi-palette" />
                        </div>

                        <strong>
                          Nenhuma cor encontrada
                        </strong>

                        <span>
                          Tente buscar por outra cor.
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

          <div className="users-table-footer">

            <span>
              Mostrando{' '}
              <strong>
                {currentColors.length}
              </strong>{' '}
              de{' '}
              <strong>
                {filteredColors.length}
              </strong>{' '}
              cores
            </span>

            <nav aria-label="Paginação de cores">

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
                        setCurrentPage(page)
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
            aria-labelledby="color-modal-title"
          >

            <div className="users-modal-header">

              <div>

                <span className="users-modal-label">
                  {modal === 'create'
                    ? 'Nova cor'
                    : 'Gerenciamento'}
                </span>

                <h2 id="color-modal-title">
                  {modal === 'create'
                    ? 'Criar cor'
                    : 'Editar cor'}
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

            <form onSubmit={handleSubmit}>

              <div className="users-modal-body">

                <div className="order-modal-icon">
                  <i className="bi bi-palette" />
                </div>

                <div className="user-form-grid">

                  {/* NAME */}

                  <div className="user-form-field">

                    <label htmlFor="color-name">
                      Nome
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-palette" />

                      <input
                        id="color-name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={
                          handleFormChange
                        }
                        placeholder="Ex.: Azul"
                        maxLength={50}
                        required
                      />

                    </div>

                  </div>

                  {/* HEX */}

                  <div className="user-form-field">

                    <label htmlFor="color-hex">
                      Código HEX
                    </label>

                    <div className="color-input-wrapper">

                      <input
                        id="color-hex"
                        name="hex"
                        type="color"
                        value={
                          /^#[0-9A-Fa-f]{6}$/.test(
                            form.hex
                          )
                            ? form.hex
                            : '#2563EB'
                        }
                        onChange={
                          handleColorChange
                        }
                        aria-label="Selecionar cor"
                      />

                      <input
                        type="text"
                        value={form.hex}
                        onChange={(event) => {
                          let value =
                            event.target.value
                              .toUpperCase();

                          if (
                            value &&
                            !value.startsWith(
                              '#'
                            )
                          ) {
                            value = `#${value}`;
                          }

                          setForm(
                            (previous) => ({
                              ...previous,
                              hex: value,
                            })
                          );
                        }}
                        placeholder="#2563EB"
                        maxLength={7}
                        pattern="^#[0-9A-Fa-f]{6}$"
                        required
                      />

                    </div>

                  </div>

                  {/* STATUS */}

                  <div className="user-form-field">

                    <label htmlFor="color-status">
                      Status
                    </label>

                    <div className="user-input-wrapper">

                      <i className="bi bi-circle-half" />

                      <select
                        id="color-status"
                        name="status"
                        value={form.status}
                        onChange={
                          handleFormChange
                        }
                      >

                        <option value="Ativo">
                          Ativo
                        </option>

                        <option value="Inativo">
                          Inativo
                        </option>

                      </select>

                    </div>

                  </div>

                  {/* DESCRIPTION */}

                  <div className="user-form-field full">

                    <label htmlFor="color-description">
                      Descrição
                    </label>

                    <div className="user-input-wrapper textarea-wrapper">

                      <i className="bi bi-card-text" />

                      <textarea
                        id="color-description"
                        name="description"
                        value={
                          form.description
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Descreva esta cor..."
                        rows={4}
                        maxLength={255}
                      />

                    </div>

                  </div>

                </div>

              </div>

              <div className="users-modal-footer">

                <button
                  type="button"
                  className="users-modal-btn secondary"
                  onClick={closeModal}
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
                    ? 'Criar cor'
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
        selectedColor && (

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
              aria-labelledby="delete-color-title"
            >

              <div className="users-delete-content">

                <div className="users-delete-icon">
                  <i className="bi bi-trash3" />
                </div>

                <span className="users-modal-label">
                  Atenção
                </span>

                <h2 id="delete-color-title">
                  Excluir cor?
                </h2>

                <p>
                  Você está prestes a excluir a
                  cor{' '}
                  <strong>
                    {selectedColor.name}
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
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="users-modal-btn danger"
                  onClick={handleDelete}
                >
                  <i className="bi bi-trash" />
                  Excluir cor
                </button>

              </div>

            </div>

          </div>

        )}

    </>
  );
}