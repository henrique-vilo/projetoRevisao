"use client";

import { useState } from "react";

export default function Ajuda() {
const [busca, setBusca] = useState("");
const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");

const categorias = [
{
id: "pedidos",
titulo: "Pedidos",
descricao: "Acompanhe sua compra e tire dúvidas sobre entrega.",
icone: "📦",
perguntas: [
{
pergunta: "Como acompanho meu pedido?",
resposta:
"Acesse sua conta e entre na área 'Meus pedidos'. Lá você poderá consultar o status da sua compra e acompanhar as atualizações da entrega.",
},
{
pergunta: "Como sei se meu pedido foi aprovado?",
resposta:
"Após a confirmação do pagamento, você receberá uma atualização no e-mail cadastrado. Também é possível consultar o status diretamente em 'Meus pedidos'.",
},
{
pergunta: "Posso alterar o endereço de entrega?",
resposta:
"Depois que o pedido for confirmado, normalmente não é possível alterar o endereço diretamente. Entre em contato com nosso atendimento o quanto antes para verificarmos as possibilidades.",
},
{
pergunta: "Meu pedido está atrasado. O que faço?",
resposta:
"Primeiro, confira o prazo informado em 'Meus pedidos'. Caso o prazo tenha sido ultrapassado, entre em contato com nosso atendimento para verificarmos o status da entrega.",
},
],
},

```
{
  id: "trocas",
  titulo: "Trocas e devoluções",
  descricao: "Saiba como trocar ou devolver seus produtos.",
  icone: "🔄",
  perguntas: [
    {
      pergunta: "Como faço uma troca?",
      resposta:
        "Acesse 'Meus pedidos', selecione a compra desejada e escolha a opção de troca, quando disponível. Siga as instruções apresentadas durante o processo.",
    },
    {
      pergunta: "Como faço uma devolução?",
      resposta:
        "Entre em 'Meus pedidos', selecione o produto que deseja devolver e siga as instruções para solicitar a devolução.",
    },
    {
      pergunta: "Qual é o prazo para troca?",
      resposta:
        "O prazo e as condições para troca podem variar de acordo com o produto e a situação. Consulte a política de trocas da loja antes de realizar a solicitação.",
    },
    {
      pergunta: "Quando receberei meu reembolso?",
      resposta:
        "O prazo de reembolso depende da forma de pagamento utilizada. Após a aprovação da devolução, você receberá as informações referentes ao processamento.",
    },
  ],
},

{
  id: "pagamento",
  titulo: "Pagamentos",
  descricao: "Informações sobre formas de pagamento e cobranças.",
  icone: "💳",
  perguntas: [
    {
      pergunta: "Quais formas de pagamento são aceitas?",
      resposta:
        "Você pode pagar sua compra utilizando as formas de pagamento disponibilizadas no momento da finalização do pedido, como cartão e Pix.",
    },
    {
      pergunta: "Posso parcelar minha compra?",
      resposta:
        "Sim. As opções de parcelamento disponíveis serão apresentadas na etapa de pagamento, de acordo com a forma de pagamento escolhida.",
    },
    {
      pergunta: "Meu pagamento foi recusado. O que fazer?",
      resposta:
        "Confira os dados informados e tente novamente. Se o problema continuar, recomendamos entrar em contato com a instituição responsável pelo pagamento ou utilizar outra forma de pagamento.",
    },
    {
      pergunta: "Posso usar cupom de desconto?",
      resposta:
        "Sim. Caso você possua um cupom válido, informe o código no campo correspondente durante a finalização da compra.",
    },
  ],
},

{
  id: "entrega",
  titulo: "Entrega",
  descricao: "Consulte informações sobre frete e recebimento.",
  icone: "🚚",
  perguntas: [
    {
      pergunta: "Quais são as opções de entrega?",
      resposta:
        "As opções de entrega disponíveis dependem do endereço informado e serão apresentadas durante a finalização da compra.",
    },
    {
      pergunta: "Como calculo o valor do frete?",
      resposta:
        "Informe seu CEP no carrinho ou durante o checkout. O sistema apresentará as opções de entrega e os respectivos valores.",
    },
    {
      pergunta: "Outra pessoa pode receber meu pedido?",
      resposta:
        "A entrega poderá ser recebida por outra pessoa no endereço informado, de acordo com as regras da transportadora responsável.",
    },
    {
      pergunta: "O que acontece se ninguém estiver no endereço?",
      resposta:
        "A transportadora poderá realizar uma nova tentativa de entrega ou seguir os procedimentos definidos para pedidos não recebidos.",
    },
  ],
},

{
  id: "conta",
  titulo: "Minha conta",
  descricao: "Ajuda com cadastro, senha e informações pessoais.",
  icone: "👤",
  perguntas: [
    {
      pergunta: "Como criar uma conta?",
      resposta:
        "Clique em 'Criar conta' ou 'Cadastro' no menu da loja e preencha seus dados. Após finalizar o cadastro, você poderá acessar sua conta.",
    },
    {
      pergunta: "Esqueci minha senha. O que faço?",
      resposta:
        "Na página de login, clique em 'Esqueci minha senha' e siga as instruções enviadas para o seu e-mail.",
    },
    {
      pergunta: "Como alterar meus dados?",
      resposta:
        "Acesse sua conta e procure pela área de informações pessoais ou configurações do perfil.",
    },
    {
      pergunta: "Como sair da minha conta?",
      resposta:
        "Abra o menu da sua conta e selecione a opção 'Sair'.",
    },
  ],
},

{
  id: "produtos",
  titulo: "Produtos",
  descricao: "Dúvidas sobre tamanhos, disponibilidade e produtos.",
  icone: "👕",
  perguntas: [
    {
      pergunta: "Como saber qual tamanho comprar?",
      resposta:
        "Consulte a tabela de medidas disponível na página do produto. Compare as medidas indicadas com uma peça que você já possui para escolher o tamanho mais adequado.",
    },
    {
      pergunta: "Um produto pode voltar ao estoque?",
      resposta:
        "Produtos esgotados podem voltar ao estoque. Caso exista a opção de aviso de disponibilidade, cadastre seu e-mail para receber uma notificação.",
    },
    {
      pergunta: "As cores podem variar?",
      resposta:
        "A tonalidade apresentada na tela pode sofrer pequenas variações dependendo do dispositivo utilizado.",
    },
    {
      pergunta: "Como encontro um produto específico?",
      resposta:
        "Utilize a barra de pesquisa da loja ou navegue pelas categorias disponíveis no menu.",
    },
  ],
},
```

];

const todasPerguntas = categorias.flatMap((categoria) =>
categoria.perguntas.map((pergunta) => ({
...pergunta,
categoria: categoria.titulo,
icone: categoria.icone,
}))
);

const perguntasFiltradas = todasPerguntas.filter((item) => {
const textoBusca = busca.toLowerCase();

```
const correspondeBusca =
  item.pergunta.toLowerCase().includes(textoBusca) ||
  item.resposta.toLowerCase().includes(textoBusca) ||
  item.categoria.toLowerCase().includes(textoBusca);

const correspondeCategoria =
  categoriaSelecionada === "Todos" ||
  item.categoria === categoriaSelecionada;

return correspondeBusca && correspondeCategoria;
```

});

return ( <main className="bg-light min-vh-100">

```
  {/* CABEÇALHO DA CENTRAL */}
  <section className="bg-dark text-white py-5">
    <div className="container py-4">

      <div className="text-center">
        <p className="text-uppercase small fw-bold mb-2">
          Central de atendimento
        </p>

        <h1 className="display-5 fw-bold">
          Como podemos ajudar?
        </h1>

        <p className="lead text-white-50 mb-4">
          Encontre respostas para suas dúvidas sobre compras,
          pedidos, entregas e muito mais.
        </p>
      </div>

      {/* BARRA DE PESQUISA */}
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">

          <div className="input-group input-group-lg shadow">
            <span className="input-group-text bg-white border-0">
              🔎
            </span>

            <input
              type="text"
              className="form-control border-0"
              placeholder="Digite aqui sua dúvida..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            {busca && (
              <button
                className="btn btn-light border-0"
                onClick={() => setBusca("")}
              >
                Limpar
              </button>
            )}
          </div>

        </div>
      </div>

    </div>
  </section>

  {/* PERGUNTAS RÁPIDAS */}
  <section className="bg-white border-bottom">
    <div className="container py-4">

      <h2 className="h5 fw-bold mb-3">
        Talvez você esteja procurando por:
      </h2>

      <div className="d-flex flex-wrap gap-2">

        {[
          "Onde está meu pedido?",
          "Como faço uma troca?",
          "Quero devolver um produto",
          "Formas de pagamento",
          "Como escolher meu tamanho?",
        ].map((pergunta) => (
          <button
            key={pergunta}
            className="btn btn-outline-dark rounded-pill"
            onClick={() => setBusca(pergunta)}
          >
            {pergunta}
          </button>
        ))}

      </div>

    </div>
  </section>

  {/* CATEGORIAS */}
  <section className="container py-5">

    <div className="text-center mb-4">
      <h2 className="fw-bold">
        Ajuda por categoria
      </h2>

      <p className="text-secondary">
        Escolha um assunto para encontrar as informações que procura.
      </p>
    </div>

    <div className="row g-3 justify-content-center">

      <div className="col-6 col-md-4 col-lg-2">
        <button
          className={`card h-100 w-100 border-0 shadow-sm ${
            categoriaSelecionada === "Todos"
              ? "bg-dark text-white"
              : "bg-white"
          }`}
          onClick={() => setCategoriaSelecionada("Todos")}
        >
          <div className="card-body text-center py-4">
            <div className="fs-2 mb-2">⭐</div>
            <h3 className="h6 fw-bold mb-0">
              Todos
            </h3>
          </div>
        </button>
      </div>

      {categorias.map((categoria) => (

        <div
          className="col-6 col-md-4 col-lg-2"
          key={categoria.id}
        >

          <button
            className={`card h-100 w-100 border-0 shadow-sm ${
              categoriaSelecionada === categoria.titulo
                ? "bg-dark text-white"
                : "bg-white"
            }`}
            onClick={() =>
              setCategoriaSelecionada(categoria.titulo)
            }
          >

            <div className="card-body text-center py-4">

              <div className="fs-2 mb-2">
                {categoria.icone}
              </div>

              <h3 className="h6 fw-bold mb-0">
                {categoria.titulo}
              </h3>

            </div>

          </button>

        </div>

      ))}

    </div>

  </section>

  {/* RESULTADOS / FAQ */}
  <section className="container pb-5">

    <div className="row justify-content-center">

      <div className="col-12 col-lg-9">

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>
            <h2 className="h4 fw-bold mb-1">
              Dúvidas frequentes
            </h2>

            <p className="text-secondary mb-0">
              {perguntasFiltradas.length} resultado(s) encontrado(s)
            </p>
          </div>

        </div>

        {perguntasFiltradas.length > 0 ? (

          <div className="accordion" id="faqAccordion">

            {perguntasFiltradas.map((item, index) => {

              const id = `faq-${index}`;

              return (
                <div
                  className="accordion-item border-0 shadow-sm mb-2 rounded"
                  key={`${item.pergunta}-${index}`}
                >

                  <h2 className="accordion-header">

                    <button
                      className="accordion-button collapsed fw-semibold"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#${id}`}
                    >

                      <span className="me-2">
                        {item.icone}
                      </span>

                      {item.pergunta}

                    </button>

                  </h2>

                  <div
                    id={id}
                    className="accordion-collapse collapse"
                    data-bs-parent="#faqAccordion"
                  >

                    <div className="accordion-body text-secondary">

                      <small className="text-uppercase fw-bold">
                        {item.categoria}
                      </small>

                      <p className="mb-0 mt-2">
                        {item.resposta}
                      </p>

                    </div>

                  </div>

                </div>
              );

            })}

          </div>

        ) : (

          <div className="bg-white rounded shadow-sm p-5 text-center">

            <div className="display-4 mb-3">
              🔍
            </div>

            <h3 className="h5 fw-bold">
              Não encontramos essa dúvida
            </h3>

            <p className="text-secondary">
              Tente utilizar outras palavras ou entre em contato
              com nossa equipe.
            </p>

            <button
              className="btn btn-dark"
              onClick={() => {
                setBusca("");
                setCategoriaSelecionada("Todos");
              }}
            >
              Ver todas as dúvidas
            </button>

          </div>

        )}

      </div>

    </div>

  </section>

  {/* ÁREA DE ATENDIMENTO */}
  <section className="bg-dark text-white py-5">

    <div className="container">

      <div className="row align-items-center g-4">

        <div className="col-md-7">

          <p className="text-uppercase small fw-bold mb-2">
            Ainda precisa de ajuda?
          </p>

          <h2 className="fw-bold">
            Fale com a nossa equipe
          </h2>

          <p className="text-white-50 mb-0">
            Não encontrou o que procurava?
            Nossa equipe está pronta para ajudar você.
          </p>

        </div>

        <div className="col-md-5">

          <div className="d-grid gap-2">

            <button className="btn btn-light btn-lg">
              💬 Falar pelo WhatsApp
            </button>

            <button className="btn btn-outline-light btn-lg">
              ✉️ Enviar uma mensagem
            </button>

          </div>

        </div>

      </div>

    </div>

  </section>

  {/* RODAPÉ DA CENTRAL */}
  <footer className="bg-white border-top">

    <div className="container py-4">

      <div className="row g-4">

        <div className="col-md-4">

          <h3 className="h6 fw-bold">
            Central de Ajuda
          </h3>

          <p className="small text-secondary mb-0">
            Estamos aqui para tornar sua experiência
            de compra mais simples.
          </p>

        </div>

        <div className="col-md-4">

          <h3 className="h6 fw-bold">
            Atendimento
          </h3>

          <p className="small text-secondary mb-1">
            Segunda a sexta
          </p>

          <p className="small text-secondary mb-0">
            09h às 18h
          </p>

        </div>

        <div className="col-md-4">

          <h3 className="h6 fw-bold">
            Segurança
          </h3>

          <p className="small text-secondary mb-0">
            Seus dados são tratados com segurança
            e privacidade.
          </p>

        </div>

      </div>

      <hr />

      <p className="text-center small text-secondary mb-0">
        © 2026 • Todos os direitos reservados.
      </p>

    </div>

  </footer>

</main>

);
}
