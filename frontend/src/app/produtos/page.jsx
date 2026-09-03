'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import styles from './produtos.module.css';

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
)
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');
const PRODUTOS_ENDPOINT = `${API_ORIGIN}/api/produtos`;
const LIMITE_POR_PAGINA = 12;

const FILTROS_INICIAIS = {
  busca: '',
  genero: '',
  idCategoria: '',
  idSubcategoria: '',
  idCor: '',
  idTamanho: '',
  idModelo: '',
  precoMin: '',
  precoMax: '',
  emEstoque: '',
  ordenarPor: 'recente',
};

const CAMPOS_FILTRO = Object.keys(FILTROS_INICIAIS);

function lerFiltros(searchParams) {
  return CAMPOS_FILTRO.reduce(
    (filtros, campo) => ({
      ...filtros,
      [campo]: searchParams.get(campo) || FILTROS_INICIAIS[campo],
    }),
    {},
  );
}

function formatarPreco(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor) || 0);
}

function resolverImagem(caminho) {
  if (!caminho) return null;
  if (/^https?:\/\//i.test(caminho)) return caminho;
  if (caminho.startsWith('/') && !caminho.startsWith('/uploads/')) {
    return caminho;
  }

  const caminhoLimpo = caminho.replace(/^\//, '');
  return `${API_ORIGIN}/${
    caminhoLimpo.startsWith('uploads/')
      ? caminhoLimpo
      : `uploads/${caminhoLimpo}`
  }`;
}

async function lerResposta(response, mensagemPadrao) {
  const resultado = await response.json().catch(() => ({}));

  if (!response.ok || !resultado.sucesso) {
    throw new Error(resultado.erro || resultado.mensagem || mensagemPadrao);
  }

  return resultado;
}

function CatalogoProdutos() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const [isNavigating, startTransition] = useTransition();
  const [produtos, setProdutos] = useState([]);
  const [opcoes, setOpcoes] = useState({
    categorias: [],
    subcategorias: [],
    cores: [],
    tamanhos: [],
    modelos: [],
    generos: [],
    faixaPreco: { minimo: null, maximo: null },
  });
  const [filtros, setFiltros] = useState(() => lerFiltros(searchParams));
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    limite: LIMITE_POR_PAGINA,
    total: 0,
    totalPaginas: 0,
  });
  const [carregando, setCarregando] = useState(true);
  const [carregandoFiltros, setCarregandoFiltros] = useState(true);
  const [erro, setErro] = useState('');
  const [imagensComErro, setImagensComErro] = useState(() => new Set());

  useEffect(() => {
    setFiltros(lerFiltros(searchParams));
  }, [queryString, searchParams]);

  useEffect(() => {
    const abortController = new AbortController();

    async function carregarFiltros() {
      try {
        const response = await fetch(`${PRODUTOS_ENDPOINT}/filtros`, {
          headers: { Accept: 'application/json' },
          signal: abortController.signal,
          cache: 'no-store',
        });
        const resultado = await lerResposta(
          response,
          'Não foi possível carregar os filtros.',
        );
        setOpcoes(resultado.dados);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setErro(error.message || 'Não foi possível carregar os filtros.');
        }
      } finally {
        if (!abortController.signal.aborted) setCarregandoFiltros(false);
      }
    }

    carregarFiltros();
    return () => abortController.abort();
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    async function carregarProdutos() {
      setCarregando(true);
      setErro('');

      try {
        const parametros = new URLSearchParams(queryString);
        parametros.set('pagina', parametros.get('pagina') || '1');
        parametros.set('limite', String(LIMITE_POR_PAGINA));

        const response = await fetch(`${PRODUTOS_ENDPOINT}?${parametros}`, {
          headers: { Accept: 'application/json' },
          signal: abortController.signal,
          cache: 'no-store',
        });
        const resultado = await lerResposta(
          response,
          'Não foi possível carregar os produtos.',
        );

        setProdutos(resultado.dados || []);
        setPaginacao(resultado.paginacao);
        setImagensComErro(new Set());
      } catch (error) {
        if (error.name !== 'AbortError') {
          setProdutos([]);
          setErro(error.message || 'Não foi possível carregar os produtos.');
        }
      } finally {
        if (!abortController.signal.aborted) setCarregando(false);
      }
    }

    carregarProdutos();
    return () => abortController.abort();
  }, [queryString]);

  const filtrosAtivos = useMemo(
    () =>
      CAMPOS_FILTRO.filter((campo) => {
        if (campo === 'ordenarPor') return filtros[campo] !== 'recente';
        return Boolean(filtros[campo]);
      }).length
      + (searchParams.has('categoria') ? 1 : 0)
      + (searchParams.has('tipo') ? 1 : 0),
    [filtros, searchParams],
  );

  function atualizarFiltro(event) {
    const { name, value } = event.target;
    setFiltros((atuais) => ({ ...atuais, [name]: value }));
  }

  function navegarComParametros(parametros) {
    const destino = parametros.toString()
      ? `${pathname}?${parametros.toString()}`
      : pathname;
    startTransition(() => router.replace(destino, { scroll: false }));
  }

  function aplicarFiltros(event) {
    event.preventDefault();
    const parametros = new URLSearchParams();

    for (const campo of CAMPOS_FILTRO) {
      const valor = String(filtros[campo] ?? '').trim();
      if (valor && !(campo === 'ordenarPor' && valor === 'recente')) {
        parametros.set(campo, valor);
      }
    }

    navegarComParametros(parametros);
  }

  function limparFiltros() {
    setFiltros(FILTROS_INICIAIS);
    navegarComParametros(new URLSearchParams());
  }

  function mudarPagina(novaPagina) {
    const parametros = new URLSearchParams(queryString);
    if (novaPagina <= 1) parametros.delete('pagina');
    else parametros.set('pagina', String(novaPagina));
    navegarComParametros(parametros);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function registrarErroImagem(url) {
    setImagensComErro((atuais) => new Set(atuais).add(url));
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>Catálogo Everett</span>
            <h1>Todos os produtos</h1>
            <p>
              {carregando
                ? 'Atualizando catálogo...'
                : `${paginacao.total} modelo${paginacao.total === 1 ? '' : 's'} encontrado${paginacao.total === 1 ? '' : 's'}`}
            </p>
          </div>

          {filtrosAtivos > 0 ? (
            <button type="button" className={styles.clearTop} onClick={limparFiltros}>
              Limpar {filtrosAtivos} filtro{filtrosAtivos === 1 ? '' : 's'}
            </button>
          ) : null}
        </header>

        <div className={styles.catalogLayout}>
          <aside className={styles.filters} aria-label="Filtros de produtos">
            <div className={styles.filtersTitle}>
              <div>
                <i className="bi bi-sliders" aria-hidden="true" />
                <h2>Filtros</h2>
              </div>
              {filtrosAtivos > 0 ? <span>{filtrosAtivos}</span> : null}
            </div>

            <form onSubmit={aplicarFiltros}>
              <label className={styles.field}>
                <span>Buscar</span>
                <input
                  name="busca"
                  value={filtros.busca}
                  onChange={atualizarFiltro}
                  placeholder="Modelo, nome, descrição ou SKU"
                  maxLength={100}
                />
              </label>

              <label className={styles.field}>
                <span>Gênero</span>
                <select name="genero" value={filtros.genero} onChange={atualizarFiltro}>
                  <option value="">Todos</option>
                  {opcoes.generos.map((genero) => (
                    <option key={genero} value={genero}>{genero}</option>
                  ))}
                </select>
              </label>

              <label className={styles.field}>
                <span>Categoria</span>
                <select name="idCategoria" value={filtros.idCategoria} onChange={atualizarFiltro}>
                  <option value="">Todas</option>
                  {opcoes.categorias.map((categoria) => (
                    <option key={categoria.idCategoria} value={categoria.idCategoria}>
                      {categoria.nomeCategoria}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.field}>
                <span>Subcategoria</span>
                <select name="idSubcategoria" value={filtros.idSubcategoria} onChange={atualizarFiltro}>
                  <option value="">Todas</option>
                  {opcoes.subcategorias.map((subcategoria) => (
                    <option key={subcategoria.idSubcategoria} value={subcategoria.idSubcategoria}>
                      {subcategoria.nomeSubcategoria}
                    </option>
                  ))}
                </select>
              </label>

              <div className={styles.twoColumns}>
                <label className={styles.field}>
                  <span>Cor</span>
                  <select name="idCor" value={filtros.idCor} onChange={atualizarFiltro}>
                    <option value="">Todas</option>
                    {opcoes.cores.map((cor) => (
                      <option key={cor.idCor} value={cor.idCor}>{cor.nomeCor}</option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span>Tamanho</span>
                  <select name="idTamanho" value={filtros.idTamanho} onChange={atualizarFiltro}>
                    <option value="">Todos</option>
                    {opcoes.tamanhos.map((tamanho) => (
                      <option key={tamanho.idTamanho} value={tamanho.idTamanho}>
                        {tamanho.codigoTamanho}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className={styles.field}>
                <span>Modelo</span>
                <select name="idModelo" value={filtros.idModelo} onChange={atualizarFiltro}>
                  <option value="">Todos</option>
                  {opcoes.modelos.map((modelo) => (
                    <option key={modelo.idModelo} value={modelo.idModelo}>
                      {modelo.nomeModelo}
                    </option>
                  ))}
                </select>
              </label>

              <fieldset className={styles.priceGroup}>
                <legend>Faixa de preço</legend>
                <div className={styles.twoColumns}>
                  <label>
                    <span>Mínimo</span>
                    <input
                      type="number"
                      name="precoMin"
                      value={filtros.precoMin}
                      onChange={atualizarFiltro}
                      min="0"
                      step="0.01"
                      placeholder={opcoes.faixaPreco.minimo ?? '0'}
                    />
                  </label>
                  <label>
                    <span>Máximo</span>
                    <input
                      type="number"
                      name="precoMax"
                      value={filtros.precoMax}
                      onChange={atualizarFiltro}
                      min="0"
                      step="0.01"
                      placeholder={opcoes.faixaPreco.maximo ?? '500'}
                    />
                  </label>
                </div>
              </fieldset>

              <label className={styles.stockCheck}>
                <input
                  type="checkbox"
                  name="emEstoque"
                  checked={filtros.emEstoque === 'true'}
                  onChange={(event) =>
                    setFiltros((atuais) => ({
                      ...atuais,
                      emEstoque: event.target.checked ? 'true' : '',
                    }))
                  }
                />
                <span>Somente itens em estoque</span>
              </label>

              <button
                type="submit"
                className={styles.applyButton}
                disabled={isNavigating || carregandoFiltros}
              >
                {isNavigating ? 'Aplicando...' : 'Aplicar filtros'}
              </button>
              <button type="button" className={styles.resetButton} onClick={limparFiltros}>
                Limpar filtros
              </button>
            </form>
          </aside>

          <section className={styles.results} aria-busy={carregando}>
            <div className={styles.toolbar}>
              <span>
                Página {paginacao.totalPaginas === 0 ? 0 : paginacao.pagina} de {paginacao.totalPaginas}
              </span>
              <label>
                <span>Ordenar por</span>
                <select
                  name="ordenarPor"
                  value={filtros.ordenarPor}
                  onChange={(event) => {
                    const ordenarPor = event.target.value;
                    setFiltros((atuais) => ({ ...atuais, ordenarPor }));
                    const parametros = new URLSearchParams(queryString);
                    parametros.delete('pagina');
                    if (ordenarPor === 'recente') parametros.delete('ordenarPor');
                    else parametros.set('ordenarPor', ordenarPor);
                    navegarComParametros(parametros);
                  }}
                >
                  <option value="recente">Mais recentes</option>
                  <option value="preco_asc">Menor preço</option>
                  <option value="preco_desc">Maior preço</option>
                  <option value="nome_asc">Nome de A a Z</option>
                  <option value="antigo">Mais antigos</option>
                </select>
              </label>
            </div>

            {erro ? (
              <div className={styles.feedback} role="alert">
                <i className="bi bi-exclamation-circle" aria-hidden="true" />
                <h2>Não foi possível carregar o catálogo</h2>
                <p>{erro}</p>
                <button type="button" onClick={() => window.location.reload()}>Tentar novamente</button>
              </div>
            ) : carregando ? (
              <div className={styles.grid} aria-label="Carregando produtos">
                {Array.from({ length: 8 }, (_, index) => (
                  <div className={styles.skeleton} key={index}>
                    <span className={styles.skeletonImage} />
                    <span />
                    <span />
                  </div>
                ))}
              </div>
            ) : produtos.length === 0 ? (
              <div className={styles.feedback}>
                <i className="bi bi-search" aria-hidden="true" />
                <h2>Nenhum produto encontrado</h2>
                <p>Tente remover ou alterar alguns filtros.</p>
                <button type="button" onClick={limparFiltros}>Ver todos os produtos</button>
              </div>
            ) : (
              <>
                <div className={styles.grid}>
                  {produtos.map((produto) => {
                    const imagem = resolverImagem(produto.imagem1);
                    const mostrarImagem = imagem && !imagensComErro.has(imagem);
                    const referencia = produto.slugModelo || produto.idProduto;
                    const precoMinimo = produto.precoMinimo ?? produto.preco;
                    const precoMaximo = produto.precoMaximo ?? produto.preco;
                    const possuiFaixaPreco = Number(precoMinimo) !== Number(precoMaximo);
                    const totalVariacoes = Number(produto.totalVariacoes) || 1;

                    return (
                      <article className={styles.card} key={produto.idProduto}>
                        <Link href={`/produtos/${referencia}`} className={styles.imageLink}>
                          {mostrarImagem ? (
                            <Image
                              src={imagem}
                              alt={produto.nome}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              unoptimized
                              onError={() => registrarErroImagem(imagem)}
                            />
                          ) : (
                            <span className={styles.imageFallback}>
                              <i className="bi bi-image" aria-hidden="true" />
                              Imagem indisponível
                            </span>
                          )}
                          {Number(produto.estoqueTotal ?? produto.estoque) <= 0 ? <span className={styles.outOfStock}>Esgotado</span> : null}
                        </Link>
                        <div className={styles.cardBody}>
                          <p className={styles.meta}>
                            {produto.categoriaNome || produto.genero}
                            {produto.modeloNome ? ` • ${produto.modeloNome}` : ''}
                          </p>
                          <h2><Link href={`/produtos/${referencia}`}>{produto.nome}</Link></h2>
                          <strong>
                            {possuiFaixaPreco ? 'A partir de ' : ''}{formatarPreco(precoMinimo)}
                          </strong>
                          <small>
                            {totalVariacoes > 1
                              ? `${totalVariacoes} variações disponíveis`
                              : 'Consulte cores e tamanhos'}
                          </small>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {paginacao.totalPaginas > 1 ? (
                  <nav className={styles.pagination} aria-label="Paginação dos produtos">
                    <button
                      type="button"
                      onClick={() => mudarPagina(paginacao.pagina - 1)}
                      disabled={paginacao.pagina <= 1 || isNavigating}
                    >
                      <i className="bi bi-chevron-left" aria-hidden="true" /> Anterior
                    </button>
                    <span>{paginacao.pagina} / {paginacao.totalPaginas}</span>
                    <button
                      type="button"
                      onClick={() => mudarPagina(paginacao.pagina + 1)}
                      disabled={paginacao.pagina >= paginacao.totalPaginas || isNavigating}
                    >
                      Próxima <i className="bi bi-chevron-right" aria-hidden="true" />
                    </button>
                  </nav>
                ) : null}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function CatalogoCarregando() {
  return (
    <main className={styles.page}>
      <div className={styles.initialLoading} role="status">
        <span className="spinner-border" aria-hidden="true" />
        Carregando catálogo...
      </div>
    </main>
  );
}

export default function ProdutosPage() {
  return (
    <Suspense fallback={<CatalogoCarregando />}>
      <CatalogoProdutos />
    </Suspense>
  );
}
