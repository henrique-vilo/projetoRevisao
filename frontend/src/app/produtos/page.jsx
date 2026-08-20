'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Page() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const buscarProdutos = async () => {
      try {
        setLoading(true);
        setErro(null);

        const response = await fetch(
          `${API_URL}/produtos?pagina=1&limite=100`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          throw new Error('Não foi possível carregar os produtos.');
        }

        const data = await response.json();

        if (!data.sucesso) {
          throw new Error(
            data.erro || 'Não foi possível carregar os produtos.'
          );
        }

        setProducts(data.dados || []);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        setErro(error.message || 'Erro ao carregar produtos.');
      } finally {
        setLoading(false);
      }
    };

    buscarProdutos();
  }, []);

  return (
    <div className="container py-5 bg-white">
      {loading ? (
        <div className="row g-4 justify-content-center">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center"
            >
              <div
                className="d-flex flex-column w-100 product-card"
                style={{ maxWidth: '256px' }}
              >
                <div
                  className="position-relative w-100 bg-light overflow-hidden mb-3 rounded-3 placeholder-glow"
                  style={{ height: '320px' }}
                >
                  <span className="placeholder w-100 h-100" />
                </div>

                <div className="d-flex flex-column flex-grow-1 text-center px-1">
                  <div
                    className="d-flex align-items-start justify-content-center"
                    style={{ height: '2.5rem' }}
                  >
                    <span className="placeholder col-10" />
                  </div>

                  <div className="mt-3 d-flex flex-column gap-1">
                    <span className="placeholder col-5 mx-auto" />
                    <span className="placeholder col-7 mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : erro ? (
        <div className="text-center py-5">
          <p className="text-secondary mb-2">
            Não foi possível carregar os produtos.
          </p>

          <small className="text-danger">{erro}</small>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-secondary mb-0">
            Nenhum produto encontrado.
          </p>
        </div>
      ) : (
        <div className="row g-4 justify-content-center">
          {products.map((product) => {
            const preco = Number(product.preco || 0);

            const precoFormatado = preco.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });

            const imageUrl = product.imagem1
              ? `${API_URL}/uploads/${product.imagem1}`
              : null;

            return (
              <div
                key={product.idProduto}
                className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center"
              >
                <div
                  className="d-flex flex-column w-100 product-card"
                  style={{
                    maxWidth: '256px',
                    cursor: 'pointer',
                  }}
                >
                  {/* Box de Imagem com Arredondamento */}
                  <div
                    className="position-relative w-100 bg-light overflow-hidden mb-3 rounded-3"
                    style={{ height: '320px' }}
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.nome || 'Produto'}
                        fill
                        sizes="256px"
                        unoptimized
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
                        {product.nome}
                      </h3>
                    </div>

                    {/* Bloco de Preço + Parcelamento */}
                    <div className="mt-3 d-flex flex-column gap-1">
                      <p className="fs-6 fw-bold text-dark mb-0">
                        R$ {precoFormatado}
                      </p>

                      <p className="small text-secondary mb-0">
                        Consulte as condições de parcelamento
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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