'use client';

import Image from 'next/image';

const products = [
  {
    id: 1,
    title: 'Jaqueta PU Camurçada com Zíper Frontal',
    price: '399,90',
    installments: '7x de R$ 57,13*',
    imageUrl: '/akin.webp',
  },
  {
    id: 2,
    title: 'Jaqueta com Detalhes em Recorte e Barra com Elástico',
    price: '299,90',
    installments: '7x de R$ 42,84*',
    imageUrl: '/akin.webp',
  },
  {
    id: 3,
    title: 'Jaqueta com Detalhes em Recorte e Barra com Elástico',
    price: '299,90',
    installments: '7x de R$ 42,84*',
    imageUrl: '/akin.webp',
  },
  {
    id: 4,
    title: 'Jaqueta Trucker Pesada em Polivelour Mesclado com Bolsos',
    price: '359,90',
    installments: '7x de R$ 51,41*',
    imageUrl: '/akin.webp',
  },
  {
    id: 5,
    title: 'Calça Cargo Masculina em Sarja com Bolsos Laterais',
    price: '189,90',
    installments: '4x de R$ 47,47*',
    imageUrl: '/akin.webp',
  },
  {
    id: 6,
    title: 'Camiseta Oversized Algodão Premium Minimalista',
    price: '89,90',
    installments: '2x de R$ 44,95*',
    imageUrl: '/akin.webp',
  },
  {
    id: 7,
    title: 'Tênis Casual Court Sintético com Recortes Sola Reta',
    price: '249,90',
    installments: '5x de R$ 49,98*',
    imageUrl: '/akin.webp',
  },
  {
    id: 8,
    title: 'Moletom Canguru Fechado com Capuz e Bolso Frontal',
    price: '219,90',
    installments: '4x de R$ 54,97*',
    imageUrl: '/akin.webp',
  },
  {
    id: 9,
    title: 'Camisa Social Manga Longa Slim Fit de Linho',
    price: '149,90',
    installments: '3x de R$ 49,96*',
    imageUrl: '/akin.webp',
  },
  {
    id: 10,
    title: 'Bermuda de Moletom Conforto com Cordão Ajustável',
    price: '79,90',
    installments: '2x de R$ 39,95*',
    imageUrl: '/akin.webp',
  },
  {
    id: 11,
    title: 'Blazer de Alfaiataria Premium Estruturado',
    price: '499,90',
    installments: '10x de R$ 49,99*',
    imageUrl: '/akin.webp',
  },
  {
    id: 12,
    title: 'Vestido Canelado Midi com Gola Alta e Fenda',
    price: '129,90',
    installments: '3x de R$ 43,30*',
    imageUrl: '/akin.webp',
  },
  {
    id: 13,
    title: 'Saia Plissada de Cintura Alta Estilo Elegante',
    price: '159,90',
    installments: '3x de R$ 53,30*',
    imageUrl: '/akin.webp',
  },
  {
    id: 14,
    title: 'Óculos de Sol Estilo Aviador Clássico UV400',
    price: '199,90',
    installments: '4x de R$ 49,97*',
    imageUrl: '/akin.webp',
  },
  {
    id: 15,
    title: 'Relógio Analógico Minimalista com Pulseira de Couro',
    price: '299,90',
    installments: '6x de R$ 49,98*',
    imageUrl: '/akin.webp',
  },
  {
    id: 16,
    title: 'Mochila Urbana Resistente à Água com Compartimento',
    price: '259,90',
    installments: '5x de R$ 51,98*',
    imageUrl: '/akin.webp',
  },
];

export default function Page() {
  return (
    <div className="container py-5 bg-white">
      <div className="row g-4 justify-content-center">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center"
          >
            <div 
              className="d-flex flex-column w-100 product-card" 
              style={{ maxWidth: '256px', cursor: 'pointer' }}
            >
              {/* Box de Imagem com Arredondamento */}
              <div 
                className="position-relative w-100 bg-light overflow-hidden mb-3 rounded-3" 
                style={{ height: '320px' }}
              >
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    sizes="256px"
                    className="object-fit-cover product-image"
                  />
                ) : (
                  <span className="d-flex align-items-center justify-content-center h-100 small text-secondary">
                    Foto do Produto
                  </span>
                )}
              </div>

              {/* Container de Informações Centralizadas */}
              <div className="d-flex flex-column flex-grow-1 text-center px-1">
                
                {/* Título com Altura Fixa */}
                <div 
                  className="d-flex align-items-start justify-content-center" 
                  style={{ height: '2.5rem' }}
                >
                  <h3 className="fs-6 fw-normal text-secondary lh-sm m-0 product-title">
                    {product.title}
                  </h3>
                </div>

                {/* Bloco de Preço + Parcelamento */}
                <div className="mt-3 d-flex flex-column gap-1">
                  <p className="fs-6 fw-bold text-dark mb-0">
                    R$ {product.price}
                  </p>
                  <p className="small text-secondary mb-0">
                    {product.installments}
                  </p>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .product-image {
          transition: transform 0.5s ease-in-out;
        }
        .product-card:hover .product-image {
          transform: scale(1.1);
        }
        .product-title {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}