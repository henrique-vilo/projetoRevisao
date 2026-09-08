"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./page.css";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/$/, "");

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [marcandoTodas, setMarcandoTodas] = useState(false);
  const [marcandoId, setMarcandoId] = useState(null);

  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);

  const LIMITE = 10;

  function obterToken() {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("token");
  }

  async function buscarNotificacoes(paginaAtual = 1) {
    try {
      setCarregando(true);
      setErro("");

      const token = obterToken();

      if (!token) {
        setErro("Sua sessão não foi encontrada. Faça login novamente.");
        return;
      }

      const resposta = await fetch(
        `${API_URL}/api/notificacoes?pagina=${paginaAtual}&limite=${LIMITE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dados = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        throw new Error(
          dados?.mensagem ||
            dados?.erro ||
            "Não foi possível carregar as notificações."
        );
      }

      setNotificacoes(dados?.dados || []);
      setPagina(dados?.paginacao?.pagina || paginaAtual);
      setTotalPaginas(dados?.paginacao?.totalPaginas || 1);
      setTotal(dados?.paginacao?.total || 0);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);

      if (error instanceof TypeError) {
        setErro(
          "Não foi possível conectar ao servidor. Verifique se o backend está funcionando."
        );
      } else {
        setErro(
          error.message || "Não foi possível carregar as notificações."
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    buscarNotificacoes(1);
  }, []);

  async function marcarComoLida(notificacao) {
    if (
      notificacao.lida === 1 ||
      notificacao.lida === true
    ) {
      return;
    }

    try {
      setMarcandoId(notificacao.idNotificacao);
      setErro("");

      const token = obterToken();

      if (!token) {
        setErro("Sua sessão não foi encontrada. Faça login novamente.");
        return;
      }

      const resposta = await fetch(
        `${API_URL}/api/notificacoes/${notificacao.idNotificacao}/lida`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dados = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        throw new Error(
          dados?.mensagem ||
            dados?.erro ||
            "Não foi possível marcar a notificação como lida."
        );
      }

      setNotificacoes((listaAtual) =>
        listaAtual.map((item) =>
          item.idNotificacao === notificacao.idNotificacao
            ? {
                ...item,
                lida: 1,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Erro ao marcar notificação:", error);

      setErro(
        error.message ||
          "Não foi possível atualizar a notificação."
      );
    } finally {
      setMarcandoId(null);
    }
  }

  async function marcarTodasComoLidas() {
    try {
      setMarcandoTodas(true);
      setErro("");

      const token = obterToken();

      if (!token) {
        setErro("Sua sessão não foi encontrada. Faça login novamente.");
        return;
      }

      const resposta = await fetch(
        `${API_URL}/api/notificacoes/lidas`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dados = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        throw new Error(
          dados?.mensagem ||
            dados?.erro ||
            "Não foi possível marcar as notificações como lidas."
        );
      }

      setNotificacoes((listaAtual) =>
        listaAtual.map((item) => ({
          ...item,
          lida: 1,
        }))
      );
    } catch (error) {
      console.error("Erro ao marcar todas:", error);

      setErro(
        error.message ||
          "Não foi possível atualizar as notificações."
      );
    } finally {
      setMarcandoTodas(false);
    }
  }

  function formatarData(data) {
    if (!data) {
      return "";
    }

    const dataObj = new Date(data);

    if (Number.isNaN(dataObj.getTime())) {
      return data;
    }

    return dataObj.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const naoLidas = notificacoes.filter(
    (notificacao) =>
      notificacao.lida === 0 ||
      notificacao.lida === false ||
      notificacao.lida === null
  ).length;

  return (
    <main className="notificacoes-page">
      <div className="notificacoes-container">

        <div className="notificacoes-topo">
          <div>
            <div className="notificacoes-breadcrumb">
              <Link href="/">Início</Link>
              <span>/</span>
              <span>Notificações</span>
            </div>

            <h1>Notificações</h1>

            <p>
              Acompanhe os avisos e atualizações importantes do sistema.
            </p>
          </div>

          <Link href="/" className="btn-voltar">
            <i className="bi bi-arrow-left"></i>
            Voltar
          </Link>
        </div>

        {erro && (
          <div className="notificacao-erro">
            <i className="bi bi-exclamation-triangle"></i>

            <span>{erro}</span>

            <button
              type="button"
              onClick={() => buscarNotificacoes(pagina)}
            >
              Tentar novamente
            </button>
          </div>
        )}

        <section className="notificacoes-card">

          <div className="notificacoes-card-header">

            <div className="titulo-notificacoes">

              <div className="icone-titulo">
                <i className="bi bi-bell"></i>
              </div>

              <div>
                <h2>Suas notificações</h2>

                <span>
                  {total}{" "}
                  {total === 1
                    ? "notificação"
                    : "notificações"}
                </span>
              </div>

            </div>

            {naoLidas > 0 && (
              <button
                type="button"
                className="marcar-todas"
                onClick={marcarTodasComoLidas}
                disabled={marcandoTodas}
              >
                {marcandoTodas ? (
                  <>
                    <span className="mini-spinner"></span>
                    Marcando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-all"></i>
                    Marcar todas como lidas
                  </>
                )}
              </button>
            )}

          </div>

          {carregando && (
            <div className="estado-notificacoes">
              <div className="spinner-notificacoes"></div>

              <h3>Carregando notificações...</h3>

              <p>
                Buscando suas notificações.
              </p>
            </div>
          )}

          {!carregando &&
            notificacoes.length === 0 &&
            !erro && (
              <div className="estado-notificacoes">

                <div className="icone-vazio">
                  <i className="bi bi-bell-slash"></i>
                </div>

                <h3>Nenhuma notificação</h3>

                <p>
                  Quando houver novos avisos ou atualizações,
                  eles aparecerão aqui.
                </p>

                <Link
                  href="/"
                  className="btn-voltar-vazio"
                >
                  <i className="bi bi-house"></i>
                  Voltar para o início
                </Link>

              </div>
            )}

          {!carregando && notificacoes.length > 0 && (
            <div className="lista-notificacoes">

              {notificacoes.map((notificacao) => {

                const naoLida =
                  notificacao.lida === 0 ||
                  notificacao.lida === false ||
                  notificacao.lida === null;

                return (
                  <div
                    key={notificacao.idNotificacao}
                    className={`notificacao-item ${
                      naoLida ? "nao-lida" : ""
                    }`}
                    onClick={() =>
                      marcarComoLida(notificacao)
                    }
                  >

                    <div className="notificacao-icone">
                      <i className="bi bi-bell"></i>
                    </div>

                    <div className="notificacao-conteudo">

                      <div className="notificacao-titulo-linha">

                        <h3>
                          {notificacao.titulo ||
                            "Nova notificação"}
                        </h3>

                        {naoLida && (
                          <span className="bolinha-nao-lida"></span>
                        )}

                      </div>

                      <p>
                        {notificacao.mensagem ||
                          notificacao.texto ||
                          notificacao.descricao ||
                          "Você recebeu uma nova notificação."}
                      </p>

                      {notificacao.suporte_titulo && (
                        <div className="notificacao-suporte">
                          <i className="bi bi-headset"></i>

                          <span>
                            {notificacao.suporte_titulo}
                          </span>
                        </div>
                      )}

                      <span className="notificacao-data">
                        <i className="bi bi-clock"></i>

                        {formatarData(
                          notificacao.dataCriacao
                        )}
                      </span>

                    </div>

                    <button
                      type="button"
                      className="btn-visualizar"
                      onClick={(event) => {
                        event.stopPropagation();
                        marcarComoLida(notificacao);
                      }}
                      disabled={
                        marcandoId ===
                        notificacao.idNotificacao
                      }
                    >
                      {marcandoId ===
                      notificacao.idNotificacao ? (
                        <span className="mini-spinner"></span>
                      ) : naoLida ? (
                        <i className="bi bi-check2"></i>
                      ) : (
                        <i className="bi bi-check2-all"></i>
                      )}
                    </button>

                  </div>
                );
              })}

            </div>
          )}

          {!carregando &&
            notificacoes.length > 0 &&
            totalPaginas > 1 && (

              <div className="paginacao">

                <button
                  type="button"
                  disabled={pagina <= 1}
                  onClick={() =>
                    buscarNotificacoes(pagina - 1)
                  }
                >
                  <i className="bi bi-chevron-left"></i>
                  Anterior
                </button>

                <span>
                  Página <strong>{pagina}</strong> de{" "}
                  <strong>{totalPaginas}</strong>
                </span>

                <button
                  type="button"
                  disabled={pagina >= totalPaginas}
                  onClick={() =>
                    buscarNotificacoes(pagina + 1)
                  }
                >
                  Próxima
                  <i className="bi bi-chevron-right"></i>
                </button>

              </div>
            )}

        </section>
      </div>
    </main>
  );
}