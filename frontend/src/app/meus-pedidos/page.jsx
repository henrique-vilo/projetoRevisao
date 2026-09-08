"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import "./page.css";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

const STATUS = {
  pendente: { texto: "Confirmado", icone: "bi-check-circle" },
  processando: { texto: "Em preparação", icone: "bi-box-seam" },
  enviado: { texto: "Enviado", icone: "bi-truck" },
  entregue: { texto: "Entregue", icone: "bi-house-check" },
  cancelado: { texto: "Cancelado", icone: "bi-x-circle" },
};

function imagemProduto(caminho) {
  if (!caminho) return null;
  if (/^https?:\/\//i.test(caminho)) return caminho;
  if (caminho.startsWith("/uploads/")) return `${API_ORIGIN}${caminho}`;
  return caminho.startsWith("/") ? caminho : `/${caminho}`;
}

function preco(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function MeusPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [estado, setEstado] = useState("carregando");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function carregar() {
      const token = localStorage.getItem("token");
      if (!token) { setEstado("sem-sessao"); return; }
      try {
        const resposta = await fetch(`${API_ORIGIN}/api/vendas/meus-pedidos`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: controller.signal,
        });
        const resultado = await resposta.json().catch(() => ({}));
        if (!resposta.ok || !resultado.sucesso) {
          if (resposta.status === 401 || resposta.status === 403) setEstado("sem-sessao");
          else throw new Error(resultado.mensagem || "Não foi possível carregar seus pedidos.");
          return;
        }
        setPedidos(Array.isArray(resultado.dados) ? resultado.dados : []);
        setEstado("pronto");
      } catch (error) {
        if (error.name !== "AbortError") {
          setErro(error.message || "Não foi possível carregar seus pedidos.");
          setEstado("erro");
        }
      }
    }
    carregar();
    return () => controller.abort();
  }, []);

  return (
    <main className="orders-page">
      <section className="orders-shell">
        <header className="orders-heading">
          <div><span>MINHA CONTA</span><h1>Meus pedidos</h1><p>Acompanhe suas compras e consulte os detalhes de cada entrega.</p></div>
          <Link href="/produtos" className="orders-shop-link">Continuar comprando</Link>
        </header>

        {estado === "carregando" ? (
          <div className="orders-message" role="status"><i className="bi bi-arrow-repeat" /><h2>Carregando seus pedidos...</h2></div>
        ) : estado === "sem-sessao" ? (
          <div className="orders-message"><i className="bi bi-person-lock" /><h2>Entre para ver seus pedidos</h2><p>Suas compras ficam protegidas na sua conta Everett.</p><Link href="/login">Entrar na conta</Link></div>
        ) : estado === "erro" ? (
          <div className="orders-message" role="alert"><i className="bi bi-wifi-off" /><h2>Não foi possível carregar</h2><p>{erro}</p><button type="button" onClick={() => window.location.reload()}>Tentar novamente</button></div>
        ) : pedidos.length === 0 ? (
          <div className="orders-message"><i className="bi bi-bag-x" /><h2>Você ainda não fez nenhum pedido</h2><p>Quando uma compra for confirmada, ela aparecerá aqui.</p><Link href="/produtos">Conhecer produtos</Link></div>
        ) : (
          <div className="orders-list">
            {pedidos.map((pedido) => {
              const status = STATUS[pedido.status] || STATUS.pendente;
              const imagem = imagemProduto(pedido.imagem);
              return (
                <article className="order-card" key={pedido.idVendas}>
                  <div className="order-image">{imagem ? <Image src={imagem} alt={pedido.nomeProduto || "Produto"} width={112} height={112} unoptimized /> : <i className="bi bi-image" />}</div>
                  <div className="order-main">
                    <div className="order-meta"><span>Pedido #{pedido.idVendas}</span><span>{pedido.dataPedidoBR || "Data não informada"}</span></div>
                    <h2>{pedido.nomeProduto || "Produto"}</h2>
                    {pedido.variacao ? <p>{pedido.variacao}</p> : null}
                    <strong>{preco(pedido.preco)}</strong>
                  </div>
                  <div className={`order-status status-${pedido.status}`}><i className={`bi ${status.icone}`} /><span>{status.texto}</span></div>
                  <Link href={`/meus-pedidos/${pedido.idVendas}`} className="order-details">Ver detalhes <i className="bi bi-arrow-right" /></Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
