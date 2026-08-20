'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    let ativo = true;

    const validarAcesso = async () => {
      try {
        const token =
          localStorage.getItem('token') ||
          localStorage.getItem('authToken') ||
          localStorage.getItem('accessToken') ||
          localStorage.getItem('jwt');

        /*
         * =====================================================
         * USUÁRIO NÃO LOGADO
         * =====================================================
         */

        if (!token) {
          if (ativo) {
            notFound();
          }

          return;
        }

        const API_URL =
          process.env.NEXT_PUBLIC_API_URL ||
          'http://localhost:3001';

        const response = await fetch(
          `${API_URL}/auth/perfil`,
          {
            method: 'GET',

            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },

            cache: 'no-store',
          }
        );

        /*
         * =====================================================
         * TOKEN INVÁLIDO / EXPIRADO
         * =====================================================
         */

        if (!response.ok) {
          if (ativo) {
            notFound();
          }

          return;
        }

        const data = await response.json();

        /*
         * =====================================================
         * USUÁRIO
         * =====================================================
         */

        const usuario =
          data?.dados ||
          data?.usuario ||
          data?.user ||
          data;

        const tipoUsuario = String(
          usuario?.tipo ||
          usuario?.tipoUsuario ||
          usuario?.tipo_user ||
          usuario?.cargo ||
          usuario?.role ||
          usuario?.nivel ||
          ''
        ).toLowerCase();

        /*
         * =====================================================
         * ADMINISTRADOR
         * =====================================================
         */

        if (tipoUsuario === 'admin') {
          if (ativo) {
            router.replace('/admin/dashboard');
          }

          return;
        }

        /*
         * =====================================================
         * USUÁRIO LOGADO, MAS NÃO ADMIN
         * =====================================================
         */

        if (ativo) {
          notFound();
        }
      } catch (error) {
        console.error(
          'Erro ao validar acesso administrativo:',
          error
        );

        /*
         * Qualquer erro na validação:
         * não revela a existência do painel administrativo.
         */

        if (ativo) {
          notFound();
        }
      }
    };

    validarAcesso();

    return () => {
      ativo = false;
    };
  }, [router]);

  return null;
}