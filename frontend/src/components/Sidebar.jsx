'use client';

import './Siderbar.css';
import { useState } from 'react';

const navigation = [
  {
    label: 'Principal',
    items: [
      {
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: 'bi-grid-1x2-fill',
        active: true,
      },
    ],
  },

  {
    label: 'Gerenciamento',
    items: [
      {
        label: 'Pedidos',
        href: '/admin/pedidos',
        icon: 'bi-bag',
      },

      {
        label: 'Produtos',
        icon: 'bi-box-seam',

        dropdown: [
          {
            label: 'Produtos',
            href: '/admin/produtos',
          },
          {
            label: 'Tamanho',
            href: '/admin/tamanho',
          },
          {
            label: 'Cor',
            href: '/admin/cor',
          },
          {
            label: 'Modelo',
            href: '/admin/modelo',
          },
          {
            label: 'Categoria',
            href: '/admin/categoria',
          },
          {
            label: 'Subcategoria',
            href: '/admin/subcategoria',
          },
        ],
      },

      {
        label: 'Usuários',
        href: '/admin/usuarios',
        icon: 'bi-people',
      },
    ],
  },
];

export default function Sidebar() {
  const [productsOpen, setProductsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <aside className="sidebar">

      <div className="sidebar-inner">

        {/* =====================================================
            BRAND
        ===================================================== */}

        <div className="sidebar-brand">

          <a
            href="/admin/dashboard"
            className="sidebar-brand-link"
          >

            <span className="sidebar-brand-mark">
              img
            </span>

            <span className="sidebar-brand-name">
              EVE<span>RETT</span>
            </span>

          </a>

        </div>

        {/* =====================================================
            NAVIGATION
        ===================================================== */}

        <nav
          className="sidebar-navigation"
          aria-label="Navegação principal"
        >

          {navigation.map((section) => (

            <div
              className="sidebar-section"
              key={section.label}
            >

              <span className="sidebar-section-title">
                {section.label}
              </span>

              <ul className="sidebar-menu">

                {section.items.map((item) => (

                  <li
                    className="sidebar-menu-item"
                    key={item.label}
                  >

                    {/* =================================================
                        ITEM COM DROPDOWN
                    ================================================= */}

                    {item.dropdown ? (

                      <>

                        <button
                          type="button"
                          className={`sidebar-link sidebar-dropdown-trigger ${
                            productsOpen ? 'open' : ''
                          }`}
                          onClick={() =>
                            setProductsOpen(
                              (current) => !current
                            )
                          }
                          aria-expanded={productsOpen}
                          aria-controls="products-submenu"
                        >

                          <span className="sidebar-link-icon">

                            <i
                              className={`bi ${item.icon}`}
                              aria-hidden="true"
                            />

                          </span>

                          <span className="sidebar-link-label">
                            {item.label}
                          </span>

                          <span
                            className={`sidebar-dropdown-arrow ${
                              productsOpen ? 'open' : ''
                            }`}
                            aria-hidden="true"
                          >

                            <i className="bi bi-chevron-down" />

                          </span>

                        </button>

                        {/* =================================================
                            PRODUCTS SUBMENU
                        ================================================= */}

                        <div
                          id="products-submenu"
                          className={`sidebar-submenu ${
                            productsOpen ? 'open' : ''
                          }`}
                        >

                          <ul>

                            {item.dropdown.map(
                              (subItem, index) => (

                                <li
                                  key={subItem.label}
                                  className={
                                    index === 0
                                      ? 'sidebar-submenu-main-item'
                                      : ''
                                  }
                                >

                                  <a
                                    href={subItem.href}
                                    className="sidebar-submenu-link"
                                  >

                                    <span className="sidebar-submenu-dot" />

                                    <span>
                                      {subItem.label}
                                    </span>

                                  </a>

                                </li>

                              )
                            )}

                          </ul>

                        </div>

                      </>

                    ) : (

                      /* =================================================
                          ITEM NORMAL
                      ================================================= */

                      <a
                        href={item.href}
                        className={`sidebar-link ${
                          item.active ? 'active' : ''
                        }`}
                        aria-current={
                          item.active
                            ? 'page'
                            : undefined
                        }
                      >

                        <span className="sidebar-link-icon">

                          <i
                            className={`bi ${item.icon}`}
                            aria-hidden="true"
                          />

                        </span>

                        <span className="sidebar-link-label">
                          {item.label}
                        </span>

                        {item.active && (

                          <span
                            className="sidebar-active-indicator"
                            aria-hidden="true"
                          />

                        )}

                      </a>

                    )}

                  </li>

                ))}

              </ul>

            </div>

          ))}

        </nav>

        {/* =====================================================
            BOTTOM
        ===================================================== */}

        <div className="sidebar-bottom">

          <div className="sidebar-bottom-menu">

            {/* =================================================
                NOTIFICAÇÕES
            ================================================= */}

            <a
              href="/admin/notificacoes"
              className="sidebar-link"
            >

              <span className="sidebar-link-icon">

                <i
                  className="bi bi-bell"
                  aria-hidden="true"
                />

              </span>

              <span className="sidebar-link-label">
                Notificações
              </span>

            </a>

            {/* =================================================
                CONFIGURAÇÕES
            ================================================= */}

            <a
              href="/admin/configuracoes"
              className="sidebar-link"
            >

              <span className="sidebar-link-icon">

                <i
                  className="bi bi-gear"
                  aria-hidden="true"
                />

              </span>

              <span className="sidebar-link-label">
                Configurações
              </span>

            </a>

            {/* =================================================
                CENTRAL DE AJUDA
            ================================================= */}

            <a
              href="/admin/ajuda"
              className="sidebar-link"
            >

              <span className="sidebar-link-icon">

                <i
                  className="bi bi-question-circle"
                  aria-hidden="true"
                />

              </span>

              <span className="sidebar-link-label">
                Central de ajuda
              </span>

            </a>

          </div>

          {/* =====================================================
              USER
          ===================================================== */}

          <div className="sidebar-user">

            {/* =================================================
                AVATAR
            ================================================= */}

            <div
              className="sidebar-user-avatar"
              aria-hidden="true"
            >
              AM
            </div>

            {/* =================================================
                INFORMAÇÕES
            ================================================= */}

            <div className="sidebar-user-info">

              <strong>
                AIMBOT
              </strong>

              <span>
                Administrador
              </span>

            </div>

            {/* =================================================
                USER MENU
            ================================================= */}

            <div className="sidebar-user-menu">

              <button
                type="button"
                className={`sidebar-user-action ${
                  userMenuOpen ? 'open' : ''
                }`}
                aria-label="Abrir menu do usuário"
                aria-expanded={userMenuOpen}
                onClick={() =>
                  setUserMenuOpen(
                    (current) => !current
                  )
                }
              >

                <i
                  className="bi bi-three-dots"
                  aria-hidden="true"
                />

              </button>

              {/* =================================================
                  USER DROPDOWN
              ================================================= */}

              <div
                className={`sidebar-user-dropdown ${
                  userMenuOpen ? 'open' : ''
                }`}
              >

                <button
                  type="button"
                  className="sidebar-user-dropdown-item logout"
                >

                  <i
                    className="bi bi-box-arrow-right"
                    aria-hidden="true"
                  />

                  <span>
                    Sair
                  </span>

                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </aside>
  );
}