"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import "../../entrega/page.css";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

const ETAPAS = [
  { status: "pendente", titulo: "Pedido confirmado", descricao: "Seu pedido foi recebido e aguarda processamento.", icone: "bi-check-lg" },
  { status: "processando", titulo: "Pedido em preparação", descricao: "Estamos separando e preparando seu produto.", icone: "bi-box-seam" },
  { status: "enviado", titulo: "Pedido enviado", descricao: "Seu pedido já está a caminho.", icone: "bi-truck" },
  { status: "entregue", titulo: "Pedido entregue", descricao: "Seu pedido foi entregue com sucesso.", icone: "bi-house-check" },
];
const ORDEM = { pendente: 1, processando: 2, enviado: 3, entregue: 4 };

function imagemProduto(caminho) {
  if (!caminho) return null;
  if (/^https?:\/\//i.test(caminho)) return caminho;
  if (caminho.startsWith("/uploads/")) return `${API_ORIGIN}${caminho}`;
  return caminho.startsWith("/") ? caminho : `/${caminho}`;
}

function preco(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function DetalhesPedido() {
  const { slug } = useParams();
  const [pedido, setPedido] = useState(null);
  const [estado, setEstado] = useState("carregando");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function carregar() {
      const token = localStorage.getItem("token");
      if (!token) { setEstado("sem-sessao"); return; }
      try {
        const resposta = await fetch(`${API_ORIGIN}/api/vendas/meus-pedidos/${encodeURIComponent(slug)}`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: controller.signal,
        });
        const resultado = await resposta.json().catch(() => ({}));
        if (!resposta.ok || !resultado.sucesso) {
          if (resposta.status === 401 || resposta.status === 403) setEstado("sem-sessao");
          else throw new Error(resultado.mensagem || "Pedido não encontrado.");
          return;
        }
        setPedido(resultado.dados);
        setEstado("pronto");
      } catch (error) {
        if (error.name !== "AbortError") { setErro(error.message || "Não foi possível carregar o pedido."); setEstado("erro"); }
      }
    }
    if (slug) carregar();
    return () => controller.abort();
  }, [slug]);

  if (estado !== "pronto") {
    return <main className="entrega-container"><div className="entrega-card entrega-state"><i className={`bi ${estado === "carregando" ? "bi-arrow-repeat" : estado === "sem-sessao" ? "bi-person-lock" : "bi-exclamation-circle"}`} /><h1>{estado === "carregando" ? "Carregando pedido..." : estado === "sem-sessao" ? "Entre para ver este pedido" : "Pedido indisponível"}</h1>{erro ? <p>{erro}</p> : null}<Link href={estado === "sem-sessao" ? "/login" : "/meus-pedidos"} className="voltar-loja">{estado === "sem-sessao" ? "Entrar na conta" : "Voltar aos pedidos"}</Link></div></main>;
  }

  const statusAtual = pedido.status || "pendente";
  const cancelado = statusAtual === "cancelado";
  const etapaAtual = ETAPAS.find((etapa) => etapa.status === statusAtual) || ETAPAS[0];
  const imagem = imagemProduto(pedido.imagem);

  return (
    <main className="entrega-container">
      <div className="entrega-card">
        <div className="entrega-header">
          <Link href="/meus-pedidos" className="voltar" aria-label="Voltar aos meus pedidos"><i className="bi bi-arrow-left" /></Link>
          <div><span className="label">ACOMPANHAMENTO</span><h1>Detalhes da entrega</h1></div>
        </div>

        <div className="pedido-info">
          <div><span>Pedido</span><strong>#{pedido.idVendas}</strong></div>
          <div><span>Previsão de entrega</span><strong>{pedido.dataEntregaBR || "A calcular"}</strong></div>
        </div>

        <div className="pedido-produto">
          <div className="pedido-produto-imagem">{imagem ? <Image src={imagem} alt={pedido.nomeProduto || "Produto"} width={88} height={88} unoptimized /> : <i className="bi bi-image" />}</div>
          <div><span>Produto comprado</span><h2>{pedido.nomeProduto || "Produto"}</h2>{pedido.variacao ? <p>{pedido.variacao}</p> : null}<strong>{preco(pedido.preco)}</strong></div>
        </div>

        <div className={`status-atual ${cancelado ? "cancelado" : ""}`}>
          <div className="status-icon"><i className={`bi ${cancelado ? "bi-x-lg" : etapaAtual.icone}`} /></div>
          <div><span>Status atual</span><h2>{cancelado ? "Pedido cancelado" : etapaAtual.titulo}</h2><p>{cancelado ? "Este pedido foi cancelado." : etapaAtual.descricao}</p></div>
        </div>

        {!cancelado ? <div className="timeline">{ETAPAS.map((etapa, index) => {
          const concluida = ORDEM[etapa.status] <= ORDEM[statusAtual];
          const atual = etapa.status === statusAtual;
          return <div className={`timeline-item ${concluida ? "concluida" : ""} ${atual ? "atual" : ""}`} key={etapa.status}><div className="timeline-left"><div className="timeline-icon"><i className={`bi ${etapa.icone}`} /></div>{index < ETAPAS.length - 1 ? <div className="timeline-line" /> : null}</div><div className="timeline-content"><h3>{etapa.titulo}</h3><p>{etapa.descricao}</p>{atual ? <span className="status-badge">Status atual</span> : null}</div></div>;
        })}</div> : null}

        <div className="endereco"><div className="endereco-icon"><i className="bi bi-geo-alt" /></div><div><span>Destino cadastrado</span><strong>{pedido.cep ? `CEP ${pedido.cep}` : "CEP não informado"}</strong><p>Consulte ou atualize o endereço completo no seu perfil.</p></div></div>
        <Link href="/produtos" className="voltar-loja">Continuar comprando</Link>
      </div>
    </main>
  );
}
