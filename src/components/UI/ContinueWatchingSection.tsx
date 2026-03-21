import { Clock } from 'lucide-react';
import { ContinueWatchingCard } from '../Cards/ContinueWatchingCard';
import { Carousel } from '../Carousel';

type Props = {
  items: any[];
  focusedItemIndex?: number;
  onPlay: (item: any) => void;
  onViewHistory: () => void;
  onRecentlyWatched: (items: any[]) => void;
};

export default function ContinueWatchingSection({
  items,
  focusedItemIndex = -1,
  onPlay,
  onViewHistory,
  onRecentlyWatched
}: Props) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-800 pb-1">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-red-600" />
          <h2 className="text-2xl font-bold text-white">Continue Assistindo</h2>
        </div>
        <button
          onClick={onViewHistory}
          className="text-red-600 hover:text-red-500 font-semibold text-sm transition-colors flex items-center gap-1"
        >
          Ver histórico <span className="text-lg">→</span>
        </button>
      </div>
      <p className="text-gray-400 text-sm">Onde você parou</p>

      <Carousel>
        {items.map((item, idx) => {
          const isFocused = focusedItemIndex === idx;
          return (
            <div key={item.id} data-focused={isFocused} className="w-80 flex-shrink-0">
              <ContinueWatchingCard
                item={item}
                isFocused={isFocused}
                onPlay={() => onPlay(item)}
                onRecentlyWatched={onRecentlyWatched}
              />
            </div>
          );
        })}
      </Carousel>
    </section>
  );
}
