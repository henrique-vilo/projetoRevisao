"use client";

import { useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./page.css";

export default function Home() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  const produtos = [
  {
    nome: "Jaqueta Urbana",
    descricao: "Jaqueta moderna e confortável para os dias mais frios.",
    imagem: "/jaqueta.png",
    categoria: "Inverno",
  },
  {
    nome: "Camiseta Premium",
    descricao: "Camiseta de alta qualidade com tecido confortável e acabamento sofisticado.",
    imagem: "/camiseta.png",
    categoria: "Casual",
  },
  {
    nome: "Calça Cargo",
    descricao: "Calça versátil com design moderno, ideal para compor diferentes estilos.",
    imagem: "/calca.png",
    categoria: "Streetwear",
  },
];

  return (
    <main>

      {/* CARROSSEL */}
      <div
        id="carouselExampleAutoplaying"
        className="carousel slide"
        data-bs-ride="carousel"
        data-bs-interval="5000"
      >
        <div className="carousel-inner">

          <div className="carousel-item active">
            <img
              src="/imagem1.png"
              className="d-block w-100"
              alt="Imagem 1"
            />
          </div>

          <div className="carousel-item">
            <img
              src="/imagem2.png"
              className="d-block w-100"
              alt="Imagem 2"
            />
          </div>

          <div className="carousel-item">
            <img
              src="/imagem3.png"
              className="d-block w-100"
              alt="Imagem 3"
            />
          </div>

        </div>

        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#carouselExampleAutoplaying"
          data-bs-slide="prev"
        >
          <span
            className="carousel-control-prev-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Anterior</span>
        </button>

        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#carouselExampleAutoplaying"
          data-bs-slide="next"
        >
          <span
            className="carousel-control-next-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Próximo</span>
        </button>
      </div>


      {/* PRODUTOS EM DESTAQUE */}
      <section className="produtos-destaque">

        <div className="destaque-header">
          <span className="destaque-linha"></span>

          <div>
            <p className="destaque-subtitulo">
              NOSSA SELEÇÃO
            </p>

            <h2>
              Produtos em <span>destaque</span>
            </h2>
          </div>

          <span className="destaque-linha"></span>
        </div>


        <div className="container">
          <div className="row g-4 justify-content-center">

            {produtos.map((produto, index) => (
              <div
                className="col-12 col-md-6 col-lg-4"
                key={index}
              >
                <div className="produto-card">

                  <div className="produto-imagem">
                    <Image
                      src={produto.imagem}
                      alt={produto.nome}
                      width={500}
                      height={350}
                    />

                    <span className="produto-categoria">
                      {produto.categoria}
                    </span>
                  </div>

                  <div className="produto-conteudo">

                    <h3>{produto.nome}</h3>

                    <p>
                      {produto.descricao}
                    </p>

                    <button className="produto-botao">
                      Ver produto
                      <i className="bi bi-arrow-right"></i>
                    </button>

                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>

      </section>




      {/* CATEGORIAS */}
<section className="categorias-section">

  <div className="destaque-header">
    <span className="destaque-linha"></span>

    <div>
      <p className="destaque-subtitulo">
        ENCONTRE SEU ESTILO
      </p>

      <h2>
        Compre por <span>categoria</span>
      </h2>
    </div>

    <span className="destaque-linha"></span>
  </div>

  <div className="container">
    <div className="row g-4">

      <div className="col-12 col-sm-6 col-lg-3">
        <div className="categoria-card">
          <img src="/categoria-camisetas.png" alt="Camisetas" />
          <div className="categoria-overlay">
            <h3>Camisetas</h3>
            <span>Ver coleção <i className="bi bi-arrow-right"></i></span>
          </div>
        </div>
      </div>

      <div className="col-12 col-sm-6 col-lg-3">
        <div className="categoria-card">
          <img src="/categoria-calcas.png" alt="Calças" />
          <div className="categoria-overlay">
            <h3>Calças</h3>
            <span>Ver coleção <i className="bi bi-arrow-right"></i></span>
          </div>
        </div>
      </div>

      <div className="col-12 col-sm-6 col-lg-3">
        <div className="categoria-card">
          <img src="/categoria-jaquetas.png" alt="Jaquetas" />
          <div className="categoria-overlay">
            <h3>Jaquetas</h3>
            <span>Ver coleção <i className="bi bi-arrow-right"></i></span>
          </div>
        </div>
      </div>

      <div className="col-12 col-sm-6 col-lg-3">
        <div className="categoria-card">
          <img src="/categoria-acessorios.png" alt="Acessórios" />
          <div className="categoria-overlay">
            <h3>Acessórios</h3>
            <span>Ver coleção <i className="bi bi-arrow-right"></i></span>
          </div>
        </div>
      </div>

    </div>
  </div>

</section>

    </main>
  );
}
