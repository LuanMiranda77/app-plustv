const logoIcon = './icons.png';

type Props = {
  poster: string;
  name: string;
  progressPercent?: number;
};

export default function Poster({ poster, name, progressPercent = 0 }: Props) {
  const hasProgress = progressPercent > 0;

  return (
    <div className="relative flex-shrink-0 w-[500px] max-md:w-40 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10">
      <img
        src={poster}
        alt={name}
        className="w-full aspect-[2/3] object-cover"
        onError={e => (e.currentTarget.src = logoIcon)}
      />
      {hasProgress && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700/80">
          <div
            className="h-full bg-netflix-red transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}
