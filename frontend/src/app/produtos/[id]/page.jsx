'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
).replace(/\/$/, '');

const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

const IMAGE_BASE_URL = (
  process.env.NEXT_PUBLIC_IMAGE_BASE_URL || API_ORIGIN
).replace(/\/$/, '');

function resolverImagem(caminho) {
  if (!caminho) return null;
  if (/^https?:\/\//i.test(caminho)) return caminho;

  if (caminho.startsWith('/') && !caminho.startsWith('/uploads/')) {
    return caminho;
  }

  return `${IMAGE_BASE_URL}/${caminho.replace(/^\//, '')}`;
}

function formatarPreco(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
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
  const router = useRouter();
  const idProduto = params?.id || params?.slug;

  const [detalhes, setDetalhes] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [selectedColorId, setSelectedColorId] = useState('');
  const [selectedSizeId, setSelectedSizeId] = useState('');
  const [imagemAtiva, setImagemAtiva] = useState(0);
  const [imagensComErro, setImagensComErro] = useState(() => new Set());
  const [alertaCompra, setAlertaCompra] = useState(null);
  const [adicionandoCarrinho, setAdicionandoCarrinho] = useState(false);

  useEffect(() => {
    if (!idProduto) return undefined;

    const abortController = new AbortController();

    async function carregarProduto() {
      setCarregando(true);
      setErro('');
      setAlertaCompra(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/produtos/${encodeURIComponent(idProduto)}/detalhes`,
          {
            method: 'GET',
            headers: { Accept: 'application/json' },
            signal: abortController.signal,
          },
        );

        const resultado = await response.json().catch(() => ({}));

        if (!response.ok || !resultado.sucesso) {
          throw new Error(
            resultado.erro ||
              resultado.mensagem ||
              'Não foi possível carregar o produto',
          );
        }

        setDetalhes(resultado.dados);

        const variacaoInicial =
          resultado.dados.variacoes.find(
            (variacao) =>
              String(variacao.idProduto) ===
                String(resultado.dados.produto.idProduto) &&
              variacao.disponivel,
          ) ||
          resultado.dados.variacoes.find((variacao) => variacao.disponivel);

        setSelectedColorId(
          variacaoInicial?.idCor !== undefined &&
            variacaoInicial?.idCor !== null
            ? String(variacaoInicial.idCor)
            : '',
        );
        setSelectedSizeId('');
        setImagemAtiva(0);
        setImagensComErro(new Set());
      } catch (error) {
        if (error.name !== 'AbortError') {
          setErro(error.message || 'Erro ao carregar o produto');
          setDetalhes(null);
        }
      } finally {
        if (!abortController.signal.aborted) setCarregando(false);
      }
    }

    carregarProduto();

    return () => abortController.abort();
  }, [idProduto]);

  const produto = detalhes?.produto;
  const variacoes = useMemo(() => detalhes?.variacoes || [], [detalhes]);
  const cores = detalhes?.coresDisponiveis || [];

  const tamanhosDaCor = useMemo(() => {
    if (!selectedColorId) return [];

    const tamanhos = new Map();

    variacoes
      .filter((variacao) => String(variacao.idCor) === selectedColorId)
      .forEach((variacao) => {
        const chave = String(variacao.idTamanho);
        const atual = tamanhos.get(chave);

        tamanhos.set(chave, {
          idTamanho: variacao.idTamanho,
          codigoTamanho: variacao.tamanhoNome,
          disponivel: Boolean(atual?.disponivel || variacao.disponivel),
        });
      });

    return Array.from(tamanhos.values());
  }, [selectedColorId, variacoes]);

  const variacaoSelecionada = useMemo(() => {
    if (!selectedColorId || !selectedSizeId) return null;

    return (
      variacoes.find(
        (variacao) =>
          String(variacao.idCor) === selectedColorId &&
          String(variacao.idTamanho) === selectedSizeId &&
          variacao.disponivel,
      ) || null
    );
  }, [selectedColorId, selectedSizeId, variacoes]);

  const variacaoVisual = useMemo(() => {
    if (variacaoSelecionada) return variacaoSelecionada;

    return (
      variacoes.find(
        (variacao) => String(variacao.idCor) === selectedColorId,
      ) || produto
    );
  }, [produto, selectedColorId, variacaoSelecionada, variacoes]);

  const imagens = useMemo(() => {
    if (!variacaoVisual) return [];

    return [
      variacaoVisual.imagem1,
      variacaoVisual.imagem2,
      variacaoVisual.imagem3,
      variacaoVisual.imagem4,
    ]
      .map(resolverImagem)
      .filter(Boolean)
      .filter((imagem, index, lista) => lista.indexOf(imagem) === index);
  }, [variacaoVisual]);

  const corSelecionada = cores.find(
    (cor) => String(cor.idCor) === selectedColorId,
  );

  const tamanhoSelecionado = tamanhosDaCor.find(
    (tamanho) => String(tamanho.idTamanho) === selectedSizeId,
  );

  const temEstoque = variacoes.some((variacao) => variacao.disponivel);
  const precoExibido = variacaoSelecionada?.preco ?? produto?.preco ?? 0;
  const valorParcela = Number(precoExibido) / 7;
  const titulo = produto?.nome || produto?.nomeCombinacao || 'Produto';

  function selecionarCor(idCor) {
    setSelectedColorId(String(idCor));
    setSelectedSizeId('');
    setImagemAtiva(0);
    setImagensComErro(new Set());
    setAlertaCompra(null);
  }

  function selecionarTamanho(tamanho) {
    if (!tamanho.disponivel) return;

    setSelectedSizeId(String(tamanho.idTamanho));
    setImagemAtiva(0);
    setImagensComErro(new Set());
    setAlertaCompra(null);
  }

  function mostrarAlerta(tipo, tituloAlerta, mensagem) {
    setAlertaCompra({ tipo, titulo: tituloAlerta, mensagem });
  }

  async function handleBuy(destino = null) {
    if (!selectedColorId) {
      mostrarAlerta(
        'aviso',
        'Escolha uma cor',
        'Selecione uma das cores disponíveis antes de continuar.',
      );
      return;
    }

    if (!selectedSizeId) {
      mostrarAlerta(
        'aviso',
        'Escolha um tamanho',
        'Selecione o tamanho desejado para adicionar o produto.',
      );
      return;
    }

    if (!variacaoSelecionada) {
      mostrarAlerta(
        'erro',
        'Combinação indisponível',
        'Essa combinação de cor e tamanho está sem estoque.',
      );
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      mostrarAlerta(
        'aviso',
        'Entre na sua conta',
        'Faça login para adicionar produtos ao carrinho.',
      );
      return;
    }

    setAdicionandoCarrinho(true);
    setAlertaCompra(null);
    try {
      const response = await fetch(`${API_BASE_URL}/vendas/carrinho`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ idProduto: variacaoSelecionada.idProduto }),
      });
      const resultado = await response.json().catch(() => ({}));

      if (!response.ok || !resultado.sucesso) {
        throw new Error(
          resultado.mensagem || 'Não foi possível adicionar o produto ao carrinho.',
        );
      }

      window.dispatchEvent(new Event('carrinho-atualizado'));
      mostrarAlerta(
        'sucesso',
        'Produto adicionado',
        `${titulo} foi adicionado ao carrinho.`,
      );
      if (destino) router.push(destino);
    } catch (error) {
      mostrarAlerta(
        'erro',
        'Não foi possível adicionar',
        error.message || 'Tente novamente em instantes.',
      );
    } finally {
      setAdicionandoCarrinho(false);
    }
  }

  if (carregando) {
    return (
      <main className="product-page loading-page">
        <div className="loading-card" role="status" aria-live="polite">
          <span className="spinner-border" aria-hidden="true" />
          <div>
            <strong>Carregando produto</strong>
            <p>Buscando informações e opções disponíveis...</p>
          </div>
        </div>

        <style>{pageStyles}</style>
      </main>
    );
  }

  if (erro || !produto) {
    return (
      <main className="product-page loading-page">
        <div className="feedback-card" role="alert">
          <span className="feedback-icon">
            <i className="bi bi-exclamation-circle" aria-hidden="true" />
          </span>
          <span className="eyebrow">Catálogo Everett</span>
          <h1>Produto indisponível</h1>
          <p>{erro || 'O produto solicitado não foi encontrado.'}</p>
          <button type="button" onClick={() => window.history.back()}>
            <i className="bi bi-arrow-left" aria-hidden="true" />
            Voltar ao catálogo
          </button>
        </div>

        <style>{pageStyles}</style>
      </main>
    );
  }

  return (
    <main className="product-page">
      <div className="product-container">
        <nav className="breadcrumb" aria-label="Navegação estrutural">
          <Link href="/">Início</Link>
          <i className="bi bi-chevron-right" aria-hidden="true" />
          <Link href="/produtos">Produtos</Link>
          <i className="bi bi-chevron-right" aria-hidden="true" />
          <span>{produto.categoriaNome || produto.genero || 'Catálogo'}</span>
          <i className="bi bi-chevron-right" aria-hidden="true" />
          <strong>{titulo}</strong>
        </nav>

        <header className="product-heading">
          <div>
            <span className="eyebrow">Catálogo Everett</span>
            <h1>{titulo}</h1>
          </div>

          <Link href="/produtos" className="back-link">
            <i className="bi bi-grid" aria-hidden="true" />
            Ver todos os produtos
          </Link>
        </header>

        <div className="product-layout">
          <section className="gallery-card" aria-label="Imagens do produto">
            <div className="main-image">
              {imagens[imagemAtiva] && !imagensComErro.has(imagens[imagemAtiva]) ? (
                <img
                  src={imagens[imagemAtiva]}
                  alt={`${titulo} - imagem ${imagemAtiva + 1}`}
                  onError={() => {
                    setImagensComErro((atuais) => {
                      const proximas = new Set(atuais);
                      proximas.add(imagens[imagemAtiva]);
                      return proximas;
                    });
                  }}
                />
              ) : (
                <div className="image-fallback">
                  <i className="bi bi-image" aria-hidden="true" />
                  <span>Imagem indisponível</span>
                </div>
              )}

              {!temEstoque ? <span className="stock-badge">Esgotado</span> : null}
            </div>

            {imagens.length > 1 ? (
              <div className="thumbnails" aria-label="Outras imagens">
                {imagens
                  .map((imagem, index) => ({ imagem, index }))
                  .filter(({ imagem }) => !imagensComErro.has(imagem))
                  .map(({ imagem, index }) => (
                  <button
                    key={imagem}
                    type="button"
                    className={imagemAtiva === index ? 'active' : ''}
                    onClick={() => setImagemAtiva(index)}
                    aria-label={`Visualizar imagem ${index + 1}`}
                    aria-pressed={imagemAtiva === index}
                  >
                    <img
                      src={imagem}
                      alt=""
                      onError={() => {
                        setImagensComErro((atuais) => {
                          const proximas = new Set(atuais);
                          proximas.add(imagem);
                          return proximas;
                        });
                      }}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section className="details-card">
            <div className="product-meta">
              <span>{produto.categoriaNome || produto.genero || 'Everett'}</span>
              {variacaoVisual?.corNome ? <span>{variacaoVisual.corNome}</span> : null}
              <span>
                Ref. {variacaoSelecionada?.sku || produto.sku || produto.idProduto}
              </span>
            </div>

            <h2>{titulo}</h2>

            <div className="price-block">
              <strong>{formatarPreco(precoExibido)}</strong>
              <p>
                ou <b>7x de {formatarPreco(valorParcela)}</b> sem juros no cartão
              </p>
            </div>

            <div className="divider" />

            <div className="option-group">
              <div className="option-heading">
                <div>
                  <span>Cor</span>
                  <strong>{corSelecionada?.nomeCor || 'Selecione'}</strong>
                </div>
              </div>

              <div className="color-list">
                {cores.map((cor) => {
                  const ativa = selectedColorId === String(cor.idCor);

                  return (
                    <button
                      key={cor.idCor}
                      type="button"
                      className={ativa ? 'active' : ''}
                      onClick={() => selecionarCor(cor.idCor)}
                      disabled={!cor.disponivel}
                      aria-label={`Cor ${cor.nomeCor}`}
                      aria-pressed={ativa}
                      title={cor.nomeCor}
                    >
                      <span
                        className="color-swatch"
                        style={{ backgroundColor: codigoCorSeguro(cor.codigoCor) }}
                      />
                      <span className="color-name">{cor.nomeCor}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="option-group">
              <div className="option-heading">
                <div>
                  <span>Tamanho</span>
                  <strong>
                    {tamanhoSelecionado?.codigoTamanho || 'Selecione'}
                  </strong>
                </div>

                <button type="button" className="size-guide">
                  Guia de medidas
                </button>
              </div>

              {!selectedColorId ? (
                <p className="option-help">
                  Selecione uma cor para visualizar os tamanhos disponíveis.
                </p>
              ) : (
                <div className="size-list">
                  {tamanhosDaCor.map((tamanho) => {
                    const ativo =
                      selectedSizeId === String(tamanho.idTamanho);

                    return (
                      <button
                        key={tamanho.idTamanho}
                        type="button"
                        onClick={() => selecionarTamanho(tamanho)}
                        disabled={!tamanho.disponivel}
                        className={ativo ? 'active' : ''}
                        aria-pressed={ativo}
                      >
                        {tamanho.codigoTamanho}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="purchase-row">
              <div className="purchase-actions">
                <button
                  type="button"
                  onClick={() => handleBuy()}
                  disabled={!temEstoque || adicionandoCarrinho}
                  className="buy-button"
                >
                  <i className="bi bi-bag-plus" aria-hidden="true" />
                  {adicionandoCarrinho
                    ? 'Adicionando...'
                    : temEstoque
                      ? 'Adicionar ao carrinho'
                      : 'Produto esgotado'}
                </button>

                <button
                  type="button"
                  onClick={() => handleBuy('/finalizarCompra')}
                  disabled={!temEstoque || adicionandoCarrinho}
                  className="buy-button buy-now-button"
                >
                  <i className="bi bi-lightning-charge" aria-hidden="true" />
                  Comprar agora
                </button>
              </div>

              {alertaCompra ? (
                <aside
                  className={`purchase-alert ${alertaCompra.tipo}`}
                  role={alertaCompra.tipo === 'sucesso' ? 'status' : 'alert'}
                  aria-live="polite"
                >
                  <span className="alert-icon">
                    <i
                      className={
                        alertaCompra.tipo === 'sucesso'
                          ? 'bi bi-check-lg'
                          : alertaCompra.tipo === 'erro'
                            ? 'bi bi-x-lg'
                            : 'bi bi-exclamation-lg'
                      }
                      aria-hidden="true"
                    />
                  </span>

                  <div>
                    <strong>{alertaCompra.titulo}</strong>
                    <p>{alertaCompra.mensagem}</p>
                    {alertaCompra.tipo === 'sucesso' ? (
                      <div className="alert-actions">
                        <Link href="/produtos">Continuar comprando</Link>
                        <Link href="/finalizarCompra">Ir para pagamento</Link>
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => setAlertaCompra(null)}
                    aria-label="Fechar aviso"
                  >
                    <i className="bi bi-x" aria-hidden="true" />
                  </button>
                </aside>
              ) : null}
            </div>

            {variacaoSelecionada ? (
              <p className="available-stock">
                <i className="bi bi-check-circle" aria-hidden="true" />
                {variacaoSelecionada.estoque} unidade(s) disponível(is)
              </p>
            ) : null}

            <div className="description-card">
              <div>
                <i className="bi bi-card-text" aria-hidden="true" />
                <h3>Descrição do produto</h3>
              </div>
              <p>{produto.descricao || 'Descrição não informada.'}</p>
            </div>
          </section>
        </div>
      </div>

      <style>{pageStyles}</style>
    </main>
  );
}

const pageStyles = `
  .product-page {
    min-height: 100vh;
    color: #191919;
    background:
      radial-gradient(circle at 8% 4%, rgba(210, 178, 112, 0.12), transparent 24rem),
      #f6f6f3;
    padding: 2rem 1rem 5rem;
  }

  .product-container {
    width: min(100%, 1240px);
    margin: 0 auto;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    min-width: 0;
    margin-bottom: 1.5rem;
    color: #77766f;
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    white-space: nowrap;
    overflow: hidden;
  }

  .breadcrumb :global(a) {
    color: inherit;
    text-decoration: none;
  }

  .breadcrumb :global(a):hover {
    color: #171717;
  }

  .breadcrumb :global(i) {
    flex: 0 0 auto;
    font-size: 0.58rem;
  }

  .breadcrumb strong {
    color: #292929;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .product-heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .eyebrow {
    display: block;
    margin-bottom: 0.45rem;
    color: #8a6732;
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.16em;
  }

  .product-heading h1 {
    max-width: 800px;
    margin: 0;
    font-size: clamp(1.65rem, 3vw, 2.5rem);
    font-weight: 650;
    line-height: 1.08;
    letter-spacing: -0.035em;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    flex: 0 0 auto;
    min-height: 42px;
    padding: 0.65rem 0.95rem;
    border: 1px solid #deded8;
    border-radius: 10px;
    color: #393936;
    background: rgba(255, 255, 255, 0.7);
    font-size: 0.82rem;
    font-weight: 700;
    text-decoration: none;
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  .back-link:hover {
    border-color: #aaa99f;
    background: #fff;
  }

  .product-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.03fr) minmax(380px, 0.97fr);
    align-items: start;
    gap: 1.75rem;
  }

  .gallery-card,
  .details-card {
    border: 1px solid #e3e3dd;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 18px 50px rgba(28, 28, 24, 0.06);
  }

  .gallery-card {
    position: sticky;
    top: 1.5rem;
    padding: 1rem;
  }

  .main-image {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    border-radius: 13px;
    background: #f0f0ed;
  }

  .main-image > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
    transition: transform 0.6s ease;
  }

  .main-image:hover > img {
    transform: scale(1.025);
  }

  .image-fallback {
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 0.7rem;
    width: 100%;
    height: 100%;
    color: #8a8a83;
    font-size: 0.85rem;
  }

  .image-fallback :global(i) {
    font-size: 2rem;
  }

  .stock-badge {
    position: absolute;
    top: 1rem;
    left: 1rem;
    padding: 0.45rem 0.7rem;
    border-radius: 999px;
    color: #fff;
    background: #252525;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .thumbnails {
    display: flex;
    gap: 0.7rem;
    margin-top: 0.85rem;
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .thumbnails button {
    width: 74px;
    height: 88px;
    flex: 0 0 auto;
    padding: 3px;
    overflow: hidden;
    border: 1px solid #deded8;
    border-radius: 9px;
    background: #f3f3f0;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .thumbnails button.active {
    border-color: #1e1e1e;
    box-shadow: 0 0 0 1px #1e1e1e;
  }

  .thumbnails img {
    width: 100%;
    height: 100%;
    border-radius: 5px;
    object-fit: cover;
  }

  .details-card {
    padding: clamp(1.3rem, 3vw, 2.2rem);
  }

  .product-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.1rem;
  }

  .product-meta span {
    padding: 0.35rem 0.55rem;
    border-radius: 6px;
    color: #686862;
    background: #f2f2ef;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .details-card > h2 {
    margin: 0 0 1.4rem;
    font-size: clamp(1.55rem, 3vw, 2.25rem);
    font-weight: 600;
    line-height: 1.14;
    letter-spacing: -0.035em;
  }

  .price-block strong {
    display: block;
    font-size: clamp(1.8rem, 3vw, 2.3rem);
    line-height: 1;
    letter-spacing: -0.035em;
  }

  .price-block p {
    margin: 0.65rem 0 0;
    color: #73736d;
    font-size: 0.84rem;
  }

  .price-block b {
    color: #383834;
  }

  .divider {
    height: 1px;
    margin: 1.6rem 0;
    background: #e7e7e1;
  }

  .option-group + .option-group {
    margin-top: 1.7rem;
  }

  .option-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.85rem;
  }

  .option-heading > div {
    display: flex;
    align-items: baseline;
    gap: 0.45rem;
  }

  .option-heading span {
    font-size: 0.74rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .option-heading strong {
    color: #777770;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .color-list,
  .size-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  .color-list button {
    min-width: 44px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    padding: 4px 0.75rem 4px 4px;
    border: 1px solid #d7d7d1;
    border-radius: 999px;
    color: #30302d;
    background: #fff;
    font-size: 0.76rem;
    font-weight: 700;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .color-list button.active {
    border-color: #171717;
    box-shadow: 0 0 0 1px #171717;
  }

  .color-list .color-swatch {
    display: block;
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    border: 1px solid rgba(0, 0, 0, 0.14);
    border-radius: 50%;
  }

  .color-name {
    white-space: nowrap;
  }

  .color-list button:disabled,
  .size-list button:disabled {
    cursor: not-allowed;
    opacity: 0.32;
    text-decoration: line-through;
  }

  .size-guide {
    padding: 0;
    border: 0;
    color: #51514c;
    background: none;
    font-size: 0.76rem;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .size-list button {
    min-width: 47px;
    height: 43px;
    padding: 0 0.75rem;
    border: 1px solid #d2d2cc;
    border-radius: 8px;
    color: #30302d;
    background: #fff;
    font-size: 0.78rem;
    font-weight: 750;
    transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease;
  }

  .size-list button:hover:not(:disabled),
  .size-list button.active {
    border-color: #1b1b1b;
    color: #fff;
    background: #1b1b1b;
  }

  .option-help {
    margin: 0;
    padding: 0.8rem;
    border: 1px dashed #d8d8d1;
    border-radius: 8px;
    color: #777770;
    background: #fafaf8;
    font-size: 0.78rem;
  }

  .purchase-row {
    position: relative;
    display: grid;
    gap: 0.75rem;
    margin-top: 1.8rem;
  }

  .purchase-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .buy-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.65rem;
    min-height: 58px;
    padding: 0.9rem 1rem;
    border: 0;
    border-radius: 10px;
    color: #fff;
    background: #1c1c1c;
    box-shadow: 0 10px 22px rgba(28, 28, 28, 0.15);
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    transition: transform 0.2s ease, background 0.2s ease;
  }

  .buy-button:hover:not(:disabled) {
    background: #343431;
    transform: translateY(-1px);
  }

  .buy-now-button {
    color: #06262d;
    background: #40ffdc;
    box-shadow: 0 10px 22px rgba(0, 169, 212, 0.15);
  }

  .buy-now-button:hover:not(:disabled) {
    background: #7dffe7;
  }

  .buy-button:disabled {
    cursor: not-allowed;
    background: #8c8c87;
    box-shadow: none;
  }

  .purchase-alert {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.65rem;
    min-height: 58px;
    padding: 0.65rem 0.7rem;
    border: 1px solid;
    border-radius: 10px;
    animation: alert-in 0.25s ease both;
  }

  .purchase-alert.aviso {
    border-color: #e7cf93;
    color: #684b0d;
    background: #fff8e4;
  }

  .purchase-alert.erro {
    border-color: #e8b7b3;
    color: #7a2420;
    background: #fff1f0;
  }

  .purchase-alert.sucesso {
    border-color: #acd8bd;
    color: #176333;
    background: #edf9f1;
  }

  .alert-icon {
    display: grid;
    place-items: center;
    width: 29px;
    height: 29px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.72);
    font-size: 0.78rem;
  }

  .purchase-alert strong {
    display: block;
    margin-bottom: 0.12rem;
    font-size: 0.76rem;
  }

  .purchase-alert p {
    margin: 0;
    font-size: 0.68rem;
    line-height: 1.35;
  }

  .alert-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 0.8rem;
    margin-top: 0.45rem;
  }

  .alert-actions a {
    color: currentColor;
    font-size: 0.68rem;
    font-weight: 800;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .purchase-alert > button {
    align-self: start;
    padding: 0;
    border: 0;
    color: currentColor;
    background: transparent;
    font-size: 1rem;
    opacity: 0.7;
  }

  .available-stock {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin: 0.75rem 0 0;
    color: #287344;
    font-size: 0.75rem;
  }

  .description-card {
    margin-top: 1.8rem;
    padding: 1.2rem;
    border: 1px solid #e2e2dc;
    border-radius: 11px;
    background: #fafaf8;
  }

  .description-card > div {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    margin-bottom: 0.65rem;
  }

  .description-card h3 {
    margin: 0;
    font-size: 0.76rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  .description-card p {
    margin: 0;
    color: #666660;
    font-size: 0.83rem;
    line-height: 1.7;
  }

  .loading-page {
    display: grid;
    place-items: center;
    padding: 1rem;
  }

  .loading-card,
  .feedback-card {
    border: 1px solid #e1e1db;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 18px 50px rgba(28, 28, 24, 0.07);
  }

  .loading-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 1.4rem;
  }

  .loading-card :global(.spinner-border) {
    width: 1.7rem;
    height: 1.7rem;
    color: #9a7135;
  }

  .loading-card strong {
    display: block;
    font-size: 0.9rem;
  }

  .loading-card p {
    margin: 0.2rem 0 0;
    color: #777770;
    font-size: 0.75rem;
  }

  .feedback-card {
    width: min(100%, 470px);
    padding: 2.3rem;
    text-align: center;
  }

  .feedback-icon {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    margin: 0 auto 1rem;
    border-radius: 50%;
    color: #7a2420;
    background: #fff1f0;
    font-size: 1.3rem;
  }

  .feedback-card h1 {
    margin: 0 0 0.7rem;
    font-size: 1.55rem;
  }

  .feedback-card p {
    margin: 0 0 1.4rem;
    color: #71716b;
    font-size: 0.86rem;
  }

  .feedback-card button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 0;
    border-radius: 9px;
    color: #fff;
    background: #1c1c1c;
    font-size: 0.78rem;
    font-weight: 700;
  }

  html.dark .product-page,
  html[data-bs-theme="dark"] .product-page {
    color: #f8f7f9;
    background:
      radial-gradient(circle at 8% 4%, rgba(0, 169, 212, 0.1), transparent 24rem),
      #100d14;
  }

  html.dark .breadcrumb,
  html.dark .price-block p,
  html.dark .option-heading strong,
  html.dark .option-help,
  html.dark .description-card p,
  html.dark .loading-card p,
  html.dark .feedback-card p,
  html[data-bs-theme="dark"] .breadcrumb,
  html[data-bs-theme="dark"] .price-block p,
  html[data-bs-theme="dark"] .option-heading strong,
  html[data-bs-theme="dark"] .option-help,
  html[data-bs-theme="dark"] .description-card p,
  html[data-bs-theme="dark"] .loading-card p,
  html[data-bs-theme="dark"] .feedback-card p {
    color: #b4aab8;
  }

  html.dark .breadcrumb strong,
  html.dark .price-block b,
  html[data-bs-theme="dark"] .breadcrumb strong,
  html[data-bs-theme="dark"] .price-block b {
    color: #f8f7f9;
  }

  html.dark .eyebrow,
  html[data-bs-theme="dark"] .eyebrow {
    color: #40ffdc;
  }

  html.dark .back-link,
  html.dark .gallery-card,
  html.dark .details-card,
  html.dark .loading-card,
  html.dark .feedback-card,
  html[data-bs-theme="dark"] .back-link,
  html[data-bs-theme="dark"] .gallery-card,
  html[data-bs-theme="dark"] .details-card,
  html[data-bs-theme="dark"] .loading-card,
  html[data-bs-theme="dark"] .feedback-card {
    color: #f8f7f9;
    background: #1c1720;
    border-color: #3a303f;
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.24);
  }

  html.dark .back-link:hover,
  html[data-bs-theme="dark"] .back-link:hover {
    color: #40ffdc;
    background: #161219;
    border-color: #00a9d4;
  }

  html.dark .main-image,
  html.dark .thumbnails button,
  html[data-bs-theme="dark"] .main-image,
  html[data-bs-theme="dark"] .thumbnails button {
    color: #40ffdc;
    background: #161219;
    border-color: #4a3f50;
  }

  html.dark .thumbnails button.active,
  html.dark .color-list button.active,
  html[data-bs-theme="dark"] .thumbnails button.active,
  html[data-bs-theme="dark"] .color-list button.active {
    border-color: #00a9d4;
    box-shadow: 0 0 0 1px #00a9d4;
  }

  html.dark .product-meta span,
  html[data-bs-theme="dark"] .product-meta span {
    color: #d6ced9;
    background: #161219;
  }

  html.dark .divider,
  html[data-bs-theme="dark"] .divider {
    background: #3a303f;
  }

  html.dark .color-list button,
  html.dark .size-list button,
  html[data-bs-theme="dark"] .color-list button,
  html[data-bs-theme="dark"] .size-list button {
    color: #f8f7f9;
    background: #161219;
    border-color: #4a3f50;
  }

  html.dark .size-list button:hover:not(:disabled),
  html.dark .size-list button.active,
  html[data-bs-theme="dark"] .size-list button:hover:not(:disabled),
  html[data-bs-theme="dark"] .size-list button.active {
    color: #07181d;
    background: #40ffdc;
    border-color: #40ffdc;
  }

  html.dark .size-guide,
  html[data-bs-theme="dark"] .size-guide {
    color: #40ffdc;
  }

  html.dark .option-help,
  html.dark .description-card,
  html[data-bs-theme="dark"] .option-help,
  html[data-bs-theme="dark"] .description-card {
    background: #161219;
    border-color: #3a303f;
  }

  html.dark .buy-button,
  html.dark .feedback-card button,
  html[data-bs-theme="dark"] .buy-button,
  html[data-bs-theme="dark"] .feedback-card button {
    color: #ffffff;
    background: #00a9d4;
  }

  html.dark .buy-now-button,
  html[data-bs-theme="dark"] .buy-now-button {
    color: #07181d;
    background: #40ffdc;
  }

  html.dark .available-stock,
  html[data-bs-theme="dark"] .available-stock {
    color: #40ffdc;
  }

  @keyframes alert-in {
    from {
      opacity: 0;
      transform: translateX(-8px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @media (max-width: 991.98px) {
    .product-layout {
      grid-template-columns: 1fr;
    }

    .gallery-card {
      position: static;
    }

    .main-image {
      aspect-ratio: 4 / 4.7;
    }
  }

  @media (max-width: 650px) {
    .product-page {
      padding: 1.2rem 0.75rem 3rem;
    }

    .breadcrumb {
      margin-bottom: 1rem;
    }

    .product-heading {
      align-items: start;
      flex-direction: column;
      margin-bottom: 1.35rem;
    }

    .back-link {
      min-height: 38px;
    }

    .product-layout {
      gap: 1rem;
    }

    .gallery-card,
    .details-card {
      border-radius: 13px;
    }

    .gallery-card {
      padding: 0.65rem;
    }

    .main-image {
      aspect-ratio: 4 / 5;
      border-radius: 9px;
    }

    .details-card {
      padding: 1.25rem;
    }

    .purchase-row {
      grid-template-columns: 1fr;
    }

    .purchase-actions {
      grid-template-columns: 1fr;
    }

    .color-list button {
      flex: 1 1 calc(50% - 0.65rem);
    }

    .purchase-alert {
      min-height: auto;
    }

    .size-guide {
      font-size: 0.7rem;
    }
  }

  @media (max-width: 390px) {
    .product-page {
      padding-inline: 0.5rem;
    }

    .details-card {
      padding: 1rem;
    }

    .color-list button {
      flex-basis: 100%;
    }

    .option-heading {
      align-items: flex-start;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .main-image > img,
    .buy-button,
    .purchase-alert {
      transition: none;
      animation: none;
    }
  }
`;
