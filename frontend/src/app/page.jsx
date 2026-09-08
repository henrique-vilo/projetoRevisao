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
    <main className="home-container">
      {/* BANNER PRINCIPAL / HERO */}
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
                <img src="/inverno.jpg" alt="Coleção de Inverno" />
                <div className="hero-overlay">
                  <div className="container h-100">
                    <div className="row h-100 align-items-center">
                      <div className="col-12 col-md-8 text-start">
                        <span className="hero-subtitle">INVERNO</span>
                        <h1 className="hero-title">
                          os favoritos da <br />
                          <strong>temporada</strong>
                        </h1>
                        <Link href="/produtos?categoria=inverno" className="btn-hero-pill">
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
                <img src="/imagem2.png" alt="Moda Esportiva" />
                <div className="hero-overlay">
                  <div className="container h-100">
                    <div className="row h-100 align-items-center">
                      <div className="col-12 col-md-7 text-start">
                        <span className="hero-subtitle">MODA ESPORTIVA</span>
                        <h1 className="hero-title">
                          performance & <br />
                          <strong>conforto diário</strong>
                        </h1>
                        <Link href="/produtos?categoria=esportiva" className="btn-hero-pill">
                          Explorar Coleção
                        </Link>
                      </div>
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
                      <div className="col-12 col-md-7 text-start">
                        <span className="hero-subtitle">NOVA COLEÇÃO</span>
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

      {/* BARRA DE DIFERENCIAIS */}
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

      {/* CATEGORIAS EM DESTAQUE */}
      <section className="para-ela-section py-5">
        <div className="container-fluid px-md-5">
          <h2 className="section-title-left mb-4">Categorias em Destaque</h2>
          <div className="row g-3 flex-nowrap overflow-auto scrollbar-hidden pb-3">
            {categorias.map((cat, idx) => (
              <div className="col-8 col-sm-5 col-md-4 col-lg-3 flex-shrink-0" key={idx}>
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

      {/* 1ª SEÇÃO: INVERNO */}
      <section className="novidades-section py-5 bg-light-clean">
        <div className="container-fluid px-md-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <Link href="/produtos?categoria=inverno" className="text-decoration-none text-dark">
              <h2 className="section-title-left margin-0">INVERNO</h2>
            </Link>
            <Link href="/produtos?categoria=inverno" className="link-ver-todos">
              Ver Coleção <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          <div className="row g-4">
            {produtosInverno.map((prod) => (
              <div className="col-12 col-sm-6 col-md-3" key={prod.id}>
                <Link href={`/produtos/${prod.id}`} className="text-decoration-none text-dark d-block h-100">
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
                            <span className="price-current text-discount">{prod.precoAtual}</span>
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

      {/* 2ª SEÇÃO: MODA ESPORTIVA */}
      <section className="desejados-section py-5">
        <div className="container-fluid px-md-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <Link href="/produtos?categoria=esportiva" className="text-decoration-none text-dark">
              <h2 className="section-title-left margin-0">MODA ESPORTIVA</h2>
            </Link>
            <Link href="/produtos?categoria=esportiva" className="link-ver-todos">
              Ver Coleção <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          <div className="row g-4">
            {produtosEsportivos.map((prod) => (
              <div className="col-12 col-sm-6 col-md-3" key={prod.id}>
                <Link href={`/produtos/${prod.id}`} className="text-decoration-none text-dark d-block h-100">
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
                            <span className="price-current text-discount">{prod.precoAtual}</span>
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

      {/* 3ª SEÇÃO: ROUPAS FEMININAS */}
      <section className="novidades-section py-5 bg-light-clean">
        <div className="container-fluid px-md-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <Link href="/produtos?categoria=feminino" className="text-decoration-none text-dark">
              <h2 className="section-title-left margin-0">ROUPAS FEMININAS</h2>
            </Link>
            <Link href="/produtos?categoria=feminino" className="link-ver-todos">
              Ver Coleção <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          <div className="row g-4">
            {produtosFemininos.map((prod) => (
              <div className="col-12 col-sm-6 col-md-3" key={prod.id}>
                <Link href={`/produtos/${prod.id}`} className="text-decoration-none text-dark d-block h-100">
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
                            <span className="price-current text-discount">{prod.precoAtual}</span>
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

      {/* 4ª SEÇÃO: ROUPAS MASCULINAS */}
      <section className="desejados-section py-5">
        <div className="container-fluid px-md-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <Link href="/produtos?categoria=masculino" className="text-decoration-none text-dark">
              <h2 className="section-title-left margin-0">ROUPAS MASCULINAS</h2>
            </Link>
            <Link href="/produtos?categoria=masculino" className="link-ver-todos">
              Ver Coleção <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          <div className="row g-4">
            {produtosMasculinos.map((prod) => (
              <div className="col-12 col-sm-6 col-md-3" key={prod.id}>
                <Link href={`/produtos/${prod.id}`} className="text-decoration-none text-dark d-block h-100">
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
                            <span className="price-current text-discount">{prod.precoAtual}</span>
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

      {/* BANNERS DE DESTAQUE FINAL */}
      <section className="lookbook-section py-5 bg-light-clean">
        <div className="container-fluid px-md-5">
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <div className="lookbook-banner-card">
                <img src="/modafem.jpg" alt="Roupas Femininas" />
                <div className="lookbook-overlay">
                  <span className="lookbook-tag">COLEÇÃO</span>
                  <h3>ROUPAS FEMININAS</h3>
                  <p>Modelagens modernas e cortes elegantes para todas as ocasiões.</p>
                  <Link href="/produtos?categoria=feminino" className="btn-lookbook">
                    Ver Roupas Femininas
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="lookbook-banner-card">
                <img src="/modamas.jpg" alt="Roupas Masculinas" />
                <div className="lookbook-overlay">
                  <span className="lookbook-tag">COLEÇÃO</span>
                  <h3>ROUPAS MASCULINAS</h3>
                  <p>Tecidos premium de alta resistência, conforto e caimento perfeito.</p>
                  <Link href="/produtos?categoria=masculino" className="btn-lookbook">
                    Ver Roupas Masculinas
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTÃO VOLTAR AO TOPO */}
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