"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import "bootstrap/dist/css/bootstrap.min.css";

import "bootstrap-icons/font/bootstrap-icons.css";

import "./page.css";

export default function Home() {

  const router = useRouter();

  const [verificandoPerfil, setVerificandoPerfil] = useState(true);

  const [showScrollTop, setShowScrollTop] = useState(false);

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

    return () => window.removeEventListener("scroll", handleScroll);

  }, []);

  const scrollToTop = () => {

    window.scrollTo({ top: 0, behavior: "smooth" });

  };

  const categorias = [

    { nome: "calças", imagem: "/calças.jpg", link: "/produtos?categoria=calcas" },

    { nome: "camisetas", imagem: "/camisetas.jpg", link: "/produtos?categoria=camisetas" },

    { nome: "jaquetas e casacos", imagem: "/jaquetass.jpg", link: "/produtos?categoria=jaquetas" },

    { nome: "acessórios", imagem: "/acessorios.jpg", link: "/produtos?categoria=acessorios" },

    { nome: "linha cargo", imagem: "/cargo.png", link: "/produtos?categoria=cargo" },

  ];

  const novidades = [

    {

      id: 1,

      nome: "Camiseta Premium Heavyweight Peruana",

      precoOriginal: "R$ 149,99",

      precoAtual: "R$ 119,99",

      imagem: "/camisetapremium.jpg",

      tag: "Mais Vendido",

    },

    {

      id: 2,

      nome: "Jaqueta Estruturada Denim Oversized",

      precoOriginal: null,

      precoAtual: "R$ 289,90",

      imagem: "/jaqueta.jpg",

      tag: "Novo",

    },

    {

      id: 3,

      nome: "Conjunto Minimalist Streetwear Akin",

      precoOriginal: "R$ 359,90",

      precoAtual: "R$ 299,90",

      imagem: "/akin.png",

      tag: "Destaque",

    },

    {

      id: 4,

      nome: "Calça Cargo Utilitária Multi-Pockets",

      precoOriginal: "R$ 249,90",

      precoAtual: "R$ 199,90",

      imagem: "/cargo.png",

      tag: "Destaque",

    },

  ];

  const maisDesejados = [

    {

      id: 5,

      nome: "Jaqueta Puffer Thermal Everett",

      precoOriginal: "R$ 399,90",

      precoAtual: "R$ 319,90",

      imagem: "/jaquetass.jpg",

      badge: "Inverno",

    },

    {

      id: 6,

      nome: "Kit Acessórios Urban Style",

      precoOriginal: null,

      precoAtual: "R$ 89,90",

      imagem: "/acessorios.jpg",

      badge: "Essencial",

    },

    {

      id: 7,

      nome: "Calça Straight Fit Alfaiataria",

      precoOriginal: "R$ 229,90",

      precoAtual: "R$ 179,90",

      imagem: "/calças.jpg",

      badge: "Tendência",

    },

    {

      id: 8,

      nome: "Camiseta Classic Cotton Soft",

      precoOriginal: null,

      precoAtual: "R$ 99,90",

      imagem: "/camisetapremium.jpg",

      badge: null,

    },

  ];

  if (verificandoPerfil) {

    return null;

  }

  return (

    <main className="home-container">
      <section className="hero-section">

        <div

          id="heroCarousel"

          className="carousel slide"

          data-bs-ride="carousel"

          data-bs-interval="5000"

        >

          <div className="carousel-indicators">
  <button
    type="button"
    data-bs-target="#heroCarousel"
    data-bs-slide-to="0"
    className="active"
    aria-current="true"
    aria-label="Slide 1"
  ></button>

  <button
    type="button"
    data-bs-target="#heroCarousel"
    data-bs-slide-to="1"
    aria-label="Slide 2"
  ></button>

  <button
    type="button"
    data-bs-target="#heroCarousel"
    data-bs-slide-to="2"
    aria-label="Slide 3"
  ></button>
</div>

          <div className="carousel-inner">

            <div className="carousel-item active">

              <div className="hero-slide-content">

                <img src="/inverno.jpg" alt="Os favoritos da temporada" />

                <div className="hero-overlay">

                  <div className="container h-100">

                    <div className="row h-100 align-items-center">

                      <div className="col-12 col-md-8 text-start">

                        <span className="hero-subtitle">COLEÇÃO DE INVERNO</span>

                        <h1 className="hero-title">

                          os favoritos da <br />

                          <strong>temporada</strong>

                        </h1>

                        <Link href="/produtos" className="btn-hero-pill">

                          Conferir Produtos

                        </Link>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

           

            <div className="carousel-item">

              <div className="hero-slide-content">

                <img src="/imagem2.png" alt="Essenciais de Estilo" />

                <div className="hero-overlay">

                  <div className="container h-100">

                    <div className="row h-100 align-items-center">

                      <div className="col-12 col-md-7 text-start">

                        <span className="hero-subtitle">BÁSICOS PREMIUM</span>

                        <h1 className="hero-title">

                          modelagens puras & <br />

                          <strong>caimento perfeito</strong>

                        </h1>

                        <Link href="/produtos" className="btn-hero-pill">

                          Explorar Produtos

                        </Link>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            <div className="carousel-item">

              <div className="hero-slide-content">

                <img src="/imagem3.png" alt="Tendências da Estação" />

                <div className="hero-overlay">

                  <div className="container h-100">

                    <div className="row h-100 align-items-center">

                      <div className="col-12 col-md-7 text-start">

                        <span className="hero-subtitle">NOVA TEMPORADA</span>

                        <h1 className="hero-title">

                          peças selecionadas <br />

                          <strong>para seu dia a dia</strong>

                        </h1>

                        <Link href="/produtos" className="btn-hero-pill">

                          Ver Produtos

                        </Link>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">

            <span className="carousel-control-prev-icon" aria-hidden="true"></span>

            <span className="visually-hidden">Anterior</span>

          </button>

          <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">

            <span className="carousel-control-next-icon" aria-hidden="true"></span>

            <span className="visually-hidden">Próximo</span>

          </button>

        </div>

      </section>
      <section className="features-bar">

        <div className="container">

          <div className="row text-center gy-3">

            <div className="col-12 col-md-4 feature-item">

              <i className="bi bi-box-seam me-2"></i>

              <span>Envio rápido e rastreado para todo o Brasil</span>

            </div>

            <div className="col-12 col-md-4 feature-item">

              <i className="bi bi-arrow-repeat me-2"></i>

              <span>Primeira troca grátis em até 30 dias</span>

            </div>

            <div className="col-12 col-md-4 feature-item">

              <i className="bi bi-credit-card me-2"></i>

              <span>Parcele em até 6x sem juros no cartão</span>

            </div>

          </div>

        </div>

      </section>
      <section className="para-ela-section py-5">

        <div className="container-fluid px-md-5">

          <h2 className="section-title-left mb-4">Categorias em Destaque</h2>

          <div className="row g-3 flex-nowrap overflow-auto scrollbar-hidden pb-3">

            {categorias.map((cat, idx) => (

              <div className="col-8 col-sm-5 col-md-4 col-lg-2-4 flex-shrink-0" key={idx}>

                <Link href={cat.link} className="categoria-card-vertical">

                  <div className="categoria-img-wrapper">

                    <img src={cat.imagem} alt={cat.nome} />

                    <div className="categoria-bottom-gradient">

                      <span className="categoria-title-text">{cat.nome}</span>

                    </div>

                  </div>

                </Link>

              </div>

            ))}

          </div>

        </div>

      </section>
      <section className="novidades-section py-5 bg-light-clean">

        <div className="container-fluid px-md-5">

          <div className="d-flex align-items-center justify-content-between mb-4">

            <h2 className="section-title-left margin-0">Novidades e tendências</h2>

            <div className="carousel-nav-arrows">

              <button className="nav-arrow-btn me-2" aria-label="Anterior">

                <i className="bi bi-chevron-left"></i>

              </button>

              <button className="nav-arrow-btn" aria-label="Próximo">

                <i className="bi bi-chevron-right"></i>

              </button>

            </div>

          </div>

          <div className="row g-4">

            {novidades.map((prod) => (

              <div className="col-12 col-sm-6 col-md-3" key={prod.id}>

                <Link href={`/produto/${prod.id}`} className="text-decoration-none text-dark d-block h-100">

                  <div className="product-card-clean h-100">

                    <div className="product-image-box">

                      {prod.tag && <span className="product-tag-pill">{prod.tag}</span>}

                      <img src={prod.imagem} alt={prod.nome} />

                    </div>

                    <div className="product-details">

                      <h3 className="product-title">{prod.nome}</h3>

                      <div className="product-price-row">

                        {prod.precoOriginal ? (

                          <>

                            <span className="price-current text-discount">

                              {prod.precoAtual}

                            </span>

                            <span className="price-old">{prod.precoOriginal}</span>

                          </>

                        ) : (

                          <span className="price-current">{prod.precoAtual}</span>

                        )}

                      </div>

                    </div>

                  </div>

                </Link>

              </div>

            ))}

          </div>

        </div>

      </section>
      <section className="desejados-section py-5">

        <div className="container-fluid px-md-5">

          <div className="d-flex align-items-center justify-content-between mb-4">

            <div>

              <p className="text-uppercase text-muted small fw-bold mb-1">

                SELEÇÃO DA COMUNIDADE

              </p>

              <h2 className="section-title-left margin-0">Os Mais Desejados</h2>

            </div>

            <Link href="/produtos" className="link-ver-todos">

              Ver todos <i className="bi bi-arrow-right ms-1"></i>

            </Link>

          </div>

          <div className="row g-4">

            {maisDesejados.map((prod) => (

              <div className="col-12 col-sm-6 col-md-3" key={prod.id}>

                <Link href={`/produto/${prod.id}`} className="text-decoration-none text-dark d-block h-100">

                  <div className="product-card-clean h-100">

                    <div className="product-image-box">

                      {prod.badge && <span className="product-tag-pill badge-dark">{prod.badge}</span>}

                      <img src={prod.imagem} alt={prod.nome} />

                    </div>

                    <div className="product-details">

                      <h3 className="product-title">{prod.nome}</h3>

                      <div className="product-price-row">

                        {prod.precoOriginal ? (

                          <>

                            <span className="price-current text-discount">

                              {prod.precoAtual}

                            </span>

                            <span className="price-old">{prod.precoOriginal}</span>

                          </>

                        ) : (

                          <span className="price-current">{prod.precoAtual}</span>

                        )}

                      </div>

                    </div>

                  </div>

                </Link>

              </div>

            ))}

          </div>

        </div>

      </section>
      <section className="lookbook-section py-5 bg-light-clean">

        <div className="container-fluid px-md-5">

          <div className="row g-4">

            <div className="col-12 col-md-6">

              <div className="lookbook-banner-card">

                <img src="/imagem1.png" alt="Lookbook Urbano" />

                <div className="lookbook-overlay">

                  <span className="lookbook-tag">TENDÊNCIA 2026</span>

                  <h3>Urban Style & Comfort</h3>

                  <p>Peças com caimento moderno para todas as ocasiões.</p>

                  <Link href="/produtos" className="btn-lookbook">

                    Ver Produtos

                  </Link>

                </div>

              </div>

            </div>

            <div className="col-12 col-md-6">

              <div className="lookbook-banner-card">

                <img src="/imagem2.png" alt="Linha Básico Premium" />

                <div className="lookbook-overlay">

                  <span className="lookbook-tag">ESSENCIAIS EVERETT</span>

                  <h3>Tecidos de Alta Durabilidade</h3>

                  <p>Toque macio, modelagem anatômica e estilo atemporal.</p>

                  <Link href="/produtos" className="btn-lookbook">

                    Ver Produtos

                  </Link>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>
      <section className="newsletter-section py-5 text-center">

        

      </section>
      {showScrollTop && (

        <button

          className="scroll-to-top-btn"

          onClick={scrollToTop}

          aria-label="Voltar ao topo"

        >

          <i className="bi bi-arrow-up"></i>

        </button>

      )}

    </main>

  );

}
