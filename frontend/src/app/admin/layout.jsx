"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";

import Sidebar from "@/components/Sidebar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function AdminLayout({ children }) {
  const [status, setStatus] = useState("verificando");

  useEffect(() => {
    const abortController = new AbortController();

    async function verificarAdministrador() {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("jwt");
        if (!token) {
          setStatus("negado");
          return;
        }

        const response = await fetch(`${API_URL}/auth/perfil`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: abortController.signal,
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok || data?.dados?.tipo !== "admin") {
          setStatus("negado");
          return;
        }

        localStorage.setItem("usuario", JSON.stringify(data.dados));
        setStatus("autorizado");
      } catch (erro) {
        if (erro.name !== "AbortError") {
          console.error("Erro ao verificar administrador:", erro);
          setStatus("negado");
        }
      }
    }

    verificarAdministrador();
    return () => abortController.abort();
  }, []);

  if (status === "verificando") {
    return (
      <main className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">
            Verificando acesso...
          </span>
        </div>
      </main>
    );
  }

  if (status === "negado") {
    notFound();
  }

  return (
    <div className="app-layout d-flex min-vh-100">
      <Sidebar />

      <div className="app-content flex-grow-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
