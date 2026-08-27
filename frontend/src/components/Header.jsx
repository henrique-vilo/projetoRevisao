"use client";

import { useEffect, useState } from "react";
import "./Header.css";
import Link from "next/link";

export default function Header() {
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [notificacoesAberto, setNotificacoesAberto] = useState(false);
  const [localizacaoAberto, setLocalizacaoAberto] = useState(false);
  const [perfilAberto, setPerfilAberto] = useState(false);

  // Categoria atualmente hovered/selecionada para abrir o Mega Menu
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);

  // Estrutura de dados adaptada ao layout da imagem
  const menuCategorias = [
    { id: "ofertas", nome: "Ofertas", destaque: true },
    { id: "feminino", nome: "Feminino" },
    { id: "masculino", nome: "Masculino" },
    { id: "infantil", nome: "Infantil" },
    { id: "beleza", nome: "Beleza" },
    { id: "mindse7", nome: "Mindse7" },
    {
      id: "calcados",
      nome: "Calçados",
      colunas: [
        {
          titulo: "Feminino",
          bold: true,
          itens: [
            "Botas",
            "Bolsas para complementar",
            "Chinelos",
            "Pantufas",
            "Rasteirinhas",
            "Sandálias",
            "Sapatilhas",
            "Sapatos",
            "Scarpin",
            "Tamancos",
            "Tênis",
          ],
        },
        {
          titulo: "Masculino",
          bold: true,
          itens: ["Chinelos", "Sandálias", "Sapatênis", "Sapatos", "Tênis"],
        },
        {
          titulo: "Menina",
          bold: true,
          itens: [
            "Babuche",
            "Botas",
            "Chinelos",
            "Pantufas",
            "Sandálias",
            "Sapatilhas",
            "Tênis",
          ],
        },
        {
          titulo: "Menino",
          bold: true,
          itens: ["Babuche", "Botas", "Chinelos", "Pantufas", "Sandálias"],
        },
        {
          titulo: "Marcas",
          bold: true,
          itens: [
            "Beira Rio",
            "Cartago",
            "Grendene",
            "Havaianas",
            "Ipanema",
            "Mindset",
            "Moleca",
            "Oneself",
            "Redley",
            "Rider",
            "Via Uno",
            "Vizzano",
            "Zaxy",
            "Todos os produtos",
          ],
        },
      ],
      banner: {
        imagem: "/banner-personal-shopper.jpg",
        texto: "a nossa personal shopper sugere seu look favorito em segundos",
        botaoTexto: "confira",
        link: "/personal-shopper",
      },
    },
    { id: "esportivo", nome: "Esportivo" },
    { id: "jeans", nome: "Jeans" },
    { id: "novidades", nome: "Novidades" },
  ];

  return (
    <header className="header-container">
      <nav className="navbar-main">
        {/* Lista de Categorias no Topo */}
        <ul className="categories-list">
          {menuCategorias.map((cat) => (
            <li
              key={cat.id}
              className={`category-item ${
                categoriaAtiva === cat.id ? "active" : ""
              }`}
              onMouseEnter={() => setCategoriaAtiva(cat.id)}
            >
              <Link
                href={`/categoria/${cat.id}`}
                className={`category-link ${cat.destaque ? "highlight" : ""}`}
              >
                {cat.nome}
                {cat.destaque && <span className="red-dot">•</span>}
              </Link>
            </li>
          ))}
        </ul>

        {/* Barra de Pesquisa Estilo Pílula */}
        <div className="search-pill-container">
          <i className="bi bi-search search-pill-icon"></i>
          <input
            type="text"
            placeholder="Estou pensando em rock in rio"
            className="search-pill-input"
          />
        </div>
      </nav>

      {/* Painel do Mega Menu Exibido ao Passar o Mouse/Clicar */}
      {categoriaAtiva && (
        <div
          className="mega-menu-overlay"
          onMouseLeave={() => setCategoriaAtiva(null)}
        >
          <div className="mega-menu-content">
            {/* Renderiza as Colunas da Categoria Selecionada */}
            <div className="mega-menu-columns">
              <div className="mega-menu-column">
                <span className="menu-label-red">Em alta •</span>
                <Link href="/novidades" className="menu-link-bold">
                  Novidades
                </Link>
              </div>

              {menuCategorias
                .find((c) => c.id === categoriaAtiva)
                ?.colunas?.map((coluna, index) => (
                  <div className="mega-menu-column" key={index}>
                    <h4 className="column-title">{coluna.titulo}</h4>
                    <ul>
                      {coluna.itens.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <Link
                            href={`/categoria/${categoriaAtiva}/${item
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                            className="column-item-link"
                          >
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>

            {/* Banner Promocional Lateral (Personal Shopper) */}
            {menuCategorias.find((c) => c.id === categoriaAtiva)?.banner && (
              <div className="mega-menu-banner-card">
                <img
                  src={
                    menuCategorias.find((c) => c.id === categoriaAtiva).banner
                      .imagem
                  }
                  alt="Personal Shopper"
                />
                <div className="banner-card-body">
                  <p>
                    {
                      menuCategorias.find((c) => c.id === categoriaAtiva)
                        .banner.texto
                    }
                  </p>
                  <Link
                    href={
                      menuCategorias.find((c) => c.id === categoriaAtiva)
                        .banner.link
                    }
                    className="btn-purple-pill"
                  >
                    {
                      menuCategorias.find((c) => c.id === categoriaAtiva)
                        .banner.botaoTexto
                    }
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}