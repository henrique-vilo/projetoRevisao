"use client";

import Link from "next/link";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./page.css";

export default function Entrega() {
  // Depois você pode receber isso da API
  const statusAtual = "enviado";

  const etapas = [
    {
      status: "pendente",
      titulo: "Pedido confirmado",
      descricao: "Seu pedido foi recebido e está aguardando processamento.",
      icone: "bi-check-lg",
    },
    {
      status: "processando",
      titulo: "Pedido em preparação",
      descricao: "Estamos separando e preparando seus produtos.",
      icone: "bi-box-seam",
    },
    {
      status: "enviado",
      titulo: "Pedido enviado",
      descricao: "Seu pedido já está a caminho.",
      icone: "bi-truck",
    },
    {
      status: "entregue",
      titulo: "Pedido entregue",
      descricao: "Seu pedido foi entregue com sucesso.",
      icone: "bi-house-check",
    },
  ];

  const ordemStatus = {
    pendente: 1,
    processando: 2,
    enviado: 3,
    entregue: 4,
  };

  const statusCancelado = statusAtual === "cancelado";

  return (
    <main className="entrega-container">
      <div className="entrega-card">

        {/* Cabeçalho */}
        <div className="entrega-header">
          <Link href="/" className="voltar">
            <i className="bi bi-arrow-left"></i>
          </Link>

          <div>
            <span className="label">ACOMPANHAMENTO</span>
            <h1>Detalhes da entrega</h1>
          </div>
        </div>

        {/* Informações do pedido */}
        <div className="pedido-info">
          <div>
            <span>Pedido</span>
            <strong>#10248</strong>
          </div>

          <div>
            <span>Previsão de entrega</span>
            <strong>25 de agosto</strong>
          </div>
        </div>

        {/* Status atual */}
        <div className={`status-atual ${statusCancelado ? "cancelado" : ""}`}>
          <div className="status-icon">
            <i
              className={
                statusCancelado
                  ? "bi bi-x-lg"
                  : "bi bi-truck"
              }
            ></i>
          </div>

          <div>
            <span>Status atual</span>

            <h2>
              {statusCancelado
                ? "Pedido cancelado"
                : etapas.find((etapa) => etapa.status === statusAtual)
                    ?.titulo}
            </h2>

            <p>
              {statusCancelado
                ? "Este pedido foi cancelado."
                : etapas.find((etapa) => etapa.status === statusAtual)
                    ?.descricao}
            </p>
          </div>
        </div>

        {/* Linha do tempo */}
        {!statusCancelado && (
          <div className="timeline">

            {etapas.map((etapa, index) => {
              const concluida =
                ordemStatus[etapa.status] <= ordemStatus[statusAtual];

              const atual = etapa.status === statusAtual;

              return (
                <div
                  className={`timeline-item ${
                    concluida ? "concluida" : ""
                  } ${atual ? "atual" : ""}`}
                  key={etapa.status}
                >

                  <div className="timeline-left">

                    <div className="timeline-icon">
                      <i className={`bi ${etapa.icone}`}></i>
                    </div>

                    {index < etapas.length - 1 && (
                      <div className="timeline-line"></div>
                    )}

                  </div>

                  <div className="timeline-content">
                    <h3>{etapa.titulo}</h3>
                    <p>{etapa.descricao}</p>

                    {atual && (
                      <span className="status-badge">
                        Status atual
                      </span>
                    )}
                  </div>

                </div>
              );
            })}

          </div>
        )}

        {/* Endereço */}
        <div className="endereco">
          <div className="endereco-icon">
            <i className="bi bi-geo-alt"></i>
          </div>

          <div>
            <span>Endereço de entrega</span>
            <strong>Rua das Flores, 120</strong>
            <p>Santo André - SP</p>
          </div>
        </div>

        <Link href="/" className="voltar-loja">
          Continuar comprando
        </Link>

      </div>
    </main>
  );
}