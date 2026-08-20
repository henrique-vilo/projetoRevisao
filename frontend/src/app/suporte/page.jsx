"use client";

import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./page.css";

export default function Suporte() {
  const [perguntaAberta, setPerguntaAberta] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  
  // Estados do formulário
  const [assunto, setAssunto] = useState("");
  const [pergunta, setPergunta] = useState("");
  const [enviado, setEnviado] = useState(false);
  
  // Estados de controle da requisição
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const duvidas = [
    {
      pergunta: "Como faço para realizar uma compra?",
      resposta: 'Escolha o produto que deseja, selecione o tamanho e a quantidade e clique em "Adicionar ao carrinho". Depois, acesse seu carrinho, confira os produtos e siga para a finalização da compra.',
    },
    {
      pergunta: "Quais formas de pagamento são aceitas?",
      resposta: "Aceitamos as formas de pagamento disponibilizadas na etapa de finalização da compra, como cartão de crédito, cartão de débito e Pix.",
    },
    {
      pergunta: "Como acompanho meu pedido?",
      resposta: 'Acesse sua conta e vá até a seção "Meus pedidos". Lá você poderá visualizar o status da sua compra e acompanhar as informações de entrega.',
    },
    {
      pergunta: "Qual é o prazo de entrega?",
      resposta: "O prazo de entrega depende do endereço informado e da modalidade de envio escolhida. O prazo estimado será apresentado durante a finalização da compra.",
    },
    {
      pergunta: "Como faço uma troca?",
      resposta: "Para solicitar uma troca, acesse sua conta e consulte a área de pedidos. Selecione o pedido desejado e siga as instruções disponíveis para realizar a solicitação.",
    },
    {
      pergunta: "Como faço uma devolução?",
      resposta: "Entre na sua conta, acesse seus pedidos e selecione o produto que deseja devolver. Depois, siga as orientações apresentadas para concluir a solicitação.",
    },
    {
      pergunta: "Como escolher o tamanho correto?",
      resposta: "Na página de cada produto você encontrará informações sobre os tamanhos disponíveis. Consulte a tabela de medidas antes de escolher sua peça.",
    },
    {
      pergunta: "Esqueci minha senha. O que faço?",
      resposta: 'Na página de login, clique em "Esqueci minha senha" e siga as instruções para criar uma nova senha.',
    },
    {
      pergunta: "Posso cancelar meu pedido?",
      resposta: "Caso o pedido ainda não tenha sido enviado, entre em contato com nosso suporte o mais rápido possível para verificarmos a possibilidade de cancelamento.",
    },
    {
      pergunta: "O que faço se meu produto chegar com defeito?",
      resposta: "Entre em contato com nosso suporte informando o número do pedido e o problema encontrado. Nossa equipe irá orientar você sobre os próximos passos.",
    }
  ];

  function abrirPergunta(index) {
    setPerguntaAberta(perguntaAberta === index ? null : index);
  }

  function abrirModal() {
    setMostrarModal(true);
    setEnviado(false);
    setErro("");
  }

  function fecharModal() {
    setMostrarModal(false);
    setAssunto("");
    setPergunta("");
    setEnviado(false);
    setErro("");
  }

  async function enviarPergunta(e) {
    e.preventDefault();
    setErro("");

    if (assunto.trim().length < 3 || assunto.trim().length > 150) {
        setErro("O assunto deve ter entre 3 e 150 caracteres.");
        return;
    }

    if (pergunta.trim().length < 10 || pergunta.trim().length > 2000) {
        setErro("A mensagem deve ter entre 10 e 2000 caracteres.");
        return;
    }

    setCarregando(true);

    try {
      //const token = localStorage.getItem("token") || ""; 

      const respostaApi = await fetch("http://localhost:3001/api/suporte", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        //  "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          assunto: assunto.trim(),
          mensagem: pergunta.trim(),
          categoria: "geral" 
        }),
      });

      const dados = await respostaApi.json();

      if (!respostaApi.ok || !dados.sucesso) {
        throw new Error(dados.mensagem || "Erro ao enviar a solicitação.");
      }

      setEnviado(true);
    } catch (error) {
      setErro(error.message || "Não foi possível conectar ao servidor. Tente novamente mais tarde.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <main className="suporte-page">
      {/* =========================================
          CABEÇALHO DA PÁGINA
      ========================================== */}
      <section className="suporte-header">
        <div className="container">
          <div className="suporte-header-conteudo">
            <p className="suporte-subtitulo">CENTRAL DE ATENDIMENTO</p>
            <h1>Como podemos <span>ajudar?</span></h1>
            <p className="suporte-descricao">
              Encontre respostas para as dúvidas mais frequentes ou fale diretamente com nossa equipe.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================
          DÚVIDAS FREQUENTES
      ========================================== */}
      <section className="suporte-duvidas">
        <div className="container">
          <div className="suporte-titulo-secao">
            <span className="suporte-linha"></span>
            <div>
              <p className="suporte-mini-titulo">PERGUNTAS FREQUENTES</p>
              <h2>Dúvidas <span>frequentes</span></h2>
            </div>
            <span className="suporte-linha"></span>
          </div>

          {/* =========================================
              ACORDEÃO
          ========================================== */}
          <div className="row justify-content-center">
            <div className="col-12 col-lg-9">
              <div className="suporte-lista">
                {duvidas.map((duvida, index) => {
                  const aberta = perguntaAberta === index;
                  return (
                    <div className={`suporte-item ${aberta ? "item-aberto" : ""}`} key={index}>
                      {/* PERGUNTA */}
                      <button
                        type="button"
                        className="suporte-pergunta"
                        onClick={() => abrirPergunta(index)}
                        aria-expanded={aberta}
                      >
                        <span className="pergunta-texto">
                          <span className="pergunta-numero">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          {duvida.pergunta}
                        </span>
                        <span className="pergunta-icone">
                          <i className={aberta ? "bi bi-dash" : "bi bi-plus"}></i>
                        </span>
                      </button>

                      {/* RESPOSTA */}
                      {aberta && (
                        <div className="suporte-resposta">
                          <div className="resposta-conteudo">
                            <div className="resposta-icone">
                              <i className="bi bi-info-circle"></i>
                            </div>
                            <p>{duvida.resposta}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          FALE COM O SUPORTE
      ========================================== */}
      <section className="suporte-contato">
        <div className="container">
          <div className="contato-card">
            <div className="contato-icone">
              <i className="bi bi-chat-dots"></i>
            </div>
            <div className="contato-texto">
              <p className="contato-mini">PRECISA DE AJUDA?</p>
              <h2>Não encontrou sua dúvida?</h2>
              <p>Nossa equipe está pronta para ajudar você.</p>
            </div>
            <button type="button" className="btn-suporte" onClick={abrirModal}>
              Falar com o suporte
              <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================
          MODAL
      ========================================== */}
      {mostrarModal && (
        <>
          <div className="suporte-modal" role="dialog" aria-modal="true">
            <div className="modal-dialog-custom">
              <div className="modal-content-custom">
                {/* CABEÇALHO */}
                <div className="modal-header-custom">
                  <div className="modal-titulo-area">
                    <div className="modal-icone">
                      <i className="bi bi-chat-dots"></i>
                    </div>
                    <div>
                      <p>ATENDIMENTO</p>
                      <h2>Falar com o suporte</h2>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="modal-fechar"
                    onClick={fecharModal}
                    aria-label="Fechar"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>

                {/* CONTEÚDO */}
                <div className="modal-body-custom">
                  {!enviado ? (
                    <form onSubmit={enviarPergunta}>
                      {erro && (
                        <div className="alert alert-danger mb-3" role="alert">
                          {erro}
                        </div>
                      )}

                      <div className="mb-3">
                        <label htmlFor="assunto" className="modal-label">
                          Assunto
                        </label>
                        <input
                          id="assunto"
                          type="text"
                          className="modal-input form-control"
                          placeholder="Resumo da sua solicitação..."
                          value={assunto}
                          onChange={(e) => setAssunto(e.target.value)}
                          disabled={carregando}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="pergunta" className="modal-label">
                          Qual é a sua dúvida?
                        </label>
                        <textarea
                          id="pergunta"
                          className="modal-textarea form-control"
                          rows="5"
                          placeholder="Descreva sua solicitação detalhadamente (mín. 10 caracteres)..."
                          value={pergunta}
                          onChange={(e) => setPergunta(e.target.value)}
                          disabled={carregando}
                          required
                        />
                      </div>

                      <div className="modal-botoes">
                        <button
                          type="button"
                          className="btn-cancelar"
                          onClick={fecharModal}
                          disabled={carregando}
                        >
                          Cancelar
                        </button>

                        <button
                          type="submit"
                          className="btn-enviar"
                          disabled={carregando || !pergunta.trim() || !assunto.trim()}
                        >
                          {carregando ? "Enviando..." : "Enviar pergunta"}
                          {!carregando && <i className="bi bi-send"></i>}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="mensagem-sucesso">
                      <div className="icone-sucesso">
                        <i className="bi bi-check-lg"></i>
                      </div>
                      <h3>Pergunta enviada!</h3>
                      <p>Recebemos sua dúvida e nossa equipe irá analisá-la.</p>
                      <button
                        type="button"
                        className="btn-enviar"
                        onClick={fecharModal}
                      >
                        Fechar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* FUNDO ESCURO */}
          <div className="suporte-backdrop" onClick={fecharModal}></div>
        </>
      )}
    </main>
    </>
  );
}