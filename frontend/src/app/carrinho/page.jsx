"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "./page.css";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const API_BASE_URL = `${API_ORIGIN}/api`;

export default function CarrinhoPage() {
  const router = useRouter();

  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [removendo, setRemovendo] = useState(null);
  const [erro, setErro] = useState("");

  // --------------------------------------------------
  // BUSCAR CARRINHO
  // --------------------------------------------------
async function buscarCarrinho() {
  try {
    setCarregando(true);
    setErro("");

    const token = localStorage.getItem("token");
    const usuarioSalvo = localStorage.getItem("usuario");

    if (!token || !usuarioSalvo) {
      router.push("/login");
      return;
    }

    const usuario = JSON.parse(usuarioSalvo);

    const idUsuario = usuario.idUsuario ?? usuario.id;

    if (!idUsuario) {
      console.error("Usuário encontrado, mas o ID não foi localizado:", usuario);

      setErro("Não foi possível identificar o usuário logado.");
      return;
    }

    const resposta = await fetch(
      `${API_BASE_URL}/vendas/carrinho/${idUsuario}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        dados?.mensagem ||
          dados?.erro ||
          "Não foi possível carregar o carrinho."
      );
    }

    setProdutos(Array.isArray(dados?.dados) ? dados.dados : []);
  } catch (error) {
    console.error("Erro ao carregar carrinho:", error);

    setErro(
      error.message || "Não foi possível carregar o carrinho."
    );
  } finally {
    setCarregando(false);
  }
}

  // --------------------------------------------------
  // REMOVER PRODUTO DO CARRINHO
  // --------------------------------------------------
  async function removerProduto(produto) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      /*
       * O backend guarda uma venda para cada unidade.
       *
       * Exemplo:
       * quantidade: 3
       * idsVendas: [15, 18, 21]
       *
       * Removemos apenas uma unidade por vez.
       */
      const idVenda = produto.idsVendas?.[produto.idsVendas.length - 1];

      if (!idVenda) {
        console.error("ID da venda não encontrado.");
        return;
      }

      setRemovendo(produto.idProduto);

      const resposta = await fetch(
        `${API_BASE_URL}/vendas/carrinho/${idVenda}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados?.mensagem ||
            dados?.erro ||
            "Não foi possível remover o produto."
        );
      }

      // Atualiza novamente com os dados reais do banco
      await buscarCarrinho();

      // Avisa outros componentes do site que o carrinho mudou
      window.dispatchEvent(new Event("carrinho-atualizado"));
    } catch (error) {
      console.error("Erro ao remover produto:", error);
      setErro(error.message || "Não foi possível remover o produto.");
    } finally {
      setRemovendo(null);
    }
  }

  // --------------------------------------------------
  // CARREGAR AO ABRIR A PÁGINA
  // --------------------------------------------------
  useEffect(() => {
    buscarCarrinho();
  }, []);

  // --------------------------------------------------
  // FORMATAR PREÇO
  // --------------------------------------------------
  function formatarPreco(valor) {
    const numero = Number(valor) || 0;

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // --------------------------------------------------
  // CÁLCULOS
  // --------------------------------------------------
  const subtotal = produtos.reduce((total, produto) => {
    const preco = Number(produto.preco) || 0;
    const quantidade = Number(produto.quantidade) || 0;

    return total + preco * quantidade;
  }, 0);

  const totalItens = produtos.reduce((total, produto) => {
    return total + (Number(produto.quantidade) || 0);
  }, 0);

  // --------------------------------------------------
  // CARREGANDO
  // --------------------------------------------------
  if (carregando) {
    return (
      <main className="carrinhoPage">
        <div className="carrinhoContainer">
          <div className="carrinhoCarregando">
            <p>Carregando seu carrinho...</p>
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // CARRINHO VAZIO
  // --------------------------------------------------
  if (produtos.length === 0) {
    return (
      <main className="carrinhoPage">
        <div className="carrinhoContainer">
          <div className="carrinhoVazio">
            <div className="carrinhoVazioIcone">
              🛒
            </div>

            <h1>Seu carrinho está vazio</h1>

            <p>
              Você ainda não adicionou nenhum produto ao seu carrinho.
            </p>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="finishButton"
            >
              Continuar comprando
            </button>
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // CARRINHO
  // --------------------------------------------------
  return (
    <main className="carrinhoPage">
      <div className="carrinhoContainer">

        {/* TÍTULO */}
        <div className="carrinhoHeader">
          <button
            type="button"
            className="carrinhoVoltar"
            onClick={() => router.back()}
          >
            ← Voltar
          </button>

          <h1>Meu carrinho</h1>

          <p>
            {totalItens}{" "}
            {totalItens === 1 ? "item" : "itens"} no carrinho
          </p>
        </div>

        {/* ERRO */}
        {erro && (
          <div className="carrinhoErro">
            {erro}
          </div>
        )}

        <div className="carrinhoLayout">

          {/* PRODUTOS */}
          <section className="summaryProducts">

            {produtos.map((produto) => {
              const preco = Number(produto.preco) || 0;
              const quantidade = Number(produto.quantidade) || 0;
              const totalProduto = preco * quantidade;

              return (
                <article
                  className="summaryProduct"
                  key={produto.idProduto}
                >

                  {/* IMAGEM */}
                  <div className="summaryImage">
                    {produto.imagem ? (
                      <img
                        src={produto.imagem}
                        alt={produto.nome || "Produto"}
                      />
                    ) : (
                      <div className="semImagem">
                        Sem imagem
                      </div>
                    )}
                  </div>

                  {/* INFORMAÇÕES */}
                  <div className="summaryProductInfo">

                    <div className="summaryProductTop">

                      <div>
                        <h2>
                          {produto.nome}
                        </h2>

                        {produto.variacao && (
                          <p>
                            {produto.variacao}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        className="removerProduto"
                        onClick={() =>
                          removerProduto(produto)
                        }
                        disabled={
                          removendo === produto.idProduto
                        }
                        aria-label={`Remover ${produto.nome}`}
                      >
                        {removendo === produto.idProduto
                          ? "Removendo..."
                          : "Remover"}
                      </button>

                    </div>

                    <div className="summaryProductBottom">

                      <div>
                        <span className="quantidadeLabel">
                          Quantidade
                        </span>

                        <span className="quantidadeValor">
                          {quantidade}
                        </span>
                      </div>

                      <div className="summaryProductPrice">
                        <span>
                          {formatarPreco(preco)} cada
                        </span>

                        <strong>
                          {formatarPreco(totalProduto)}
                        </strong>
                      </div>

                    </div>

                  </div>
                </article>
              );
            })}

          </section>

          {/* RESUMO */}
          <aside className="summaryValues">

            <h2>Resumo do pedido</h2>

            <div className="summaryLinha">
              <span>
                Produtos
              </span>

              <strong>
                {formatarPreco(subtotal)}
              </strong>
            </div>

            <div className="summaryLinha">
              <span>
                Frete
              </span>

              <strong>
                Calculado no checkout
              </strong>
            </div>

            <div className="summaryTotal">
              <span>
                Total
              </span>

              <strong>
                {formatarPreco(subtotal)}
              </strong>
            </div>

            <button
              type="button"
              className="finishButton"
              onClick={() => router.push("/finalizarCompra")}
            >
              Finalizar compra
            </button>

            <button
              type="button"
              className="continuarComprando"
              onClick={() => router.push("/")}
            >
              Continuar comprando
            </button>

          </aside>

        </div>
      </div>
    </main>
  );
}