import { LuCircle } from 'react-icons/lu';
import StarRating from './StarRating';

type Props = {
  year?: string;
  rating?: string | number;
  seasonsCount?: number;
  total?: number;
  percent: number;
};

export default function MetaText({ year, rating, seasonsCount, total, percent }: Props) {
  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap text-2xl max-md:text-sm">
      {year && (
        <span className="text-zinc-400 ">Lançado em: {year == 'N/A' ? 'Sem data' : year}</span>
      )}

      {rating && (
        <>
          <LuCircle className="fill-zinc-400 w-2 max-md:w-1.5" />
          <StarRating rating={rating} />
        </>
      )}

      {seasonsCount ? (
        <span className="text-zinc-400 flex items-center gap-2">
          <LuCircle className="fill-zinc-400 w-2 max-md:w-1.5" />
          {seasonsCount} temporada{seasonsCount !== 1 ? 's' : ''}
        </span>
      ) : (
        ''
      )}

      {total && total > 0 ? (
        <span className="text-zinc-400 flex items-center gap-2">
          {' '}
          <LuCircle className="fill-zinc-400 w-2 max-md:w-1.5" />
          {total} episódios
        </span>
      ) : (
        ''
      )}
      {percent > 0 && (
        <div className="flex items-center gap-2">
          <LuCircle className="fill-zinc-400 w-2 max-md:w-1.5" />
          <span className={`font-medium ${percent === 100 ? 'text-green-400' : 'text-red-400'}`}>
            {percent === 100 ? '✓ Completo' : `${percent.toFixed(2)}% assistido`}
          </span>
        </div>
      )}
    </div>
  );
}
