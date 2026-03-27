import { Heart } from 'lucide-react';
import { useFavoritesStore } from '../../store/favoritesStore';
import type { Series } from '../../types';
import StartRating from '../UI/StarRating';
const placehoder = './placeholde.png';

interface SeriesCardProps {
  series: Series;
  onPlay?: () => void;
  isFocused?: boolean;
}

export const SeriesCard = ({ series, onPlay, isFocused }: SeriesCardProps) => {
  const { isFavorite } = useFavoritesStore();
  const isFav = isFavorite(series.id);

  return (
    <button
      data-focused={isFocused ? 'true' : 'false'}
      className={`group relative bg-gray-800 
      rounded-lg overflow-hidden focus:scale-105 hover:scale-105 
      transition-all duration-200 
      ${isFocused ? 'scale-105 outline-red-600 outline-2 shadow-lg shadow-red-600/50' : 'outline-2 outline-transparent'}`}
      onClick={onPlay}
    >
      {/* Poster */}
      <div className="aspect-[2/3] overflow-hidden bg-gray-900">
        <img
          src={series.poster}
          alt={series.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:brightness-75 transition-brightness"
          onError={(e: any) => {
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextElementSibling)
              e.currentTarget.nextElementSibling.style.display = 'flex';
          }}
        />
        <img
          className="
            hidden 
            w-full h-full object-cover group-hover:brightness-75 transition-brightness
          "
          src={placehoder}
        />
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
        <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">{series.name}</h3>
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
