"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "./page.css";

const API_ORIGIN = (
process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const API_BASE_URL = `${API_ORIGIN}/api`;

function resolverImagem(caminho) {
  if (!caminho) return null;
  if (/^https?:\/\//i.test(caminho)) return caminho;
  return `${API_ORIGIN}${caminho.startsWith("/") ? caminho : `/${caminho}`}`;
}

function somenteNumeros(valor, limite) {
  return String(valor ?? "").replace(/\D/g, "").slice(0, limite);
}

function formatarCpf(valor) {
  const numeros = somenteNumeros(valor, 11);
  if (numeros.length <= 3) return numeros;
  if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
  if (numeros.length <= 9) {
    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
  }
  return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
}

function formatarTelefone(valor) {
  const numeros = somenteNumeros(valor, 11);
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  if (numeros.length <= 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

function formatarCep(valor) {
  const numeros = somenteNumeros(valor, 8);
  if (numeros.length <= 5) return numeros;
  return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
}

async function consultarCep(cep, signal) {
  const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal });
  if (!resposta.ok) throw new Error("Não foi possível consultar o CEP.");

  const dados = await resposta.json();
  if (dados.erro) throw new Error("CEP não encontrado.");
  return dados;
}

export default function FinalizarCompra() {
const router = useRouter();

const [carrinho, setCarrinho] = useState([]);
const [carregando, setCarregando] = useState(true);

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
  const abortController = new AbortController();

  async function carregarCheckout() {
    try {
      setCarregando(true);
      const token = localStorage.getItem("token");
      const usuarioSalvo = localStorage.getItem("usuario");

      if (!token || !usuarioSalvo) {
        router.replace("/login");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };
      const [respostaCarrinho, respostaPerfil] = await Promise.all([
        fetch(`${API_BASE_URL}/vendas/carrinho`, {
          headers,
          cache: "no-store",
          signal: abortController.signal,
        }),
        fetch(`${API_BASE_URL}/auth/perfil`, {
          headers,
          cache: "no-store",
          signal: abortController.signal,
        }),
      ]);
      const [dadosCarrinho, dadosPerfil] = await Promise.all([
        respostaCarrinho.json().catch(() => ({})),
        respostaPerfil.json().catch(() => ({})),
      ]);

      if ([respostaCarrinho.status, respostaPerfil.status].some((status) => status === 401)) {
        router.replace("/login");
        return;
      }
      if (!respostaCarrinho.ok) {
        throw new Error(dadosCarrinho.mensagem || dadosCarrinho.erro || "Não foi possível carregar o carrinho.");
      }
      if (!respostaPerfil.ok) {
        throw new Error(dadosPerfil.mensagem || dadosPerfil.erro || "Não foi possível carregar seus dados.");
      }

      const perfil = dadosPerfil.dados?.usuario || dadosPerfil.dados || dadosPerfil.usuario;
      if (!perfil) throw new Error("Os dados do usuário logado não foram encontrados.");

      setCarrinho(Array.isArray(dadosCarrinho.dados) ? dadosCarrinho.dados : []);
      setDadosPessoais({
        nome: perfil.nome || "",
        email: perfil.email || "",
        cpf: formatarCpf(perfil.cpf),
        telefone: formatarTelefone(perfil.telefone),
      });

      const cepFormatado = formatarCep(perfil.cep);
      setEndereco((enderecoAtual) => ({ ...enderecoAtual, cep: cepFormatado }));

      const cepLimpo = somenteNumeros(cepFormatado, 8);
      if (cepLimpo.length === 8) {
        try {
          setCarregandoCep(true);
          const dadosCep = await consultarCep(cepLimpo, abortController.signal);
          if (!abortController.signal.aborted) {
            setEndereco((enderecoAtual) => ({
              ...enderecoAtual,
              rua: dadosCep.logradouro || "",
              bairro: dadosCep.bairro || "",
              cidade: dadosCep.localidade || "",
              estado: dadosCep.uf || "",
            }));
          }
        } catch (error) {
          if (error.name === "AbortError") return;
        } finally {
          if (!abortController.signal.aborted) setCarregandoCep(false);
        }
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Erro ao carregar o checkout:", error);
        setCarrinho([]);
      }
    } finally {
      if (!abortController.signal.aborted) setCarregando(false);
    }
  }

  carregarCheckout();
  return () => abortController.abort();
}, [router]);

// --------------------------------------------------
// ALTERAR DADOS PESSOAIS
// --------------------------------------------------

function alterarDadosPessoais(e) {
const { name, value } = e.target;
const valorFormatado = name === "cpf"
  ? formatarCpf(value)
  : name === "telefone"
    ? formatarTelefone(value)
    : value;

setDadosPessoais((dadosAtuais) => ({
  ...dadosAtuais,
  [name]: valorFormatado,
}));


}

// --------------------------------------------------
// ALTERAR ENDEREÇO
// --------------------------------------------------

function alterarEndereco(e) {
const { name, value } = e.target;
const valorFormatado = name === "cep"
  ? formatarCep(value)
  : name === "estado"
    ? value.replace(/[^a-z]/gi, "").slice(0, 2).toUpperCase()
    : value;

setEndereco((enderecoAtual) => ({
  ...enderecoAtual,
  [name]: valorFormatado,
}));


}

// --------------------------------------------------
// ALTERAR CARTÃO
// --------------------------------------------------

function alterarCartao(e) {
const { name, value } = e.target;


setCartao((cartaoAtual) => ({
  ...cartaoAtual,
  [name]: value,
}));


}

// --------------------------------------------------
// BUSCAR ENDEREÇO PELO CEP
// --------------------------------------------------

async function buscarCep() {
const cepLimpo = somenteNumeros(endereco.cep, 8);


if (cepLimpo.length !== 8) {
  return;
}

try {
  setCarregandoCep(true);

  const dados = await consultarCep(cepLimpo);

  setEndereco((enderecoAtual) => ({
    ...enderecoAtual,
    rua: dados.logradouro || "",
    bairro: dados.bairro || "",
    cidade: dados.localidade || "",
    estado: dados.uf || "",
  }));
} catch (error) {
  console.error("Erro ao buscar CEP:", error);
  alert(error.message || "Não foi possível buscar o CEP.");
} finally {
  setCarregandoCep(false);
}


}

// --------------------------------------------------
// CALCULAR SUBTOTAL
// --------------------------------------------------

const subtotal = carrinho.reduce((total, item) => {
const preco = Number(item.preco) || 0;
const quantidade = Number(item.quantidade) || 0;


return total + preco * quantidade;


}, 0);

// --------------------------------------------------
// FRETE
// --------------------------------------------------

const frete = carrinho.length > 0 ? 15 : 0;

// --------------------------------------------------
// TOTAL
// --------------------------------------------------

const total = subtotal + frete;

// --------------------------------------------------
// FORMATAR PREÇO
// --------------------------------------------------

function formatarPreco(valor) {
return Number(valor).toLocaleString("pt-BR", {
style: "currency",
currency: "BRL",
});
}

// --------------------------------------------------
// FINALIZAR PEDIDO
// --------------------------------------------------

async function finalizarPedido(e) {
e.preventDefault();


if (carrinho.length === 0) {
  alert("Seu carrinho está vazio.");
  return;
}

try {
  setFinalizando(true);

  const token = localStorage.getItem("token");
  const usuarioSalvo = localStorage.getItem("usuario");

  if (!token || !usuarioSalvo) {
    router.push("/login");
    return;
  }

  const usuario = JSON.parse(usuarioSalvo);

  const idUsuario = usuario.idUsuario ?? usuario.id;

  if (!idUsuario) {
    throw new Error("Não foi possível identificar o usuário.");
  }

  const resposta = await fetch(
    `${API_BASE_URL}/vendas/carrinho/confirmar`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      resultado?.mensagem ||
      resultado?.erro ||
      "Erro ao finalizar pedido."
    );
  }

  window.dispatchEvent(new Event("carrinho-atualizado"));
  router.push("/compraSucesso");
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

// --------------------------------------------------
// CARREGANDO
// --------------------------------------------------

if (carregando) {
return ( <main className="checkoutPage"> <div className="checkoutContainer"> <div className="carrinhoVazio"> <i className="bi bi-arrow-repeat"></i>


        <h2>Carregando seu pedido...</h2>

        <p>
          Estamos buscando os produtos do seu carrinho.
        </p>
      </div>
    </div>
  </main>
);


}

// --------------------------------------------------
// CARRINHO VAZIO
// --------------------------------------------------

if (carrinho.length === 0) {
return ( <main className="checkoutPage"> <div className="checkoutContainer"> <div className="carrinhoVazio"> <i className="bi bi-bag-x"></i>


        <h2>Seu carrinho está vazio</h2>

        <p>
          Adicione produtos ao carrinho antes de
          finalizar a compra.
        </p>

        <Link
          href="/"
          className="continuarComprando"
        >
          Continuar comprando
        </Link>
      </div>
    </div>
  </main>
);


}

// --------------------------------------------------
// PÁGINA
// --------------------------------------------------

return ( <main className="checkoutPage"> <div className="checkoutContainer">
    {/* CABEÇALHO */}

    <div className="checkoutHeading">

      <div>
        <span className="checkoutEyebrow">
          FINALIZAÇÃO DE COMPRA
        </span>

        <h1>Finalizar compra</h1>

        <p>
          Confira suas informações e escolha a forma
          de pagamento.
        </p>
      </div>

      <Link
        href="/carrinho"
        className="voltarCarrinho"
      >
        <i className="bi bi-arrow-left"></i>
        Voltar ao carrinho
      </Link>

    </div>

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
                  autoComplete="name"
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
                  autoComplete="email"
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
                  inputMode="numeric"
                  autoComplete="off"
                  minLength={14}
                  maxLength={14}
                  required
                />

              </div>

              <div className="formField">

                <label>Telefone</label>

                <input
                  type="tel"
                  name="telefone"
                  placeholder="(00) 00000-0000"
                  value={dadosPessoais.telefone}
                  onChange={alterarDadosPessoais}
                  inputMode="tel"
                  autoComplete="tel"
                  minLength={14}
                  maxLength={15}
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
                    inputMode="numeric"
                    autoComplete="postal-code"
                    minLength={9}
                    maxLength={9}
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
                  autoComplete="address-line1"
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
                  autoComplete="address-line2"
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
                  autoComplete="address-line3"
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
                  autoComplete="address-level3"
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
                  autoComplete="address-level2"
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
                  autoComplete="address-level1"
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
                  formaPagamento === "pix"
                    ? "selected"
                    : ""
                }`}
              >

                <input
                  type="radio"
                  name="pagamento"
                  value="pix"
                  checked={
                    formaPagamento === "pix"
                  }
                  onChange={(e) =>
                    setFormaPagamento(
                      e.target.value
                    )
                  }
                />

                <i className="bi bi-qr-code"></i>

                <div>
                  <strong>Pix</strong>
                  <span>
                    Pagamento instantâneo
                  </span>
                </div>

              </label>

              <label
                className={`paymentOption ${
                  formaPagamento === "credito"
                    ? "selected"
                    : ""
                }`}
              >

                <input
                  type="radio"
                  name="pagamento"
                  value="credito"
                  checked={
                    formaPagamento === "credito"
                  }
                  onChange={(e) =>
                    setFormaPagamento(
                      e.target.value
                    )
                  }
                />

                <i className="bi bi-credit-card"></i>

                <div>
                  <strong>
                    Cartão de crédito
                  </strong>

                  <span>
                    Pague com seu cartão
                  </span>
                </div>

              </label>

              <label
                className={`paymentOption ${
                  formaPagamento === "debito"
                    ? "selected"
                    : ""
                }`}
              >

                <input
                  type="radio"
                  name="pagamento"
                  value="debito"
                  checked={
                    formaPagamento === "debito"
                  }
                  onChange={(e) =>
                    setFormaPagamento(
                      e.target.value
                    )
                  }
                />

                <i className="bi bi-credit-card-2-front"></i>

                <div>
                  <strong>
                    Cartão de débito
                  </strong>

                  <span>
                    Pagamento à vista
                  </span>
                </div>

              </label>

            </div>

            {/* CAMPOS DO CARTÃO */}

            {formaPagamento !== "pix" && (

              <div className="cardFields">

                <div className="formField formFieldFull">

                  <label>
                    Nome impresso no cartão
                  </label>

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

                  <label>
                    Número do cartão
                  </label>

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
                  item.idProduto || index;

                const imagem = resolverImagem(
                  item.imagem ||
                  item.imagem1 ||
                  item.image ||
                  null
                );

                const preco =
                  Number(item.preco) || 0;

                return (

                  <div
                    className="summaryProduct"
                    key={`${id}-${index}`}
                  >

                    <div className="summaryImage">

                      {imagem ? (

                        <img
                          src={imagem}
                          alt={
                            item.nome ||
                            "Produto"
                          }
                        />

                      ) : (

                        <div className="summaryImageFallback">

                          <i className="bi bi-image"></i>

                        </div>

                      )}

                    </div>

                    <div className="summaryProductInfo">

                      <h3>
                        {item.nome ||
                          "Produto"}
                      </h3>

                      {item.variacao && (

                        <span>
                          {item.variacao}
                        </span>

                      )}

                      <small>
                        Qtd: {quantidade}
                      </small>

                      <strong>
                        {formatarPreco(
                          preco * quantidade
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
                Seus dados são protegidos e
                processados com segurança.
              </span>

            </div>

          </div>

        </aside>

      </div>

    </form>

  </div>
</main>


);
}
