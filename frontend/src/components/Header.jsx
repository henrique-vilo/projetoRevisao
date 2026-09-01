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

// TODO: substituir pelos dados vindos da API de carrinho (ex: GET /api/carrinho)
// As imagens abaixo são placeholders — troque pelos caminhos reais dos produtos.
const CARRINHO_MOCK = [
  {
    id: 1,
    nome: "Camiseta Oversized Essential",
    variacao: "Tamanho M · Preto",
    preco: 129.9,
    quantidade: 1,
    imagem: "/produtos/mock-camiseta.jpg",
  },
  {
    id: 2,
    nome: "Moletom Canguru Everett",
    variacao: "Tamanho G · Cinza Mescla",
    preco: 219.9,
    quantidade: 2,
    imagem: "/produtos/mock-moletom.jpg",
  },
];

function lerUsuarioSalvo() {
  if (typeof window === "undefined") return { token: null, usuario: null };

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

function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Header() {
  const [categorias, setCategorias] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [modoEscuro, setModoEscuro] = useState(false);
  const [itensCarrinho, setItensCarrinho] = useState(CARRINHO_MOCK);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const perfilRef = useRef(null);
  const carrinhoRef = useRef(null);

  const totalItensCarrinho = itensCarrinho.reduce(
    (total, item) => total + item.quantidade,
    0,
  );
  const subtotalCarrinho = itensCarrinho.reduce(
    (total, item) => total + item.preco * item.quantidade,
    0,
  );

  // Aplica as classes e o atributo de tema do Bootstrap no elemento <html>
  function aplicarTema(isDark) {
    if (typeof document === "undefined") return;

    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-bs-theme", "dark");
      localStorage.setItem("tema", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-bs-theme", "light");
      localStorage.setItem("tema", "light");
    }
  }

  // Carrega a preferência de tema ao montar o componente
  useEffect(() => {
    const temaSalvo = localStorage.getItem("tema");
    const prefereEscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const deveSerEscuro = temaSalvo === "dark" || (!temaSalvo && prefereEscuro);

    setModoEscuro(deveSerEscuro);
    aplicarTema(deveSerEscuro);
  }, []);

  // Alterna o modo claro / escuro ao clicar no botão
  function alternarTema() {
    const novoModo = !modoEscuro;
    setModoEscuro(novoModo);
    aplicarTema(novoModo);
  }

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
      if (carrinhoRef.current && !carrinhoRef.current.contains(event.target)) {
        setCarrinhoAberto(false);
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

  function alterarQuantidade(idItem, delta) {
    setItensCarrinho((itensAtuais) =>
      itensAtuais.map((item) =>
        item.id === idItem
          ? { ...item, quantidade: Math.max(1, item.quantidade + delta) }
          : item,
      ),
    );
  }

  function removerItemCarrinho(idItem) {
    setItensCarrinho((itensAtuais) =>
      itensAtuais.filter((item) => item.id !== idItem),
    );
  }

  return (
    <header
      className="header-container"
      onMouseLeave={() => setCategoriaAtiva(null)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setCategoriaAtiva(null);
          setPerfilAberto(false);
          setCarrinhoAberto(false);
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
          {/* Botão de Alternância de Modo Escuro / Claro */}
          <button
            type="button"
            className="header-action-button"
            aria-label={modoEscuro ? "Ativar modo claro" : "Ativar modo escuro"}
            onClick={alternarTema}
            title={modoEscuro ? "Modo Claro" : "Modo Escuro"}
          >
            <i className={`bi ${modoEscuro ? "bi-sun-fill" : "bi-moon-fill"}`} aria-hidden="true" />
          </button>

          <button type="button" className="header-action-button" aria-label="Notificações">
            <i className="bi bi-bell" aria-hidden="true" />
          </button>

          <div className="cart-menu" ref={carrinhoRef}>
            <button
              type="button"
              className={`header-action-button ${carrinhoAberto ? "active" : ""}`}
              aria-label="Abrir carrinho de compras"
              aria-expanded={carrinhoAberto}
              aria-haspopup="dialog"
              onClick={() => setCarrinhoAberto((aberto) => !aberto)}
            >
              <i className="bi bi-cart3" aria-hidden="true" />
              {totalItensCarrinho > 0 ? (
                <span className="cart-badge">
                  {totalItensCarrinho > 9 ? "9+" : totalItensCarrinho}
                </span>
              ) : null}
            </button>

            {carrinhoAberto ? (
              <div className="cart-dropdown" role="dialog" aria-label="Carrinho de compras">
                <div className="cart-dropdown-header">
                  <strong>Meu Carrinho</strong>
                  <span className="cart-items-count">
                    {totalItensCarrinho} {totalItensCarrinho === 1 ? "item" : "itens"}
                  </span>
                </div>

                {itensCarrinho.length === 0 ? (
                  <div className="cart-empty">
                    <span className="cart-empty-icon" aria-hidden="true">
                      <i className="bi bi-cart-x" />
                    </span>
                    <strong>Seu carrinho está vazio</strong>
                    <p>Adicione produtos para vê-los por aqui.</p>
                    <Link
                      href="/produtos"
                      className="cart-empty-link"
                      onClick={() => setCarrinhoAberto(false)}
                    >
                      Ver produtos
                    </Link>
                  </div>
                ) : (
                  <>
                    <ul className="cart-items-list">
                      {itensCarrinho.map((item) => (
                        <li key={item.id} className="cart-item">
                          <div className="cart-item-image">
                            <Image
                              src={item.imagem}
                              alt={item.nome}
                              width={56}
                              height={56}
                            />
                          </div>

                          <div className="cart-item-info">
                            <span className="cart-item-name">{item.nome}</span>
                            {item.variacao ? (
                              <span className="cart-item-variant">{item.variacao}</span>
                            ) : null}
                            <span className="cart-item-price">
                              {formatarPreco(item.preco)}
                            </span>
                          </div>

                          <div className="cart-item-actions">
                            <div className="cart-quantity-stepper">
                              <button
                                type="button"
                                aria-label={`Diminuir quantidade de ${item.nome}`}
                                onClick={() => alterarQuantidade(item.id, -1)}
                              >
                                <i className="bi bi-dash" aria-hidden="true" />
                              </button>
                              <span>{item.quantidade}</span>
                              <button
                                type="button"
                                aria-label={`Aumentar quantidade de ${item.nome}`}
                                onClick={() => alterarQuantidade(item.id, 1)}
                              >
                                <i className="bi bi-plus" aria-hidden="true" />
                              </button>
                            </div>
                            <button
                              type="button"
                              className="cart-item-remove"
                              aria-label={`Remover ${item.nome} do carrinho`}
                              onClick={() => removerItemCarrinho(item.id)}
                            >
                              <i className="bi bi-trash3" aria-hidden="true" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="cart-dropdown-footer">
                      <div className="cart-subtotal-row">
                        <span>Subtotal</span>
                        <strong>{formatarPreco(subtotalCarrinho)}</strong>
                      </div>
                      <Link
                        href="/checkout"
                        className="cart-checkout-button"
                        onClick={() => setCarrinhoAberto(false)}
                      >
                        Finalizar Compra
                      </Link>
                      <Link
                        href="/carrinho"
                        className="cart-view-all-link"
                        onClick={() => setCarrinhoAberto(false)}
                      >
                        Ver carrinho completo
                      </Link>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>

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