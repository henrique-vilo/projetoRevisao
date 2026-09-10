"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, MotionConfig } from "motion/react";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./page.css";

// -----------------------------------------------------------------------
// ANIMAÇÕES
// -----------------------------------------------------------------------

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const cardItem = {
  hidden: {
    opacity: 0,
    y: 36,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// -----------------------------------------------------------------------
// API
// -----------------------------------------------------------------------

const API_ORIGIN = "http://localhost:3001";
const API_PRODUTOS = `${API_ORIGIN}/api/produtos`;

// -----------------------------------------------------------------------
// CATEGORIAS COM MAIS PRODUTOS
//
// Categoria 9  = 11 produtos
// Categoria 41 = 4 produtos
// Categoria 13 = 4 produtos
// Categoria 32 = 4 produtos
// -----------------------------------------------------------------------

const CATEGORIAS_DESTAQUE = [
  {
    id: 9,
    nome: "Moda Feminina",
    imagem: "/modafem.jpg",
    quantidade: 11,
  },
  {
    id: 41,
    nome: "Jeans",
    imagem: "/modamas.jpg",
    quantidade: 4,
  },
  {
    id: 13,
    nome: "Alfaiataria",
    imagem: "/invernomoda.jpg",
    quantidade: 4,
  },
  {
    id: 32,
    nome: "Casual",
    imagem: "/modaesporte.jpg",
    quantidade: 4,
  },
];

// -----------------------------------------------------------------------
// RESOLVE IMAGEM
// -----------------------------------------------------------------------

function resolverImagemUrl(caminho) {
  if (!caminho) {
    return "/imagem3.png";
  }

  if (/^https?:\/\//i.test(caminho)) {
    return caminho;
  }

  return `${API_ORIGIN}/${String(caminho).replace(/^\/+/, "")}`;
}

// -----------------------------------------------------------------------
// FORMATA PREÇO
// -----------------------------------------------------------------------

function formatarPreco(valor) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return "";
  }

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// -----------------------------------------------------------------------
// MAPEA PRODUTO
// -----------------------------------------------------------------------

function mapearProdutoParaCard(produto) {
  return {
    id: produto.idProduto,
    nome: produto.nomeCombinacao || produto.nome,
    preco: formatarPreco(produto.preco),
    imagem: resolverImagemUrl(produto.imagem1),
  };
}

// -----------------------------------------------------------------------
// BUSCA PRODUTOS POR ID DA CATEGORIA
// -----------------------------------------------------------------------

async function buscarProdutosPorCategoria(idCategoria, limite = 4) {
  const parametros = new URLSearchParams({
    idCategoria: String(idCategoria),
    limite: String(limite),
    ordenarPor: "recente",
    agrupar: "true",
    emEstoque: "true",
  });

  const url = `${API_PRODUTOS}?${parametros.toString()}`;

  console.log(
    `Buscando produtos da categoria ${idCategoria}:`,
    url
  );

  try {
    const resposta = await fetch(url, {
      cache: "no-store",
    });

    const json = await resposta.json();

    console.log(
      `Resposta categoria ${idCategoria}:`,
      json
    );

    if (!resposta.ok || !json?.sucesso) {
      console.error(
        `Erro ao buscar produtos da categoria ${idCategoria}:`,
        json?.erro
      );

      return [];
    }

    return (json.dados || []).map(mapearProdutoParaCard);
  } catch (error) {
    console.error(
      `Falha na requisição da categoria ${idCategoria}:`,
      error
    );

    return [];
  }
}

// -----------------------------------------------------------------------
// HOME
// -----------------------------------------------------------------------

export default function Home() {
  const router = useRouter();

  const [verificandoPerfil, setVerificandoPerfil] =
    useState(true);

  const [showScrollTop, setShowScrollTop] =
    useState(false);

  const [activeSlide, setActiveSlide] =
    useState(0);

  const [produtosCategoria9, setProdutosCategoria9] =
    useState([]);

  const [produtosCategoria41, setProdutosCategoria41] =
    useState([]);

  const [produtosCategoria13, setProdutosCategoria13] =
    useState([]);

  const [produtosCategoria32, setProdutosCategoria32] =
    useState([]);

  const [carregandoProdutos, setCarregandoProdutos] =
    useState(true);

  // ---------------------------------------------------------------------
  // VERIFICA PERFIL
  // ---------------------------------------------------------------------

  useEffect(() => {
    try {
      const usuarioSalvo =
        window.localStorage.getItem("usuario");

      if (usuarioSalvo) {
        const usuario = JSON.parse(usuarioSalvo);

        const tipoUsuario =
          usuario?.tipo ??
          usuario?.user?.tipo;

        if (
          tipoUsuario?.toLowerCase() === "admin"
        ) {
          router.replace("/admin/dashboard");
          return;
        }
      }
    } catch (error) {
      console.error(
        "Não foi possível verificar o perfil do usuário:",
        error
      );
    }

    setVerificandoPerfil(false);
  }, [router]);

  // ---------------------------------------------------------------------
  // BOOTSTRAP + SCROLL + CAROUSEL
  // ---------------------------------------------------------------------

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    const carouselEl =
      document.getElementById("heroCarousel");

    const handleSlide = (event) => {
      setActiveSlide(event.to);
    };

    carouselEl?.addEventListener(
      "slid.bs.carousel",
      handleSlide
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      carouselEl?.removeEventListener(
        "slid.bs.carousel",
        handleSlide
      );
    };
  }, []);

  // ---------------------------------------------------------------------
  // CARREGA AS CATEGORIAS
  // ---------------------------------------------------------------------

  useEffect(() => {
    let cancelado = false;

    async function carregarProdutosHome() {
      setCarregandoProdutos(true);

      const [
        categoria9,
        categoria41,
        categoria13,
        categoria32,
      ] = await Promise.all([
        buscarProdutosPorCategoria(9),
        buscarProdutosPorCategoria(41),
        buscarProdutosPorCategoria(13),
        buscarProdutosPorCategoria(32),
      ]);

      if (cancelado) {
        return;
      }

      setProdutosCategoria9(categoria9);
      setProdutosCategoria41(categoria41);
      setProdutosCategoria13(categoria13);
      setProdutosCategoria32(categoria32);

      setCarregandoProdutos(false);
    }

    carregarProdutosHome();

    return () => {
      cancelado = true;
    };
  }, []);

  // ---------------------------------------------------------------------
  // VOLTAR AO TOPO
  // ---------------------------------------------------------------------

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ---------------------------------------------------------------------
  // RENDERIZA PRODUTOS
  // ---------------------------------------------------------------------

  function renderGradeProdutos(produtos) {
    if (carregandoProdutos) {
      return (
        <div className="text-center text-muted py-4">
          Carregando produtos...
        </div>
      );
    }

    if (!produtos || produtos.length === 0) {
      return (
        <div className="text-center text-muted py-4">
          Nenhum produto encontrado nesta categoria no momento.
        </div>
      );
    }

    return (
      <motion.div
        className="row g-4"
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.1,
        }}
        variants={staggerContainer}
      >
        {produtos.map((prod) => (
          <div
            className="col-12 col-sm-6 col-md-3"
            key={prod.id}
          >
            <Link
              href={`/produtos/${prod.id}`}
              className="text-decoration-none text-dark d-block h-100"
            >
              <motion.div
                className="product-card-clean h-100"
                variants={cardItem}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
              >
                <div
                  className="product-image-box"
                  style={{
                    overflow: "hidden",
                  }}
                >
                  <motion.img
                    src={prod.imagem}
                    alt={prod.nome}
                    whileHover={{
                      scale: 1.08,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: "easeOut",
                    }}
                  />
                </div>

                <div className="product-details">
                  <h3 className="product-title">
                    {prod.nome}
                  </h3>

                  <div className="product-price-row">
                    <span className="price-current">
                      {prod.preco}
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        ))}
      </motion.div>
    );
  }

  // ---------------------------------------------------------------------
  // RENDERIZA SECTION
  // ---------------------------------------------------------------------

  function renderSectionCategoria({
    categoria,
    produtos,
    classe,
  }) {
    return (
      <section
        className={`${classe} py-5`}
      >
        <div className="container-fluid px-md-5">

          <div className="d-flex align-items-center justify-content-between mb-4">

            <Link
              href={`/produtos?idCategoria=${categoria.id}`}
              className="text-decoration-none text-dark"
            >
              <motion.h2
                className="section-title-left margin-0"
                initial={{
                  opacity: 0,
                  x: -40,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.6,
                }}
                transition={{
                  duration: 0.6,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}
              >
                {categoria.nome}
              </motion.h2>
            </Link>

            <Link
              href={`/produtos?idCategoria=${categoria.id}`}
              className="link-ver-todos"
            >
              <motion.span
                initial={{
                  opacity: 0,
                  x: 40,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.6,
                }}
                transition={{
                  duration: 0.6,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}
                whileHover={{
                  x: 4,
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Ver Coleção
                <i className="bi bi-arrow-right ms-1" />
              </motion.span>
            </Link>

          </div>

          {renderGradeProdutos(produtos)}

        </div>
      </section>
    );
  }

  // ---------------------------------------------------------------------
  // VERIFICAÇÃO
  // ---------------------------------------------------------------------

  if (verificandoPerfil) {
    return null;
  }

  // ---------------------------------------------------------------------
  // RETURN
  // ---------------------------------------------------------------------

  return (
    <MotionConfig reducedMotion="user">
      <main className="home-container">

        {/* ============================================================= */}
        {/* HERO */}
        {/* ============================================================= */}

        <motion.section
          className="hero-section"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.7,
          }}
        >
          <div
            id="heroCarousel"
            className="carousel slide"
            data-bs-ride="carousel"
            data-bs-interval="5000"
          >

            <div className="carousel-indicators">

              <motion.button
                type="button"
                data-bs-target="#heroCarousel"
                data-bs-slide-to="0"
                className="active"
                aria-current="true"
                aria-label="Slide 1"
                whileHover={{
                  scale: 1.3,
                }}
                whileTap={{
                  scale: 0.9,
                }}
              />

              <motion.button
                type="button"
                data-bs-target="#heroCarousel"
                data-bs-slide-to="1"
                aria-label="Slide 2"
                whileHover={{
                  scale: 1.3,
                }}
                whileTap={{
                  scale: 0.9,
                }}
              />

              <motion.button
                type="button"
                data-bs-target="#heroCarousel"
                data-bs-slide-to="2"
                aria-label="Slide 3"
                whileHover={{
                  scale: 1.3,
                }}
                whileTap={{
                  scale: 0.9,
                }}
              />

            </div>

            <div className="carousel-inner">

              {/* ------------------------------------------------------- */}
              {/* SLIDE 1 */}
              {/* ------------------------------------------------------- */}

              <div className="carousel-item active">
                <div className="hero-slide-content">

                  <img
                    src="/inverno.jpg"
                    alt="Coleção de roupas"
                  />

                  <div className="hero-overlay">

                    <div className="container h-100">

                      <div className="row h-100 align-items-center">

                        <motion.div
                          className="col-12 col-md-8 text-start"
                          initial="hidden"
                          animate={
                            activeSlide === 0
                              ? "visible"
                              : "hidden"
                          }
                          variants={staggerContainer}
                        >

                          <motion.span
                            className="hero-subtitle"
                            variants={fadeUp}
                          >
                            DESTAQUES
                          </motion.span>

                          <motion.h1
                            className="hero-title"
                            variants={fadeUp}
                          >
                            os favoritos da
                            <br />
                            <strong>
                              temporada
                            </strong>
                          </motion.h1>

                          <motion.div
                            variants={fadeUp}
                            style={{
                              display:
                                "inline-block",
                            }}
                          >
                            <Link
                              href="/produtos"
                              className="btn-hero-pill"
                            >
                              <motion.span
                                style={{
                                  display:
                                    "inline-block",
                                }}
                                whileHover={{
                                  scale: 1.06,
                                }}
                                whileTap={{
                                  scale: 0.94,
                                }}
                              >
                                Conferir Produtos
                              </motion.span>
                            </Link>
                          </motion.div>

                        </motion.div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------- */}
              {/* SLIDE 2 */}
              {/* ------------------------------------------------------- */}

              <div className="carousel-item">
                <div className="hero-slide-content">

                  <img
                    src="/imagem2.png"
                    alt="Categorias em destaque"
                  />

                  <div className="hero-overlay">

                    <div className="container h-100">

                      <div className="row h-100 align-items-center">

                        <motion.div
                          className="col-12 col-md-7 text-start"
                          initial="hidden"
                          animate={
                            activeSlide === 1
                              ? "visible"
                              : "hidden"
                          }
                          variants={
                            staggerContainer
                          }
                        >

                          <motion.span
                            className="hero-subtitle"
                            variants={fadeUp}
                          >
                            MAIS PROCURADOS
                          </motion.span>

                          <motion.h1
                            className="hero-title"
                            variants={fadeUp}
                          >
                            encontre seu
                            <br />
                            <strong>
                              novo estilo
                            </strong>
                          </motion.h1>

                          <motion.div
                            variants={fadeUp}
                            style={{
                              display:
                                "inline-block",
                            }}
                          >
                            <Link
                              href="/produtos"
                              className="btn-hero-pill"
                            >
                              <motion.span
                                style={{
                                  display:
                                    "inline-block",
                                }}
                                whileHover={{
                                  scale: 1.06,
                                }}
                                whileTap={{
                                  scale: 0.94,
                                }}
                              >
                                Explorar Coleção
                              </motion.span>
                            </Link>
                          </motion.div>

                        </motion.div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------- */}
              {/* SLIDE 3 */}
              {/* ------------------------------------------------------- */}

              <div className="carousel-item">
                <div className="hero-slide-content">

                  <img
                    src="/imagem3.png"
                    alt="Catálogo Geral"
                  />

                  <div className="hero-overlay">

                    <div className="container h-100">

                      <div className="row h-100 align-items-center">

                        <motion.div
                          className="col-12 col-md-7 text-start"
                          initial="hidden"
                          animate={
                            activeSlide === 2
                              ? "visible"
                              : "hidden"
                          }
                          variants={
                            staggerContainer
                          }
                        >

                          <motion.span
                            className="hero-subtitle"
                            variants={fadeUp}
                          >
                            NOVA COLEÇÃO
                          </motion.span>

                          <motion.h1
                            className="hero-title"
                            variants={fadeUp}
                          >
                            peças selecionadas
                            <br />
                            <strong>
                              para seu dia a dia
                            </strong>
                          </motion.h1>

                          <motion.div
                            variants={fadeUp}
                            style={{
                              display:
                                "inline-block",
                            }}
                          >
                            <Link
                              href="/produtos"
                              className="btn-hero-pill"
                            >
                              <motion.span
                                style={{
                                  display:
                                    "inline-block",
                                }}
                                whileHover={{
                                  scale: 1.06,
                                }}
                                whileTap={{
                                  scale: 0.94,
                                }}
                              >
                                Ver Produtos
                              </motion.span>
                            </Link>
                          </motion.div>

                        </motion.div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* CONTROLES */}

            <motion.button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#heroCarousel"
              data-bs-slide="prev"
              whileHover={{
                scale: 1.15,
              }}
              whileTap={{
                scale: 0.9,
              }}
            >
              <span
                className="carousel-control-prev-icon"
                aria-hidden="true"
              />

              <span className="visually-hidden">
                Anterior
              </span>
            </motion.button>

            <motion.button
              className="carousel-control-next"
              type="button"
              data-bs-target="#heroCarousel"
              data-bs-slide="next"
              whileHover={{
                scale: 1.15,
              }}
              whileTap={{
                scale: 0.9,
              }}
            >
              <span
                className="carousel-control-next-icon"
                aria-hidden="true"
              />

              <span className="visually-hidden">
                Próximo
              </span>
            </motion.button>

          </div>
        </motion.section>

        {/* ============================================================= */}
        {/* DIFERENCIAIS */}
        {/* ============================================================= */}

        <section className="features-bar">
          <div className="container">

            <motion.div
              className="row text-center gy-3"
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.5,
              }}
              variants={staggerContainer}
            >

              <motion.div
                className="col-12 col-md-4 feature-item"
                variants={fadeUp}
              >
                <motion.i
                  className="bi bi-box-seam me-2"
                  style={{
                    display: "inline-block",
                  }}
                  whileHover={{
                    scale: 1.25,
                    rotate: -8,
                  }}
                />

                <span>
                  Envio rápido e rastreado para todo o Brasil
                </span>
              </motion.div>

              <motion.div
                className="col-12 col-md-4 feature-item"
                variants={fadeUp}
              >
                <motion.i
                  className="bi bi-arrow-repeat me-2"
                  style={{
                    display: "inline-block",
                  }}
                  whileHover={{
                    scale: 1.25,
                    rotate: 180,
                  }}
                  transition={{
                    duration: 0.4,
                  }}
                />

                <span>
                  Primeira troca grátis em até 30 dias
                </span>
              </motion.div>

              <motion.div
                className="col-12 col-md-4 feature-item"
                variants={fadeUp}
              >
                <motion.i
                  className="bi bi-credit-card me-2"
                  style={{
                    display: "inline-block",
                  }}
                  whileHover={{
                    scale: 1.25,
                    rotate: 8,
                  }}
                />

                <span>
                  Parcele em até 6x sem juros no cartão
                </span>
              </motion.div>

            </motion.div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* CATEGORIAS EM DESTAQUE */}
        {/* ============================================================= */}

        <section className="para-ela-section py-5">

          <div className="container-fluid px-md-5">

            <motion.h2
              className="section-title-left mb-4"
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.6,
              }}
              transition={{
                duration: 0.5,
              }}
            >
              Categorias em Destaque
            </motion.h2>

            <motion.div
              className="row g-3 flex-nowrap overflow-auto scrollbar-hidden pb-3"
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.15,
              }}
              variants={staggerContainer}
            >

              {CATEGORIAS_DESTAQUE.map(
                (categoria) => (
                  <motion.div
                    className="col-8 col-sm-5 col-md-4 col-lg-3 flex-shrink-0"
                    key={categoria.id}
                    variants={cardItem}
                  >

                    <Link
                      href={`/produtos?idCategoria=${categoria.id}`}
                      className="categoria-card-vertical"
                    >

                      <div
                        className="categoria-img-wrapper"
                        style={{
                          overflow: "hidden",
                        }}
                      >

                        <motion.img
                          src={categoria.imagem}
                          alt={categoria.nome}
                          whileHover={{
                            scale: 1.1,
                          }}
                          transition={{
                            duration: 0.4,
                            ease: "easeOut",
                          }}
                        />

                        <div className="categoria-bottom-gradient">
                          <span className="categoria-title-text">
                            {categoria.nome}
                          </span>
                        </div>

                      </div>

                    </Link>

                  </motion.div>
                )
              )}

            </motion.div>

          </div>

        </section>

        {/* ============================================================= */}
        {/* CATEGORIA 9 */}
        {/* ============================================================= */}

        {renderSectionCategoria({
          categoria:
            CATEGORIAS_DESTAQUE[0],
          produtos:
            produtosCategoria9,
          classe:
            "novidades-section bg-light-clean",
        })}

        {/* ============================================================= */}
        {/* CATEGORIA 41 */}
        {/* ============================================================= */}

        {renderSectionCategoria({
          categoria:
            CATEGORIAS_DESTAQUE[1],
          produtos:
            produtosCategoria41,
          classe:
            "desejados-section",
        })}

        {/* ============================================================= */}
        {/* CATEGORIA 13 */}
        {/* ============================================================= */}

        {renderSectionCategoria({
          categoria:
            CATEGORIAS_DESTAQUE[2],
          produtos:
            produtosCategoria13,
          classe:
            "novidades-section bg-light-clean",
        })}

        {/* ============================================================= */}
        {/* CATEGORIA 32 */}
        {/* ============================================================= */}

        {renderSectionCategoria({
          categoria:
            CATEGORIAS_DESTAQUE[3],
          produtos:
            produtosCategoria32,
          classe:
            "desejados-section",
        })}

        {/* ============================================================= */}
        {/* BANNERS FINAIS */}
        {/* ============================================================= */}

        <section className="lookbook-section py-5 bg-light-clean">

          <div className="container-fluid px-md-5">

            <div className="row g-4">

              {/* ------------------------------------------------------- */}
              {/* BANNER MODA FEMININA */}
              {/* ------------------------------------------------------- */}

              <div className="col-12 col-md-6">

                <motion.div
                  className="lookbook-banner-card"
                  style={{
                    overflow: "hidden",
                  }}
                  initial={{
                    opacity: 0,
                    x: -50,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.3,
                  }}
                  transition={{
                    duration: 0.7,
                    ease: [
                      0.22,
                      1,
                      0.36,
                      1,
                    ],
                  }}
                >

                  <motion.img
                    src="/modafem.jpg"
                    alt="Moda Feminina"
                    whileHover={{
                      scale: 1.06,
                    }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                  />

                  <div className="lookbook-overlay">

                    <span className="lookbook-tag">
                      COLEÇÃO
                    </span>

                    <h3>
                      MODA FEMININA
                    </h3>

                    <p>
                      Modelagens modernas e cortes elegantes
                      para todas as ocasiões.
                    </p>

                    <Link
                      href="/produtos?idCategoria=9"
                      className="btn-lookbook"
                    >
                      <motion.span
                        style={{
                          display:
                            "inline-block",
                        }}
                        whileHover={{
                          scale: 1.05,
                        }}
                        whileTap={{
                          scale: 0.95,
                        }}
                      >
                        Ver Moda Feminina
                      </motion.span>
                    </Link>

                  </div>

                </motion.div>

              </div>

              {/* ------------------------------------------------------- */}
              {/* BANNER JEANS */}
              {/* ------------------------------------------------------- */}

              <div className="col-12 col-md-6">

                <motion.div
                  className="lookbook-banner-card"
                  style={{
                    overflow: "hidden",
                  }}
                  initial={{
                    opacity: 0,
                    x: 50,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.3,
                  }}
                  transition={{
                    duration: 0.7,
                    ease: [
                      0.22,
                      1,
                      0.36,
                      1,
                    ],
                  }}
                >

                  <motion.img
                    src="/modamas.jpg"
                    alt="Jeans"
                    whileHover={{
                      scale: 1.06,
                    }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                  />

                  <div className="lookbook-overlay">

                    <span className="lookbook-tag">
                      DESTAQUE
                    </span>

                    <h3>
                      JEANS
                    </h3>

                    <p>
                      Modelagens versáteis para compor
                      diferentes estilos.
                    </p>

                    <Link
                      href="/produtos?idCategoria=41"
                      className="btn-lookbook"
                    >
                      <motion.span
                        style={{
                          display:
                            "inline-block",
                        }}
                        whileHover={{
                          scale: 1.05,
                        }}
                        whileTap={{
                          scale: 0.95,
                        }}
                      >
                        Ver Jeans
                      </motion.span>
                    </Link>

                  </div>

                </motion.div>

              </div>

            </div>
          </div>

        </section>

        {/* ============================================================= */}
        {/* VOLTAR AO TOPO */}
        {/* ============================================================= */}

        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              className="scroll-to-top-btn"
              onClick={scrollToTop}
              aria-label="Voltar ao topo"
              initial={{
                opacity: 0,
                scale: 0.5,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.5,
                y: 20,
              }}
              transition={{
                duration: 0.25,
                ease: "easeOut",
              }}
              whileHover={{
                scale: 1.1,
              }}
              whileTap={{
                scale: 0.9,
              }}
            >
              <i className="bi bi-arrow-up" />
            </motion.button>
          )}
        </AnimatePresence>

      </main>
    </MotionConfig>
  );
}