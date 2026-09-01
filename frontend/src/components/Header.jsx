"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "./Header.css";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
)
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");
const TOKEN_KEY = "token";
const USER_KEY = "usuario";

function lerUsuarioSalvo() {
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

export default function Header() {
  const [categorias, setCategorias] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const perfilRef = useRef(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function carregarMenu() {
      try {
        const response = await fetch(`${API_ORIGIN}/api/categorias/menu`, {
          headers: { Accept: "application/json" },
          signal: abortController.signal,
        });
        const resultado = await response.json().catch(() => ({}));

        if (!response.ok || !resultado.sucesso) {
          throw new Error(
            resultado.mensagem || "Não foi possível carregar as categorias.",
          );
        }

        setCategorias(resultado.dados || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setErro(error.message || "Não foi possível carregar as categorias.");
        }
      } finally {
        if (!abortController.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregarMenu();
    return () => abortController.abort();
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
            Accept: "application/json",
            Authorization: `Bearer ${sessao.token}`,
          },
          signal: abortController.signal,
          cache: "no-store",
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
        if (error.name !== "AbortError" && ativo && !sessao.usuario) {
          setUsuario(null);
        }
      }
    }

    function atualizarSessao() {
      sincronizarUsuario();
    }

    sincronizarUsuario();
    window.addEventListener("auth-changed", atualizarSessao);
    window.addEventListener("storage", atualizarSessao);

    return () => {
      ativo = false;
      abortController?.abort();
      window.removeEventListener("auth-changed", atualizarSessao);
      window.removeEventListener("storage", atualizarSessao);
    };
  }, []);

  useEffect(() => {
    function fecharAoClicarFora(event) {
      if (perfilRef.current && !perfilRef.current.contains(event.target)) {
        setPerfilAberto(false);
      }
    }

    document.addEventListener("pointerdown", fecharAoClicarFora);
    return () => document.removeEventListener("pointerdown", fecharAoClicarFora);
  }, []);

  function fecharMenuAoSair(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setCategoriaAtiva(null);
    }
  }

  return (
    <header
      className="header-container"
      onMouseLeave={() => setCategoriaAtiva(null)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setCategoriaAtiva(null);
          setPerfilAberto(false);
        }
      }}
    >
      <nav className="navbar-main" aria-label="Categorias de produtos">
        <Link href="/" className="header-logo-link" aria-label="Everett - Página inicial">
          <Image
            src="/everettlogo.png"
            alt="Everett"
            width={294}
            height={238}
            priority
            className="header-logo"
          />
        </Link>

        <ul className="categories-list">
          <li className="category-item category-item-all">
            <Link href="/produtos" className="category-link">
              Todos
            </Link>
          </li>

          {carregando ? (
            <>
              <li className="category-loading" aria-hidden="true" />
              <li className="category-loading" aria-hidden="true" />
              <li className="category-loading" aria-hidden="true" />
            </>
          ) : null}

          {categorias.map((categoria) => {
            const estaAberta = categoriaAtiva === categoria.idCategoria;
            const categoriaUrl = `/produtos?idCategoria=${categoria.idCategoria}`;

            return (
              <li
                key={categoria.idCategoria}
                className={`category-item ${estaAberta ? "active" : ""}`}
                onBlur={fecharMenuAoSair}
              >
                <div className="category-trigger-row">
                  <Link
                    href={categoriaUrl}
                    className="category-link"
                    onMouseEnter={() => setCategoriaAtiva(categoria.idCategoria)}
                    onFocus={() => setCategoriaAtiva(categoria.idCategoria)}
                    onClick={() => setCategoriaAtiva(null)}
                  >
                    {categoria.nomeCategoria}
                  </Link>
                  <button
                    type="button"
                    className="category-dropdown-toggle"
                    aria-expanded={estaAberta}
                    aria-label={`${estaAberta ? "Fechar" : "Abrir"} subcategorias de ${categoria.nomeCategoria}`}
                    onClick={() =>
                      setCategoriaAtiva((atual) =>
                        atual === categoria.idCategoria
                          ? null
                          : categoria.idCategoria,
                      )
                    }
                  >
                    <i className="bi bi-chevron-down" aria-hidden="true" />
                  </button>
                </div>

                {estaAberta ? (
                  <div className="category-dropdown-menu">
                    <div className="category-dropdown-header">
                      <div>
                        <span>Categoria</span>
                        <strong>{categoria.nomeCategoria}</strong>
                      </div>
                      <span className="category-product-count">
                        {categoria.totalProdutos} produto
                        {categoria.totalProdutos === 1 ? "" : "s"}
                      </span>
                    </div>

                    {categoria.subcategorias.length > 0 ? (
                      <ul className="subcategory-list">
                        {categoria.subcategorias.map((subcategoria) => (
                          <li key={subcategoria.idSubcategoria}>
                            <Link
                              href={`${categoriaUrl}&idSubcategoria=${subcategoria.idSubcategoria}`}
                              onClick={() => setCategoriaAtiva(null)}
                            >
                              <span>{subcategoria.nomeSubcategoria}</span>
                              <small>
                                {subcategoria.totalProdutos} item
                                {subcategoria.totalProdutos === 1 ? "" : "s"}
                              </small>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="subcategory-empty">
                        Nenhuma subcategoria com produtos disponíveis.
                      </p>
                    )}

                    <Link
                      href={categoriaUrl}
                      className="view-category-link"
                      onClick={() => setCategoriaAtiva(null)}
                    >
                      Ver toda a categoria
                      <i className="bi bi-arrow-right" aria-hidden="true" />
                    </Link>
                  </div>
                ) : null}
              </li>
            );
          })}

          {!carregando && erro ? (
            <li className="category-error" title={erro}>
              Categorias indisponíveis
            </li>
          ) : null}
        </ul>

        <form className="search-pill-container" action="/produtos">
          <i className="bi bi-search search-pill-icon" aria-hidden="true" />
          <label className="visually-hidden" htmlFor="header-search">
            Buscar produtos
          </label>
          <input
            id="header-search"
            name="busca"
            type="search"
            placeholder="O que você está procurando?"
            className="search-pill-input"
          />
        </form>

        <div className="header-actions" aria-label="Ações do usuário">
          <button type="button" className="header-action-button" aria-label="Notificações">
            <i className="bi bi-bell" aria-hidden="true" />
          </button>

          <button type="button" className="header-action-button" aria-label="Carrinho">
            <i className="bi bi-cart3" aria-hidden="true" />
          </button>

          <div className="profile-menu" ref={perfilRef}>
            <button
              type="button"
              className={`header-action-button ${perfilAberto ? "active" : ""}`}
              aria-label="Abrir menu do perfil"
              aria-expanded={perfilAberto}
              aria-haspopup="dialog"
              onClick={() => setPerfilAberto((aberto) => !aberto)}
            >
              <i className="bi bi-person" aria-hidden="true" />
            </button>

            {perfilAberto ? (
              <div className="profile-dropdown" role="dialog" aria-label="Perfil do usuário">
                {usuario ? (
                  <>
                    <div className="profile-logged-header">
                      <span className="profile-avatar" aria-hidden="true">
                        {String(usuario.nome || "U").trim().charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <span>Olá,</span>
                        <strong>{usuario.nome || "Usuário"}</strong>
                      </div>
                    </div>
                    <div className="profile-details">
                      <p>
                        <i className="bi bi-envelope" aria-hidden="true" />
                        <span>{usuario.email || "E-mail não informado"}</span>
                      </p>
                      <p>
                        <i className="bi bi-person-badge" aria-hidden="true" />
                        <span>
                          {usuario.tipo === "admin" ? "Administrador" : "Cliente Everett"}
                        </span>
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="profile-welcome">
                      <span className="profile-welcome-icon" aria-hidden="true">
                        <i className="bi bi-person-heart" />
                      </span>
                      <strong>Seja bem-vindo!</strong>
                      <p>Entre na sua conta ou cadastre-se para aproveitar todos os recursos.</p>
                    </div>
                    <div className="profile-auth-actions">
                      <Link href="/login" className="profile-login" onClick={() => setPerfilAberto(false)}>
                        Entrar
                      </Link>
                      <Link href="/cadastro" className="profile-register" onClick={() => setPerfilAberto(false)}>
                        Criar conta
                      </Link>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </nav>
    </header>
  );
}
