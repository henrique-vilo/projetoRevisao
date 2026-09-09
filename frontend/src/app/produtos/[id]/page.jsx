'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
)
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

const API_BASE_URL = `${API_ORIGIN}/api`;

const IMAGE_BASE_URL = (
  process.env.NEXT_PUBLIC_IMAGE_BASE_URL || API_ORIGIN
).replace(/\/+$/, '');

function resolverImagem(caminho) {
  if (!caminho) return null;

  const valor = String(caminho).trim();

  if (!valor) return null;

  if (/^https?:\/\//i.test(valor)) return valor;

  if (valor.startsWith('/') && !valor.startsWith('/uploads/')) {
    return valor;
  }

  const caminhoLimpo = valor.replace(/^\/+/, '');
  const baseIncluiUploads = /\/uploads$/i.test(IMAGE_BASE_URL);

  if (baseIncluiUploads) {
    return `${IMAGE_BASE_URL}/${caminhoLimpo.replace(/^uploads\//, '')}`;
  }

  return `${IMAGE_BASE_URL}/${
    caminhoLimpo.startsWith('uploads/')
      ? caminhoLimpo
      : `uploads/${caminhoLimpo}`
  }`;
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
    /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(valor)
    || /^(rgb|hsl)a?\([\d\s,.%]+\)$/i.test(valor)
    || /^[a-z]+$/i.test(valor)
  ) {
    return valor;
  }

  return '#d9d9d9';
}

