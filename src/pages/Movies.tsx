/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from 'react';
import { MovieCard } from '../components/Cards/MovieCard';
import { Input } from '../components/UI/Input';
import MovieDetail from '../components/UI/MovieDetail';
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
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();

  const ITEMS_PER_PAGE = 20;

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch =
      movie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || movie.category === selectedCategory;

    if (selectedCategory == null) {
      // const ratringNum = movie.rating && movie.rating != 'N/A' ? Number(movie.rating ?? 0) : 0;
      // return index < 60 && ratringNum > 6;
    }

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

  return currentMovie ? (
    <MovieDetail
      movie={currentMovie}
      onBack={() => setCurrentMovie(null)}
      onToggleFavorite={(mv) => toggleFavorite(mv)}
    />
  ) : (
    <div className="max-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="flex mt-[60px] max-h-[calc(100vh-60px)]">
        {/* Filters */}
        {vodCategories.length > 0 && (
          <div className="w-3/12 max-md:w-4/12 border-b border-gray-800 bg-gray-900/50 sticky top-20 overflow-y-scroll pt-4">
            <div className="px-6 py-4">
              <div className="flex flex-col gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`text-left px-4 py-2 rounded-tl-full rounded-bl-full max-md:text-xs text-lg font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === null
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  TODOS
                </button>
                {vodCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-left px-4 py-2 rounded-tl-full rounded-bl-full max-md:text-xs text-lg font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {cat.name.replace('FILMES |', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="w-9/12 max-md:w-8/12 px-6 py-8 overflow-y-scroll">
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
              {displayedMovies.map((movie) => {
                return (
                  <MovieCard key={movie.id} movie={movie} onPlay={() => setCurrentMovie(movie)} />
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
};
