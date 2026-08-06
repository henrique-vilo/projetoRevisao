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
    <div className="p-8 bg-white max-w-7xl mx-auto">
      <div className="flex flex-wrap gap-x-6 gap-y-10 justify-center">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="flex flex-col w-64 group cursor-pointer"
          >
            {/* Box de Imagem com Arredondamento */}
            <div className="relative w-full h-80 bg-gray-100 overflow-hidden mb-4 rounded-xl">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  sizes="256px"
                  className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                />
              ) : (
                <span className="flex items-center justify-center h-full text-xs text-gray-500">
                  Foto do Produto
                </span>
              )}
            </div>

            {/* Container de Informações Centralizadas */}
            <div className="flex flex-col flex-1 text-center px-1">
              
              {/* Título com Altura Fixa */}
              <div className="h-10 flex items-start justify-center">
                <h3 className="text-sm font-normal text-gray-700 leading-tight line-clamp-2">
                  {product.title}
                </h3>
              </div>

              {/* Bloco de Preço + Parcelamento COM ESPAÇO */}
              <div className="mt-4 flex flex-col gap-1">
                <p className="text-base font-bold text-black">
                  R$ {product.price}
                </p>
                <p className="text-xs text-gray-500">
                  {product.installments}
                </p>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}