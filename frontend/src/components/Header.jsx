"use client";

import { useState } from "react";
import "./Header.css";
import Link from "next/link";

export default function Header() {
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  // Produtos temporários apenas para testar o carrinho
  const produtosCarrinho = [
    {
      id: 1,
      nome: "Jaqueta de Inverno",
      tamanho: "M",
      preco: 189.9,
      quantidade: 1,
      imagem: "/jaqueta.jpg",
    },
    {
      id: 2,
      nome: "Moletom Azul",
      tamanho: "G",
      preco: 129.9,
      quantidade: 2,
      imagem: "/moletom.jpg",
    },
  ];

  const total = produtosCarrinho.reduce(
    (soma, produto) =>
      soma + produto.preco * produto.quantidade,
    0
  );

  return (
    <>
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

            {/* Menu */}
            <ul className="navbar-nav">

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

              <li className="nav-item">
                <Link
                  className="nav-link"
                  href="/masculino"
                >
                  Masculino
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className="nav-link"
                  href="/feminino"
                >
                  Feminino
                </Link>
              </li>

            </ul>


            {/* Barra de pesquisa */}
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


            {/* Ações do Header */}
            <div className="header-actions">

              {/* Perfil */}
              <a
                href="#"
                className="header-action"
                title="Perfil"
              >
                <i className="bi bi-person-fill"></i>
              </a>


              {/* Carrinho */}
              <button
                type="button"
                className="header-action cart-header-button"
                title="Carrinho"
                onClick={() => setCarrinhoAberto(true)}
              >
                <i className="bi bi-cart"></i>

                {produtosCarrinho.length > 0 && (
                  <span className="cart-badge">
                    {produtosCarrinho.length}
                  </span>
                )}
              </button>


              {/* Localização */}
              <a
                href="#"
                className="header-action"
                title="Localização"
              >
                <i className="bi bi-geo-alt-fill"></i>
              </a>

            </div>

          </div>
        </div>
      </nav>


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

        {/* Cabeçalho */}
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


        {/* Produtos */}
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

                {/* Imagem */}
                <div className="cart-product-image">

                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                  />

                </div>


                {/* Informações */}
                <div className="cart-product-info">

                  <h3>
                    {produto.nome}
                  </h3>

                  <span className="cart-size">
                    Tamanho: {produto.tamanho}
                  </span>


                  <div className="cart-product-bottom">

                    {/* Quantidade */}
                    <div className="cart-quantity">

                      <button type="button">
                        −
                      </button>

                      <span>
                        {produto.quantidade}
                      </span>

                      <button type="button">
                        +
                      </button>

                    </div>


                    {/* Preço */}
                    <strong>
                      R${" "}
                      {(produto.preco * produto.quantidade)
                        .toFixed(2)
                        .replace(".", ",")}
                    </strong>

                  </div>

                </div>


                {/* Remover */}
                <button
                  type="button"
                  className="cart-remove"
                  title="Remover"
                >
                  <i className="bi bi-trash3"></i>
                </button>

              </div>

            ))

          )}

        </div>


        {/* Rodapé */}
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
              onClick={() => setCarrinhoAberto(false)}
            >
              Continuar comprando
            </button>

          </div>

        )}

      </aside>
    </>
  );
}