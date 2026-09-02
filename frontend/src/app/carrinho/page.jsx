"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import "./page.css";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
)
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

function resolverImagem(caminho) {
  if (!caminho) return null;
  if (/^https?:\/\//i.test(caminho)) return caminho;
  if (caminho.startsWith("/uploads/")) return `${API_ORIGIN}${caminho}`;
  return caminho.startsWith("/") ? caminho : `/${caminho}`;
}

function formatarPreco(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function CarrinhoPage() {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [produtoPendente, setProdutoPendente] = useState(null);

  const requisitar = useCallback(async (caminho = "", opcoes = {}) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Entre na sua conta para acessar o carrinho.");

    const response = await fetch(`${API_ORIGIN}/api/vendas/carrinho${caminho}`, {
      ...opcoes,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(opcoes.body ? { "Content-Type": "application/json" } : {}),
        ...opcoes.headers,
      },
      cache: "no-store",
    });
    const resultado = await response.json().catch(() => ({}));
    if (!response.ok || !resultado.sucesso) {
      throw new Error(resultado.mensagem || "Não foi possível atualizar o carrinho.");
    }
    return resultado;
  }, []);

  const carregar = useCallback(async () => {
    setErro("");
    try {
      const resultado = await requisitar();
      setItens(
        (resultado.dados || []).map((item) => ({
          ...item,
          idProduto: Number(item.idProduto),
          idsVendas: Array.isArray(item.idsVendas)
            ? item.idsVendas.map(Number)
            : [],
          quantidade: Number(item.quantidade || 1),
          preco: Number(item.preco),
          imagem: resolverImagem(item.imagem1 || item.imagem),
        })),
      );
    } catch (error) {
      setItens([]);
      setErro(error.message || "Não foi possível carregar o carrinho.");
    } finally {
      setCarregando(false);
    }
  }, [requisitar]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function alterarQuantidade(item, delta) {
    if (produtoPendente !== null) return;
    setProdutoPendente(item.idProduto);
    setErro("");
    try {
      if (delta > 0) {
        await requisitar("", {
          method: "POST",
          body: JSON.stringify({ idProduto: item.idProduto }),
        });
      } else {
        const idVenda = item.idsVendas[item.idsVendas.length - 1];
        if (!idVenda) throw new Error("Item do carrinho inválido.");
        await requisitar(`/${idVenda}`, { method: "DELETE" });
      }
      await carregar();
      window.dispatchEvent(new Event("carrinho-atualizado"));
    } catch (error) {
      setErro(error.message || "Não foi possível alterar a quantidade.");
    } finally {
      setProdutoPendente(null);
    }
  }

  async function removerProduto(item) {
    if (produtoPendente !== null) return;
    setProdutoPendente(item.idProduto);
    setErro("");
    try {
      await Promise.all(
        item.idsVendas.map((idVenda) =>
          requisitar(`/${idVenda}`, { method: "DELETE" }),
        ),
      );
      await carregar();
      window.dispatchEvent(new Event("carrinho-atualizado"));
    } catch (error) {
      setErro(error.message || "Não foi possível remover o produto.");
      await carregar();
    } finally {
      setProdutoPendente(null);
    }
  }

  const subtotal = itens.reduce(
    (total, item) => total + item.preco * item.quantidade,
    0,
  );

  return (
    <main className="cart-page">
      <section className="cart-shell">
        <header className="cart-heading">
          <div>
            <span>SEU PEDIDO</span>
            <h1>Meu carrinho</h1>
          </div>
          <Link href="/produtos">Continuar comprando</Link>
        </header>

        {erro ? <div className="cart-error" role="alert">{erro}</div> : null}

        {carregando ? (
          <div className="cart-empty" role="status">Carregando seu carrinho...</div>
        ) : itens.length === 0 ? (
          <div className="cart-empty">
            <i className="bi bi-bag" aria-hidden="true" />
            <h2>Seu carrinho está vazio</h2>
            <p>Escolha seus produtos e eles aparecerão aqui.</p>
            <Link href="/produtos">Ver produtos</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <ul className="cart-products">
              {itens.map((item) => {
                const pendente = produtoPendente === item.idProduto;
                return (
                  <li key={item.idProduto} aria-busy={pendente}>
                    <div className="cart-product-image">
                      {item.imagem ? (
                        <Image
                          src={item.imagem}
                          alt={item.nomeCombinacao || item.nome || "Produto"}
                          fill
                          sizes="112px"
                          unoptimized={item.imagem.startsWith("http")}
                        />
                      ) : (
                        <i className="bi bi-image" aria-hidden="true" />
                      )}
                    </div>
                    <div className="cart-product-info">
                      <h2>{item.nomeCombinacao || item.nome || "Produto"}</h2>
                      <span>{formatarPreco(item.preco)}</span>
                      <div className="cart-product-actions">
                        <div className="cart-stepper">
                          <button
                            type="button"
                            onClick={() => alterarQuantidade(item, -1)}
                            disabled={pendente}
                            aria-label="Diminuir quantidade"
                          >
                            <i className="bi bi-dash" aria-hidden="true" />
                          </button>
                          <strong>{item.quantidade}</strong>
                          <button
                            type="button"
                            onClick={() => alterarQuantidade(item, 1)}
                            disabled={pendente || item.quantidade >= item.estoque}
                            aria-label="Aumentar quantidade"
                          >
                            <i className="bi bi-plus" aria-hidden="true" />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="cart-remove"
                          onClick={() => removerProduto(item)}
                          disabled={pendente}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                    <strong className="cart-line-total">
                      {formatarPreco(item.preco * item.quantidade)}
                    </strong>
                  </li>
                );
              })}
            </ul>

            <aside className="cart-summary">
              <span>RESUMO</span>
              <h2>Total do carrinho</h2>
              <div>
                <span>Subtotal</span>
                <strong>{formatarPreco(subtotal)}</strong>
              </div>
              <p>Frete e prazo serão apresentados na finalização.</p>
              <Link href="/finalizarCompra">Finalizar compra</Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
