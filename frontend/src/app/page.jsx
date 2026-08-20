"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

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
      descricao:
        "Jaqueta moderna e confortável para os dias mais frios.",
      imagem: "/jaqueta.jpg",
      categoria: "Inverno",
    },
    {
      nome: "Camiseta Premium",
      descricao:
        "Camiseta de alta qualidade com tecido confortável e acabamento sofisticado.",
      imagem: "/camisetapremium.jpg",
      categoria: "Casual",
    },
    {
      nome: "Calça Cargo",
      descricao:
        "Calça versátil com design moderno, ideal para compor diferentes estilos.",
      imagem: "/cargo.png",
      categoria: "Streetwear",
    },
  ];

  return (
    <main>

      {/* =========================
          CARROSSEL
      ========================== */}

      <Link
        href="/produtos"
        className="carousel-link"
        aria-label="Ver produtos"
      >
        <div
          id="carouselExampleAutoplaying"
          className="carousel slide"
          data-bs-ride="carousel"
          data-bs-interval="5000"
        >
          <div className="carousel-inner">

            {/* IMAGEM 1 */}
            <div className="carousel-item active">
              <img
                src="/inverno.jpg"
                className="d-block w-100"
                alt="Coleção de roupas"
              />
            </div>

            {/* IMAGEM 2 */}
            <div className="carousel-item">
              <img
                src="/imagem2.png"
                className="d-block w-100"
                alt="Nova coleção"
              />
            </div>

            {/* IMAGEM 3 */}
            <div className="carousel-item">
              <img
                src="/imagem3.png"
                className="d-block w-100"
                alt="Produtos em destaque"
              />
            </div>

          </div>

          {/* BOTÃO ANTERIOR */}
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#carouselExampleAutoplaying"
            data-bs-slide="prev"
            onClick={(event) => event.preventDefault()}
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>

            <span className="visually-hidden">
              Anterior
            </span>
          </button>

          {/* BOTÃO PRÓXIMO */}
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#carouselExampleAutoplaying"
            data-bs-slide="next"
            onClick={(event) => event.preventDefault()}
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
            ></span>

            <span className="visually-hidden">
              Próximo
            </span>
          </button>

        </div>
      </Link>


      {/* =========================
          PRODUTOS EM DESTAQUE
      ========================== */}

      <section className="produtos-destaque">

        {/* TÍTULO */}

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


        {/* PRODUTOS */}

        <div className="container">

          <div className="row g-4 justify-content-center">

            {produtos.map((produto, index) => (

              <div
                className="col-12 col-md-6 col-lg-4"
                key={index}
              >

                <div className="produto-card">

                  {/* IMAGEM DO PRODUTO */}

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


                  {/* CONTEÚDO DO PRODUTO */}

                  <div className="produto-conteudo">

                    <h3>
                      {produto.nome}
                    </h3>

                    <p>
                      {produto.descricao}
                    </p>

                    <button
                      className="produto-botao"
                      type="button"
                    >
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


      {/* =========================
          CATEGORIAS
      ========================== */}

      <section className="categorias-section">

        {/* TÍTULO */}

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


        {/* CATEGORIAS */}

        <div className="container">

          <div className="row g-4">


            {/* =========================
                CAMISETAS
            ========================== */}

            <div className="col-12 col-sm-6 col-lg-3">

              <div className="categoria-card">

                <img
                  src="/camisetas.jpg"
                  alt="Camisetas"
                />

                <div className="categoria-overlay">

                  <h3>
                    Camisetas
                  </h3>

                  <span>
                    Ver coleção{" "}
                    <i className="bi bi-arrow-right"></i>
                  </span>

                </div>

              </div>

            </div>


            {/* =========================
                CALÇAS
            ========================== */}

            <div className="col-12 col-sm-6 col-lg-3">

              <div className="categoria-card">

                <img
                  src="/calças.jpg"
                  alt="Calças"
                />

                <div className="categoria-overlay">

                  <h3>
                    Calças
                  </h3>

                  <span>
                    Ver coleção{" "}
                    <i className="bi bi-arrow-right"></i>
                  </span>

                </div>

              </div>

            </div>


            {/* =========================
                JAQUETAS
            ========================== */}

            <div className="col-12 col-sm-6 col-lg-3">

              <div className="categoria-card">

                <img
                  src="/jaquetass.jpg"
                  alt="Jaquetas"
                />

                <div className="categoria-overlay">

                  <h3>
                    Jaquetas
                  </h3>

                  <span>
                    Ver coleção{" "}
                    <i className="bi bi-arrow-right"></i>
                  </span>

                </div>

              </div>

            </div>


            {/* =========================
                ACESSÓRIOS
            ========================== */}

            <div className="col-12 col-sm-6 col-lg-3">

              <div className="categoria-card">

                <img
                  src="/acessorios.jpg"
                  alt="Acessórios"
                />

                <div className="categoria-overlay">

                  <h3>
                    Acessórios
                  </h3>

                  <span>
                    Ver coleção{" "}
                    <i className="bi bi-arrow-right"></i>
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}