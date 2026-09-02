"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./page.css";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
)
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

const ETAPAS = [
  {
    status: "pendente",
    titulo: "Pedido confirmado",
    descricao: "Recebemos seu pedido e iniciamos a organização dos itens.",
    icone: "bi-check-lg",
  },
  {
    status: "processando",
    titulo: "Em preparação",
    descricao: "Seus produtos estão sendo separados e preparados.",
    icone: "bi-box-seam",
  },
  {
    status: "enviado",
    titulo: "Pedido enviado",
    descricao: "A entrega saiu e está seguindo para o destino.",
    icone: "bi-truck",
  },
  {
    status: "entregue",
    titulo: "Pedido entregue",
    descricao: "A entrega foi concluída no endereço cadastrado.",
    icone: "bi-house-check",
  },
];

const ORDEM_STATUS = {
  pendente: 1,
  processando: 2,
  enviado: 3,
  entregue: 4,
};

function resolverImagem(caminho) {
  if (!caminho) return null;
  const valor = String(caminho).trim().replace(/\\/g, "/");
  if (!valor) return null;
  if (/^(https?:|data:|blob:)/i.test(valor)) return valor;
  if (valor.startsWith("/uploads/")) return `${API_ORIGIN}${valor}`;
  if (valor.startsWith("uploads/")) return `${API_ORIGIN}/${valor}`;
  if (valor.startsWith("/")) return valor;
  return `${API_ORIGIN}/uploads/${encodeURIComponent(valor)}`;
}

