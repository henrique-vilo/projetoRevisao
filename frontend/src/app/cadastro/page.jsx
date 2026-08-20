"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./page.css";

export default function Cadastro() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

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
    <main className="cadastro-page">

      {/* =========================
          ÁREA PRINCIPAL
      ========================== */}

      <section className="cadastro-section">

        <div className="container">

          <div className="row justify-content-center">

            <div className="col-12 col-lg-9 col-xl-8">

              <div className="cadastro-card">

                {/* =========================
                    CABEÇALHO
                ========================== */}

                <div className="cadastro-header">

                  <div className="cadastro-logo">
                    EVERETT
                  </div>

                  <p className="cadastro-subtitulo">
                    CRIE SUA CONTA
                  </p>

                  <h1>
                    Faça parte da <span>Everett</span>
                  </h1>

                  <p className="cadastro-descricao">
                    Crie sua conta gratuitamente e tenha uma experiência
                    ainda melhor em nossa loja.
                  </p>

                </div>


                {/* =========================
                    FORMULÁRIO
                ========================== */}

                <div className="cadastro-body">

                  <form onSubmit={cadastrar}>

                    {/* DADOS PESSOAIS */}

                    <div className="cadastro-titulo-secao">

                      <i className="bi bi-person"></i>

                      <div>
                        <h2>Dados pessoais</h2>

                        <p>
                          Informe seus dados para criar sua conta.
                        </p>
                      </div>

                    </div>


                    <div className="row g-3">

                      {/* NOME */}

                      <div className="col-12 col-md-6">

                        <label
                          htmlFor="nome"
                          className="form-label"
                        >
                          Nome
                        </label>

                        <input
                          type="text"
                          id="nome"
                          name="nome"
                          className="form-control"
                          placeholder="Digite seu nome"
                          value={form.nome}
                          onChange={alterarCampo}
                          required
                        />

                      </div>


                      {/* SOBRENOME */}

                      <div className="col-12 col-md-6">

                        <label
                          htmlFor="sobrenome"
                          className="form-label"
                        >
                          Sobrenome
                        </label>

                        <input
                          type="text"
                          id="sobrenome"
                          name="sobrenome"
                          className="form-control"
                          placeholder="Digite seu sobrenome"
                          value={form.sobrenome}
                          onChange={alterarCampo}
                          required
                        />

                      </div>


                      {/* CPF */}

                      <div className="col-12 col-md-6">

                        <label
                          htmlFor="cpf"
                          className="form-label"
                        >
                          CPF
                        </label>

                        <input
                          type="text"
                          id="cpf"
                          name="cpf"
                          className="form-control"
                          placeholder="000.000.000-00"
                          value={form.cpf}
                          onChange={alterarCampo}
                          required
                        />

                      </div>


                      {/* DATA DE NASCIMENTO */}

                      <div className="col-12 col-md-6">

                        <label
                          htmlFor="nascimento"
                          className="form-label"
                        >
                          Data de nascimento
                        </label>

                        <input
                          type="date"
                          id="nascimento"
                          name="nascimento"
                          className="form-control"
                          value={form.nascimento}
                          onChange={alterarCampo}
                          required
                        />

                      </div>


                      {/* EMAIL */}

                      <div className="col-12 col-md-6">

                        <label
                          htmlFor="email"
                          className="form-label"
                        >
                          E-mail
                        </label>

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


                      {/* TELEFONE */}

                      <div className="col-12 col-md-6">

                        <label
                          htmlFor="telefone"
                          className="form-label"
                        >
                          Telefone
                        </label>

                        <input
                          type="tel"
                          id="telefone"
                          name="telefone"
                          className="form-control"
                          placeholder="(11) 99999-9999"
                          value={form.telefone}
                          onChange={alterarCampo}
                          required
                        />

                      </div>

                    </div>


                    {/* SEPARADOR */}

                    <hr className="cadastro-divider" />


                    {/* SENHA */}

                    <div className="cadastro-titulo-secao">

                      <i className="bi bi-lock"></i>

                      <div>

                        <h2>Segurança da conta</h2>

                        <p>
                          Crie uma senha para proteger sua conta.
                        </p>

                      </div>

                    </div>


                    <div className="row g-3">

                      {/* SENHA */}

                      <div className="col-12 col-md-6">

                        <label
                          htmlFor="senha"
                          className="form-label"
                        >
                          Senha
                        </label>

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


                      {/* CONFIRMAR SENHA */}

                      <div className="col-12 col-md-6">

                        <label
                          htmlFor="confirmarSenha"
                          className="form-label"
                        >
                          Confirmar senha
                        </label>

                        <input
                          type="password"
                          id="confirmarSenha"
                          name="confirmarSenha"
                          className="form-control"
                          placeholder="Digite sua senha novamente"
                          value={form.confirmarSenha}
                          onChange={alterarCampo}
                          required
                        />

                      </div>

                    </div>


                    {/* TERMOS */}

                    <div className="cadastro-termos mt-4">

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
                          >
                            Termos de Uso
                          </a>

                          {" "}e a{" "}

                          <a
                            href="/documentos/politica-de-privacidade.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Política de Privacidade
                          </a>

                          .
                        </label>

                      </div>

                    </div>


                    {/* BOTÃO */}

                    <button
                      type="submit"
                      className="cadastro-botao w-100"
                    >

                      Criar minha conta

                      <i className="bi bi-arrow-right ms-2"></i>

                    </button>

                  </form>


                  {/* LOGIN */}

                  <div className="cadastro-login">

                    <span>
                      Já possui uma conta?
                    </span>

                    <Link href="/login">
                      Entrar
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