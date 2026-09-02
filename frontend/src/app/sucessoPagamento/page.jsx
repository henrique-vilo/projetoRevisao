"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./page.css";

export default function PagamentoSucesso() {
  const [pedido, setPedido] = useState(null);

  useEffect(() => {
    const salvo = sessionStorage.getItem("everett-pedido-confirmado");
    if (!salvo) return;
    try {
      setPedido(JSON.parse(salvo));
    } catch {
      sessionStorage.removeItem("everett-pedido-confirmado");
    }
  }, []);

  const ids = Array.isArray(pedido?.idsVendas) ? pedido.idsVendas : [];
  const totalItens = Number(pedido?.quantidadeItens || ids.length || 0);

  return (
    <main className="success-page">
      <section className="success-shell">
        <div className="success-header">
          <div className="success-check" aria-hidden="true">
            <i className="bi bi-check-lg" />
          </div>

          <span className="success-eyebrow">COMPRA CONFIRMADA</span>
          <h1>Pedido realizado com sucesso!</h1>
          <p>
            Recebemos sua compra. Agora você pode acompanhar a preparação e a
            entrega do pedido.
          </p>
        </div>

        <div className="success-progress" aria-label="Próximas etapas do pedido">
          <div className="active">
            <span><i className="bi bi-check-lg" /></span>
            <strong>Confirmado</strong>
          </div>
          <div className="success-progress-line" />
          <div>
            <span><i className="bi bi-box-seam" /></span>
            <strong>Preparação</strong>
          </div>
          <div className="success-progress-line" />
          <div>
            <span><i className="bi bi-truck" /></span>
            <strong>Entrega</strong>
          </div>
        </div>

        <div className="success-summary">
          <h2>Resumo do pedido</h2>

          <dl>
            <div>
              <dt>Itens confirmados</dt>
              <dd>{totalItens || "—"}</dd>
            </div>
            <div>
              <dt>Data do pedido</dt>
              <dd>{pedido?.dataPedidoBR || "Registrado hoje"}</dd>
            </div>
            <div>
              <dt>Previsão de entrega</dt>
              <dd>{pedido?.dataEntregaBR || "Consulte o acompanhamento"}</dd>
            </div>
            {ids.length > 0 ? (
              <div className="success-order-ids">
                <dt>Identificação</dt>
                <dd>{ids.map((id) => `#${id}`).join(" · ")}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="success-actions">
          <Link href="/entrega" className="success-primary-action">
            Acompanhar entrega
            <i className="bi bi-arrow-right" aria-hidden="true" />
          </Link>
          <Link href="/produtos" className="success-secondary-action">
            Continuar comprando
          </Link>
        </div>

        <p className="success-note">
          <i className="bi bi-shield-check" aria-hidden="true" />
          Os dados do acompanhamento são carregados diretamente do seu pedido.
        </p>
      </section>
    </main>
  );
}
