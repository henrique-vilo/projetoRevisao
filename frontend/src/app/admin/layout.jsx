"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";

import Sidebar from "@/components/Sidebar";

export default function AdminLayout({ children }) {
  const [status, setStatus] = useState("verificando");

  useEffect(() => {
    try {
      const usuarioSalvo = localStorage.getItem("usuario");

      if (!usuarioSalvo) {
        setStatus("negado");
        return;
      }

      const usuario = JSON.parse(usuarioSalvo);

      if (usuario.tipo !== "admin") {
        setStatus("negado");
        return;
      }

      setStatus("autorizado");
    } catch (erro) {
      console.error("Erro ao verificar administrador:", erro);
      setStatus("negado");
    }
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