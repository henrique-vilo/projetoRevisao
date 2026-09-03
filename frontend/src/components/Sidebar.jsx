'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import './Siderbar.css';

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
)
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');

const TOKEN_KEY = 'token';
const USER_KEY = 'usuario';
const THEME_KEY = 'tema';

function aplicarTema(isDark) {
  if (typeof document === 'undefined') return;

  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.setAttribute(
    'data-bs-theme',
    isDark ? 'dark' : 'light'
  );
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
}

function lerUsuarioSalvo() {
  if (typeof window === 'undefined') return { token: null, usuario: null };
  const token = localStorage.getItem(TOKEN_KEY);
  const usuarioSalvo = localStorage.getItem(USER_KEY);

  if (!token || !usuarioSalvo) {
    return { token, usuario: null };
  }

  try {
    return { token, usuario: JSON.parse(usuarioSalvo) };
  } catch {
    localStorage.removeItem(USER_KEY);
    return { token, usuario: null };
  }
}

function obterIniciais(nome) {
  if (!nome) return 'U';
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

const navigation = [
  {
    label: 'Principal',
    items: [
      {
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: 'bi-grid-1x2-fill',
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
          { label: 'Produtos', href: '/admin/produtos' },
          { label: 'Tamanho', href: '/admin/tamanho' },
          { label: 'Cor', href: '/admin/cor' },
          { label: 'Modelo', href: '/admin/modelo' },
          { label: 'Categoria', href: '/admin/categoria' },
          { label: 'Subcategoria', href: '/admin/subcategoria' },
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
  const pathname = usePathname();
  const userMenuRef = useRef(null);

  const isProductRouteActive = navigation[1].items[1].dropdown.some(
    (sub) => pathname === sub.href
  );

  const [productsOpen, setProductsOpen] = useState(isProductRouteActive);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [modoEscuro, setModoEscuro] = useState(false);

  useEffect(() => {
    const temaSalvo = localStorage.getItem(THEME_KEY);
    const prefereEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const deveSerEscuro = temaSalvo === 'dark' || (!temaSalvo && prefereEscuro);

    setModoEscuro(deveSerEscuro);
    aplicarTema(deveSerEscuro);
  }, []);

  // Auto expande o submenu de produtos se estiver em uma rota filha
  useEffect(() => {
    if (isProductRouteActive) {
      setProductsOpen(true);
    }
  }, [pathname, isProductRouteActive]);

  // Fecha o dropdown do usuário ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let ativo = true;
    let abortController = null;

    async function sincronizarUsuario() {
      abortController?.abort();
      abortController = new AbortController();
      const sessao = lerUsuarioSalvo();

      if (!sessao.token) {
        if (ativo) setUsuario(null);
        return;
      }

      if (ativo) setUsuario(sessao.usuario);

      try {
        const response = await fetch(`${API_ORIGIN}/api/auth/perfil`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${sessao.token}`,
          },
          signal: abortController.signal,
          cache: 'no-store',
        });
        const resultado = await response.json().catch(() => ({}));

        if (!response.ok || !resultado.sucesso) {
          if ([401, 403, 404].includes(response.status)) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            if (ativo) setUsuario(null);
          }
          return;
        }

        if (ativo) {
          setUsuario(resultado.dados);
          localStorage.setItem(USER_KEY, JSON.stringify(resultado.dados));
        }
      } catch (error) {
        if (error.name !== 'AbortError' && ativo && !sessao.usuario) {
          setUsuario(null);
        }
      }
    }

    sincronizarUsuario();
    window.addEventListener('auth-changed', sincronizarUsuario);
    window.addEventListener('storage', sincronizarUsuario);

    return () => {
      ativo = false;
      abortController?.abort();
      window.removeEventListener('auth-changed', sincronizarUsuario);
      window.removeEventListener('storage', sincronizarUsuario);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event('auth-changed'));
    window.location.href = '/login';
  }

  function alternarTema() {
    setModoEscuro((modoAtual) => {
      const novoModo = !modoAtual;
      aplicarTema(novoModo);
      return novoModo;
    });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        {/* BRAND */}
        <div className="sidebar-brand">
          <Link href="/admin/dashboard" className="sidebar-brand-link">
            <div className="sidebar-brand-logo-wrapper">
              <img
                src="/favicon.ico"
                alt="Everett Logo"
                className="sidebar-brand-logo"
              />
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">
                EVE<span>RETT</span>
              </span>
              <span className="sidebar-brand-tag">ADMIN</span>
            </div>
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav className="sidebar-navigation" aria-label="Navegação principal">
          {navigation.map((section) => (
            <div className="sidebar-section" key={section.label}>
              <span className="sidebar-section-title">{section.label}</span>

              <ul className="sidebar-menu">
                {section.items.map((item) => {
                  if (item.dropdown) {
                    const isDropdownActive = item.dropdown.some(
                      (sub) => pathname === sub.href
                    );

                    return (
                      <li className="sidebar-menu-item" key={item.label}>
                        <button
                          type="button"
                          className={`sidebar-link sidebar-dropdown-trigger ${
                            productsOpen || isDropdownActive ? 'open' : ''
                          }`}
                          onClick={() => setProductsOpen((current) => !current)}
                          aria-expanded={productsOpen}
                          aria-controls="products-submenu"
                        >
                          <span className="sidebar-link-icon">
                            <i className={`bi ${item.icon}`} aria-hidden="true" />
                          </span>
                          <span className="sidebar-link-label">{item.label}</span>
                          <span
                            className={`sidebar-dropdown-arrow ${
                              productsOpen ? 'open' : ''
                            }`}
                            aria-hidden="true"
                          >
                            <i className="bi bi-chevron-down" />
                          </span>
                        </button>

                        <div
                          id="products-submenu"
                          className={`sidebar-submenu ${productsOpen ? 'open' : ''}`}
                        >
                          <ul>
                            {item.dropdown.map((subItem) => {
                              const isSubActive = pathname === subItem.href;
                              return (
                                <li key={subItem.label}>
                                  <Link
                                    href={subItem.href}
                                    className={`sidebar-submenu-link ${
                                      isSubActive ? 'active' : ''
                                    }`}
                                  >
                                    <span className="sidebar-submenu-dot" />
                                    <span>{subItem.label}</span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </li>
                    );
                  }

                  const isActive = pathname === item.href;

                  return (
                    <li className="sidebar-menu-item" key={item.label}>
                      <Link
                        href={item.href}
                        className={`sidebar-link ${isActive ? 'active' : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span className="sidebar-link-icon">
                          <i className={`bi ${item.icon}`} aria-hidden="true" />
                        </span>
                        <span className="sidebar-link-label">{item.label}</span>
                        {isActive && (
                          <span
                            className="sidebar-active-indicator"
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* BOTTOM */}
        <div className="sidebar-bottom">
          <div className="sidebar-bottom-menu">
            <button
              type="button"
              className="sidebar-link sidebar-theme-toggle"
              onClick={alternarTema}
              aria-label={modoEscuro ? 'Ativar modo claro' : 'Ativar modo escuro'}
              title={modoEscuro ? 'Modo claro' : 'Modo escuro'}
            >
              <span className="sidebar-link-icon">
                <i
                  className={`bi ${modoEscuro ? 'bi-sun-fill' : 'bi-moon-fill'}`}
                  aria-hidden="true"
                />
              </span>
              <span className="sidebar-link-label">
                {modoEscuro ? 'Tema claro' : 'Tema escuro'}
              </span>
            </button>

            <Link
              href="/admin/ajuda"
              className={`sidebar-link ${
                pathname === '/admin/ajuda' ? 'active' : ''
              }`}
            >
              <span className="sidebar-link-icon">
                <i className="bi bi-question-circle" aria-hidden="true" />
              </span>
              <span className="sidebar-link-label">Central de ajuda</span>
            </Link>
          </div>

          {/* USER */}
          <div className="sidebar-user" ref={userMenuRef}>
            <div className="sidebar-user-avatar" aria-hidden="true">
              {obterIniciais(usuario?.nome)}
            </div>

            <div className="sidebar-user-info">
              <strong>{usuario?.nome || 'Usuário'}</strong>
              <span>
                {usuario?.tipo === 'admin' ? 'Administrador' : 'Cliente'}
              </span>
            </div>

            <div className="sidebar-user-menu">
              <button
                type="button"
                className={`sidebar-user-action ${userMenuOpen ? 'open' : ''}`}
                aria-label="Abrir menu do usuário"
                aria-expanded={userMenuOpen}
                onClick={() => setUserMenuOpen((current) => !current)}
              >
                <i className="bi bi-three-dots-vertical" aria-hidden="true" />
              </button>

              <div
                className={`sidebar-user-dropdown ${userMenuOpen ? 'open' : ''}`}
              >
                <button
                  type="button"
                  className="sidebar-user-dropdown-item logout"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right" aria-hidden="true" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
