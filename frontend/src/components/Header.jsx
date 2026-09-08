"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import "./Header.css";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
)
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

const TOKEN_KEY = "token";
const USER_KEY = "usuario";

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
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function obterIdUsuario(usuario) {
  const id = Number(usuario?.idUsuario ?? usuario?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizarUsuarioResposta(resultado) {
  return (
    resultado?.dados?.usuario ||
    resultado?.dados?.perfil ||
    resultado?.dados ||
    resultado?.usuario ||
    null
  );
}

function resolverImagemProduto(caminho) {
  if (!caminho) return null;
  if (/^https?:\/\//i.test(caminho)) return caminho;
  if (caminho.startsWith("/uploads/")) return `${API_ORIGIN}${caminho}`;
  return caminho.startsWith("/") ? caminho : `/${caminho}`;
}

function normalizarItemCarrinho(item) {
  const idProduto = Number(item.idProduto ?? item.id);
  const idsVendas = Array.isArray(item.idsVendas)
    ? item.idsVendas.map(Number).filter(Number.isInteger)
    : [Number(item.idVendas)].filter(Number.isInteger);
  return {
    id: idProduto,
    idProduto,
    idsVendas,
    nome: item.nome || item.nomeProduto || "Produto",
    variacao: item.variacao || item.nomeCombinacao || "",
    preco: Number(item.preco || 0),
    quantidade: Number(item.quantidade || idsVendas.length || 1),
    imagem: resolverImagemProduto(item.imagem || item.imagem1),
  };
}

function notificacaoNaoLida(notificacao) {
  return (
    notificacao?.lida === 0 ||
    notificacao?.lida === false ||
    notificacao?.lida === null
  );
}

function formatarDataNotificacao(data) {
  if (!data) return "";
  const dataNotificacao = new Date(data);
  if (Number.isNaN(dataNotificacao.getTime())) return "";
  return dataNotificacao.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Header() {
  const pathname = usePathname();
  const [categorias, setCategorias] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [carregandoUsuario, setCarregandoUsuario] = useState(true);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [modoEscuro, setModoEscuro] = useState(false);
  const [itensCarrinho, setItensCarrinho] = useState([]);
  const [carregandoCarrinho, setCarregandoCarrinho] = useState(false);
  const [erroCarrinho, setErroCarrinho] = useState("");
  const [itemCarrinhoPendente, setItemCarrinhoPendente] = useState(null);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const [totalNaoLidas, setTotalNaoLidas] = useState(0);
  const [carregandoNotificacoes, setCarregandoNotificacoes] = useState(false);
  const [erroNotificacoes, setErroNotificacoes] = useState("");
  const [notificacaoPendente, setNotificacaoPendente] = useState(null);
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const perfilRef = useRef(null);
  const carrinhoRef = useRef(null);
  const notificacoesRef = useRef(null);

  const totalItensCarrinho = itensCarrinho.reduce(
    (total, item) => total + item.quantidade,
    0,
  );
  const subtotalCarrinho = itensCarrinho.reduce(
    (total, item) => total + item.preco * item.quantidade,
    0,
  );

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

  useEffect(() => {
    const temaSalvo = localStorage.getItem("tema");
    const prefereEscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const deveSerEscuro = temaSalvo === "dark" || (!temaSalvo && prefereEscuro);
    setModoEscuro(deveSerEscuro);
    aplicarTema(deveSerEscuro);
  }, []);

  function alternarTema() {
    const novoModo = !modoEscuro;
    setModoEscuro(novoModo);
    aplicarTema(novoModo);
  }

  function fazerLogout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUsuario(null);
    setItensCarrinho([]);
    setNotificacoes([]);
    setTotalNaoLidas(0);
    setPerfilAberto(false);
    setNotificacoesAbertas(false);
    window.dispatchEvent(new Event("auth-changed"));
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

  const carregarCarrinho = useCallback(
    async ({ signal, exibirCarregamento = true } = {}) => {
      const sessao = lerUsuarioSalvo();
      if (!sessao.token || !obterIdUsuario(usuario || sessao.usuario)) {
        setItensCarrinho([]);
        setErroCarrinho("");
        setCarregandoCarrinho(false);
        return;
      }
      if (exibirCarregamento) setCarregandoCarrinho(true);
      setErroCarrinho("");
      try {
        const response = await fetch(
          `${API_ORIGIN}/api/vendas/carrinho`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${sessao.token}`,
            },
            signal,
            cache: "no-store",
          },
        );
        const resultado = await response.json().catch(() => ({}));
        if (!response.ok || !resultado.sucesso) {
          if ([401, 403].includes(response.status)) {
            throw new Error("Sua sessão expirou. Entre novamente para acessar o carrinho.");
          }
          throw new Error(
            resultado.mensagem || "Não foi possível carregar seu carrinho.",
          );
        }
        const dados = Array.isArray(resultado.dados)
          ? resultado.dados
          : resultado.dados?.itens || [];
        setItensCarrinho(
          dados
            .map(normalizarItemCarrinho)
            .filter((item) => Number.isInteger(item.idProduto)),
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          setErroCarrinho(
            error.message || "Não foi possível carregar seu carrinho.",
          );
        }
      } finally {
        if (!signal?.aborted) setCarregandoCarrinho(false);
      }
    },
    [usuario],
  );

  useEffect(() => {
    const abortController = new AbortController();
    carregarCarrinho({ signal: abortController.signal });
    function atualizarCarrinho() {
      carregarCarrinho({ exibirCarregamento: false });
    }
    window.addEventListener("carrinho-atualizado", atualizarCarrinho);
    return () => {
      abortController.abort();
      window.removeEventListener("carrinho-atualizado", atualizarCarrinho);
    };
  }, [carregarCarrinho]);

  const carregarNotificacoes = useCallback(
    async ({ signal, exibirCarregamento = true } = {}) => {
      const { token } = lerUsuarioSalvo();
      if (!token) {
        setNotificacoes([]);
        setTotalNaoLidas(0);
        setErroNotificacoes("");
        setCarregandoNotificacoes(false);
        return;
      }
      if (exibirCarregamento) setCarregandoNotificacoes(true);
      setErroNotificacoes("");
      try {
        const response = await fetch(
          `${API_ORIGIN}/api/notificacoes?pagina=1&limite=5`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal,
            cache: "no-store",
          },
        );
        const resultado = await response.json().catch(() => ({}));
        if (!response.ok || !resultado.sucesso) {
          if ([401, 403].includes(response.status)) {
            throw new Error(
              "Sua sessão expirou. Entre novamente para ver as notificações.",
            );
          }
          throw new Error(
            resultado.mensagem || "Não foi possível carregar suas notificações.",
          );
        }
        const dados = Array.isArray(resultado.dados) ? resultado.dados : [];
        setNotificacoes(dados);
        setTotalNaoLidas(
          Number.isInteger(Number(resultado.paginacao?.naoLidas))
            ? Number(resultado.paginacao.naoLidas)
            : dados.filter(notificacaoNaoLida).length,
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          setErroNotificacoes(
            error.message || "Não foi possível carregar suas notificações.",
          );
        }
      } finally {
        if (!signal?.aborted) setCarregandoNotificacoes(false);
      }
    },
    [],
  );

  useEffect(() => {
    const abortController = new AbortController();
    carregarNotificacoes({ signal: abortController.signal });
    function atualizarNotificacoes() {
      carregarNotificacoes({ exibirCarregamento: false });
    }
    window.addEventListener("notificacoes-atualizadas", atualizarNotificacoes);
    window.addEventListener("auth-changed", atualizarNotificacoes);
    return () => {
      abortController.abort();
      window.removeEventListener("notificacoes-atualizadas", atualizarNotificacoes);
      window.removeEventListener("auth-changed", atualizarNotificacoes);
    };
  }, [carregarNotificacoes]);

  useEffect(() => {
    let ativo = true;
    let abortController = null;
    async function sincronizarUsuario() {
      abortController?.abort();
      const controllerAtual = new AbortController();
      abortController = controllerAtual;
      const sessao = lerUsuarioSalvo();
      if (ativo) setCarregandoUsuario(true);
      if (!sessao.token) {
        if (ativo) {
          setUsuario(null);
          setCarregandoUsuario(false);
        }
        return;
      }
      if (ativo) setUsuario(sessao.usuario);
      try {
        const response = await fetch(`${API_ORIGIN}/api/auth/perfil`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${sessao.token}`,
          },
          signal: controllerAtual.signal,
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
          const usuarioAtualizado = normalizarUsuarioResposta(resultado);
          setUsuario(usuarioAtualizado);
          if (usuarioAtualizado) {
            localStorage.setItem(USER_KEY, JSON.stringify(usuarioAtualizado));
          }
        }
      } catch (error) {
        if (error.name !== "AbortError" && ativo && !sessao.usuario) {
          setUsuario(null);
        }
      } finally {
        if (ativo && !controllerAtual.signal.aborted) {
          setCarregandoUsuario(false);
        }
      }
    }
    function atualizarSessao() {
      sincronizarUsuario();
    }
    sincronizarUsuario();
    window.addEventListener("auth-changed", atualizarSessao);
    window.addEventListener("storage", atualizarSessao);
    window.addEventListener("focus", atualizarSessao);
    return () => {
      ativo = false;
      abortController?.abort();
      window.removeEventListener("auth-changed", atualizarSessao);
      window.removeEventListener("storage", atualizarSessao);
      window.removeEventListener("focus", atualizarSessao);
    };
  }, [pathname]);

  useEffect(() => {
    function fecharAoClicarFora(event) {
      if (perfilRef.current && !perfilRef.current.contains(event.target)) {
        setPerfilAberto(false);
      }
      if (carrinhoRef.current && !carrinhoRef.current.contains(event.target)) {
        setCarrinhoAberto(false);
      }
      if (
        notificacoesRef.current &&
        !notificacoesRef.current.contains(event.target)
      ) {
        setNotificacoesAbertas(false);
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

  async function requisitarCarrinho(caminho, opcoes = {}) {
    const sessao = lerUsuarioSalvo();
    if (!sessao.token) {
      throw new Error("Entre na sua conta para alterar o carrinho.");
    }
    const response = await fetch(`${API_ORIGIN}${caminho}`, {
      ...opcoes,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${sessao.token}`,
        ...(opcoes.body ? { "Content-Type": "application/json" } : {}),
        ...opcoes.headers,
      },
    });
    const resultado = await response.json().catch(() => ({}));
    if (!response.ok || !resultado.sucesso) {
      throw new Error(
        resultado.mensagem || "Não foi possível atualizar o carrinho.",
      );
    }
    return resultado;
  }

  async function alterarQuantidade(idItem, delta) {
    const item = itensCarrinho.find((itemAtual) => itemAtual.id === idItem);
    if (!item || !obterIdUsuario(usuario) || itemCarrinhoPendente === idItem) return;
    if (delta < 0 && item.quantidade <= 1) return;
    setItemCarrinhoPendente(idItem);
    setErroCarrinho("");
    try {
      if (delta > 0) {
        await requisitarCarrinho("/api/vendas/carrinho", {
          method: "POST",
          body: JSON.stringify({ idProduto: item.idProduto }),
        });
      } else {
        const idVenda = item.idsVendas[item.idsVendas.length - 1];
        if (!idVenda) throw new Error("Item do carrinho inválido.");
        await requisitarCarrinho(`/api/vendas/carrinho/${idVenda}`, {
          method: "DELETE",
        });
      }
      await carregarCarrinho({ exibirCarregamento: false });
    } catch (error) {
      setErroCarrinho(error.message || "Não foi possível alterar a quantidade.");
    } finally {
      setItemCarrinhoPendente(null);
    }
  }

  async function removerItemCarrinho(idItem) {
    const item = itensCarrinho.find((itemAtual) => itemAtual.id === idItem);
    if (!item || itemCarrinhoPendente === idItem) return;
    setItemCarrinhoPendente(idItem);
    setErroCarrinho("");
    try {
      await Promise.all(
        item.idsVendas.map((idVenda) =>
          requisitarCarrinho(`/api/vendas/carrinho/${idVenda}`, {
            method: "DELETE",
          }),
        ),
      );
      await carregarCarrinho({ exibirCarregamento: false });
    } catch (error) {
      setErroCarrinho(error.message || "Não foi possível remover o produto.");
      await carregarCarrinho({ exibirCarregamento: false });
    } finally {
      setItemCarrinhoPendente(null);
    }
  }

  function tentarCarregarCarrinhoNovamente() {
    carregarCarrinho();
  }

  function alternarCarrinhoMenu() {
    const vaiAbrir = !carrinhoAberto;
    setCarrinhoAberto(vaiAbrir);
    if (vaiAbrir) {
      setPerfilAberto(false);
      setNotificacoesAbertas(false);
      if (usuario) carregarCarrinho();
    }
  }

  function alternarNotificacoesMenu() {
    const vaiAbrir = !notificacoesAbertas;
    setNotificacoesAbertas(vaiAbrir);
    if (vaiAbrir) {
      setPerfilAberto(false);
      setCarrinhoAberto(false);
      if (usuario) carregarNotificacoes();
    }
  }

  async function marcarNotificacaoComoLida(notificacao) {
    if (!notificacaoNaoLida(notificacao) || notificacaoPendente) return;
    const { token } = lerUsuarioSalvo();
    if (!token) return;
    setNotificacaoPendente(notificacao.idNotificacao);
    setErroNotificacoes("");
    try {
      const response = await fetch(
        `${API_ORIGIN}/api/notificacoes/${notificacao.idNotificacao}/lida`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const resultado = await response.json().catch(() => ({}));
      if (!response.ok || !resultado.sucesso) {
        throw new Error(
          resultado.mensagem || "Não foi possível marcar a notificação como lida.",
        );
      }
      setNotificacoes((lista) =>
        lista.map((item) =>
          item.idNotificacao === notificacao.idNotificacao
            ? { ...item, lida: 1 }
            : item,
        ),
      );
      setTotalNaoLidas((totalAtual) => Math.max(0, totalAtual - 1));
      window.dispatchEvent(new Event("notificacoes-atualizadas"));
    } catch (error) {
      setErroNotificacoes(
        error.message || "Não foi possível atualizar a notificação.",
      );
    } finally {
      setNotificacaoPendente(null);
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
          setCarrinhoAberto(false);
          setNotificacoesAbertas(false);
        }
      }}
    >
      <nav className="navbar-main" aria-label="Categorias de produtos">
        <Link href="/" className="header-logo-link" aria-label="Everett - Página inicial">
          <Image
            src="/everettlogo2.jpg"
            alt="everettlogo2"
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
                <Link
                  href={categoriaUrl}
                  className="category-link"
                  onMouseEnter={() => setCategoriaAtiva(categoria.idCategoria)}
                  onFocus={() => setCategoriaAtiva(categoria.idCategoria)}
                  onClick={() => setCategoriaAtiva(null)}
                >
                  {categoria.nomeCategoria}
                </Link>
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
                    {categoria.subcategorias?.length > 0 ? (
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
            placeholder="O que você procura?"
            className="search-pill-input"
          />
        </form>
        <div className="header-actions" aria-label="Ações do usuário">
          <button
            type="button"
            className="header-action-button"
            aria-label={modoEscuro ? "Ativar modo claro" : "Ativar modo escuro"}
            onClick={alternarTema}
            title={modoEscuro ? "Modo Claro" : "Modo Escuro"}
          >
            <i className={`bi ${modoEscuro ? "bi-sun-fill" : "bi-moon-fill"}`} aria-hidden="true" />
          </button>
          <div className="notification-menu" ref={notificacoesRef}>
            <button
              type="button"
              className={`header-action-button ${notificacoesAbertas ? "active" : ""}`}
              aria-label={`Abrir notificações${
                totalNaoLidas > 0 ? `, ${totalNaoLidas} não lidas` : ""
              }`}
              aria-expanded={notificacoesAbertas}
              aria-haspopup="dialog"
              aria-controls="header-notification-dropdown"
              onClick={alternarNotificacoesMenu}
            >
              <i className="bi bi-bell" aria-hidden="true" />
              {totalNaoLidas > 0 ? (
                <span className="notification-badge">
                  {totalNaoLidas > 9 ? "9+" : totalNaoLidas}
                </span>
              ) : null}
            </button>
            {notificacoesAbertas ? (
              <div
                id="header-notification-dropdown"
                className="notification-dropdown"
                role="dialog"
                aria-label="Notificações"
                aria-busy={carregandoNotificacoes}
              >
                <div className="notification-dropdown-header">
                  <div>
                    <strong>Notificações</strong>
                    <span>Atualizações da sua conta</span>
                  </div>
                  {totalNaoLidas > 0 ? (
                    <span className="notification-unread-count">
                      {totalNaoLidas} não lida{totalNaoLidas === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </div>
                {carregandoUsuario && !usuario ? (
                  <div className="notification-empty" role="status">
                    <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                    <strong>Verificando sua conta...</strong>
                  </div>
                ) : !usuario ? (
                  <div className="notification-empty">
                    <span className="notification-empty-icon" aria-hidden="true">
                      <i className="bi bi-person-lock" />
                    </span>
                    <strong>Entre para ver suas notificações</strong>
                    <p>Os avisos e atualizações são vinculados à sua conta Everett.</p>
                    <Link
                      href="/login"
                      className="notification-primary-link"
                      onClick={() => setNotificacoesAbertas(false)}
                    >
                      Entrar
                    </Link>
                  </div>
                ) : carregandoNotificacoes ? (
                  <div className="notification-empty" role="status">
                    <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                    <strong>Carregando notificações...</strong>
                  </div>
                ) : erroNotificacoes && notificacoes.length === 0 ? (
                  <div className="notification-empty" role="alert">
                    <span className="notification-empty-icon" aria-hidden="true">
                      <i className="bi bi-wifi-off" />
                    </span>
                    <strong>Não foi possível carregar</strong>
                    <p>{erroNotificacoes}</p>
                    <button
                      type="button"
                      className="notification-primary-link"
                      onClick={() => carregarNotificacoes()}
                    >
                      Tentar novamente
                    </button>
                  </div>
                ) : notificacoes.length === 0 ? (
                  <div className="notification-empty">
                    <span className="notification-empty-icon" aria-hidden="true">
                      <i className="bi bi-bell-slash" />
                    </span>
                    <strong>Nenhuma notificação</strong>
                    <p>Seus novos avisos aparecerão aqui.</p>
                  </div>
                ) : (
                  <>
                    {erroNotificacoes ? (
                      <p className="notification-inline-error" role="alert">
                        {erroNotificacoes}
                      </p>
                    ) : null}
                    <ul className="notification-list">
                      {notificacoes.map((notificacao) => {
                        const naoLida = notificacaoNaoLida(notificacao);
                        return (
                          <li
                            key={notificacao.idNotificacao}
                            className={`notification-item ${naoLida ? "unread" : ""}`}
                          >
                            <span className="notification-item-icon" aria-hidden="true">
                              <i className="bi bi-bell" />
                            </span>
                            <div className="notification-item-content">
                              <strong>{notificacao.titulo || "Nova notificação"}</strong>
                              <p>
                                {notificacao.mensagem ||
                                  notificacao.texto ||
                                  "Você recebeu uma nova notificação."}
                              </p>
                              <time dateTime={notificacao.dataCriacao || undefined}>
                                {formatarDataNotificacao(notificacao.dataCriacao)}
                              </time>
                            </div>
                            {naoLida ? (
                              <button
                                type="button"
                                className="notification-read-button"
                                aria-label={`Marcar ${notificacao.titulo || "notificação"} como lida`}
                                title="Marcar como lida"
                                disabled={notificacaoPendente === notificacao.idNotificacao}
                                onClick={() => marcarNotificacaoComoLida(notificacao)}
                              >
                                {notificacaoPendente === notificacao.idNotificacao ? (
                                  <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                                ) : (
                                  <i className="bi bi-check2" aria-hidden="true" />
                                )}
                              </button>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
                <div className="notification-dropdown-footer">
                  <Link
                    href="/notificacao"
                    onClick={() => setNotificacoesAbertas(false)}
                  >
                    Ver todas as notificações
                    <i className="bi bi-arrow-right" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
          <div className="cart-menu" ref={carrinhoRef}>
            <button
              type="button"
              className={`header-action-button ${carrinhoAberto ? "active" : ""}`}
              aria-label="Abrir carrinho de compras"
              aria-expanded={carrinhoAberto}
              aria-haspopup="dialog"
              aria-controls="header-cart-dropdown"
              onClick={alternarCarrinhoMenu}
            >
              <i className="bi bi-cart3" aria-hidden="true" />
              {totalItensCarrinho > 0 ? (
                <span className="cart-badge">
                  {totalItensCarrinho > 9 ? "9+" : totalItensCarrinho}
                </span>
              ) : null}
            </button>
            {carrinhoAberto ? (
              <div
                id="header-cart-dropdown"
                className="cart-dropdown"
                role="dialog"
                aria-label="Carrinho de compras"
                aria-busy={carregandoCarrinho}
              >
                <div className="cart-dropdown-header">
                  <strong>Meu Carrinho</strong>
                  <span className="cart-items-count">
                    {totalItensCarrinho} {totalItensCarrinho === 1 ? "item" : "itens"}
                  </span>
                </div>
                {carregandoUsuario && !usuario ? (
                  <div className="cart-empty" role="status">
                    <span
                      className="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    />
                    <strong>Verificando sua conta...</strong>
                  </div>
                ) : !usuario ? (
                  <div className="cart-empty">
                    <span className="cart-empty-icon" aria-hidden="true">
                      <i className="bi bi-person-lock" />
                    </span>
                    <strong>Entre para acessar seu carrinho</strong>
                    <p>Seus produtos ficam vinculados à sua conta Everett.</p>
                    <Link
                      href="/login"
                      className="cart-empty-link"
                      onClick={() => setCarrinhoAberto(false)}
                    >
                      Entrar
                    </Link>
                  </div>
                ) : carregandoCarrinho ? (
                  <div className="cart-empty" role="status">
                    <span
                      className="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    />
                    <strong>Carregando seu carrinho...</strong>
                  </div>
                ) : erroCarrinho && itensCarrinho.length === 0 ? (
                  <div className="cart-empty" role="alert">
                    <span className="cart-empty-icon" aria-hidden="true">
                      <i className="bi bi-wifi-off" />
                    </span>
                    <strong>Não foi possível carregar o carrinho</strong>
                    <p>{erroCarrinho}</p>
                    <button
                      type="button"
                      className="cart-empty-link"
                      onClick={tentarCarregarCarrinhoNovamente}
                    >
                      Tentar novamente
                    </button>
                  </div>
                ) : itensCarrinho.length === 0 ? (
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
                    {erroCarrinho ? (
                      <div className="alert alert-danger py-2 mx-3 mb-2" role="alert">
                        {erroCarrinho}
                      </div>
                    ) : null}
                    <ul className="cart-items-list">
                      {itensCarrinho.map((item) => (
                        <li
                          key={item.id}
                          className="cart-item"
                          aria-busy={itemCarrinhoPendente === item.id}
                        >
                          <div className="cart-item-image">
                            {item.imagem ? (
                              <Image
                                src={item.imagem}
                                alt={item.nome}
                                width={56}
                                height={56}
                                unoptimized={item.imagem.startsWith("http")}
                              />
                            ) : (
                              <i className="bi bi-image" aria-hidden="true" />
                            )}
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
                                disabled={
                                  item.quantidade <= 1 ||
                                  itemCarrinhoPendente === item.id
                                }
                              >
                                <i className="bi bi-dash" aria-hidden="true" />
                              </button>
                              <span>{item.quantidade}</span>
                              <button
                                type="button"
                                aria-label={`Aumentar quantidade de ${item.nome}`}
                                onClick={() => alterarQuantidade(item.id, 1)}
                                disabled={itemCarrinhoPendente === item.id}
                              >
                                <i className="bi bi-plus" aria-hidden="true" />
                              </button>
                            </div>
                            <button
                              type="button"
                              className="cart-item-remove"
                              aria-label={`Remover ${item.nome} do carrinho`}
                              onClick={() => removerItemCarrinho(item.id)}
                              disabled={itemCarrinhoPendente === item.id}
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
                        href="/finalizarCompra"
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
              onClick={() => {
                setPerfilAberto((aberto) => !aberto);
                setCarrinhoAberto(false);
                setNotificacoesAbertas(false);
              }}
            >
              <i className="bi bi-person" aria-hidden="true" />
            </button>
            {perfilAberto ? (
              <div className="profile-dropdown" role="dialog" aria-label="Perfil do usuário">
                {carregandoUsuario && !usuario ? (
                  <div className="profile-welcome" role="status">
                    <span
                      className="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    />
                    <strong>Verificando sua conta...</strong>
                  </div>
                ) : usuario ? (
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
                    <div className="profile-auth-actions">
                      <Link href="/perfil" className="profile-login" onClick={() => setPerfilAberto(false)}>
                        Meu perfil
                      </Link>
                      <button
                        type="button"
                        className="profile-logout-button"
                        onClick={fazerLogout}
                      >
                        <i className="bi bi-box-arrow-right" aria-hidden="true" />
                        <span>Sair da conta</span>
                      </button>
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
