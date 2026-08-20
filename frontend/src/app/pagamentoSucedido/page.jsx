"use client";

import Link from "next/link";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./page.css";

export default function PagamentoSucesso() {
  return (
    <main className="sucesso-container">
      <div className="sucesso-card">

        <div className="icone-sucesso">
          <i className="bi bi-check-circle"></i>
        </div>

        <h1>Pagamento bem-sucedido!</h1>

        <p className="mensagem">
          Seu pagamento foi aprovado e seu pedido já está sendo preparado.
        </p>

        <p className="pedido">
          Pedido <strong>#10248</strong>
        </p>

        <Link href="/entrega" className="btn-entrega">
          <i className="bi bi-box-seam"></i>
          Ver detalhes da entrega
        </Link>

        <Link href="/" className="voltar">
          Voltar para a página inicial
        </Link>

      </div>
    </main>
  );
}