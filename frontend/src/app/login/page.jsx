"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./page.css";

export default function Login() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  const [form, setForm] = useState({
    email: "",
    senha: "",
  });

  function alterarCampo(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function realizarLogin(e) {
    e.preventDefault();

    console.log(form);

    alert("Login realizado com sucesso!");
  }

  return (
    <main className="login-page">

      {/* =========================
          SEÇÃO PRINCIPAL
      ========================== */}

      <section className="login-section">

        <div className="container">

          <div className="row justify-content-center">

            <div className="col-12 col-md-10 col-lg-7 col-xl-6">

              <div className="login-card">

                {/* =========================
                    CABEÇALHO
                ========================== */}

                <div className="login-header">

                  <div className="login-logo">
                    EVERETT
                  </div>

                  <p className="login-subtitulo">
                    BEM-VINDO DE VOLTA
                  </p>

                  <h1>
                    Faça seu <span>login</span>
                  </h1>

                  <p className="login-descricao">
                    Acesse sua conta para continuar sua experiência
                    na Everett.
                  </p>

                </div>


                {/* =========================
                    FORMULÁRIO
                ========================== */}

                <div className="login-body">

                  <form onSubmit={realizarLogin}>

                    {/* =========================
                        TÍTULO
                    ========================== */}

                    <div className="login-titulo-secao">

                      <div className="login-icone">
                        <i className="bi bi-person"></i>
                      </div>

                      <div>
                        <h2>
                          Acesse sua conta
                        </h2>

                        <p>
                          Informe seus dados para entrar.
                        </p>
                      </div>

                    </div>


                    {/* =========================
                        EMAIL
                    ========================== */}

                    <div className="mb-4">

                      <label
                        htmlFor="email"
                        className="form-label"
                      >
                        E-mail
                      </label>

                      <div className="login-input-wrapper">

                        <i className="bi bi-envelope"></i>

                        <input
                          type="email"
                          id="email"
                          name="email"
                          className="form-control"
                          placeholder="seuemail@email.com"
                          value={form.email}
                          onChange={alterarCampo}
                          required
                        />

                      </div>

                    </div>


                    {/* =========================
                        SENHA
                    ========================== */}

                    <div className="mb-4">

                      <label
                        htmlFor="senha"
                        className="form-label"
                      >
                        Senha
                      </label>

                      <div className="login-input-wrapper">

                        <i className="bi bi-lock"></i>

                        <input
                          type="password"
                          id="senha"
                          name="senha"
                          className="form-control"
                          placeholder="Digite sua senha"
                          value={form.senha}
                          onChange={alterarCampo}
                          required
                        />

                      </div>

                    </div>


                    {/* =========================
                        BOTÃO
                    ========================== */}

                    <button
                      type="submit"
                      className="login-botao"
                    >

                      Entrar

                      <i className="bi bi-arrow-right"></i>

                    </button>

                  </form>


                  {/* =========================
                      CADASTRO
                  ========================== */}

                  <div className="login-cadastro">

                    <span>
                      Ainda não possui uma conta?
                    </span>

                    <Link href="/cadastro">
                      Criar conta
                    </Link>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}