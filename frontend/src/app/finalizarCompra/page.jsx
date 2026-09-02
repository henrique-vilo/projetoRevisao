"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "./page.css";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
)
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

function resolverImagem(caminho) {
  if (!caminho) return null;
  const valor = String(caminho).trim().replace(/\\/g, "/");
  if (!valor) return null;
  if (/^(https?:|data:|blob:)/i.test(valor)) return valor;
  if (valor.startsWith("/uploads/")) return `${API_ORIGIN}${valor}`;
  if (valor.startsWith("uploads/")) return `${API_ORIGIN}/${valor}`;
  if (valor.startsWith("/")) return valor;
  return `${API_ORIGIN}/uploads/${encodeURIComponent(valor)}`;
}

function ImagemResumoProduto({ caminho, nome }) {
  const [imagemComErro, setImagemComErro] = useState(false);

  useEffect(() => {
    setImagemComErro(false);
  }, [caminho]);

  if (!caminho || imagemComErro) {
    return (
      <div
        className="summaryImageFallback"
        role="img"
        aria-label={`${nome || "Produto"} sem imagem disponível`}
      >
        <i className="bi bi-image" aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      src={caminho}
      alt={nome || "Produto"}
      fill
      sizes="70px"
      unoptimized={caminho.startsWith("http")}
      onError={() => setImagemComErro(true)}
    />
  );
}

export default function FinalizarCompra() {
  const router = useRouter();
  const [carrinho, setCarrinho] = useState([]);
  const [carregandoCarrinho, setCarregandoCarrinho] = useState(true);
  const [erroCarrinho, setErroCarrinho] = useState("");

  const [dadosPessoais, setDadosPessoais] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
  });

  const [endereco, setEndereco] = useState({
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  const [formaPagamento, setFormaPagamento] = useState("pix");

  const [cartao, setCartao] = useState({
    nome: "",
    numero: "",
    validade: "",
    cvv: "",
  });

  const [carregandoCep, setCarregandoCep] = useState(false);
  const [finalizando, setFinalizando] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem("token");
    const usuarioSalvo = localStorage.getItem("usuario");

    if (usuarioSalvo) {
      try {
        const usuario = JSON.parse(usuarioSalvo);
        setDadosPessoais((dados) => ({
          ...dados,
          nome: usuario.nome || "",
          email: usuario.email || "",
          cpf: usuario.cpf || "",
          telefone: usuario.telefone || "",
        }));
        setEndereco((dados) => ({ ...dados, cep: usuario.cep || "" }));
      } catch {
        localStorage.removeItem("usuario");
      }
    }

    async function carregarCarrinho() {
      if (!token) {
        setErroCarrinho("Entre na sua conta para finalizar a compra.");
        setCarregandoCarrinho(false);
        return;
      }

      try {
        const response = await fetch(`${API_ORIGIN}/api/vendas/carrinho`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
          signal: controller.signal,
        });
        const resultado = await response.json().catch(() => ({}));
        if (!response.ok || !resultado.sucesso) {
          throw new Error(
            resultado.mensagem || "Não foi possível carregar seu carrinho.",
          );
        }
        setCarrinho(
          (resultado.dados || []).map((item) => ({
            ...item,
            id: Number(item.idProduto),
            preco: Number(item.preco),
            quantidade: Number(item.quantidade || 1),
            imagem: resolverImagem(item.imagem1 || item.imagem),
          })),
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          setErroCarrinho(error.message || "Não foi possível carregar seu carrinho.");
        }
      } finally {
        if (!controller.signal.aborted) setCarregandoCarrinho(false);
      }
    }

    carregarCarrinho();
    return () => controller.abort();
  }, []);

  /*
    ALTERAR DADOS PESSOAIS
  */
  function alterarDadosPessoais(e) {
    const { name, value } = e.target;

    setDadosPessoais((dadosAtuais) => ({
      ...dadosAtuais,
      [name]: value,
    }));
  }

  /*
    ALTERAR ENDEREÇO
  */
  function alterarEndereco(e) {
    const { name, value } = e.target;

    setEndereco((enderecoAtual) => ({
      ...enderecoAtual,
      [name]: value,
    }));
  }

  /*
    ALTERAR CARTÃO
  */
  function alterarCartao(e) {
    const { name, value } = e.target;

    setCartao((cartaoAtual) => ({
      ...cartaoAtual,
      [name]: value,
    }));
  }

  /*
    BUSCAR ENDEREÇO PELO CEP
  */
  async function buscarCep() {
    const cepLimpo = endereco.cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      return;
    }

    try {
      setCarregandoCep(true);

      const resposta = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );

      const dados = await resposta.json();

      if (dados.erro) {
        alert("CEP não encontrado.");
        return;
      }

      setEndereco((enderecoAtual) => ({
        ...enderecoAtual,
        rua: dados.logradouro || "",
        bairro: dados.bairro || "",
        cidade: dados.localidade || "",
        estado: dados.uf || "",
      }));
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      alert("Não foi possível buscar o CEP.");
    } finally {
      setCarregandoCep(false);
    }
  }

  /*
    CALCULAR SUBTOTAL
  */
  const subtotal = carrinho.reduce((total, item) => {
    return total + Number(item.preco) * Number(item.quantidade || 1);
  }, 0);

  /*
    FRETE
    Posteriormente você pode integrar
    com uma API de cálculo de frete.
  */
  const frete = carrinho.length > 0 ? 15 : 0;

  /*
    TOTAL
  */
  const total = subtotal + frete;

  /*
    FORMATAR PREÇO
  */
  function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  /*
    FINALIZAR PEDIDO
  */
  async function finalizarPedido(e) {
    e.preventDefault();

    if (carrinho.length === 0) {
      alert("Seu carrinho está vazio.");
      return;
    }

    try {
      setFinalizando(true);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

      const resposta = await fetch(
        `${API_ORIGIN}/api/vendas/carrinho/confirmar`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok || !resultado.sucesso) {
        throw new Error(resultado.mensagem || "Erro ao finalizar pedido.");
      }

      sessionStorage.setItem(
        "everett-pedido-confirmado",
        JSON.stringify(resultado.dados || {}),
      );
      setCarrinho([]);
      window.dispatchEvent(new Event("carrinho-atualizado"));
      router.push("/sucessoPagamento");
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);

      alert(
        error.message ||
          "Não foi possível finalizar o pedido."
      );
    } finally {
      setFinalizando(false);
    }
  }

  return (
    <main className="checkoutPage">
      <div className="checkoutContainer">

        {/* CABEÇALHO */}
        <div className="checkoutHeading">
          <div>
            <span className="checkoutEyebrow">
              FINALIZAÇÃO DE COMPRA
            </span>

            <h1>Finalizar compra</h1>

            <p>
              Confira suas informações e escolha a forma de pagamento.
            </p>
          </div>

          <Link href="/carrinho" className="voltarCarrinho">
            <i className="bi bi-arrow-left"></i>
            Voltar ao carrinho
          </Link>
        </div>

        {carregandoCarrinho ? (
          <div className="carrinhoVazio" role="status">
            <span className="spinner-border" aria-hidden="true" />
            <h2>Carregando seu carrinho</h2>
          </div>
        ) : carrinho.length === 0 ? (
          <div className="carrinhoVazio">
            <i className="bi bi-bag-x"></i>

            <h2>Seu carrinho está vazio</h2>

            <p>{erroCarrinho || "Adicione produtos ao carrinho antes de finalizar a compra."}</p>

            <Link href="/" className="continuarComprando">
              Continuar comprando
            </Link>
          </div>
        ) : (
          <form onSubmit={finalizarPedido}>
            <div className="checkoutLayout">

              {/* COLUNA ESQUERDA */}
              <div className="checkoutForm">

                {/* DADOS PESSOAIS */}
                <section className="checkoutCard">
                  <div className="cardHeader">
                    <div className="cardIcon">
                      <i className="bi bi-person"></i>
                    </div>

                    <div>
                      <span>ETAPA 1</span>
                      <h2>Informações pessoais</h2>
                    </div>
                  </div>

                  <div className="formGrid">
                    <div className="formField formFieldFull">
                      <label>Nome completo</label>

                      <input
                        type="text"
                        name="nome"
                        placeholder="Digite seu nome completo"
                        value={dadosPessoais.nome}
                        onChange={alterarDadosPessoais}
                        required
                      />
                    </div>

                    <div className="formField">
                      <label>E-mail</label>

                      <input
                        type="email"
                        name="email"
                        placeholder="seuemail@email.com"
                        value={dadosPessoais.email}
                        onChange={alterarDadosPessoais}
                        required
                      />
                    </div>

                    <div className="formField">
                      <label>CPF</label>

                      <input
                        type="text"
                        name="cpf"
                        placeholder="000.000.000-00"
                        value={dadosPessoais.cpf}
                        onChange={alterarDadosPessoais}
                        required
                      />
                    </div>

                    <div className="formField">
                      <label>Telefone</label>

                      <input
                        type="text"
                        name="telefone"
                        placeholder="(00) 00000-0000"
                        value={dadosPessoais.telefone}
                        onChange={alterarDadosPessoais}
                        required
                      />
                    </div>
                  </div>
                </section>

                {/* ENDEREÇO */}
                <section className="checkoutCard">
                  <div className="cardHeader">
                    <div className="cardIcon">
                      <i className="bi bi-geo-alt"></i>
                    </div>

                    <div>
                      <span>ETAPA 2</span>
                      <h2>Endereço de entrega</h2>
                    </div>
                  </div>

                  <div className="formGrid">

                    <div className="formField">
                      <label>CEP</label>

                      <div className="cepInput">
                        <input
                          type="text"
                          name="cep"
                          placeholder="00000-000"
                          value={endereco.cep}
                          onChange={alterarEndereco}
                          onBlur={buscarCep}
                          required
                        />

                        {carregandoCep && (
                          <span className="cepLoading">
                            ...
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="formField formFieldFull">
                      <label>Rua</label>

                      <input
                        type="text"
                        name="rua"
                        placeholder="Rua"
                        value={endereco.rua}
                        onChange={alterarEndereco}
                        required
                      />
                    </div>

                    <div className="formField">
                      <label>Número</label>

                      <input
                        type="text"
                        name="numero"
                        placeholder="Número"
                        value={endereco.numero}
                        onChange={alterarEndereco}
                        required
                      />
                    </div>

                    <div className="formField">
                      <label>Complemento</label>

                      <input
                        type="text"
                        name="complemento"
                        placeholder="Apartamento, bloco..."
                        value={endereco.complemento}
                        onChange={alterarEndereco}
                      />
                    </div>

                    <div className="formField">
                      <label>Bairro</label>

                      <input
                        type="text"
                        name="bairro"
                        placeholder="Bairro"
                        value={endereco.bairro}
                        onChange={alterarEndereco}
                        required
                      />
                    </div>

                    <div className="formField">
                      <label>Cidade</label>

                      <input
                        type="text"
                        name="cidade"
                        placeholder="Cidade"
                        value={endereco.cidade}
                        onChange={alterarEndereco}
                        required
                      />
                    </div>

                    <div className="formField">
                      <label>Estado</label>

                      <input
                        type="text"
                        name="estado"
                        placeholder="UF"
                        maxLength="2"
                        value={endereco.estado}
                        onChange={alterarEndereco}
                        required
                      />
                    </div>

                  </div>
                </section>

                {/* PAGAMENTO */}
                <section className="checkoutCard">
                  <div className="cardHeader">
                    <div className="cardIcon">
                      <i className="bi bi-credit-card"></i>
                    </div>

                    <div>
                      <span>ETAPA 3</span>
                      <h2>Forma de pagamento</h2>
                    </div>
                  </div>

                  <div className="paymentOptions">

                    <label
                      className={`paymentOption ${
                        formaPagamento === "pix" ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="pagamento"
                        value="pix"
                        checked={formaPagamento === "pix"}
                        onChange={(e) =>
                          setFormaPagamento(e.target.value)
                        }
                      />

                      <i className="bi bi-qr-code"></i>

                      <div>
                        <strong>Pix</strong>
                        <span>Pagamento instantâneo</span>
                      </div>
                    </label>

                    <label
                      className={`paymentOption ${
                        formaPagamento === "credito" ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="pagamento"
                        value="credito"
                        checked={formaPagamento === "credito"}
                        onChange={(e) =>
                          setFormaPagamento(e.target.value)
                        }
                      />

                      <i className="bi bi-credit-card"></i>

                      <div>
                        <strong>Cartão de crédito</strong>
                        <span>Pague com seu cartão</span>
                      </div>
                    </label>

                    <label
                      className={`paymentOption ${
                        formaPagamento === "debito" ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="pagamento"
                        value="debito"
                        checked={formaPagamento === "debito"}
                        onChange={(e) =>
                          setFormaPagamento(e.target.value)
                        }
                      />

                      <i className="bi bi-credit-card-2-front"></i>

                      <div>
                        <strong>Cartão de débito</strong>
                        <span>Pagamento à vista</span>
                      </div>
                    </label>

                  </div>

                  {/* CAMPOS DO CARTÃO */}
                  {formaPagamento !== "pix" && (
                    <div className="cardFields">

                      <div className="formField formFieldFull">
                        <label>Nome impresso no cartão</label>

                        <input
                          type="text"
                          name="nome"
                          placeholder="Nome como aparece no cartão"
                          value={cartao.nome}
                          onChange={alterarCartao}
                          required
                        />
                      </div>

                      <div className="formField formFieldFull">
                        <label>Número do cartão</label>

                        <input
                          type="text"
                          name="numero"
                          placeholder="0000 0000 0000 0000"
                          value={cartao.numero}
                          onChange={alterarCartao}
                          required
                        />
                      </div>

                      <div className="formField">
                        <label>Validade</label>

                        <input
                          type="text"
                          name="validade"
                          placeholder="MM/AA"
                          value={cartao.validade}
                          onChange={alterarCartao}
                          required
                        />
                      </div>

                      <div className="formField">
                        <label>CVV</label>

                        <input
                          type="password"
                          name="cvv"
                          placeholder="000"
                          maxLength="4"
                          value={cartao.cvv}
                          onChange={alterarCartao}
                          required
                        />
                      </div>

                    </div>
                  )}
                </section>

              </div>

              {/* RESUMO DO PEDIDO */}
              <aside className="orderSummary">

                <div className="summaryCard">

                  <div className="summaryHeader">
                    <div>
                      <span>SEU PEDIDO</span>
                      <h2>Resumo da compra</h2>
                    </div>

                    <i className="bi bi-bag"></i>
                  </div>

                  <div className="summaryProducts">

                    {carrinho.map((item, index) => {
                      const quantidade =
                        Number(item.quantidade) || 1;

                      const id =
                        item.idProduto ||
                        item.id ||
                        index;

                      const imagem = item.imagem || resolverImagem(
                        item.imagem1 || item.image,
                      );
                      const nomeProduto =
                        item.nomeCombinacao || item.nome || "Produto";

                      return (
                        <div
                          className="summaryProduct"
                          key={`${id}-${index}`}
                        >

                          <div className="summaryImage">
                            <ImagemResumoProduto
                              caminho={imagem}
                              nome={nomeProduto}
                            />
                          </div>

                          <div className="summaryProductInfo">

                            <h3>
                              {nomeProduto}
                            </h3>

                            {item.tamanho && (
                              <span>
                                Tamanho: {item.tamanho}
                              </span>
                            )}

                            <small>
                              Qtd: {quantidade}
                            </small>

                            <strong>
                              {formatarPreco(
                                Number(item.preco) *
                                  quantidade
                              )}
                            </strong>

                          </div>

                        </div>
                      );
                    })}

                  </div>

                  <div className="summaryValues">

                    <div>
                      <span>Subtotal</span>
                      <strong>
                        {formatarPreco(subtotal)}
                      </strong>
                    </div>

                    <div>
                      <span>Frete</span>
                      <strong>
                        {formatarPreco(frete)}
                      </strong>
                    </div>

                    <div className="summaryTotal">
                      <span>Total</span>
                      <strong>
                        {formatarPreco(total)}
                      </strong>
                    </div>

                  </div>

                  <button
                    type="submit"
                    className="finishButton"
                    disabled={finalizando}
                  >
                    {finalizando ? (
                      <>
                        <span className="spinner"></span>
                        Processando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-lock"></i>
                        Finalizar pedido
                      </>
                    )}
                  </button>

                  <div className="securityText">
                    <i className="bi bi-shield-check"></i>
                    <span>
                      Seus dados são protegidos e processados com segurança.
                    </span>
                  </div>

                </div>

              </aside>

            </div>
          </form>
        )}
      </div>
    </main>
  );
}
