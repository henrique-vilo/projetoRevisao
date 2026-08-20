"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    senha: "",
  });

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  function alterarCampo(e) {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    if (erro) {
      setErro("");
    }
  }

  async function realizarLogin(e) {
    e.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      const resposta = await fetch(
        "http://localhost:3001/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: form.email.trim(),
            senha: form.senha,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.mensagem ||
            dados.erro ||
            "Email ou senha incorretos."
        );

        return;
      }

      if (!dados?.dados?.token) {
        setErro(
          "Login realizado, mas o servidor não retornou o token."
        );

        return;
      }

      // SALVAR TOKEN
      localStorage.setItem(
        "token",
        dados.dados.token
      );

      // SALVAR USUÁRIO
      if (dados?.dados?.usuario) {
        localStorage.setItem(
          "usuario",
          JSON.stringify(dados.dados.usuario)
        );
      }

      // LOGIN CONCLUÍDO
      router.push("/");

    } catch (error) {
      console.error("Erro ao realizar login:", error);

      setErro(
        "Não foi possível conectar ao servidor. Verifique se o backend está funcionando."
      );

    } finally {
      setCarregando(false);
    }
  }

  return (
    <main
      className="d-flex justify-content-center align-items-center py-5"
      style={{
        background: "#f5f3ef",
        minHeight: "100vh",
      }}
    >
      <div
        className="card border-0 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "750px",
          borderRadius: "22px",
          overflow: "hidden",
        }}
      >

        {/* TOPO */}

        <div
          className="text-center text-white p-5"
          style={{
            background:
              "linear-gradient(135deg, #012458, #023f79, #1f6197, #028da5)",
          }}
        >
          <h1 className="fw-bold mb-2">
            Everett
          </h1>

          <p className="mb-0">
            Faça seu login
          </p>
        </div>

        {/* FORMULÁRIO */}

        <div className="card-body p-5">

          <form onSubmit={realizarLogin}>

            {/* ERRO */}

            {erro && (
              <div
                className="alert alert-danger"
                role="alert"
              >
                {erro}
              </div>
            )}

            <div className="row">

              {/* EMAIL */}

              <div className="col-12 mb-3">

                <label
                  htmlFor="email"
                  className="form-label fw-semibold"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="Digite seu email"
                  value={form.email}
                  onChange={alterarCampo}
                  disabled={carregando}
                  required
                />

              </div>

              {/* SENHA */}

              <div className="col-12 mb-4">

                <label
                  htmlFor="senha"
                  className="form-label fw-semibold"
                >
                  Senha
                </label>

                <input
                  id="senha"
                  type="password"
                  className="form-control"
                  name="senha"
                  placeholder="Digite sua senha"
                  value={form.senha}
                  onChange={alterarCampo}
                  disabled={carregando}
                  required
                />

              </div>

            </div>

            {/* BOTÃO */}

            <button
              type="submit"
              className="btn w-100 text-white fw-bold py-3"
              disabled={carregando}
              style={{
                background:
                  "linear-gradient(90deg, #00758a, #3fbcc7)",
                border: "none",
                borderRadius: "10px",
                opacity: carregando ? 0.7 : 1,
              }}
            >

              {carregando ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />

                  Entrando...
                </>
              ) : (
                "Entrar"
              )}

            </button>

          </form>

          <hr className="my-4" />

          {/* CADASTRO */}

          <div className="text-center">

            <span className="text-secondary">
              Ainda não possui uma conta?
            </span>

            <Link
              href="/cadastro"
              className="ms-2 fw-bold"
              style={{
                color: "#1c3166",
                textDecoration: "none",
              }}
            >
              Criar conta
            </Link>

          </div>

        </div>
      </div>
    </main>
  );
}