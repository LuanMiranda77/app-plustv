import { Heart } from 'lucide-react';
import { useFavoritesStore } from '../../store/favoritesStore';
import type { Movie } from '../../types';

interface MovieCardProps {
  movie: Movie;
  onPlay?: () => void;
  onAddFavorite?: (movie: Movie) => void;
}

export const MovieCard = ({ movie, onPlay, onAddFavorite }: MovieCardProps) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const isFav = isFavorite(movie.id);

  const toggleFavorite = () => {
    if (isFav) {
      removeFavorite(movie.id);
    } else {
      addFavorite(movie);
      onAddFavorite?.(movie);
    }
  };

  return (
    <button
      onClick={onPlay}
      className="group relative bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200"
    >
      {/* Poster */}
      <div className="aspect-[2/3] overflow-hidden bg-gray-900">
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.name}
            loading="lazy" // carrega só quando visível
            decoding="async" // não bloqueia render
            className="w-full h-full object-cover group-hover:brightness-75 transition-brightness"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <span className="text-4xl">🎬</span>
          </div>
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
        <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">{movie.name}</h3>

        <div className="flex gap-2">
          <button
            onClick={onPlay}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded text-xs font-semibold transition-colors"
          >
            Assistir
          </button>
          <button
            onClick={toggleFavorite}
            className={`px-3 py-1.5 rounded transition-colors ${
              isFav ? 'bg-red-600 text-white' : 'bg-gray-600/50 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      {/* Badge */}
      {movie.rating && (
        <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1.5 py-1  rounded-bl opacity-80">
          {movie.rating == 'N/A' ? '0.0' : Number(movie.rating).toFixed(1)}
        </div>
      )}
      {/* year lacament */}
      {movie.year && (
        <div className="absolute bottom-0 right-0 bg-red-600 text-white text-xs px-1 py-0.5 rounded-tl opacity-80">
          {movie.year == 'N/A' ? '0000' : movie.year}
        </div>
      )}
    </button>
  );
};
