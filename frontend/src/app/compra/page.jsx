'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function ProductPage() {
  const [selectedSize, setSelectedSize] = useState('');

  // Dados estáticos simulando o retorno de uma API
  const product = {
    id: '789101112',
    title: 'Jaqueta PU Camurçada com Zíper Frontal',
    price: '399,90',
    installments: '7x de R$ 57,13',
    imageUrl: '/akin.webp',
    description: 'Jaqueta confeccionada em material sintético com toque acamurçado. Possui gola estruturada, forro interno macio para maior conforto térmico e fechamento frontal por zíper de metal. Uma peça versátil e elegante, ideal para compor o visual em dias mais frios.',
    sizes: ['P', 'M', 'G', 'GG', 'X1'],
  };

  const handleBuy = () => {
    if (!selectedSize) {
      alert('Por favor, selecione um tamanho antes de adicionar o produto ao carrinho');
      return;
    }
    alert(`Produto adicionado ao carrinho! (Tamanho: ${selectedSize})`);
  };

  return (
    <div className="min-vh-100 bg-white text-dark">
      <div className="container py-4 py-md-5" style={{ maxWidth: '1200px' }}>
        
        {/* Navegação Breadcrumbs */}
        <nav className="small text-muted text-uppercase mb-4">
          <span className="cursor-pointer text-hover-dark">Início</span> 
          <span className="mx-2">/</span> 
          <span className="cursor-pointer text-hover-dark">Masculino</span> 
          <span className="mx-2">/</span> 
          <span className="cursor-pointer text-hover-dark">Casacos e Jaquetas</span> 
          <span className="mx-2">/</span> 
          <span className="fw-semibold text-dark">{product.title}</span>
        </nav>

        {/* Container Principal: Grid dividindo Imagem e Detalhes */}
        <div className="row g-4 g-lg-5 align-items-start">
          
          {/* Coluna da Imagem (Sticky no desktop) */}
          <div className="col-12 col-lg-6 sticky-lg-top" style={{ top: '2rem' }}>
            <div 
              className="position-relative w-100 bg-light rounded-1 overflow-hidden"
              style={{ aspectRatio: '3/4' }}
            >
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-fit-cover object-position-top product-image"
                priority
              />
            </div>
          </div>

          {/* Coluna de Informações do Produto */}
          <div className="col-12 col-lg-6 d-flex flex-column pt-2 pt-lg-0">
            
            {/* Título e Ref */}
            <h1 className="fs-3 fs-lg-2 fw-medium text-dark mb-2 text-uppercase lh-sm">
              {product.title}
            </h1>
            <p className="small text-muted mb-4">Ref: {product.id}</p>
            
            {/* Preço e Parcelamento */}
            <div className="mb-4">
              <p className="fs-2 fw-bold text-dark mb-1">
                R$ {product.price}
              </p>
              <p className="small text-secondary mb-0">
                ou <span className="fw-semibold">{product.installments}</span> sem juros no cartão
              </p>
            </div>

            {/* Linha Divisória */}
            <hr className="text-secondary opacity-25 mb-4" />

            {/* Seleção de Tamanho */}
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="small fw-bold text-dark text-uppercase">
                  Tamanho: <span className="fw-normal text-muted">{selectedSize || 'Selecione'}</span>
                </span>
                <button 
                  type="button"
                  className="btn btn-link p-0 text-dark small text-decoration-underline shadow-none"
                >
                  Guia de Medidas
                </button>
              </div>
              
              <div className="d-flex flex-wrap gap-2 mb-4">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`btn rounded-circle d-flex align-items-center justify-content-center p-0 fw-medium transition-all ${
                      selectedSize === size 
                        ? 'btn-dark' 
                        : 'btn-outline-secondary text-dark'
                    }`}
                    style={{ width: '48px', height: '48px' }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Botão de Compra */}
            <button 
              type="button"
              onClick={handleBuy}
              className="btn btn-buy text-white w-100 py-3 fw-bold small text-uppercase shadow-sm mb-4"
            >
              Adicionar ao carrinho
            </button>

            {/* Descrição do Produto */}
            <div className="border-top pt-4 mt-2">
              <h3 className="fs-6 fw-bold text-dark mb-3 text-uppercase">
                Descrição do Produto
              </h3>
              <p className="small text-secondary lh-base mb-0">
                {product.description}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Regras específicas de estilo que não existem como utilitários nativos no Bootstrap */}
      <style jsx>{`
        .product-image {
          transition: transform 0.7s ease-in-out;
        }
        .product-image:hover {
          transform: scale(1.05);
        }
        .text-hover-dark:hover {
          color: #000 !important;
          cursor: pointer;
        }
        .btn-buy {
          background-color: #008542;
          letter-spacing: 0.1em;
          border: none;
        }
        .btn-buy:hover {
          background-color: #006e36;
        }
      `}</style>
    </div>
  );
}