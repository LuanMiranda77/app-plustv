import { Heart } from 'lucide-react';
import { useFavoritesStore } from '../../store/favoritesStore';
import type { Series } from '../../types';
import StartRating from '../UI/StarRating';

interface SeriesCardProps {
  series: Series;
  onPlay?: () => void;
}

export const SeriesCard = ({ series, onPlay }: SeriesCardProps) => {
  const { isFavorite } = useFavoritesStore();
  const isFav = isFavorite(series.id);

  return (
    <button
      className="group relative bg-gray-800 
      rounded-lg overflow-hidden focus:scale-105 hover:scale-105 
      transition-transform duration-200 
      outline-netflix-red-200 hover:outline-2 focus:outline-2"
      onClick={onPlay}
    >
      {/* Poster */}
      <div className="aspect-[2/3] overflow-hidden bg-gray-900">
        {series.poster ? (
          <img
            src={series.poster}
            alt={series.name}
            // loading="lazy"
            // decoding="async"
            className="w-full h-full object-cover group-hover:brightness-75 transition-brightness"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <span className="text-4xl">📺</span>
          </div>
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-focus:opacity-100 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
        <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">{series.name}</h3>

        <div className="text-gray-300 text-xs mb-2">{series.seasons?.length || 0} temporada(s)</div>

        <div className="flex gap-2">
          {/* <button
            onClick={onPlay}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded text-xs font-semibold transition-colors"
          >
            Assistir
          </button> */}
          {/* <button
            onClick={toggleFavorite}
            className={`px-3 py-1.5 rounded transition-colors ${
              isFav ? 'bg-red-600 text-white' : 'bg-gray-600/50 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Heart className="w-4 h-4 fill-current" />
          </button> */}
        </div>
      </div>

      {/* Badge */}
      {series.rating && (
        <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-0.5 rounded-bl opacity-80">
          <StartRating
            rating={series.rating == 'N/A' ? '0.0' : Number(series.rating).toFixed(1)}
            color="white"
          />
        </div>
      )}
      {/* year lacament */}
      {isFav && (
        <div className="absolute top-0 left-0 text-netflix-red text-ms px-1 py-0.5 rounded-tl opacity-80">
          <Heart className="fill-current" size={18} />
        </div>
      )}
      {/* year lacament */}
      {series.year && (
        <div className="absolute bottom-0 right-0 bg-red-600 text-white text-xs px-1 py-0.5 rounded-tl opacity-80">
          {series.year == 'N/A' ? '0000' : series.year}
        </div>
      )}
    </button>
  );
};
