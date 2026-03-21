import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Advertisement {
  id: number;
  image: string;
  link: string;
  title: string;
}

const AdvertisementCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const url =
    'https://imagens-smart-commerce.s3.us-east-2.amazonaws.com/banner-anuncios/'; // Exemplo de endpoint para anúncios

  // Mock de dados - 10 anúncios com imagens por placeholder
  const advertisements: Advertisement[] = [
    {
      id: 1,
      image: url + 'banner-1.png',
      link: 'https://example.com/ad1',
      title: 'Anúncio 1'
    },
    {
      id: 2,
      image:
        url + 'banner-2.png',
      link: 'https://example.com/ad2',
      title: 'Anúncio 2'
    },
    {
      id: 3,
      image:
        url + 'banner-3.jpg',
      link: 'https://example.com/ad3',
      title: 'Anúncio 3'
    },
    {
      id: 4,
      image:
        url + 'banner-4.jpg',
      link: 'https://example.com/ad4',
      title: 'Anúncio 4'
    },
    {
      id: 5,
      image:
        url + 'banner-5.png',
      link: 'https://example.com/ad5',
      title: 'Anúncio 5'
    },
    {
      id: 6,
      image:
        url + 'banner-6.png',
      link: 'https://example.com/ad6',
      title: 'Anúncio 6'
    },
    {
      id: 7,
      image:
        url + 'banner-7.png',
      link: 'https://example.com/ad7',
      title: 'Anúncio 7'
    },
    {
      id: 8,
      image: url + 'banner-8.jpg',
      link: 'https://example.com/ad8',
      title: 'Anúncio 8'
    },
    {
      id: 9,
      image: url + 'banner-9.png',
      link: 'https://example.com/ad9',
      title: 'Anúncio 9'
    },
    {
      id: 10,
      image: url + 'banner10.png',
      link: 'https://example.com/ad10',
      title: 'Anúncio 10'
    }
  ];

  // Auto-play
  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % advertisements.length);
    }, 5000); // Muda a cada 5 segundos

    return () => clearInterval(interval);
  }, [autoplay, advertisements.length]);

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? advertisements.length - 1 : prev - 1));
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000); // Retoma autoplay após 10s
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % advertisements.length);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000);
  };

  const currentAd = advertisements[currentIndex];

  return (
    <div className="w-full bg-gradient-to-b from-gray-900 to-gray-950 overflow-hidden mb-8">
      <div className="relative w-full h-[500px] group">
        {/* Imagem do anúncio */}
        <a
          href={currentAd.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          <img
            src={currentAd.image}
            alt={currentAd.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </a>

        {/* Botões de navegação */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-red-600 text-white p-3 rounded-full transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-red-600 text-white p-3 rounded-full transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Próximo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Indicadores de slides */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-black/40 px-4 py-2 rounded-full">
          {advertisements.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-red-600 w-6' : 'bg-gray-400 hover:bg-gray-300'
              }`}
              aria-label={`Ir para anúncio ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvertisementCarousel;
