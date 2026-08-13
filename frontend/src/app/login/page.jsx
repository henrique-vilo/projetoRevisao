"use client";

import { useState } from "react";
import Link from "next/link";

export default function Login() {
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
        }}
      >
        {/* TOPO */}

        <div
          className="text-center text-white p-5"
          style={{
            background:
              "linear-gradient(135deg, #012458, #023f79, #1f6197, #028da5)",
            borderTopLeftRadius: "22px",
            borderTopRightRadius: "22px",
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

            <div className="row">

              {/* EMAIL */}

              <div className="col-12 mb-3">
                <label className="form-label fw-semibold">
                  Email
                </label>

                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email}
                  onChange={alterarCampo}
                  required
                />
              </div>

              {/* SENHA */}

              <div className="col-12 mb-4">
                <label className="form-label fw-semibold">
                  Senha
                </label>

                <input
                  type="password"
                  className="form-control"
                  name="senha"
                  value={form.senha}
                  onChange={alterarCampo}
                  required
                />
              </div>

            </div>

            {/* BOTÃO */}

            <button
              type="submit"
              className="btn w-100 text-white fw-bold py-3"
              style={{
                background:
                  "linear-gradient(90deg, #00758a, #3fbcc7)",
                border: "none",
                borderRadius: "10px",
              }}
            >
              Entrar
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