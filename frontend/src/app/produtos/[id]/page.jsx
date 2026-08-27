'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

const API_BASE_URL = (
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
).replace(/\/$/, '');

const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');
const IMAGE_BASE_URL = (
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL || API_ORIGIN
).replace(/\/$/, '');

function resolverImagem(caminho) {
    if (!caminho) {
        return null;
    }

    if (/^https?:\/\//i.test(caminho)) {
        return caminho;
    }

    // Caminhos iniciados com /, exceto /uploads, continuam apontando
    // para a pasta public do Next.js.
    if (caminho.startsWith('/') && !caminho.startsWith('/uploads/')) {
        return caminho;
    }

    return `${IMAGE_BASE_URL}/${caminho.replace(/^\//, '')}`;
}

function formatarPreco(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(Number(valor) || 0);
}

function codigoCorSeguro(codigo) {
    const valor = String(codigo || '').trim();

    if (
        /^#[0-9a-f]{3,8}$/i.test(valor) ||
        /^(rgb|hsl)a?\([\d\s,.%]+\)$/i.test(valor) ||
        /^[a-z]+$/i.test(valor)
    ) {
        return valor;
    }

    return '#d9d9d9';
}

export default function ProductPage() {
    const params = useParams();
    const idProduto = params?.id || params?.slug;

    const [detalhes, setDetalhes] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [selectedColorId, setSelectedColorId] = useState('');
    const [selectedSizeId, setSelectedSizeId] = useState('');
    const [imagemAtiva, setImagemAtiva] = useState(0);

    useEffect(() => {
        if (!idProduto) {
            return undefined;
        }

        const abortController = new AbortController();

        async function carregarProduto() {
            setCarregando(true);
            setErro('');

            try {
                const response = await fetch(
                    `${API_BASE_URL}/produtos/${encodeURIComponent(idProduto)}/detalhes`,
                    {
                        method: 'GET',
                        headers: { Accept: 'application/json' },
                        signal: abortController.signal
                    }
                );

                const resultado = await response.json().catch(() => ({}));

                if (!response.ok || !resultado.sucesso) {
                    throw new Error(
                        resultado.erro || resultado.mensagem || 'Não foi possível carregar o produto'
                    );
                }

                setDetalhes(resultado.dados);

                const variacaoInicial = resultado.dados.variacoes.find(
                    (variacao) =>
                        String(variacao.idProduto) === String(resultado.dados.produto.idProduto) &&
                        variacao.disponivel
                ) || resultado.dados.variacoes.find((variacao) => variacao.disponivel);

                setSelectedColorId(
                    variacaoInicial?.idCor !== undefined && variacaoInicial?.idCor !== null
                        ? String(variacaoInicial.idCor)
                        : ''
                );
                setSelectedSizeId('');
                setImagemAtiva(0);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    setErro(error.message || 'Erro ao carregar o produto');
                    setDetalhes(null);
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setCarregando(false);
                }
            }
        }

        carregarProduto();
        return () => abortController.abort();
    }, [idProduto]);

    const produto = detalhes?.produto;
    const variacoes = useMemo(() => detalhes?.variacoes || [], [detalhes]);
    const cores = detalhes?.coresDisponiveis || [];

    const tamanhosDaCor = useMemo(() => {
        if (!selectedColorId) {
            return [];
        }

        const tamanhos = new Map();

        variacoes
            .filter((variacao) => String(variacao.idCor) === selectedColorId)
            .forEach((variacao) => {
                const chave = String(variacao.idTamanho);
                const atual = tamanhos.get(chave);

                tamanhos.set(chave, {
                    idTamanho: variacao.idTamanho,
                    codigoTamanho: variacao.tamanhoNome,
                    disponivel: Boolean(atual?.disponivel || variacao.disponivel)
                });
            });

        return Array.from(tamanhos.values());
    }, [selectedColorId, variacoes]);

    const variacaoSelecionada = useMemo(() => {
        if (!selectedColorId || !selectedSizeId) {
            return null;
        }

        return variacoes.find(
            (variacao) =>
                String(variacao.idCor) === selectedColorId &&
                String(variacao.idTamanho) === selectedSizeId &&
                variacao.disponivel
        ) || null;
    }, [selectedColorId, selectedSizeId, variacoes]);

    const variacaoVisual = useMemo(() => {
        if (variacaoSelecionada) {
            return variacaoSelecionada;
        }

        return variacoes.find(
            (variacao) => String(variacao.idCor) === selectedColorId
        ) || produto;
    }, [produto, selectedColorId, variacaoSelecionada, variacoes]);

    const imagens = useMemo(() => {
        if (!variacaoVisual) {
            return [];
        }

        return [
            variacaoVisual.imagem1,
            variacaoVisual.imagem2,
            variacaoVisual.imagem3,
            variacaoVisual.imagem4
        ]
            .map(resolverImagem)
            .filter(Boolean)
            .filter((imagem, index, lista) => lista.indexOf(imagem) === index);
    }, [variacaoVisual]);

    const corSelecionada = cores.find(
        (cor) => String(cor.idCor) === selectedColorId
    );
    const tamanhoSelecionado = tamanhosDaCor.find(
        (tamanho) => String(tamanho.idTamanho) === selectedSizeId
    );
    const temEstoque = variacoes.some((variacao) => variacao.disponivel);
    const precoExibido = variacaoSelecionada?.preco ?? produto?.preco ?? 0;
    const valorParcela = Number(precoExibido) / 7;
    const titulo = produto?.nomeCombinacao || produto?.nome || 'Produto';

    function selecionarCor(idCor) {
        setSelectedColorId(String(idCor));
        setSelectedSizeId('');
        setImagemAtiva(0);
    }

    function selecionarTamanho(tamanho) {
        if (!tamanho.disponivel) {
            return;
        }

        setSelectedSizeId(String(tamanho.idTamanho));
        setImagemAtiva(0);
    }

    function handleBuy() {
        if (!selectedColorId) {
            window.alert('Por favor, selecione uma cor');
            return;
        }

        if (!selectedSizeId) {
            window.alert('Por favor, selecione um tamanho');
            return;
        }

        if (!variacaoSelecionada) {
            window.alert('Esta combinação não está disponível em estoque');
            return;
        }

        // Substitua este alerta pela função real do carrinho.
        // O ID abaixo é o registro exato da combinação cor + tamanho.
        window.alert(
            `Produto adicionado ao carrinho! ID: ${variacaoSelecionada.idProduto}`
        );
    }

    if (carregando) {
        return (
            <main className="min-vh-100 bg-white d-flex align-items-center justify-content-center">
                <div className="text-center" role="status" aria-live="polite">
                    <div className="spinner-border text-dark mb-3" />
                    <p className="text-secondary mb-0">Carregando produto...</p>
                </div>
            </main>
        );
    }

    if (erro || !produto) {
        return (
            <main className="min-vh-100 bg-white d-flex align-items-center justify-content-center px-3">
                <div className="text-center">
                    <h1 className="fs-3 mb-3">Produto indisponível</h1>
                    <p className="text-secondary mb-4">
                        {erro || 'O produto solicitado não foi encontrado.'}
                    </p>
                    <button
                        type="button"
                        className="btn btn-dark px-4"
                        onClick={() => window.history.back()}
                    >
                        Voltar
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-vh-100 bg-white text-dark">
            <div className="container py-4 py-md-5 product-container">
                <nav className="small text-muted text-uppercase mb-4" aria-label="Breadcrumb">
                    <span>Início</span>
                    <span className="mx-2">/</span>
                    <span>{produto.genero || 'Unissex'}</span>
                    <span className="mx-2">/</span>
                    <span>{produto.categoriaNome || 'Produtos'}</span>
                    {produto.subcategoriaNome && (
                        <>
                            <span className="mx-2">/</span>
                            <span>{produto.subcategoriaNome}</span>
                        </>
                    )}
                    <span className="mx-2">/</span>
                    <span className="fw-semibold text-dark">{titulo}</span>
                </nav>

                <div className="row g-4 g-lg-5 align-items-start">
                    <section className="col-12 col-lg-6 sticky-lg-top product-gallery">
                        <div className="product-main-image bg-light overflow-hidden">
                            {imagens[imagemAtiva] ? (
                                <img
                                    src={imagens[imagemAtiva]}
                                    alt={`${titulo} - imagem ${imagemAtiva + 1}`}
                                    className="w-100 h-100 object-fit-cover object-position-top"
                                />
                            ) : (
                                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                                    Imagem indisponível
                                </div>
                            )}
                        </div>

                        {imagens.length > 1 && (
                            <div className="d-flex gap-2 mt-3 overflow-x-auto pb-1">
                                {imagens.map((imagem, index) => (
                                    <button
                                        key={imagem}
                                        type="button"
                                        className={`thumbnail-button ${imagemAtiva === index ? 'active' : ''}`}
                                        onClick={() => setImagemAtiva(index)}
                                        aria-label={`Visualizar imagem ${index + 1}`}
                                    >
                                        <img
                                            src={imagem}
                                            alt=""
                                            className="w-100 h-100 object-fit-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="col-12 col-lg-6 d-flex flex-column pt-2 pt-lg-0">
                        <h1 className="fs-3 fs-lg-2 fw-medium text-dark mb-2 text-uppercase lh-sm">
                            {titulo}
                        </h1>
                        <p className="small text-muted mb-4">
                            Ref: {variacaoSelecionada?.sku || produto.sku || produto.idProduto}
                        </p>

                        <div className="mb-4">
                            <p className="fs-2 fw-bold text-dark mb-1">
                                {formatarPreco(precoExibido)}
                            </p>
                            <p className="small text-secondary mb-0">
                                ou <span className="fw-semibold">7x de {formatarPreco(valorParcela)}</span>{' '}
                                sem juros no cartão
                            </p>
                        </div>

                        <hr className="text-secondary opacity-25 mb-4" />

                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="small fw-bold text-dark text-uppercase">
                                    Cor:{' '}
                                    <span className="fw-normal text-muted">
                                        {corSelecionada?.nomeCor || 'Selecione'}
                                    </span>
                                </span>
                            </div>

                            <div className="d-flex flex-wrap gap-3">
                                {cores.map((cor) => (
                                    <button
                                        key={cor.idCor}
                                        type="button"
                                        className={`color-option ${
                                            selectedColorId === String(cor.idCor) ? 'active' : ''
                                        }`}
                                        onClick={() => selecionarCor(cor.idCor)}
                                        disabled={!cor.disponivel}
                                        aria-label={`Cor ${cor.nomeCor}`}
                                        aria-pressed={selectedColorId === String(cor.idCor)}
                                        title={cor.nomeCor}
                                    >
                                        <span
                                            className="color-swatch"
                                            style={{ backgroundColor: codigoCorSeguro(cor.codigoCor) }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="small fw-bold text-dark text-uppercase">
                                    Tamanho:{' '}
                                    <span className="fw-normal text-muted">
                                        {tamanhoSelecionado?.codigoTamanho || 'Selecione'}
                                    </span>
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-link p-0 text-dark small text-decoration-underline shadow-none"
                                >
                                    Guia de Medidas
                                </button>
                            </div>

                            {!selectedColorId ? (
                                <p className="small text-secondary mb-4">
                                    Selecione uma cor para visualizar os tamanhos disponíveis.
                                </p>
                            ) : (
                                <div className="d-flex flex-wrap gap-2 mb-4">
                                    {tamanhosDaCor.map((tamanho) => (
                                        <button
                                            key={tamanho.idTamanho}
                                            type="button"
                                            onClick={() => selecionarTamanho(tamanho)}
                                            disabled={!tamanho.disponivel}
                                            className={`btn size-button rounded-circle d-flex align-items-center justify-content-center p-0 fw-medium ${
                                                selectedSizeId === String(tamanho.idTamanho)
                                                    ? 'btn-dark'
                                                    : 'btn-outline-secondary text-dark'
                                            }`}
                                            aria-pressed={selectedSizeId === String(tamanho.idTamanho)}
                                        >
                                            {tamanho.codigoTamanho}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleBuy}
                            disabled={!temEstoque}
                            className="btn btn-buy text-white w-100 py-3 fw-bold small text-uppercase shadow-sm mb-4"
                        >
                            {temEstoque ? 'Adicionar ao carrinho' : 'Produto esgotado'}
                        </button>

                        {variacaoSelecionada && (
                            <p className="small text-success mb-4">
                                {variacaoSelecionada.estoque} unidade(s) disponível(is)
                            </p>
                        )}

                        <div className="border-top pt-4 mt-2">
                            <h2 className="fs-6 fw-bold text-dark mb-3 text-uppercase">
                                Descrição do Produto
                            </h2>
                            <p className="small text-secondary lh-base mb-0">
                                {produto.descricao}
                            </p>
                        </div>
                    </section>
                </div>
            </div>

            <style jsx>{`
                .product-container {
                    max-width: 1200px;
                }

                .product-gallery {
                    top: 2rem;
                }

                .product-main-image {
                    width: 100%;
                    aspect-ratio: 3 / 4;
                    border-radius: 0.25rem;
                }

                .product-main-image img {
                    transition: transform 0.7s ease-in-out;
                }

                .product-main-image:hover img {
                    transform: scale(1.04);
                }

                .thumbnail-button {
                    width: 76px;
                    height: 96px;
                    flex: 0 0 auto;
                    padding: 0;
                    overflow: hidden;
                    background: #f5f5f5;
                    border: 2px solid transparent;
                    border-radius: 0.25rem;
                }

                .thumbnail-button.active {
                    border-color: #111;
                }

                .color-option {
                    position: relative;
                    width: 46px;
                    height: 46px;
                    padding: 4px;
                    border: 2px solid transparent;
                    border-radius: 50%;
                    background: transparent;
                }

                .color-option.active {
                    border-color: #111;
                }

                .color-option:disabled,
                .size-button:disabled {
                    cursor: not-allowed;
                    opacity: 0.35;
                    text-decoration: line-through;
                }

                .color-swatch {
                    display: block;
                    width: 100%;
                    height: 100%;
                    border: 1px solid rgba(0, 0, 0, 0.2);
                    border-radius: 50%;
                }

                .size-button {
                    width: 48px;
                    height: 48px;
                    transition: color 0.2s ease, background-color 0.2s ease,
                        border-color 0.2s ease;
                }

                .btn-buy {
                    background-color: #008542;
                    border: none;
                    letter-spacing: 0.1em;
                }

                .btn-buy:hover:not(:disabled) {
                    background-color: #006e36;
                }

                .btn-buy:disabled {
                    background-color: #7b7b7b;
                }

                @media (max-width: 991.98px) {
                    .product-gallery {
                        position: static !important;
                    }
                }

                @media (max-width: 575.98px) {
                    .product-main-image {
                        aspect-ratio: 4 / 5;
                    }
                }
            `}</style>
        </main>
    );
}