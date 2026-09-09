"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../auth.module.css";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/$/, "");

/*
 * ============================================================
 * TEMA
 * ============================================================
 */

function aplicarTema(isDark) {
  if (typeof document === "undefined") return;

  const html = document.documentElement;

  if (isDark) {
    html.classList.add("dark");
    html.setAttribute("data-bs-theme", "dark");
    localStorage.setItem("tema", "dark");
  } else {
    html.classList.remove("dark");
    html.setAttribute("data-bs-theme", "light");
    localStorage.setItem("tema", "light");
  }
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
  showValidation,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="mb-3">
      <label htmlFor={id} className={styles.formLabel}>
        {label}
      </label>

      <div className={styles.passwordWrap}>
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          className={[
            "form-control",
            styles.formControl,
            styles.passwordControl,
            !showValidation ? "no-validation-icon" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          placeholder="Digite sua senha"
          autoComplete={autoComplete}
          minLength={6}
          required
          aria-describedby={`${id}-feedback`}
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

        <div id={`${id}-feedback`} className="invalid-feedback">
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

  /*
   * ============================================================
   * FEEDBACK DE AUTENTICAÇÃO
   * ============================================================
   */

  useEffect(() => {
    const mensagem = sessionStorage.getItem("authFeedback");

    if (mensagem) {
      setFeedback({
        tipo: "success",
        mensagem,
      });

      sessionStorage.removeItem("authFeedback");
    }
  }, []);

  /*
   * ============================================================
   * LOGIN
   * ============================================================
   */

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    // A validação visual só começa depois que o usuário tenta enviar.
    setValidated(true);
    setFeedback(null);

    if (!form.checkValidity()) {
      event.stopPropagation();
      return;
    }

    const formData = new FormData(form);

    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();

    const senha = String(formData.get("senha") || "");

    const payload = {
      email,
      senha,
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
          resultado?.mensagem ||
            resultado?.erro ||
            "E-mail ou senha incorretos."
        );
      }

      const token = resultado?.dados?.token;
      const usuario = resultado?.dados?.usuario;

      if (!token || !usuario) {
        throw new Error(
          "A resposta do servidor não contém os dados do login."
        );
      }

      /*
       * Salva a sessão.
       */
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      /*
       * ========================================================
       * ADMINISTRADOR
       * ========================================================
       *
       * Ao entrar com uma conta admin, força automaticamente
       * o modo claro, seguindo exatamente a lógica do Header.
       */
      if (usuario.tipo === "admin") {
        aplicarTema(false);
      }

      /*
       * Redirecionamento.
       */
      router.replace(
        usuario.tipo === "admin"
          ? "/admin/dashboard"
          : "/"
      );

      router.refresh();
    } catch (error) {
      setFeedback({
        tipo: "danger",
        mensagem:
          error instanceof TypeError
            ? "Não foi possível conectar ao servidor. Verifique se a API está funcionando."
            : error.message ||
              "Não foi possível fazer login. Tente novamente.",
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
          <header className="text-center mb-4 mb-md-5">
            <h1
              id="login-title"
              className={`${styles.heading} mb-3`}
            >
              Bem-vindo de volta
            </h1>

            <p className={styles.supportingText}>
              Faça login para acessar suas compras, pedidos e ofertas
              exclusivas.
            </p>
          </header>

          {feedback && (
            <div
              className={`alert alert-${feedback.tipo} ${styles.authFeedback}`}
              role="alert"
              aria-live="polite"
            >
              <span
                className={styles.feedbackIcon}
                aria-hidden="true"
              >
                {feedback.tipo === "success" ? "✓" : "!"}
              </span>

              <span>{feedback.mensagem}</span>
            </div>
          )}

          <form
            className={validated ? "was-validated" : ""}
            noValidate
            onSubmit={handleSubmit}
            aria-busy={loading}
          >
            <div className="mb-3">
              <label
                htmlFor="login-email"
                className={styles.formLabel}
              >
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

              <div className="invalid-feedback">
                Digite um e-mail válido.
              </div>
            </div>

            <PasswordField
              id="login-senha"
              name="senha"
              label="Senha"
              autoComplete="current-password"
              showValidation={validated}
            />

            <button
              type="submit"
              className={`btn w-100 mt-4 ${styles.primaryButton}`}
              disabled={loading}
              aria-disabled={loading}
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

          <p
            className={`${styles.footerText} text-center mb-0 mt-4`}
          >
            Ainda não tem uma conta?{" "}

            <Link
              href="/cadastro"
              className={styles.textLink}
            >
              Cadastre-se
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}