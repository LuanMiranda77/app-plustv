/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from 'react';
import { MovieCard } from '../components/Cards/MovieCard';
import ButtonCategory from '../components/UI/ButtonCategory';
import { Input } from '../components/UI/Input';
import MovieDetail from '../components/UI/MovieDetail';
import { useFocusZone } from '../Context/FocusContext';
import { useRemoteControl } from '../hooks/useRemotoControl';
import { useContentStore } from '../store/contentStore';
import { useFavoritesStore } from '../store/favoritesStore';
import type { Movie } from '../types';

export const Movies = () => {
  const { movies, vodCategories } = useContentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [displayCount, setDisplayCount] = useState(20); // Mostrar 20 itens por vez
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const { activeZone, setActiveZone } = useFocusZone();
  const [focusedCat, setFocusedCat] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const isZoneCat = activeZone === 'content';
  const isZoneList = activeZone === 'list';

  const ITEMS_PER_PAGE = 20;

  const categoriesWithAll = [{ id: null, name: 'TODOS' }, ...vodCategories];

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch =
      movie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || movie.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Filmes a exibir (com limit de displayCount)
  const displayedMovies = filteredMovies.slice(0, displayCount);
  const hasMoreMovies = displayCount < filteredMovies.length;

  const toggleFavorite = (movie: Movie) => {
    if (isFavorite(movie.id)) {
      removeFavorite(movie.id);
    } else {
      addFavorite(movie, 'movie');
    }
  };

  // Hotkeys para navegação
  useRemoteControl({
    onRight: () => {
      if (isZoneCat) {
        setActiveZone('list');
        setFocusedIndex(0);
      }
      if (isZoneList && focusedIndex < displayedMovies.length - 1) {
        setFocusedIndex(focusedIndex + 1);
      }
    },
    onLeft: () => {
      if (isZoneList && focusedIndex > 0) {
        setFocusedIndex(focusedIndex - 1);
      }
    },
    onDown: () => {
      if (isZoneCat && focusedCat < vodCategories.length) {
        setFocusedCat(Math.min(focusedCat + 1, vodCategories.length));
      }
      if (isZoneList && focusedIndex < displayedMovies.length - 1) {
        setFocusedIndex(Math.min(focusedIndex + 5, displayedMovies.length - 1));
      }
    },
    onUp: () => {
      if (isZoneCat && focusedCat > 0) {
        setFocusedCat(Math.max(focusedCat - 1, 0));
      }
      if (isZoneList && focusedIndex > 0) {
        setFocusedIndex(Math.max(focusedIndex - 5, 0));
      }
    },
    onOk: () => {
      if (isZoneCat) {
        setSelectedCategory(categoriesWithAll[focusedCat]?.id || null);
      }
      if (isZoneList && displayedMovies[focusedIndex]) {
        setCurrentMovie(displayedMovies[focusedIndex]);
      }
    },
    onBack: () => {
      if (isZoneList || isZoneCat) {
        setActiveZone('menu'); 
        return;
      }
      if (currentMovie) {
        setCurrentMovie(null);
      }
    },
  });

  // Infinite scroll - detectar quando chegar ao final
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreMovies && !isLoadingMore) {
          setIsLoadingMore(true);
          // Simular delay de carregamento
          setTimeout(() => {
            setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMoreMovies, isLoadingMore]);

  // Resetar displayCount ao mudar filtros
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [searchTerm, selectedCategory]);

  // Auto-scroll quando o foco muda
  useEffect(() => {
    if (isZoneCat && categoriesRef.current) {
      // Scroll para categoria focada
      const focusedElement = categoriesRef.current.querySelector('[data-focused="true"]');
      if (focusedElement instanceof HTMLElement) {
        focusedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [focusedCat, isZoneCat]);

  useEffect(() => {
    if (isZoneList && gridRef.current) {
      // Scroll para o filme focado
      const focusedElement = gridRef.current.querySelector('[data-focused="true"]');
      if (focusedElement instanceof HTMLElement) {
        focusedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [focusedIndex, isZoneList]);

  // Carregar mais filmes quando chegar próximo ao final durante navegação por setas
  useEffect(() => {
    if (isZoneList && focusedIndex >= displayedMovies.length - 1 && hasMoreMovies) {
      setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
    }
  }, [focusedIndex, isZoneList, displayedMovies.length, hasMoreMovies]);

  return currentMovie ? (
    <MovieDetail
      movie={currentMovie}
      onBack={() => setCurrentMovie(null)}
      onToggleFavorite={(mv) => toggleFavorite(mv)}
    />
  ) : (
    <div className="max-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="flex mt-[60px] h-[calc(100vh-60px)]">
        {/* Filters */}
        {vodCategories.length > 0 && (
          <div
            ref={categoriesRef}
            className="w-3/12 max-md:w-4/12 border-b border-gray-800 bg-gray-900/50 sticky top-20 overflow-y-scroll pt-4"
          >
            <div className="px-6 py-4">
              <div className="flex flex-col gap-2 pb-2">
                {categoriesWithAll.map((cat, i) => (
                  <ButtonCategory
                    key={cat.id || 'all'}
                    id={String(cat.id || '-1')}
                    name={cat.name.replace('FILMES |', '')}
                    isSelected={selectedCategory === (cat.id as any)}
                    isFocused={isZoneCat && focusedCat === i}
                    onClick={() => {
                      setSelectedCategory(cat.id as any);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        <div ref={gridRef} className="flex-1 px-6 py-8 overflow-y-scroll">
          <div className="flex-1 mb-5">
            <Input
              type="text"
              placeholder="Buscar filmes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={movies.length === 0}
            />
          </div>
          {filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {displayedMovies.map((movie, i) => {
                return (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onPlay={() => setCurrentMovie(movie)}
                    isFocused={focusedIndex === i}
                  />
                );
              })}

              {/* Sentinel element para infinite scroll */}
              <div ref={loadMoreRef} className="col-span-full py-4">
                {hasMoreMovies && isLoadingMore && (
                  <div className="flex justify-center">
                    <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!hasMoreMovies && displayedMovies.length > 0 && (
                  <p className="text-center text-gray-500 text-sm">Fim da lista</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">Nenhum filme encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};;
