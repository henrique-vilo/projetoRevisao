"use client";

import Image from "next/image";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./page.css";

const produtos = [
  {
    id: 1,
    nome: "Camiseta Oversized Essential",
    categoria: "Camisetas",
    preco: "R$ 89,90",
    imagem: "/produtos/camiseta-oversized.jpg",
  },
  {
    id: 2,
    nome: "Calça Cargo Urban",
    categoria: "Calças",
    preco: "R$ 159,90",
    imagem: "/produtos/calca-cargo.jpg",
  },
  {
    id: 3,
    nome: "Jaqueta Street Premium",
    categoria: "Jaquetas",
    preco: "R$ 249,90",
    imagem: "/produtos/jaqueta.jpg",
  },
  {
    id: 4,
    nome: "Moletom Classic",
    categoria: "Moletons",
    preco: "R$ 179,90",
    imagem: "/produtos/moletom.jpg",
  },
  {
    id: 5,
    nome: "Camiseta Basic Blue",
    categoria: "Camisetas",
    preco: "R$ 79,90",
    imagem: "/produtos/camiseta-blue.jpg",
  },
  {
    id: 6,
    nome: "Bermuda Cargo Black",
    categoria: "Bermudas",
    preco: "R$ 119,90",
    imagem: "/produtos/bermuda.jpg",
  },
  {
    id: 7,
    nome: "Camisa Social Slim",
    categoria: "Camisas",
    preco: "R$ 139,90",
    imagem: "/produtos/camisa-social.jpg",
  },
  {
    id: 8,
    nome: "Calça Jeans Straight",
    categoria: "Calças",
    preco: "R$ 189,90",
    imagem: "/produtos/calca-jeans.jpg",
  },
];

export default function Masculino() {
  return (
    <main className="masculino-page">

      {/* CABEÇALHO */}
      <section className="masculino-header">
        <div className="container">

          <span className="section-label">
            COLEÇÃO FEMININA
          </span>

          <h1>
            Moda <span>Feminina</span>
          </h1>

          <p>
            Encontre peças que combinam com seu estilo.
          </p>

        </div>
      </section>

      {/* FILTROS */}
      <section className="filters-section">
        <div className="container">

          <div className="filters-top">

            <div className="filter-title">
              <i className="bi bi-sliders"></i>
              <span>Filtros</span>
            </div>

            <button className="clear-filters">
              Limpar filtros
            </button>

          </div>

          <div className="filters">

            <div className="filter-group">
              <label>Categoria</label>

              <select>
                <option>Todas</option>
                <option>Camisetas</option>
                <option>Camisas</option>
                <option>Calças</option>
                <option>Bermudas</option>
                <option>Jaquetas</option>
                <option>Moletons</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Tamanho</label>

              <select>
                <option>Todos</option>
                <option>PP</option>
                <option>P</option>
                <option>M</option>
                <option>G</option>
                <option>GG</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Cor</label>

              <select>
                <option>Todas</option>
                <option>Preto</option>
                <option>Branco</option>
                <option>Azul</option>
                <option>Cinza</option>
                <option>Verde</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Preço</label>

              <select>
                <option>Todos</option>
                <option>Até R$ 100</option>
                <option>R$ 100 - R$ 200</option>
                <option>R$ 200 - R$ 300</option>
                <option>Acima de R$ 300</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Ordenar por</label>

              <select>
                <option>Mais recentes</option>
                <option>Menor preço</option>
                <option>Maior preço</option>
                <option>Mais vendidos</option>
              </select>
            </div>

          </div>
        </div>
      </section>

      {/* PRODUTOS */}
      <section className="products-section">
        <div className="container">

          <div className="products-heading">
            <div>
              <h2>Produtos masculinos</h2>
              <p>{produtos.length} produtos encontrados</p>
            </div>
          </div>

          <div className="products-grid">

            {produtos.map((produto) => (
              <article className="product-card" key={produto.id}>

                <div className="product-image">

                  <Image
                    src={produto.imagem}
                    alt={produto.nome}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />

                  <button
                    className="favorite-button"
                    aria-label="Adicionar aos favoritos"
                  >
                    <i className="bi bi-heart"></i>
                  </button>

                  <span className="product-tag">
                    NOVO
                  </span>

                </div>

                <div className="product-info">

                  <span className="product-category">
                    {produto.categoria}
                  </span>

                  <h3>{produto.nome}</h3>

                  <div className="product-bottom">

                    <strong>{produto.preco}</strong>

                    <button className="add-button">
                      <i className="bi bi-bag-plus"></i>
                    </button>

                  </div>

                </div>

              </article>
            ))}

          </div>

        </div>
      </section>

    </main>
  );
}