export default function ProductPage() {
  const params = useParams();
  const parametroId = params?.id || params?.slug;
  const idProduto = Array.isArray(parametroId)
    ? parametroId[0]
    : parametroId;

  const [detalhes, setDetalhes] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [selectedColorId, setSelectedColorId] = useState('');
  const [selectedSizeId, setSelectedSizeId] = useState('');

  const [imagemAtiva, setImagemAtiva] = useState(0);
  const [imagensComErro, setImagensComErro] = useState(() => new Set());

  const [alertaCompra, setAlertaCompra] = useState(null);
  const [guiaAberto, setGuiaAberto] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    if (!idProduto) {
      setDetalhes(null);
      setErro('O produto solicitado não foi identificado.');
      setCarregando(false);
      return () => abortController.abort();
    }

    async function carregarProduto() {
      setCarregando(true);
      setErro('');
      setDetalhes(null);
      setAlertaCompra(null);
      setGuiaAberto(false);
      setSelectedColorId('');
      setSelectedSizeId('');
      setImagemAtiva(0);
      setImagensComErro(new Set());

      try {
        const response = await fetch(
          `${API_BASE_URL}/produtos/${encodeURIComponent(idProduto)}/detalhes`,
          {
            method: 'GET',
            headers: { Accept: 'application/json' },
            signal: abortController.signal,
            cache: 'no-store',
          },
        );

        const resultado = await response.json().catch(() => ({}));

        if (!response.ok || !resultado?.sucesso) {
          throw new Error(
            resultado?.erro
            || resultado?.mensagem
            || 'Não foi possível carregar o produto.',
          );
        }

        if (
          !resultado.dados?.produto
          || !Array.isArray(resultado.dados.variacoes)
        ) {
          throw new Error('As informações do produto estão incompletas.');
        }

        if (abortController.signal.aborted) return;

        const dados = {
          ...resultado.dados,
          variacoes: resultado.dados.variacoes.map((variacao) => ({
            ...variacao,
            preco: Number(variacao.preco),
            estoque: Number(variacao.estoque),
            disponivel: Number(variacao.estoque) > 0,
          })),
        };

        const variacaoDaRota = dados.variacoes.find(
          (variacao) =>
            String(variacao.idProduto) === String(dados.produto.idProduto),
        );

        const variacaoInicial =
          (variacaoDaRota?.disponivel ? variacaoDaRota : null)
          || dados.variacoes.find((variacao) => variacao.disponivel)
          || variacaoDaRota
          || dados.variacoes[0];

        setDetalhes(dados);

        setSelectedColorId(
          variacaoInicial?.idCor != null
            ? String(variacaoInicial.idCor)
            : '',
        );
      } catch (error) {
        if (!abortController.signal.aborted) {
          setErro(error.message || 'Erro ao carregar o produto.');
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

  const variacoes = useMemo(
    () => detalhes?.variacoes || [],
    [detalhes],
  );

  const cores = useMemo(() => {
    const mapa = new Map();

    for (const variacao of variacoes) {
      if (variacao.idCor == null) continue;

      const chave = String(variacao.idCor);
      const atual = mapa.get(chave);

      mapa.set(chave, {
        idCor: variacao.idCor,
        nomeCor: variacao.corNome,
        codigoCor: variacao.codigoCor,
        disponivel: Boolean(atual?.disponivel || variacao.disponivel),
      });
    }

    return Array.from(mapa.values());
  }, [variacoes]);

  const variacoesDaCor = useMemo(
    () => variacoes.filter(
      (variacao) => String(variacao.idCor) === selectedColorId,
    ),
    [selectedColorId, variacoes],
  );

  const tamanhosDaCor = useMemo(() => {
    const tamanhos = new Map();

    for (const variacao of variacoesDaCor) {
      if (variacao.idTamanho == null) continue;

      const chave = String(variacao.idTamanho);
      const atual = tamanhos.get(chave);

      tamanhos.set(chave, {
        idTamanho: variacao.idTamanho,
        codigoTamanho: variacao.tamanhoNome,
        disponivel: Boolean(atual?.disponivel || variacao.disponivel),
      });
    }

    return Array.from(tamanhos.values());
  }, [variacoesDaCor]);

  const variacaoSelecionada = useMemo(() => {
    if (!selectedColorId || !selectedSizeId) return null;

    return variacoesDaCor.find(
      (variacao) =>
        String(variacao.idTamanho) === selectedSizeId
        && variacao.disponivel,
    ) || null;
  }, [selectedColorId, selectedSizeId, variacoesDaCor]);

  const variacaoVisual = useMemo(() => {
    if (variacaoSelecionada) return variacaoSelecionada;

    return variacoesDaCor.find(
      (variacao) =>
        String(variacao.idProduto) === String(produto?.idProduto)
        && variacao.disponivel,
    )
      || variacoesDaCor.find((variacao) => variacao.disponivel)
      || variacoesDaCor[0]
      || produto;
  }, [produto, variacaoSelecionada, variacoesDaCor]);

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

  const faixaPreco = useMemo(() => {
    if (variacaoSelecionada) {
      return {
        minimo: variacaoSelecionada.preco,
        maximo: variacaoSelecionada.preco,
      };
    }

    const candidatas = selectedColorId
      ? variacoesDaCor
      : variacoes;

    const disponiveis = candidatas.filter(
      (variacao) => variacao.disponivel,
    );

    const base = disponiveis.length > 0 ? disponiveis : candidatas;

    const precos = base
      .map((variacao) => Number(variacao.preco))
      .filter((preco) => Number.isFinite(preco) && preco >= 0);

    if (precos.length === 0) {
      const preco = Number(variacaoVisual?.preco ?? produto?.preco) || 0;
      return { minimo: preco, maximo: preco };
    }

    return {
      minimo: Math.min(...precos),
      maximo: Math.max(...precos),
    };
  }, [
    produto,
    selectedColorId,
    variacaoSelecionada,
    variacaoVisual,
    variacoes,
    variacoesDaCor,
  ]);

  const titulo = produto?.nome || 'Produto';

  const resumoSelecao = [
    corSelecionada?.nomeCor,
    tamanhoSelecionado?.codigoTamanho
      ? `Tamanho ${tamanhoSelecionado.codigoTamanho}`
      : null,
    produto?.modeloNome,
  ].filter(Boolean).join(' • ');

  const precoExibido = faixaPreco.minimo;
  const mostrarAPartirDe = !variacaoSelecionada
    && faixaPreco.maximo > faixaPreco.minimo;

  const valorParcela = precoExibido / 7;

  const indiceImagem = imagemAtiva < imagens.length ? imagemAtiva : 0;
  const imagemAtual = imagens[indiceImagem];

  function selecionarCor(idCor) {
    setSelectedColorId(String(idCor));
    setSelectedSizeId('');
    setImagemAtiva(0);
    setAlertaCompra(null);
  }

  function selecionarTamanho(tamanho) {
    if (!tamanho.disponivel) return;

    setSelectedSizeId(String(tamanho.idTamanho));
    setImagemAtiva(0);
    setAlertaCompra(null);
  }

  function registrarErroImagem(url) {
    setImagensComErro((atuais) => new Set(atuais).add(url));
  }

  function mostrarAlerta(tipo, tituloAlerta, mensagem) {
    setAlertaCompra({
      tipo,
      titulo: tituloAlerta,
      mensagem,
    });
  }

  async function handleBuy() {
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
  const usuarioSalvo = localStorage.getItem('usuario');

  if (!token || !usuarioSalvo) {
    mostrarAlerta(
      'aviso',
      'Entre na sua conta',
      'Você precisa estar logado para adicionar produtos ao carrinho.',
    );
    return;
  }

  let usuario;
  try {
    usuario = JSON.parse(usuarioSalvo);
  } catch {
    mostrarAlerta(
      'erro',
      'Sessão inválida',
      'Faça login novamente para continuar.',
    );
    return;
  }

  const idUsuario = Number(usuario?.idUsuario ?? usuario?.id);

  if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
    mostrarAlerta(
      'erro',
      'Sessão inválida',
      'Faça login novamente para continuar.',
    );
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/vendas/carrinho`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        idProduto: variacaoSelecionada.idProduto,
      }),
    });

    const resultado = await response.json().catch(() => ({}));

    if (!response.ok || !resultado.sucesso) {
      throw new Error(
        resultado.mensagem || 'Não foi possível adicionar o produto ao carrinho.',
      );
    }

    mostrarAlerta(
      'sucesso',
      'Produto adicionado',
      `${titulo} foi adicionado ao carrinho.`,
    );

    window.dispatchEvent(new Event('carrinho-atualizado'));
  } catch (error) {
    mostrarAlerta(
      'erro',
      'Erro ao adicionar',
      error.message || 'Não foi possível adicionar o produto ao carrinho.',
    );
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

          <Link href="/produtos" className="feedback-back">
            <i className="bi bi-arrow-left" aria-hidden="true" />
            Voltar ao catálogo
          </Link>
        </div>
        <style>{pageStyles}</style>
      </main>
    );
  }

  return (
    <main className="product-page">
      <div className="product-container">
        <nav className="product-breadcrumb" aria-label="Navegação estrutural">
          <Link href="/">Início</Link>
          <i className="bi bi-chevron-right" aria-hidden="true" />

          <Link href="/produtos">Produtos</Link>
          <i className="bi bi-chevron-right" aria-hidden="true" />

          {produto.idCategoria ? (
            <Link href={`/produtos?idCategoria=${produto.idCategoria}`}>
              {produto.categoriaNome || 'Categoria'}
            </Link>
          ) : (
            <span>{produto.genero || 'Catálogo'}</span>
          )}

          <i className="bi bi-chevron-right" aria-hidden="true" />
          <strong aria-current="page">{titulo}</strong>
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
              {imagemAtual && !imagensComErro.has(imagemAtual) ? (
                <img
                  key={imagemAtual}
                  src={imagemAtual}
                  alt={`${titulo}${
                    corSelecionada?.nomeCor
                      ? ` - ${corSelecionada.nomeCor}`
                      : ''
                  } - imagem ${indiceImagem + 1}`}
                  onError={() => registrarErroImagem(imagemAtual)}
                />
              ) : (
                <div className="image-fallback">
                  <i className="bi bi-image" aria-hidden="true" />
                  <span>Imagem indisponível</span>
                </div>
              )}

              {!temEstoque ? (
                <span className="stock-badge">Esgotado</span>
              ) : null}
            </div>

            {imagens.length > 1 ? (
              <div className="thumbnails" aria-label="Outras imagens">
                {imagens.map((imagem, index) => (
                  <button
                    key={imagem}
                    type="button"
                    className={indiceImagem === index ? 'active' : ''}
                    onClick={() => setImagemAtiva(index)}
                    aria-label={`Visualizar imagem ${index + 1}`}
                    aria-pressed={indiceImagem === index}
                  >
                    {imagensComErro.has(imagem) ? (
                      <i className="bi bi-image" aria-hidden="true" />
                    ) : (
                      <img
                        src={imagem}
                        alt=""
                        onError={() => registrarErroImagem(imagem)}
                      />
                    )}
                  </button>
                ))}
              </div>
            ) : null}
          </section>




          <section className="details-card" aria-labelledby="selection-title">
            <div className="product-meta">
              <span>
                {produto.categoriaNome || produto.genero || 'Everett'}
              </span>

              {corSelecionada?.nomeCor ? (
                <span>{corSelecionada.nomeCor}</span>
              ) : null}

              {variacaoSelecionada?.sku ? (
                <span>Ref. {variacaoSelecionada.sku}</span>
              ) : null}
            </div>

             <h2 id="selection-title">
               {variacaoSelecionada?.nomeCombinacao || titulo}
              </h2>

            <p className="selection-summary" aria-live="polite">
              {resumoSelecao || 'Selecione as opções do produto.'}
            </p>

            <div className="price-block" aria-live="polite">
              {mostrarAPartirDe ? (
                <span className="price-prefix">A partir de</span>
              ) : null}

              <strong>{formatarPreco(precoExibido)}</strong>

              <p>
                {mostrarAPartirDe ? 'Parcelas a partir de ' : 'ou '}
                <b>7x de {formatarPreco(valorParcela)}</b>
                {' '}sem juros no cartão
              </p>
            </div>

            <div className="divider" />

            <div className="option-group">
              <div className="option-heading">
                <div>
                  <span id="color-label">Cor</span>
                  <strong>{corSelecionada?.nomeCor || 'Selecione'}</strong>
                </div>
              </div>

              <div
                className="color-list"
                role="group"
                aria-labelledby="color-label"
              >
                {cores.map((cor) => {
                  const ativa = selectedColorId === String(cor.idCor);

                  return (
                    <button
                      key={cor.idCor}
                      type="button"
                      className={ativa ? 'active' : ''}
                      onClick={() => selecionarCor(cor.idCor)}
                      disabled={!cor.disponivel}
                      aria-label={`Cor ${cor.nomeCor}${
                        cor.disponivel ? '' : ', esgotada'
                      }`}
                      aria-pressed={ativa}
                      title={`${cor.nomeCor}${
                        cor.disponivel ? '' : ' — Esgotada'
                      }`}
                    >
                      <span
                        style={{
                          backgroundColor: codigoCorSeguro(cor.codigoCor),
                        }}
                      />
                    </button>
                  );
                })}
              </div>

              {cores.length === 0 ? (
                <p className="option-help">
                  Não há opções de cor cadastradas.
                </p>
              ) : null}
            </div>

            <div className="option-group">
              <div className="option-heading">
                <div>
                  <span id="size-label">Tamanho</span>
                  <strong>
                    {tamanhoSelecionado?.codigoTamanho || 'Selecione'}
                  </strong>
                </div>

                <button
                  type="button"
                  className="size-guide"
                  onClick={() => setGuiaAberto((aberto) => !aberto)}
                  aria-expanded={guiaAberto}
                  aria-controls="size-guide-content"
                >
                  Guia de medidas
                </button>
              </div>

              {guiaAberto ? (
                <div id="size-guide-content" className="measure-guide">
                  <strong>Medidas deste produto</strong>
                  <p>
                    A tabela de medidas ainda não foi informada.
                    Os tamanhos abaixo correspondem às opções cadastradas
                    para este produto.
                  </p>
                </div>
              ) : null}

              {!selectedColorId ? (
                <p className="option-help">
                  Selecione uma cor para visualizar os tamanhos disponíveis.
                </p>
              ) : tamanhosDaCor.length === 0 ? (
                <p className="option-help">
                  Não há tamanhos cadastrados para esta cor.
                </p>
              ) : (
                <div
                  className="size-list"
                  role="group"
                  aria-labelledby="size-label"
                >
                  {tamanhosDaCor.map((tamanho) => {
                    const ativo = selectedSizeId === String(tamanho.idTamanho);

                    return (
                      <button
                        key={tamanho.idTamanho}
                        type="button"
                        onClick={() => selecionarTamanho(tamanho)}
                        disabled={!tamanho.disponivel}
                        className={ativo ? 'active' : ''}
                        aria-pressed={ativo}
                        aria-label={`Tamanho ${tamanho.codigoTamanho}${
                          tamanho.disponivel ? '' : ', esgotado'
                        }`}
                      >
                        {tamanho.codigoTamanho}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={`purchase-row${alertaCompra ? ' has-alert' : ''}`}>
              <button
                type="button"
                onClick={handleBuy}
                disabled={!temEstoque}
                className="buy-button"
              >
                <i className="bi bi-bag-plus" aria-hidden="true" />
                {temEstoque ? 'Adicionar ao carrinho' : 'Produto esgotado'}
              </button>

              {alertaCompra ? (
                <aside
                  className={`purchase-alert ${alertaCompra.tipo}`}
                  role={alertaCompra.tipo === 'sucesso' ? 'status' : 'alert'}
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
              <p className="available-stock" aria-live="polite">
                <i className="bi bi-check-circle" aria-hidden="true" />
                {variacaoSelecionada.estoque}
                {' '}
                {variacaoSelecionada.estoque === 1
                  ? 'unidade disponível'
                  : 'unidades disponíveis'}
                {' '}nesta combinação
              </p>
            ) : temEstoque ? (
              <p className="selection-help">
                Selecione o tamanho para consultar o estoque da combinação.
              </p>
            ) : null}

            <div className="description-card">
              <div>
                <i className="bi bi-card-text" aria-hidden="true" />
                <h3>Descrição do produto</h3>
              </div>

              <p>{produto.descricao || 'Descrição não informada.'}</p>

              <dl className="product-specifications">
                {produto.genero ? (
                  <div>
                    <dt>Gênero</dt>
                    <dd>{produto.genero}</dd>
                  </div>
                ) : null}

                {produto.subcategoriaNome ? (
                  <div>
                    <dt>Tipo</dt>
                    <dd>{produto.subcategoriaNome}</dd>
                  </div>
                ) : null}

                {produto.modeloNome ? (
                  <div>
                    <dt>Modelo</dt>
                    <dd>{produto.modeloNome}</dd>
                  </div>
                ) : null}
              </dl>
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
      radial-gradient(
        circle at 8% 4%,
        rgba(210, 178, 112, 0.12),
        transparent 24rem
      ),
      #f6f6f3;
    padding: 2rem 1rem 5rem;
  }

  .product-page,
  .product-page * {
    box-sizing: border-box;
  }

  .product-page button,
  .product-page a {
    -webkit-tap-highlight-color: transparent;
  }

  .product-page button:not(:disabled) {
    cursor: pointer;
  }

  .product-page button:focus-visible,
  .product-page a:focus-visible {
    outline: 3px solid #00a9d4;
    outline-offset: 4px;
  }

  .product-page .product-container {
    width: min(100%, 1240px);
    margin: 0 auto;
  }

  .product-page .product-breadcrumb {
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

  .product-page .product-breadcrumb a {
    color: inherit;
    text-decoration: none;
    flex-shrink: 0;
  }

  .product-page .product-breadcrumb a:hover {
    color: #171717;
  }

  .product-page .product-breadcrumb i {
    flex: 0 0 auto;
    font-size: 0.58rem;
  }

  .product-page .product-breadcrumb strong {
    min-width: 0;
    color: #292929;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .product-page .product-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .product-page .eyebrow {
    display: block;
    margin-bottom: 0.45rem;
    color: #8a6732;
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.16em;
  }

  .product-page .product-heading h1 {
    max-width: 800px;
    margin: 0;
    color: #191919;
    font-size: clamp(1.65rem, 3vw, 2.5rem);
    font-weight: 650;
    line-height: 1.08;
    letter-spacing: -0.035em;
    overflow-wrap: anywhere;
  }

  .product-page .back-link {
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
    transition:
      border-color 0.2s ease,
      background 0.2s ease,
      color 0.2s ease;
  }

  .product-page .back-link:hover {
    border-color: #aaa99f;
    color: #171717;
    background: #fff;
  }

  .product-page .product-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.03fr) minmax(380px, 0.97fr);
    align-items: start;
    gap: 1.75rem;
  }

  .product-page .gallery-card,
  .product-page .details-card {
    min-width: 0;
    border: 1px solid #e3e3dd;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 18px 50px rgba(28, 28, 24, 0.06);
  }

  .product-page .gallery-card {
    position: sticky;
    top: 1.5rem;
    padding: 1rem;
  }

  .product-page .main-image {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    border-radius: 13px;
    background: #f0f0ed;
  }

  .product-page .main-image > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
    transition: transform 0.6s ease;
  }

  .product-page .main-image:hover > img {
    transform: scale(1.025);
  }

  .product-page .image-fallback {
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 0.7rem;
    width: 100%;
    height: 100%;
    color: #777871;
    font-size: 0.85rem;
    text-align: center;
  }

  .product-page .image-fallback i {
    color: #777871;
    font-size: 2rem;
  }

  .product-page .stock-badge {
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

  .product-page .thumbnails {
    display: flex;
    gap: 0.7rem;
    margin-top: 0.85rem;
    padding: 3px;
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .product-page .thumbnails button {
    width: 74px;
    height: 88px;
    flex: 0 0 auto;
    padding: 3px;
    overflow: hidden;
    border: 1px solid #deded8;
    border-radius: 9px;
    background: #f3f3f0;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background 0.2s ease;
  }

  .product-page .thumbnails button.active {
    border-color: #1e1e1e;
    box-shadow: 0 0 0 1px #1e1e1e;
  }

  .product-page .thumbnails img {
    width: 100%;
    height: 100%;
    border-radius: 5px;
    object-fit: cover;
  }

  .product-page .details-card {
    padding: clamp(1.3rem, 3vw, 2.2rem);
  }

  .product-page .product-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.1rem;
  }

  .product-page .product-meta span {
    padding: 0.35rem 0.55rem;
    border-radius: 6px;
    color: #686862;
    background: #f2f2ef;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    overflow-wrap: anywhere;
  }

  .product-page .details-card > h2 {
    margin: 0 0 0.5rem;
    color: #191919;
    font-size: clamp(1.35rem, 2.4vw, 1.8rem);
    font-weight: 600;
    line-height: 1.14;
    letter-spacing: -0.035em;
  }

  .product-page .selection-summary {
    margin: 0 0 1.4rem;
    color: #73736d;
    font-size: 0.84rem;
    line-height: 1.5;
  }

  .product-page .price-prefix {
    display: block;
    margin-bottom: 0.45rem;
    color: #73736d;
    font-size: 0.78rem;
  }

  .product-page .price-block strong {
    display: block;
    color: #0787c9;
    font-size: clamp(1.8rem, 3vw, 2.3rem);
    line-height: 1;
    letter-spacing: -0.035em;
  }

  .product-page .price-block p {
    margin: 0.65rem 0 0;
    color: #73736d;
    font-size: 0.84rem;
  }

  .product-page .price-block b {
    color: #383834;
  }

  .product-page .divider {
    height: 1px;
    margin: 1.6rem 0;
    background: #e7e7e1;
  }

  .product-page .option-group + .option-group {
    margin-top: 1.7rem;
  }

  .product-page .option-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.85rem;
  }

  .product-page .option-heading > div {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.45rem;
  }

  .product-page .option-heading span {
    color: #191919;
    font-size: 0.74rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .product-page .option-heading strong {
    color: #777770;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .product-page .color-list,
  .product-page .size-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  .product-page .color-list button {
    width: 44px;
    height: 44px;
    padding: 4px;
    border: 1px solid #d7d7d1;
    border-radius: 50%;
    background: #fff;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background 0.2s ease;
  }

  .product-page .color-list button.active {
    border-color: #171717;
    box-shadow: 0 0 0 1px #171717;
  }

  .product-page .color-list button > span {
    display: block;
    width: 100%;
    height: 100%;
    border: 1px solid rgba(0, 0, 0, 0.14);
    border-radius: 50%;
  }

  .product-page .color-list button:disabled,
  .product-page .size-list button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
    text-decoration: line-through;
  }

  .product-page .size-guide {
    padding: 0;
    border: 0;
    color: #51514c;
    background: none;
    font-size: 0.76rem;
    text-decoration: underline;
    text-underline-offset: 3px;
    flex-shrink: 0;
  }

  .product-page .size-guide:hover {
    color: #171717;
  }

  .product-page .size-list button {
    min-width: 47px;
    height: 43px;
    padding: 0 0.75rem;
    border: 1px solid #d2d2cc;
    border-radius: 8px;
    color: #30302d;
    background: #fff;
    font-size: 0.78rem;
    font-weight: 750;
    transition:
      color 0.2s ease,
      background 0.2s ease,
      border-color 0.2s ease;
  }

  .product-page .size-list button:hover:not(:disabled),
  .product-page .size-list button.active {
    border-color: #1b1b1b;
    color: #fff;
    background: #1b1b1b;
  }

  .product-page .option-help,
  .product-page .measure-guide {
    margin: 0;
    padding: 0.8rem;
    border: 1px dashed #d8d8d1;
    border-radius: 8px;
    color: #777770;
    background: #fafaf8;
    font-size: 0.78rem;
    line-height: 1.5;
  }

  .product-page .measure-guide {
    margin-bottom: 0.85rem;
  }

  .product-page .measure-guide strong {
    display: block;
    margin-bottom: 0.3rem;
    color: #383834;
  }

  .product-page .measure-guide p {
    margin: 0;
  }

  .product-page .purchase-row {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: stretch;
    gap: 0.75rem;
    margin-top: 1.8rem;
  }

  .product-page .purchase-row.has-alert {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .product-page .buy-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.65rem;
    min-width: 0;
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
    transition:
      transform 0.2s ease,
      background 0.2s ease;
  }

  .product-page .buy-button:hover:not(:disabled) {
    background: #343431;
    transform: translateY(-1px);
  }

  .product-page .buy-button:disabled {
    cursor: not-allowed;
    background: #8c8c87;
    box-shadow: none;
  }

  .product-page .purchase-alert {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.55rem;
    min-width: 0;
    min-height: 58px;
    padding: 0.65rem 0.7rem;
    border: 1px solid;
    border-radius: 10px;
    animation: product-alert-in 0.25s ease both;
  }

  .product-page .purchase-alert.aviso {
    border-color: #e7cf93;
    color: #684b0d;
    background: #fff8e4;
  }

  .product-page .purchase-alert.erro {
    border-color: #e8b7b3;
    color: #7a2420;
    background: #fff1f0;
  }

  .product-page .purchase-alert.sucesso {
    border-color: #acd8bd;
    color: #176333;
    background: #edf9f1;
  }

  .product-page .alert-icon {
    display: grid;
    place-items: center;
    width: 29px;
    height: 29px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.72);
    font-size: 0.78rem;
  }

  .product-page .purchase-alert strong {
    display: block;
    margin-bottom: 0.12rem;
    font-size: 0.76rem;
    overflow-wrap: anywhere;
  }

  .product-page .purchase-alert p {
    margin: 0;
    font-size: 0.7rem;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  .product-page .purchase-alert > button {
    align-self: start;
    padding: 0;
    border: 0;
    color: currentColor;
    background: transparent;
    font-size: 1rem;
    opacity: 0.7;
  }

  .product-page .available-stock {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin: 0.75rem 0 0;
    color: #287344;
    font-size: 0.75rem;
  }

  .product-page .selection-help {
    margin: 0.75rem 0 0;
    color: #777770;
    font-size: 0.75rem;
    line-height: 1.5;
  }

  .product-page .description-card {
    margin-top: 1.8rem;
    padding: 1.2rem;
    border: 1px solid #e2e2dc;
    border-radius: 11px;
    background: #fafaf8;
  }

  .product-page .description-card > div {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    margin-bottom: 0.65rem;
  }

  .product-page .description-card > div i {
    color: currentColor;
  }

  .product-page .description-card h3 {
    margin: 0;
    color: #191919;
    font-size: 0.76rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  .product-page .description-card > p {
    margin: 0;
    color: #666660;
    font-size: 0.83rem;
    line-height: 1.7;
    white-space: pre-line;
    overflow-wrap: anywhere;
  }

  .product-page .product-specifications {
    display: grid;
    gap: 0.55rem;
    margin: 1rem 0 0;
  }

  .product-page .product-specifications:empty {
    display: none;
  }

  .product-page .product-specifications > div {
    display: grid;
    grid-template-columns: 80px minmax(0, 1fr);
    gap: 0.75rem;
    font-size: 0.78rem;
  }

  .product-page .product-specifications dt {
    color: #383834;
    font-weight: 600;
  }

  .product-page .product-specifications dd {
    margin: 0;
    color: #666660;
    overflow-wrap: anywhere;
  }

  .product-page.loading-page {
    display: grid;
    place-items: center;
    padding: 1rem;
  }

  .product-page .loading-card,
  .product-page .feedback-card {
    border: 1px solid #e1e1db;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 18px 50px rgba(28, 28, 24, 0.07);
  }

  .product-page .loading-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 1.4rem;
  }

  .product-page .loading-card .spinner-border {
    flex-shrink: 0;
    width: 1.7rem;
    height: 1.7rem;
    color: #9a7135;
  }

  .product-page .loading-card strong {
    display: block;
    color: #191919;
    font-size: 0.9rem;
  }

  .product-page .loading-card p {
    margin: 0.2rem 0 0;
    color: #777770;
    font-size: 0.75rem;
  }

  .product-page .feedback-card {
    width: min(100%, 470px);
    padding: 2.3rem;
    text-align: center;
  }

  .product-page .feedback-icon {
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

  .product-page .feedback-card h1 {
    margin: 0 0 0.7rem;
    color: #191919;
    font-size: 1.55rem;
  }

  .product-page .feedback-card p {
    margin: 0 0 1.4rem;
    color: #71716b;
    font-size: 0.86rem;
  }

  .product-page .feedback-back {
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
    text-decoration: none;
  }

  /*
   * ==========================================================
   * MODO ESCURO — REGRAS EXCLUSIVAS DESTA PÁGINA
   * ==========================================================
   *
   * Todas as regras abaixo começam em html.dark ou
   * html[data-bs-theme="dark"] e permanecem limitadas a
   * .product-page.
   */

  html.dark .product-page,
  html[data-bs-theme="dark"] .product-page {
    color: #f8fafc;
    background:
      radial-gradient(
        circle at 8% 4%,
        rgba(210, 178, 112, 0.09),
        transparent 24rem
      ),
      #0b1120;
  }

  html.dark .product-page .product-breadcrumb,
  html[data-bs-theme="dark"] .product-page .product-breadcrumb {
    color: #aeb8c7;
  }

  html.dark .product-page .product-breadcrumb a,
  html[data-bs-theme="dark"] .product-page .product-breadcrumb a {
    color: #d5dce6;
  }

  html.dark .product-page .product-breadcrumb a:hover,
  html[data-bs-theme="dark"] .product-page .product-breadcrumb a:hover {
    color: #ffffff;
  }

  html.dark .product-page .product-breadcrumb strong,
  html[data-bs-theme="dark"] .product-page .product-breadcrumb strong {
    color: #f8fafc;
  }

  html.dark .product-page .eyebrow,
  html[data-bs-theme="dark"] .product-page .eyebrow {
    color: #d2a85f;
  }

  html.dark .product-page .product-heading h1,
  html[data-bs-theme="dark"] .product-page .product-heading h1 {
    color: #f8fafc;
  }

  html.dark .product-page .back-link,
  html[data-bs-theme="dark"] .product-page .back-link {
    border-color: #475569;
    color: #f1f5f9;
    background: #1e293b;
  }

  html.dark .product-page .back-link:hover,
  html[data-bs-theme="dark"] .product-page .back-link:hover {
    border-color: #64748b;
    color: #ffffff;
    background: #273449;
  }

  html.dark .product-page .gallery-card,
  html.dark .product-page .details-card,
  html[data-bs-theme="dark"] .product-page .gallery-card,
  html[data-bs-theme="dark"] .product-page .details-card {
    border-color: #334155;
    background: #0f172a;
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.25);
  }

  html.dark .product-page .main-image,
  html[data-bs-theme="dark"] .product-page .main-image {
    background: #f0f0ed;
  }

  /*
   * A área da imagem continua clara porque é uma área de
   * conteúdo visual. O fallback recebe texto escuro para
   * permanecer legível.
   */
  html.dark .product-page .image-fallback,
  html[data-bs-theme="dark"] .product-page .image-fallback {
    color: #73756f !important;
  }

  html.dark .product-page .image-fallback i,
  html[data-bs-theme="dark"] .product-page .image-fallback i {
    color: #73756f !important;
  }

  html.dark .product-page .thumbnails button,
  html[data-bs-theme="dark"] .product-page .thumbnails button {
    border-color: #475569;
    background: #1e293b;
  }

  html.dark .product-page .thumbnails button.active,
  html[data-bs-theme="dark"] .product-page .thumbnails button.active {
    border-color: #f8fafc;
    box-shadow: 0 0 0 1px #f8fafc;
  }

  html.dark .product-page .product-meta span,
  html[data-bs-theme="dark"] .product-page .product-meta span {
    color: #dbe4ee !important;
    background: #263244 !important;
    border: 1px solid #3b4a5f;
  }

  html.dark .product-page .details-card > h2,
  html[data-bs-theme="dark"] .product-page .details-card > h2 {
    color: #f8fafc !important;
  }

  html.dark .product-page .selection-summary,
  html[data-bs-theme="dark"] .product-page .selection-summary {
    color: #aeb8c7 !important;
  }

  html.dark .product-page .price-prefix,
  html[data-bs-theme="dark"] .product-page .price-prefix {
    color: #aeb8c7 !important;
  }

  html.dark .product-page .price-block strong,
  html[data-bs-theme="dark"] .product-page .price-block strong {
    color: #38bdf8 !important;
  }

  html.dark .product-page .price-block p,
  html[data-bs-theme="dark"] .product-page .price-block p {
    color: #aeb8c7 !important;
  }

  html.dark .product-page .price-block b,
  html[data-bs-theme="dark"] .product-page .price-block b {
    color: #f1f5f9 !important;
  }

  html.dark .product-page .divider,
  html[data-bs-theme="dark"] .product-page .divider {
    background: #334155;
  }

  html.dark .product-page .option-heading span,
  html[data-bs-theme="dark"] .product-page .option-heading span {
    color: #f8fafc !important;
  }

  html.dark .product-page .option-heading strong,
  html[data-bs-theme="dark"] .product-page .option-heading strong {
    color: #aeb8c7 !important;
  }

  html.dark .product-page .size-guide,
  html[data-bs-theme="dark"] .product-page .size-guide {
    color: #aeb8c7 !important;
  }

  html.dark .product-page .size-guide:hover,
  html[data-bs-theme="dark"] .product-page .size-guide:hover {
    color: #ffffff !important;
  }

  html.dark .product-page .color-list button,
  html[data-bs-theme="dark"] .product-page .color-list button {
    border-color: #64748b;
    background: #1e293b;
  }

  html.dark .product-page .color-list button.active,
  html[data-bs-theme="dark"] .product-page .color-list button.active {
    border-color: #f8fafc;
    box-shadow: 0 0 0 1px #f8fafc;
  }

  html.dark .product-page .color-list button > span,
  html[data-bs-theme="dark"] .product-page .color-list button > span {
    border-color: rgba(255, 255, 255, 0.22);
  }

  html.dark .product-page .size-list button,
  html[data-bs-theme="dark"] .product-page .size-list button {
    border-color: #64748b;
    color: #f1f5f9 !important;
    background: #1e293b !important;
  }

  html.dark .product-page .size-list button:hover:not(:disabled),
  html.dark .product-page .size-list button.active,
  html[data-bs-theme="dark"] .product-page .size-list button:hover:not(:disabled),
  html[data-bs-theme="dark"] .product-page .size-list button.active {
    border-color: #f8fafc;
    color: #0f172a !important;
    background: #f8fafc !important;
  }

  html.dark .product-page .option-help,
  html.dark .product-page .measure-guide,
  html[data-bs-theme="dark"] .product-page .option-help,
  html[data-bs-theme="dark"] .product-page .measure-guide {
    border-color: #475569;
    color: #aeb8c7 !important;
    background: #151f30 !important;
  }

  html.dark .product-page .measure-guide strong,
  html[data-bs-theme="dark"] .product-page .measure-guide strong {
    color: #f1f5f9 !important;
  }

  html.dark .product-page .buy-button,
  html[data-bs-theme="dark"] .product-page .buy-button {
    color: #ffffff !important;
    background: #1c1c1c !important;
  }

  html.dark .product-page .buy-button:hover:not(:disabled),
  html[data-bs-theme="dark"] .product-page .buy-button:hover:not(:disabled) {
    color: #ffffff !important;
    background: #343434 !important;
  }

  html.dark .product-page .buy-button:disabled,
  html[data-bs-theme="dark"] .product-page .buy-button:disabled {
    color: #d1d5db !important;
    background: #4b5563 !important;
  }

  html.dark .product-page .available-stock,
  html[data-bs-theme="dark"] .product-page .available-stock {
    color: #6ee7a0 !important;
  }

  html.dark .product-page .selection-help,
  html[data-bs-theme="dark"] .product-page .selection-help {
    color: #aeb8c7 !important;
  }

  /*
   * O card de descrição agora acompanha o restante do card
   * no modo escuro. Isso evita texto branco sobre branco.
   */
  html.dark .product-page .description-card,
  html[data-bs-theme="dark"] .product-page .description-card {
    border-color: #334155 !important;
    background: #151f30 !important;
  }

  html.dark .product-page .description-card h3,
  html[data-bs-theme="dark"] .product-page .description-card h3 {
    color: #f8fafc !important;
  }

  html.dark .product-page .description-card > p,
  html[data-bs-theme="dark"] .product-page .description-card > p {
    color: #c1cad6 !important;
  }

  html.dark .product-page .product-specifications dt,
  html[data-bs-theme="dark"] .product-page .product-specifications dt {
    color: #f1f5f9 !important;
  }

  html.dark .product-page .product-specifications dd,
  html[data-bs-theme="dark"] .product-page .product-specifications dd {
    color: #b5bfcc !important;
  }

  html.dark .product-page .loading-card,
  html.dark .product-page .feedback-card,
  html[data-bs-theme="dark"] .product-page .loading-card,
  html[data-bs-theme="dark"] .product-page .feedback-card {
    border-color: #334155;
    background: #0f172a;
  }

  html.dark .product-page .loading-card strong,
  html[data-bs-theme="dark"] .product-page .loading-card strong {
    color: #f8fafc !important;
  }

  html.dark .product-page .loading-card p,
  html[data-bs-theme="dark"] .product-page .loading-card p {
    color: #aeb8c7 !important;
  }

  html.dark .product-page .feedback-card h1,
  html[data-bs-theme="dark"] .product-page .feedback-card h1 {
    color: #f8fafc !important;
  }

  html.dark .product-page .feedback-card p,
  html[data-bs-theme="dark"] .product-page .feedback-card p {
    color: #aeb8c7 !important;
  }

  html.dark .product-page .feedback-back,
  html[data-bs-theme="dark"] .product-page .feedback-back {
    color: #ffffff !important;
    background: #1c1c1c !important;
  }

  /*
   * Alertas mantêm suas próprias cores mesmo quando o CSS
   * global do modo escuro possui regras para textos.
   */
  html.dark .product-page .purchase-alert.aviso,
  html[data-bs-theme="dark"] .product-page .purchase-alert.aviso {
    border-color: #92752d !important;
    color: #f7d98a !important;
    background: #302811 !important;
  }

  html.dark .product-page .purchase-alert.erro,
  html[data-bs-theme="dark"] .product-page .purchase-alert.erro {
    border-color: #9b4b45 !important;
    color: #ffb4ae !important;
    background: #351817 !important;
  }

  html.dark .product-page .purchase-alert.sucesso,
  html[data-bs-theme="dark"] .product-page .purchase-alert.sucesso {
    border-color: #3d8a5a !important;
    color: #8ee6aa !important;
    background: #14291c !important;
  }

  html.dark .product-page .purchase-alert strong,
  html[data-bs-theme="dark"] .product-page .purchase-alert strong,
  html.dark .product-page .purchase-alert p,
  html[data-bs-theme="dark"] .product-page .purchase-alert p {
    color: inherit !important;
  }

  @keyframes product-alert-in {
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
    .product-page .product-layout {
      grid-template-columns: minmax(0, 1fr);
    }

    .product-page .gallery-card {
      position: static;
    }

    .product-page .main-image {
      aspect-ratio: 4 / 4.7;
    }
  }

  @media (max-width: 650px) {
    .product-page {
      padding: 1.2rem 0.75rem 3rem;
    }

    .product-page .product-breadcrumb {
      margin-bottom: 1rem;
    }

    .product-page .product-heading {
      align-items: flex-start;
      flex-direction: column;
      margin-bottom: 1.35rem;
    }

    .product-page .back-link {
      min-height: 38px;
    }

    .product-page .product-layout {
      gap: 1rem;
    }

    .product-page .gallery-card,
    .product-page .details-card {
      border-radius: 13px;
    }

    .product-page .gallery-card {
      padding: 0.65rem;
    }

    .product-page .main-image {
      aspect-ratio: 4 / 5;
      border-radius: 9px;
    }

    .product-page .details-card {
      padding: 1.25rem;
    }

    .product-page .purchase-row,
    .product-page .purchase-row.has-alert {
      grid-template-columns: minmax(0, 1fr);
    }

    .product-page .purchase-alert {
      min-height: auto;
    }

    .product-page .size-guide {
      font-size: 0.7rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .product-page *,
    .product-page *::before,
    .product-page *::after {
      transition: none !important;
      animation: none !important;
    }
  }
`;