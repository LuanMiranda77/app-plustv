/* eslint-disable react-hooks/rules-of-hooks */
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import StartRating from './UI/StarRating';

interface AutoCarouselItem {
  id: string;
  title: string;
  poster: string;
  genre?: string;
  description?: string;
  rating?: string;
  onPlay: () => void;
  onInfo?: () => void;
}

interface AutoCarouselProps {
  items: AutoCarouselItem[];
  autoPlayInterval?: number; // em ms, padrão 5000
  onPlay: (item: AutoCarouselItem) => void;
  onInfo?: (item: AutoCarouselItem) => void;
}

export const AutoCarousel = ({
  items,
  autoPlayInterval = 5000,
  onPlay,
  onInfo,
}: AutoCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [imgError, setImgError] = useState(false);

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex];

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
      setImgError(false);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlay, items.length, autoPlayInterval]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index % items.length);
    setImgError(false);
    setIsAutoPlay(true);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setImgError(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setImgError(false);
  };

  const handleMouseEnter = () => {
    setIsAutoPlay(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlay(true);
  };

  return (
    <div
      className="relative w-full h-screen max-h-[600px] overflow-hidden rounded-lg group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Banner Slides */}
      <div className="relative w-full h-full">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${item.poster})`,
                opacity: imgError ? 0.2 : 1,
              }}
              onError={() => setImgError(true)}
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 z-10">
        <div className="flex gap-8 items-end max-w-4xl w-full">
          {/* Poster */}
          <div
            className="relative flex-shrink-0 w-40 rounded-2xl overflow-hidden
                          shadow-2xl shadow-black/80 border border-white/10"
          >
            <img
              src={currentItem.poster}
              alt={currentItem.title}
              className="w-full aspect-[2/3] object-cover"
              onError={() => setImgError(true)}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0" style={{ animation: 'fadeSlideIn 0.6s ease 0.2s both' }}>
            {/* Gênero badges */}
            {currentItem.genre && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {currentItem.genre
                  .split(',')
                  .slice(0, 3)
                  .map((g) => (
                    <span
                      key={g}
                      className="text-xs px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm
                               border border-white/10 text-zinc-300"
                    >
                      {g.trim()}
                    </span>
                  ))}
              </div>
            )}
          </div>
          <div className="max-w-2xl">
            {/* Título */}
            <h1 className="text-left text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg line-clamp-2">
              {currentItem.title}
            </h1>

            {/* Meta info */}
            <div className="flex items-center gap-4 mb-6">
              {currentItem.rating && <StartRating rating={currentItem.rating} />}
            </div>

            {/* Descrição */}
            {currentItem.description && (
              <p className="text-gray-100 text-sm md:text-lg line-clamp-3 mb-6 drop-shadow-lg text-justify">
                {currentItem.description}
              </p>
            )}

            {/* Botões */}
            <div className="flex gap-4 items-center">
              <button
                onClick={() => {
                  currentItem.onPlay();
                  // onPlay(currentItem);
                }}
                className="flex items-center gap-2.5 px-8 py-3 rounded-xl font-semibold text-sm
                           bg-red-600 hover:bg-red-500 text-white transition-all duration-200
                           shadow-lg shadow-red-900/40 hover:shadow-red-900/60 hover:scale-105
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Play className="w-5 h-5 fill-white" />
                Assistir
              </button>
              {/* <button
                onClick={() => {
                  currentItem.onPlay();
                  // onPlay(currentItem);
                }}
                className="flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-black
                         bg-white hover:bg-gray-200 transition-all duration-200
                         shadow-lg hover:shadow-xl"
              >
                <Play className="w-5 h-5 fill-black" />
                Assistir
              </button> */}

              {/* <button
              className="px-6 py-3 rounded-lg font-bold text-white border-2 border-white
                         hover:bg-white/20 transition-all duration-200"
              onClick={onInfo}
            >
              Mais Informações
            </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20
                 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full
                 transition-all duration-200 opacity-0 group-hover:opacity-100"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20
                 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full
                 transition-all duration-200 opacity-0 group-hover:opacity-100"
        aria-label="Próximo slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-8 right-8 z-20 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1 rounded-full transition-all duration-300 cursor-pointer
              ${index === currentIndex ? 'bg-white w-12' : 'bg-white/50 hover:bg-white/75 w-6'}`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="absolute bottom-8 right-8 z-20 text-white text-sm font-semibold opacity-75">
        {currentIndex + 1} / {items.length}
      </div>
    </div>
  );
};

export default AutoCarousel;
