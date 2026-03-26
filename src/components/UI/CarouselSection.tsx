import { Repeat, Sparkles, TrendingUp } from 'lucide-react';
import { Carousel } from '../Carousel';
import { useMemo } from 'react';
import { storage } from '../../utils/storage';

type Props = {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  items: any[];
  renderItem: (item: any, index: number, isFocused: boolean) => React.ReactNode;
  onViewMore: () => void;
  badge?: 'novo' | 'trending' | 'repeat';
  focusedItemIndex?: number;
};

export default function CarouselSection({
  title,
  subtitle,
  icon: Icon,
  items,
  renderItem,
  onViewMore,
  badge,
  focusedItemIndex = -1
}: Props) {
  const isAdultUnlocked = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return storage.get('adult-unlocked') === true;
  }, []);
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-6 h-6 text-red-600 mt-1" />}
            <h2 className="text-2xl font-bold text-white">{title}</h2>
          </div>
          {badge === 'repeat' && (
            <span className="flex items-center gap-1 px-3 py-1 bg-yellow-600/20 border border-yellow-600/50 rounded-full text-xs text-yellow-400">
              <Repeat className="w-3 h-3" />
              Novamente
            </span>
          )}
          {badge === 'novo' && (
            <span className="flex items-center gap-1 px-3 py-1 bg-green-600/20 border border-green-600/50 rounded-full text-xs text-green-400">
              <Sparkles className="w-3 h-3" />
              Novo
            </span>
          )}
          {badge === 'trending' && (
            <span className="flex items-center gap-1 px-3 py-1 bg-red-600/20 border border-red-600/50 rounded-full text-xs text-red-400">
              <TrendingUp className="w-3 h-3" />
              Tendência
            </span>
          )}
        </div>
        <button
          onClick={onViewMore}
          className="text-red-600 hover:text-red-500 font-semibold text-sm transition-colors flex items-center gap-1"
        >
          Ver mais <span className="text-lg">→</span>
        </button>
      </div>

      {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}

      {items.length > 0 ? (
        <Carousel>
          {items
            .filter(item => {
              if (isAdultUnlocked) return item;
              if (!item.name.toUpperCase().includes('ADULTO')) return item;
            })
            .map((item, idx) => {
              const isFocused = focusedItemIndex === idx;
              return (
                <div
                  key={item.id}
                  data-focused={isFocused}
                  className={`${title == 'Canais ao Vivo' ? 'w-125' : 'w-64'} flex-shrink-0`}
                >
                  {renderItem(item, idx, isFocused)}
                </div>
              );
            })}
        </Carousel>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum conteúdo disponível</p>
        </div>
      )}
    </section>
  );
}
