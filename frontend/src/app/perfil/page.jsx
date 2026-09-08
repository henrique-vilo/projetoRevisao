"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./page.css";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/$/, "");

const PERFIL_URL = `${API_URL}/api/usuarios/perfil`;

export default function PerfilPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [alterandoSenha, setAlterandoSenha] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [erroExclusao, setErroExclusao] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [sucessoSenha, setSucessoSenha] = useState("");

  function obterToken() {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("token");
  }

  /*
   * O backend cria o JWT com:
   *
   * {
   *   id: idDoUsuario,
   *   email: usuario.email,
   *   tipo: usuario.tipo
   * }
   *
   * Portanto, o ID está em payload.id.
   */
  function obterIdDoToken() {
    try {
      const token = obterToken();

      if (!token) {
        return null;
      }

      const partes = token.split(".");

      if (partes.length !== 3) {
        return null;
      }

      const payload = JSON.parse(
        atob(
          partes[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
        )
      );

      return payload.id ?? null;
    } catch (error) {
      console.error(
        "Erro ao obter ID do token:",
        error
      );

      return null;
    }
  }

  function obterIdUsuario() {
    /*
     * Primeiro usa o ID retornado pelo /perfil.
     *
     * Se por algum motivo ele não estiver lá,
     * usa o ID diretamente do JWT.
     */
    if (
      usuario?.id !== undefined &&
      usuario?.id !== null
    ) {
      return usuario.id;
    }

    return obterIdDoToken();
  }

  function formatarCep(valor) {
    const numeros = valor
      .replace(/\D/g, "")
      .slice(0, 8);

    if (numeros.length > 5) {
      return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
    }

    return numeros;
  }

  function formatarTelefone(valor) {
    const numeros = valor
      .replace(/\D/g, "")
      .slice(0, 11);

    if (numeros.length <= 2) {
      return numeros;
    }

    if (numeros.length <= 7) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }

    return `(${numeros.slice(0, 2)}) ${numeros.slice(
      2,
      7
    )}-${numeros.slice(7)}`;
  }

  function salvarUsuarioLocal(dados) {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(
      "usuario",
      JSON.stringify(dados)
    );
  }

  function limparSessao() {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("user");
  }

  async function carregarPerfil() {
    try {
      setCarregando(true);
      setErro("");

      const token = obterToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const resposta = await fetch(
        PERFIL_URL,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const dados =
        await resposta.json().catch(() => null);

      if (!resposta.ok) {
        throw new Error(
          dados?.mensagem ||
            dados?.erro ||
            "Não foi possível carregar seu perfil."
        );
      }

      /*
       * O backend retorna:
       *
       * {
       *   sucesso: true,
       *   dados: usuarioSemSenha
       * }
       */
      const perfil = dados?.dados;

      if (!perfil) {
        throw new Error(
          "Os dados do perfil não foram encontrados."
        );
      }

      setUsuario(perfil);

      setNome(perfil.nome || "");
      setEmail(perfil.email || "");

      setTelefone(
        formatarTelefone(
          perfil.telefone || ""
        )
      );

      setCep(
        formatarCep(
          perfil.cep || ""
        )
      );

      salvarUsuarioLocal(perfil);

      console.log(
        "Usuário carregado:",
        perfil
      );

      console.log(
        "ID do usuário:",
        perfil.id
      );

      console.log(
        "ID no token:",
        obterIdDoToken()
      );
    } catch (error) {
      console.error(
        "Erro ao carregar perfil:",
        error
      );

      setErro(
        error instanceof TypeError
          ? "Não foi possível conectar ao servidor."
          : error.message ||
            "Não foi possível carregar seu perfil."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function salvarPerfil(event) {
  event.preventDefault();

  setErro("");
  setSucesso("");

  const token = obterToken();

  if (!token) {
    router.replace("/login");
    return;
  }

  // O ID vem diretamente do usuário carregado pelo GET /perfil.
  // Se não existir no perfil, pega do JWT.
  const idUsuario =
    usuario?.id ?? obterIdDoToken();

  console.log("ID encontrado para atualização:", idUsuario);

  if (
    idUsuario === null ||
    idUsuario === undefined ||
    idUsuario === ""
  ) {
    setErro(
      "Não foi possível identificar o ID da sua conta."
    );
    return;
  }

  if (
    telefone &&
    telefone.length !== 15
  ) {
    setErro(
      "Digite um telefone válido no formato (00) 00000-0000."
    );
    return;
  }

  if (
    cep &&
    cep.length !== 9
  ) {
    setErro(
      "Digite um CEP válido no formato 00000-000."
    );
    return;
  }

  try {
    setSalvando(true);

    const resposta = await fetch(
      `${PERFIL_URL}/${idUsuario}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          telefone: telefone.trim(),
          cep: cep.trim(),
        }),
      }
    );

    const dados =
      await resposta.json().catch(() => null);

    if (!resposta.ok) {
      throw new Error(
        dados?.mensagem ||
        dados?.erro ||
        "Não foi possível atualizar seu perfil."
      );
    }

    const usuarioAtualizado = {
      ...usuario,
      id: idUsuario,
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      telefone: telefone.trim(),
      cep: cep.trim(),
    };

    setUsuario(usuarioAtualizado);

    salvarUsuarioLocal(usuarioAtualizado);

    setSucesso(
      "Dados atualizados com sucesso."
    );

  } catch (error) {
    console.error(
      "Erro ao atualizar perfil:",
      error
    );

    setErro(
      error instanceof TypeError
        ? "Não foi possível conectar ao servidor."
        : error.message ||
          "Não foi possível atualizar seu perfil."
    );

  } finally {
    setSalvando(false);
  }
}

  async function alterarSenha(event) {
    event.preventDefault();

    setErroSenha("");
    setSucessoSenha("");

    const token = obterToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!senhaAtual) {
      setErroSenha("Digite sua senha atual.");
      return;
    }

    if (novaSenha.length < 6) {
      setErroSenha("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErroSenha("A confirmação da nova senha não confere.");
      return;
    }

    const idUsuario = usuario?.id ?? obterIdDoToken();

    if (idUsuario === null || idUsuario === undefined || idUsuario === "") {
      setErroSenha("Não foi possível identificar o ID da sua conta.");
      return;
    }

    try {
      setAlterandoSenha(true);

      const resposta = await fetch(`${PERFIL_URL}/${idUsuario}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senhaAtual,
          senha: novaSenha,
        }),
      });

      const dados = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        throw new Error(
          dados?.mensagem ||
          dados?.erro ||
          "Não foi possível alterar sua senha."
        );
      }

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setSucessoSenha("Senha alterada com sucesso.");
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      setErroSenha(
        error instanceof TypeError
          ? "Não foi possível conectar ao servidor."
          : error.message || "Não foi possível alterar sua senha."
      );
    } finally {
      setAlterandoSenha(false);
    }
  }

  async function excluirConta() {
  setErroExclusao("");

  const token = obterToken();

  if (!token) {
    router.replace("/login");
    return;
  }

  const idUsuario =
    usuario?.id ?? obterIdDoToken();

  console.log(
    "ID encontrado para exclusão:",
    idUsuario
  );

  if (
    idUsuario === null ||
    idUsuario === undefined ||
    idUsuario === ""
  ) {
    setErroExclusao(
      "Não foi possível identificar o ID da sua conta."
    );
    return;
  }

  const confirmar = window.confirm(
    "Tem certeza que deseja excluir sua conta?\n\nEssa ação não poderá ser desfeita."
  );

  if (!confirmar) {
    return;
  }

  try {
    setExcluindo(true);

    const resposta = await fetch(
      `${PERFIL_URL}/${idUsuario}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const dados =
      await resposta.json().catch(() => null);

    if (!resposta.ok) {
      throw new Error(
        dados?.mensagem ||
        dados?.erro ||
        "Não foi possível excluir sua conta."
      );
    }

    // Conta excluída com sucesso.
    limparSessao();

    // Desloga e vai para o login.
    router.replace("/login");

  } catch (error) {
    console.error(
      "Erro ao excluir conta:",
      error
    );

    setErroExclusao(
      error instanceof TypeError
        ? "Não foi possível conectar ao servidor."
        : error.message ||
          "Não foi possível excluir sua conta."
    );

  } finally {
    setExcluindo(false);
  }
}

  function gerarIniciais(nomeCompleto) {
    if (!nomeCompleto) {
      return "U";
    }

    return nomeCompleto
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (parte) => parte[0]
      )
      .join("")
      .toUpperCase();
  }

  if (carregando) {
    return (
      <main className="perfil-page">
        <div className="perfil-loading">
          <div className="perfil-spinner"></div>

          <p>
            Carregando seu perfil...
          </p>
        </div>
      </main>
    );
  }

  const iniciais =
    gerarIniciais(nome);

  return (
    <main className="perfil-page">

      <div className="perfil-wrapper">

        <div className="perfil-header-page">

          <div>

            <div className="perfil-breadcrumb">

              <Link href="/">
                Início
              </Link>

              <span>/</span>

              <span>
                Meu perfil
              </span>

            </div>

            <h1>
              Meu perfil
            </h1>

            <p>
              Visualize e atualize as informações da sua conta.
            </p>

          </div>

          <Link
            href="/"
            className="perfil-back"
          >
            <i className="bi bi-arrow-left"></i>
            Voltar
          </Link>

        </div>

        {erro && (
          <div className="perfil-alert perfil-alert-error">

            <i className="bi bi-exclamation-circle"></i>

            <span>
              {erro}
            </span>

          </div>
        )}

        {sucesso && (
          <div className="perfil-alert perfil-alert-success">

            <i className="bi bi-check-circle"></i>

            <span>
              {sucesso}
            </span>

          </div>
        )}

        <div className="perfil-content">

          {/* DADOS PESSOAIS */}

          <section className="perfil-card">

            <div className="perfil-card-top">

              <div className="perfil-avatar">
                {iniciais}
              </div>

              <div className="perfil-user-info">

                <h2>
                  {nome || "Usuário"}
                </h2>

                <p>
                  <i className="bi bi-shield-check"></i>

                  Informações privadas da conta
                </p>

              </div>

            </div>

            <div className="perfil-divider"></div>

            <form
              onSubmit={salvarPerfil}
            >

              <div className="perfil-section-heading">

                <h3>
                  Informações pessoais
                </h3>

                <p>
                  Esses dados são utilizados para identificar
                  e manter sua conta atualizada.
                </p>

              </div>

              <div className="perfil-fields">

                <div className="perfil-field perfil-field-full">

                  <label htmlFor="nome">
                    Nome completo
                  </label>

                  <input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(event) =>
                      setNome(
                        event.target.value
                      )
                    }
                    placeholder="Digite seu nome completo"
                    autoComplete="name"
                    required
                  />

                </div>

                <div className="perfil-field">

                  <label htmlFor="email">
                    E-mail
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="seu@email.com"
                    autoComplete="email"
                    required
                  />

                </div>

                <div className="perfil-field">

                  <label htmlFor="telefone">
                    Telefone
                  </label>

                  <input
                    id="telefone"
                    type="tel"
                    value={telefone}
                    onChange={(event) =>
                      setTelefone(
                        formatarTelefone(
                          event.target.value
                        )
                      )
                    }
                    placeholder="(00) 00000-0000"
                    autoComplete="tel"
                    maxLength={15}
                  />

                </div>

                <div className="perfil-field perfil-field-full">

                  <label htmlFor="cep">
                    CEP
                  </label>

                  <input
                    id="cep"
                    type="text"
                    value={cep}
                    onChange={(event) =>
                      setCep(
                        formatarCep(
                          event.target.value
                        )
                      )
                    }
                    placeholder="00000-000"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={9}
                  />

                </div>

              </div>

              <div className="perfil-form-footer">

                <span>
                  <i className="bi bi-lock"></i>

                  Seus dados são privados.
                </span>

                <button
                  type="submit"
                  className="perfil-primary-button"
                  disabled={salvando}
                >

                  {salvando ? (
                    <>
                      <span className="perfil-button-spinner"></span>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2"></i>
                      Salvar alterações
                    </>
                  )}

                </button>

              </div>

            </form>

          </section>

          {/* ALTERAR SENHA */}

          <section className="perfil-card">

            <div className="perfil-section-heading">
              <h3>Alterar senha</h3>
              <p>Atualize sua senha usando a senha atual da sua conta.</p>
            </div>

            {erroSenha && (
              <div className="perfil-alert perfil-alert-error perfil-alert-inline">
                <i className="bi bi-exclamation-circle"></i>
                <span>{erroSenha}</span>
              </div>
            )}

            {sucessoSenha && (
              <div className="perfil-alert perfil-alert-success perfil-alert-inline">
                <i className="bi bi-check-circle"></i>
                <span>{sucessoSenha}</span>
              </div>
            )}

            <form onSubmit={alterarSenha}>
              <div className="perfil-fields">
                <div className="perfil-field perfil-field-full">
                  <label htmlFor="senhaAtual">Senha atual</label>
                  <div className="perfil-password">
                    <input
                      id="senhaAtual"
                      type={mostrarSenhaAtual ? "text" : "password"}
                      value={senhaAtual}
                      onChange={(event) => setSenhaAtual(event.target.value)}
                      placeholder="Digite sua senha atual"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="perfil-password-toggle"
                      onClick={() => setMostrarSenhaAtual((valor) => !valor)}
                      aria-label={mostrarSenhaAtual ? "Ocultar senha atual" : "Mostrar senha atual"}
                      title={mostrarSenhaAtual ? "Ocultar senha" : "Mostrar senha"}
                    >
                      <i className={`bi ${mostrarSenhaAtual ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </button>
                  </div>
                </div>

                <div className="perfil-field">
                  <label htmlFor="novaSenha">Nova senha</label>
                  <div className="perfil-password">
                    <input
                      id="novaSenha"
                      type={mostrarNovaSenha ? "text" : "password"}
                      value={novaSenha}
                      onChange={(event) => setNovaSenha(event.target.value)}
                      placeholder="Digite a nova senha"
                      autoComplete="new-password"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      className="perfil-password-toggle"
                      onClick={() => setMostrarNovaSenha((valor) => !valor)}
                      aria-label={mostrarNovaSenha ? "Ocultar nova senha" : "Mostrar nova senha"}
                      title={mostrarNovaSenha ? "Ocultar senha" : "Mostrar senha"}
                    >
                      <i className={`bi ${mostrarNovaSenha ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </button>
                  </div>
                </div>

                <div className="perfil-field">
                  <label htmlFor="confirmarSenha">Confirmar nova senha</label>
                  <div className="perfil-password">
                    <input
                      id="confirmarSenha"
                      type={mostrarConfirmarSenha ? "text" : "password"}
                      value={confirmarSenha}
                      onChange={(event) => setConfirmarSenha(event.target.value)}
                      placeholder="Repita a nova senha"
                      autoComplete="new-password"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      className="perfil-password-toggle"
                      onClick={() => setMostrarConfirmarSenha((valor) => !valor)}
                      aria-label={mostrarConfirmarSenha ? "Ocultar confirmação da senha" : "Mostrar confirmação da senha"}
                      title={mostrarConfirmarSenha ? "Ocultar senha" : "Mostrar senha"}
                    >
                      <i className={`bi ${mostrarConfirmarSenha ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="perfil-form-footer">
                <span>
                  <i className="bi bi-lock"></i>
                  Use uma senha com pelo menos 6 caracteres.
                </span>

                <button
                  type="submit"
                  className="perfil-primary-button"
                  disabled={alterandoSenha}
                >
                  {alterandoSenha ? (
                    <>
                      <span className="perfil-button-spinner"></span>
                      Alterando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-key"></i>
                      Alterar senha
                    </>
                  )}
                </button>
              </div>
            </form>

          </section>

          {/* EXCLUIR CONTA */}

          <section className="perfil-card perfil-danger-card perfil-danger-spaced">

            <div className="perfil-section-heading">

              <h3>
                Excluir conta
              </h3>

              <p>
                A exclusão da conta é permanente e não poderá
                ser desfeita.
              </p>

            </div>

            {erroExclusao && (
              <div className="perfil-alert perfil-alert-error perfil-alert-inline">

                <i className="bi bi-exclamation-circle"></i>

                <span>
                  {erroExclusao}
                </span>

              </div>
            )}

            <div className="perfil-danger-content">

              <div className="perfil-danger-info">

                <div className="perfil-danger-icon">

                  <i className="bi bi-trash3"></i>

                </div>

                <div>

                  <strong>
                    Excluir minha conta
                  </strong>

                  <p>
                    Todos os dados associados à sua conta
                    poderão ser removidos permanentemente.
                  </p>

                </div>

              </div>

              <button
                type="button"
                className="perfil-delete-button"
                onClick={excluirConta}
                disabled={excluindo}
              >

                {excluindo ? (
                  <>
                    <span className="perfil-button-spinner"></span>
                    Excluindo...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash3"></i>
                    Excluir conta
                  </>
                )}

              </button>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}