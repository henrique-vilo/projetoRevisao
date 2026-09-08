"use client";

import Link from "next/link";
import "./page.css";

export default function CompraSucesso() {
  return (
    <main className="sucessoPage">
      <div className="sucessoContainer">
        <div className="sucessoCard">
          <div className="sucessoIcon">
            <i className="bi bi-check-lg"></i>
          </div>

          <span className="sucessoEyebrow">
            COMPRA REALIZADA
          </span>

          <h1>Compra realizada com sucesso!</h1>

          <p className="sucessoMensagem">
            Obrigado pela sua compra! Seu pedido foi recebido e
            está sendo preparado com carinho.
          </p>

          <p className="sucessoEmail">
            <i className="bi bi-envelope"></i>
            Você receberá as informações e atualizações do seu
            pedido no seu e-mail.
          </p>

          <Link href="/" className="voltarInicio">
            <i className="bi bi-house"></i>
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </main>
  );
}

