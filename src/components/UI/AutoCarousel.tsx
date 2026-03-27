import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import ButtonPlay from './ButtonPlay';
import GenreBadges from './GenreBadges';
import MetaText from './MetaText';
import PlotText from './PlotText';
import Poster from './Poster';

interface AutoCarouselItem {
  id: string;
  name: string;
  poster: string;
  plot?: string;
  genre?: string;
  description?: string;
  rating?: string;
  year?: string;
  onPlay?: () => void;
  onInfo?: () => void;
}

interface AutoCarouselProps {
  className?: string;
  items: AutoCarouselItem[];
  autoPlayInterval?: number; // em ms, padrão 5000
  onPlay?: (item: AutoCarouselItem) => void;
  onInfo?: (item: AutoCarouselItem) => void;
  infoRight?: boolean; // se true, mostra o info do lado direito
}

export const AutoCarousel = ({
  items,
  className,
  autoPlayInterval = 5000,
  onPlay,
  onInfo,
  infoRight
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
      setCurrentIndex(prev => (prev + 1) % items.length);
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
    setCurrentIndex(prev => (prev + 1) % items.length);
    setImgError(false);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
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
      className={`relative w-full h-screen overflow-hidden rounded-lg group ${className}`}
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
                opacity: imgError ? 0.2 : 0.7
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
      <div
        className={`absolute inset-0 flex flex-col ${infoRight ? 'items-end' : 'items-start'}  justify-end p-8 md:p-16 z-10`}
      >
        <div
          className={`flex gap-4 items-end ${infoRight ? 'justify-end' : 'justify-start'} max-w-7xl w-full px-6`}
        >
          {!infoRight && <Poster poster={currentItem.poster} name={currentItem.name} />}
          {/* Info */}
          <div>
            {/* Título */}
            <h1 className="text-left text-7xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg line-clamp-2">
              {currentItem.name}
            </h1>

            {/* Meta info */}
            <div className="flex items-center gap-4 mb-2">
              <MetaText year={currentItem.year} rating={currentItem.rating} percent={0} />
              <GenreBadges genre={currentItem.genre ?? ''} />
            </div>

            <PlotText plot={currentItem.plot ?? ''} maxLength={600} />

            {/* Botões */}
            <div className="flex gap-4 items-center">
              {currentItem.onPlay && (
                <ButtonPlay
                  onClick={() => {
                    if (currentItem.onPlay) currentItem.onPlay();
                    // onPlay(currentItem);
                  }}
                  isFocused={false}
                />
              )}

              {/* <button
              className="px-6 py-3 rounded-lg font-bold text-white border-2 border-white
                         hover:bg-white/20 transition-all duration-200"
              onClick={onInfo}
            >
              Mais Informações
            </button> */}
            </div>
          </div>
          {infoRight && <Poster poster={currentItem.poster} name={currentItem.name} />}
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
