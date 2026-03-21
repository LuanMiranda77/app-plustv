import { Heart } from 'lucide-react';
import { useFavoritesStore } from '../../store/favoritesStore';
import type { Movie, Series } from '../../types';
import StartRating from '../UI/StarRating';

interface MovieCardProps {
  stream: Movie | Series;
  onPlay?: () => void;
  isFocused?: boolean;
}

export const StreamPoster = ({ stream, onPlay, isFocused }: MovieCardProps) => {
  const { isFavorite } = useFavoritesStore();
  const isFav = isFavorite(stream.id);

  return (
    <button
      data-focused={isFocused ? 'true' : 'false'}
      onClick={onPlay}
      className={`group relative bg-gray-800 rounded-lg overflow-hidden 
      focus:scale-110 hover:scale-110 
      transition-all duration-200 
      ${isFocused ? 'scale-110 border-red-600 border-2' : 'border-2 border-transparent'}`}
    >
      {/* Poster */}
      <div className="aspect-[2/3] overflow-hidden bg-gray-900">
        {stream.poster ? (
          <img
            src={stream.poster}
            alt={stream.name}
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
      <div
        className={`
          absolute inset-0 bg-gradient-to-t 
          from-black/80 via-transparent to-transparent opacity-0 
          group-focus:opacity-100 group-hover:opacity-100 
          transition-opacity flex flex-col justify-end p-3
          ${isFocused ? 'opacity-100' : ''}
        `}
      >
        <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">{stream.name}</h3>

        {/* <div className="flex gap-2">
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
        </div> */}
      </div>

      {/* Badge */}
      {stream.rating && (
        <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1.5 py-0.5  rounded-bl opacity-80">
          <StartRating
            rating={stream.rating == 'N/A' ? '0.0' : Number(stream.rating).toFixed(1)}
            color="white"
          />
        </div>
      )}
      {isFav && (
        <div className="absolute top-0 left-0 text-netflix-red text-ms px-1 py-0.5 rounded-tl opacity-80">
          <Heart className="fill-current" size={18} />
        </div>
      )}
      {/* year lacament */}
      {stream.year && (
        <div className="absolute bottom-0 right-0 bg-red-600 text-white text-xs px-1 py-0.5 rounded-tl opacity-80">
          {stream.year == 'N/A' ? '0000' : stream.year}
        </div>
      )}
    </button>
  );
};
