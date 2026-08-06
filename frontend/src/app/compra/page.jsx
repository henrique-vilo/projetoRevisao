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
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navegação Breadcrumbs */}
        <nav className="text-xs text-gray-500 mb-6 uppercase tracking-wider">
          <span className="cursor-pointer hover:text-black transition-colors">Início</span> 
          <span className="mx-2">/</span> 
          <span className="cursor-pointer hover:text-black transition-colors">Masculino</span> 
          <span className="mx-2">/</span> 
          <span className="cursor-pointer hover:text-black transition-colors">Casacos e Jaquetas</span> 
          <span className="mx-2">/</span> 
          <span className="font-semibold text-black">{product.title}</span>
        </nav>

        {/* Container Principal: Grid dividindo Imagem e Detalhes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          
          {/* Coluna da Imagem (Sticky para acompanhar o scroll) */}
          <div className="w-full lg:sticky lg:top-8">
            <div className="relative w-full aspect-[3/4] bg-gray-100 rounded-sm overflow-hidden">
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top hover:scale-105 transition-transform duration-700 ease-in-out"
                priority
              />
            </div>
          </div>

          {/* Coluna de Informações do Produto (Alinhada ao topo) */}
          <div className="w-full flex flex-col pt-2 lg:pt-0">
            
            {/* Título e Ref */}
            <h1 className="text-2xl lg:text-3xl font-medium text-black mb-2 uppercase leading-snug">
              {product.title}
            </h1>
            <p className="text-xs text-gray-400 mb-6">Ref: {product.id}</p>
            
            {/* Preço e Parcelamento */}
            <div className="mb-8">
              <p className="text-3xl lg:text-4xl font-bold text-black mb-1">
                R$ {product.price}
              </p>
              <p className="text-sm text-gray-600">
                ou <span className="font-semibold">{product.installments}</span> sem juros no cartão
              </p>
            </div>

            {/* Linha Divisória */}
            <hr className="border-gray-200 mb-8" />

            {/* Seleção de Tamanho */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-black uppercase tracking-wider">
                  Tamanho: <span className="font-normal text-gray-500">{selectedSize || 'Selecione'}</span>
                </span>
                <button className="text-xs text-black underline hover:text-gray-600 transition-colors">
                  Guia de Medidas
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    // Adicionado 'rounded-full' nas classes abaixo para deixá-los redondos
                    className={`w-12 h-12 rounded-full flex items-center justify-center border text-sm font-medium transition-all duration-200 ${
                      selectedSize === size 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-300 text-gray-700 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Botão de Compra */}
            <button 
              onClick={handleBuy}
              className="w-full py-4 bg-[#008542] hover:bg-[#006e36] text-white rounded-sm font-bold text-sm uppercase tracking-widest transition-colors mb-8 shadow-sm"
            >
              Adicionar ao carrinho
            </button>

            {/* Descrição do Produto em Accordion/Bloco */}
            <div className="border-t border-gray-200 pt-6 mt-2">
              <h3 className="text-sm font-semibold text-black mb-4 uppercase tracking-wider">
                Descrição do Produto
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}