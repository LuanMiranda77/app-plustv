import { Play, X } from 'lucide-react'
import { useWatchHistoryStore, type WatchHistoryItem } from '../../store/watchHistoryStore'

interface ContinueWatchingCardProps {
  item: WatchHistoryItem;
  onPlay?: () => void;
  onRecentlyWatched?: (item: WatchHistoryItem[]) => void;
  isFocused?:boolean;
}

export const ContinueWatchingCard = ({
  item,
  onPlay,
  onRecentlyWatched,
  isFocused
}: ContinueWatchingCardProps) => {
  const { getRecentlyWatched, removeFromHistory } = useWatchHistoryStore();

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromHistory(String(item.id));
    onRecentlyWatched?.(getRecentlyWatched());
  };

  const getDisplayName = () => {
    if (item.type === 'series') {
      return `${item.name} • Contínue assistindo`;
    }
    return item.name;
  };

  const getTimeRemaining = () => {
    const remaining = item.duration - item.watched;
    if (remaining <= 0) return 'Concluído';

    const minutes = Math.round(remaining / 60);
    if (minutes < 60) return `${minutes}m restante`;

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m restante`;
  };

  return (
    <div
      onClick={onPlay}
      className="group relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
    >
      {/* Poster */}
      <div className="aspect-video bg-gray-900 relative">
        <img
          src={item.poster || item.logo || 'https://via.placeholder.com/400x225?text=No+Image'}
          alt={item.name}
          className={`w-full h-full object-cover group-hover:brightness-75 ${isFocused ? 'brightness-75' : ''} transition-brightness`}
        />

        {/* Progress Bar */}
        <div className="absolute bottom-0 w-full h-1 bg-gray-700">
          <div
            className="h-full bg-red-600 transition-all duration-300"
            style={{ width: `${item.progress}%` }}
          />
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 ${isFocused ? 'ring-2 opacity-100' : ''} transition-opacity flex flex-col justify-between p-3`}
      >
        <div className="flex justify-end">
          <button
            onClick={handleRemove}
            className="bg-black/60 hover:bg-black/90 text-white p-1.5 rounded-full transition-colors"
            title="Remove from history"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-white font-semibold text-sm line-clamp-2">{getDisplayName()}</h3>

          <div className="flex items-center justify-between">
            <span className="text-gray-200 text-xs">{getTimeRemaining()}</span>
            <button
              onClick={onPlay}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              Continuar
            </button>
          </div>
        </div>
      </div>

      {/* Type Badge */}
      <div className="absolute top-2 left-2">
        <span className="px-2 py-1 bg-black/60 text-white text-xs font-semibold rounded">
          {item.type === 'movie' ? '🎬 Filme' : item.type === 'series' ? '📺 Série' : '📻 Canal'}
        </span>
      </div>
    </div>
  );
};
