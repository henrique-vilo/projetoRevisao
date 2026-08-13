"use client";

import { useState } from "react";
import Link from "next/link";

export default function Cadastro() {
  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    cpf: "",
    email: "",
    telefone: "",
    nascimento: "",
    senha: "",
    confirmarSenha: "",
  });

  const [aceitouTermos, setAceitouTermos] = useState(false);

  function alterarCampo(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function cadastrar(e) {
    e.preventDefault();

    if (form.senha !== form.confirmarSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    if (!aceitouTermos) {
      alert(
        "Você precisa aceitar os Termos de Uso e a Política de Privacidade."
      );
      return;
    }

    console.log(form);

    alert("Cadastro realizado com sucesso!");
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
          <h1 className="fw-bold mb-2">Everett</h1>

          <p className="mb-0">
            Crie sua conta gratuitamente
          </p>
        </div>

        {/* FORMULÁRIO */}

        <div className="card-body p-5">
          <form onSubmit={cadastrar}>
            <div className="row">

              {/* NOME */}

              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Nome
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="nome"
                  value={form.nome}
                  onChange={alterarCampo}
                  required
                />
              </div>

              {/* SOBRENOME */}

              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Sobrenome
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="sobrenome"
                  value={form.sobrenome}
                  onChange={alterarCampo}
                  required
                />
              </div>

              {/* CPF */}

              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  CPF
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="cpf"
                  value={form.cpf}
                  onChange={alterarCampo}
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              {/* DATA DE NASCIMENTO */}

              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Data de nascimento
                </label>

                <input
                  type="date"
                  className="form-control"
                  name="nascimento"
                  value={form.nascimento}
                  onChange={alterarCampo}
                  required
                />
              </div>

              {/* EMAIL */}

              <div className="col-md-6 mb-3">
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

              {/* TELEFONE */}

              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Telefone
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="telefone"
                  value={form.telefone}
                  onChange={alterarCampo}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              {/* SENHA */}

              <div className="col-md-6 mb-3">
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

              {/* CONFIRMAR SENHA */}

              <div className="col-md-6 mb-4">
                <label className="form-label fw-semibold">
                  Confirmar senha
                </label>

                <input
                  type="password"
                  className="form-control"
                  name="confirmarSenha"
                  value={form.confirmarSenha}
                  onChange={alterarCampo}
                  required
                />
              </div>

              {/* TERMOS */}

              <div className="col-12 mb-4">
                <div className="form-check">

                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="termos"
                    checked={aceitouTermos}
                    onChange={(e) =>
                      setAceitouTermos(e.target.checked)
                    }
                  />

                  <label
                    className="form-check-label"
                    htmlFor="termos"
                  >
                    Li e aceito os{" "}

                    <a
                      href="/documentos/termos-de-uso.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#1c3166",
                        fontWeight: "600",
                      }}
                    >
                      Termos de Uso
                    </a>

                    {" "}e a{" "}

                    <a
                      href="/documentos/politica-de-privacidade.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#1c3166",
                        fontWeight: "600",
                      }}
                    >
                      Política de Privacidade
                    </a>

                    .
                  </label>

                </div>
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
              Criar Conta
            </button>

          </form>

          <hr className="my-4" />

          {/* LOGIN */}

          <div className="text-center">
            <span className="text-secondary">
              Já possui uma conta?
            </span>

            <Link
              href="/login"
              className="ms-2 fw-bold"
              style={{
                color: "#1c3166",
                textDecoration: "none",
              }}
            >
              Entrar
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
