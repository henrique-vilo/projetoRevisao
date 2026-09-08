"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./page.css";

// -----------------------------------------------------------------------
// Variantes de animação reutilizadas pela página inteira.
// Ficam fora do componente para não serem recriadas a cada render.
// -----------------------------------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 36, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Home() {
  const router = useRouter();
  const [verificandoPerfil, setVerificandoPerfil] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    try {
      const usuarioSalvo = window.localStorage.getItem("usuario");
      if (usuarioSalvo) {
        const usuario = JSON.parse(usuarioSalvo);
        const tipoUsuario = usuario?.tipo ?? usuario?.user?.tipo;
        if (tipoUsuario?.toLowerCase() === "admin") {
          router.replace("/admin/dashboard");
          return;
        }
      }
    } catch (error) {
      console.error("Não foi possível verificar o perfil do usuário:", error);
    }
    setVerificandoPerfil(false);
  }, [router]);

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");

    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    // Reaplica a animação do texto do hero sempre que o Bootstrap trocar de slide
    const carouselEl = document.getElementById("heroCarousel");
    const handleSlide = (event) => setActiveSlide(event.to);
    carouselEl?.addEventListener("slid.bs.carousel", handleSlide);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      carouselEl?.removeEventListener("slid.bs.carousel", handleSlide);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categorias = [
    { nome: "Inverno", imagem: "/invernomoda.jpg", link: "/produtos?categoria=inverno" },
    { nome: "Moda Esportiva", imagem: "/modaesporte.jpg", link: "/produtos?categoria=esportiva" },
    { nome: "Roupas Femininas", imagem: "/modafem.jpg", link: "/produtos?categoria=feminino" },
    { nome: "Roupas Masculinas", imagem: "/modamas.jpg", link: "/produtos?categoria=masculino" },
  ];

  const produtosInverno = [
    {
      id: 15,
      nome: "Casaco Inverno - Bege - GG",
      precoOriginal: "R$ 399,90",
      precoAtual: "R$ 319,90",
      tag: "Inverno",
    },
    {
      id: 14,
      nome: "Jaqueta Couro - Marrom - M - Vintage",
      precoOriginal: null,
      precoAtual: "R$ 289,90",
      tag: "Novo",
    },
    {
      id: 13,
      nome: "Moletom - Cinza Mescla - GG - Oversized",
      precoOriginal: "R$ 459,90",
      precoAtual: "R$ 389,90",
      tag: "Destaque",
    },
    {
      id: 212,
      nome: "Parka Térmica Impermeável - Preta - G",
      precoOriginal: "R$ 249,90",
      precoAtual: "R$ 199,90",
      tag: "Aquecimento",
    },
  ];

  const produtosEsportivos = [
    {
      id: 213,
      nome: "Top Esportivo - Preto - M",
      precoOriginal: "R$ 149,99",
      precoAtual: "R$ 119,99",
      badge: "Performance",
    },
    {
      id: 12,
      nome: "Shorts Corrida - Azul Marinho - G",
      precoOriginal: null,
      precoAtual: "R$ 89,90",
      badge: "Essencial",
    },
    {
      id: 11,
      nome: "Legging - Preta - M",
      precoOriginal: "R$ 229,90",
      precoAtual: "R$ 179,90",
      badge: "Tendência",
    },
    {
      id: 10,
      nome: "Dryfit - Verde Esmeralda - G",
      precoOriginal: null,
      precoAtual: "R$ 99,90",
      badge: "Treino",
    },
  ];

  const produtosFemininos = [
    {
      id: 7,
      nome: "Pijama Confort - Vinho - M",
      precoOriginal: "R$ 119,90",
      precoAtual: "R$ 89,90",
      tag: "Mais Vendido",
    },
    {
      id: 6,
      nome: "Saia Curta - Rosa Pastel - M",
      precoOriginal: "R$ 259,90",
      precoAtual: "R$ 219,90",
      tag: "Elegante",
    },
    {
      id: 5,
      nome: "Calça Skinny - Preta ",
      precoOriginal: "R$ 389,90",
      precoAtual: "R$ 329,90",
      tag: "Novo",
    },
    {
      id: 4,
      nome: "Vestido Midi - Vermelho - P",
      precoOriginal: null,
      precoAtual: "R$ 179,90",
      tag: "Exclusivo",
    },
  ];

  const produtosMasculinos = [
    {
      id: 13,
      nome: "Camisa Polo - Azul Marinho - M - Regular",
      precoOriginal: "R$ 159,90",
      precoAtual: "R$ 129,90",
      badge: "Streetwear",
    },
    {
      id: 14,
      nome: "Calça Jeans - Azul Marinho - 42 - Reta",
      precoOriginal: "R$ 269,90",
      precoAtual: "R$ 219,90",
      badge: "Utilitário",
    },
    {
      id: 2,
      nome: "Camisa Social - Branca - G - Slim Fit",
      precoOriginal: "R$ 349,90",
      precoAtual: "R$ 289,90",
      badge: "Essencial",
    },
    {
      id: 1,
      nome: "Camiseta Básica - Preta - M - Reta",
      precoOriginal: null,
      precoAtual: "R$ 199,90",
      badge: "Atemporal",
    },
  ];

  if (verificandoPerfil) {
    return null;
  }

  return (
    <MotionConfig reducedMotion="user">
      <main className="home-container">
        {/* BANNER PRINCIPAL / HERO */}
        <motion.section
          className="hero-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
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
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
              ></motion.button>
              <motion.button
                type="button"
                data-bs-target="#heroCarousel"
                data-bs-slide-to="1"
                aria-label="Slide 2"
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
              ></motion.button>
              <motion.button
                type="button"
                data-bs-target="#heroCarousel"
                data-bs-slide-to="2"
                aria-label="Slide 3"
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
              ></motion.button>
            </div>

            <div className="carousel-inner">
              <div className="carousel-item active">
                <div className="hero-slide-content">
                  <img src="/inverno.jpg" alt="Coleção de Inverno" />
                  <div className="hero-overlay">
                    <div className="container h-100">
                      <div className="row h-100 align-items-center">
                        <motion.div
                          className="col-12 col-md-8 text-start"
                          initial="hidden"
                          animate={activeSlide === 0 ? "visible" : "hidden"}
                          variants={staggerContainer}
                        >
                          <motion.span className="hero-subtitle" variants={fadeUp}>
                            INVERNO
                          </motion.span>
                          <motion.h1 className="hero-title" variants={fadeUp}>
                            os favoritos da <br />
                            <strong>temporada</strong>
                          </motion.h1>
                          <motion.div variants={fadeUp} style={{ display: "inline-block" }}>
                            <Link href="/produtos?categoria=inverno" className="btn-hero-pill">
                              <motion.span
                                style={{ display: "inline-block" }}
                                whileHover={{ scale: 1.06 }}
                                whileTap={{ scale: 0.94 }}
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

              <div className="carousel-item">
                <div className="hero-slide-content">
                  <img src="/imagem2.png" alt="Moda Esportiva" />
                  <div className="hero-overlay">
                    <div className="container h-100">
                      <div className="row h-100 align-items-center">
                        <motion.div
                          className="col-12 col-md-7 text-start"
                          initial="hidden"
                          animate={activeSlide === 1 ? "visible" : "hidden"}
                          variants={staggerContainer}
                        >
                          <motion.span className="hero-subtitle" variants={fadeUp}>
                            MODA ESPORTIVA
                          </motion.span>
                          <motion.h1 className="hero-title" variants={fadeUp}>
                            performance & <br />
                            <strong>conforto diário</strong>
                          </motion.h1>
                          <motion.div variants={fadeUp} style={{ display: "inline-block" }}>
                            <Link href="/produtos?categoria=esportiva" className="btn-hero-pill">
                              <motion.span
                                style={{ display: "inline-block" }}
                                whileHover={{ scale: 1.06 }}
                                whileTap={{ scale: 0.94 }}
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

              <div className="carousel-item">
                <div className="hero-slide-content">
                  <img src="/imagem3.png" alt="Catálogo Geral" />
                  <div className="hero-overlay">
                    <div className="container h-100">
                      <div className="row h-100 align-items-center">
                        <motion.div
                          className="col-12 col-md-7 text-start"
                          initial="hidden"
                          animate={activeSlide === 2 ? "visible" : "hidden"}
                          variants={staggerContainer}
                        >
                          <motion.span className="hero-subtitle" variants={fadeUp}>
                            NOVA COLEÇÃO
                          </motion.span>
                          <motion.h1 className="hero-title" variants={fadeUp}>
                            peças selecionadas <br />
                            <strong>para seu dia a dia</strong>
                          </motion.h1>
                          <motion.div variants={fadeUp} style={{ display: "inline-block" }}>
                            <Link href="/produtos" className="btn-hero-pill">
                              <motion.span
                                style={{ display: "inline-block" }}
                                whileHover={{ scale: 1.06 }}
                                whileTap={{ scale: 0.94 }}
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

            <motion.button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#heroCarousel"
              data-bs-slide="prev"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Anterior</span>
            </motion.button>
            <motion.button
              className="carousel-control-next"
              type="button"
              data-bs-target="#heroCarousel"
              data-bs-slide="next"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Próximo</span>
            </motion.button>
          </div>
        </motion.section>

        {/* BARRA DE DIFERENCIAIS */}
        <section className="features-bar">
          <div className="container">
            <motion.div
              className="row text-center gy-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={staggerContainer}
            >
              <motion.div className="col-12 col-md-4 feature-item" variants={fadeUp}>
                <motion.i
                  className="bi bi-box-seam me-2"
                  style={{ display: "inline-block" }}
                  whileHover={{ scale: 1.25, rotate: -8 }}
                ></motion.i>
                <span>Envio rápido e rastreado para todo o Brasil</span>
              </motion.div>
              <motion.div className="col-12 col-md-4 feature-item" variants={fadeUp}>
                <motion.i
                  className="bi bi-arrow-repeat me-2"
                  style={{ display: "inline-block" }}
                  whileHover={{ scale: 1.25, rotate: 180 }}
                  transition={{ duration: 0.4 }}
                ></motion.i>
                <span>Primeira troca grátis em até 30 dias</span>
              </motion.div>
              <motion.div className="col-12 col-md-4 feature-item" variants={fadeUp}>
                <motion.i
                  className="bi bi-credit-card me-2"
                  style={{ display: "inline-block" }}
                  whileHover={{ scale: 1.25, rotate: 8 }}
                ></motion.i>
                <span>Parcele em até 6x sem juros no cartão</span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CATEGORIAS EM DESTAQUE */}
        <section className="para-ela-section py-5">
          <div className="container-fluid px-md-5">
            <motion.h2
              className="section-title-left mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5 }}
            >
              Categorias em Destaque
            </motion.h2>
            <motion.div
              className="row g-3 flex-nowrap overflow-auto scrollbar-hidden pb-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={staggerContainer}
            >
              {categorias.map((cat, idx) => (
                <motion.div
                  className="col-8 col-sm-5 col-md-4 col-lg-3 flex-shrink-0"
                  key={idx}
                  variants={cardItem}
                >
                  <Link href={cat.link} className="categoria-card-vertical">
                    <div className="categoria-img-wrapper" style={{ overflow: "hidden" }}>
                      <motion.img
                        src={cat.imagem}
                        alt={cat.nome}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                      <div className="categoria-bottom-gradient">
                        <span className="categoria-title-text">{cat.nome}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 1ª SEÇÃO: INVERNO */}
        <section className="novidades-section py-5 bg-light-clean">
          <div className="container-fluid px-md-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <Link href="/produtos?categoria=inverno" className="text-decoration-none text-dark">
                <motion.h2
                  className="section-title-left margin-0"
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  INVERNO
                </motion.h2>
              </Link>
              <Link href="/produtos?categoria=inverno" className="link-ver-todos">
                <motion.span
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ x: 4 }}
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  Ver Coleção <i className="bi bi-arrow-right ms-1"></i>
                </motion.span>
              </Link>
            </div>

            <motion.div
              className="row g-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
            >
              {produtosInverno.map((prod) => (
                <div className="col-12 col-sm-6 col-md-3" key={prod.id}>
                  <Link href={`/produtos/${prod.id}`} className="text-decoration-none text-dark d-block h-100">
                    <motion.div
                      className="product-card-clean h-100"
                      variants={cardItem}
                      whileHover={{ y: -10, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="product-image-box" style={{ overflow: "hidden" }}>
                        {prod.tag && <span className="product-tag-pill">{prod.tag}</span>}
                        <motion.img
                          src={prod.imagem}
                          alt={prod.nome}
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </div>
                      <div className="product-details">
                        <h3 className="product-title">{prod.nome}</h3>
                        <div className="product-price-row">
                          {prod.precoOriginal ? (
                            <>
                              <span className="price-current text-discount">{prod.precoAtual}</span>
                              <span className="price-old">{prod.precoOriginal}</span>
                            </>
                          ) : (
                            <span className="price-current">{prod.precoAtual}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 2ª SEÇÃO: MODA ESPORTIVA */}
        <section className="desejados-section py-5">
          <div className="container-fluid px-md-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <Link href="/produtos?categoria=esportiva" className="text-decoration-none text-dark">
                <motion.h2
                  className="section-title-left margin-0"
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  MODA ESPORTIVA
                </motion.h2>
              </Link>
              <Link href="/produtos?categoria=esportiva" className="link-ver-todos">
                <motion.span
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ x: 4 }}
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  Ver Coleção <i className="bi bi-arrow-right ms-1"></i>
                </motion.span>
              </Link>
            </div>

            <motion.div
              className="row g-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
            >
              {produtosEsportivos.map((prod) => (
                <div className="col-12 col-sm-6 col-md-3" key={prod.id}>
                  <Link href={`/produtos/${prod.id}`} className="text-decoration-none text-dark d-block h-100">
                    <motion.div
                      className="product-card-clean h-100"
                      variants={cardItem}
                      whileHover={{ y: -10, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="product-image-box" style={{ overflow: "hidden" }}>
                        {prod.badge && <span className="product-tag-pill badge-dark">{prod.badge}</span>}
                        <motion.img
                          src={prod.imagem}
                          alt={prod.nome}
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </div>
                      <div className="product-details">
                        <h3 className="product-title">{prod.nome}</h3>
                        <div className="product-price-row">
                          {prod.precoOriginal ? (
                            <>
                              <span className="price-current text-discount">{prod.precoAtual}</span>
                              <span className="price-old">{prod.precoOriginal}</span>
                            </>
                          ) : (
                            <span className="price-current">{prod.precoAtual}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 3ª SEÇÃO: ROUPAS FEMININAS */}
        <section className="novidades-section py-5 bg-light-clean">
          <div className="container-fluid px-md-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <Link href="/produtos?categoria=feminino" className="text-decoration-none text-dark">
                <motion.h2
                  className="section-title-left margin-0"
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  ROUPAS FEMININAS
                </motion.h2>
              </Link>
              <Link href="/produtos?categoria=feminino" className="link-ver-todos">
                <motion.span
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ x: 4 }}
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  Ver Coleção <i className="bi bi-arrow-right ms-1"></i>
                </motion.span>
              </Link>
            </div>

            <motion.div
              className="row g-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
            >
              {produtosFemininos.map((prod) => (
                <div className="col-12 col-sm-6 col-md-3" key={prod.id}>
                  <Link href={`/produtos/${prod.id}`} className="text-decoration-none text-dark d-block h-100">
                    <motion.div
                      className="product-card-clean h-100"
                      variants={cardItem}
                      whileHover={{ y: -10, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="product-image-box" style={{ overflow: "hidden" }}>
                        {prod.tag && <span className="product-tag-pill">{prod.tag}</span>}
                        <motion.img
                          src={prod.imagem}
                          alt={prod.nome}
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </div>
                      <div className="product-details">
                        <h3 className="product-title">{prod.nome}</h3>
                        <div className="product-price-row">
                          {prod.precoOriginal ? (
                            <>
                              <span className="price-current text-discount">{prod.precoAtual}</span>
                              <span className="price-old">{prod.precoOriginal}</span>
                            </>
                          ) : (
                            <span className="price-current">{prod.precoAtual}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 4ª SEÇÃO: ROUPAS MASCULINAS */}
        <section className="desejados-section py-5">
          <div className="container-fluid px-md-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <Link href="/produtos?categoria=masculino" className="text-decoration-none text-dark">
                <motion.h2
                  className="section-title-left margin-0"
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  ROUPAS MASCULINAS
                </motion.h2>
              </Link>
              <Link href="/produtos?categoria=masculino" className="link-ver-todos">
                <motion.span
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ x: 4 }}
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  Ver Coleção <i className="bi bi-arrow-right ms-1"></i>
                </motion.span>
              </Link>
            </div>

            <motion.div
              className="row g-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
            >
              {produtosMasculinos.map((prod) => (
                <div className="col-12 col-sm-6 col-md-3" key={prod.id}>
                  <Link href={`/produtos/${prod.id}`} className="text-decoration-none text-dark d-block h-100">
                    <motion.div
                      className="product-card-clean h-100"
                      variants={cardItem}
                      whileHover={{ y: -10, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="product-image-box" style={{ overflow: "hidden" }}>
                        {prod.badge && <span className="product-tag-pill badge-dark">{prod.badge}</span>}
                        <motion.img
                          src={prod.imagem}
                          alt={prod.nome}
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </div>
                      <div className="product-details">
                        <h3 className="product-title">{prod.nome}</h3>
                        <div className="product-price-row">
                          {prod.precoOriginal ? (
                            <>
                              <span className="price-current text-discount">{prod.precoAtual}</span>
                              <span className="price-old">{prod.precoOriginal}</span>
                            </>
                          ) : (
                            <span className="price-current">{prod.precoAtual}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* BANNERS DE DESTAQUE FINAL */}
        <section className="lookbook-section py-5 bg-light-clean">
          <div className="container-fluid px-md-5">
            <div className="row g-4">
              <div className="col-12 col-md-6">
                <motion.div
                  className="lookbook-banner-card"
                  style={{ overflow: "hidden" }}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.img
                    src="/modafem.jpg"
                    alt="Roupas Femininas"
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                  <div className="lookbook-overlay">
                    <span className="lookbook-tag">COLEÇÃO</span>
                    <h3>ROUPAS FEMININAS</h3>
                    <p>Modelagens modernas e cortes elegantes para todas as ocasiões.</p>
                    <Link href="/produtos?categoria=feminino" className="btn-lookbook">
                      <motion.span
                        style={{ display: "inline-block" }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Ver Roupas Femininas
                      </motion.span>
                    </Link>
                  </div>
                </motion.div>
              </div>

              <div className="col-12 col-md-6">
                <motion.div
                  className="lookbook-banner-card"
                  style={{ overflow: "hidden" }}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.img
                    src="/modamas.jpg"
                    alt="Roupas Masculinas"
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                  <div className="lookbook-overlay">
                    <span className="lookbook-tag">COLEÇÃO</span>
                    <h3>ROUPAS MASCULINAS</h3>
                    <p>Tecidos premium de alta resistência, conforto e caimento perfeito.</p>
                    <Link href="/produtos?categoria=masculino" className="btn-lookbook">
                      <motion.span
                        style={{ display: "inline-block" }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Ver Roupas Masculinas
                      </motion.span>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTÃO VOLTAR AO TOPO */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              className="scroll-to-top-btn"
              onClick={scrollToTop}
              aria-label="Voltar ao topo"
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <i className="bi bi-arrow-up"></i>
            </motion.button>
          )}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}