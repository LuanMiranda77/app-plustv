import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';

interface CarouselProps {
  children: React.ReactNode[];
  itemsVisible?: number;
  gap?: number;
}

export const Carousel = ({ children, itemsVisible = 6, gap = 16 }: CarouselProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = direction === 'left' ? -400 : 400;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });

    setTimeout(updateScrollButtons, 500);
  };

  const handleScroll = () => {
    updateScrollButtons();
  };

  return (
    <div className="relative group">
      {/* Left Scroll Button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 -translate-x-16 hidden lg:block"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Right Scroll Button */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 translate-x-16 hidden lg:block"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onLoad={updateScrollButtons}
        className="flex gap-4 overflow-x-auto overflow-y-visible scrollbar-hide scroll-smooth px-2 py-4"
      >
        {children.map((child, index) => (
          <div key={index} className="flex-shrink-0">
            {child}
          </div>
        ))}
      </div>

      {/* Mobile Scroll Indicator */}
      <div className="flex lg:hidden justify-center mt-4 gap-2">
        {children.map((_, index) => (
          <div key={index} className="h-1 rounded-full bg-gray-700 transition-colors" />
        ))}
      </div>
    </div>
  );
};