function formatarPreco(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarCep(cep) {
  const numeros = String(cep || "").replace(/\D/g, "");
  return numeros.length === 8
    ? `${numeros.slice(0, 5)}-${numeros.slice(5)}`
    : cep || "Não informado";
}

function ImagemPedido({ caminho, nome }) {
  const [falhou, setFalhou] = useState(false);

  useEffect(() => setFalhou(false), [caminho]);

  if (!caminho || falhou) {
    return (
      <div className="delivery-product-fallback" aria-hidden="true">
        <i className="bi bi-image" />
      </div>
    );
  }

  return (
    <Image
      src={caminho}
      alt={nome || "Produto"}
      fill
      sizes="76px"
      unoptimized={caminho.startsWith("http")}
      onError={() => setFalhou(true)}
    />
  );
}

function obterIdsConfirmados() {
  try {
    const salvo = sessionStorage.getItem("everett-pedido-confirmado");
    if (!salvo) return [];
    const dados = JSON.parse(salvo);
    return Array.isArray(dados?.idsVendas) ? dados.idsVendas.map(Number) : [];
  } catch {
    return [];
  }
}

export default function Entrega() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function carregarEntregas() {
      const token = localStorage.getItem("token");
      if (!token) {
        setErro("Entre na sua conta para acompanhar seus pedidos.");
        setCarregando(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_ORIGIN}/api/vendas/minhas-entregas`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
            signal: controller.signal,
          },
        );
        const resultado = await response.json().catch(() => ({}));
        if (!response.ok || !resultado.sucesso) {
          throw new Error(
            resultado.mensagem || "Não foi possível carregar a entrega.",
          );
        }

        const entregas = Array.isArray(resultado.dados) ? resultado.dados : [];
        const idsConfirmados = new Set(obterIdsConfirmados());
        let entregaAtual = entregas.filter((item) =>
          idsConfirmados.has(Number(item.idVendas)),
        );

        if (entregaAtual.length === 0 && entregas.length > 0) {
          const maisRecente = entregas[0];
          const dataPedido = String(maisRecente.dataPedido || "");
          const dataEntrega = String(maisRecente.dataEntrega || "");
          entregaAtual = entregas.filter(
            (item) =>
              String(item.dataPedido || "") === dataPedido &&
              String(item.dataEntrega || "") === dataEntrega,
          );
        }

        setPedidos(entregaAtual);
      } catch (error) {
        if (error.name !== "AbortError") {
          setErro(error.message || "Não foi possível carregar a entrega.");
        }
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }

    carregarEntregas();
    return () => controller.abort();
  }, []);

  const resumo = useMemo(() => {
    if (pedidos.length === 0) return null;
    const ativos = pedidos.filter((item) => item.status !== "cancelado");
    const todosCancelados = ativos.length === 0;
    const status = todosCancelados
      ? "cancelado"
      : ativos.reduce((maisAtrasado, item) =>
          (ORDEM_STATUS[item.status] || 1) < (ORDEM_STATUS[maisAtrasado] || 1)
            ? item.status
            : maisAtrasado,
        ativos[0].status);

    return {
      status,
      cancelado: todosCancelados,
      etapa: ETAPAS.find((item) => item.status === status),
      dataPedido: pedidos[0].dataPedidoBR,
      dataEntrega: pedidos[0].dataEntregaBR,
      cep: pedidos[0].cep,
      possuiItemCancelado: pedidos.some((item) => item.status === "cancelado"),
    };
  }, [pedidos]);

  if (carregando) {
    return (
      <main className="delivery-page">
        <div className="delivery-feedback" role="status">
          <span className="delivery-spinner" />
          <h1>Carregando sua entrega</h1>
          <p>Consultando as informações atualizadas do pedido.</p>
        </div>
      </main>
    );
  }

  if (erro || !resumo) {
    return (
      <main className="delivery-page">
        <div className="delivery-feedback">
          <i className="bi bi-box-seam" aria-hidden="true" />
          <span>ACOMPANHAMENTO EVERETT</span>
          <h1>{erro ? "Não foi possível abrir a entrega" : "Nenhum pedido encontrado"}</h1>
          <p>
            {erro || "Quando uma compra for confirmada, o acompanhamento aparecerá aqui."}
          </p>
          <Link href={erro?.startsWith("Entre") ? "/login" : "/produtos"}>
            {erro?.startsWith("Entre") ? "Entrar na conta" : "Explorar produtos"}
          </Link>
        </div>
      </main>
    );
  }

  const statusIndex = ORDEM_STATUS[resumo.status] || 0;

  return (
    <main className="delivery-page">
      <section className="delivery-shell">
        <header className="delivery-heading">
          <div>
            <span>ACOMPANHAMENTO EVERETT</span>
            <h1>Detalhes da entrega</h1>
            <p>Informações sincronizadas com o status atual do seu pedido.</p>
          </div>
          <Link href="/produtos">
            <i className="bi bi-arrow-left" aria-hidden="true" />
            Voltar à loja
          </Link>
        </header>

        <div className="delivery-grid">
          <div className="delivery-main">
            <section className={`delivery-status ${resumo.cancelado ? "cancelled" : ""}`}>
              <div className="delivery-status-icon">
                <i className={`bi ${resumo.cancelado ? "bi-x-lg" : resumo.etapa?.icone || "bi-box"}`} />
              </div>
              <div>
                <span>STATUS ATUAL</span>
                <h2>{resumo.cancelado ? "Pedido cancelado" : resumo.etapa?.titulo}</h2>
                <p>
                  {resumo.cancelado
                    ? "Os itens deste pedido foram cancelados."
                    : resumo.etapa?.descricao}
                </p>
              </div>
            </section>

            {resumo.possuiItemCancelado && !resumo.cancelado ? (
              <div className="delivery-warning">
                <i className="bi bi-exclamation-circle" />
                Um dos itens deste pedido foi cancelado. Os demais continuam em andamento.
              </div>
            ) : null}

            {!resumo.cancelado ? (
              <section className="delivery-timeline" aria-label="Etapas da entrega">
                {ETAPAS.map((etapa, index) => {
                  const concluida = ORDEM_STATUS[etapa.status] <= statusIndex;
                  const atual = etapa.status === resumo.status;
                  return (
                    <div
                      className={`delivery-step ${concluida ? "completed" : ""} ${atual ? "current" : ""}`}
                      key={etapa.status}
                    >
                      <div className="delivery-step-marker">
                        <span><i className={`bi ${etapa.icone}`} /></span>
                        {index < ETAPAS.length - 1 ? <div /> : null}
                      </div>
                      <div>
                        <h3>{etapa.titulo}</h3>
                        <p>{etapa.descricao}</p>
                        {atual ? <small>Etapa atual</small> : null}
                      </div>
                    </div>
                  );
                })}
              </section>
            ) : null}
          </div>

          <aside className="delivery-summary">
            <span className="delivery-summary-label">SEU PEDIDO</span>
            <h2>{pedidos.length} {pedidos.length === 1 ? "item" : "itens"}</h2>

            <div className="delivery-order-meta">
              <div>
                <span>Pedido realizado</span>
                <strong>{resumo.dataPedido || "Não informado"}</strong>
              </div>
              <div>
                <span>Previsão de entrega</span>
                <strong>{resumo.dataEntrega || "Em definição"}</strong>
              </div>
              <div>
                <span>Destino cadastrado</span>
                <strong>CEP {formatarCep(resumo.cep)}</strong>
              </div>
            </div>

            <div className="delivery-products">
              {pedidos.map((pedido) => {
                const nome = pedido.nomeCombinacao || pedido.nome || "Produto";
                return (
                  <article key={pedido.idVendas}>
                    <div className="delivery-product-image">
                      <ImagemPedido caminho={resolverImagem(pedido.imagem1)} nome={nome} />
                    </div>
                    <div>
                      <span>#{pedido.idVendas}</span>
                      <h3>{nome}</h3>
                      <strong>{formatarPreco(pedido.preco)}</strong>
                    </div>
                  </article>
                );
              })}
            </div>

            <Link href="/produtos" className="delivery-shop-action">
              Continuar comprando
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
