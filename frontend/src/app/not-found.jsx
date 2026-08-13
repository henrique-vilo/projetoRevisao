'use client';

import './not-found.css';

import { motion } from 'motion/react';
import Link from 'next/link';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function NotFound() {
  return (
    <main className="not-found-page">

      {/* =====================================================
          DECORATIVE BACKGROUND
      ===================================================== */}

      <div
        className="not-found-background"
        aria-hidden="true"
      >

        <motion.div
          className="not-found-orb not-found-orb-one"
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="not-found-orb not-found-orb-two"
          animate={{
            x: [0, -18, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div className="not-found-grid" />

      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <motion.section
        className="not-found-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* ===================================================
            404
        =================================================== */}

        <motion.div
          className="not-found-code"
          variants={itemVariants}
        >

          <motion.span
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            4
          </motion.span>

          <motion.span
            className="not-found-code-zero"
            animate={{
              scale: [1, 1.035, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            0
          </motion.span>

          <motion.span
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 3,
              delay: 0.15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            4
          </motion.span>

        </motion.div>

        {/* ===================================================
            EYEBROW
        =================================================== */}

        <motion.span
          className="not-found-eyebrow"
          variants={itemVariants}
        >
          Página não encontrada
        </motion.span>

        {/* ===================================================
            TITLE
        =================================================== */}

        <motion.h1 variants={itemVariants}>
          Ops! Essa página
          <br />
          saiu do caminho.
        </motion.h1>

        {/* ===================================================
            DESCRIPTION
        =================================================== */}

        <motion.p variants={itemVariants}>
          A página que você está procurando não existe,
          foi movida ou o endereço digitado está incorreto.
        </motion.p>

        {/* ===================================================
            ACTIONS
        =================================================== */}

        <motion.div
          className="not-found-actions"
          variants={itemVariants}
        >

          {/* Página inicial */}

          <motion.div
            whileHover={{
              y: -2,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <Link
              href="/"
              className="not-found-btn not-found-btn-primary"
            >
              <i className="bi bi-house" />
              Ir para a página inicial
            </Link>
          </motion.div>

          {/* Voltar */}

          <motion.button
            type="button"
            className="not-found-btn not-found-btn-secondary"
            onClick={() => window.history.back()}
            whileHover={{
              y: -2,
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            <i className="bi bi-arrow-left" />
            Voltar
          </motion.button>

        </motion.div>

        {/* ===================================================
            STATUS
        =================================================== */}

        <motion.div
          className="not-found-status"
          variants={itemVariants}
        >

          <span className="not-found-status-dot" />

          <span>
            Erro 404
          </span>

          <span className="not-found-status-separator">
            •
          </span>

          <span>
            Recurso não encontrado
          </span>

        </motion.div>

      </motion.section>

    </main>
  );
}