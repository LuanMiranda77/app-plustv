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
    <div className="flex items-center gap-4 mb-4 flex-wrap text-4xl max-md:text-sm">
      {year && <span className="text-zinc-400 ">{year}</span>}
      {rating && <StarRating rating={rating} />}
      {seasonsCount && (
        <span className="text-zinc-400">
          {seasonsCount} temporada{seasonsCount !== 1 ? 's' : ''}
        </span>
      )}
      {total && total > 0 && <span className="text-zinc-400">{total} episódios</span>}
      {percent > 0 && (
        <span
          className={`font-medium ${percent === 100 ? 'text-green-400' : 'text-red-400'}`}
        >
          {percent === 100 ? '✓ Completo' : `${percent.toFixed(2)}% assistido`}
        </span>
      )}
    </div>
  );
}
