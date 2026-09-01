"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import styles from "../auth.module.css";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/$/, "");

function formatarCpf(valor) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatarTelefone(valor) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

function formatarCep(valor) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, "$1-$2");
}

function AuthBrand() {
  return (
    <Link href="/" className={styles.brand} aria-label="Everett — página inicial">
      <span className={styles.brandMark} aria-hidden="true">
        <span className={styles.brandLetter}>E</span>
      </span>
      <span>Everett</span>
    </Link>
  );
}

function EyeIcon({ hidden }) {
  if (hidden) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m3 3 18 18" />
        <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
        <path d="M9.9 4.2A10.5 10.5 0 0 1 12 4c5.5 0 9.5 5.3 9.5 5.3a12.5 12.5 0 0 1-2.1 2.7" />
        <path d="M6.6 6.6C4.1 8.1 2.5 10.3 2.5 10.3S6.5 16 12 16c1 0 1.9-.2 2.8-.5" />
      </svg>
    );
  }

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 12S6.5 6 12 6s9.5 6 9.5 6-4 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function PasswordField({
  id,
  label,
  name,
  autoComplete,
  placeholder = "Digite sua senha",
  invalidMessage,
  onInput,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className={styles.formLabel}>
        {label}
      </label>
      <div className={styles.passwordWrap}>
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          className={`form-control ${styles.formControl} ${styles.passwordControl}`}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={6}
          onInput={onInput}
          required
        />
        <button
          type="button"
          className={styles.passwordButton}
          aria-label={visible ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          <EyeIcon hidden={visible} />
        </button>
        <div className="invalid-feedback">
          {invalidMessage || "A senha deve possuir pelo menos 6 caracteres."}
        </div>
      </div>
    </div>
  );
}

export default function CadastroPage() {
  const router = useRouter();
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const senha = form.elements.namedItem("senha");
    const confirmarSenha = form.elements.namedItem("confirmarSenha");

    confirmarSenha.setCustomValidity(
      senha.value === confirmarSenha.value ? "" : "As senhas não coincidem."
    );

    setValidated(true);
    setFeedback(null);

    if (!form.checkValidity()) {
      event.stopPropagation();
      return;
    }

    const formData = new FormData(form);
    const payload = {
      nome: formData.get("nome").trim(),
      cpf: formData.get("cpf").trim(),
      email: formData.get("email").trim().toLowerCase(),
      telefone: formData.get("telefone").trim(),
      cep: formData.get("cep").trim(),
      senha: formData.get("senha"),
    };

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/registrar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const resultado = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          resultado?.mensagem ||
            resultado?.mesnagem ||
            resultado?.erro ||
            "Não foi possível criar a conta."
        );
      }

      sessionStorage.setItem(
        "authFeedback",
        resultado?.mensagem || "Conta criada com sucesso. Faça seu login."
      );

      router.replace("/login");
    } catch (error) {
      setFeedback({
        tipo: "danger",
        mensagem:
          error instanceof TypeError
            ? "Não foi possível conectar ao servidor. Verifique se a API está funcionando."
            : error.message || "Não foi possível criar a conta. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handlePasswordConfirmation(event) {
    const senha = event.currentTarget.form.elements.namedItem("senha");

    event.currentTarget.setCustomValidity(
      senha.value === event.currentTarget.value
        ? ""
        : "As senhas não coincidem."
    );
  }

  return (
    <main className={styles.authPage}>
      <div className="container px-3 px-sm-4">
        <section
          className={`${styles.authCard} ${styles.registerCard}`}
          aria-labelledby="cadastro-title"
        >
          <header className="text-center mb-4 mb-md-5">
            <AuthBrand />
            <h1
              id="cadastro-title"
              className={`${styles.heading} mt-4 mt-md-5`}
            >
              Crie sua conta
            </h1>
            <p className={styles.supportingText}>
              Preencha seus dados para criar sua conta e aproveitar o melhor da
              Everett.
            </p>
          </header>

          {feedback && (
            <div
              className={`alert alert-${feedback.tipo}`}
              role="alert"
              aria-live="polite"
            >
              {feedback.mensagem}
            </div>
          )}

          <form
            className={validated ? "was-validated" : ""}
            noValidate
            onSubmit={handleSubmit}
            aria-busy={loading}
          >
            <div className="row g-3 g-md-4">
              <div className="col-12 col-md-6">
                <label htmlFor="cadastro-nome" className={styles.formLabel}>
                  Nome completo
                </label>
                <input
                  id="cadastro-nome"
                  name="nome"
                  type="text"
                  className={`form-control ${styles.formControl}`}
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  minLength="3"
                  required
                />
                <div className="invalid-feedback">
                  Digite seu nome completo.
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="cadastro-email" className={styles.formLabel}>
                  E-mail
                </label>
                <input
                  id="cadastro-email"
                  name="email"
                  type="email"
                  className={`form-control ${styles.formControl}`}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  inputMode="email"
                  required
                />
                <div className="invalid-feedback">Digite um e-mail válido.</div>
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="cadastro-cpf" className={styles.formLabel}>
                  CPF
                </label>
                <input
                  id="cadastro-cpf"
                  name="cpf"
                  type="text"
                  className={`form-control ${styles.formControl}`}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength="14"
                  pattern={"\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}"}
                  onInput={(event) => {
                    event.currentTarget.value = formatarCpf(
                      event.currentTarget.value
                    );
                  }}
                  required
                />
                <div className="invalid-feedback">
                  Use o formato 000.000.000-00.
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="cadastro-telefone" className={styles.formLabel}>
                  Telefone
                </label>
                <input
                  id="cadastro-telefone"
                  name="telefone"
                  type="tel"
                  className={`form-control ${styles.formControl}`}
                  placeholder="(11) 90000-0000"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength="15"
                  pattern={"\\(\\d{2}\\)\\s\\d{5}-\\d{4}"}
                  onInput={(event) => {
                    event.currentTarget.value = formatarTelefone(
                      event.currentTarget.value
                    );
                  }}
                  required
                />
                <div className="invalid-feedback">
                  Use o formato (11) 90000-0000.
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="cadastro-cep" className={styles.formLabel}>
                  CEP
                </label>
                <input
                  id="cadastro-cep"
                  name="cep"
                  type="text"
                  className={`form-control ${styles.formControl}`}
                  placeholder="00000-000"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength="9"
                  pattern={"\\d{5}-\\d{3}"}
                  onInput={(event) => {
                    event.currentTarget.value = formatarCep(
                      event.currentTarget.value
                    );
                  }}
                  required
                />
                <div className="invalid-feedback">
                  Use o formato 00000-000.
                </div>
              </div>

              <div className="col-12 col-md-6">
                <PasswordField
                  id="cadastro-senha"
                  name="senha"
                  label="Senha"
                  autoComplete="new-password"
                />
              </div>

              <div className="col-12">
                <PasswordField
                  id="cadastro-confirmar-senha"
                  name="confirmarSenha"
                  label="Confirmar senha"
                  autoComplete="new-password"
                  placeholder="Digite a senha novamente"
                  invalidMessage="As senhas precisam ser iguais e possuir pelo menos 6 caracteres."
                  onInput={handlePasswordConfirmation}
                />
              </div>

              <div className="col-12">
                <div
                  className={`form-check d-flex align-items-start gap-2 ${styles.termsCheck}`}
                >
                  <input
                    id="aceite-termos"
                    name="aceiteTermos"
                    type="checkbox"
                    value="aceito"
                    className={`form-check-input flex-shrink-0 ${styles.formCheckInput}`}
                    required
                  />
                  <label className="form-check-label" htmlFor="aceite-termos">
                    Li e aceito os{" "}
                    <Link href="/termos-de-uso" className={styles.textLink}>
                      Termos de Uso
                    </Link>{" "}
                    e a{" "}
                    <Link
                      href="/politica-de-privacidade"
                      className={styles.textLink}
                    >
                      Política de Privacidade
                    </Link>
                    .
                  </label>
                  <div className="invalid-feedback">
                    Você precisa aceitar os termos para continuar.
                  </div>
                </div>
              </div>

              <div className="col-12">
                <button
                  type="submit"
                  className={`btn w-100 ${styles.primaryButton}`}
                  disabled={loading}
                >
                  {loading && (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      aria-hidden="true"
                    />
                  )}
                  {loading ? "Criando conta..." : "Criar conta"}
                </button>
              </div>
            </div>
          </form>

          <p className={`${styles.footerText} text-center mb-0 mt-4`}>
            Já possui uma conta?{" "}
            <Link href="/login" className={styles.textLink}>
              Entrar
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
