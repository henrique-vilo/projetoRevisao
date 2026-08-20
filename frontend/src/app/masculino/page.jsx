"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import "bootstrap/dist/css/bootstrap.min.css";

import "bootstrap-icons/font/bootstrap-icons.css";

import "./page.css";

export default function Masculino() {
    const [produtos, setProdutos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [tamanhos, setTamanhos] = useState([]);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
    const [tamanhoSelecionado, setTamanhoSelecionado] = useState("");
    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        buscarCategorias();
        buscarTamanhos();
    }, []);

    useEffect(() => {
        buscarProdutos();
    }, [categoriaSelecionada, tamanhoSelecionado]);

    async function buscarCategorias() {
        try {
            const resposta = await fetch(
                "http://localhost:3000/categorias"
            );

            if (!resposta.ok) {
                throw new Error("Erro ao buscar categorias");
            }

            const dados = await resposta.json();

            console.log("Categorias recebidas:", dados);

            setCategorias(dados.dados || dados);
        } catch (erro) {
            console.error("Erro ao carregar categorias:", erro);
        }
    }

    async function buscarTamanhos() {
        try {
            const resposta = await fetch(
                "http://localhost:3000/tamanhos"
            );

            if (!resposta.ok) {
                throw new Error("Erro ao buscar tamanhos");
            }

            const dados = await resposta.json();

            console.log("Tamanhos recebidos:", dados);

            setTamanhos(dados.dados || dados);
        } catch (erro) {
            console.error("Erro ao carregar tamanhos:", erro);
        }
    }

    async function buscarProdutos() {
        try {
            setCarregando(true);

            const params = new URLSearchParams();

            if (categoriaSelecionada) {
                params.append("idCategoria", categoriaSelecionada);
            }

            if (tamanhoSelecionado) {
                params.append("idTamanho", tamanhoSelecionado);
            }

            const url = `http://localhost:3000/produtos?${params.toString()}`;

            console.log("Buscando produtos:", url);

            const resposta = await fetch(url);

            if (!resposta.ok) {
                throw new Error("Erro ao buscar produtos");
            }

            const dados = await resposta.json();

            console.log("Produtos recebidos:", dados);

            setProdutos(dados.dados || dados);
        } catch (erro) {
            console.error("Erro ao carregar produtos:", erro);

            setProdutos([]);
        } finally {
            setCarregando(false);
        }
    }

    function limparFiltros() {
        setCategoriaSelecionada("");
        setTamanhoSelecionado("");
    }

    return (
        <main className="masculino-page">

            {/* CABEÇALHO */}

            <section className="masculino-header">

                <div className="container">

                    <span className="section-label">
                        COLEÇÃO MASCULINA
                    </span>

                    <h1>
                        Moda <span>Masculina</span>
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

                        <button
                            className="clear-filters"
                            onClick={limparFiltros}
                        >
                            Limpar filtros
                        </button>

                    </div>

                    <div className="filters">

                        <div className="filter-group">

                            <label>Categoria</label>

                            <select
                                value={categoriaSelecionada}
                                onChange={(e) =>
                                    setCategoriaSelecionada(e.target.value)
                                }
                            >

                                <option value="">
                                    Todas as categorias
                                </option>

                                {categorias.map((categoria) => (

                                    <option
                                        key={categoria.idCategoria}
                                        value={categoria.idCategoria}
                                    >
                                        {categoria.nomeCategoria}
                                    </option>

                                ))}

                            </select>

                        </div>

                        <div className="filter-group">

                            <label>Tamanho</label>

                            <select
                                value={tamanhoSelecionado}
                                onChange={(e) =>
                                    setTamanhoSelecionado(e.target.value)
                                }
                            >

                                <option value="">
                                    Todos
                                </option>

                                {tamanhos.map((tamanho) => (

                                    <option
                                        key={tamanho.idTamanho}
                                        value={tamanho.idTamanho}
                                    >
                                        {tamanho.codigoTamanho}
                                    </option>

                                ))}

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

                            <p>
                                {carregando
                                    ? "Carregando produtos..."
                                    : `${produtos.length} produtos encontrados`}
                            </p>

                        </div>

                    </div>

                    <div className="products-grid">

                        {produtos.map((produto) => (

                            <article
                                className="product-card"
                                key={produto.id}
                            >

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

                                    <h3>
                                        {produto.nome}
                                    </h3>

                                    <div className="product-bottom">

                                        <strong>
                                            {produto.preco}
                                        </strong>

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
