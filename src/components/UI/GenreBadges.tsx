type Props = {
  genre: string;
  max?: number;
};

export default function GenreBadges({ genre, max = 3 }: Props) {
  if (!genre) return null;

  return (
    <div className="flex gap-2 mb-3 flex-wrap">
      {genre.replaceAll('&', ',').replaceAll('|', ',').split(',').slice(0, max).map((g) => (
        <span
          key={g}
          className="text-xl max-md:text-xs px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-zinc-300"
        >
          {g.trim()}
        </span>
      ))}
    </div>
  );
}