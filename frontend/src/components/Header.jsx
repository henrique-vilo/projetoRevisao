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
  const carregarCarrinho = useCallback(
    async ({ signal, exibirCarregamento = true } = {}) => {
      const sessao = lerUsuarioSalvo();
      const idUsuario = obterIdUsuario(usuario || sessao.usuario);
      if (!sessao.token || !idUsuario) {
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
    }
    document.addEventListener("pointerdown", fecharAoClicarFora);
    return () => document.removeEventListener("pointerdown", fecharAoClicarFora);
  }, []);
  function fecharMenuAoSair(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setCategoriaAtiva(null);
    }
  }
  function sairDaConta() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUsuario(null);
    setItensCarrinho([]);
    setPerfilAberto(false);
    setCarrinhoAberto(false);
    window.dispatchEvent(new Event("auth-changed"));
    window.location.href = "/login";
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
    const idUsuario = obterIdUsuario(usuario);
    if (!item || !idUsuario || itemCarrinhoPendente === idItem) return;
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
    if (vaiAbrir && usuario) carregarCarrinho();
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
            placeholder="O que você procura?"
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
              onClick={() => setPerfilAberto((aberto) => !aberto)}
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
                      <button
                        type="button"
                        className="profile-logout-button"
                        aria-label="Sair da conta"
                        title="Sair da conta"
                        onClick={sairDaConta}
                      >
                        <i className="bi bi-box-arrow-right" aria-hidden="true" />
                      </button>
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
