"use client";

import { useState } from "react";
import "./Header.css";
import Link from "next/link";

export default function Header() {
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  // Estados dos painéis
  const [notificacoesAberto, setNotificacoesAberto] = useState(false);
  const [localizacaoAberto, setLocalizacaoAberto] = useState(false);
  const [perfilAberto, setPerfilAberto] = useState(false);

  // Carrinho
  const [produtosCarrinho, setProdutosCarrinho] = useState([]);

  // Localização
  const [localizacao, setLocalizacao] = useState({
    rua: "Rua das Flores",
    numero: "125",
    cidade: "Santo André",
    estado: "SP",
    cep: "09000-000",
  });

  // Perfil
  const [perfil, setPerfil] = useState({
    nome: "Seu Nome",
    email: "seuemail@email.com",
    telefone: "(11) 99999-9999",
  });

  // Notificações
  const [configNotificacoes, setConfigNotificacoes] = useState({
    pedidos: true,
    promocoes: true,
    novidades: false,
  });

  const [notificacoes, setNotificacoes] = useState([
    {
      id: 1,
      titulo: "Pedido confirmado",
      mensagem: "Seu pedido foi confirmado com sucesso.",
      tempo: "Há 10 minutos",
    },
    {
      id: 2,
      titulo: "Nova coleção",
      mensagem: "Confira as novidades da coleção de inverno.",
      tempo: "Há 2 horas",
    },
  ]);

  // =========================
  // CARRINHO
  // =========================

  function removerProduto(id) {
    setProdutosCarrinho((produtos) =>
      produtos.filter((produto) => produto.id !== id)
    );
  }

  function aumentarQuantidade(id) {
    setProdutosCarrinho((produtos) =>
      produtos.map((produto) =>
        produto.id === id
          ? {
              ...produto,
              quantidade: produto.quantidade + 1,
            }
          : produto
      )
    );
  }

  function diminuirQuantidade(id) {
    setProdutosCarrinho((produtos) =>
      produtos
        .map((produto) =>
          produto.id === id
            ? {
                ...produto,
                quantidade: produto.quantidade - 1,
              }
            : produto
        )
        .filter((produto) => produto.quantidade > 0)
    );
  }

  const total = produtosCarrinho.reduce(
    (soma, produto) => soma + produto.preco * produto.quantidade,
    0
  );

  // =========================
  // ABRIR PAINÉIS
  // =========================

  function abrirNotificacoes() {
    setNotificacoesAberto(!notificacoesAberto);
    setLocalizacaoAberto(false);
    setPerfilAberto(false);
  }

  function abrirLocalizacao() {
    setLocalizacaoAberto(!localizacaoAberto);
    setNotificacoesAberto(false);
    setPerfilAberto(false);
  }

  function abrirPerfil() {
    setPerfilAberto(!perfilAberto);
    setNotificacoesAberto(false);
    setLocalizacaoAberto(false);
  }

  // =========================
  // ALTERAR LOCALIZAÇÃO
  // =========================

  function alterarLocalizacao(e) {
    const { name, value } = e.target;

    setLocalizacao((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function salvarLocalizacao(e) {
    e.preventDefault();

    alert("Localização atualizada com sucesso!");
    setLocalizacaoAberto(false);
  }

  // =========================
  // ALTERAR PERFIL
  // =========================

  function alterarPerfil(e) {
    const { name, value } = e.target;

    setPerfil((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function salvarPerfil(e) {
    e.preventDefault();

    alert("Informações pessoais atualizadas!");
    setPerfilAberto(false);
  }

  // =========================
  // NOTIFICAÇÕES
  // =========================

  function alterarNotificacao(tipo) {
    setConfigNotificacoes((anterior) => ({
      ...anterior,
      [tipo]: !anterior[tipo],
    }));
  }

  function limparNotificacoes() {
    setNotificacoes([]);
  }

  return (
    <>
      {/* =====================================
          NAVBAR
      ====================================== */}

      <nav className="navbar navbar-expand-lg navbar-custom">
        <div className="container-fluid">

          {/* Logo */}
          <Link className="navbar-brand" href="/">
            <img
              src="/everettlogo.png"
              alt="Everett"
              width={85}
              height={70}
            />
          </Link>

          {/* Botão do menu mobile */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className="collapse navbar-collapse"
            id="navbarSupportedContent"
          >

            {/* =====================================
                MENU
            ====================================== */}

            <ul className="navbar-nav">

              {/* Categorias */}
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Categorias
                </a>

                <ul className="dropdown-menu">

                  <li>
                    <a className="dropdown-item" href="#">
                      Jaquetas
                    </a>
                  </li>

                  <li>
                    <a className="dropdown-item" href="#">
                      Camisetas
                    </a>
                  </li>

                  <li>
                    <hr className="dropdown-divider" />
                  </li>

                  <li>
                    <a className="dropdown-item" href="#">
                      Calças
                    </a>
                  </li>

                </ul>
              </li>

              {/* Masculino */}
              <li className="nav-item">
                <Link
                  className="nav-link"
                  href="/masculino"
                >
                  Masculino
                </Link>
              </li>

              {/* Feminino */}
              <li className="nav-item">
                <Link
                  className="nav-link"
                  href="/feminino"
                >
                  Feminino
                </Link>
              </li>

            </ul>


            {/* =====================================
                BARRA DE PESQUISA
            ====================================== */}

            <form
              className="search-form mx-auto"
              role="search"
            >
              <div className="search-box">

                <i className="bi bi-search search-icon"></i>

                <input
                  className="form-control search-input"
                  type="search"
                  placeholder="Buscar"
                />

              </div>
            </form>


            {/* =====================================
                AÇÕES DO HEADER
            ====================================== */}

            <div className="header-actions">

              {/* ==============================
                  NOTIFICAÇÕES
              =============================== */}

              <button
                type="button"
                className="header-action"
                title="Notificações"
                onClick={abrirNotificacoes}
              >
                <i className="bi bi-bell-fill"></i>

                {notificacoes.length > 0 && (
                  <span className="notification-badge">
                    {notificacoes.length}
                  </span>
                )}
              </button>


              {/* ==============================
                  CARRINHO
              =============================== */}

              <button
                type="button"
                className="header-action cart-header-button"
                title="Carrinho"
                onClick={() => {
                  setCarrinhoAberto(true);
                  setNotificacoesAberto(false);
                  setLocalizacaoAberto(false);
                  setPerfilAberto(false);
                }}
              >
                <i className="bi bi-cart"></i>

                {produtosCarrinho.length > 0 && (
                  <span className="cart-badge">
                    {produtosCarrinho.length}
                  </span>
                )}
              </button>


              {/* ==============================
                  LOCALIZAÇÃO
              =============================== */}

              <button
                type="button"
                className="header-action"
                title="Localização"
                onClick={abrirLocalizacao}
              >
                <i className="bi bi-geo-alt-fill"></i>
              </button>


              {/* ==============================
                  PERFIL
              =============================== */}

              <button
                type="button"
                className="header-action"
                title="Informações pessoais"
                onClick={abrirPerfil}
              >
                <i className="bi bi-person-fill"></i>
              </button>

            </div>

          </div>
        </div>
      </nav>


      {/* =====================================
          PAINEL DE NOTIFICAÇÕES
      ====================================== */}

      {notificacoesAberto && (
        <div className="header-panel notification-panel">

          <div className="panel-header">
            <div>
              <h3>
                <i className="bi bi-bell-fill"></i>
                Notificações
              </h3>

              <span>
                {notificacoes.length} notificações
              </span>
            </div>

            <button
              type="button"
              onClick={() => setNotificacoesAberto(false)}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>


          {/* Lista de notificações */}

          <div className="notification-list">

            {notificacoes.length === 0 ? (

              <div className="notification-empty">
                <i className="bi bi-bell-slash"></i>

                <p>
                  Você não possui novas notificações.
                </p>
              </div>

            ) : (

              notificacoes.map((notificacao) => (

                <div
                  className="notification-item"
                  key={notificacao.id}
                >
                  <div className="notification-icon">
                    <i className="bi bi-info-circle"></i>
                  </div>

                  <div>
                    <strong>
                      {notificacao.titulo}
                    </strong>

                    <p>
                      {notificacao.mensagem}
                    </p>

                    <small>
                      {notificacao.tempo}
                    </small>
                  </div>
                </div>

              ))

            )}

          </div>


          {/* Configurações */}

          <div className="notification-settings">

            <h4>
              Preferências
            </h4>

            <label>
              <span>
                Avisos sobre pedidos
              </span>

              <input
                type="checkbox"
                checked={configNotificacoes.pedidos}
                onChange={() =>
                  alterarNotificacao("pedidos")
                }
              />
            </label>

            <label>
              <span>
                Promoções
              </span>

              <input
                type="checkbox"
                checked={configNotificacoes.promocoes}
                onChange={() =>
                  alterarNotificacao("promocoes")
                }
              />
            </label>

            <label>
              <span>
                Novidades da loja
              </span>

              <input
                type="checkbox"
                checked={configNotificacoes.novidades}
                onChange={() =>
                  alterarNotificacao("novidades")
                }
              />
            </label>

          </div>


          {notificacoes.length > 0 && (
            <button
              type="button"
              className="panel-secondary-button"
              onClick={limparNotificacoes}
            >
              Marcar todas como lidas
            </button>
          )}

        </div>
      )}


      {/* =====================================
          PAINEL DE LOCALIZAÇÃO
      ====================================== */}

      {localizacaoAberto && (
        <div className="header-panel location-panel">

          <div className="panel-header">

            <div>
              <h3>
                <i className="bi bi-geo-alt-fill"></i>
                Minha localização
              </h3>

              <span>
                Endereço para entrega
              </span>
            </div>

            <button
              type="button"
              onClick={() => setLocalizacaoAberto(false)}
            >
              <i className="bi bi-x"></i>
            </button>

          </div>


          <form onSubmit={salvarLocalizacao}>

            <div className="panel-field">

              <label>
                Rua
              </label>

              <input
                type="text"
                name="rua"
                value={localizacao.rua}
                onChange={alterarLocalizacao}
              />

            </div>


            <div className="panel-row">

              <div className="panel-field">

                <label>
                  Número
                </label>

                <input
                  type="text"
                  name="numero"
                  value={localizacao.numero}
                  onChange={alterarLocalizacao}
                />

              </div>

              <div className="panel-field">

                <label>
                  CEP
                </label>

                <input
                  type="text"
                  name="cep"
                  value={localizacao.cep}
                  onChange={alterarLocalizacao}
                />

              </div>

            </div>


            <div className="panel-row">

              <div className="panel-field">

                <label>
                  Cidade
                </label>

                <input
                  type="text"
                  name="cidade"
                  value={localizacao.cidade}
                  onChange={alterarLocalizacao}
                />

              </div>

              <div className="panel-field">

                <label>
                  Estado
                </label>

                <input
                  type="text"
                  name="estado"
                  value={localizacao.estado}
                  onChange={alterarLocalizacao}
                />

              </div>

            </div>


            <button
              type="submit"
              className="panel-save-button"
            >
              <i className="bi bi-check-lg"></i>
              Salvar localização
            </button>

          </form>

        </div>
      )}


      {/* =====================================
          PAINEL DE PERFIL
      ====================================== */}

      {perfilAberto && (
        <div className="header-panel profile-panel">

          <div className="panel-header">

            <div>
              <h3>
                <i className="bi bi-person-fill"></i>
                Informações pessoais
              </h3>

              <span>
                Atualize seus dados pessoais
              </span>
            </div>

            <button
              type="button"
              onClick={() => setPerfilAberto(false)}
            >
              <i className="bi bi-x"></i>
            </button>

          </div>


          <form onSubmit={salvarPerfil}>

            <div className="panel-field">

              <label>
                Nome completo
              </label>

              <input
                type="text"
                name="nome"
                value={perfil.nome}
                onChange={alterarPerfil}
              />

            </div>


            <div className="panel-field">

              <label>
                E-mail
              </label>

              <input
                type="email"
                name="email"
                value={perfil.email}
                onChange={alterarPerfil}
              />

            </div>


            <div className="panel-field">

              <label>
                Telefone
              </label>

              <input
                type="text"
                name="telefone"
                value={perfil.telefone}
                onChange={alterarPerfil}
              />

            </div>


            <button
              type="submit"
              className="panel-save-button"
            >
              <i className="bi bi-check-lg"></i>
              Salvar informações
            </button>

          </form>

        </div>
      )}


      {/* =====================================
          FUNDO ESCURO DO CARRINHO
      ====================================== */}

      {carrinhoAberto && (
        <div
          className="cart-overlay"
          onClick={() => setCarrinhoAberto(false)}
        />
      )}


      {/* =====================================
          CARRINHO LATERAL
      ====================================== */}

      <aside
        className={`cart-modal ${
          carrinhoAberto ? "cart-open" : ""
        }`}
      >

        <div className="cart-header">

          <div>

            <h2>
              <i className="bi bi-cart3"></i>
              Meu carrinho
            </h2>

            <span>
              {produtosCarrinho.length} produtos
            </span>

          </div>

          <button
            type="button"
            className="cart-close"
            onClick={() => setCarrinhoAberto(false)}
          >
            <i className="bi bi-x-lg"></i>
          </button>

        </div>


        <div className="cart-products">

          {produtosCarrinho.length === 0 ? (

            <div className="cart-empty">

              <i className="bi bi-cart-x"></i>

              <h3>
                Seu carrinho está vazio
              </h3>

              <p>
                Adicione produtos para começar.
              </p>

            </div>

          ) : (

            produtosCarrinho.map((produto) => (

              <div
                className="cart-product"
                key={produto.id}
              >

                <div className="cart-product-image">

                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                  />

                </div>


                <div className="cart-product-info">

                  <h3>
                    {produto.nome}
                  </h3>

                  <span className="cart-size">
                    Tamanho: {produto.tamanho}
                  </span>

                  <div className="cart-product-bottom">

                    <div className="cart-quantity">

                      <button
                        type="button"
                        onClick={() =>
                          diminuirQuantidade(produto.id)
                        }
                      >
                        −
                      </button>

                      <span>
                        {produto.quantidade}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          aumentarQuantidade(produto.id)
                        }
                      >
                        +
                      </button>

                    </div>

                    <strong>
                      R${" "}
                      {(
                        produto.preco *
                        produto.quantidade
                      )
                        .toFixed(2)
                        .replace(".", ",")}
                    </strong>

                  </div>

                </div>


                <button
                  type="button"
                  className="cart-remove"
                  title="Remover"
                  onClick={() =>
                    removerProduto(produto.id)
                  }
                >
                  <i className="bi bi-trash3"></i>
                </button>

              </div>

            ))

          )}

        </div>


        {produtosCarrinho.length > 0 && (

          <div className="cart-footer">

            <div className="cart-total">

              <span>
                Total
              </span>

              <strong>
                R${" "}
                {total
                  .toFixed(2)
                  .replace(".", ",")}
              </strong>

            </div>

            <button
              type="button"
              className="cart-checkout"
            >
              Finalizar compra

              <i className="bi bi-arrow-right"></i>
            </button>

            <button
              type="button"
              className="cart-continue"
              onClick={() =>
                setCarrinhoAberto(false)
              }
            >
              Continuar comprando
            </button>

          </div>

        )}

      </aside>
    </>
  );
}