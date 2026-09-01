"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import styles from "../auth.module.css";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/$/, "");

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

function PasswordField({ id, label, name, autoComplete }) {
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
          placeholder="Digite sua senha"
          autoComplete={autoComplete}
          minLength={6}
          required
        />
        <button
          type="button"
          className={styles.passwordButton}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          <EyeIcon hidden={visible} />
        </button>
        <div className="invalid-feedback">
          A senha deve possuir pelo menos 6 caracteres.
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const mensagem = sessionStorage.getItem("authFeedback");

    if (mensagem) {
      setFeedback({ tipo: "success", mensagem });
      sessionStorage.removeItem("authFeedback");
    }
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    setValidated(true);
    setFeedback(null);

    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const formData = new FormData(form);
    const payload = {
      email: formData.get("email").trim().toLowerCase(),
      senha: formData.get("senha"),
    };

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const resultado = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          resultado?.mensagem || resultado?.erro || "Não foi possível fazer login."
        );
      }

      const token = resultado?.dados?.token;
      const usuario = resultado?.dados?.usuario;

      if (!token || !usuario) {
        throw new Error("A resposta do servidor não contém os dados do login.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      router.replace(
        usuario.tipo === "admin" ? "/admin/dashboard" : "/"
      );
      router.refresh();
    } catch (error) {
      setFeedback({
        tipo: "danger",
        mensagem:
          error instanceof TypeError
            ? "Não foi possível conectar ao servidor. Verifique se a API está funcionando."
            : error.message || "Não foi possível fazer login. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.authPage}>
      <div className="container px-3 px-sm-4">
        <section
          className={`${styles.authCard} ${styles.loginCard}`}
          aria-labelledby="login-title"
        >
          <header className="text-center mb-4 mb-md-5 d-flex flex-column">
            <AuthBrand />
            <h1 id="login-title" className={`${styles.heading} mt-4 mt-md-5`}>
              Bem-vindo de volta
            </h1>
            <p className={styles.supportingText}>
              Faça login para acessar suas compras, pedidos e ofertas exclusivas.
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
            <div className="mb-3">
              <label htmlFor="login-email" className={styles.formLabel}>
                E-mail
              </label>
              <input
                id="login-email"
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

            <PasswordField
              id="login-senha"
              name="senha"
              label="Senha"
              autoComplete="current-password"
            />

            <div className="text-end mt-3">
              <Link href="/recuperar-senha" className={styles.textLink}>
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              className={`btn w-100 mt-4 ${styles.primaryButton}`}
              disabled={loading}
            >
              {loading && (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  aria-hidden="true"
                />
              )}
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className={`${styles.footerText} text-center mb-0 mt-4`}>
            Ainda não tem uma conta?{" "}
            <Link href="/cadastro" className={styles.textLink}>
              Cadastre-se
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
