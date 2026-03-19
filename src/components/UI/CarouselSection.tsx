import { Sparkles, TrendingUp } from 'lucide-react';
import { Carousel } from '../Carousel';


type Props = {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  items: any[];
  renderItem: (item: any) => React.ReactNode;
  onViewMore: () => void;
  badge?: 'novo' | 'trending';
};

export default function CarouselSection({
  title,
  subtitle,
  icon: Icon,
  items,
  renderItem,
  onViewMore,
  badge,
}: Props) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-6 h-6 text-red-600 mt-1" />}
            <h2 className="text-2xl font-bold text-white">{title}</h2>
          </div>
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
          {items.map((item) => (
            <div key={item.id} className={`${title=="Canais ao Vivo"?"w-96":"w-64"} flex-shrink-0`}>
              {renderItem(item)}
            </div>
          ))}
        </Carousel>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum conteúdo disponível</p>
        </div>
      )}
    </section>
  );
}
