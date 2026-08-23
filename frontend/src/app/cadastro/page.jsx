"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function Cadastro() {
  const router = useRouter();
  
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    cep: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
    termos: false,
    privacidade: false,
  });

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (erro) setErro("");
    if (sucesso) setSucesso("");
  };

  const formatarCPF = (valor) => {
    return valor
      .replace(/\D/g, "")
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatarCEP = (valor) => {
    return valor
      .replace(/\D/g, "")
      .slice(0, 8)
      .replace(/(\d{5})(\d)/, "$1-$2");
  };

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    if (numeros.length <= 2) {
      return numeros;
    }

    if (numeros.length <= 6) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }

    if (numeros.length <= 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }

    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  };

  const handleCPFChange = (e) => {
    const cpfFormatado = formatarCPF(e.target.value);

    setForm((prev) => ({
      ...prev,
      cpf: cpfFormatado,
    }));

    setErro("");
    setSucesso("");
  };

  const handleCEPChange = (e) => {
    const cepFormatado = formatarCEP(e.target.value);

    setForm((prev) => ({
      ...prev,
      cep: cepFormatado,
    }));

    setErro("");
    setSucesso("");
  };

  const handleTelefoneChange = (e) => {
    const telefoneFormatado = formatarTelefone(e.target.value);

    setForm((prev) => ({
      ...prev,
      telefone: telefoneFormatado,
    }));

    setErro("");
    setSucesso("");
  };

  const validarFormulario = () => {
    if (!form.nome.trim()) {
      return "O nome é obrigatório.";
    }

    if (form.nome.trim().length < 2) {
      return "O nome deve ter pelo menos 2 caracteres.";
    }

    if (form.nome.trim().length > 255) {
      return "O nome deve ter no máximo 255 caracteres.";
    }

    if (!form.cpf) {
      return "O CPF é obrigatório.";
    }

    if (form.cpf.length !== 14) {
      return "Digite um CPF válido no formato 000.000.000-00.";
    }

    if (!form.email.trim()) {
      return "O e-mail é obrigatório.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email.trim())) {
      return "Digite um e-mail válido.";
    }

    if (!form.telefone) {
      return "O telefone é obrigatório.";
    }

    if (form.telefone.length < 14 || form.telefone.length > 15) {
      return "Digite um telefone válido com DDD.";
    }

    if (!form.cep) {
      return "O CEP é obrigatório.";
    }

    if (form.cep.length !== 9) {
      return "Digite um CEP válido no formato 00000-000.";
    }

    if (!form.senha) {
      return "A senha é obrigatória.";
    }

    if (form.senha.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres.";
    }

    if (!form.confirmarSenha) {
      return "Confirme sua senha.";
    }

    if (form.senha !== form.confirmarSenha) {
      return "As senhas não coincidem.";
    }

    if (!form.termos) {
      return "Você precisa aceitar os termos de uso para continuar.";
    }
    
    if (!form.privacidade) {
      return "Você precisa aceitar os termos de privacidade para continuar.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErro("");
    setSucesso("");

    const erroValidacao = validarFormulario();

    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch(`${API_URL}/auth/registrar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: form.nome.trim(),
          cpf: form.cpf.trim(),
          email: form.email.trim().toLowerCase(),
          telefone: form.telefone.trim(),
          cep: form.cep.trim(),
          senha: form.senha,
        }),
      });

      let dados = null;
      try {
        dados = await resposta.json();
      } catch (e) {
      }

      if (!resposta.ok) {
        setErro(
          dados?.mensagem ||
            dados?.erro ||
            `Erro no servidor (${resposta.status}). Não foi possível realizar o cadastro.`
        );
        return;
      }

      setSucesso(
        dados?.mensagem || "Usuário criado com sucesso! Redirecionando..."
      );

      setForm({
        nome: "",
        cpf: "",
        cep: "",
        email: "",
        telefone: "",
        senha: "",
        confirmarSenha: "",
        termos: false,
        privacidade: false,
      });

      setTimeout(() => {
        router.push('/login');
      }, 1500);

    } catch (error) {
      setErro(
        "Não foi possível conectar ao servidor. Verifique sua conexão e se o backend está online."
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="min-vh-100 d-flex align-items-center py-5 bg-light">
      <style>{`
        input::placeholder {
          opacity: 0.5 !important;
        }
      `}</style>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-7">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div
                className="py-4 px-4 px-md-5 text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #0d6efd, #0b5ed7)",
                }}
              >
                <div className="text-center">
                  <h1 className="fw-bold mb-2">Criar conta</h1>
                  <p className="mb-0 opacity-75">
                    Preencha seus dados para realizar o cadastro.
                  </p>
                </div>
              </div>

              <div className="card-body p-4 p-md-5">
                {erro && (
                  <div
                    className="alert alert-danger d-flex align-items-center"
                    role="alert"
                  >
                    <span className="me-2">Erro:</span>
                    <div>{erro}</div>
                  </div>
                )}

                {sucesso && (
                  <div
                    className="alert alert-success d-flex align-items-center"
                    role="alert"
                  >
                    <span className="me-2">✓</span>
                    <div>{sucesso}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="row g-3">
                    <div className="col-12">
                      <label
                        htmlFor="nome"
                        className="form-label fw-semibold"
                      >
                        Nome completo
                      </label>

                      <input
                        type="text"
                        id="nome"
                        name="nome"
                        value={form.nome}
                        onChange={handleChange}
                        className="form-control form-control-lg"
                        placeholder="Digite seu nome completo"
                        maxLength={255}
                        autoComplete="name"
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label
                        htmlFor="cpf"
                        className="form-label fw-semibold"
                      >
                        CPF
                      </label>

                      <input
                        type="text"
                        id="cpf"
                        name="cpf"
                        value={form.cpf}
                        onChange={handleCPFChange}
                        className="form-control form-control-lg"
                        placeholder="000.000.000-00"
                        inputMode="numeric"
                        autoComplete="off"
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label
                        htmlFor="cep"
                        className="form-label fw-semibold"
                      >
                        CEP
                      </label>

                      <input
                        type="text"
                        id="cep"
                        name="cep"
                        value={form.cep}
                        onChange={handleCEPChange}
                        className="form-control form-control-lg"
                        placeholder="00000-000"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label
                        htmlFor="email"
                        className="form-label fw-semibold"
                      >
                        E-mail
                      </label>

                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="form-control form-control-lg"
                        placeholder="seuemail@exemplo.com"
                        autoComplete="email"
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label
                        htmlFor="telefone"
                        className="form-label fw-semibold"
                      >
                        Telefone
                      </label>

                      <input
                        type="tel"
                        id="telefone"
                        name="telefone"
                        value={form.telefone}
                        onChange={handleTelefoneChange}
                        className="form-control form-control-lg"
                        placeholder="(11) 99999-9999"
                        inputMode="numeric"
                        autoComplete="tel"
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label
                        htmlFor="senha"
                        className="form-label fw-semibold"
                      >
                        Senha
                      </label>

                      <input
                        type="password"
                        id="senha"
                        name="senha"
                        value={form.senha}
                        onChange={handleChange}
                        className="form-control form-control-lg"
                        placeholder="Mínimo de 6 caracteres"
                        minLength={6}
                        autoComplete="new-password"
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label
                        htmlFor="confirmarSenha"
                        className="form-label fw-semibold"
                      >
                        Confirmar senha
                      </label>

                      <input
                        type="password"
                        id="confirmarSenha"
                        name="confirmarSenha"
                        value={form.confirmarSenha}
                        onChange={handleChange}
                        className="form-control form-control-lg"
                        placeholder="Digite a senha novamente"
                        minLength={6}
                        autoComplete="new-password"
                        required
                      />
                    </div>

                    <div className="col-12 mt-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="termos"
                          name="termos"
                          checked={form.termos}
                          onChange={handleChange}
                          className="form-check-input"
                          required
                        />

                        <label
                          htmlFor="termos"
                          className="form-check-label text-secondary"
                        >
                          Eu li e aceito os{" "}
                          <a
                            href="/documentos/termos-de-uso.pdf"
                            target="_blank"
                            className="text-primary fw-semibold text-decoration-none"
                          >
                            termos de uso
                          </a>
                          .
                        </label>
                      </div>
                    </div>

                    <div className="col-12 mt-2">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="privacidade"
                          name="privacidade"
                          checked={form.privacidade}
                          onChange={handleChange}
                          className="form-check-input"
                          required
                        />

                        <label
                          htmlFor="privacidade"
                          className="form-check-label text-secondary"
                        >
                          Eu li e aceito os{" "}
                          <a
                            href="/documentos/politica-de-privacidade.pdf"
                            target="_blank"
                            className="text-primary fw-semibold text-decoration-none"
                          >
                            termos de privacidade
                          </a>
                          .
                        </label>
                      </div>
                    </div>

                    <div className="col-12 mt-4">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 fw-semibold"
                        disabled={carregando}
                      >
                        {carregando ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              aria-hidden="true"
                            ></span>
                            Criando conta...
                          </>
                        ) : (
                          "Criar conta"
                        )}
                      </button>
                    </div>

                    <div className="col-12 text-center mt-3">
                      <span className="text-secondary">
                        Já possui uma conta?{" "}
                      </span>

                      <Link
                        href="/login"
                        className="text-primary fw-semibold text-decoration-none"
                      >
                        Entrar
                      </Link>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}